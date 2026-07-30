/**
 * Single source of truth for the operator-editable legal details shown across
 * the legal pages. Update these values with your real entity details.
 */
export const LEGAL = {
  operator: "ASJi One",
  legalEntity: "ASJi One (the “Operator”)",
  contactEmail: "legal@asji.one",
  privacyEmail: "privacy@asji.one",
  securityEmail: "security@asji.one",
  grievanceOfficer: "Grievance Officer, ASJi One",
  governingLaw: "India",
  lastUpdated: "28 July 2026",
} as const;

export const NOT_LEGAL_ADVICE =
  "ASJi One provides automated technical compliance assessments. Reports offer actionable guidance for data protection and security teams, and are designed to complement your organization's legal and privacy review processes.";

export const AUTHORISATION_NOTICE =
  "Scans conduct passive, non-intrusive public HTTP inspections to evaluate technical compliance parameters.";

export const LEGAL_PAGES = [
  { to: "/legal/terms", label: "Terms of Service" },
  { to: "/legal/privacy", label: "Privacy Policy" },
  { to: "/legal/cookies", label: "Cookie Notice" },
  { to: "/legal/acceptable-use", label: "Acceptable Use" },
  { to: "/legal/disclaimer", label: "Legal Disclaimer" },
] as const;
