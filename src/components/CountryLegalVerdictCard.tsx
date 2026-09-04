import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe2,
  ShieldCheck,
  ShieldAlert,
  Scale,
  Building2,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { AuditReport } from "@/lib/audit-types";

interface CountryLegalVerdictCardProps {
  report: AuditReport;
  onOpenRemediationModal?: () => void;
}

export interface CountryVerdict {
  id: string;
  country: string;
  countryCode: string;
  flag: string;
  region: "Asia-Pacific" | "Europe & UK" | "Americas" | "Middle East";
  statuteName: string;
  governingBody: string;
  passed: boolean;
  verdictLabel: "PASSES AS PER LAW" | "FAILS WHOLLY UNDER STATUTE";
  primaryViolation?: string;
  passJustification?: string;
  violatedArticles?: string[];
  maxPenalty: string;
  severity: "CRITICAL" | "HIGH" | "MODERATE" | "COMPLIANT";
}

export function CountryLegalVerdictCard({
  report,
  onOpenRemediationModal,
}: CountryLegalVerdictCardProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "PASS" | "FAIL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  const ev = (report.evidence || []).join(" ").toLowerCase();

  // Deterministic checks from report evidence
  const hasHttps =
    !ev.includes("site only answered over plain http") &&
    !ev.includes("plain http") &&
    (report.target.startsWith("https://") || !report.target.startsWith("http://"));

  const hasHsts =
    !ev.includes("missing security headers: strict-transport-security") &&
    !ev.includes("strict-transport-security missing");

  const hasCsp =
    !ev.includes("content-security-policy") && !ev.includes("missing: content-security-policy");

  const hasPreConsentLeak =
    ev.includes("pre-consent") ||
    ev.includes("unconsented tracking") ||
    ev.includes("cookie flag") ||
    ev.includes("tracker");

  const hasPrivacyNotice =
    !ev.includes("no visible link to privacy policy") &&
    !ev.includes("lack of privacy notice") &&
    !ev.includes("no privacy or terms links");

  const hasGrievanceOfficer =
    !ev.includes("absence of grievance mechanism") &&
    !ev.includes("no designated data protection officer") &&
    !ev.includes("grievance officer contact");

  // Country evaluations based on national statutory jurisprudence
  const countryVerdicts: CountryVerdict[] = useMemo(() => {
    return [
      // 1. INDIA
      {
        id: "in-dpdp",
        country: "India",
        countryCode: "IN",
        flag: "🇮🇳",
        region: "Asia-Pacific",
        statuteName: "Digital Personal Data Protection Act, 2023 (DPDP Act)",
        governingBody: "Data Protection Board of India (DPBI) / MeitY",
        passed: hasPrivacyNotice && hasGrievanceOfficer && hasHttps && !hasPreConsentLeak,
        verdictLabel:
          hasPrivacyNotice && hasGrievanceOfficer && hasHttps && !hasPreConsentLeak
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: !hasGrievanceOfficer
          ? "Absence of statutory Grievance Redressal Officer (GRO) details & 30-day escalation SLA (DPDP Section 13)."
          : !hasPrivacyNotice
            ? "Missing itemized notice at collection in accessible format (DPDP Section 5)."
            : hasPreConsentLeak
              ? "Unconsented behavioral tracking/cookie placement violating Section 6 unconditional affirmative consent."
              : "Fails mandatory reasonable security safeguards under Section 8(5).",
        passJustification:
          "Maintains itemized statutory privacy disclosures, grievance contact channel, and secure transport safeguards.",
        violatedArticles: [
          ...(!hasPrivacyNotice ? ["Section 5 (Notice at Collection)"] : []),
          ...(hasPreConsentLeak ? ["Section 6 (Consent Architecture)"] : []),
          ...(!hasHttps ? ["Section 8(5) (Reasonable Security Safeguards)"] : []),
          ...(!hasGrievanceOfficer ? ["Section 13 (Grievance Redressal Mechanism)"] : []),
        ],
        maxPenalty: "Up to ₹250 Crore (~$30M USD) per statutory breach",
        severity:
          hasPrivacyNotice && hasGrievanceOfficer && hasHttps && !hasPreConsentLeak
            ? "COMPLIANT"
            : "CRITICAL",
      },

      // 2. EUROPEAN UNION
      {
        id: "eu-gdpr",
        country: "European Union",
        countryCode: "EU",
        flag: "🇪🇺",
        region: "Europe & UK",
        statuteName: "General Data Protection Regulation (GDPR) & ePrivacy",
        governingBody: "European Data Protection Board (EDPB) & National DPAs",
        passed: hasPrivacyNotice && !hasPreConsentLeak && hasHttps && hasHsts,
        verdictLabel:
          hasPrivacyNotice && !hasPreConsentLeak && hasHttps && hasHsts
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: hasPreConsentLeak
          ? "Pre-consent telemetry/trackers dropped before explicit affirmative user opt-in (GDPR Art. 6 & ePrivacy Directive)."
          : !hasPrivacyNotice
            ? "Missing Article 13/14 transparency disclosures and legal basis notification."
            : !hasHsts
              ? "Omission of HSTS encryption header violating Art. 32 security of processing."
              : "Inadequate GDPR Article 27 EU representative or DPO publication.",
        passJustification:
          "Zero unconsented tracking cookies detected, robust HTTPS/HSTS encryption active, and GDPR transparency charter disclosed.",
        violatedArticles: [
          ...(hasPreConsentLeak ? ["GDPR Art. 6 / ePrivacy 2002/58/EC (Prior Consent)"] : []),
          ...(!hasPrivacyNotice ? ["GDPR Art. 13 & 14 (Mandatory Notice)"] : []),
          ...(!hasHttps || !hasHsts ? ["GDPR Art. 32 (Security of Processing)"] : []),
        ],
        maxPenalty: "Up to €20,000,000 or 4% of global annual turnover",
        severity:
          hasPrivacyNotice && !hasPreConsentLeak && hasHttps && hasHsts ? "COMPLIANT" : "CRITICAL",
      },

      // 3. UNITED STATES (CALIFORNIA)
      {
        id: "us-ccpa",
        country: "United States (California)",
        countryCode: "US",
        flag: "🇺🇸",
        region: "Americas",
        statuteName: "California Consumer Privacy Act / CPRA (Cal. Civ. Code § 1798)",
        governingBody: "California Privacy Protection Agency (CPPA) / FTC",
        passed: hasPrivacyNotice && hasHttps,
        verdictLabel:
          hasPrivacyNotice && hasHttps ? "PASSES AS PER LAW" : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: !hasPrivacyNotice
          ? "Missing conspicuous California Privacy Notice and 'Do Not Sell or Share My Personal Information' statutory link (§ 1798.120)."
          : "Failure to provide secure transport for consumer personal data transmission (§ 1798.100).",
        passJustification:
          "Conspicuous privacy policy discovered, consumer rights disclosures accessible, and encrypted transport layer enforced.",
        violatedArticles: [
          ...(!hasPrivacyNotice ? ["Cal. Civ. Code § 1798.120 (Opt-Out Rights)"] : []),
          ...(!hasHttps ? ["Cal. Civ. Code § 1798.100 (Duty of Reasonable Security)"] : []),
        ],
        maxPenalty: "Up to $7,500 per intentional violation (Statutory Civil Fines)",
        severity: hasPrivacyNotice && hasHttps ? "COMPLIANT" : "HIGH",
      },

      // 4. UNITED KINGDOM
      {
        id: "gb-ukgdpr",
        country: "United Kingdom",
        countryCode: "GB",
        flag: "🇬🇧",
        region: "Europe & UK",
        statuteName: "Data Protection Act 2018 & UK GDPR",
        governingBody: "Information Commissioner's Office (ICO)",
        passed: hasPrivacyNotice && !hasPreConsentLeak && hasHttps,
        verdictLabel:
          hasPrivacyNotice && !hasPreConsentLeak && hasHttps
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: hasPreConsentLeak
          ? "PECR Regulation 6 violation: non-essential tracking cookies loaded prior to consent."
          : !hasPrivacyNotice
            ? "Failure to provide UK GDPR privacy statement and data subject rights channels."
            : "Non-compliant data security safeguards under UK GDPR Article 32.",
        passJustification:
          "Satisfies UK ICO consent standards, PECR cookie regulations, and published privacy governance.",
        violatedArticles: [
          ...(hasPreConsentLeak ? ["PECR Reg 6 (Cookie Consent Requirements)"] : []),
          ...(!hasPrivacyNotice ? ["UK GDPR Art. 13 (Fair Processing Information)"] : []),
          ...(!hasHttps ? ["UK GDPR Art. 32 (Security Controls)"] : []),
        ],
        maxPenalty: "Up to £17,500,000 or 4% of global turnover",
        severity: hasPrivacyNotice && !hasPreConsentLeak && hasHttps ? "COMPLIANT" : "CRITICAL",
      },

      // 5. UNITED ARAB EMIRATES
      {
        id: "ae-pdpl",
        country: "United Arab Emirates",
        countryCode: "AE",
        flag: "🇦🇪",
        region: "Middle East",
        statuteName: "Federal Decree-Law No. (45) of 2021 (UAE PDPL)",
        governingBody: "UAE Data Office (مكتب الإمارات للبيانات) / TDRA",
        passed: hasPrivacyNotice && hasHttps && !hasPreConsentLeak,
        verdictLabel:
          hasPrivacyNotice && hasHttps && !hasPreConsentLeak
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: hasPreConsentLeak
          ? "Processing personal data / tracking without unambiguous prior consent (UAE PDPL Art. 6)."
          : !hasPrivacyNotice
            ? "Missing mandatory transparency disclosures under UAE PDPL Art. 13."
            : "Breach of technical security measures required by UAE PDPL Art. 9.",
        passJustification:
          "Aligns with UAE Data Office consent guidelines, clear data controller disclosures, and secure protocols.",
        violatedArticles: [
          ...(hasPreConsentLeak ? ["UAE PDPL Art. 6 (Conditions for Consent)"] : []),
          ...(!hasPrivacyNotice ? ["UAE PDPL Art. 13 (Controller Transparency)"] : []),
          ...(!hasHttps ? ["UAE PDPL Art. 9 (Security of Personal Data)"] : []),
        ],
        maxPenalty: "Up to AED 15,000,000 + Operational Suspension Order",
        severity: hasPrivacyNotice && hasHttps && !hasPreConsentLeak ? "COMPLIANT" : "HIGH",
      },

      // 6. SINGAPORE
      {
        id: "sg-pdpa",
        country: "Singapore",
        countryCode: "SG",
        flag: "🇸🇬",
        region: "Asia-Pacific",
        statuteName: "Personal Data Protection Act 2012 (PDPA 2020 Amendments)",
        governingBody: "Personal Data Protection Commission (PDPC)",
        passed: hasPrivacyNotice && hasHttps,
        verdictLabel:
          hasPrivacyNotice && hasHttps ? "PASSES AS PER LAW" : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: !hasPrivacyNotice
          ? "Notification & Consent Obligation breach (PDPA Section 13-20)."
          : "Protection Obligation breach: Inadequate security safeguards over customer transit channels (PDPA Section 24).",
        passJustification:
          "Complies with PDPC Notification, Consent, and Protection Obligations with verifiable SSL transport.",
        violatedArticles: [
          ...(!hasPrivacyNotice ? ["PDPA Section 20 (Notification of Purpose)"] : []),
          ...(!hasHttps ? ["PDPA Section 24 (Protection Obligation)"] : []),
        ],
        maxPenalty: "Up to 10% of annual turnover in Singapore or SGD 1,000,000",
        severity: hasPrivacyNotice && hasHttps ? "COMPLIANT" : "HIGH",
      },

      // 7. AUSTRALIA
      {
        id: "au-privacy",
        country: "Australia",
        countryCode: "AU",
        flag: "🇦🇺",
        region: "Asia-Pacific",
        statuteName: "Privacy Act 1988 (Australian Privacy Principles - APPs)",
        governingBody: "Office of the Australian Information Commissioner (OAIC)",
        passed: hasPrivacyNotice && hasHttps,
        verdictLabel:
          hasPrivacyNotice && hasHttps ? "PASSES AS PER LAW" : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: !hasPrivacyNotice
          ? "Breach of APP 1 (Open and transparent management) and APP 5 (Notification of collection)."
          : "Breach of APP 11 (Security of personal information) due to unencrypted data transmission.",
        passJustification:
          "Meets Australian Privacy Principles for collection notification and data security safeguards.",
        violatedArticles: [
          ...(!hasPrivacyNotice ? ["APP 1 & APP 5 (Collection Notification)"] : []),
          ...(!hasHttps ? ["APP 11 (Security of Personal Information)"] : []),
        ],
        maxPenalty: "Up to AUD 50,000,000 or 30% of adjusted turnover",
        severity: hasPrivacyNotice && hasHttps ? "COMPLIANT" : "HIGH",
      },

      // 8. BRAZIL
      {
        id: "br-lgpd",
        country: "Brazil",
        countryCode: "BR",
        flag: "🇧🇷",
        region: "Americas",
        statuteName: "Lei Geral de Proteção de Dados (LGPD - Law No. 13.709)",
        governingBody: "Autoridade Nacional de Proteção de Dados (ANPD)",
        passed: hasPrivacyNotice && hasHttps && !hasPreConsentLeak,
        verdictLabel:
          hasPrivacyNotice && hasHttps && !hasPreConsentLeak
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: hasPreConsentLeak
          ? "Processing without valid legal basis under LGPD Art. 7 & Art. 8 (Consent)."
          : !hasPrivacyNotice
            ? "Failure to disclose processing purpose and controller information (LGPD Art. 9)."
            : "Inadequate technical and administrative security measures (LGPD Art. 46).",
        passJustification:
          "Valid legal bases established, clear transparency disclosures, and standard security safeguards.",
        violatedArticles: [
          ...(hasPreConsentLeak ? ["LGPD Art. 7 & 8 (Legal Grounds for Processing)"] : []),
          ...(!hasPrivacyNotice ? ["LGPD Art. 9 (Data Subject Information Rights)"] : []),
          ...(!hasHttps ? ["LGPD Art. 46 (Security Standards)"] : []),
        ],
        maxPenalty: "Up to 2% of turnover in Brazil (up to R$ 50,000,000 per violation)",
        severity: hasPrivacyNotice && hasHttps && !hasPreConsentLeak ? "COMPLIANT" : "HIGH",
      },

      // 9. CANADA
      {
        id: "ca-pipeda",
        country: "Canada",
        countryCode: "CA",
        flag: "🇨🇦",
        region: "Americas",
        statuteName: "PIPEDA & Quebec Law 25",
        governingBody: "Office of the Privacy Commissioner of Canada (OPC) / CAI",
        passed: hasPrivacyNotice && hasHttps && !hasPreConsentLeak,
        verdictLabel:
          hasPrivacyNotice && hasHttps && !hasPreConsentLeak
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: hasPreConsentLeak
          ? "Quebec Law 25 default privacy setting violation: tracking active without prior opt-in."
          : !hasPrivacyNotice
            ? "PIPEDA Schedule 1 Principle 4.3 (Consent) and 4.8 (Openness) non-compliance."
            : "PIPEDA Principle 4.7 (Safeguards) failure over unencrypted web endpoints.",
        passJustification:
          "Aligns with PIPEDA Openness principles and Quebec Law 25 confidentiality requirements.",
        violatedArticles: [
          ...(hasPreConsentLeak ? ["Quebec Law 25 s.8.1 (Default Privacy & Tracking)"] : []),
          ...(!hasPrivacyNotice ? ["PIPEDA Principle 4.8 (Openness of Policy)"] : []),
          ...(!hasHttps ? ["PIPEDA Principle 4.7 (Data Safeguards)"] : []),
        ],
        maxPenalty: "Up to CAD 25,000,000 or 4% of worldwide turnover",
        severity: hasPrivacyNotice && hasHttps && !hasPreConsentLeak ? "COMPLIANT" : "HIGH",
      },

      // 10. SAUDI ARABIA
      {
        id: "sa-pdpl",
        country: "Saudi Arabia",
        countryCode: "SA",
        flag: "🇸🇦",
        region: "Middle East",
        statuteName: "Personal Data Protection Law (Royal Decree No. M/19)",
        governingBody: "Saudi Data & AI Authority (SDAIA)",
        passed: hasPrivacyNotice && hasHttps && !hasPreConsentLeak,
        verdictLabel:
          hasPrivacyNotice && hasHttps && !hasPreConsentLeak
            ? "PASSES AS PER LAW"
            : "FAILS WHOLLY UNDER STATUTE",
        primaryViolation: hasPreConsentLeak
          ? "Unconsented telemetry collection violating SDAIA Executive Regulations Art. 11."
          : !hasPrivacyNotice
            ? "Failure to provide statutory privacy notice before collecting personal data (PDPL Art. 12)."
            : "Non-compliance with SDAIA mandatory cybersecurity controls (PDPL Art. 18).",
        passJustification:
          "Complies with SDAIA privacy disclosure mandates, consent requirements, and encryption protocols.",
        violatedArticles: [
          ...(hasPreConsentLeak ? ["SDAIA Exec Regs Art. 11 (Consent Standards)"] : []),
          ...(!hasPrivacyNotice ? ["KSA PDPL Art. 12 (Mandatory Privacy Notice)"] : []),
          ...(!hasHttps ? ["KSA PDPL Art. 18 (Cybersecurity Controls)"] : []),
        ],
        maxPenalty: "Up to SAR 5,000,000 & Potential Criminal Penalties for Gross Breaches",
        severity: hasPrivacyNotice && hasHttps && !hasPreConsentLeak ? "COMPLIANT" : "HIGH",
      },
    ];
  }, [hasHttps, hasHsts, hasPreConsentLeak, hasPrivacyNotice, hasGrievanceOfficer]);

  const passedCountries = useMemo(() => countryVerdicts.filter((c) => c.passed), [countryVerdicts]);

  const failedCountries = useMemo(
    () => countryVerdicts.filter((c) => !c.passed),
    [countryVerdicts],
  );

  const filteredList = useMemo(() => {
    let list = countryVerdicts;
    if (filterMode === "PASS") list = passedCountries;
    if (filterMode === "FAIL") list = failedCountries;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.country.toLowerCase().includes(q) ||
          c.statuteName.toLowerCase().includes(q) ||
          c.governingBody.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q),
      );
    }
    return list;
  }, [countryVerdicts, passedCountries, failedCountries, filterMode, searchQuery]);

  return (
    <div className="surface-panel p-5 sm:p-7 border-primary/40 relative overflow-hidden">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 font-mono text-[11px] font-semibold text-primary">
              <Globe2 className="h-3.5 w-3.5" />
              Sovereign Jurisdictions Analysis
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              Target: <strong className="text-foreground">{report.target}</strong>
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-gold-gradient">
            Country-by-Country Legal Pass vs. Wholly Fail Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Statutory legal determination evaluating whether this website fully complies with or
            wholly violates each sovereign nation's enacted privacy and cyber statutes.
          </p>
        </div>

        {/* Global Verdict Ratio Badge */}
        <div className="flex items-center gap-2.5 font-mono text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode("PASS")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 transition-all cursor-pointer ${
              filterMode === "PASS"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-500/50"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{passedCountries.length} PASSES AS PER LAW</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("FAIL")}
            className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 transition-all cursor-pointer ${
              filterMode === "FAIL"
                ? "border-rose-500 bg-rose-500/20 text-rose-300 font-bold ring-1 ring-rose-500/50"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            }`}
          >
            <XCircle className="h-4 w-4" />
            <span>{failedCountries.length} FAILS WHOLLY</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-xl border border-border/80 bg-secondary/30 p-1 font-mono text-xs">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              filterMode === "ALL"
                ? "bg-primary text-primary-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Sovereign Nations ({countryVerdicts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("PASS")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === "PASS"
                ? "bg-emerald-500 text-black font-bold"
                : "text-emerald-400 hover:text-emerald-300"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Passing ({passedCountries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("FAIL")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              filterMode === "FAIL"
                ? "bg-rose-500 text-white font-bold"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Failing Wholly ({failedCountries.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search country or statute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Grid of Country Verdicts */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredList.map((c) => {
            const isSelected = selectedCountryId === c.id;

            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                  c.passed
                    ? "border-emerald-500/30 bg-emerald-500/[0.03] hover:border-emerald-500/50 hover:bg-emerald-500/[0.06]"
                    : "border-rose-500/30 bg-rose-500/[0.03] hover:border-rose-500/50 hover:bg-rose-500/[0.06]"
                }`}
              >
                <div>
                  {/* Top Header: Flag + Country + Verdict Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" role="img" aria-label={c.country}>
                        {c.flag}
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                          {c.country}
                          <span className="text-[10px] font-mono font-normal text-muted-foreground">
                            ({c.region})
                          </span>
                        </h3>
                        <p className="text-[11px] font-mono text-primary/90 mt-0.5">
                          {c.statuteName}
                        </p>
                      </div>
                    </div>

                    {/* Statutory Verdict Badge */}
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1 ${
                        c.passed
                          ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                          : "border-rose-500/60 bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {c.passed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      {c.verdictLabel}
                    </span>
                  </div>

                  {/* Primary Reason for Pass or Fail */}
                  <div
                    className={`mt-3.5 rounded-xl border p-3 text-xs leading-relaxed ${
                      c.passed
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {c.passed ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-semibold mb-0.5">
                          {c.passed
                            ? "Why it Passes in this Country:"
                            : "Why it Wholly Fails under National Law:"}
                        </strong>
                        <span className="text-[11.5px] opacity-90">
                          {c.passed ? c.passJustification : c.primaryViolation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Violated Articles (if failed) */}
                  {!c.passed && c.violatedArticles && c.violatedArticles.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-mono text-rose-400 font-semibold block uppercase tracking-wider mb-1">
                        Statutory Sections in Breach:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.violatedArticles.map((art, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10.5px] font-mono text-rose-300"
                          >
                            {art}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Authority & Fine Cap */}
                  <div className="mt-3.5 pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Enforcement Authority:
                      </span>
                      <span className="font-semibold text-foreground">{c.governingBody}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Max Statutory Liability:
                      </span>
                      <span
                        className={`font-semibold ${c.passed ? "text-muted-foreground" : "text-amber-400"}`}
                      >
                        {c.maxPenalty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                {!c.passed && onOpenRemediationModal && (
                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <span className="text-[10.5px] text-muted-foreground">
                      Remediation available for {c.country}
                    </span>
                    <button
                      type="button"
                      onClick={onOpenRemediationModal}
                      className="text-[11px] font-mono text-primary hover:text-primary/80 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Unlock Legal Patch
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-xs font-mono">
          No countries found matching "{searchQuery}".
        </div>
      )}
    </div>
  );
}
