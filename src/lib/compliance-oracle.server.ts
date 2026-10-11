import { GoogleGenAI } from "@google/genai";
import { WORLD_LAWS_DATA } from "./world-laws-data";

let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

export interface ChatAnswerResponse {
  answer: string;
  sources: {
    law: string;
    article: string;
    authority: string;
    uri?: string;
  }[];
  groundedQueries?: string[];
  verifiedOnlineSources?: { title: string; uri: string }[];
  suggestedFollowUps: string[];
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = "Operation timed out",
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(errorMessage)), timeoutMs)),
  ]);
}

export async function askComplianceOracle(
  question: string,
  history: { role: "user" | "model"; parts: string[] }[] = [],
): Promise<ChatAnswerResponse> {
  const ai = getGenAI();

  // Knowledge base summary of all world laws
  const lawContextSummary = WORLD_LAWS_DATA.map(
    (law) =>
      `[${law.country.toUpperCase()} - ${law.acronym}]
Law Name: ${law.lawName}
Governing Body: ${law.governingBody}
Max Penalties: ${law.maxPenalty}
Breach Notification Window: ${law.breachNotificationHours} hours/rule
Children Age Threshold: ${law.childrenAgeThreshold}
Official Portal / Gazette: ${law.officialPortal} ${law.officialGazetteUrl ? `| ${law.officialGazetteUrl}` : ""}
Key Articles: ${law.keyArticles.map((a) => `${a.number} (${a.topic}): ${a.mandate}`).join("; ")}
Core Mandates: ${law.corePrinciples.join("; ")}`,
  ).join("\n\n");

  const systemInstruction = `You are ASJi Sovereign AI Oracle, an advanced legal compliance intelligence system and sovereign data protection authority advisor.
You serve as a rigorous, evidence-grounded compliance counselor for the ASJi One enterprise law-tech platform.

YOU POSSESS THE COMPLETE WORLD DATABASE OF DATA PROTECTION LAWS:
${lawContextSummary}

CORE OPERATING DIRECTIVES (PRECISION ACCURACY & VERIFICATION STANDARD):
1. ACCURACY & ZERO HALLUCINATION: Never invent statutory sections or penalty caps. When citing law, cite verified statutory codes, official gazettes, or supervisory decisions (e.g. DPBI India, EDPB, CNIL, ICO, CPPA, ANPD, PDPC, OAIC, PPC, PIPC, SDAIA, NDPC, FDPIC, OPC).
2. USE GOOGLE SEARCH GROUNDING: Use live Google Search data to verify recent enforcement actions, official gazettes, and statutory regulatory interpretations before responding.
3. EXPLAINING ASJI ONE:
   - ASJi One performs real-world, passive zero-touch statutory auditing of any domain or raw server code/headers.
   - It checks tracker telemetry, pre-consent cookies (ePrivacy / DPDP / GDPR), TLS/HSTS ciphers, CSP headers, DPO designations, cross-border data transfer adequacy, child data profiling, and generates verifiable PDF/JSON compliance certificates.
   - Features include the 14 World Sovereign Database, the Sovereign Legal Matrix with downloadable legal drafting templates (India DPDP Section 5/6, UAE PDPL, EU GDPR DPA Art 28, CPRA DNSMPI, Singapore PDPA, Brazil LGPD, Swiss FADP), and live audit history.
4. STRUCTURE:
   - Provide crisp, direct, executive-ready answers.
   - Use bold statutory citations and verifiable dates/penalties.
   - Highlight actionable compliance steps or technical remedies (e.g., CMP banner flags, TLS 1.3 configs, Sec-GPC header listeners, Grievance Officer email publication).
5. MULTI-JURISDICTION COMPARISONS: If asked about cross-border differences, provide side-by-side contrast of fines, breach reporting deadlines, and consent thresholds.`;

  if (!ai) {
    // Intelligent deterministic response engine if GEMINI_API_KEY is not configured
    const qLower = question.toLowerCase();
    let relevantLaw = WORLD_LAWS_DATA.find(
      (l) =>
        qLower.includes(l.country.toLowerCase()) ||
        qLower.includes(l.acronym.toLowerCase()) ||
        qLower.includes(l.countryCode.toLowerCase()),
    );

    if (!relevantLaw) {
      relevantLaw = WORLD_LAWS_DATA[0]; // Default India DPDP
    }

    return {
      answer: `### Sovereign Compliance Intelligence Report\n\n**Framework:** ${relevantLaw.lawName} (${relevantLaw.acronym})\n**Maximum Statutory Penalty:** ${relevantLaw.maxPenalty}\n\n#### Key Legal Mandates:\n${relevantLaw.keyArticles.map((a) => `- **${a.number} (${a.topic})**: ${a.mandate}`).join("\n")}\n\n#### Enforcement Directives:\n- **Breach Notification:** Mandatory notification within **${relevantLaw.breachNotificationHours}**.\n- **Child Data Age Limit:** Protected up to **${relevantLaw.childrenAgeThreshold} years**.\n- **Official Gazette & Authority:** ${relevantLaw.officialPortal}\n- **ASJi One Verification:** You can scan your application against this regime using the audit terminal on the home dashboard or download customized statutory drafting templates in the Sovereign Legal Matrix.`,
      sources: relevantLaw.keyArticles.slice(0, 3).map((a) => ({
        law: relevantLaw!.acronym,
        article: a.number,
        authority: relevantLaw!.lawName,
        uri: relevantLaw!.officialPortal,
      })),
      suggestedFollowUps: [
        `What are the penalty ceilings under ${relevantLaw.acronym}?`,
        `How do I comply with ${relevantLaw.acronym} breach notification?`,
        `Compare ${relevantLaw.acronym} vs EU GDPR requirements`,
      ],
    };
  }

  try {
    // Priority: gemini-3.5-flash with Google Search Grounding as mandated
    const candidateModels = [
      { name: "gemini-3.5-flash", grounding: true, timeoutMs: 14000 },
      { name: "gemini-3.8-flash", grounding: true, timeoutMs: 12000 },
      { name: "gemini-3.5-flash", grounding: false, timeoutMs: 9000 },
      { name: "gemini-3.1-flash-lite", grounding: false, timeoutMs: 7000 },
    ];
    let text = "";
    let lastError: unknown;
    const verifiedOnlineSources: { title: string; uri: string }[] = [];
    const groundedQueries: string[] = [];

    for (const cand of candidateModels) {
      try {
        const config: Record<string, unknown> = {
          systemInstruction,
          temperature: 0.1, // Near zero temperature for strict legal fidelity
        };

        if (cand.grounding) {
          config.tools = [{ googleSearch: {} }];
        }

        const response = await withTimeout(
          ai.models.generateContent({
            model: cand.name,
            contents: [
              ...history.map((h) => ({
                role: h.role === "user" ? "user" : "model",
                parts: [{ text: h.parts.join(" ") }],
              })),
              { role: "user", parts: [{ text: question }] },
            ],
            config,
          }),
          cand.timeoutMs,
          `Model ${cand.name} timed out after ${(cand.timeoutMs / 1000).toFixed(1)}s`,
        );

        if (response && response.text) {
          text = response.text;

          // Extract verified Google Search Grounding citations
          const candidate = response.candidates?.[0];
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const grounding = (candidate as any)?.groundingMetadata;
          if (grounding) {
            if (Array.isArray(grounding.webSearchQueries)) {
              groundedQueries.push(...grounding.webSearchQueries);
            }
            if (Array.isArray(grounding.groundingChunks)) {
              for (const chunk of grounding.groundingChunks) {
                if (chunk?.web?.uri) {
                  verifiedOnlineSources.push({
                    title: chunk.web.title || "Official Regulatory Record",
                    uri: chunk.web.uri,
                  });
                }
              }
            }
          }
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        console.info(
          `[Oracle Failover] Candidate ${cand.name} (grounding: ${cand.grounding}) unavailable, attempting next candidate.`,
        );
      }
    }

    if (!text) {
      throw lastError || new Error("Failed to generate response from intelligence models.");
    }

    // Extract matching laws for source citations
    const matchedLaws = WORLD_LAWS_DATA.filter(
      (l) =>
        text.toLowerCase().includes(l.acronym.toLowerCase()) ||
        text.toLowerCase().includes(l.country.toLowerCase()),
    );

    const sources = matchedLaws.slice(0, 3).map((l) => ({
      law: l.acronym,
      article: l.keyArticles[0]?.number || "Statutory Code",
      authority: l.governingBody,
      uri: l.officialPortal,
    }));

    return {
      answer: text,
      sources:
        sources.length > 0
          ? sources
          : [
              {
                law: "Global Data Protection Database",
                article: "Cross-Jurisdictional Matrix",
                authority: "ASJi Sovereign Law-Tech Database",
                uri: "https://www.meity.gov.in",
              },
            ],
      groundedQueries: groundedQueries.slice(0, 5),
      verifiedOnlineSources: verifiedOnlineSources.slice(0, 6),
      suggestedFollowUps: [
        "How do I fix pre-consent cookie leaks detected by ASJi One?",
        "What are the mandatory clauses for India DPDP Act 2023 consent notices?",
        "Explain UAE PDPL cross-border data transfer adequacy rules",
      ],
    };
  } catch {
    console.info("[Compliance Oracle] Using localized knowledge-base legal matrix response.");
    return {
      answer: `**ASJi Sovereign Legal Intelligence Engine**\n\nRegarding your query: "${question}"\n\nUnder global data protection standards (GDPR Art. 5/6, India DPDP Sec. 5/6, UAE PDPL Art. 5/6, CPRA § 1798.100), digital data processing requires unambiguous prior consent, purpose specification, encrypted data transmission, and instant access to grievance redressal mechanisms.\n\nYou can audit any domain on the ASJi One terminal to receive an automated 0-100 risk score and download legal drafts directly in the Sovereign Legal Matrix.`,
      sources: [
        {
          law: "Global Harmonized Privacy Standard",
          article: "ISO/IEC 27701 & GDPR",
          authority: "International Regulators",
          uri: "https://edpb.europa.eu",
        },
      ],
      suggestedFollowUps: [
        "Audit my domain for global privacy risks",
        "Download India DPDP statutory drafting template",
        "Download EU GDPR Data Processing Addendum",
      ],
    };
  }
}
