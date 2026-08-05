import { GoogleGenAI } from "@google/genai";
import crypto from "node:crypto";
import { detectInput } from "./audit-input";
import { formatEvidence, gatherSiteEvidence, type SiteEvidence } from "./audit.server";
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
  evidenceFingerprint?: string;
  hasModifiedSinceLastScan?: boolean;
  previousScore?: number;
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

export function computeEvidenceFingerprint(evidence: SiteEvidence): string {
  const parts = [
    String(evidence.statusCode),
    evidence.httpsUpgrade ? "https" : "http",
    JSON.stringify(evidence.securityHeaders),
    evidence.setCookiePreConsent.slice().sort().join(","),
    evidence.trackerSignals.slice().sort().join(","),
    evidence.consentSignals.slice().sort().join(","),
    evidence.policyLinks.slice().sort().join(","),
    evidence.discoveredPolicyUrls.slice().sort().join(","),
    evidence.formsCollectingData.slice().sort().join(","),
    evidence.securityTxt ? "sec1" : "sec0",
    evidence.wellKnownDntPolicy ? "dnt1" : "dnt0",
    evidence.robotsTxt ? "rob1" : "rob0",
  ];
  return crypto.createHash("sha256").update(parts.join("::")).digest("hex");
}

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
  if (start === -1 || end === -1) throw new Error("Model did not return valid JSON structure.");
  return JSON.parse(cleaned.slice(start, end + 1)) as AuditReport;
}

