import { GoogleGenAI } from "@google/genai";
import { detectInput } from "./audit-input";
import { formatEvidence, gatherSiteEvidence } from "./audit.server";
import { findRecentAuditByTarget, saveAuditToDb } from "./db.server";

export type GroundingSource = {
  title: string;
  uri: string;
};

export type GroundingInfo = {
  searchQueries: string[];
  sources: GroundingSource[];
  isGrounded: boolean;
};

export type AuditProvenance = {
  scannedAt: string;
  durationMs: number;
  model: string;
  method: "live-http-scan" | "operator-supplied-text";
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
  checks: { label: string; value: string }[];
  sources: string[];
  limitations: string[];
};

export type AuditReport = {
  target: string;
  originCountry: string;
  score: number;
  summary: string;
  inputKind: "url" | "text";
  evidence: string[];
  provenance: AuditProvenance;
  grounding?: GroundingInfo;
  dbRecordId?: string;
  dbSavedAt?: string;
  frameworks: { name: string; score: number; note: string }[];
  criticalLeaks: {
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    detail: string;
  }[];
  fineRisk: { estimate: string; currency: string; rationale: string };
  remediation: { step: string; impact: string; effort: string }[];
};

const SYSTEM_INSTRUCTION = `You are ASJi One, a senior privacy, security and data-protection auditor with deep knowledge of GDPR, the India DPDP Act 2023 (and draft Rules), UK GDPR, ePrivacy/cookie law, CCPA/CPRA, PIPEDA, LGPD, PDPA (SG/TH), POPIA, PIPL and Australian Privacy Act.

You are given either (A) a LIVE SCAN EVIDENCE dossier collected moments ago from a real website, or (B) raw infrastructure/architecture text supplied by an operator.

Rules for rigour:
- Ground every finding in the supplied evidence and real-world facts verified via Google Search when available. When you cite a fact, quote the concrete artefact (exact header name, cookie name, third-party host, missing legal link, or known regulatory record/policy detail).
- NEVER invent evidence. If something is unknown from the dossier, say what it is and mark it as an assumption or an item requiring manual verification.
- Infer the origin country from TLD, HTML lang, hosting/CDN headers, currency/locale hints and content, and state the reasoning briefly.
- Apply GDPR and India DPDP always, plus every additional regime plausibly applicable to the origin country and its likely user base.
- Judge pre-consent cookies, US-bound transfers (Google Fonts/Analytics/Meta), missing CMP, absent privacy policy or grievance officer (DPDP s.13), missing security headers, plaintext HTTP, and personal-data forms without a stated lawful basis as concrete violations with article/section references.
- Fine estimates must be anchored to the real statutory maxima (GDPR up to EUR 20M or 4% global turnover; DPDP up to INR 250 crore per breach type) and scaled to the apparent size of the entity, with the reasoning stated.

Respond with ONLY a JSON object of this exact shape:
{
  "target": string,
  "originCountry": string,
  "score": number (0-100 overall compliance score, harsh and evidence-based),
  "summary": string (3-4 sentences citing the strongest concrete findings),
  "evidence": string[] (5-10 verbatim factual observations taken from the dossier that drove the score),
  "frameworks": [{ "name": string, "score": number, "note": string (cite the article/section and the observed artefact) }],
  "criticalLeaks": [{ "title": string, "severity": "low"|"medium"|"high"|"critical", "detail": string (what was observed, which law it breaches, and the concrete exposure) }],
  "fineRisk": { "estimate": string, "currency": string, "rationale": string },
  "remediation": [{ "step": string, "impact": string, "effort": string }]
}
Provide 4-7 frameworks, 4-8 criticalLeaks and 5-8 remediation steps. No markdown, no code fences.`;

function extractJson(text: string): AuditReport {
  const cleaned = text
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(cleaned.slice(start, end + 1)) as AuditReport;
}

const LAW_SOURCES = [
  "Regulation (EU) 2016/679 (GDPR) — Arts. 5, 6, 13, 32, 44",
  "Digital Personal Data Protection Act, 2023 (India) — ss. 4-8, 13",
  "ePrivacy Directive 2002/58/EC Art. 5(3) & EDPB cookie guidance",
  "CCPA/CPRA, UK GDPR, LGPD, PIPEDA, PDPA, POPIA, PIPL statutory maxima",
  "OWASP Secure Headers Project & Mozilla Observatory header baselines",
];

