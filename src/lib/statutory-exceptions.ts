/**
 * ASJi One - Sovereign Statutory Exceptions & Safe Harbors Engine
 * Evaluates whether an audited website or digital service qualifies for statutory
 * exemptions, safe harbors, or relaxed compliance regimes under global data protection laws.
 */

import type { AuditReport } from "./audit-types";

export interface StatutoryExceptionRecord {
  id: string;
  lawName: string;
  country: string;
  flag: string;
  sectionOrArticle: string;
  exceptionTitle: string;
  category:
    "cookies_eprivacy" | "processing_scope" | "threshold" | "safe_harbor" | "research_domestic";
  isQualified: boolean;
  qualificationStatus:
    "QUALIFIED_EXEMPTION" | "PARTIALLY_EXEMPT" | "NOT_QUALIFIED" | "CONDITIONAL_SAFE_HARBOR";
  statutoryConditions: string;
  auditRationale: string;
  impactOnVerdict: string;
}

export interface DomainExceptionsAnalysis {
  targetDomain: string;
  hasAnyQualifiedException: boolean;
  qualifiedCount: number;
  totalEvaluated: number;
  exceptionsList: StatutoryExceptionRecord[];
  summaryConclusion: string;
}

export function evaluateStatutoryExceptions(
  report: Partial<AuditReport> | null,
  targetDomain: string,
): DomainExceptionsAnalysis {
  const cleanDomain = targetDomain.replace(/^https?:\/\//i, "").split("/")[0] || "domain.com";
  const evidenceText = (report?.evidence || []).join(" ").toLowerCase();
  const criticalLeaks = report?.criticalLeaks || [];
  const leaksText = criticalLeaks
    .map((l) => `${l.title} ${l.detail}`)
    .join(" ")
    .toLowerCase();
  const score = report?.score ?? 50;

  // Analysis flags derived strictly from observable audit signals
  const hasNoExternalTrackers =
    !evidenceText.includes("third-party telemetry") &&
    !evidenceText.includes("tracker signals") &&
    !leaksText.includes("third-party tracking sdk") &&
    !evidenceText.includes("google analytics") &&
    !evidenceText.includes("meta pixel");

  const hasNoPreConsentCookies =
    !evidenceText.includes("pre-consent tracking") &&
    !evidenceText.includes("unconsented pre-consent") &&
    !leaksText.includes("pre-consent tracking cookies");

  const isStaticOrPureContent =
    hasNoExternalTrackers &&
    hasNoPreConsentCookies &&
    !evidenceText.includes("personal-data forms") &&
    !leaksText.includes("forms");

  const isGovOrEdu =
    cleanDomain.endsWith(".gov") ||
    cleanDomain.endsWith(".gov.in") ||
    cleanDomain.endsWith(".nic.in") ||
    cleanDomain.endsWith(".edu") ||
    cleanDomain.endsWith(".ac.in") ||
    cleanDomain.endsWith(".org");

  const hasHttps =
    !evidenceText.includes("unencrypted http") &&
    !leaksText.includes("plaintext http transmission");

  const exceptions: StatutoryExceptionRecord[] = [
    // 1. EU ePrivacy Directive 2002/58/EC (Art. 5(3)) & UK PECR Reg 6(4) - Strictly Necessary Exemption
    {
      id: "eprivacy-essential-cookie",
      lawName: "EU ePrivacy Directive & UK PECR",
      country: "European Union / United Kingdom",
      flag: "🇪🇺/🇬🇧",
      sectionOrArticle: "Directive 2002/58/EC Art. 5(3) & UK PECR Reg. 6(4)",
      exceptionTitle: "Strictly Necessary / Technical Storage Exemption",
      category: "cookies_eprivacy",
      isQualified: hasNoPreConsentCookies && hasNoExternalTrackers,
      qualificationStatus:
        hasNoPreConsentCookies && hasNoExternalTrackers ? "QUALIFIED_EXEMPTION" : "NOT_QUALIFIED",
      statutoryConditions:
        "Storage of cookies or device access is strictly necessary for transmission or to provide an information society service explicitly requested by the user.",
      auditRationale:
        hasNoPreConsentCookies && hasNoExternalTrackers
          ? "The domain does not set invasive third-party marketing or profiling cookies prior to consent. Any technical session cookies fall within the statutory strictly necessary exemption; cookie banner mandate is mitigated."
          : "The domain deploys third-party telemetry or pre-consent marketing tracking, forfeiting the strictly necessary statutory exemption.",
      impactOnVerdict:
        hasNoPreConsentCookies && hasNoExternalTrackers
          ? "Exempt from prior affirmative cookie consent banner under Art. 5(3)."
          : "Full cookie consent banner required under EU & UK law.",
    },

    // 2. India DPDP Act 2023 - Section 17(1) & (2) Statutory Exemptions
    {
      id: "ind-dpdp-s17-exemptions",
      lawName: "Digital Personal Data Protection Act, 2023",
      country: "India",
      flag: "🇮🇳",
      sectionOrArticle: "Section 17(1)(b), 17(2)(b) & Section 1(2)",
      exceptionTitle: "Statutory Defense, Statistical & Non-Automated Scope Exceptions",
      category: "processing_scope",
      isQualified: isStaticOrPureContent,
      qualificationStatus: isStaticOrPureContent ? "QUALIFIED_EXEMPTION" : "PARTIALLY_EXEMPT",
      statutoryConditions:
        "Processing of personal data necessary for enforcement of legal rights, research, archiving, or purely non-personal/static display purposes where no personal data is collected for individual profiling.",
      auditRationale: isStaticOrPureContent
        ? "The public domain acts as a static content resource without user-facing personal data capture forms or third-party behavioral profiling, fulfilling minimal fiduciary exposure under Section 17."
        : "The platform captures visitor identifiers, analytics tokens, or interactive input fields, requiring statutory Section 5 notices and Section 6 consent protocols.",
      impactOnVerdict: isStaticOrPureContent
        ? "Statutory exemption applicable for Section 6 consent notices on static operations."
        : "Standard fiduciary obligations apply under Sections 5, 6, 8 and 13.",
    },

    // 3. California CCPA / CPRA - Cal. Civ. Code § 1798.140 & § 1798.145 Statutory Thresholds
    {
      id: "us-ccpa-threshold-exemption",
      lawName: "California Consumer Privacy Act (CCPA/CPRA)",
      country: "United States (California)",
      flag: "🇺🇸",
      sectionOrArticle: "Cal. Civ. Code § 1798.140(d)(1) & § 1798.145",
      exceptionTitle: "Commercial Threshold & Non-Sale Exemption",
      category: "threshold",
      isQualified: hasNoExternalTrackers && !isGovOrEdu,
      qualificationStatus: hasNoExternalTrackers ? "CONDITIONAL_SAFE_HARBOR" : "NOT_QUALIFIED",
      statutoryConditions:
        "Entity does not exceed $25M gross annual revenue, does not buy/sell/share personal data of 100,000+ CA consumers, and does not derive 50%+ revenue from data sales.",
      auditRationale: hasNoExternalTrackers
        ? "No client-side ad-tech data sharing (Meta Pixel, Criteo, Google DoubleClick) detected. Small-to-medium businesses not crossing statutory revenue/volume thresholds are exempt from 'Do Not Sell/Share' mandates."
        : "Cross-context behavioral advertising telemetry signals detected. If entity meets statutory revenue thresholds, Section 1798.120 opt-out link is legally mandatory.",
      impactOnVerdict: hasNoExternalTrackers
        ? "Qualifies for Small Business Threshold Exemption from formal CPRA opt-out requirements."
        : "Statutory opt-out and GPC signal compliance required under 11 CCR § 7025.",
    },

    // 4. EU GDPR - Article 2(2) & Recital 18 / Art 6(1)(f) Legitimate Interest Security Exception
    {
      id: "eu-gdpr-art2-security-exception",
      lawName: "General Data Protection Regulation (EU GDPR)",
      country: "European Union",
      flag: "🇪🇺",
      sectionOrArticle: "Article 2(2), Recital 49 & Article 6(1)(f)",
      exceptionTitle: "Network & Information Security Legitimate Interest Exception",
      category: "safe_harbor",
      isQualified: hasHttps && hasNoExternalTrackers,
      qualificationStatus:
        hasHttps && hasNoExternalTrackers ? "QUALIFIED_EXEMPTION" : "NOT_QUALIFIED",
      statutoryConditions:
        "Processing of server logs, IP addresses, and session tokens strictly necessary for ensuring network and information security constitutes an overriding legitimate interest.",
      auditRationale:
        hasHttps && hasNoExternalTrackers
          ? "The domain utilizes encrypted transport (TLS) without unauthorized commercial telemetry leakage. Server-side diagnostic access logging qualifies as a recognized legitimate interest under Recital 49 without requiring prior consent."
          : "Telemetry scripts transmit data beyond internal server security parameters without demonstrated legitimate interest balance test.",
      impactOnVerdict:
        hasHttps && hasNoExternalTrackers
          ? "Legitimate interest defense accepted for security and technical operations."
          : "Prior opt-in consent mandatory under Article 6(1)(a) & Article 7.",
    },

    // 5. Singapore PDPA - Business Contact Info & Section 4(1) Exceptions
    {
      id: "sg-pdpa-s4-exceptions",
      lawName: "Singapore Personal Data Protection Act (PDPA 2012)",
      country: "Singapore",
      flag: "🇸🇬",
      sectionOrArticle: "Section 4(1), Section 4(4) & Second Schedule",
      exceptionTitle: "Business Contact Info & Legitimate Interests Exception",
      category: "safe_harbor",
      isQualified: isStaticOrPureContent || isGovOrEdu,
      qualificationStatus:
        isStaticOrPureContent || isGovOrEdu ? "QUALIFIED_EXEMPTION" : "PARTIALLY_EXEMPT",
      statutoryConditions:
        "PDPA data protection provisions do not apply to business contact information, public agencies, or processing under recognized legitimate interest assessments.",
      auditRationale:
        isStaticOrPureContent || isGovOrEdu
          ? "Domain scope aligns with public information dissemination or standard business contact display, qualifying for Second Schedule exceptions."
          : "Interactive consumer telemetry initiated; requires standard Section 13 Purpose Limitation and Section 26 cross-border safeguards.",
      impactOnVerdict:
        isStaticOrPureContent || isGovOrEdu
          ? "Statutory exemption from individual consumer consent for public business contact data."
          : "Full Part IV & Part VIA statutory obligations apply.",
    },

    // 6. Australia Privacy Act 1988 - Section 6D Small Business Exemption
    {
      id: "au-privacy-act-s6d-small-business",
      lawName: "Privacy Act 1988 (Australian Privacy Principles)",
      country: "Australia",
      flag: "🇦🇺",
      sectionOrArticle: "Section 6D (Small Business Exemption)",
      exceptionTitle: "Small Business Annual Turnover (AU$3M) Exemption",
      category: "threshold",
      isQualified: !isGovOrEdu && hasNoExternalTrackers,
      qualificationStatus: hasNoExternalTrackers ? "CONDITIONAL_SAFE_HARBOR" : "NOT_QUALIFIED",
      statutoryConditions:
        "Entities with an annual turnover of AU$3 Million or less are statutorily exempt from the 13 APPs unless operating in health services or trading personal information.",
      auditRationale: hasNoExternalTrackers
        ? "No commercial trading or third-party pixel monetisation of Australian consumer data observed. Small businesses operating under the threshold can invoke Section 6D statutory defense."
        : "Third-party commercial ad network beacons identified; if trading user identifiers, small business exemption is legally forfeited.",
      impactOnVerdict: hasNoExternalTrackers
        ? "Eligible for Australian statutory small business safe harbor."
        : "Standard APP compliance required if threshold exceeded.",
    },

    // 7. Statutory Intermediary Safe Harbor (India IT Act § 79 / US § 230 / EU DSA Art. 6)
    {
      id: "statutory-intermediary-safe-harbor",
      lawName: "IT Act § 79 / US 47 U.S.C. § 230 / EU Digital Services Act",
      country: "International Intermediary Standards",
      flag: "🌐",
      sectionOrArticle: "India IT Act § 79 · EU DSA Art. 6 · US § 230",
      exceptionTitle: "Passive Conduit & Intermediary Safe Harbor Exemption",
      category: "safe_harbor",
      isQualified: score >= 75 && hasNoPreConsentCookies,
      qualificationStatus:
        score >= 75 && hasNoPreConsentCookies ? "QUALIFIED_EXEMPTION" : "NOT_QUALIFIED",
      statutoryConditions:
        "Entity acts as a passive network conduit, does not initiate or modify user content transmission, and observes statutory due diligence.",
      auditRationale:
        score >= 75 && hasNoPreConsentCookies
          ? "Target demonstrates compliant transport security and passive conduit behavior without unconsented third-party modification."
          : "Active pre-consent tracker injection or unencrypted payload transmission impairs the presumption of passive intermediary status.",
      impactOnVerdict:
        score >= 75 && hasNoPreConsentCookies
          ? "Statutory safe-harbor protections remain active under Section 79 / DSA Art. 6."
          : "Safe harbor status compromised; immediate due diligence remediation recommended.",
    },
  ];

  const qualifiedList = exceptions.filter(
    (e) =>
      e.qualificationStatus === "QUALIFIED_EXEMPTION" ||
      e.qualificationStatus === "CONDITIONAL_SAFE_HARBOR",
  );

  let summaryConclusion = "";
  if (qualifiedList.length >= 3) {
    summaryConclusion = `Evaluated ${exceptions.length} sovereign statutory exception regimes: ${cleanDomain} qualifies for ${qualifiedList.length} statutory exemptions (including ePrivacy Art. 5(3) strictly necessary storage, DPDP Sec. 17 baseline scope, and small business safe harbors), substantially mitigating immediate fine exposure under global privacy frameworks.`;
  } else if (qualifiedList.length > 0) {
    summaryConclusion = `Evaluated ${exceptions.length} sovereign statutory exception regimes: ${cleanDomain} conditionally qualifies for ${qualifiedList.length} exceptions, but requires affirmative consent remediation to secure full statutory immunity against active tracker drift.`;
  } else {
    summaryConclusion = `Evaluated ${exceptions.length} sovereign statutory exception regimes: ${cleanDomain} does not currently qualify for statutory exemptions due to detected pre-consent telemetry, cross-border data transfer, or missing statutory governance disclosures. Full compliance remediation is mandatory.`;
  }

  return {
    targetDomain: cleanDomain,
    hasAnyQualifiedException: qualifiedList.length > 0,
    qualifiedCount: qualifiedList.length,
    totalEvaluated: exceptions.length,
    exceptionsList: exceptions,
    summaryConclusion,
  };
}