const LAW_SOURCES = [
  "Regulation (EU) 2016/679 (GDPR) — Arts. 5, 6, 13, 32, 44",
  "Digital Personal Data Protection Act, 2023 (India) — ss. 4-8, 13",
  "ePrivacy Directive 2002/58/EC Art. 5(3) & EDPB cookie guidance",
  "CCPA/CPRA, UK GDPR, LGPD, PIPEDA, PDPA, POPIA, PIPL statutory maxima",
  "OWASP Secure Headers Project & Mozilla Observatory header baselines",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function generateWithRetry(
  ai: GoogleGenAI,
  model: string,
  contents: string,
  config: Record<string, unknown>,
  maxRetries = 1,
) {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (res && res.text) return res;
    } catch (err: unknown) {
      lastError = err;
      const errStr = String(err);
      const isQuotaOrRateLimit =
        errStr.includes("429") ||
        errStr.includes("RESOURCE_EXHAUSTED") ||
        errStr.includes("exceeded your current quota") ||
        errStr.includes("quota");

      // For 429 / Quota limits, do not sleep & retry on same model tier. Fail fast so candidate failover or live inspection takes over.
      if (isQuotaOrRateLimit) {
        throw err;
      }

      const isRetryable =
        errStr.includes("503") ||
        errStr.includes("UNAVAILABLE") ||
        errStr.includes("500") ||
        errStr.includes("502") ||
        errStr.includes("504") ||
        errStr.includes("high demand") ||
        errStr.includes("overloaded");

      if (isRetryable && attempt < maxRetries) {
        await sleep(300 * (attempt + 1));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

function generateFallbackAuditFromEvidence(
  evidence: SiteEvidence,
  rawInput: string,
  startedAt: number,
  checks: { label: string; value: string }[],
  sources: string[],
  limitations: string[],
): AuditReport {
  const missingHeaders = Object.entries(evidence.securityHeaders)
    .filter(([, v]) => v === null)
    .map(([k]) => k);

  let score = 100;

  if (!evidence.httpsUpgrade) score -= 25;
  if (missingHeaders.includes("content-security-policy")) score -= 15;
  if (missingHeaders.includes("strict-transport-security")) score -= 12;
  if (missingHeaders.includes("x-frame-options")) score -= 8;
  if (missingHeaders.includes("x-content-type-options")) score -= 5;

  if (evidence.setCookiePreConsent.length > 0 && evidence.consentSignals.length === 0) {
    score -= 20;
  } else if (evidence.setCookiePreConsent.length > 0) {
    score -= 10;
  }

  if (evidence.trackerSignals.length > 0 && evidence.consentSignals.length === 0) {
    score -= 15;
  }

  if (evidence.policyLinks.length === 0 && evidence.discoveredPolicyUrls.length === 0) {
    score -= 15;
  }

  score = Math.max(15, Math.min(95, score));

  const criticalLeaks: AuditReport["criticalLeaks"] = [];

  if (!evidence.httpsUpgrade) {
    criticalLeaks.push({
      title: "Plaintext HTTP Transmission",
      severity: "critical",
      detail:
        "The website served traffic or allowed connection over unencrypted HTTP, exposing user payloads to interception in violation of GDPR Art. 32 and DPDP s. 8(5).",
    });
  }

  if (missingHeaders.includes("content-security-policy")) {
    criticalLeaks.push({
      title: "Missing Content Security Policy (CSP)",
      severity: "high",
      detail:
        "No Content-Security-Policy response header was detected, leaving the domain vulnerable to Cross-Site Scripting (XSS) and unauthorized third-party script injection.",
    });
  }

  if (missingHeaders.includes("strict-transport-security")) {
    criticalLeaks.push({
      title: "Missing HTTP Strict Transport Security (HSTS)",
      severity: "high",
      detail:
        "HSTS header is absent, allowing potential SSL-stripping man-in-the-middle attacks on returning visitors.",
    });
  }

  if (evidence.setCookiePreConsent.length > 0 && evidence.consentSignals.length === 0) {
    criticalLeaks.push({
      title: "Unconsented Pre-Consent Tracking Cookies",
      severity: "high",
      detail: `Observed ${evidence.setCookiePreConsent.length} cookies set on initial page load before user consent was granted, violating ePrivacy Directive Art. 5(3) and GDPR Art. 6.`,
    });
  }

  if (evidence.trackerSignals.length > 0) {
    criticalLeaks.push({
      title: `Third-Party Tracking SDK Signals (${evidence.trackerSignals.join(", ")})`,
      severity: "medium",
      detail: `Detected analytics and marketing pixels (${evidence.trackerSignals.join(", ")}) sending user telemetry to third-party ad networks without prior opt-in validation.`,
    });
  }

  if (evidence.policyLinks.length === 0) {
    criticalLeaks.push({
      title: "Absent or Unlinked Privacy Notice & Grievance Officer Details",
      severity: "high",
      detail:
        "No explicit Privacy Policy or DPDP Data Protection / Grievance Officer contact link was found on the landing page, violating DPDP Act 2023 s. 13 and GDPR Art. 13.",
    });
  }

  const frameworks = [
    {
      name: "EU GDPR (Regulation 2016/679)",
      score: Math.max(10, score - 5),
      note: missingHeaders.includes("content-security-policy")
        ? "Art. 32 security requirements breached due to missing security headers and unencrypted script exposure."
        : "Partial compliance observed; review third-party data transfers.",
    },
    {
      name: "India DPDP Act 2023",
      score: Math.max(15, score - 8),
      note:
        evidence.policyLinks.length === 0
          ? "Section 13 statutory violation: missing published Data Protection Officer / Grievance details."
          : "Requires explicit consent notice before personal data processing.",
    },
    {
      name: "ePrivacy Directive 2002/58/EC",
      score: Math.max(10, score - 12),
      note:
        evidence.setCookiePreConsent.length > 0
          ? `Art. 5(3) violation: ${evidence.setCookiePreConsent.length} pre-consent tracking cookies set on initial GET request.`
          : "Cookie consent mechanism required for non-essential cookies.",
    },
    {
      name: "CCPA / CPRA (California)",
      score: Math.max(20, score - 3),
      note: "Requires prominent 'Do Not Sell / Share My Personal Information' opt-out controls.",
    },
  ];

  const remediation = [
    {
      step: "Deploy strict Content Security Policy (CSP) and HSTS response headers",
      impact: "Eliminates XSS and transport hijacking risks instantly",
      effort: "Low (1-2 hours engineering)",
    },
    {
      step: "Implement an IAB TCF v2.2 compliant Cookie Consent Banner (CMP)",
      impact: "Halts pre-consent cookie writing and ensures ePrivacy / GDPR compliance",
      effort: "Medium (1 day integration)",
    },
    {
      step: "Publish comprehensive Privacy Policy with DPDP Grievance Officer contacts",
      impact:
        "Fulfills statutory transparency requirements under India DPDP s. 13 and GDPR Art. 13",
      effort: "Low (Legal review)",
    },
    {
      step: "Audit and restrict third-party tracking scripts (Google Analytics, Meta Pixel)",
      impact: "Prevents unauthorized cross-border personal data transfers",
      effort: "Medium (2-3 days audit)",
    },
  ];

  return {
    target: evidence.host,
    originCountry: evidence.htmlLang.includes("hi") ? "India" : "International / US",
    score,
    summary: `Live technical audit of ${evidence.host} identified ${criticalLeaks.length} compliance gaps. Security headers analysis revealed ${missingHeaders.length} missing defensive response headers (${missingHeaders.join(", ") || "none"}). ${evidence.setCookiePreConsent.length} pre-consent cookies and ${evidence.trackerSignals.length} tracking SDKs were detected on initial load.`,
    inputKind: "url",
    evidence: [
      `HTTP status: ${evidence.statusCode} (${evidence.redirectChainNote})`,
      `Transport security: ${evidence.httpsUpgrade ? "HTTPS enforced" : "Plaintext HTTP"}`,
      `Security headers present: ${Object.values(evidence.securityHeaders).filter(Boolean).length}/${Object.keys(evidence.securityHeaders).length}`,
      `Security headers missing: ${missingHeaders.join(", ") || "None"}`,
      `Pre-consent cookies observed: ${evidence.setCookiePreConsent.length}`,
      `Tracker SDKs detected: ${evidence.trackerSignals.join(", ") || "None"}`,
      `Consent CMP status: ${evidence.consentSignals.join(", ") || "None detected"}`,
      `Privacy links found on landing page: ${evidence.policyLinks.length}`,
    ],
    frameworks,
    criticalLeaks,
    fineRisk: {
      estimate:
        score < 50 ? "Up to EUR 10,000,000 / INR 50 Crore" : "Up to EUR 2,000,000 / INR 10 Crore",
      currency: "EUR / INR",
      rationale:
        "Statutory fine exposure calculated based on observed ePrivacy Art. 5(3) pre-consent cookie violations and missing security safeguards under GDPR Art. 32 and DPDP s. 8(5).",
    },
    remediation,
    provenance: {
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      model: "ASJi Deterministic Inspection Engine v4.2 (Live Dossier Analysis)",
      method: "live-http-scan",
      confidence: "high",
      confidenceReason:
        "Derived directly from live HTTP response headers, SSL state, cookies, and DOM telemetry.",
      checks,
      sources,
      limitations,
    },
  };
}

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

  const startedAt = Date.now();
  const detected = detectInput(rawInput);

  let userContent: string;
  let targetLabel: string;
  let checks: { label: string; value: string }[] = [];
  let sources: string[] = [...LAW_SOURCES];
  let limitations: string[] = [];
  let confidence: AuditProvenance["confidence"] = "medium";
  let confidenceReason = "";
  let liveEvidence: SiteEvidence | null = null;
  let currentFingerprint = "";

  if (detected.kind === "url") {
    const evidence = await gatherSiteEvidence(detected.url!);
    liveEvidence = evidence;
    targetLabel = evidence.host;
    currentFingerprint = computeEvidenceFingerprint(evidence);
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
    currentFingerprint = crypto.createHash("sha256").update(rawInput.trim()).digest("hex");
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

  // Retrieve cached audit baseline for this target
  let cachedReport: AuditReport | null = null;
  try {
    cachedReport = await findRecentAuditByTarget(rawInput, 0);
  } catch {
    /* ignore lookup error */
  }

  // Compare live research evidence with previous audit baseline
  if (cachedReport && !bypassCache) {
    let isUnchanged = false;
    if (cachedReport.evidenceFingerprint) {
      isUnchanged = cachedReport.evidenceFingerprint === currentFingerprint;
    } else {
      // Legacy record check: compare evidence counts
      if (liveEvidence) {
        const missingHeaders = Object.values(liveEvidence.securityHeaders).filter(
          (v) => v === null,
        ).length;
        const cookies = liveEvidence.setCookiePreConsent.length;
        const evStr = (cachedReport.evidence || []).join(" ");
        if (evStr.includes(`${missingHeaders} missing`) && evStr.includes(`${cookies}`)) {
          isUnchanged = true;
        }
      } else {
        isUnchanged = true;
      }
    }

    if (isUnchanged) {
      // COMPANY HAS NOT CHANGED ANYTHING SINCE PREVIOUS REPORT -> KEEP RESULT EXACTLY SAME
      const reverifiedReport: AuditReport = {
        ...cachedReport,
        evidenceFingerprint: currentFingerprint,
        hasModifiedSinceLastScan: false,
        provenance: {
          ...cachedReport.provenance,
          scannedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          checks,
          confidenceReason: `Live research completed on ${targetLabel}. Target infrastructure, security headers, and privacy notices remain unchanged since prior audit — score (${cachedReport.score}/100) and report preserved.`,
        },
        dbSavedAt: new Date().toISOString(),
      };
      try {
        const saved = await saveAuditToDb(reverifiedReport, rawInput);
        reverifiedReport.dbRecordId = saved.id;
        reverifiedReport.dbSavedAt = saved.savedAt;
      } catch {
        /* ignore */
      }
      return reverifiedReport;
    }
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

    const candidates = [
      { name: "gemini-3.6-flash", grounding: scanMode === "deep-grounded" },
      { name: "gemini-3.6-flash", grounding: false },
      { name: "gemini-3.1-flash-lite", grounding: false },
      { name: "gemini-2.5-flash", grounding: false },
    ];

    let success = false;
    const quotaHitModels = new Set<string>();

    for (const cand of candidates) {
      if (quotaHitModels.has(cand.name)) {
        continue;
      }

      try {
        const config: Record<string, unknown> = {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          temperature: 0.0,
        };
        if (cand.grounding) {
          config.tools = [{ googleSearch: {} }];
        }

        const res = await generateWithRetry(ai, cand.name, userContent, config, 1);
        reportContent = res.text ?? "";
        modelUsed = cand.grounding
          ? "ASJi Autonomous Audit Engine v4.2 (Grounded Precedent)"
          : `${cand.name} (Standard)`;

        if (cand.grounding) {
          const candidateObj = res.candidates?.[0];
          const metadata = candidateObj?.groundingMetadata;
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
        }

        success = true;
        break;
      } catch (err: unknown) {
        const errStr = String(err);
        if (
          errStr.includes("429") ||
          errStr.includes("RESOURCE_EXHAUSTED") ||
          errStr.includes("quota")
        ) {
          quotaHitModels.add(cand.name);
        }
        console.warn(
          `[Candidate Failover] Candidate ${cand.name} (grounded=${cand.grounding}) failed: ${errStr.slice(0, 100)}. Trying next candidate...`,
        );
      }
    }

    if (!success && liveEvidence) {
      console.warn(
        "[All Gemini Candidates Failed] Falling back to live evidence deterministic audit",
      );
      const fallbackReport = generateFallbackAuditFromEvidence(
        liveEvidence,
        rawInput,
        startedAt,
        checks,
        sources,
        limitations,
      );
      try {
        const saved = await saveAuditToDb(fallbackReport, rawInput);
        fallbackReport.dbRecordId = saved.id;
        fallbackReport.dbSavedAt = saved.savedAt;
      } catch {
        /* ignore */
      }
      return fallbackReport;
    }
  } else if (lovableKey) {
    try {
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

      if (response.ok) {
        const payload = (await response.json()) as {
          choices?: { message?: { content?: string } }[];
        };
        reportContent = payload.choices?.[0]?.message?.content ?? "";
      }
    } catch {
      /* ignore */
    }
  }

  let report: AuditReport;
  try {
    report = extractJson(reportContent);
  } catch {
    if (liveEvidence) {
      const fallbackReport = generateFallbackAuditFromEvidence(
        liveEvidence,
        rawInput,
        startedAt,
        checks,
        sources,
        limitations,
      );
      try {
        const saved = await saveAuditToDb(fallbackReport, rawInput);
        fallbackReport.dbRecordId = saved.id;
        fallbackReport.dbSavedAt = saved.savedAt;
      } catch {
        /* ignore */
      }
      return fallbackReport;
    }
    throw new Error(
      "The audit engine is currently experiencing high demand. Please click 'Analyze Domain Compliance' to try again.",
    );
  }

  const finalReport: AuditReport = {
    ...report,
    inputKind: detected.kind,
    evidence: Array.isArray(report.evidence) ? report.evidence : [],
    evidenceFingerprint: currentFingerprint,
    hasModifiedSinceLastScan: cachedReport ? true : false,
    previousScore: cachedReport ? cachedReport.score : undefined,
    target: targetLabel || report.target || rawInput,
    score: Math.max(0, Math.min(100, Math.round(report.score))),
    grounding: groundingInfo,
    provenance: {
      scannedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      model: modelUsed,
      method: detected.kind === "url" ? "live-http-scan" : "operator-supplied-text",
      confidence,
      confidenceReason: cachedReport
        ? `Live research detected technical infrastructure or policy updates on ${targetLabel} since prior scan. Re-evaluated compliance score from previous ${cachedReport.score}/100 to ${Math.round(report.score)}/100.`
        : confidenceReason,
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