export async function runAuditPipeline(
  rawInput: string,
  scanMode: "deep-grounded" | "fast-lite" = "deep-grounded",
  bypassCache = false,
): Promise<AuditReport> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const lovableKey = process.env.LOVABLE_API_KEY;

  if (!geminiKey && !lovableKey) {
    throw new Error("AI is not configured. Set GEMINI_API_KEY in environment variables.");
  }

  // Target Caching for score stability & consistency (keeps audit results 100% stable for same domain)
  if (!bypassCache) {
    try {
      const cached = await findRecentAuditByTarget(rawInput, 0);
      if (cached) {
        return {
          ...cached,
          provenance: {
            ...cached.provenance,
            scannedAt: cached.provenance?.scannedAt || new Date().toISOString(),
          },
        };
      }
    } catch {
      // ignore cache lookup errors and proceed
    }
  }

  const startedAt = Date.now();
  const detected = detectInput(rawInput);

  let userContent: string;
  let targetLabel: string;
  let checks: { label: string; value: string }[] = [];
  let sources: string[] = [...LAW_SOURCES];
  let limitations: string[] = [];
  let confidence: AuditProvenance["confidence"] = "medium";
  let confidenceReason = "";

  if (detected.kind === "url") {
    const evidence = await gatherSiteEvidence(detected.url!);
    targetLabel = evidence.host;
    const missingHeaders = Object.values(evidence.securityHeaders).filter((v) => v === null).length;
    checks = [
      { label: "HTTP status", value: `${evidence.statusCode} · ${evidence.redirectChainNote}` },
      { label: "Transport", value: evidence.httpsUpgrade ? "HTTPS enforced" : "Plaintext HTTP" },
      {
        label: "Security headers",
        value: `${Object.keys(evidence.securityHeaders).length - missingHeaders}/${Object.keys(evidence.securityHeaders).length} present`,
      },
      { label: "Pre-consent cookies", value: `${evidence.setCookiePreConsent.length} observed` },
      { label: "Tracker SDKs", value: `${evidence.trackerSignals.length} matched` },
      { label: "Third-party hosts", value: `${evidence.thirdPartyHosts.length} referenced` },
      {
        label: "Consent/CMP signals",
        value: evidence.consentSignals.length
          ? evidence.consentSignals.join(", ")
          : "none detected",
      },
      {
        label: "Personal-data fields",
        value: `${evidence.formsCollectingData.length} on landing page`,
      },
      { label: "Privacy/legal links", value: `${evidence.policyLinks.length} found` },
      {
        label: "robots.txt / security.txt",
        value: `${evidence.robotsTxt ? "present" : "absent"} / ${evidence.securityTxt ? "present" : "absent"}`,
      },
    ];
    sources = [
      `Live HTTP fetch of ${evidence.finalUrl} and its /.well-known endpoints`,
      ...sources,
    ];
    limitations = [
      "Only the landing page and well-known endpoints are fetched — authenticated areas and post-consent scripts are not executed.",
      "JavaScript is not run, so cookies written client-side after page load are not observed.",
      "Fine estimates are statutory-maxima modelling, not legal advice or a regulator's assessment.",
    ];
    if (evidence.fetchErrors.length) limitations.push(...evidence.fetchErrors);
    confidence = evidence.statusCode < 400 ? "high" : "medium";
    confidenceReason =
      evidence.statusCode < 400
        ? "Findings are derived from a successful live fetch of the target and its response headers, cookies and HTML."
        : `The target answered HTTP ${evidence.statusCode}, so parts of the assessment rely on partial evidence.`;
    userContent = `INPUT TYPE: website URL (live scanned)\nTARGET: ${evidence.finalUrl}\n\n${formatEvidence(
      evidence,
    )}\n\nProduce the deepest, most specific compliance audit you can from this real evidence. Verify company background and recent data privacy context via Google Search if relevant. Return json.`;
  } else {
    targetLabel = rawInput.slice(0, 60);
    checks = [
      { label: "Input mode", value: "Operator-supplied infrastructure description" },
      { label: "Characters analysed", value: `${rawInput.trim().length}` },
      { label: "Live network probe", value: "not performed" },
    ];
    sources = ["Operator-supplied infrastructure description (unverified)", ...sources];
    limitations = [
      "No live scan was possible — every finding depends on the accuracy of the text you supplied.",
      "Claims in the description were not independently verified against the running system.",
      "Fine estimates are statutory-maxima modelling, not legal advice.",
    ];
    confidence = "medium";
    confidenceReason =
      "The audit is based on your written description rather than observed traffic, so findings should be confirmed against production.";
    userContent = `INPUT TYPE: raw infrastructure / architecture description (no live scan possible)\n\n${rawInput}\n\nAudit this described stack against the applicable regimes, flag what must be verified manually, and return json.`;
  }

  let reportContent = "";
  let modelUsed =
    scanMode === "fast-lite"
      ? "ASJi High-Speed Inspection Engine"
      : "ASJi Autonomous Audit Engine v4.2";
  let groundingInfo: GroundingInfo | undefined;

  if (geminiKey) {
    const ai = new GoogleGenAI({
      apiKey: geminiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    if (scanMode === "deep-grounded") {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.6-flash",
          contents: userContent,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            temperature: 0.0,
          },
        });
        reportContent = response.text ?? "";
        modelUsed = "ASJi Autonomous Audit Engine v4.2 (Grounded Precedent)";

        // Extract grounding chunks and web search queries
        const candidate = response.candidates?.[0];
        const metadata = candidate?.groundingMetadata;
        if (metadata) {
          const queries = metadata.webSearchQueries || [];
          const chunks = metadata.groundingChunks || [];
          const sourcesList: GroundingSource[] = [];

          for (const chunk of chunks) {
            if (chunk.web?.uri && chunk.web?.title) {
              sourcesList.push({
                title: chunk.web.title,
                uri: chunk.web.uri,
              });
            }
          }

          if (queries.length > 0 || sourcesList.length > 0) {
            groundingInfo = {
              searchQueries: queries,
              sources: sourcesList,
              isGrounded: true,
            };
          }
        }
      } catch (err: unknown) {
        const errString = String(err);
        const isQuotaErr = errString.includes("429") || errString.includes("RESOURCE_EXHAUSTED");
        console.warn(
          `Grounded search unavailable (${isQuotaErr ? "Quota limit" : "Fallback"}), attempting standard model...`,
        );

        try {
          const fallbackRes = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: userContent,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              responseMimeType: "application/json",
              temperature: 0.0,
            },
          });
          reportContent = fallbackRes.text ?? "";
          modelUsed = "gemini-3.6-flash (Standard)";
        } catch (fallbackErr: unknown) {
          const fallbackErrStr = String(fallbackErr);
          if (fallbackErrStr.includes("429") || fallbackErrStr.includes("RESOURCE_EXHAUSTED")) {
            // Attempt secondary lite model fallback
            try {
              const liteRes = await ai.models.generateContent({
                model: "gemini-3.1-flash-lite",
                contents: userContent,
                config: {
                  systemInstruction: SYSTEM_INSTRUCTION,
                  responseMimeType: "application/json",
                  temperature: 0.0,
                },
              });
              reportContent = liteRes.text ?? "";
              modelUsed = "gemini-3.1-flash-lite (Fast Mode Fallback)";
            } catch {
              throw new Error(
                "API rate limit reached. Please wait a moment before initiating another audit scan.",
              );
            }
          } else {
            throw fallbackErr;
          }
        }
      }
    } else {
      // Fast Lite mode
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: userContent,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: "application/json",
            temperature: 0.0,
          },
        });
        reportContent = response.text ?? "";
        modelUsed = "gemini-3.1-flash-lite (Low-Latency Fast Analysis)";
      } catch (err: unknown) {
        const errStr = String(err);
        if (errStr.includes("429") || errStr.includes("RESOURCE_EXHAUSTED")) {
          throw new Error(
            "API rate limit reached. Please wait a moment before initiating another audit scan.",
          );
        }
        throw err;
      }
    }
  } else if (lovableKey) {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${lovableKey}` },
      body: JSON.stringify({
        model: "google/gemini-3.6-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_INSTRUCTION },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (response.status === 429) throw new Error("Rate limit reached. Please try again shortly.");
    if (response.status === 402)
      throw new Error("AI credits exhausted. Please add credits to continue.");
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`AI request failed [${response.status}]: ${body.slice(0, 400)}`);
    }

    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    reportContent = payload.choices?.[0]?.message?.content ?? "";
  }

  const report = extractJson(reportContent);

  const finalReport: AuditReport = {
    ...report,
    inputKind: detected.kind,
    evidence: Array.isArray(report.evidence) ? report.evidence : [],
    target: targetLabel || report.target || rawInput,
    score: Math.max(0, Math.min(100, Math.round(report.score))),
    grounding: groundingInfo,
    provenance: {
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      model: modelUsed,
      method: detected.kind === "url" ? "live-http-scan" : "operator-supplied-text",
      confidence,
      confidenceReason,
      checks,
      sources,
      limitations,
    },
  };

  // Save automatically to backend database until user purges
  try {
    const saved = await saveAuditToDb(finalReport, rawInput);
    finalReport.dbRecordId = saved.id;
    finalReport.dbSavedAt = saved.savedAt;
  } catch (dbErr) {
    console.error("Backend database save warning:", dbErr);
  }

  return finalReport;
}
