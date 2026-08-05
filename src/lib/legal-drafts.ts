export type LegalDraft = {
  id: string;
  tag: string;
  jurisdiction: string;
  titleHeader: string;
  bodyText: string;
  badge: string;
};

export const interactiveLegalDrafts: LegalDraft[] = [
  {
    id: "ind-dpdp",
    tag: "IND-DPDP",
    jurisdiction: "India (DPDP Act 2023)",
    badge: "Section 6 Compliance",
    titleHeader:
      "Statutory Itemized Notice & Consent Log Architecture // Sec 6 India DPDP Act 2023",
    bodyText: `FORM-A: SPECIFIC DATA INTAKE CONSENT ACQUISITION PROTOCOL

1. IDENTIFICATION OF PERSONAL DATA CATEGORIES: This platform explicitly captures client network TCP/IP endpoints, hardware telemetry configurations, and localized metadata arrays.

2. EXPLICIT PROCESSING OPERATIONS: Captured metadata fields are parsed solely for browser cache session optimization and network event verification.

3. RECIPIENT DATA DISCLOSURE TRACKS: Absolute zero unauthorized third-party tracking pixels or Meta analytics cookies initialize before preference verification tokens validate.

4. DATA PRINCIPAL RIGHTS ARCHITECTURE: Users retain unconditional rights to correct inaccuracies, erase user logs under Section 11, or withdraw processing consent via our cryptographic client-side toggle interface.`,
  },
  {
    id: "ae-pdpl",
    tag: "AE-PDPL",
    jurisdiction: "UAE (Decree-Law No. 45)",
    badge: "Article 5 Multilingual",
    titleHeader: "Dynamic Localization Consent Structure // UAE Federal Decree-Law No. 45",
    bodyText: `ملحق الامتثال لحماية البيانات - دولة الإمارات العربية المتحدة

1. NOTIFICATION OF DYNAMIC LOGGING: In strict adherence to Article 5 of the UAE PDPL, this interface executes a client-side transport layer trace. Data processing operates strictly over sandboxed memory states with absolute zero unauthorized cross-border metadata routing.

2. STATUTORY OPT-IN MANDATE: Third-party pixel architectures and event tracking pipelines remain structurally flat-blocked in an inactive state until the user provides a positive affirmative action signature.

3. INFRASTRUCTURE PRIVACY CLEARANCE: Complete serverless enforcement of automated HSTS response headers to protect active digital transaction logs from external session sniffing vectors.`,
  },
  {
    id: "eu-gdpr",
    tag: "EU-GDPR",
    jurisdiction: "Europe (GDPR / Irish DPC)",
    badge: "Article 30 Standard",
    titleHeader:
      "Sovereign Privacy-by-Design Data Retention Policy // EU GDPR & Irish DPC Compliance",
    bodyText: `ARTICLE 30 REGULATORY PROCESSING INVENTORY STANDARD

1. DATA MINIMIZATION DIRECTIVE: Baseline data ingestion models filter and isolate client behavior strings at the local browser state tier. All external script tracking functions process anonymized telemetry arrays only.

2. LIFECYCLE MEMORY EXPIRATION BOUNDS: User session variables and analytic tokens initialize with a rigid 24-hour hardware expiration script loop, completely purging local storage repositories post-session validation.

3. STRATIFIED AUDIT VERIFICATION: In the event of statutory compliance validation reviews, this infrastructure generates a cryptographically hashed, un-editable system configuration ledger.`,
  },
];
