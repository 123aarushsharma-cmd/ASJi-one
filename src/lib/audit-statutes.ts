export interface StatutoryFrameworkItem {
  id: string;
  flag: string;
  country: string;
  label: string;
  authority: string;
  region: string;
}

export const STATUTORY_FRAMEWORKS: StatutoryFrameworkItem[] = [
  {
    id: "ind-dpdp",
    flag: "🇮🇳",
    country: "INDIA",
    label: "Digital Personal Data Protection Act (DPDP 2023 & Draft Rules 2025)",
    authority: "Data Protection Board of India (DPBI) / MeitY",
    region: "Asia-Pacific / South Asia",
  },
  {
    id: "eu-gdpr",
    flag: "🇪🇺",
    country: "EUROPEAN UNION",
    label: "General Data Protection Regulation (GDPR 2026 Reforms)",
    authority: "European Data Protection Board (EDPB)",
    region: "European Economic Area",
  },
  {
    id: "uk-duaa",
    flag: "🇬🇧",
    country: "UNITED KINGDOM",
    label: "UK GDPR & Data Use and Access Act (DUAA 2026)",
    authority: "Information Commissioner's Office (ICO)",
    region: "United Kingdom",
  },
  {
    id: "us-cpra",
    flag: "🇺🇸",
    country: "UNITED STATES",
    label: "California CPRA/CCPA & Multi-State Privacy Framework",
    authority: "California Privacy Protection Agency (CPPA) / FTC",
    region: "Americas",
  },
  {
    id: "brazil-lgpd",
    flag: "🇧🇷",
    country: "BRAZIL",
    label: "Lei Geral de Proteção de Dados (LGPD - Law No. 13.709)",
    authority: "Autoridade Nacional de Proteção de Dados (ANPD)",
    region: "Americas",
  },
  {
    id: "canada-pipeda",
    flag: "🇨🇦",
    country: "CANADA",
    label: "PIPEDA & Consumer Privacy Protection Act (CPPA)",
    authority: "Office of the Privacy Commissioner of Canada (OPC)",
    region: "Americas",
  },
  {
    id: "aus-privacy",
    flag: "🇦🇺",
    country: "AUSTRALIA",
    label: "Privacy Act 1988 & Statutory Reforms (2024–2026)",
    authority: "Office of the Australian Information Commissioner (OAIC)",
    region: "Asia-Pacific",
  },
  {
    id: "sg-pdpa",
    flag: "🇸🇬",
    country: "SINGAPORE",
    label: "Personal Data Protection Act (PDPA)",
    authority: "Personal Data Protection Commission (PDPC)",
    region: "Southeast Asia",
  },
  {
    id: "jp-appi",
    flag: "🇯🇵",
    country: "JAPAN",
    label: "Act on the Protection of Personal Information (APPI)",
    authority: "Personal Information Protection Commission (PPC)",
    region: "Asia-Pacific",
  },
  {
    id: "uae-pdpl",
    flag: "🇦🇪",
    country: "UNITED ARAB EMIRATES",
    label: "Federal Decree-Law No. 45 of 2021 (UAE PDPL)",
    authority: "UAE Data Office / ADGM / DIFC",
    region: "Middle East",
  },
  {
    id: "kr-pipa",
    flag: "🇰🇷",
    country: "SOUTH KOREA",
    label: "Personal Information Protection Act (PIPA 2023)",
    authority: "Personal Information Protection Commission (PIPC)",
    region: "Asia-Pacific",
  },
  {
    id: "ch-fadp",
    flag: "🇨🇭",
    country: "SWITZERLAND",
    label: "Federal Act on Data Protection (Revised FADP 2023)",
    authority: "Federal Data Protection and Information Commissioner (FDPIC)",
    region: "Europe",
  },
  {
    id: "ksa-pdpl",
    flag: "🇸🇦",
    country: "SAUDI ARABIA",
    label: "SDAIA Personal Data Protection Law (Royal Decree M/19)",
    authority: "Saudi Data & AI Authority (SDAIA)",
    region: "Middle East",
  },
  {
    id: "ng-ndpa",
    flag: "🇳🇬",
    country: "NIGERIA",
    label: "Nigeria Data Protection Act, 2023 (NDPA 2023)",
    authority: "Nigeria Data Protection Commission (NDPC)",
    region: "Africa",
  },
];
