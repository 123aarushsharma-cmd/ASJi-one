export type LegalDraftArticle = {
  title: string;
  ref: string;
  desc: string;
};

export type LegalDraft = {
  id: string;
  tag: string;
  flag: string;
  jurisdiction: string;
  region: "Asia-Pacific" | "Middle East" | "Europe & UK" | "Americas";
  governingBody: string;
  statutoryReference: string;
  statutoryPenalty: string;
  badge: string;
  titleHeader: string;
  executiveSummary: string;
  keyArticles: LegalDraftArticle[];
  bodyText: string;
};

export const interactiveLegalDrafts: LegalDraft[] = [
  // 1. INDIA - DPDP ACT 2023
  {
    id: "ind-dpdp",
    tag: "IND-DPDP",
    flag: "🇮🇳",
    jurisdiction: "India (DPDP Act 2023 & Draft Rules 2025)",
    region: "Asia-Pacific",
    governingBody: "Data Protection Board of India (DPBI) / MeitY",
    statutoryReference: "Sections 4, 5, 6, 8, 9, 11, 12, 13 & Schedule, DPDP Act 2023",
    statutoryPenalty: "Up to ₹250 Crore (approx. $30M USD) per statutory breach",
    badge: "Sec 5 & 6 Itemized Notice Architecture",
    titleHeader:
      "Statutory Itemized Notice, Consent Architecture & Grievance Redressal Addendum // Digital Personal Data Protection Act 2023",
    executiveSummary:
      "Mandatory bilingual itemized notice and granular consent capture protocol under Sections 5 & 6 of the Indian DPDP Act 2023, establishing explicit processing purposes, Data Principal rights under Sections 11–13, child data protections under Section 9, and Data Protection Board of India (DPBI) escalation channels.",
    keyArticles: [
      {
        title: "Itemized Notice at Collection",
        ref: "Section 5(1) & 5(2)",
        desc: "Mandates standalone clear and plain language notice detailing specific personal data categories, exact purpose of processing, and DPO grievance redressal details before or during consent acquisition.",
      },
      {
        title: "Unconditional Consent Architecture",
        ref: "Section 6(1) & 6(4)",
        desc: "Consent must be free, specific, informed, unconditional, and unambiguous with an affirmative action; withdrawal of consent must be as easy as giving consent.",
      },
      {
        title: "Protection of Children & Disabled Persons",
        ref: "Section 9(1)–9(3)",
        desc: "Absolute bar on tracking, behavioral monitoring, or targeted advertising directed at children under 18 without verifiable parental consent.",
      },
      {
        title: "Statutory Grievance Redressal Protocol",
        ref: "Section 13 & DPBI Rules",
        desc: "Requires accessible, time-bound grievance redressal within 30 days before statutory escalation to the Data Protection Board of India.",
      },
    ],
    bodyText: `================================================================================
STATUTORY COMPLIANCE ADDENDUM & DATA INTAKE CONSENT INSTRUMENT
PURSUANT TO THE DIGITAL PERSONAL DATA PROTECTION ACT, 2023 (ACT NO. 22 OF 2023)
AND THE DRAFT DIGITAL PERSONAL DATA PROTECTION RULES, 2025
================================================================================

JURISDICTION: Republic of India
GOVERNING AUTHORITY: Data Protection Board of India (DPBI) / Ministry of Electronics and Information Technology (MeitY)
CLASSIFICATION: Statutory Legal Notice & Data Principal Rights Framework
EFFECTIVE ENFORCEMENT DATE: Current Operating Session

--------------------------------------------------------------------------------
1. STATUTORY PREAMBLE & APPLICABILITY (SECTION 4 & 5)
--------------------------------------------------------------------------------
This Statutory Consent Instrument and Itemized Notice is issued by the Data Fiduciary ("Entity", "We", "Us") to all Data Principals ("Users", "You") whose digital personal data is collected, stored, processed, or transferred within the territory of India, or outside India in connection with any activity related to offering goods or services to Data Principals within India, in strict conformance with Section 4(1) and Section 5(1) of the Digital Personal Data Protection Act, 2023.

सूचना (Notice in 8th Schedule Language - Hindi Preamble):
"यह नोटिस डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम, 2023 की धारा 5 के अंतर्गत जारी किया गया है। आपके व्यक्तिगत डेटा को केवल आपकी स्पष्ट, सूचित एवं सुसंगत सहमति के आधार पर निर्दिष्ट वैध उद्देश्यों के लिए संसाधित किया जाएगा।"

--------------------------------------------------------------------------------
2. ITEMIZED DATA INGESTION & PROCESSING PURPOSES (SECTION 5(1))
--------------------------------------------------------------------------------
In accordance with Section 5(1)(a), the Data Fiduciary explicitly identifies the following categories of personal data collected and the precise purpose for each processing operation:

[Category A: Technical & Network Identifiers]
- Ingested Data: Client public IPv4/IPv6 address, TLS cipher negotiation tokens, User-Agent strings, and transport layer telemetry.
- Lawful Purpose: Ephemeral packet routing, transport security verification (HSTS validation), prevention of unauthorized system access, and cybersecurity incident forensics.
- Retention Boundary: Retained in ephemeral memory for the duration of the active TCP/TLS session, purged within 24 hours unless required for statutory cyber incident reporting under CERT-In directions.

[Category B: Session State & Cookie Architecture]
- Ingested Data: Strictly necessary session tokens, CSRF validation tokens, and cryptographic consent state logs.
- Pre-Consent Bar: Zero third-party behavioral analytics, pixel trackers (e.g. Meta Pixel, TikTok Pixel, Google Ads remarketing) or cross-site tracking scripts shall initialize prior to the recording of an unambiguous affirmative consent token.

[Category C: User-Submitted Data & Corporate Domains]
- Ingested Data: Uniform Resource Locators (URLs), domain names, corporate contact emails, and public transport data.
- Lawful Purpose: Automated compliance scanning, sovereign privacy posture evaluation, and generation of verifiable technical audit certifications.

--------------------------------------------------------------------------------
3. CONSENT ACQUISITION & WITHDRAWAL MECHANISM (SECTION 6)
--------------------------------------------------------------------------------
3.1. Quality of Consent (Sec 6(1)): Every consent requested herein is free, specific, informed, unconditional, and unambiguous with an affirmative action, strictly segregated from general service agreements or terms of use.
3.2. Withdrawal Protocol (Sec 6(4)): The Data Principal retains the unalienable right to withdraw consent at any time through the designated Consent Manager or client-side privacy dashboard. The withdrawal of consent shall be as effortless and rapid as the giving of consent.
3.3. Cessation of Processing (Sec 6(6)): Upon receipt of notice of withdrawal, the Data Fiduciary and all designated Data Processors shall cease all processing operations and permanently erase all associated personal data within 72 hours, unless retention is mandated under any other statutory law in force in India.

--------------------------------------------------------------------------------
4. OBLIGATIONS OF THE DATA FIDUCIARY (SECTION 8 & 9)
--------------------------------------------------------------------------------
4.1. Security Safeguards (Sec 8(5)): The Data Fiduciary implements reasonable security safeguards including end-to-end TLS 1.3 encryption, Content Security Policy (CSP) enforcement, subresource integrity verification, and strict access controls to prevent data breaches.
4.2. Breach Notification Mandate (Sec 8(6)): In the event of a personal data breach, the Data Fiduciary shall immediately intimate the Data Protection Board of India (DPBI) and each affected Data Principal in such form and manner as prescribed under the DPDP Rules.
4.3. Protection of Children (Sec 9): No tracking, behavioral monitoring, or targeted advertising directed at children under the age of eighteen (18) years shall be undertaken. Verifiable parental consent shall be obtained prior to processing any child data.

--------------------------------------------------------------------------------
5. DATA PRINCIPAL RIGHTS ARCHITECTURE (SECTIONS 11, 12 & 13)
--------------------------------------------------------------------------------
Every Data Principal has the right to:
(a) Right to Access Information (Sec 11): Obtain a clear summary of personal data processed, identities of all Data Fiduciaries/Processors with whom data has been shared, and any other prescribed particulars.
(b) Right to Correction & Erasure (Sec 12): Request correction of misleading or inaccurate personal data, completion of incomplete data, and permanent erasure of data no longer necessary for the specified purpose.
(c) Right of Grievance Redressal (Sec 13): Register formal complaints with the Grievance Redressal Officer (GRO) before escalating to the Board.
(d) Right to Nominate (Sec 14): Nominate another individual to exercise Data Principal rights in the event of death or incapacity.

--------------------------------------------------------------------------------
6. STATUTORY GRIEVANCE REDRESSAL OFFICER & DPBI ESCALATION (SECTION 13)
--------------------------------------------------------------------------------
Designated Grievance Redressal Officer (GRO):
- Directorate: ASJi One Sovereign Privacy & Compliance Directorate
- Physical Address: Cyber Technology Park, Jaipur, Rajasthan 302017, India
- Dedicated Statutory Email: compliance@asji.legal / grievance@asji.one
- Response SLA: Formal acknowledgment within 24 hours; resolution within 30 days.

Appellate Authority:
If not satisfied with the GRO resolution, the Data Principal may file an appeal before the Data Protection Board of India (DPBI) under Section 15 of the DPDP Act 2023.

PENALTY NOTICE (SCHEDULE TO THE ACT):
Failure to implement reasonable security safeguards under Section 8(5) carries statutory penalties up to ₹250 Crore. Failure to notify DPBI of a data breach carries penalties up to ₹200 Crore. Non-compliance with child data provisions carries penalties up to ₹200 Crore.`,
  },

  // 2. UAE - FEDERAL DECREE-LAW NO. 45 OF 2021 (PDPL)
  {
    id: "ae-pdpl",
    tag: "AE-PDPL",
    flag: "🇦🇪",
    jurisdiction: "United Arab Emirates (Federal Decree-Law No. 45 of 2021)",
    region: "Middle East",
    governingBody:
      "UAE Data Office / Telecommunications and Digital Government Regulatory Authority (TDRA)",
    statutoryReference:
      "Articles 4, 5, 6, 7, 13, 14, 15, 18, 22 & 23, Federal Decree-Law No. 45/2021",
    statutoryPenalty:
      "Up to AED 15,000,000 in statutory administrative fines and operational sanctions",
    badge: "Article 5 & 6 Multilingual Notice",
    titleHeader:
      "Sovereign Data Controller Cross-Border & Multilingual Processing Notice // UAE Federal Decree-Law No. 45 of 2021 (PDPL)",
    executiveSummary:
      "Official bilingual Arabic and English statutory processing notice and cross-border data transfer framework under UAE Federal Decree-Law No. 45 of 2021, establishing lawful processing controls under Articles 5 & 6, data subject rights under Articles 13–15, and strict international transfer controls under Articles 22 & 23.",
    keyArticles: [
      {
        title: "General Processing Principles",
        ref: "Article 5",
        desc: "Mandates fairness, transparency, purpose limitation, data minimization, accuracy, storage limitation, and robust technical confidentiality across all processing operations.",
      },
      {
        title: "Consent & Processing Controls",
        ref: "Article 6 & 7",
        desc: "Explicit, clear, and unambiguous affirmative consent required prior to processing personal data, with unconditional right to revoke consent at any moment.",
      },
      {
        title: "Data Subject Rights Architecture",
        ref: "Articles 13, 14 & 15",
        desc: "Grants data subjects the right to access, right to stop processing, right to erasure, right to rectification, and right to automated decision review.",
      },
      {
        title: "Cross-Border Data Transfer Safeguards",
        ref: "Articles 22 & 23",
        desc: "Strict prohibition on transferring personal data outside the UAE unless the destination jurisdiction provides an adequate level of protection or approved standard contractual clauses apply.",
      },
    ],
    bodyText: `================================================================================
ملحق الامتثال لحماية البيانات الشخصية وفقاً للمرسوم بقانون اتحادي رقم (45) لسنة 2021
STATUTORY PERSONAL DATA PROTECTION COMPLIANCE CHARTER & NOTICE
PURSUANT TO UAE FEDERAL DECREE-LAW NO. (45) OF 2021 ON THE PROTECTION OF PERSONAL DATA
================================================================================

JURISDICTION: United Arab Emirates (UAE)
SUPERVISORY BODY: UAE Data Office (مكتب الإمارات للبيانات) / TDRA
REGULATORY INSTRUMENT: Federal Decree-Law No. (45) of 2021 & Executive Regulations
CLASSIFICATION: Sovereign Cross-Border Controller Disclosure & Consent Framework

--------------------------------------------------------------------------------
1. STATUTORY DECLARATION & SCOPE (ARTICLE 2 & 4)
--------------------------------------------------------------------------------
بموجب أحكام المرسوم بقانون اتحادي رقم (45) لسنة 2021 في شأن حماية البيانات الشخصية، تلتزم هذه المنصة بتطبيق أعلى معايير الخصوصية والشفافية والحوكمة الرقمية لجميع أصحاب البيانات داخل دولة الإمارات العربية المتحدة وخارجها.

This Data Protection Charter governs the processing of personal data belonging to Data Subjects residing in or accessing digital services within the United Arab Emirates. The Data Controller guarantees that all collection, storage, transfer, and processing operations strictly align with the principles of sovereignty, confidentiality, and data minimization.

--------------------------------------------------------------------------------
2. GENERAL PRINCIPLES FOR PROCESSING PERSONAL DATA (ARTICLE 5)
--------------------------------------------------------------------------------
In compliance with Article 5 of the UAE PDPL, personal data is processed strictly in accordance with the following mandatory statutory tenets:
1. Fairness, Transparency, and Lawfulness: Data is processed fairly, transparently, and lawfully for explicitly declared legitimate purposes.
2. Purpose Limitation: Personal data collected for a specified purpose shall not be processed in a manner incompatible with that purpose.
3. Data Minimization & Proportionality: Processing is restricted to the minimum extent necessary to achieve the declared objective.
4. Accuracy & Currency: Data is kept accurate and updated, with immediate erasure or rectification of obsolete metadata.
5. Storage Limitation: Personal data shall not be retained after the expiry of the purpose for which it was collected.
6. Technical Security & Integrity (Article 18): Implementation of state-of-the-art cryptographic measures (TLS 1.3, CSP, HSTS) to protect against unauthorized access, destruction, or alteration.

--------------------------------------------------------------------------------
3. LAWFUL BASIS & CONSENT ACQUISITION (ARTICLE 6)
--------------------------------------------------------------------------------
3.1. Affirmative Consent Requirement: Except where processing is strictly necessary to perform a contract, fulfill a legal obligation, or protect vital public interests, personal data shall only be processed upon obtaining explicit, clear, and unambiguous affirmative consent from the Data Subject.
3.2. Cookie & Telemetry Gatekeeper: Third-party analytics scripts, pixels, and tracking cookies are flat-blocked by default at the gateway level. No profiling or telemetry arrays execute prior to affirmative user action.
3.3. Revocation of Consent: The Data Subject has the unconditional right to withdraw consent at any time via our automated client-side interface. The withdrawal shall take effect immediately without retroactive penalty.

--------------------------------------------------------------------------------
4. CROSS-BORDER DATA TRANSFER RESTRICTIONS (ARTICLES 22 & 23)
--------------------------------------------------------------------------------
4.1. Adequate Jurisdictions (Article 22): Personal data may only be transferred outside the UAE if the recipient state provides an adequate level of data protection officially recognized by the UAE Data Office.
4.2. Standard Contractual Clauses (Article 23): In the absence of an adequacy decision, cross-border transmission of data is strictly conditioned upon binding standard contractual clauses, explicit data subject consent, and verified end-to-end payload encryption.
4.3. Sovereign Telemetry Routing: All audit requests initiated from the UAE are routed through hardened sovereign transit nodes ensuring complete metadata isolation.

--------------------------------------------------------------------------------
5. STATUTORY RIGHTS OF THE DATA SUBJECT (ARTICLES 13–17)
--------------------------------------------------------------------------------
Under the UAE PDPL, Data Subjects possess the following non-negotiable statutory entitlements:
- Article 13 (Right to Access): Right to obtain confirmation of whether personal data is being processed, details of recipients, and copies of all held records.
- Article 14 (Right to Cease Processing): Right to object to and immediately halt processing where data is used for direct marketing or automated profiling.
- Article 15 (Right to Erasure / Right to be Forgotten): Right to request permanent deletion of personal data when consent is withdrawn or purpose ceases.
- Article 16 (Right to Rectification): Right to demand immediate correction of inaccurate or incomplete personal records.
- Article 17 (Right to Data Portability): Right to receive personal data in a structured, machine-readable format.

--------------------------------------------------------------------------------
6. DATA PROTECTION OFFICER & SUPERVISORY REPORTING (ARTICLE 10 & 19)
--------------------------------------------------------------------------------
Data Protection Officer (DPO) Contact Details:
- Authority: ASJi Middle East Compliance Bureau
- Physical Presence: Dubai International Financial Centre (DIFC) / Abu Dhabi Global Market (ADGM) Liaison
- Contact Email: uae-compliance@asji.legal / dpo-middleeast@asji.one
- Breach Notification Protocol: Mandatory reporting to the UAE Data Office within prescribed statutory deadlines in the event of any unauthorized data disclosure.

PENALTIES & ENFORCEMENT:
Violations of Federal Decree-Law No. 45/2021 are subject to administrative fines up to AED 15,000,000, temporary or permanent suspension of data processing licenses, and mandatory system audits ordered by the UAE Data Office.`,
  },

  // 3. EUROPE - EU GDPR & UK GDPR
  {
    id: "eu-gdpr",
    tag: "EU-GDPR",
    flag: "🇪🇺",
    jurisdiction: "European Union & United Kingdom (GDPR / UK DPA 2018)",
    region: "Europe & UK",
    governingBody:
      "European Data Protection Board (EDPB) / National DPAs (Irish DPC, CNIL, BfDI) / UK ICO",
    statutoryReference:
      "Articles 5, 6, 12, 13, 14, 28, 30, 32, 33, 34, 44–49 & Chapter III, Regulation (EU) 2016/679",
    statutoryPenalty:
      "Up to €20,000,000 or 4% of total worldwide annual turnover (whichever is higher)",
    badge: "Article 28 DPA & Art 30 ROPA Standard",
    titleHeader:
      "Standard Data Processing Addendum (DPA) & Privacy-by-Design Technical Disclosure // EU GDPR (Regulation 2016/679) & UK GDPR",
    executiveSummary:
      "Comprehensive B2B Data Processing Addendum (DPA) incorporating EU Standard Contractual Clauses (SCCs), Article 30 Records of Processing Activities (ROPA), Article 32 Technical and Organizational Measures (TOMs), Article 33/34 72-Hour Breach Notification protocols, and Chapter III Data Subject Rights.",
    keyArticles: [
      {
        title: "Lawfulness of Processing",
        ref: "Article 6(1)(a)–(f)",
        desc: "All personal data processing must be anchored in an explicit legal basis: valid consent, contract execution, legal compliance, or documented legitimate interests.",
      },
      {
        title: "Data Processing Agreement (DPA)",
        ref: "Article 28(3)",
        desc: "Binding statutory contract requiring Data Processors to act solely on documented instructions, ensure confidentiality, implement TOMs, and assist in DSAR fulfillment.",
      },
      {
        title: "Technical & Organizational Measures (TOMs)",
        ref: "Article 32",
        desc: "State-of-the-art security mandates including pseudonymization, TLS 1.3 transport encryption, CSP headers, vulnerability management, and regular security testing.",
      },
      {
        title: "Mandatory 72-Hour Breach Notification",
        ref: "Articles 33 & 34",
        desc: "Obligation to notify the lead Supervisory Authority (e.g., Irish DPC) within 72 hours of becoming aware of a personal data breach posing risk to individuals.",
      },
    ],
    bodyText: `================================================================================
STANDARD DATA PROCESSING ADDENDUM (DPA) & TECHNICAL COMPLIANCE SCHEDULE
PURSUANT TO ARTICLE 28 OF REGULATION (EU) 2016/679 (GENERAL DATA PROTECTION REGULATION - GDPR)
AND THE DATA PROTECTION ACT 2018 (UK GDPR)
================================================================================

JURISDICTION: European Economic Area (EEA) / United Kingdom (UK)
LEAD SUPERVISORY BODIES: European Data Protection Board (EDPB), Irish DPC, CNIL France, BfDI Germany, UK Information Commissioner's Office (ICO)
INSTRUMENT: B2B Data Processing Addendum incorporating Standard Contractual Clauses (SCCs)

--------------------------------------------------------------------------------
1. DEFINITIONS & SCOPE OF ENGAGEMENT (ARTICLE 4 & 28)
--------------------------------------------------------------------------------
1.1. "Controller", "Processor", "Data Subject", "Personal Data", "Personal Data Breach", and "Processing" shall have the statutory meanings ascribed in Article 4 of the GDPR.
1.2. Scope: This Addendum applies to all processing of personal data originating within the EEA, Switzerland, or the UK in connection with the provision of automated compliance scanning and technical regulatory audit infrastructure.
1.3. Documented Instructions: The Processor shall process personal data exclusively upon documented instructions from the Controller, including with regard to transfers of personal data to a third country or international organization.

--------------------------------------------------------------------------------
2. RECORD OF PROCESSING ACTIVITIES (ROPA - ARTICLE 30)
--------------------------------------------------------------------------------
In satisfaction of Article 30(1) & 30(2) GDPR, the following processing inventory is permanently cataloged:
(a) Subject-Matter: Automated transport layer diagnostics, HTTPS security header validation, privacy notice verification, and compliance posture benchmarking.
(b) Categories of Data Subjects: Authorized client representatives, web administrators, and general end-users initiating passive technical audits.
(c) Categories of Personal Data: IP addresses, transport headers, ephemeral session identifiers, cookie parameters, and public statutory policy URLs.
(d) Duration: Transient memory processing for active audit duration; automated purge executed within 24 hours unless persistent enterprise reporting is explicitly saved by the Controller.

--------------------------------------------------------------------------------
3. TECHNICAL AND ORGANIZATIONAL MEASURES (TOMS - ARTICLE 32)
--------------------------------------------------------------------------------
The Processor guarantees implementation of rigorous technical and organizational measures to ensure a level of security appropriate to the risk, including:
(a) Cryptographic Protection: Strict enforcement of TLS 1.3 / HSTS with strong cipher suites; end-to-end AES-256 payload encryption at rest.
(b) Boundary & Injection Hardening: Implementation of strict Content Security Policy (CSP), X-Frame-Options (DENY), X-Content-Type-Options (nosniff), and Referrer-Policy headers.
(c) Pseudonymization & Minimization: IP address masking and irreversible hashing of diagnostic traces to prevent persistent user profiling.
(d) Resilience & Redundancy: Automated container fault recovery, multi-zone sovereign deployment nodes, and continuous vulnerability remediation pipelines.

--------------------------------------------------------------------------------
4. SUB-PROCESSORS & CROSS-BORDER TRANSFERS (ARTICLES 28(2) & 44–49)
--------------------------------------------------------------------------------
4.1. Prior Authorization: The Processor shall not engage any sub-processor without prior specific or general written authorization of the Controller.
4.2. Flow-Down Obligations: Where a sub-processor is engaged, identical data protection obligations as set out in this DPA shall be imposed upon that sub-processor by way of binding contract.
4.3. International Data Transfers: Any transfer of personal data outside the EEA/UK to a third country lacking an Adequacy Decision under Article 45 shall be governed strictly by the European Commission's Standard Contractual Clauses (Module 2: Controller-to-Processor / Module 3: Processor-to-Processor) pursuant to Article 46(2)(c).

--------------------------------------------------------------------------------
5. DATA SUBJECT RIGHTS ASSISTANCE (CHAPTER III, ARTICLES 15–22)
--------------------------------------------------------------------------------
Taking into account the nature of processing, the Processor shall assist the Controller by appropriate technical and organizational measures in fulfilling the Controller's statutory obligation to respond to Data Subject Requests (DSARs):
- Article 15: Right of Access by the Data Subject
- Article 16: Right to Rectification
- Article 17: Right to Erasure ("Right to be Forgotten")
- Article 18: Right to Restriction of Processing
- Article 20: Right to Data Portability (JSON / CSV structured export)
- Article 21: Right to Object to automated processing and profiling

--------------------------------------------------------------------------------
6. INCIDENT MANAGEMENT & 72-HOUR NOTIFICATION (ARTICLES 33 & 34)
--------------------------------------------------------------------------------
6.1. Immediate Notice: The Processor shall notify the Controller without undue delay, and in any event within thirty-six (36) hours, upon becoming aware of a confirmed or reasonably suspected Personal Data Breach.
6.2. Notice Contents: The notification shall describe the nature of the breach, categories and approximate number of data subjects concerned, likely consequences, and remediation measures undertaken.

--------------------------------------------------------------------------------
7. AUDIT RIGHTS, TERMINATION & STATUTORY PENALTIES (ARTICLES 28(3)(h) & 83)
--------------------------------------------------------------------------------
7.1. Audits: The Processor shall make available to the Controller all information necessary to demonstrate compliance with Article 28 and allow for and contribute to audits conducted by the Controller or an independent auditor.
7.2. Deletion on Termination: At the choice of the Controller, the Processor shall permanently delete or return all personal data upon completion of services.

STATUTORY PENALTIES (ARTICLE 83):
Infringements of the core principles of processing, data subject rights, or cross-border transfer requirements are subject to administrative fines up to €20,000,000 or 4% of total worldwide annual turnover of the preceding financial year.`,
  },

  // 4. UNITED STATES - CCPA / CPRA & MULTI-STATE LAWS
  {
    id: "us-cpra",
    tag: "US-CPRA",
    flag: "🇺🇸",
    jurisdiction: "United States (California CCPA / CPRA & Comprehensive State Privacy Acts)",
    region: "Americas",
    governingBody:
      "California Privacy Protection Agency (CPPA) / California Attorney General / Multi-State AGs",
    statutoryReference:
      "California Civil Code § 1798.100 et seq. (CCPA as amended by CPRA), CCR Title 11 Div 6",
    statutoryPenalty:
      "Up to $7,500 per intentional violation; statutory private right of action for data breaches ($100–$750/consumer)",
    badge: "§ 1798.135 DNSMPI Notice Architecture",
    titleHeader:
      "Comprehensive Notice at Collection, 'Do Not Sell or Share My Info' & Global Privacy Control (GPC) Addendum // CCPA/CPRA",
    executiveSummary:
      "Statutory Notice at Collection and Consumer Privacy Rights disclosures under the California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA), incorporating mandatory 'Do Not Sell or Share My Personal Information' controls, automated Global Privacy Control (GPC) signal recognition, and Sensitive Personal Information limitations.",
    keyArticles: [
      {
        title: "Notice at Collection",
        ref: "Cal. Civ. Code § 1798.100(b)",
        desc: "Mandatory prominent notice at or before the point of collection detailing categories of personal information collected, purposes of use, and retention criteria.",
      },
      {
        title: "Do Not Sell or Share My Personal Information",
        ref: "Cal. Civ. Code § 1798.120 & § 1798.135",
        desc: "Clear and conspicuous link allowing consumers to opt out of the sale or sharing of their personal information for cross-context behavioral advertising.",
      },
      {
        title: "Global Privacy Control (GPC) Binding",
        ref: "11 CCR § 7025",
        desc: "Automated browser opt-out signals (Sec-GPC header) must be treated as a legally valid, friction-free opt-out of sale/sharing without requiring additional verification.",
      },
      {
        title: "Limit Sensitive Personal Information (SPI)",
        ref: "Cal. Civ. Code § 1798.121",
        desc: "Right to direct businesses to limit the use of Sensitive Personal Information to only what is necessary to perform services reasonably expected by an average consumer.",
      },
    ],
    bodyText: `================================================================================
CALIFORNIA CONSUMER PRIVACY ACT (CCPA/CPRA) STATUTORY NOTICE AT COLLECTION
AND CORPORATE PRIVACY RIGHTS DISCLOSURE SCHEDULE
PURSUANT TO CAL. CIV. CODE § 1798.100 ET SEQ. AND 11 CCR § 7000 ET SEQ.
================================================================================

JURISDICTION: State of California / United States Multi-State Frameworks (VCDPA, CPA, CTDPA, UCPA, TDPSA)
ENFORCEMENT BODY: California Privacy Protection Agency (CPPA) / Office of the Attorney General
STATUTORY STANDARD: Notice at Collection, Universal Opt-Out Preference Signal (GPC), and Service Provider Addendum

--------------------------------------------------------------------------------
1. NOTICE AT COLLECTION OF PERSONAL INFORMATION (§ 1798.100(b))
--------------------------------------------------------------------------------
This Notice at Collection applies to California residents ("Consumers") and informs you of the categories of Personal Information collected, the business purposes for which such information is utilized, and the criteria used to determine retention periods.

CATEGORIES OF PERSONAL INFORMATION COLLECTED (PAST 12 MONTHS):
Category A: Identifiers (IP address, device hardware identifiers, session tokens, domain names).
- Business Purpose: Service delivery, transport diagnostic scanning, rate-limiting, and network intrusion prevention.
- Sold or Shared: NO. We do not sell or share Category A data for cross-context behavioral advertising.

Category B: Internet or Other Electronic Network Activity Information (Browsing interactions, HTTP/HTTPS response telemetry, security header evaluation data).
- Business Purpose: Automated compliance report compilation, benchmark analytics, and technical auditing.
- Sold or Shared: NO.

Category C: Inferences & Diagnostic Scores (Deterministic compliance calculations, risk matrices).
- Business Purpose: Generating verifiable enterprise compliance intelligence.
- Sold or Shared: NO.

--------------------------------------------------------------------------------
2. "DO NOT SELL OR SHARE MY PERSONAL INFORMATION" (DNSMPI - § 1798.120 & § 1798.135)
--------------------------------------------------------------------------------
2.1. Statutory Opt-Out Guarantee: Under Cal. Civ. Code § 1798.120, consumers have the absolute right to direct a business that sells or shares personal information to cease doing so.
2.2. Zero Third-Party Monetization: We do NOT sell personal information to data brokers, nor do we share consumer personal information with third parties for cross-context behavioral advertising.
2.3. Friction-Free Opt-Out Mechanism: Consumers may execute an opt-out request at any time via the dedicated "Do Not Sell or Share My Personal Info" interactive toggle located in the platform footer.

--------------------------------------------------------------------------------
3. AUTOMATED GLOBAL PRIVACY CONTROL (GPC) SIGNAL RECOGNITION (11 CCR § 7025)
--------------------------------------------------------------------------------
In strict compliance with 11 CCR § 7025, our server infrastructure actively detects and honours the Universal Opt-Out Preference Signal, including the Global Privacy Control (GPC) broadcast via HTTP headers (Sec-GPC: 1) or browser JavaScript DOM properties:
- Automatic Application: When a GPC signal is detected, the platform automatically suppresses all non-essential analytics and cookie writes without displaying deceptive confirmation dialogs.
- Frictionless Processing: GPC signals apply immediately at the browser/device level and are recorded as a verified statutory opt-out.

--------------------------------------------------------------------------------
4. SENSITIVE PERSONAL INFORMATION LIMITATION (§ 1798.121)
--------------------------------------------------------------------------------
We do not collect or process Sensitive Personal Information (SPI) for purposes other than performing the services reasonably expected by an average consumer requesting such services. Therefore, the "Limit the Use of My Sensitive Personal Information" link is maintained as a pre-fulfilled compliance state.

--------------------------------------------------------------------------------
5. CONSUMER PRIVACY RIGHTS CATALOG (§ 1798.100, § 1798.105, § 1798.106, § 1798.125)
--------------------------------------------------------------------------------
California consumers possess the following enforceable statutory rights:
1. Right to Know & Access (§ 1798.100): Right to request disclosure of categories of personal information collected, sources, business purposes, and specific pieces of data held.
2. Right to Delete (§ 1798.105): Right to request deletion of personal information collected from the consumer, subject to statutory exceptions (security, legal compliance).
3. Right to Correct Inaccurate Personal Information (§ 1798.106): Right to request correction of inaccurate records maintained by the business.
4. Right to Non-Discrimination (§ 1798.125): A business shall not discriminate against a consumer because the consumer exercised any rights under the CCPA/CPRA.

--------------------------------------------------------------------------------
6. VERIFIED CONSUMER REQUEST (VCR) SUBMISSION & TIMELINES
--------------------------------------------------------------------------------
To exercise any CCPA/CPRA rights, consumers may submit a verifiable request:
- Online Portal: https://asji.one/privacy/ccpa-dsar
- Privacy Agent Contact: privacy-us@asji.legal / toll-free verified dispatch channel
- Response Timeline: Acknowledgment within 10 business days; substantive response provided within 45 calendar days (extendable by 45 days where reasonably necessary).

ENFORCEMENT & STATUTORY FINES:
Civil penalties up to $7,500 per intentional violation enforced by the California Privacy Protection Agency (CPPA) or California Attorney General. Private right of action under § 1798.150 for data breaches resulting from failure to maintain reasonable security procedures ($100 to $750 per consumer per incident).`,
  },

  // 5. SINGAPORE - PDPA 2012 (AMENDED 2020)
  {
    id: "sg-pdpa",
    tag: "SG-PDPA",
    flag: "🇸🇬",
    jurisdiction: "Singapore (Personal Data Protection Act 2012 / Amended 2020)",
    region: "Asia-Pacific",
    governingBody: "Personal Data Protection Commission (PDPC Singapore)",
    statutoryReference:
      "Sections 11–26 & Part VIA (Mandatory Data Breach Notification), Singapore PDPA 2012",
    statutoryPenalty:
      "Up to SGD $1,000,000 or 10% of annual turnover in Singapore (whichever is higher)",
    badge: "Part IV & VIA Breach Notification Standard",
    titleHeader:
      "Statutory Personal Data Protection & Mandatory 72-Hour Data Breach Protocol // Singapore PDPA 2012 (Amended 2020)",
    executiveSummary:
      "Statutory compliance charter adhering to the 11 Data Protection Obligations under the Singapore Personal Data Protection Act 2012, featuring mandatory 72-hour Data Breach Notification protocols under Part VIA, Transfer Limitation rules under Section 26, and Data Protection Officer (DPO) governance under Section 11(3).",
    keyArticles: [
      {
        title: "Consent, Purpose & Notification",
        ref: "Sections 13, 14 & 20",
        desc: "Organizations must notify individuals of purposes and obtain consent before collection, use, or disclosure of personal data; deemed consent by contractual necessity is narrowly interpreted.",
      },
      {
        title: "Mandatory Data Breach Notification",
        ref: "Part VIA (Sections 26A–26E)",
        desc: "Mandates notification to the PDPC within 3 calendar days (72 hours) and to affected individuals for any breach resulting in significant harm or affecting 500+ individuals.",
      },
      {
        title: "Transfer Limitation Obligation",
        ref: "Section 26 & Advisory Guidelines",
        desc: "Prohibits transferring personal data out of Singapore unless the recipient organization is bound by legally enforceable obligations providing a comparable standard of protection.",
      },
      {
        title: "Data Protection Officer (DPO) Mandate",
        ref: "Section 11(3)",
        desc: "Requires every organization to designate at least one Data Protection Officer whose business contact information is made accessible to the public.",
      },
    ],
    bodyText: `================================================================================
SINGAPORE PERSONAL DATA PROTECTION ACT (PDPA 2012, AMENDED 2020)
ENTERPRISE STATUTORY COMPLIANCE INSTRUMENT & BREACH GOVERNANCE SCHEDULE
PURSUANT TO THE PDPA 2012 AND PERSONAL DATA PROTECTION REGULATIONS
================================================================================

JURISDICTION: Republic of Singapore
SUPERVISORY COMMISSION: Personal Data Protection Commission (PDPC Singapore)
STATUTORY SCOPE: 11 Data Protection Obligations & Mandatory Data Breach Notification Regime

--------------------------------------------------------------------------------
1. THE 11 STATUTORY DATA PROTECTION OBLIGATIONS
--------------------------------------------------------------------------------
In satisfaction of the Singapore PDPA 2012 (as amended by the Personal Data Protection (Amendment) Act 2020), this platform operates in complete fidelity to the eleven core statutory obligations:

1. Consent Obligation (Sec 13): Personal data is collected, used, or disclosed only where the individual has provided valid consent, or where deemed consent / statutory exceptions apply.
2. Purpose Limitation Obligation (Sec 14): Data is processed only for purposes that a reasonable person would consider appropriate in the circumstances.
3. Notification Obligation (Sec 20): Clear notification of purposes provided before or at the time of data collection.
4. Access & Correction Obligations (Sec 21 & 22): Individuals may request access to their personal data and correction of any error or omission within 30 days.
5. Accuracy Obligation (Sec 23): Reasonable efforts made to ensure personal data is accurate and complete where likely to affect decisions.
6. Protection Obligation (Sec 24): Reasonable security arrangements to prevent unauthorized access, collection, use, disclosure, copying, modification, or disposal.
7. Retention Limitation Obligation (Sec 25): Cease retention of personal data as soon as the purpose of collection is no longer served and retention is no longer necessary for legal or business purposes.
8. Transfer Limitation Obligation (Sec 26): Personal data transferred outside Singapore must be accorded a standard of protection comparable to that under the PDPA.
9. Data Breach Notification Obligation (Part VIA): Mandatory reporting of notifiable data breaches to PDPC and affected individuals.
10. Accountability Obligation (Sec 11 & 12): Implementation of internal policies, DPO appointment, and making compliance policies publicly available.
11. Data Portability Obligation (Part VIB): Transmission of personal data to another organization upon valid request.

--------------------------------------------------------------------------------
2. MANDATORY DATA BREACH NOTIFICATION PROTOCOL (PART VIA, SECTIONS 26A–26E)
--------------------------------------------------------------------------------
2.1. Assessment SLA: Upon having reason to believe that a data breach has occurred, the organization shall conduct an immediate, reasonable, and expeditious assessment to determine if the breach is a Notifiable Data Breach.
2.2. Notifiable Thresholds (Sec 26B): A breach is notifiable if it:
    (a) Results in, or is likely to result in, significant harm to affected individuals; or
    (b) Is of a significant scale (involving personal data of 500 or more individuals).
2.3. Notification to PDPC (Sec 26C): The organization shall notify the PDPC as soon as practicable, and in any case no later than three (3) calendar days (72 hours) after making the determination.
2.4. Notification to Individuals (Sec 26D): Affected individuals shall be notified concurrently to enable them to take preventive measures, unless statutory exceptions apply.

--------------------------------------------------------------------------------
3. CROSS-BORDER TRANSFER LIMITATION SAFEGUARDS (SECTION 26)
--------------------------------------------------------------------------------
3.1. Standard of Protection: Personal data shall not be transferred out of Singapore unless the recipient organization is bound by legally enforceable obligations, such as:
    - Binding Corporate Rules (BCRs)
    - Standard Contractual Clauses (ASEAN Model Contractual Clauses / PDPC Model Clauses)
    - APEC Cross-Border Privacy Rules (CBPR) Certification
3.2. Sovereign Payload Isolation: Inbound diagnostic requests from Singaporean network origins are evaluated within sovereign-adjacent nodes guaranteeing data integrity.

--------------------------------------------------------------------------------
4. STATUTORY DESIGNATION OF DATA PROTECTION OFFICER (SECTION 11(3))
--------------------------------------------------------------------------------
In compliance with Section 11(3) of the PDPA, the designated Data Protection Officer (DPO) responsible for ensuring organizational compliance is:
- Office: Directorate of Data Protection & Regulatory Compliance
- Address: Marina Bay Financial Centre, Tower 2, Singapore 018983
- Contact Email: dpo-singapore@asji.legal / dpo@asji.one
- Operating Hours: Monday to Friday, 09:00 - 18:00 SGT (UTC+8)

STATUTORY FINANCIAL PENALTIES:
Under the amended PDPA, the PDPC possesses powers to impose financial penalties up to SGD $1,000,000 or up to 10% of the organization's annual turnover in Singapore (for organizations with annual local turnover exceeding SGD $10 Million), whichever is higher.`,
  },

  // 6. BRAZIL - LGPD (LEI Nº 13.709/2018)
  {
    id: "br-lgpd",
    tag: "BR-LGPD",
    flag: "🇧🇷",
    jurisdiction: "Brazil (Lei Geral de Proteção de Dados - LGPD Lei nº 13.709/2018)",
    region: "Americas",
    governingBody: "Autoridade Nacional de Proteção de Dados (ANPD Brasil)",
    statutoryReference:
      "Artigos 6º, 7º, 8º, 9º, 11, 14, 18, 41, 46, 48 & 52, Lei Federal nº 13.709/2018",
    statutoryPenalty:
      "Até 2% do faturamento da empresa no Brasil, limitada a R$ 50.000.000,00 por infração",
    badge: "Art. 7º & 18 Brazilian Notice",
    titleHeader:
      "Termo de Tratamento de Dados Pessoais e Política de Governança // Lei Geral de Proteção de Dados (LGPD Lei nº 13.709/2018)",
    executiveSummary:
      "Official bilingual Portuguese and English legal governance framework and data subject charter under Brazil's Lei Geral de Proteção de Dados (LGPD), establishing the 10 legal bases of processing under Article 7, data subject rights under Article 18, Encarregado (DPO) statutory governance under Article 41, and ANPD security standards.",
    keyArticles: [
      {
        title: "Bases Legais do Tratamento",
        ref: "Artigo 7º da LGPD",
        desc: "O tratamento de dados pessoais somente poderá ser realizado mediante consentimento do titular, cumprimento de obrigação legal, execução de contrato, ou legítimo interesse.",
      },
      {
        title: "Direitos dos Titulares de Dados",
        ref: "Artigo 18 da LGPD",
        desc: "Garante ao titular o direito de confirmação da existência de tratamento, acesso aos dados, correção, anonimização, bloqueio ou eliminação de dados desnecessários, e portabilidade.",
      },
      {
        title: "Nomeação do Encarregado (DPO)",
        ref: "Artigo 41 da LGPD",
        desc: "O controlador deverá indicar encarregado pelo tratamento de dados pessoais, cuja identidade e informações de contato devem ser divulgadas publicamente de forma clara.",
      },
      {
        title: "Segurança e Notificação de Incidentes",
        ref: "Artigos 46 e 48 da LGPD",
        desc: "Adoção de medidas de segurança técnicas e administrativas aptas a proteger os dados e comunicação obrigatória à ANPD e aos titulares em prazo razoável.",
      },
    ],
    bodyText: `================================================================================
TERMO DE GOVERNANÇA DE PRIVACIDADE E TRATAMENTO DE DADOS PESSOAIS
EM CONFORMIDADE COM A LEI GERAL DE PROTEÇÃO DE DADOS PESSOAIS (LEI Nº 13.709/2018 - LGPD)
================================================================================

JURISDIÇÃO: República Federativa do Brasil / Global International Sovereign Frameworks
AUTORIDADE FISCALIZADORA: Autoridade Nacional de Proteção de Dados (ANPD)
INSTRUMENTO: Declaração de Tratamento, Direitos do Titular e Nomeação de Encarregado (DPO)

--------------------------------------------------------------------------------
1. DECLARAÇÃO DE CONFORMIDADE E ESCOPO (ARTIGOS 1º A 3º)
--------------------------------------------------------------------------------
Este Termo de Governança aplica-se a qualquer operação de tratamento de dados pessoais realizada por pessoa natural ou jurídica que tenha como objetivo a oferta ou o fornecimento de bens ou serviços, ou o tratamento de dados de indivíduos localizados no território nacional brasileiro, em estrita observância à Lei Federal nº 13.709/2018 (LGPD).

This Governance Charter applies to all data processing operations involving Data Subjects in Brazil or where personal data is collected within Brazilian national territory.

--------------------------------------------------------------------------------
2. PRINCÍPIOS FUNDAMENTAIS DO TRATAMENTO (ARTIGO 6º)
--------------------------------------------------------------------------------
As atividades de tratamento de dados pessoais observarão a boa-fé e os seguintes princípios:
I - Finalidade: Realização do tratamento para propósitos legítimos, específicos, explícitos e informados ao titular.
II - Adequação: Compatibilidade do tratamento com as finalidades informadas.
III - Necessidade (Minimização): Limitação do tratamento ao mínimo necessário para a realização de suas finalidades.
IV - Livre Acesso: Garantia, aos titulares, de consulta facilitada e gratuita sobre a forma e a duração do tratamento.
V - Qualidade dos Dados: Garantia de exatidão, clareza, relevância e atualização dos dados.
VI - Transparência: Informações claras, precisas e facilmente acessíveis sobre o tratamento e os agentes.
VII - Segurança (Art. 46): Utilização de medidas técnicas (criptografia TLS 1.3, cabeçalhos CSP, HSTS) e administrativas para proteger os dados pessoais.
VIII - Prevenção: Adoção de medidas para prevenir a ocorrência de danos em virtude do tratamento.
IX - Não Discriminação: Impossibilidade de realização do tratamento para fins discriminatórios ilícitos ou abusivos.
X - Responsabilização e Prestação de Contas: Demonstração da adoção de medidas eficazes e capazes de comprovar a observância e o cumprimento das normas de proteção de dados.

--------------------------------------------------------------------------------
3. BASES LEGAIS DO TRATAMENTO (ARTIGO 7º E 11)
--------------------------------------------------------------------------------
O tratamento de dados pessoais é fundamentado exclusivamente nas seguintes hipóteses legais:
(a) Consentimento do Titular (Art. 7º, I): Fornecido de forma livre, informada e inequívoca para uma finalidade determinada.
(b) Execução de Contrato (Art. 7º, V): Para os procedimentos preliminares e prestação de serviços de auditoria de conformidade digital a pedido do titular.
(c) Legítimo Interesse do Controlador (Art. 7º, IX): Para apoio e promoção de atividades de segurança da informação e prevenção a fraudes cibernéticas.

--------------------------------------------------------------------------------
4. DIREITOS DOS TITULARES DE DADOS PESSOAIS (ARTIGO 18)
--------------------------------------------------------------------------------
O titular dos dados pessoais tem direito a obter do controlador, em relação aos dados por ele tratados, a qualquer momento e mediante requisição:
1. Confirmação da existência de tratamento;
2. Acesso aos dados de forma estruturada e legível;
3. Correção de dados incompletos, inexatos ou desatualizados;
4. Anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD;
5. Portabilidade dos dados a outro fornecedor de serviço ou produto;
6. Eliminação dos dados pessoais tratados com o consentimento do titular;
7. Informação das entidades públicas e privadas com as quais o controlador realizou uso compartilhado de dados;
8. Informação sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa;
9. Revogação do consentimento nos termos do § 5º do art. 8º desta Lei.

--------------------------------------------------------------------------------
5. ENCARREGADO PELO TRATAMENTO DE DADOS (DPO - ARTIGO 41)
--------------------------------------------------------------------------------
Em estrito cumprimento ao Artigo 41 da LGPD, o Encarregado pelo Tratamento de Dados Pessoais (Data Protection Officer) designado é:
- Nomeação: Diretoria de Governança de Dados e Conformidade RegTech
- Escritório de Atendimento: Av. Paulista, 1374 - Bela Vista, São Paulo - SP, 01310-100, Brasil
- E-mail Oficial do Encarregado: encarregado-lgpd@asji.legal / dpo-brasil@asji.one
- Atribuições: Receber reclamações e comunicações dos titulares, prestar esclarecimentos, receber comunicações da ANPD e orientar os funcionários sobre práticas de proteção de dados.

--------------------------------------------------------------------------------
6. TRANSFERÊNCIA INTERNACIONAL E INCIDENTES DE SEGURANÇA (ARTIGOS 33 E 48)
--------------------------------------------------------------------------------
6.1. Transferência Internacional (Art. 33): A transferência internacional de dados pessoais somente é realizada para países que proporcionem grau de proteção de dados pessoais adequado ao previsto na LGPD ou mediante cláusulas-padrão contratuais específicas.
6.2. Comunicação de Incidentes (Art. 48): O controlador comunicará à autoridade nacional (ANPD) e aos titulares a ocorrência de incidente de segurança que possa acarretar risco ou dano relevante aos titulares em prazo razoável conforme regulamentação da ANPD.

SANÇÕES ADMINISTRATIVAS (ARTIGO 52):
As infrações às normas da LGPD sujeitam os agentes de tratamento a advertências, bloqueio e eliminação dos dados pessoais, e multas de até 2% (dois por cento) do faturamento da empresa ou grupo no Brasil no seu último exercício, limitada a R$ 50.000.000,00 (cinquenta milhões de reais) por infração.`,
  },
];
