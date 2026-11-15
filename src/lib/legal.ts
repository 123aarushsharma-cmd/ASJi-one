/**
 * Single source of truth for operator-editable legal & compliance details.
 */
export const LEGAL = {
  operator: "ASJi One",
  legalEntity: "ASJi Web and Legal Solution",
  founderName: "Arush Sharma",
  positioning:
    "Where Law Meets Innovation — Sovereign Data Privacy, Cyber Compliance & Legal-Tech Infrastructure.",
  contactEmail: "hello@asjione.com",
  privacyEmail: "hello@asjione.com",
  securityEmail: "hello@asjione.com",
  grievanceEmail: "hello@asjione.com",
  phoneNumbers: ["+91 8290841179", "+91 9461584298"],
  phoneRaw: ["8290841179", "9461584298"],
  website: {
    domain: "www.asji.online",
    url: "https://www.asji.online",
  },
  instagram: {
    handle: "@asjiweblegal",
    url: "https://www.instagram.com/asjiweblegal",
  },
  linkedin: {
    name: "ASJi Web and Legal Solution",
    url: "https://www.linkedin.com/company/asji-web-and-legal-solution/home/",
  },
  founderLinkedin: {
    name: "Arush Sharma",
    url: "https://in.linkedin.com/in/arush-sharma-369318332",
  },
  grievanceOfficer: {
    name: "Arush Sharma (Designated Grievance Officer)",
    entity: "ASJi Web and Legal Solution",
    email: "hello@asjione.com",
    location: "Jaipur, Rajasthan, India",
    sla: "7 business days statutory acknowledgment & redressal SLA",
  },
  retentionPolicy:
    "Public scan inputs execute transiently in sandboxed memory; account audit records purge automatically after 12 months or on erasure request.",
  dataProcessors: [
    {
      name: "Google Cloud / Firebase",
      purpose: "Authentication, Firestore database storage, security rules",
    },
    {
      name: "Hosting Infrastructure Provider",
      purpose: "Application edge hosting, TLS termination, serverless telemetry inspection",
    },
  ],
  governingLaw:
    "Republic of India (DPDP Act, 2023) & Applicable Global Frameworks (EU GDPR / UK GDPR)",
  lastUpdated: "2026",
} as const;

export const OPEN_GRIEVANCE_PORTAL_EVENT = "asji_open_grievance_portal";

export function openGrievancePortalModal(
  initialRequestType?: "Access" | "Correction" | "Erasure" | "Grievance",
): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent(OPEN_GRIEVANCE_PORTAL_EVENT, {
        detail: initialRequestType ? { requestType: initialRequestType } : undefined,
      }),
    );
  }
}

export const ITEMIZED_DATA_PROCESSING_NOTICE_TITLE =
  "Itemized Data Processing Notice (DPDP Act Sec. 5 & GDPR Art. 13)";

export const ITEMIZED_DATA_PROCESSING_NOTICE_CONTENT = `STATUTORY NOTICE PURSUANT TO SECTION 5 OF THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 (INDIA) AND ARTICLE 13 OF THE EU GDPR

1. DATA FIDUCIARY / CONTROLLER
ASJi Web and Legal Solution (operating ASJi One — Trust Intelligence)
Jaipur, Rajasthan, India · Contact: hello@asjione.com

2. ITEMIZED PERSONAL DATA & TECHNICAL SIGNALS PROCESSED
• Target Domain / Endpoint Submitted: Processed strictly to resolve public DNS records, inspect TLS/HTTPS negotiation, and retrieve publicly observable HTTP response headers and HTML script references.
• No Private Payload Harvesting: ASJi One never probes authenticated endpoints, private databases, intranet IPs (127.0.0.1, 192.168.x.x), or non-public user records.
• Consent Record Metadata: Timestamp of affirmative authorization stored strictly for statutory auditability if signed in.

3. SPECIFIED PURPOSE & LAWFUL BASIS
• Purpose: Executing your requested technical privacy, header security, and statutory compliance evaluation across 15 global legal mandates.
• Lawful Basis: Affirmative consent under DPDP Act Sec. 6 and performance of a pre-contractual technical service requested by you under GDPR Art. 6(1)(b).

4. TRANSIENT ZERO-RETENTION TELEMETRY HANDLING
Target HTTP/DNS inspection executes ephemerally in sandboxed memory with zero cross-site behavioral tracking, zero resale, and zero unauthorized retention of third-party personal data.

5. MANNER OF EXERCISING RIGHTS & WITHDRAWAL
You may withdraw optional telemetry consent at any time via "Consent Preferences" in the footer, or submit Access, Correction, Erasure, or Grievance requests via our Interactive Data Principal Portal addressed to Arush Sharma (Designated Grievance Officer, hello@asjione.com), resolved within 7 business days.`;

export const NOT_LEGAL_ADVICE =
  "ASJi One provides deterministic technical compliance observations, statutory mappings, and remediation engineering packs. Outputs support institutional governance workflows and do not constitute formal legal advice, legal opinions, or regulatory certification.";

export const AUTHORISATION_NOTICE =
  "I confirm authorization to inspect publicly observable signals of this domain and agree to the Itemized Data Processing Notice.";

export const LEGAL_PAGES = [
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/cookies", label: "Cookie Notice" },
  { to: "/legal/refunds", label: "Refund & Digital Delivery" },
  { to: "/legal/acceptable-use", label: "Acceptable Use Policy" },
  { to: "/legal/security", label: "RFC 9116 security.txt" },
  { to: "/legal/disclaimer", label: "Statutory Safe Harbor" },
] as const;
