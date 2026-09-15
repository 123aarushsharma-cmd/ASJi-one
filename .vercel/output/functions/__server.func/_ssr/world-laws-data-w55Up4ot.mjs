//#region node_modules/.nitro/vite/services/ssr/assets/world-laws-data-w55Up4ot.js
var WORLD_LAWS_DATA = [
	{
		id: "india-dpdp",
		country: "India",
		countryCode: "IN",
		flag: "🇮🇳",
		region: "Asia-Pacific",
		lawName: "Digital Personal Data Protection Act, 2023 (Act No. 22 of 2023) & Draft Rules 2025",
		acronym: "DPDP Act 2023",
		enactedYear: 2023,
		status: "In Force",
		governingBody: "Data Protection Board of India (DPBI) / MeitY",
		officialPortal: "https://www.meity.gov.in",
		maxPenalty: "Up to ₹250 Crore (approx. $30M USD) per statutory breach",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: "Immediate",
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"Itemized Notice at Collection in 22 Eighth-Schedule languages (Sec 5)",
			"Unconditional affirmative consent & equal ease of withdrawal (Sec 6)",
			"Zero tracking / targeted advertising on children under 18 without verifiable parental consent (Sec 9)",
			"Designated Grievance Redressal Officer (GRO) resolution within 30 days (Sec 13)",
			"Statutory Reasonable Security Safeguards against data breaches (Sec 8(5))"
		],
		keyArticles: [
			{
				number: "Section 5",
				topic: "Notice",
				mandate: "Mandatory itemized notice specifying personal data categories, processing purpose, and GRO contact before obtaining consent."
			},
			{
				number: "Section 6",
				topic: "Consent",
				mandate: "Consent must be free, specific, informed, unconditional, and unambiguous with clear affirmative action."
			},
			{
				number: "Section 8(5)",
				topic: "Security",
				mandate: "Data Fiduciary must implement reasonable security safeguards to prevent personal data breaches."
			},
			{
				number: "Section 8(6)",
				topic: "Breach Notification",
				mandate: "Mandatory statutory notification of breach to DPBI and each affected Data Principal."
			},
			{
				number: "Section 9",
				topic: "Child Data",
				mandate: "Prohibits tracking, behavioral monitoring, or targeted ads directed at children under 18."
			},
			{
				number: "Section 13",
				topic: "Grievance",
				mandate: "Statutory right to redressal before GRO prior to filing complaints before DPBI."
			}
		],
		statutorySummary: "India's comprehensive privacy law regulating digital personal data processing within India and extraterritorially when offering goods or services to Data Principals in India.",
		standardDraftTemplate: "Statutory Itemized Notice under Section 5 & Consent Protocol under Section 6 with DPBI appellate channel disclosures."
	},
	{
		id: "uae-pdpl",
		country: "United Arab Emirates",
		countryCode: "AE",
		flag: "🇦🇪",
		region: "Middle East",
		lawName: "Federal Decree-Law No. (45) of 2021 on the Protection of Personal Data",
		acronym: "UAE PDPL",
		enactedYear: 2021,
		status: "Active & Enforced",
		governingBody: "UAE Data Office (مكتب الإمارات للبيانات) / TDRA",
		officialPortal: "https://u.ae/en/about-the-uae/digital-uae/data/data-protection-laws",
		maxPenalty: "Up to AED 15,000,000 in administrative fines & operational suspension",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: "Immediate",
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"Fair, transparent and lawful processing with purpose limitation (Art 5)",
			"Explicit affirmative consent required prior to processing (Art 6)",
			"Strict prohibition on unauthorized cross-border transfers without adequacy or SCCs (Arts 22-23)",
			"Mandatory Data Protection Officer appointment for high-risk processing (Art 10)"
		],
		keyArticles: [
			{
				number: "Article 5",
				topic: "Principles",
				mandate: "Fairness, transparency, purpose limitation, data minimization, accuracy, and storage limitation."
			},
			{
				number: "Article 6",
				topic: "Consent",
				mandate: "Explicit affirmative consent required unless statutory exemptions apply."
			},
			{
				number: "Article 13-17",
				topic: "Data Subject Rights",
				mandate: "Rights to access, cease processing, erasure, rectification, and data portability."
			},
			{
				number: "Article 22-23",
				topic: "Cross-Border Transfers",
				mandate: "Transfers outside UAE only permitted to jurisdictions with adequate protection or under approved standard contractual clauses."
			}
		],
		statutorySummary: "Federal privacy law governing personal data processing in the UAE and foreign entities processing data of individuals residing in the UAE.",
		standardDraftTemplate: "Bilingual Arabic/English Sovereign Processing Notice & Standard Contractual Transfer Clauses pursuant to Articles 5, 6, 22 and 23."
	},
	{
		id: "eu-gdpr",
		country: "European Union",
		countryCode: "EU",
		flag: "🇪🇺",
		region: "Europe & UK",
		lawName: "Regulation (EU) 2016/679 (General Data Protection Regulation)",
		acronym: "EU GDPR",
		enactedYear: 2016,
		status: "In Force",
		governingBody: "European Data Protection Board (EDPB) & National DPAs (Irish DPC, CNIL, BfDI)",
		officialPortal: "https://edpb.europa.eu",
		maxPenalty: "Up to €20,000,000 or 4% of total worldwide annual turnover (whichever is higher)",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 16,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"Lawfulness, fairness, and transparency (Art 5(1)(a))",
			"Purpose limitation & data minimization (Art 5(1)(b)-(c))",
			"Integrity and confidentiality with state-of-the-art TOMs (Art 32)",
			"Mandatory 72-hour Supervisory Authority breach notification (Art 33)",
			"B2B Article 28 Data Processing Agreements (DPA) and Standard Contractual Clauses (SCCs)"
		],
		keyArticles: [
			{
				number: "Article 6",
				topic: "Legal Basis",
				mandate: "Consent, contractual necessity, legal obligation, vital interests, public interest, or legitimate interests."
			},
			{
				number: "Article 28",
				topic: "Data Processor",
				mandate: "Binding DPA requiring documented instructions, confidentiality, sub-processor controls, and audit rights."
			},
			{
				number: "Article 32",
				topic: "Security (TOMs)",
				mandate: "Implementation of TLS 1.3 encryption, pseudonymization, CSP headers, and regular penetration testing."
			},
			{
				number: "Article 33",
				topic: "Breach Notification",
				mandate: "Notification to Lead DPA within 72 hours of becoming aware of a risk-bearing data breach."
			},
			{
				number: "Chapter V",
				topic: "Transfers",
				mandate: "International data transfers governed by adequacy decisions, EU SCC Modules 1-4, or BCRs."
			}
		],
		statutorySummary: "The global gold standard data protection regulation governing personal data processing across all 27 EU Member States with extraterritorial reach worldwide.",
		standardDraftTemplate: "Article 28 Data Processing Addendum (DPA) with Standard Contractual Clauses (SCCs) and Article 32 TOMs Schedule."
	},
	{
		id: "uk-gdpr",
		country: "United Kingdom",
		countryCode: "GB",
		flag: "🇬🇧",
		region: "Europe & UK",
		lawName: "UK GDPR & Data Protection Act 2018 (DPA 2018)",
		acronym: "UK GDPR",
		enactedYear: 2018,
		status: "In Force",
		governingBody: "Information Commissioner's Office (ICO)",
		officialPortal: "https://ico.org.uk",
		maxPenalty: "Up to £17,500,000 or 4% of total worldwide annual turnover",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 13,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"UK International Data Transfer Agreement (IDTA) standards",
			"Mandatory Age-Appropriate Design Code (Children's Code)",
			"Strict direct marketing rules under PECR / ePrivacy",
			"Accountability principle requiring demonstrable governance"
		],
		keyArticles: [
			{
				number: "Article 28",
				topic: "UK Processor Terms",
				mandate: "Statutory processor terms and UK IDTA / Addendum to EU SCCs."
			},
			{
				number: "Section 123 DPA 2018",
				topic: "Children's Code",
				mandate: "High-privacy default settings and prohibition on nudge techniques for minors."
			},
			{
				number: "PECR Reg 6",
				topic: "Cookies",
				mandate: "Explicit consent required before storing or accessing non-essential cookies or telemetry."
			}
		],
		statutorySummary: "Post-Brexit data protection framework mirroring EU GDPR with UK-specific International Data Transfer Agreements (IDTA) and ICO enforcement.",
		standardDraftTemplate: "UK International Data Transfer Addendum & Article 28 Compliance Addendum for UK data controllers."
	},
	{
		id: "us-cpra",
		country: "United States (California & Multi-State)",
		countryCode: "US",
		flag: "🇺🇸",
		region: "Americas",
		lawName: "California Consumer Privacy Act (CCPA) as amended by the California Privacy Rights Act (CPRA)",
		acronym: "CCPA / CPRA",
		enactedYear: 2020,
		status: "In Force",
		governingBody: "California Privacy Protection Agency (CPPA) & California AG",
		officialPortal: "https://cppa.ca.gov",
		maxPenalty: "Up to $7,500 per intentional violation; $100-$750 per consumer for breach statutory damages",
		extraterritorialScope: true,
		dpoMandatory: false,
		breachNotificationHours: "Reasonable time",
		childrenAgeThreshold: 16,
		crossBorderAdequacyRequired: false,
		corePrinciples: [
			"Notice at Collection of personal information (Cal Civ Code § 1798.100)",
			"Mandatory 'Do Not Sell or Share My Personal Info' opt-out link (§ 1798.120 / 135)",
			"Automated Universal Opt-Out / Global Privacy Control (GPC) recognition (11 CCR § 7025)",
			"Limit the Use of Sensitive Personal Information (§ 1798.121)",
			"Multi-State Alignment (Virginia CDPA, Colorado CPA, Connecticut CTDPA, Texas TDPSA)"
		],
		keyArticles: [
			{
				number: "§ 1798.100(b)",
				topic: "Notice at Collection",
				mandate: "Clear disclosure of categories collected, business purposes, and retention periods at or before collection."
			},
			{
				number: "§ 1798.120",
				topic: "Do Not Sell/Share",
				mandate: "Right to opt-out of sale or sharing for cross-context behavioral advertising."
			},
			{
				number: "11 CCR § 7025",
				topic: "GPC Signal",
				mandate: "Mandatory frictionless recognition of browser Sec-GPC opt-out preference headers."
			},
			{
				number: "§ 1798.140",
				topic: "Service Provider",
				mandate: "Contractual restrictions prohibiting retaining, using, or disclosing data outside business relationship."
			}
		],
		statutorySummary: "Pioneering comprehensive state privacy law in the United States establishing consumer rights and creating the first dedicated privacy agency (CPPA).",
		standardDraftTemplate: "CCPA/CPRA Notice at Collection, DNSMPI Opt-Out Schedule, and Service Provider Data Addendum."
	},
	{
		id: "singapore-pdpa",
		country: "Singapore",
		countryCode: "SG",
		flag: "🇸🇬",
		region: "Asia-Pacific",
		lawName: "Personal Data Protection Act 2012 (Amended 2020)",
		acronym: "Singapore PDPA",
		enactedYear: 2012,
		status: "Active & Enforced",
		governingBody: "Personal Data Protection Commission (PDPC Singapore)",
		officialPortal: "https://www.pdpc.gov.sg",
		maxPenalty: "Up to SGD $1,000,000 or 10% of annual local turnover (whichever is higher)",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 13,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"11 Statutory Data Protection Obligations (Consent, Purpose, Notification, Access, Correction, Accuracy, Protection, Retention, Transfer, Breach, Accountability)",
			"Mandatory 72-hour Data Breach Notification under Part VIA (500+ individuals or significant harm)",
			"Designation and public contact publication of Data Protection Officer (Sec 11(3))",
			"ASEAN Model Contractual Clauses for cross-border transfers (Sec 26)"
		],
		keyArticles: [
			{
				number: "Section 13-14",
				topic: "Consent & Purpose",
				mandate: "Requirement of valid consent and reasonable purpose limitation."
			},
			{
				number: "Section 24",
				topic: "Protection",
				mandate: "Reasonable security arrangements to prevent unauthorized access or disclosure."
			},
			{
				number: "Part VIA",
				topic: "Breach Notification",
				mandate: "Mandatory reporting to PDPC within 3 calendar days (72 hours) for notifiable breaches."
			},
			{
				number: "Section 26",
				topic: "Transfer Limitation",
				mandate: "Recipient must provide comparable standard of protection under legally enforceable obligations."
			}
		],
		statutorySummary: "Singapore's foundational privacy statute governing commercial personal data processing across financial, tech, and healthcare sectors.",
		standardDraftTemplate: "Enterprise Statutory Compliance Instrument, DPO Designation Charter, and Part VIA Breach Protocol."
	},
	{
		id: "brazil-lgpd",
		country: "Brazil",
		countryCode: "BR",
		flag: "🇧🇷",
		region: "Americas",
		lawName: "Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018)",
		acronym: "Brazil LGPD",
		enactedYear: 2018,
		status: "In Force",
		governingBody: "Autoridade Nacional de Proteção de Dados (ANPD Brasil)",
		officialPortal: "https://www.gov.br/anpd",
		maxPenalty: "Up to 2% of annual turnover in Brazil, capped at R$ 50.000.000,00 per violation",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: "Reasonable time",
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"10 Legal Bases for Processing under Article 7 (Consent, Legal Obligation, Contract, Legitimate Interest)",
			"Data Subject rights under Article 18 (Access, Rectification, Erasure, Portability)",
			"Public appointment of Encarregado pelo Tratamento de Dados (DPO) under Article 41",
			"Security and breach notification obligations under Articles 46 and 48"
		],
		keyArticles: [
			{
				number: "Artigo 7º",
				topic: "Legal Bases",
				mandate: "Processing restricted to explicit legal grounds including consent and contract."
			},
			{
				number: "Artigo 18",
				topic: "Rights",
				mandate: "Guarantees data subject rights to confirmation, access, correction, anonymization, and deletion."
			},
			{
				number: "Artigo 41",
				topic: "Encarregado (DPO)",
				mandate: "Mandatory public publication of DPO contact details."
			},
			{
				number: "Artigo 48",
				topic: "Incident Communication",
				mandate: "Communication to ANPD and data subjects of security incidents that may create relevant risk."
			}
		],
		statutorySummary: "Brazil's comprehensive privacy law inspired by GDPR with extraterritorial jurisdiction over any processing offering goods or services to individuals in Brazil.",
		standardDraftTemplate: "Termo de Governança de Privacidade e Tratamento de Dados Pessoais conforme a Lei 13.709/2018."
	},
	{
		id: "canada-pipeda",
		country: "Canada",
		countryCode: "CA",
		flag: "🇨🇦",
		region: "Americas",
		lawName: "Personal Information Protection and Electronic Documents Act (PIPEDA) & Consumer Privacy Protection Act (CPPA / Bill C-27)",
		acronym: "PIPEDA / C-27",
		enactedYear: 2e3,
		status: "In Force",
		governingBody: "Office of the Privacy Commissioner of Canada (OPC)",
		officialPortal: "https://www.priv.gc.ca",
		maxPenalty: "Up to CAD $25,000,000 or 5% of global revenue (under Bill C-27 reforms)",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: "Immediate",
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"10 Fair Information Principles (Accountability, Identifying Purposes, Consent, Limiting Collection, Limiting Use, Accuracy, Safeguards, Openness, Individual Access, Challenging Compliance)",
			"Mandatory reporting of breaches of security safeguards presenting a Real Risk of Significant Harm (RROSH)",
			"Provincial substantially similar statutes (Quebec Law 25, Alberta PIPA, BC PIPA)"
		],
		keyArticles: [
			{
				number: "Principle 4.3",
				topic: "Consent",
				mandate: "Knowledge and consent of individual required for collection, use, or disclosure."
			},
			{
				number: "Section 10.1",
				topic: "Breach Reporting",
				mandate: "Mandatory report to Privacy Commissioner for breaches creating real risk of significant harm."
			},
			{
				number: "Quebec Law 25",
				topic: "Privacy by Default",
				mandate: "Highest privacy default settings and mandatory Privacy Impact Assessments (PIAs)."
			}
		],
		statutorySummary: "Canada's federal private-sector privacy legislation governing commercial data collection with modernized protections under Quebec Law 25 and Bill C-27.",
		standardDraftTemplate: "PIPEDA Schedule 1 Compliance Charter & Mandatory RROSH Breach Assessment Schedule."
	},
	{
		id: "australia-privacy-act",
		country: "Australia",
		countryCode: "AU",
		flag: "🇦🇺",
		region: "Asia-Pacific",
		lawName: "Privacy Act 1988 & Australian Privacy Principles (APPs) (Privacy and Other Legislation Amendment Act 2024)",
		acronym: "Australian Privacy Act",
		enactedYear: 1988,
		status: "Amended",
		governingBody: "Office of the Australian Information Commissioner (OAIC)",
		officialPortal: "https://www.oaic.gov.au",
		maxPenalty: "Greater of AUD $50,000,000, 3x value of benefit, or 30% of adjusted turnover",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"13 Australian Privacy Principles (APPs)",
			"Notifiable Data Breaches (NDB) Scheme requiring formal notification for eligible data breaches",
			"APP 8 Cross-Border Disclosure requiring reasonable steps that recipient will not breach APPs",
			"Enhanced direct right of action and statutory tort for serious privacy invasions (2024 Amendments)"
		],
		keyArticles: [
			{
				number: "APP 1",
				topic: "Open & Transparent Management",
				mandate: "Must maintain up-to-date and clearly expressed privacy policy."
			},
			{
				number: "APP 8",
				topic: "Cross-Border Disclosure",
				mandate: "Accountability for acts and practices of overseas recipients of personal information."
			},
			{
				number: "Part IIIC",
				topic: "NDB Scheme",
				mandate: "Mandatory statement to OAIC and individuals for eligible data breaches likely to result in serious harm."
			}
		],
		statutorySummary: "Federal privacy law regulating Australian Government agencies and private sector organizations with annual turnover over AUD $3M and extraterritorial commercial links.",
		standardDraftTemplate: "Australian Privacy Principles (APP 1-13) Enterprise Policy & Part IIIC Notifiable Data Breach Schedule."
	},
	{
		id: "japan-appi",
		country: "Japan",
		countryCode: "JP",
		flag: "🇯🇵",
		region: "Asia-Pacific",
		lawName: "Act on the Protection of Personal Information (APPI - Act No. 57 of 2003, Amended 2020/2022)",
		acronym: "Japan APPI",
		enactedYear: 2003,
		status: "Amended",
		governingBody: "Personal Information Protection Commission (PPC Japan)",
		officialPortal: "https://www.ppc.go.jp/en",
		maxPenalty: "Up to ¥100,000,000 for corporations; criminal penalties for unauthorized provision",
		extraterritorialScope: true,
		dpoMandatory: false,
		breachNotificationHours: "Immediate",
		childrenAgeThreshold: 16,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"Mutual adequacy recognition with European Union (EDPB)",
			"Pseudonymously Processed Information and Anonymously Processed Information frameworks",
			"Mandatory notification to PPC and individuals for data leak incidents",
			"Strict third-party provision consent rules and record-keeping obligations"
		],
		keyArticles: [
			{
				number: "Article 17-18",
				topic: "Purpose & Notice",
				mandate: "Specify purpose of utilization and notify principal promptly upon acquisition."
			},
			{
				number: "Article 23",
				topic: "Security Control",
				mandate: "Take necessary and appropriate measures for prevention of leakage or loss of personal data."
			},
			{
				number: "Article 24",
				topic: "Third-Party Transfer",
				mandate: "Prior consent required before providing personal data to third parties, especially overseas."
			}
		],
		statutorySummary: "Japan's landmark privacy legislation with mutual adequacy with the EU GDPR, strict governance over personal information handling, and strong individual rights.",
		standardDraftTemplate: "APPI Statutory Processing Declaration & Cross-Border Third-Party Provision Agreement."
	},
	{
		id: "korea-pipa",
		country: "South Korea",
		countryCode: "KR",
		flag: "🇰🇷",
		region: "Asia-Pacific",
		lawName: "Personal Information Protection Act (PIPA - Act No. 10465, Amended 2023)",
		acronym: "Korea PIPA",
		enactedYear: 2011,
		status: "In Force",
		governingBody: "Personal Information Protection Commission (PIPC Korea)",
		officialPortal: "https://www.pipc.go.kr",
		maxPenalty: "Up to 3% of total annual sales/turnover for violations",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 14,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"One of the strictest privacy regimes in the world",
			"Mandatory explicit consent itemized separately for standard, sensitive, and unique identification data",
			"Right to automated decision explanations and objections (2023 Amendment)",
			"Mandatory Chief Privacy Officer (CPO) designation"
		],
		keyArticles: [
			{
				number: "Article 15 & 17",
				topic: "Consent",
				mandate: "Strict itemized consent requirement before collection, use, or provision to third parties."
			},
			{
				number: "Article 29",
				topic: "Security Measures",
				mandate: "Implementation of technical, managerial, and physical security measures including encryption."
			},
			{
				number: "Article 34",
				topic: "Breach Notification",
				mandate: "Immediate notification to data subjects and reporting to PIPC/KISA within 72 hours."
			},
			{
				number: "Article 31",
				topic: "Chief Privacy Officer",
				mandate: "Mandatory CPO designation responsible for comprehensive personal information management."
			}
		],
		statutorySummary: "World-leading stringent data privacy legislation in South Korea with intense criminal liabilities, strict consent segregation, and mutual EU adequacy.",
		standardDraftTemplate: "PIPA Segregated Consent Architecture & Chief Privacy Officer Compliance Charter."
	},
	{
		id: "south-africa-popia",
		country: "South Africa",
		countryCode: "ZA",
		flag: "🇿🇦",
		region: "Africa",
		lawName: "Protection of Personal Information Act, 2013 (Act No. 4 of 2013)",
		acronym: "POPIA",
		enactedYear: 2013,
		status: "In Force",
		governingBody: "Information Regulator (South Africa)",
		officialPortal: "https://inforegulator.org.za",
		maxPenalty: "Up to ZAR 10,000,000 or up to 10 years imprisonment",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: "Immediate",
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"8 Conditions for Lawful Processing of Personal Information (Accountability, Processing Limitation, Purpose Specification, Further Processing Limitation, Information Quality, Openness, Security Safeguards, Data Subject Participation)",
			"Mandatory registration of Information Officer with the Information Regulator",
			"Prior Authorization required for processing unique identifiers, credit reporting, or child data"
		],
		keyArticles: [
			{
				number: "Section 8-12",
				topic: "Processing Limitation",
				mandate: "Lawful, reasonable processing that does not infringe privacy and only with consent/justification."
			},
			{
				number: "Section 19",
				topic: "Security Safeguards",
				mandate: "Secure integrity and confidentiality by taking appropriate, reasonable technical and organizational measures."
			},
			{
				number: "Section 22",
				topic: "Breach Notification",
				mandate: "Notify the Information Regulator and data subjects as soon as reasonably possible after breach discovery."
			},
			{
				number: "Section 55",
				topic: "Information Officer",
				mandate: "Mandatory registration and duties of Information Officer to ensure compliance."
			}
		],
		statutorySummary: "Comprehensive data protection statute in Africa establishing stringent conditions for processing personal data belonging to both natural and juristic persons.",
		standardDraftTemplate: "POPIA 8-Condition Compliance Manual & Information Officer Statutory Charter."
	},
	{
		id: "saudi-arabia-pdpl",
		country: "Saudi Arabia",
		countryCode: "SA",
		flag: "🇸🇦",
		region: "Middle East",
		lawName: "Personal Data Protection Law (Royal Decree No. M/19 of 1443H / Amended M/148 of 1444H)",
		acronym: "Saudi PDPL",
		enactedYear: 2021,
		status: "Active & Enforced",
		governingBody: "Saudi Data and AI Authority (SDAIA)",
		officialPortal: "https://sdaia.gov.sa",
		maxPenalty: "Up to SAR 5,000,000 in administrative fines; criminal penalties for sensitive data leaks",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"National Data Management Office (NDMO) standards alignment",
			"Explicit consent requirement and strict rules on direct marketing",
			"Cross-border transfer rules requiring SDAIA adequacy approval or SCC exemptions",
			"Mandatory 72-hour breach reporting to SDAIA"
		],
		keyArticles: [
			{
				number: "Article 5",
				topic: "Consent",
				mandate: "Consent must be explicit, informed, and capable of being withdrawn at any time."
			},
			{
				number: "Article 24",
				topic: "Breach Reporting",
				mandate: "Notify SDAIA within 72 hours of becoming aware of an incident causing harm to personal data."
			},
			{
				number: "Article 29",
				topic: "Cross-Border Transfers",
				mandate: "Strict limits on transferring personal data outside the Kingdom of Saudi Arabia."
			}
		],
		statutorySummary: "Saudi Arabia's landmark personal data law supervised by SDAIA, protecting individual privacy while supporting Vision 2030 digital economy initiatives.",
		standardDraftTemplate: "Sovereign Saudi PDPL Data Controller Charter & SDAIA Cross-Border Compliance Schedule."
	},
	{
		id: "nigeria-ndpa",
		country: "Nigeria",
		countryCode: "NG",
		flag: "🇳🇬",
		region: "Africa",
		lawName: "Nigeria Data Protection Act, 2023 (NDPA 2023)",
		acronym: "NDPA 2023",
		enactedYear: 2023,
		status: "In Force",
		governingBody: "Nigeria Data Protection Commission (NDPC)",
		officialPortal: "https://ndpc.gov.ng",
		maxPenalty: "Up to ₦10,000,000 or 2% of annual gross revenue (for Data Controllers of Major Importance)",
		extraterritorialScope: true,
		dpoMandatory: true,
		breachNotificationHours: 72,
		childrenAgeThreshold: 18,
		crossBorderAdequacyRequired: true,
		corePrinciples: [
			"Data Controllers and Processors of Major Importance (DCMI) registration regime",
			"Lawful bases of processing including valid consent and legitimate interest",
			"Mandatory 72-hour breach notification to NDPC",
			"Cross-border adequacy whitelist and binding corporate obligations"
		],
		keyArticles: [
			{
				number: "Section 24-29",
				topic: "Principles & Lawful Basis",
				mandate: "Fair, lawful, transparent processing with adequate security measures."
			},
			{
				number: "Section 40",
				topic: "Breach Notification",
				mandate: "Notify NDPC within 72 hours of becoming aware of a personal data breach."
			},
			{
				number: "Section 41-43",
				topic: "Transfers",
				mandate: "International transfers permitted only under adequacy, standard contractual clauses, or valid consent."
			}
		],
		statutorySummary: "Africa's largest economy's comprehensive privacy law establishing the NDPC and introducing high-grade accountability for major data fiduciaries.",
		standardDraftTemplate: "NDPA 2023 Major Data Controller Compliance Framework & NDPC Statutory Notice."
	}
];
//#endregion
export { WORLD_LAWS_DATA as t };
