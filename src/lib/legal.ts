/**
 * Single source of truth for the operator-editable legal details shown across
 * the legal pages. Update these values with your real entity details.
 */
export const LEGAL = {
  operator: "ASJi One",
  legalEntity: "ASJi Web and Legal Solution",
  contactEmail: "asji.online@gmail.com",
  privacyEmail: "asji.online@gmail.com",
  securityEmail: "asji.online@gmail.com",
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
  grievanceOfficer: "Grievance Officer, ASJi One",
  governingLaw: "India",
  lastUpdated: "28 July 2026",
} as const;

export const NOT_LEGAL_ADVICE =
  "ASJi One provides technical compliance intelligence, regulatory mapping, risk-oriented insights, and compliance-focused drafting assistance. Its outputs are intended to support privacy, security, governance, and compliance workflows and do not constitute legal advice, a legal opinion, regulatory approval, certification, or a definitive determination of legal compliance. Organizations should independently assess their applicable legal obligations and obtain professional legal advice where appropriate.";

export const AUTHORISATION_NOTICE =
  "By executing this scan, you confirm authorization to assess the target. ASJi One provides technical compliance intelligence and regulatory mapping for governance workflows, and does not constitute formal legal advice or regulatory certification.";

export const LEGAL_PAGES = [
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/cookies", label: "Cookie Notice" },
  { to: "/legal/acceptable-use", label: "Acceptable Use" },
  { to: "/legal/security", label: "Security & security.txt" },
  { to: "/legal/disclaimer", label: "Legal Disclaimer" },
] as const;
