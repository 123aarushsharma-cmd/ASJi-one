/**
 * Single source of truth for operator-editable legal & compliance details.
 */
export const LEGAL = {
  operator: "ASJi One",
  legalEntity: "ASJi Web and Legal Solution",
  contactEmail: "asji.online@gmail.com",
  privacyEmail: "asji.online@gmail.com",
  securityEmail: "asji.online@gmail.com",
  grievanceEmail: "asji.online@gmail.com",
  phoneNumbers: ["+91 8290841179", "+91 9461584298"],
  phoneRaw: ["8290841179", "9461584298"],
  website: {
    domain: "asji.online",
    url: "https://asji.online",
  },
  instagram: {
    handle: "@asjiweblegal",
    url: "https://www.instagram.com/asjiweblegal",
  },
  linkedin: {
    name: "ASJi Web and Legal Solution",
    url: "https://www.linkedin.com/in/asji-web-and-legal-solution-7ab092414",
  },
  grievanceOfficer: {
    name: "Designated Grievance Officer",
    entity: "ASJi Web and Legal Solution",
    email: "asji.online@gmail.com",
    sla: "30 days statutory response window (DPDP Rules, 2025)",
  },
  retentionPolicy:
    "Scan reports and associated technical logs are automatically purged after 12 months.",
  dataProcessors: [
    {
      name: "Google Cloud / Firebase",
      purpose: "Authentication, Firestore database storage, security rules",
    },
    {
      name: "Vercel / Hosting Provider",
      purpose: "Application edge hosting, serverless function execution",
    },
  ],
  governingLaw: "India (DPDP Act, 2023 & DPDP Rules, 2025 + GDPR)",
  lastUpdated: "2026",
} as const;

export const NOT_LEGAL_ADVICE =
  "ASJi One provides technical compliance observations, regulatory mapping, risk insights, and drafting support. Its outputs are intended to support privacy, security, and governance workflows and do not constitute legal advice, legal opinions, regulatory approval, certification, or definitive determinations of legal compliance. Organizations should independently assess applicable legal obligations and obtain professional counsel.";

export const AUTHORISATION_NOTICE =
  "By executing this scan, you confirm authorization to assess the target. ASJi One provides technical compliance observations for governance workflows and does not constitute formal legal advice or regulatory certification.";

export const LEGAL_PAGES = [
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/cookies", label: "Cookie Notice" },
  { to: "/legal/refunds", label: "Refund Policy" },
  { to: "/legal/acceptable-use", label: "Acceptable Use" },
  { to: "/legal/security", label: "Security & security.txt" },
  { to: "/legal/disclaimer", label: "Legal Disclaimer" },
] as const;
