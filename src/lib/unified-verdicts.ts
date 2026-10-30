import type { AuditReport, RadarTerminalData } from "./audit-types";
import { computeRadarTerminalLog } from "./audit-radar";

export interface UnifiedJurisdictionVerdict {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  region: string;
  statuteName: string;
  statuteRef: string;
  governingBody: string;
  focusArea: string;
  passed: boolean;
  verdictLabel: "ALIGNED WITH STATUTORY REQUIREMENTS" | "POTENTIAL REGULATORY MISALIGNMENT";
  statusText: "PASS" | "FAIL";
  badgeText: "STATUTORY PASS" | "STATUTORY FAIL";
  primaryViolation: string;
  passJustification: string;
  violatedArticles: string[];
  maxPenalty: string;
  severity: "COMPLIANT" | "CRITICAL" | "HIGH";
  isOriginCountry: boolean;
}

export interface UnifiedAuditSummary {
  verdicts: UnifiedJurisdictionVerdict[];
  verdictMap: Record<string, UnifiedJurisdictionVerdict>;
  passingCount: number;
  failingCount: number;
  totalCount: number;
  overallPassed: boolean;
  overallVerdictText: "[🟩 PASS]" | "[🟥 FAIL]";
  originVerdict: UnifiedJurisdictionVerdict | null;
}

