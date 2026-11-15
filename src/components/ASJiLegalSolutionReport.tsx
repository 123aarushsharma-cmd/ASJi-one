import React from "react";
import { ASJiVectorLogo } from "./ASJiVectorLogo";
import {
  ShieldCheck,
  Scale,
  Globe,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Award,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";

interface ASJiLegalSolutionReportProps {
  report?: AuditReport | null;
  domain?: string;
  frameworkId?: string;
}

export function ASJiLegalSolutionReport({
  report,
  domain: propDomain,
}: ASJiLegalSolutionReportProps) {
  const targetDomain =
    propDomain ||
    (report?.target
      ? report.target.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : "example.com");

  const certNumber = `ASJI-LEGAL-2026-${targetDomain
    .slice(0, 4)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")}-8892`;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderHeader = (pageNumber: number, totalPages: number) => (
    <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-[#C9A227] bg-[#0D0E11] p-1">
          <ASJiVectorLogo width={32} height={32} />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-[#18181B] tracking-wide uppercase">
            ASJi One · Sovereign Statutory Legal Suite
          </h1>
          <p className="text-[10px] font-mono text-[#52525B]">
            Statutory Legal Compliance Brief · Ref: {certNumber}
          </p>
        </div>
      </div>
      <div className="text-right font-mono text-[10px]">
        <div className="text-[#9E7E1B] font-bold">15-JURISDICTION COMPLIANCE BRIEF</div>
        <div className="text-[#52525B] tabular-nums">
          Page {pageNumber} of {totalPages}
        </div>
      </div>
    </div>
  );

  const renderFooter = (_pageNumber: number) => (
    <div className="border-t border-[#E5DEC9] pt-3 mt-auto flex items-center justify-between font-mono text-[9px] text-[#52525B]">
      <div>
        <span>
          Target Entity: <strong className="text-[#18181B]">{targetDomain}</strong>
        </span>
        <span className="mx-2">·</span>
        <span>Issued: {dateStr}</span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3 h-3 text-[#059669]" />
        <span className="text-[#9E7E1B] font-semibold">ASJi Sovereign Legal Registry</span>
      </div>
    </div>
  );

  return (
    <div className="w-[794px] bg-[#FAF8F5] text-[#18181B] font-sans text-xs select-none">
      {/* PAGE 1: COVER & EXECUTIVE LEGAL BRIEF */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(1, 10)}

          <div className="mt-6 rounded-xl border border-[#E5DEC9] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded border border-[#E5DEC9] bg-[#FAF8F5] text-[#9E7E1B] font-mono text-[11px] font-bold">
                15-Jurisdiction Statutory Legal Solution Pack
              </span>
              <span className="font-mono text-[#52525B] text-[10px]">
                Classification: STRICTLY CONFIDENTIAL
              </span>
            </div>

            <h2 className="text-2xl font-bold text-[#18181B] font-display">
              Statutory Privacy Compliance &amp; Remediation Legal Brief
            </h2>

            <p className="text-xs text-[#52525B] leading-relaxed font-sans">
              Prepared exclusively for <strong className="text-[#18181B]">{targetDomain}</strong>.
              This statutory legal dossier articulates non-compliance gaps, delivers itemized legal
              notices, appoints designated grievance redressal charters, and establishes binding
              cross-border data transfer protocols across all 15 global sovereign privacy regimes.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DEC9]">
                <span className="text-[#52525B] block text-[9px]">Target Domain</span>
                <strong className="text-[#18181B] text-xs">{targetDomain}</strong>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DEC9]">
                <span className="text-[#52525B] block text-[9px]">Evaluated Frameworks</span>
                <strong className="text-[#18181B] text-xs">15 Sovereign Laws</strong>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DEC9]">
                <span className="text-[#52525B] block text-[9px]">Penalty Ceiling</span>
                <strong className="text-[#DC2626] text-xs">Up to ₹250Cr / €20M</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Scale className="w-4 h-4 text-[#9E7E1B]" />
              1. Executive Legal Directive &amp; Compliance Objectives
            </h3>
            <p className="text-xs text-[#52525B] leading-relaxed font-sans">
              Global regulatory privacy enforcement has transitioned from voluntary guidance to
              strict statutory penal regimes with substantial financial and executive accountability
              attaching to corporate decision-makers. This dossier equips {targetDomain} with
              audit-ready notices and governance charters.
            </p>

            <div className="p-4 bg-white border border-[#E5DEC9] rounded-lg space-y-2">
              <div className="text-[#9E7E1B] font-mono font-bold text-xs uppercase">
                Primary Statutory Mandates Covered
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#52525B] text-[11px]">
                <li>India Digital Personal Data Protection Act (DPDP Act 2023 &amp; 2025 Rules)</li>
                <li>European Union General Data Protection Regulation (EU GDPR &amp; ePrivacy)</li>
                <li>United Kingdom Data Use and Access Act (DUAA 2026 &amp; UK GDPR)</li>
                <li>United States California CPRA/CCPA &amp; Multi-State Privacy Regulations</li>
                <li>Nigeria Data Protection Act, 2023 (NDPA 2023 Major Fiduciary Regime)</li>
              </ul>
            </div>
          </div>
        </div>

        {renderFooter(1)}
      </div>

      {/* PAGE 2: 15-GLOBAL SOVEREIGN LAWS MATRIX */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(2, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Globe className="w-4 h-4 text-[#9E7E1B]" />
              2. 15 Sovereign Global Privacy Laws Statutory Matrix
            </h3>

            <table className="w-full text-left text-[10px] border-collapse bg-white border border-[#E5DEC9]">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#52525B] border-b border-[#E5DEC9]">
                  <th className="p-2">Jurisdiction</th>
                  <th className="p-2">Statutory Enactment</th>
                  <th className="p-2">Supervisory Authority</th>
                  <th className="p-2">Statutory Penalty Ceiling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {[
                  {
                    iso: "[IN]",
                    country: "India",
                    law: "DPDP Act 2023 & Draft Rules 2025",
                    body: "Data Protection Board of India (DPBI)",
                    penalty: "Up to ₹250 Crore per breach",
                  },
                  {
                    iso: "[EU]",
                    country: "European Union",
                    law: "GDPR (Reg 2016/679)",
                    body: "European Data Protection Board (EDPB)",
                    penalty: "Up to €20M or 4% global turnover",
                  },
                  {
                    iso: "[UK]",
                    country: "United Kingdom",
                    law: "UK GDPR & DUAA 2026",
                    body: "Information Commissioner's Office (ICO)",
                    penalty: "Up to £17.5M or 4% global turnover",
                  },
                  {
                    iso: "[US]",
                    country: "USA (California)",
                    law: "CPRA / CCPA (Cal. Civ. Code)",
                    body: "California Privacy Protection Agency (CPPA)",
                    penalty: "Up to $7,500 per intentional violation",
                  },
                  {
                    iso: "[BR]",
                    country: "Brazil",
                    law: "LGPD (Law No. 13.709)",
                    body: "Autoridade Nacional (ANPD)",
                    penalty: "Up to 50M BRL per violation",
                  },
                  {
                    iso: "[CA]",
                    country: "Canada",
                    law: "PIPEDA & CPPA",
                    body: "Privacy Commissioner of Canada (OPC)",
                    penalty: "Up to $25M CAD or 5% global revenue",
                  },
                  {
                    iso: "[AU]",
                    country: "Australia",
                    law: "Privacy Act 1988 Reforms",
                    body: "Australian Information Commissioner (OAIC)",
                    penalty: "Up to AU$50M or 30% adjusted turnover",
                  },
                  {
                    iso: "[SG]",
                    country: "Singapore",
                    law: "PDPA 2012",
                    body: "Personal Data Protection Commission (PDPC)",
                    penalty: "Up to SG$1M or 10% annual turnover",
                  },
                  {
                    iso: "[JP]",
                    country: "Japan",
                    law: "APPI 2022/2026",
                    body: "Personal Information Protection Comm (PPC)",
                    penalty: "Up to 100M JPY corporate fine",
                  },
                  {
                    iso: "[AE]",
                    country: "UAE",
                    law: "Federal Decree-Law 45/2021",
                    body: "UAE Data Office / TDRA",
                    penalty: "Up to AED 15M administrative fines",
                  },
                  {
                    iso: "[KR]",
                    country: "South Korea",
                    law: "PIPA 2023 Amendments",
                    body: "Personal Information Protection Comm (PIPC)",
                    penalty: "Up to 3% total revenue",
                  },
                  {
                    iso: "[CH]",
                    country: "Switzerland",
                    law: "revFADP / nDSG 2023",
                    body: "FDPIC / EDÖB",
                    penalty: "Up to CHF 250,000 personal criminal fine",
                  },
                  {
                    iso: "[SA]",
                    country: "Saudi Arabia",
                    law: "Saudi PDPL (Decree M/19)",
                    body: "Saudi Data & AI Authority (SDAIA)",
                    penalty: "Up to SAR 5M + imprisonment",
                  },
                  {
                    iso: "[ZA]",
                    country: "South Africa",
                    law: "POPIA (Act 4 of 2013)",
                    body: "Information Regulator SA",
                    penalty: "Up to ZAR 10M + up to 10 yrs prison",
                  },
                  {
                    iso: "[NG]",
                    country: "Nigeria",
                    law: "Nigeria Data Protection Act 2023",
                    body: "Nigeria Data Protection Commission (NDPC)",
                    penalty: "Up to ₦10M or 2% annual gross revenue",
                  },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold text-[#18181B]">
                      <span className="text-[#9E7E1B] mr-1">{row.iso}</span>
                      {row.country}
                    </td>
                    <td className="p-2 text-[#18181B]">{row.law}</td>
                    <td className="p-2 text-[#52525B]">{row.body}</td>
                    <td className="p-2 text-[#DC2626] font-bold">{row.penalty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {renderFooter(2)}
      </div>

      {/* PAGE 3: NON-COMPLIANCE GAP & PENALTY MATRIX */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(3, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              3. Itemized Non-Compliance Gap &amp; Penalty Risk Matrix
            </h3>

            <div className="space-y-3">
              {[
                {
                  gap: "Gap 1: Missing Section 5 Statutory Itemized Notice",
                  law: "India DPDP Act § 5(1) & 5(2)",
                  finding:
                    "Personal data forms capture user inputs without upfront itemized disclosures in English & Eighth Schedule regional languages.",
                  fine: "Up to ₹250 Crores (Schedule 1, Item 1)",
                  remedy: "Inject ASJi Section 5 Itemized Notice before form submission.",
                },
                {
                  gap: "Gap 2: Unconsented Pre-Tracking & Non-Affirmative Consent",
                  law: "EU GDPR Art. 7 & DPDP Act § 6",
                  finding:
                    "Third-party telemetry scripts execute before explicit affirmative user opt-in.",
                  fine: "Up to €20 Million or 4% Global Turnover",
                  remedy:
                    "Deploy ASJi Client Consent Manager to block pre-consent script execution.",
                },
                {
                  gap: "Gap 3: Unpublished Grievance Redressal Officer Endpoint",
                  law: "DPDP Act § 8(9), § 13 & IT Rules 2021",
                  finding: "No named Grievance Officer details or 48-hour SLA channel in footer.",
                  fine: "Up to ₹50 Crores (Schedule 1, Item 4)",
                  remedy: "Publish designated Grievance Officer charter in website footer.",
                },
                {
                  gap: "Gap 4: Absence of Verifiable Minor Consent Controls",
                  law: "DPDP Act § 9 & GDPR Art. 8",
                  finding:
                    "Application processes user data without minor age-verification or parental consent.",
                  fine: "Up to ₹200 Crores (Schedule 1, Item 3)",
                  remedy: "Implement age-screening modal & disable behavioral ads for minors.",
                },
                {
                  gap: "Gap 5: Unregulated Cross-Border Data Transfer Contracts",
                  law: "EU GDPR Art. 44 & UAE PDPL Art. 22",
                  finding:
                    "Server traffic routes consumer payloads outside origin state without SCCs.",
                  fine: "Up to €20M / Operational Data Suspension",
                  remedy: "Adopt ASJi Standard Contractual Clauses (SCCs) & Adequacy Schedule.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-white border border-[#E5DEC9] rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-[#18181B]">
                    <span>{item.gap}</span>
                    <span className="text-[#DC2626] text-[10px]">{item.fine}</span>
                  </div>
                  <div className="text-[10px] text-[#9E7E1B]">Statute: {item.law}</div>
                  <p className="text-[11px] text-[#52525B] mt-1 font-sans">{item.finding}</p>
                  <div className="text-[10px] text-[#059669] font-semibold pt-1">
                    Statutory Remedy: {item.remedy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderFooter(3)}
      </div>

      {/* PAGE 4: MODEL STATUTORY NOTICE AT COLLECTION */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(4, 10)}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <FileText className="w-4 h-4 text-[#9E7E1B]" />
              4. Model Statutory Notice at Collection (DPDP Sec. 5 &amp; GDPR Art. 13)
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed text-[#18181B]">
              <div className="text-[#9E7E1B] font-mono font-bold uppercase border-b border-[#E5DEC9] pb-2">
                STATUTORY NOTIFICATION AT COLLECTION OF PERSONAL DATA
              </div>

              <p>
                <strong>1. Fiduciary Identity:</strong> Personal data collected via {targetDomain}{" "}
                is processed by {targetDomain} ("Data Fiduciary / Controller").
              </p>

              <p>
                <strong>2. Specified Categories &amp; Purpose:</strong> We process your name,
                contact email, IP address, device identifiers, and session tokens solely for: (a)
                authenticating user access, (b) providing requested services, and (c) maintaining
                network security under legitimate interest and statutory necessity.
              </p>

              <p>
                <strong>3. Itemized Consent Withdrawal:</strong> You reserve the unconditional
                statutory right to withdraw processing consent at any time without penalty by
                visiting our Consent Settings panel or contacting our Grievance Redressal Officer.
              </p>

              <p>
                <strong>4. Multilingual Provision (22 Eighth Schedule Languages):</strong> Pursuant
                to Section 5(3) of the Digital Personal Data Protection Act, 2023, this notice is
                accessible upon request in all 22 official Eighth Schedule Indian languages
                including Hindi, Bengali, Tamil, Telugu, Marathi, and Gujarati.
              </p>

              <p>
                <strong>5. Appellate Channel:</strong> In the event of unresolved grievances within
                30 days, Data Principals may file an appeal before the Data Protection Board of
                India (DPBI) or the respective supervisory authority.
              </p>
            </div>
          </div>
        </div>

        {renderFooter(4)}
      </div>

      {/* PAGE 5: STATUTORY GRIEVANCE REDRESSAL OFFICER CHARTER */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(5, 10)}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Lock className="w-4 h-4 text-[#9E7E1B]" />
              5. Statutory Grievance Redressal Officer Appointment &amp; SLA Charter
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="text-[#9E7E1B] font-mono font-bold uppercase border-b border-[#E5DEC9] pb-2">
                DESIGNATION OF STATUTORY GRIEVANCE REDRESSAL OFFICER
              </div>

              <p className="text-[#52525B]">
                Pursuant to Section 8(9) and Section 13 of the Digital Personal Data Protection Act,
                2023, and Rule 3(2) of the Information Technology (Intermediary Guidelines and
                Digital Media Ethics Code) Rules, 2021, {targetDomain} designates the following
                officer:
              </p>

              <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E5DEC9] space-y-1.5 text-[11px] font-mono">
                <div>
                  <span className="text-[#52525B]">Designated Officer:</span>{" "}
                  <strong className="text-[#18181B]">
                    Chief Grievance Redressal Officer (GRO)
                  </strong>
                </div>
                <div>
                  <span className="text-[#52525B]">Electronic Mail:</span>{" "}
                  <strong className="text-[#9E7E1B]">grievance-officer@{targetDomain}</strong>
                </div>
                <div>
                  <span className="text-[#52525B]">Physical Service Address:</span>{" "}
                  <strong className="text-[#18181B]">
                    Legal &amp; Compliance Division, {targetDomain}
                  </strong>
                </div>
                <div>
                  <span className="text-[#52525B]">Statutory SLA Window:</span>{" "}
                  <strong className="text-[#059669]">
                    Acknowledgement within 24 hours · Final Resolution within 30 days
                  </strong>
                </div>
              </div>

              <div className="text-[#52525B] text-[11px] space-y-1 pt-2">
                <div className="text-[#18181B] font-bold">
                  Mandatory Duties of the Grievance Officer:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    Receive, log, and acknowledge Data Principal privacy grievances within 24 hours.
                  </li>
                  <li>
                    Verify Data Principal identity without demanding intrusive secondary
                    credentials.
                  </li>
                  <li>
                    Execute erasure, restriction, or consent withdrawal across backend databases.
                  </li>
                  <li>
                    Maintain immutable statutory grievance records for at least 180 days for DPBI
                    auditing.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(5)}
      </div>

      {/* PAGE 6: VERIFIABLE PARENTAL CONSENT ADDENDUM FOR MINORS */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(6, 10)}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <ShieldCheck className="w-4 h-4 text-[#9E7E1B]" />
              6. Verifiable Minor Protection &amp; Parental Consent Addendum (Sec. 9)
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="text-[#9E7E1B] font-mono font-bold uppercase border-b border-[#E5DEC9] pb-2">
                STATUTORY MINOR PROTECTION PROTOCOL
              </div>

              <p className="text-[#52525B]">
                Under Section 9 of the DPDP Act 2023 and Article 8 of the EU GDPR, processing
                personal data of children (individuals under 18 years in India, 16 years in EU)
                requires verifiable parental or lawful guardian consent.
              </p>

              <div className="space-y-2.5">
                <div className="p-3.5 bg-[#FAF8F5] border border-[#EF4444]/40 rounded-lg text-[#DC2626] text-[11px]">
                  <strong>Strict Statutory Prohibitions:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-[#52525B]">
                    <li>
                      Prohibition on behavioral monitoring, targeted advertising, or profiling of
                      minors.
                    </li>
                    <li>
                      Prohibition on processing data likely to cause detrimental effects on child
                      well-being.
                    </li>
                  </ul>
                </div>

                <div className="p-3.5 bg-[#FAF8F5] border border-[#10B981]/40 rounded-lg text-[#059669] text-[11px]">
                  <strong>Verifiable Parent Authentication Mechanism:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-[#52525B]">
                    <li>
                      DigiLocker tokenized guardian verification or government identity cross-check.
                    </li>
                    <li>
                      SMS OTP authorization tied to verified guardian mobile subscriber account.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(6)}
      </div>

      {/* PAGE 7: EU STANDARD CONTRACTUAL CLAUSES */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(7, 10)}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Globe className="w-4 h-4 text-[#9E7E1B]" />
              7. Cross-Border Transfer Schedule &amp; Standard Contractual Clauses (SCCs)
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="text-[#9E7E1B] font-mono font-bold uppercase border-b border-[#E5DEC9] pb-2">
                INTERNATIONAL DATA TRANSFER ADEQUACY AGREEMENT
              </div>

              <p className="text-[#52525B]">
                To comply with Chapter V of the EU GDPR, Article 22 of the UAE PDPL, and Section 16
                of the DPDP Act 2023, transfers of personal data outside origin territories to
                third-party processors or cloud data centers require approved Standard Contractual
                Clauses (SCCs) or verified adequacy whitelists.
              </p>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DEC9] rounded-lg space-y-1 text-[11px]">
                <div className="text-[#18181B] font-bold">Binding Transfer Obligations:</div>
                <ul className="list-disc list-inside space-y-1 text-[#52525B]">
                  <li>
                    Data Importers must enforce security measures equal or superior to origin
                    jurisdiction laws.
                  </li>
                  <li>
                    Data Importers agree to submit to statutory supervisory audits upon notice.
                  </li>
                  <li>
                    Encryption keys for transferred payloads must remain managed in high-adequacy
                    HSMs.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(7)}
      </div>

      {/* PAGE 8: DSAR WORKFLOW */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(8, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <CheckCircle2 className="w-4 h-4 text-[#9E7E1B]" />
              8. Data Subject Access Request (DSAR) Intake &amp; Fulfillment Workflow
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="text-[#9E7E1B] font-bold uppercase border-b border-[#E5DEC9] pb-2">
                AUTOMATED DSAR FULFILLMENT TIMELINE (30-DAY SLA)
              </div>

              <div className="space-y-2.5 text-[11px]">
                {[
                  {
                    step: "Phase 1: Verification (Day 1-3)",
                    desc: "Receive DSAR intake request and verify Data Principal identity via single-use email token.",
                  },
                  {
                    step: "Phase 2: Database Discovery (Day 4-10)",
                    desc: "Scan SQL databases, log stores, and third-party processors for matching user identifiers.",
                  },
                  {
                    step: "Phase 3: Redaction & Formatting (Day 11-20)",
                    desc: "Extract matching personal data, redact third-party references, and compile machine-readable JSON/PDF package.",
                  },
                  {
                    step: "Phase 4: Statutory Delivery (Day 21-30)",
                    desc: "Deliver secure encrypted access link or issue confirmation of full erasure across backends.",
                  },
                ].map((s, idx) => (
                  <div key={idx} className="p-3 bg-[#FAF8F5] border border-[#E5DEC9] rounded-lg">
                    <strong className="text-[#18181B] block">{s.step}</strong>
                    <span className="text-[#52525B] mt-0.5 block font-sans">{s.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {renderFooter(8)}
      </div>

      {/* PAGE 9: DPIA & BREACH ESCALATION POLICY */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(9, 10)}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <AlertTriangle className="w-4 h-4 text-[#9E7E1B]" />
              9. Data Protection Impact Assessment (DPIA) &amp; Breach Escalation
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="text-[#9E7E1B] font-mono font-bold uppercase border-b border-[#E5DEC9] pb-2">
                STATUTORY BREACH ESCALATION TIMELINE (72-HOUR MANDATE)
              </div>

              <p className="text-[#52525B]">
                Under Section 8(6) of the DPDP Act 2023 and Article 33 of the EU GDPR, any personal
                data breach must be reported to the supervisory board and each affected individual
                without delay.
              </p>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#EF4444]/40 rounded-lg text-[11px] space-y-1">
                <div className="text-[#DC2626] font-bold">Breach Escalation Sequence:</div>
                <ul className="list-disc list-inside text-[#52525B] space-y-1">
                  <li>
                    <strong className="text-[#18181B]">Hour 0-6:</strong> Contain breach vector,
                    isolate affected servers, and notify DPO/Grievance Officer.
                  </li>
                  <li>
                    <strong className="text-[#18181B]">Hour 6-24:</strong> Assess breach scope,
                    categories of compromised personal data, and estimated impact.
                  </li>
                  <li>
                    <strong className="text-[#18181B]">Hour 24-72:</strong> Submit formal statutory
                    incident notice to DPBI / EDPB and notify affected users.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(9)}
      </div>

      {/* PAGE 10: 4-PHASE BOARD ROADMAP & CERTIFICATE */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between relative">
        <div>
          {renderHeader(10, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Award className="w-4 h-4 text-[#9E7E1B]" />
              10. 4-Phase Executive Rectification Roadmap &amp; Legal Certificate
            </h3>

            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div className="p-3.5 bg-white border border-[#E5DEC9] rounded-lg">
                <strong className="text-[#9E7E1B] block mb-1">
                  Phase 1: Immediate Notices (Day 1-7)
                </strong>
                <span className="text-[#52525B] font-sans">
                  Deploy Section 5 itemized notices, publish Grievance Officer charter, and install
                  cookie CMP script.
                </span>
              </div>
              <div className="p-3.5 bg-white border border-[#E5DEC9] rounded-lg">
                <strong className="text-[#9E7E1B] block mb-1">
                  Phase 2: Consent Gates (Day 8-15)
                </strong>
                <span className="text-[#52525B] font-sans">
                  Enforce zero-leak cookie consent gating and activate verifiable minor age
                  verification.
                </span>
              </div>
              <div className="p-3.5 bg-white border border-[#E5DEC9] rounded-lg">
                <strong className="text-[#9E7E1B] block mb-1">
                  Phase 3: DSAR &amp; Contracts (Day 16-30)
                </strong>
                <span className="text-[#52525B] font-sans">
                  Integrate DSAR intake portal and sign Standard Contractual Clauses with vendors.
                </span>
              </div>
              <div className="p-3.5 bg-white border border-[#E5DEC9] rounded-lg">
                <strong className="text-[#9E7E1B] block mb-1">
                  Phase 4: DPIA Audit (Day 31-45)
                </strong>
                <span className="text-[#52525B] font-sans">
                  Conduct comprehensive DPIA review and issue final board compliance sign-off.
                </span>
              </div>
            </div>

            <div className="mt-6 rounded-xl border-2 border-[#C9A227] bg-white p-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#C9A227] bg-[#0D0E11] p-1.5 mx-auto">
                <ASJiVectorLogo width={40} height={40} />
              </div>
              <h4 className="text-base font-bold text-[#18181B] uppercase tracking-widest font-display">
                Certificate of Statutory Legal Readiness
              </h4>
              <p className="text-[11px] text-[#52525B] max-w-lg mx-auto font-sans">
                This certifies that <strong className="text-[#18181B]">{targetDomain}</strong> has
                been issued the official ASJi 15-Jurisdiction Statutory Legal Suite. Execution of
                the enclosed notices, charters, and contracts establishes statutory due diligence.
              </p>

              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between text-[9.5px] text-[#52525B]">
                <div>
                  Certificate ID: <strong className="text-[#9E7E1B]">{certNumber}</strong>
                </div>
                <div>
                  Issuer: <strong className="text-[#18181B]">ASJi Legal Compliance Desk</strong>
                </div>
                <div>
                  Status: <strong className="text-[#059669]">OFFICIALLY ISSUED</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(10)}
      </div>
    </div>
  );
}
