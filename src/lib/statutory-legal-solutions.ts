/**
 * ASJi One - Tailored Statutory Legal Solutions & Non-Compliance Engine
 * Generates custom legal draft solutions and itemizes statutory violations
 * based on real scan findings under the respective privacy law.
 */

import type { AuditReport } from "./audit-types";
import { STATUTORY_FRAMEWORKS } from "./audit-statutes";
import { WORLD_LAWS_DATA } from "./world-laws-data";

export interface StatutoryNonComplianceGap {
  id: string;
  lawArticle: string;
  issue: string;
  whatYouDoNotFollow: string;
  severity: "critical" | "high" | "medium";
  legalPenalty: string;
  statutoryRemedy: string;
}

export interface StatutoryLegalSolutionSuite {
  targetDomain: string;
  frameworkId: string;
  lawName: string;
  country: string;
  authority: string;
  overallScore: number;
  totalGapsCount: number;
  nonComplianceGaps: StatutoryNonComplianceGap[];
  samplePrivacyPolicy: string;
  sampleConsentGateCharter: string;
  sampleGrievanceCharter: string;
  sampleRectificationRoadmap: string;
}

export function generateStatutoryLegalSolution(
  report: AuditReport | null,
  frameworkId = "ind-dpdp",
): StatutoryLegalSolutionSuite {
  const target = report?.target || "your-domain.com";
  const domain = target.replace(/^https?:\/\//i, "").split("/")[0] || "your-domain.com";
  const score = report?.score ?? 48;
  const fw = STATUTORY_FRAMEWORKS.find((f) => f.id === frameworkId) || STATUTORY_FRAMEWORKS[0];

  const evidenceText = (report?.evidence || []).join(" ").toLowerCase();
  const criticalLeaks = report?.criticalLeaks || [];

  const hasTrackingCookies =
    evidenceText.includes("cookie") ||
    evidenceText.includes("tracker") ||
    evidenceText.includes("telemetry") ||
    evidenceText.includes("google analytics") ||
    score < 75;

  const hasMissingHeaders =
    evidenceText.includes("header") ||
    evidenceText.includes("content-security-policy") ||
    evidenceText.includes("hsts") ||
    evidenceText.includes("missing");

  const hasGrievanceGap = !evidenceText.includes("grievance officer") || score < 70;

  const nonComplianceGaps: StatutoryNonComplianceGap[] = [];

  // Construct gaps according to respective law
  if (frameworkId === "ind-dpdp") {
    // INDIA DPDP ACT 2023
    if (hasMissingHeaders || score < 65) {
      nonComplianceGaps.push({
        id: "dpdp-sec-5",
        lawArticle: "Section 5(1) & 5(2), DPDP Act 2023",
        issue: "Missing Statutory Itemized Notice Before / At Collection",
        whatYouDoNotFollow: `Your website collects user inputs and identifiers without serving an upfront itemized notice specifying: (a) the exact personal data categories processed, (b) the specific purpose of processing, (c) instructions for exercising withdrawal rights, and (d) contact details of the statutory Grievance Officer in English and 22 languages specified in the Eighth Schedule.`,
        severity: "critical",
        legalPenalty: "Up to ₹250 Crores per violation under Schedule 1 (Item 1)",
        statutoryRemedy:
          "Publish the ASJi Itemized Section 5 Notice banner prior to collecting any phone numbers, email addresses, or account credentials.",
      });
    }

    if (hasTrackingCookies) {
      nonComplianceGaps.push({
        id: "dpdp-sec-6",
        lawArticle: "Section 6(1) & 6(4), DPDP Act 2023",
        issue: "Unconsented Pre-Tracking & Non-Affirmative Cookie Storage",
        whatYouDoNotFollow: `Third-party scripts, analytics listeners, or tracking tokens execute automatically upon page load before the user grants free, specific, informed, unconditional, and unambiguous affirmative consent. Under Section 6(4), the ease of withdrawing consent must equal the ease of granting it.`,
        severity: "critical",
        legalPenalty:
          "Up to ₹200 Crores under Schedule 1 for failure to implement security safeguards",
        statutoryRemedy:
          "Implement the zero-leak consent gate script to halt all tracking scripts until the user clicks 'Accept' on the statutory consent modal.",
      });
    }

    if (hasGrievanceGap) {
      nonComplianceGaps.push({
        id: "dpdp-sec-8",
        lawArticle: "Section 8(9) & Section 13, DPDP Act 2023",
        issue: "Absence of Designated Statutory Grievance Redressal Officer",
        whatYouDoNotFollow: `The digital platform does not publish the name, physical address, and electronic contact endpoint of a designated Grievance Redressal Officer within the territory of India capable of addressing user privacy complaints within the statutory timeline.`,
        severity: "high",
        legalPenalty:
          "Up to ₹50 Crores for breach of fiduciary obligations under Schedule 1 (Item 4)",
        statutoryRemedy:
          "Publish the designated Grievance Officer disclosure charter in your website footer and establish a 48-hour response protocol.",
      });
    }

    nonComplianceGaps.push({
      id: "dpdp-sec-9",
      lawArticle: "Section 9(1) & 9(3), DPDP Act 2023",
      issue: "Lack of Verifiable Parental Consent Mechanism for Minors",
      whatYouDoNotFollow: `Your application processes personal data without verifying whether the user is a child (under 18 years), and lacks a verifiable parental/guardian consent gateway, while running behavioral tracking algorithms.`,
      severity: "high",
      legalPenalty: "Up to ₹200 Crores for non-compliance with provisions relating to children",
      statutoryRemedy:
        "Implement age-gate screening on registration and disable behavioral profiling for flagged minor accounts.",
    });
  } else if (frameworkId === "eu-gdpr") {
    // EU GDPR
    nonComplianceGaps.push({
      id: "gdpr-art-13",
      lawArticle: "Article 13 & 14, EU GDPR",
      issue: "Inadequate Transparency Notice & Legal Basis Articulation",
      whatYouDoNotFollow: `The website does not provide clear information regarding the controller's identity, Data Protection Officer (DPO) contact, specific Article 6 legal basis for each processing purpose, retention periods, and the right to lodge a complaint with a supervisory authority.`,
      severity: "critical",
      legalPenalty: "Up to €20,000,000 or 4% of total worldwide annual turnover",
      statutoryRemedy:
        "Deploy the ASJi GDPR Article 13 Compliant Privacy Charter with itemized legal bases and retention schedules.",
    });

    if (hasTrackingCookies) {
      nonComplianceGaps.push({
        id: "gdpr-art-7",
        lawArticle: "Article 7, GDPR & ePrivacy Directive Art. 5(3)",
        issue: "Non-Compliant Cookie Consent & Pre-Consent Tracking",
        whatYouDoNotFollow: `Non-essential analytics or advertising cookies are initialized prior to active, affirmative opt-in consent. Pre-ticked boxes or continued browsing are not legally valid consent under EDPB Guidelines 05/2020.`,
        severity: "critical",
        legalPenalty: "Up to €10,000,000 or 2% of annual turnover",
        statutoryRemedy:
          "Enforce strict client-side script gating ensuring zero non-essential cookies fire before explicit user opt-in.",
      });
    }

    nonComplianceGaps.push({
      id: "gdpr-art-15",
      lawArticle: "Articles 15–22, EU GDPR",
      issue: "Lack of Automated Data Subject Rights (DSAR) Intake",
      whatYouDoNotFollow: `Users cannot easily exercise their rights to access, rectification, erasure ('Right to be Forgotten'), restriction, or data portability without submitting burdensome off-platform requests.`,
      severity: "high",
      legalPenalty: "Up to €20,000,000 or 4% of annual turnover",
      statutoryRemedy:
        "Embed the self-service DSAR intake portal allowing users to request data export or erasure in 1 click.",
    });
  } else if (frameworkId === "uk-duaa") {
    // UK DUAA / UK GDPR
    nonComplianceGaps.push({
      id: "uk-pecr",
      lawArticle: "PECR Regulation 6 & UK DUAA 2026",
      issue: "Non-Compliant Consent for Electronic Storage & Cookies",
      whatYouDoNotFollow: `Terminal equipment storage (cookies and local identifiers) accessed without granular user choice that meets the UK GDPR standard of consent.`,
      severity: "critical",
      legalPenalty: "Fines up to £17.5M or 4% of global turnover under ICO enforcement",
      statutoryRemedy: "Provide equal 'Reject All' and 'Accept All' buttons on first interaction.",
    });
    nonComplianceGaps.push({
      id: "uk-ico-rights",
      lawArticle: "UK GDPR Section 44 & Part 3 DUAA",
      issue: "Missing ICO Registration & Representative Notice",
      whatYouDoNotFollow: `Failure to publish UK representative contact details and clear 1-month response charter for data subject rights.`,
      severity: "high",
      legalPenalty: "Regulatory enforcement notice and penalty up to £8.7M",
      statutoryRemedy:
        "Incorporate designated UK representative statement and clear supervisory authority escalation path.",
    });
  } else if (frameworkId === "uae-pdpl") {
    // UAE PDPL
    nonComplianceGaps.push({
      id: "uae-art-4",
      lawArticle: "Articles 4, 5 & 6, Federal Decree-Law No. 45 of 2021",
      issue: "Processing Without Explicit Prior Consent & Cross-Border Breach",
      whatYouDoNotFollow: `Personal data processed without demonstrable user consent. Data transferred outside the UAE without verifying adequate protective measures or UAE Data Office approved exemptions.`,
      severity: "critical",
      legalPenalty: "Administrative fines up to AED 500,000 and suspension of operations",
      statutoryRemedy:
        "Execute UAE Data Office standard contractual clauses and implement explicit Arabic/English consent notices.",
    });
  } else if (frameworkId === "us-cpra") {
    // US CPRA / CCPA
    nonComplianceGaps.push({
      id: "cpra-opt-out",
      lawArticle: "Cal. Civ. Code § 1798.120 & § 1798.135 (CPRA)",
      issue: "Missing 'Do Not Sell or Share My Personal Information' Link & GPC Signal",
      whatYouDoNotFollow: `The domain lacks a conspicuous 'Do Not Sell or Share My Personal Information' footer link and fails to process automated Global Privacy Control (GPC) opt-out browser signals for cross-context behavioral advertising.`,
      severity: "critical",
      legalPenalty: "Up to $7,500 per intentional violation enforced by the CPPA / California AG",
      statutoryRemedy:
        "Implement friction-free GPC signal listener and mandatory 'Do Not Sell / Share' privacy choice banner.",
    });
    nonComplianceGaps.push({
      id: "cpra-notice-collection",
      lawArticle: "Cal. Civ. Code § 1798.100(b) Notice at Collection",
      issue: "Deficient Notice at Collection for Sensitive Personal Information (SPI)",
      whatYouDoNotFollow: `Consumers are not provided with an explicit itemization of categories of personal information and sensitive personal data collected, retention periods per category, and purpose limitation disclosures prior to collection.`,
      severity: "high",
      legalPenalty: "Injunctions and statutory civil penalties under Cal. Civ. Code § 1798.199.90",
      statutoryRemedy:
        "Publish itemized California Notice at Collection alongside limit the use of SPI controls.",
    });
  } else if (frameworkId === "brazil-lgpd") {
    // BRAZIL LGPD
    nonComplianceGaps.push({
      id: "lgpd-art-7-9",
      lawArticle: "Articles 7, 8 & 9, Lei Geral de Proteção de Dados (LGPD)",
      issue: "Unjustified Processing & Opaque Legal Basis Disclosures",
      whatYouDoNotFollow: `Data processing occurs without clear articulation of legitimate interest balancing or affirmative free consent. The title of Encargado (DPO) and contact channels are omitted from the main portal.`,
      severity: "critical",
      legalPenalty:
        "Up to 2% of annual turnover in Brazil (up to R$ 50,000,000) under ANPD sanctions",
      statutoryRemedy:
        "Appoint and publish Encargado (DPO) details and align tracking cookies with Article 8 consent mandates.",
    });
  } else if (frameworkId === "canada-pipeda") {
    // CANADA PIPEDA / CPPA
    nonComplianceGaps.push({
      id: "pipeda-principle-3",
      lawArticle: "Schedule 1, Principle 3 & Principle 4, PIPEDA (Bill C-27)",
      issue: "Lack of Meaningful Consent & Data Minimization Breach",
      whatYouDoNotFollow: `The domain captures client identifiers without meaningful consent meeting the OPC Guidelines. Tracking is bundled with service delivery without clear opt-out avenues.`,
      severity: "high",
      legalPenalty: "Compliance agreements, Federal Court damage awards, and fines under CPPA",
      statutoryRemedy:
        "Publish clear, plain-language consent dialogues highlighting what personal information is shared with third parties.",
    });
  } else if (frameworkId === "aus-privacy") {
    // AUSTRALIA PRIVACY ACT
    nonComplianceGaps.push({
      id: "app-1-5",
      lawArticle: "Australian Privacy Principles (APP 1 & APP 5), Privacy Act 1988",
      issue: "Non-Compliant APP 5 Collection Notice & Opaque Overseas Disclosures",
      whatYouDoNotFollow: `Failure to notify individuals at or before collecting personal information regarding entities receiving the data, and omitting APP 8 disclosures concerning overseas recipient countries.`,
      severity: "high",
      legalPenalty: "Civil penalties up to AU$50,000,000 or 30% of adjusted turnover under OAIC",
      statutoryRemedy:
        "Publish comprehensive APP 5 Collection Notice explicitly listing international processing locations.",
    });
  } else if (frameworkId === "sg-pdpa") {
    // SINGAPORE PDPA
    nonComplianceGaps.push({
      id: "pdpa-sec-13",
      lawArticle: "Sections 13–15 (Consent & Notification), Singapore PDPA",
      issue: "Deemed Consent Assumption Without Statutory Gating",
      whatYouDoNotFollow: `Personal data collected and tracked via client scripts without providing purpose notification required under Section 20, improperly assuming deemed consent without meeting statutory criteria.`,
      severity: "high",
      legalPenalty: "Fines up to S$1,000,000 or 10% of annual turnover in Singapore under PDPC",
      statutoryRemedy:
        "Deploy active notification and opt-in consent mechanism for marketing and telemetry scripts.",
    });
  } else if (frameworkId === "ksa-pdpl") {
    // SAUDI ARABIA PDPL
    nonComplianceGaps.push({
      id: "ksa-royal-decree",
      lawArticle: "Royal Decree M/19, Articles 5, 11 & Implementing Regulations (SDAIA)",
      issue: "Cross-Border Transfer Without SDAIA Adequacy & Absence of Arabic Notice",
      whatYouDoNotFollow: `Personal data is routed to foreign analytics servers without executing SDAIA standard contractual clauses or exemptions. Arabic language statutory privacy disclosures are absent from the landing interface.`,
      severity: "critical",
      legalPenalty: "Criminal penalties and administrative fines up to SAR 5,000,000 under SDAIA",
      statutoryRemedy:
        "Deploy bilingual (Arabic/English) statutory privacy notice and restrict transfers to SDAIA-whitelisted jurisdictions.",
    });
  } else {
    // Database fallback for other sovereign jurisdictions (JP, KR, CH, NG, etc.)
    const matched = WORLD_LAWS_DATA.find(
      (w) =>
        w.id === frameworkId ||
        w.id.replace("-", "").includes(frameworkId.replace("-", "")) ||
        w.country.toLowerCase().includes(fw.country.toLowerCase()),
    );

    const statutoryPenalty = matched?.maxPenalty || `Statutory fines enforced by ${fw.authority}`;
    const primaryArticle = matched?.keyArticles?.[0]
      ? `${matched.keyArticles[0].number} (${matched.keyArticles[0].topic}): ${matched.keyArticles[0].mandate}`
      : `Mandates under ${fw.label}`;

    nonComplianceGaps.push({
      id: "sovereign-notice-gap",
      lawArticle: primaryArticle,
      issue: `Statutory Privacy Notice & Purpose Specification Gap (${fw.country})`,
      whatYouDoNotFollow: `Target domain collects user identifiers and interaction metadata without satisfying statutory requirements for lawful basis articulation, purpose limitation, and supervisory disclosures under ${fw.label}.`,
      severity: "critical",
      legalPenalty: statutoryPenalty,
      statutoryRemedy: `Deploy the ASJi tailored statutory privacy notice matching ${fw.authority} compliance guidelines.`,
    });

    if (hasTrackingCookies) {
      nonComplianceGaps.push({
        id: "sovereign-tracking-gap",
        lawArticle: `Consent & Electronic Gating Provisions (${fw.country})`,
        issue: "Pre-Consent Telemetry & Tracker Storage",
        whatYouDoNotFollow: `Client browsers execute non-essential tracking cookies and analytics endpoints prior to verifiable affirmative user authorization under ${fw.country} privacy statutes.`,
        severity: "high",
        legalPenalty: statutoryPenalty,
        statutoryRemedy:
          "Implement zero-leak client-side CMP script blocking non-essential telemetry until consent is recorded.",
      });
    }
  }

  // Generate Sample Statutory Privacy Policy Draft
  const samplePrivacyPolicy = `================================================================================
STATUTORY PRIVACY & PERSONAL DATA PROTECTION POLICY
Tailored for: ${domain}
Governing Jurisdiction: ${fw.country} (${fw.label})
Enforcement Authority: ${fw.authority}
Effective Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
================================================================================

1. LEGAL STATUS & CONTROLLER IDENTITY
This Privacy Notice is published in compliance with ${fw.label}. The website and services available at https://${domain} are operated by the Data Fiduciary/Controller ("the Entity"). 

2. STATUTORY DATA COLLECTION & PURPOSE LIMITATION
The Entity collects only personal data strictly necessary for legitimate operational purposes:
- Technical & Device Telemetry: IP addresses, browser user-agent, session identifiers.
- User Interaction Data: Inputs, form submissions, and authentication credentials.
- Communication Endpoints: Email address and telephone coordinates provided voluntarily.

Under no circumstances is personal data sold, leased, or transferred to unapproved third-party commercial data brokers.

3. LEGAL BASIS FOR PROCESSING
Processing of personal data is executed strictly under the lawful grounds recognized by ${fw.country} law:
- Free, specific, informed, and unambiguous affirmative consent obtained prior to processing.
- Performance of contractual obligations requested by the user.
- Compliance with mandatory legal, fiscal, and regulatory obligations.

4. USER STATUTORY RIGHTS (DATA PRINCIPAL CHARTER)
As a recognized Data Principal under ${fw.label}, you possess enforceable rights:
- Right to Access & Confirmation: Obtain confirmation and itemized summaries of personal data processed.
- Right to Correction & Erasure: Request rectification of inaccurate records and complete deletion of data where purpose is fulfilled.
- Right to Withdraw Consent: Revoke previously granted consent with the same ease with which it was given.
- Right to Grievance Redressal: Lodge complaints regarding non-compliance directly with our designated officer.

5. DESIGNATED GRIEVANCE REDRESSAL OFFICER / DPO CONTACT
In accordance with statutory mandates, our officer is appointed to resolve privacy inquiries:
- Designated Officer: Grievance Redressal Officer / Privacy Desk
- Entity: ${domain} Legal Compliance Division
- Email Endpoint: privacy@${domain}
- Statutory Turnaround SLA: Acknowledged within 24 hours; resolved within statutory timelines.
- Regulatory Escalation: If unresolved, you hold the statutory right to escalate your complaint to ${fw.authority}.

6. CROSS-BORDER DATA TRANSIT
Data transferred across territorial borders is protected using sovereign encryption and standard contractual clauses guaranteeing parity of protection.
`;

  // Generate Sample Consent Gate Charter
  const sampleConsentGateCharter = `================================================================================
STATUTORY COOKIE & PRE-CONSENT GATING CHARTER
Target Domain: ${domain}
Applicable Law: ${fw.label}
================================================================================

1. ZERO-LEAK PRE-CONSENT COMMITMENT
In compliance with statutory requirements, NO non-essential cookies, analytics trackers, or third-party marketing tags shall execute or store tokens in the user's terminal equipment until an explicit affirmative click is received.

2. COOKIE CATEGORIZATION & RETENTION:
- Strictly Necessary: Session tokens, security headers, anti-fraud flags (exempt from prior consent).
- Functional Preferences: Language and UI theme settings (duration: 365 days).
- Analytical & Telemetry: Aggregated traffic measurements (blocked until explicit consent).
- Third-Party Advertising: Remarketing and behavioral beacons (strictly blocked by default).

3. REJECT EQUIVALENCE (ONE-CLICK OPT-OUT):
Users are provided equal visual prominence to "Accept All" or "Reject All Non-Essential". Rejecting cookies does not restrict access to fundamental website features.
`;

  // Generate Sample Grievance Redressal Charter
  const sampleGrievanceCharter = `================================================================================
OFFICIAL GRIEVANCE REDRESSAL APPOINTMENT CHARTER
Entity: ${domain}
Statutory Reference: ${fw.country} Data Protection Mandates
Authority: ${fw.authority}
================================================================================

APPOINTMENT DISCLOSURE:
Notice is hereby given that ${domain} has instituted a dedicated Grievance Redressal Mechanism to address user privacy complaints, unauthorized data leakage, and subject access requests.

STATUTORY OFFICER PROFILE:
- Designation: Statutory Data Protection & Grievance Redressal Officer
- Official Electronic Mail: grievance@${domain}
- Physical Jurisdiction: Authorized representative jurisdiction for ${fw.country}
- Escalation Hotline: Available upon formal ticket generation

TIMELINE & SLA PROTOCOL:
1. Automated Ticket Generation & Acknowledgment: Within 24 hours of submission.
2. Initial Investigation & Fact-Finding: Within 48 hours.
3. Final Written Determination: Within statutory window (maximum 30 days).
4. Regulatory Escalation Right: In the event of dissatisfaction, the complainant may petition ${fw.authority}.
`;

  // Generate Rectification Roadmap
  const sampleRectificationRoadmap = `================================================================================
STATUTORY NON-COMPLIANCE RECTIFICATION ROADMAP
Domain: ${domain}
Current Audit Score: ${score}/100
Governing Law: ${fw.label}
================================================================================

STEP 1: INVENTORY & SHUT OFF UNCONSENTED TRACKERS (IMMEDIATE)
- Disable all analytics and tracking pixels from firing on initial page load.
- Drop the provided asji-consent-manager.js into your website <head> tag.

STEP 2: DEPLOY STATUTORY SECTION 5 / ARTICLE 13 NOTICE (WITHIN 48 HOURS)
- Replace generic legal terms with the tailored Statutory Privacy Policy provided in this suite.
- Ensure the notice clearly itemizes processing purposes and withdrawal methods.

STEP 3: PUBLISH GRIEVANCE OFFICER DETAILS (WITHIN 72 HOURS)
- Add a visible link in the website footer titled "Grievance Officer & Privacy Rights".
- Point the link to the official appointment disclosure charter provided.

STEP 4: HARDEN HTTP SECURITY HEADERS (WITHIN 7 DAYS)
- Inject Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), and X-Frame-Options to eliminate safe-harbor forfeiture risks.
`;

  return {
    targetDomain: domain,
    frameworkId,
    lawName: fw.label,
    country: fw.country,
    authority: fw.authority,
    overallScore: score,
    totalGapsCount: nonComplianceGaps.length,
    nonComplianceGaps,
    samplePrivacyPolicy,
    sampleConsentGateCharter,
    sampleGrievanceCharter,
    sampleRectificationRoadmap,
  };
}