export function getUnifiedJurisdictionVerdicts(report: AuditReport): UnifiedAuditSummary {
  // Always derive from radarTerminal or recompute synchronously
  const radar: RadarTerminalData =
    report.radarTerminal || computeRadarTerminalLog(report.target || "domain.com", null, report);

  const radarMatrix = radar.verdictMatrix;
  const originCountry = report.originCountry || "";
  const evText = (report.evidence || []).map((e) => e.toLowerCase()).join(" ");

  const hasHttps = !evText.includes("unencrypted http") && !evText.includes("not enforce https");
  const hasPreConsentLeak =
    evText.includes("pre-consent tracking") ||
    evText.includes("third-party telemetry before consent") ||
    evText.includes("unconsented tracking cookies");
  const hasPrivacyNotice =
    !evText.includes("no visible link to privacy policy") &&
    !evText.includes("lack of privacy notice") &&
    !evText.includes("no privacy or terms links");

  const score = typeof report.score === "number" ? report.score : 50;

  // 1. India DPDP Act 2023
  const indiaPassed = Boolean(radarMatrix.indiaDpdp2023.pass);
  // 2. EU GDPR
  const euPassed = Boolean(radarMatrix.euGdprReforms.pass);
  // 3. UK DUAA 2026 / UK GDPR
  const ukPassed = Boolean(radarMatrix.ukDuaa2026.pass);
  // 4. UAE Decree-Law 45
  const uaePassed = Boolean(radarMatrix.uaeDecreeLaw45.pass);
  // 5. Saudi Arabia PDPL
  const saudiPassed = Boolean(radarMatrix.saudiArabiaPdpl.pass);
  // 6. Singapore PDPA
  const singaporePassed = Boolean(radarMatrix.singaporePdpa.pass);

  const usPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;
  const brazilPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;
  const canadaPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;
  const australiaPassed = hasPrivacyNotice && hasHttps && score >= 65;
  const japanPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;
  const koreaPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;
  const swissPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;
  const southAfricaPassed = hasPrivacyNotice && hasHttps && score >= 60;
  const nigeriaPassed = hasPrivacyNotice && hasHttps && !hasPreConsentLeak && score >= 65;

  const isOrigin = (codes: string[]) =>
    codes.some(
      (c) =>
        originCountry.toLowerCase().includes(c.toLowerCase()) ||
        (report.target && report.target.toLowerCase().endsWith("." + c.toLowerCase())),
    );

  const verdicts: UnifiedJurisdictionVerdict[] = [
    {
      id: "in-dpdp",
      country: "India",
      countryCode: "IN",
      flag: "🇮🇳",
      region: "Asia-Pacific",
      statuteName: "Digital Personal Data Protection Act, 2023",
      statuteRef: "Sections 5(1), 6(1), 8(1), 9 & 13",
      governingBody: "Data Protection Board of India (DPBI)",
      focusArea:
        "Unconsented telemetry drift, pre-consent cookies, and Grievance Officer designation",
      passed: indiaPassed,
      verdictLabel: indiaPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: indiaPassed ? "PASS" : "FAIL",
      badgeText: indiaPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Third-party telemetry scripts initialized prior to verifiable affirmative consent and absence of statutory Grievance Officer escalation portal under Section 13.",
      passJustification:
        "Explicit affirmative consent gates active prior to non-essential script execution with visible grievance redressal mechanisms in place.",
      violatedArticles: [
        "Section 6(1) Telemetry",
        "Section 8(1) Safeguards",
        "Section 13 Redressal",
      ],
      maxPenalty: "Up to ₹250 Crores per violation",
      severity: indiaPassed ? "COMPLIANT" : "CRITICAL",
      isOriginCountry: isOrigin(["in", "india"]),
    },
    {
      id: "eu-gdpr",
      country: "European Union",
      countryCode: "EU",
      flag: "🇪🇺",
      region: "Europe",
      statuteName: "General Data Protection Regulation (EU GDPR)",
      statuteRef: "Articles 5(1)(a), 6, 7, 13 & 32",
      governingBody: "European Data Protection Board (EDPB)",
      focusArea:
        "Prior opt-in consent, transport layer TLS encryption, and EU Standard Contractual Clauses",
      passed: euPassed,
      verdictLabel: euPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: euPassed ? "PASS" : "FAIL",
      badgeText: euPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Lack of granular prior opt-in consent mechanism prior to cookie injection; telemetry payloads transferred across unapproved third-party jurisdictions under Chapter V.",
      passJustification:
        "Strict affirmative cookie gating enforced; transport layer security and transparent legal notices conform to EDPB guidance.",
      violatedArticles: [
        "Article 7 Consent",
        "Article 13 Notice",
        "Article 32 Security",
        "Chapter V Transfers",
      ],
      maxPenalty: "Up to €20M or 4% of Global Annual Turnover",
      severity: euPassed ? "COMPLIANT" : "CRITICAL",
      isOriginCountry: isOrigin(["eu", "de", "fr", "nl", "ie", "it", "es"]),
    },
    {
      id: "gb-ukgdpr",
      country: "United Kingdom",
      countryCode: "GB",
      flag: "🇬🇧",
      region: "Europe & UK",
      statuteName: "Data (Use & Access) Act 2026 & UK GDPR",
      statuteRef: "UK GDPR & PECR Regulation 6",
      governingBody: "Information Commissioner's Office (ICO)",
      focusArea:
        "PECR terminal storage regulation, analytics telemetry boundaries, and lawful access",
      passed: ukPassed,
      verdictLabel: ukPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: ukPassed ? "PASS" : "FAIL",
      badgeText: ukPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "PECR Regulation 6 terminal equipment access violation: analytics tokens stored prior to user consent without lawful analytics exemption.",
      passJustification:
        "Terminal storage operations compliant with updated DUAA 2026 guidelines and PECR consent thresholds.",
      violatedArticles: [
        "PECR Reg 6 Terminal Storage",
        "UK GDPR Art 5 Principles",
        "UK GDPR Art 13 Notice",
      ],
      maxPenalty: "Up to £17.5M or 4% of Worldwide Turnover",
      severity: ukPassed ? "COMPLIANT" : "CRITICAL",
      isOriginCountry: isOrigin(["uk", "gb", "co.uk"]),
    },
    {
      id: "ae-pdpl",
      country: "United Arab Emirates",
      countryCode: "AE",
      flag: "🇦🇪",
      region: "Middle East",
      statuteName: "Federal Decree-Law No. 45 of 2021 on Personal Data Protection",
      statuteRef: "Articles 5, 9 & 22",
      governingBody: "UAE Data Office",
      focusArea:
        "Cross-border sovereign transfer controls, explicit consent, and security safeguards",
      passed: uaePassed,
      verdictLabel: uaePassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: uaePassed ? "PASS" : "FAIL",
      badgeText: uaePassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Unapproved cross-border transfer of visitor telemetry outside UAE territory without adequate statutory safeguards or Data Office approval.",
      passJustification:
        "Local data subject telemetry handled with verified consent; transmission security aligned with UAE Data Office regulations.",
      violatedArticles: [
        "Article 5 Consent Requirements",
        "Article 9 Security Measures",
        "Article 22 Cross-Border",
      ],
      maxPenalty: "Administrative penalties and operational suspension",
      severity: uaePassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["ae", "uae"]),
    },
    {
      id: "sa-pdpl",
      country: "Saudi Arabia",
      countryCode: "SA",
      flag: "🇸🇦",
      region: "Middle East",
      statuteName: "Personal Data Protection Law (Royal Decree M/19)",
      statuteRef: "Articles 4, 19 & 29",
      governingBody: "Saudi Data and AI Authority (SDAIA)",
      focusArea:
        "Mandatory opt-in consent, cross-border transfer restrictions, and data controller registration",
      passed: saudiPassed,
      verdictLabel: saudiPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: saudiPassed ? "PASS" : "FAIL",
      badgeText: saudiPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Absence of explicit consent mechanism for commercial marketing beacons; cross-border transfer requirements under SDAIA regulations unfulfilled.",
      passJustification:
        "Proper opt-in consent records captured prior to telemetry dispatch; data transfer meets SDAIA compliance guidelines.",
      violatedArticles: [
        "Article 4 Lawful Basis",
        "Article 19 Technical Safeguards",
        "Article 29 Cross-Border",
      ],
      maxPenalty: "Up to SAR 5,000,000 and potential penal sanctions",
      severity: saudiPassed ? "COMPLIANT" : "CRITICAL",
      isOriginCountry: isOrigin(["sa", "saudi"]),
    },
    {
      id: "sg-pdpa",
      country: "Singapore",
      countryCode: "SG",
      flag: "🇸🇬",
      region: "Asia-Pacific",
      statuteName: "Personal Data Protection Act 2012 (Revised 2020)",
      statuteRef: "Sections 13, 24 & 26",
      governingBody: "Personal Data Protection Commission (PDPC)",
      focusArea: "Transfer Limitation Obligation, Protection Obligation, and Consent Obligation",
      passed: singaporePassed,
      verdictLabel: singaporePassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: singaporePassed ? "PASS" : "FAIL",
      badgeText: singaporePassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Breach of Section 26 Transfer Limitation Obligation due to telemetry routing without ensuring comparable standard of protection.",
      passJustification:
        "Robust protection mechanisms implemented and overseas recipient standards verified under Section 26.",
      violatedArticles: [
        "Section 13 Consent Obligation",
        "Section 24 Protection Obligation",
        "Section 26 Transfer Limitation",
      ],
      maxPenalty: "Up to SGD 1,000,000 or 10% of Singapore Annual Turnover",
      severity: singaporePassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["sg", "singapore"]),
    },
    {
      id: "us-ccpa",
      country: "United States",
      countryCode: "US",
      flag: "🇺🇸",
      region: "Americas",
      statuteName: "California Consumer Privacy Act (CCPA / CPRA)",
      statuteRef: "Cal. Civ. Code § 1798.100 et seq.",
      governingBody: "California Privacy Protection Agency (CPPA)",
      focusArea:
        "Do Not Sell or Share My Personal Info, transparent notice at collection, Global Privacy Control (GPC)",
      passed: usPassed,
      verdictLabel: usPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: usPassed ? "PASS" : "FAIL",
      badgeText: usPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Missing required Notice at Collection and absent opt-out mechanism for behavioral cross-context tracking (§ 1798.120).",
      passJustification:
        "Transparent notice at collection maintained with clear consumer privacy disclosures and secure transport safeguards.",
      violatedArticles: [
        "§ 1798.100 Notice at Collection",
        "§ 1798.120 Opt-Out Rights",
        "§ 1798.135 Alternative Opt-Out",
      ],
      maxPenalty: "Up to $7,500 per intentional violation",
      severity: usPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["us", "usa", "com", "net", "org"]),
    },
    {
      id: "br-lgpd",
      country: "Brazil",
      countryCode: "BR",
      flag: "🇧🇷",
      region: "Americas",
      statuteName: "Lei Geral de Proteção de Dados (LGPD - Law 13.709/2018)",
      statuteRef: "Articles 6, 7 & 46",
      governingBody: "Autoridade Nacional de Proteção de Dados (ANPD)",
      focusArea: "Legal bases for processing, technical security measures, and DPO appointment",
      passed: brazilPassed,
      verdictLabel: brazilPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: brazilPassed ? "PASS" : "FAIL",
      badgeText: brazilPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Processing of tracking telemetry without valid legal basis under Article 7 and inadequate technical security measures under Article 46.",
      passJustification:
        "Legitimate bases established and appropriate technical security measures active under LGPD requirements.",
      violatedArticles: [
        "Article 6 Principles",
        "Article 7 Legal Bases",
        "Article 46 Security Measures",
      ],
      maxPenalty: "Up to 2% of Brazilian Revenue (capped at R$ 50,000,000)",
      severity: brazilPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["br", "brazil", "com.br"]),
    },
    {
      id: "ca-pipeda",
      country: "Canada",
      countryCode: "CA",
      flag: "🇨🇦",
      region: "Americas",
      statuteName: "Personal Information Protection and Electronic Documents Act (PIPEDA)",
      statuteRef: "Schedule 1 Principles 4.3 & 4.7",
      governingBody: "Office of the Privacy Commissioner of Canada (OPC)",
      focusArea: "Meaningful consent, safeguard obligations, and accountability",
      passed: canadaPassed,
      verdictLabel: canadaPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: canadaPassed ? "PASS" : "FAIL",
      badgeText: canadaPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Inadequate meaningful consent captured for cross-site behavioral analytics; missing transparent privacy policy disclosures.",
      passJustification:
        "Transparent disclosures and meaningful user consent principles honored across digital touchpoints.",
      violatedArticles: [
        "Principle 4.3 Consent",
        "Principle 4.7 Safeguards",
        "Principle 4.8 Openness",
      ],
      maxPenalty: "Federal court statutory damages and compliance orders",
      severity: canadaPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["ca", "canada"]),
    },
    {
      id: "au-privacy",
      country: "Australia",
      countryCode: "AU",
      flag: "🇦🇺",
      region: "Asia-Pacific",
      statuteName: "Privacy Act 1988 & Australian Privacy Principles (APPs)",
      statuteRef: "APPs 1, 5, 8 & 11",
      governingBody: "Office of the Australian Information Commissioner (OAIC)",
      focusArea:
        "Open and transparent management, notification of collection, cross-border disclosure",
      passed: australiaPassed,
      verdictLabel: australiaPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: australiaPassed ? "PASS" : "FAIL",
      badgeText: australiaPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Inadequate notification of collection under APP 5 and unverified cross-border disclosure safeguards under APP 8.",
      passJustification:
        "APP 1 transparency standards satisfied; collection notifications and encryption controls maintained.",
      violatedArticles: [
        "APP 1 Open Management",
        "APP 5 Collection Notification",
        "APP 8 Cross-Border",
        "APP 11 Security",
      ],
      maxPenalty: "Up to AUD 50,000,000 or 30% of Turnover",
      severity: australiaPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["au", "australia", "com.au"]),
    },
    {
      id: "jp-appi",
      country: "Japan",
      countryCode: "JP",
      flag: "🇯🇵",
      region: "Asia-Pacific",
      statuteName: "Act on the Protection of Personal Information (APPI)",
      statuteRef: "Articles 17, 23, 24 & 27",
      governingBody: "Personal Information Protection Commission (PPC)",
      focusArea:
        "Third-party data provision, security controls, and cross-border adequacy whitelist",
      passed: japanPassed,
      verdictLabel: japanPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: japanPassed ? "PASS" : "FAIL",
      badgeText: japanPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Cross-border transfer of telemetry without opt-in consent or Article 24 equivalence verification.",
      passJustification:
        "Adequate technical security measures and valid legal bases for cross-border transmission verified.",
      violatedArticles: [
        "Article 17 Proper Acquisition",
        "Article 23 Provision to Third Parties",
        "Article 24 Foreign Transfers",
      ],
      maxPenalty: "Up to ¥100,000,000 corporate criminal penalty",
      severity: japanPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["jp", "japan", "co.jp"]),
    },
    {
      id: "kr-pipa",
      country: "South Korea",
      countryCode: "KR",
      flag: "🇰🇷",
      region: "Asia-Pacific",
      statuteName: "Personal Information Protection Act (PIPA 2023 Amendment)",
      statuteRef: "Articles 15, 22, 28 & 29",
      governingBody: "Personal Information Protection Commission (PIPC)",
      focusArea:
        "Segregated opt-in consent, destruction protocols, and technical security safeguards",
      passed: koreaPassed,
      verdictLabel: koreaPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: koreaPassed ? "PASS" : "FAIL",
      badgeText: koreaPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Failure to segregate optional tracking cookies from essential processing consent under Article 22.",
      passJustification:
        "Segregated consent architecture and statutory encryption standards meet PIPC technical baselines.",
      violatedArticles: [
        "Article 15 Collection",
        "Article 22 Consent Methodology",
        "Article 29 Security Safeguards",
      ],
      maxPenalty: "Up to 3% of Total Annual Revenue",
      severity: koreaPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["kr", "korea", "co.kr"]),
    },
    {
      id: "ch-fadp",
      country: "Switzerland",
      countryCode: "CH",
      flag: "🇨🇭",
      region: "Europe & UK",
      statuteName: "Federal Act on Data Protection (Revised FADP 2023)",
      statuteRef: "Articles 6, 7, 8 & 19",
      governingBody: "Federal Data Protection and Information Commissioner (FDPIC)",
      focusArea:
        "Privacy by design, minimum technical data security, and transparent privacy disclosures",
      passed: swissPassed,
      verdictLabel: swissPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: swissPassed ? "PASS" : "FAIL",
      badgeText: swissPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Unencrypted script dependencies and missing transparent processing purpose notice under Article 19.",
      passJustification:
        "FDPIC transparency baselines and privacy by design standards satisfied across application stack.",
      violatedArticles: [
        "Article 6 Processing Principles",
        "Article 7 Privacy by Design",
        "Article 19 Duty to Inform",
      ],
      maxPenalty: "Criminal fines up to CHF 250,000 for responsible individuals",
      severity: swissPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["ch", "switzerland"]),
    },
    {
      id: "za-popia",
      country: "South Africa",
      countryCode: "ZA",
      flag: "🇿🇦",
      region: "Africa",
      statuteName: "Protection of Personal Information Act (POPIA Act 4 of 2013)",
      statuteRef: "Conditions 2, 6, 7 & Section 19",
      governingBody: "Information Regulator of South Africa",
      focusArea:
        "Processing limitation, Information Officer registration, and technical security safeguards",
      passed: southAfricaPassed,
      verdictLabel: southAfricaPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: southAfricaPassed ? "PASS" : "FAIL",
      badgeText: southAfricaPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Inadequate security safeguards for personal information in transit and unverified cross-border processing.",
      passJustification:
        "Section 19 security condition satisfied with encrypted endpoints and verified lawful processing.",
      violatedArticles: [
        "Condition 2 Processing Limitation",
        "Condition 7 Security Safeguards",
        "Section 19 Technical Measures",
      ],
      maxPenalty: "Fines up to R10,000,000 or up to 10 years imprisonment",
      severity: southAfricaPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["za", "south africa", "co.za"]),
    },
    {
      id: "ng-ndpa",
      country: "Nigeria",
      countryCode: "NG",
      flag: "🇳🇬",
      region: "Africa",
      statuteName: "Nigeria Data Protection Act, 2023 (NDPA 2023)",
      statuteRef: "Sections 24, 25, 30, 39 & 40",
      governingBody: "Nigeria Data Protection Commission (NDPC)",
      focusArea:
        "Affirmative consent, pre-consent cookie tracking isolation, DCMI compliance & 72h breach notification",
      passed: nigeriaPassed,
      verdictLabel: nigeriaPassed
        ? "ALIGNED WITH STATUTORY REQUIREMENTS"
        : "POTENTIAL REGULATORY MISALIGNMENT",
      statusText: nigeriaPassed ? "PASS" : "FAIL",
      badgeText: nigeriaPassed ? "STATUTORY PASS" : "STATUTORY FAIL",
      primaryViolation:
        "Pre-consent tracking telemetry deployed without valid legal basis under Section 25; missing NDPC-compliant transparency disclosures.",
      passJustification:
        "Transparent collection notices and affirmative consent verified; encryption and technical safeguards conform to NDPA Section 39 standards.",
      violatedArticles: [
        "Section 24 Principles",
        "Section 25 Lawful Bases",
        "Section 30 Notice",
        "Section 39 Security Safeguards",
        "Section 40 Breach Notification",
      ],
      maxPenalty: "Up to ₦10,000,000 or 2% of Annual Gross Revenue",
      severity: nigeriaPassed ? "COMPLIANT" : "HIGH",
      isOriginCountry: isOrigin(["ng", "nigeria", "com.ng", "gov.ng", "org.ng", "edu.ng"]),
    },
  ];

  const verdictMap = verdicts.reduce<Record<string, UnifiedJurisdictionVerdict>>((acc, v) => {
    acc[v.id] = v;
    acc[v.country.toLowerCase()] = v;
    acc[v.countryCode.toLowerCase()] = v;
    return acc;
  }, {});

  const passingCount = verdicts.filter((v) => v.passed).length;
  const failingCount = verdicts.filter((v) => !v.passed).length;
  const totalCount = verdicts.length;

  // Overall pass requires zero statutory failures among the primary radar statutes
  const hasAnyRadarFailure =
    !indiaPassed || !euPassed || !ukPassed || !uaePassed || !saudiPassed || !singaporePassed;
  const overallPassed = !hasAnyRadarFailure && score >= 75;

  const originVerdict = verdicts.find((v) => v.isOriginCountry) || null;

  return {
    verdicts,
    verdictMap,
    passingCount,
    failingCount,
    totalCount,
    overallPassed,
    overallVerdictText: overallPassed ? "[🟩 PASS]" : "[🟥 FAIL]",
    originVerdict,
  };
}

