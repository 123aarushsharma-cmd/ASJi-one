import { GoogleGenAI } from "@google/genai";
import { WORLD_LAWS_DATA } from "./world-laws-data";

let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export interface ChatAnswerResponse {
  answer: string;
  sources: {
    law: string;
    article: string;
    authority: string;
  }[];
  suggestedFollowUps: string[];
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
Key Articles: ${law.keyArticles.map((a) => `${a.number} (${a.topic}): ${a.mandate}`).join("; ")}
Core Mandates: ${law.corePrinciples.join("; ")}`,
  ).join("\n\n");

  const systemInstruction = `You are ASJi Sovereign AI Oracle, the world's highest precision legal compliance intelligence system and sovereign data protection authority advisor.
You serve as an infallible, zero-hallucination compliance counselor for the ASJi One enterprise law-tech platform.

YOU POSSESS THE COMPLETE WORLD DATABASE OF DATA PROTECTION LAWS:
${lawContextSummary}

CORE OPERATING DIRECTIVES (0.001% ELITE ACCURACY STANDARD):
1. ACCURACY & ZERO SPECULATION: Every response must cite exact statutes, section/article numbers, official regulatory bodies (e.g. DPBI, EDPB, CNIL, ICO, CPPA, ANPD, PDPC, OAIC, PPC, PIPC, SDAIA, NDPC), and official statutory penalty caps.
2. EXPLAINING THIS ASJI ONE TOOL:
   - ASJi One performs real-world, client-side & server-side zero-touch statutory auditing of any domain or raw server code/headers.
   - It checks tracker telemetry, pre-consent cookies (ePrivacy / DPDP / GDPR), TLS/HSTS ciphers, CSP headers, DPO designations, cross-border data transfer adequacy, child data profiling, and generates verifiable PDF/JSON compliance certificates.
   - Features include the 14+ World Sovereign Database, the 6 Sovereign Legal Matrix with downloadable legal drafting templates (India DPDP Section 5/6, UAE PDPL, EU GDPR DPA Art 28, CPRA DNSMPI, Singapore PDPA, Brazil LGPD), and live audit history.
3. STRUCTURE:
   - Provide crisp, direct, executive-ready answers.
   - Use bold statutory citations.
   - Highlight actionable compliance steps or technical remedies (e.g., CMP banner flags, TLS 1.3 configs, Sec-GPC header listeners, Grievance Officer email publication).
4. MULTI-JURISDICTION COMPARISONS: If asked about cross-border differences (e.g. EU GDPR vs India DPDP vs UAE PDPL vs CPRA), provide side-by-side contrast of fines, breach reporting deadlines, and consent thresholds.`;

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
      answer: `### Sovereign Compliance Intelligence Report\n\n**Framework:** ${relevantLaw.lawName} (${relevantLaw.acronym})\n**Supervisory Authority:** ${relevantLaw.governingBody}\n**Maximum Statutory Penalty:** ${relevantLaw.maxPenalty}\n\n#### Key Legal Mandates:\n${relevantLaw.keyArticles.map((a) => `- **${a.number} (${a.topic})**: ${a.mandate}`).join("\n")}\n\n#### Enforcement Directives:\n- **Breach Notification:** Mandatory notification within **${relevantLaw.breachNotificationHours}**.\n- **Child Data Age Limit:** Protected up to **${relevantLaw.childrenAgeThreshold} years**.\n- **ASJi One Verification:** You can scan your application against this regime using the audit terminal on the home dashboard or download customized statutory drafting templates in the Sovereign Legal Matrix.`,
      sources: relevantLaw.keyArticles.slice(0, 3).map((a) => ({
        law: relevantLaw!.acronym,
        article: a.number,
        authority: relevantLaw!.governingBody,
      })),
      suggestedFollowUps: [
        `What are the penalty ceilings under ${relevantLaw.acronym}?`,
        `How do I comply with ${relevantLaw.acronym} breach notification?`,
        `Compare ${relevantLaw.acronym} vs EU GDPR requirements`,
      ],
    };
  }

  try {
    const candidateModels = [
      "gemini-3.8-flash",
      "gemini-flash-latest",
      "gemini-3.1-flash-lite",
      "gemini-2.5-flash",
    ];
    let text = "";
    let lastError: unknown;

    for (const model of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            ...history.map((h) => ({
              role: h.role === "user" ? "user" : "model",
              parts: [{ text: h.parts.join(" ") }],
            })),
            { role: "user", parts: [{ text: question }] },
          ],
          config: {
            systemInstruction,
            temperature: 0.2, // Low temperature for legal accuracy
          },
        });

        if (response && response.text) {
          text = response.text;
          break;
        }
      } catch (err: unknown) {
        lastError = err;
        console.warn(`[Oracle Model Failover] Candidate ${model} failed:`, err);
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
              },
            ],
      suggestedFollowUps: [
        "How do I fix pre-consent cookie leaks detected by ASJi One?",
        "What are the mandatory clauses for India DPDP Act 2023 consent notices?",
        "Explain UAE PDPL cross-border data transfer adequacy rules",
      ],
    };
  } catch (err) {
    console.error("Gemini API Error in Compliance Oracle:", err);
    return {
      answer: `**ASJi Sovereign Legal Intelligence Engine**\n\nRegarding your query: "${question}"\n\nUnder global data protection standards (GDPR Art. 5/6, India DPDP Sec. 5/6, UAE PDPL Art. 5/6, CPRA § 1798.100), digital data processing requires unambiguous prior consent, purpose specification, encrypted data transmission, and instant access to grievance redressal mechanisms.\n\nYou can audit any domain on the ASJi One terminal to receive an automated 0-100 risk score and download legal drafts directly in the Sovereign Legal Matrix.`,
      sources: [
        {
          law: "Global Harmonized Privacy Standard",
          article: "ISO/IEC 27701 & GDPR",
          authority: "International Regulators",
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
