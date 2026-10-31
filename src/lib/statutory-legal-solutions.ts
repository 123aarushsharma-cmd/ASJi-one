/**
 * ASJi One - Tailored Statutory Legal Solutions & Non-Compliance Engine
 * Generates custom legal draft solutions and itemizes statutory observations
 * based on real scan findings under the respective privacy law.
 */

import type { AuditReport } from "./audit-types";
import { STATUTORY_FRAMEWORKS } from "./audit-statutes";

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

  // Construct observations according to respective law
  if (frameworkId === "ind-dpdp") {
    // INDIA DPDP ACT 2023 & DPDP RULES, 2025
    if (hasMissingHeaders || score < 65) {
      nonComplianceGaps.push({
        id: "dpdp-sec-5",
        lawArticle: "Section 5(1) & 5(2), DPDP Act, 2023 & DPDP Rules, 2025",
        issue: "Missing Statutory Itemized Notice Before / At Collection",
        whatYouDoNotFollow: `Your website collects user inputs and identifiers without serving an upfront itemized notice specifying: (a) the exact personal data categories processed, (b) the specific purpose of processing, (c) instructions for exercising withdrawal rights, and (d) contact details of the statutory Grievance Officer.`,
        severity: "critical",
        legalPenalty: "DPDP Act, 2023 & DPDP Rules, 2025 Statutory Provisions (Notice Obligations)",
        statutoryRemedy:
          "Publish the ASJi Itemized Section 5 Notice banner prior to collecting any phone numbers, email addresses, or account credentials.",
      });
    }

    if (hasTrackingCookies) {
      nonComplianceGaps.push({
        id: "dpdp-sec-6",
        lawArticle: "Section 6(1) & 6(4), DPDP Act, 2023 & DPDP Rules, 2025",
        issue: "Unconsented Pre-Tracking & Non-Affirmative Cookie Storage",
        whatYouDoNotFollow: `Third-party scripts, analytics listeners, or tracking tokens execute automatically upon page load before the user grants free, specific, informed, unconditional, and unambiguous affirmative consent. Under Section 6(4), the ease of withdrawing consent must equal the ease of granting it.`,
        severity: "critical",
        legalPenalty:
          "DPDP Act, 2023 & DPDP Rules, 2025 Statutory Provisions (Security Safeguards)",
        statutoryRemedy:
          "Implement the zero-leak consent gate script to halt all tracking scripts until the user clicks 'Accept' on the statutory consent modal.",
      });
    }

    if (hasGrievanceGap) {
      nonComplianceGaps.push({
        id: "dpdp-sec-8",
        lawArticle: "Section 8(9) & Section 13, DPDP Act, 2023 & DPDP Rules, 2025",
        issue: "Absence of Designated Statutory Grievance Redressal Officer",
        whatYouDoNotFollow: `The digital platform does not publish the name, physical address, and electronic contact endpoint of a designated Grievance Redressal Officer capable of addressing user privacy complaints within the 30-day statutory timeline.`,
        severity: "high",
        legalPenalty:
          "DPDP Act, 2023 & DPDP Rules, 2025 Statutory Provisions (Grievance Redressal Obligations)",
        statutoryRemedy:
          "Publish the designated Grievance Officer disclosure charter in your website footer and establish a response protocol.",
      });
    }

    nonComplianceGaps.push({
      id: "dpdp-sec-9",
      lawArticle: "Section 9(1) & 9(3), DPDP Act, 2023 & DPDP Rules, 2025",
      issue: "Lack of Verifiable Parental Consent Mechanism for Minors",
      whatYouDoNotFollow: `Your application processes personal data without verifying whether the user is a child (under 18 years), and lacks a verifiable parental/guardian consent gateway, while running behavioral tracking algorithms.`,
      severity: "high",
      legalPenalty:
        "DPDP Act, 2023 & DPDP Rules, 2025 Statutory Provisions (Children's Data Obligations)",
      statutoryRemedy:
        "Implement age-gate screening on registration and disable behavioral profiling for flagged minor accounts.",
    });
  } else {
    // EU GDPR & Other Global Laws
    nonComplianceGaps.push({
      id: "gdpr-art-13",
      lawArticle: "Article 13 & 14, EU GDPR",
      issue: "Inadequate Transparency Notice & Legal Basis Articulation",
      whatYouDoNotFollow: `The website does not provide clear information regarding the controller's identity, Data Protection Officer (DPO) contact, specific Article 6 legal basis for each processing purpose, retention periods, and supervisory complaint rights.`,
      severity: "critical",
      legalPenalty: "EU GDPR Transparency & Article 13/14 Statutory Provisions",
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
        legalPenalty: "EU GDPR Article 7 & ePrivacy Directive Consent Provisions",
        statutoryRemedy:
          "Enforce strict client-side script gating ensuring zero non-essential cookies fire before explicit user opt-in.",
      });
    }
  }

  return {
    targetDomain: domain,
    frameworkId,
    lawName: fw.label,
    country: fw.country,
    authority: fw.authority,
    overallScore: score,
    totalGapsCount: nonComplianceGaps.length,
    nonComplianceGaps,
    samplePrivacyPolicy: `STATUTORY PRIVACY POLICY DRAFT (${fw.label})
Effective Date: ${new Date().toISOString().split("T")[0]}
Target Domain: ${domain}

1. DATA CONTROLLER & IDENTITY
${domain} operates in full compliance with ${fw.label} under supervisory authority of ${fw.authority}.

2. COLLECTION & PURPOSE OF PROCESSING
We collect only necessary personal data (Name, Email, Website URL) required to perform technical domain inspection. Data is processed strictly pursuant to user affirmative consent.

3. DATA RETENTION & AUTO-DELETION
Audit reports and technical inspection logs are automatically deleted after 12 months. Users may request immediate account and data deletion via the Private Sovereign Vault.

4. DESIGNATED GRIEVANCE & DPO CONTACT
For statutory rights exercise or grievance redressal, contact our designated officer at asji.online@gmail.com. Statutory response SLA: 30 days.

Note: This document is an informational observation draft and does not constitute formal legal advice.`,

    sampleConsentGateCharter: `STATUTORY CONSENT GATE CHARTER (${domain})
Under ${fw.label}:
- All non-essential analytics and tracking cookies are halted by default prior to affirmative opt-in.
- Reject / Essential Only options function with equal ease as Accept.
- No behavioral tracking or minor profiling is conducted without consent.`,

    sampleGrievanceCharter: `DESIGNATED GRIEVANCE OFFICER APPOINTMENT CHARTER
Platform: ${domain}
Governing Law: ${fw.label}
Designated Email: asji.online@gmail.com
SLA: 30-day statutory response window`,

    sampleRectificationRoadmap: `STATUTORY RECTIFICATION & GOVERNANCE ROADMAP
Phase 1: Deploy Zero-Leak CMP Script & Halt Pre-Consent Cookies
Phase 2: Publish Itemized Section 5 Notice & Grievance Officer Charter
Phase 3: Configure Server-Side HTTP Security Headers (CSP, HSTS, X-Frame-Options)
Phase 4: Conduct Periodic Automated Verification Audits`,
  };
}