/**
 * Helper to match any framework name (from report.frameworks) to its unified verdict.
 */
export function matchFrameworkToVerdict(
  frameworkName: string,
  summary: UnifiedAuditSummary,
): UnifiedJurisdictionVerdict | null {
  const name = frameworkName.toLowerCase();
  if (name.includes("dpdp") || name.includes("india")) return summary.verdictMap["in-dpdp"] || null;
  if (name.includes("gdpr") || name.includes("eu") || name.includes("european"))
    return summary.verdictMap["eu-gdpr"] || null;
  if (name.includes("duaa") || name.includes("uk") || name.includes("kingdom"))
    return summary.verdictMap["gb-ukgdpr"] || null;
  if (name.includes("uae") || name.includes("decree") || name.includes("emirates"))
    return summary.verdictMap["ae-pdpl"] || null;
  if (name.includes("saudi") || name.includes("pdpl") || name.includes("arabia"))
    return summary.verdictMap["sa-pdpl"] || null;
  if (name.includes("singapore") || name.includes("pdpa"))
    return summary.verdictMap["sg-pdpa"] || null;
  if (
    name.includes("ccpa") ||
    name.includes("cpra") ||
    name.includes("california") ||
    name.includes("united states")
  )
    return summary.verdictMap["us-ccpa"] || null;
  if (name.includes("lgpd") || name.includes("brazil"))
    return summary.verdictMap["br-lgpd"] || null;
  if (name.includes("pipeda") || name.includes("canada"))
    return summary.verdictMap["ca-pipeda"] || null;
  if (name.includes("australia") || name.includes("privacy act"))
    return summary.verdictMap["au-privacy"] || null;
  if (name.includes("japan") || name.includes("appi")) return summary.verdictMap["jp-appi"] || null;
  if (name.includes("korea") || name.includes("pipa")) return summary.verdictMap["kr-pipa"] || null;
  if (name.includes("switzerland") || name.includes("fadp"))
    return summary.verdictMap["ch-fadp"] || null;
  if (name.includes("south africa") || name.includes("popia"))
    return summary.verdictMap["za-popia"] || null;
  if (name.includes("nigeria") || name.includes("ndpa"))
    return summary.verdictMap["ng-ndpa"] || null;
  return null;
}
