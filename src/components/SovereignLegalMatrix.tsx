import React, { useState, useMemo, useEffect } from "react";
import {
  Check,
  Copy,
  Download,
  FileCode,
  FileText,
  Globe,
  Scale,
  Shield,
  ShieldAlert,
  Lock,
  ArrowRight,
} from "lucide-react";
import { interactiveLegalDrafts, type LegalDraft } from "@/lib/legal-drafts";

const FRAMEWORK_TO_DRAFT_ID: Record<string, string> = {
  "ind-dpdp": "ind-dpdp",
  "eu-gdpr": "eu-gdpr",
  "uk-duaa": "uk-duaa",
  "us-cpra": "us-cpra",
  "uae-pdpl": "ae-pdpl",
  "ksa-pdpl": "ksa-pdpl",
  "sg-pdpa": "sg-pdpa",
  "brazil-lgpd": "br-lgpd",
  "canada-pipeda": "canada-pipeda",
  "aus-privacy": "aus-privacy",
  "jp-appi": "jp-appi",
  "kr-pipa": "kr-pipa",
  "ch-fadp": "ch-fadp",
  "za-popia": "za-popia",
  "ng-ndpa": "ng-ndpa",
};

interface SovereignLegalMatrixProps {
  onOpenRemediationModal?: () => void;
  isUnlocked?: boolean;
  selectedFramework?: string;
}

export function SovereignLegalMatrix({
  onOpenRemediationModal,
  isUnlocked = false,
  selectedFramework,
}: SovereignLegalMatrixProps) {
  const [selectedId, setSelectedId] = useState<string>(
    (selectedFramework && FRAMEWORK_TO_DRAFT_ID[selectedFramework]) || "ind-dpdp",
  );
  const [viewMode, setViewMode] = useState<"document" | "articles">("document");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (selectedFramework && FRAMEWORK_TO_DRAFT_ID[selectedFramework]) {
      setSelectedId(FRAMEWORK_TO_DRAFT_ID[selectedFramework]);
      setCopied(false);
    }
  }, [selectedFramework]);

  const activeDraft: LegalDraft =
    interactiveLegalDrafts.find((d) => d.id === selectedId) || interactiveLegalDrafts[0];

  // Concise 2-to-4 line executive statutory excerpt tailored to the law
  const conciseExcerpt = useMemo(() => {
    switch (activeDraft.id) {
      case "ind-dpdp":
        return `Pursuant to Sections 5(1) & 13 of the Digital Personal Data Protection Act, 2023, data processing across this digital asset is restricted to verified legitimate uses with mandatory itemized notices. Arush Sharma is designated Grievance Officer with a 48-hour resolution mandate and DPBI escalation protocols. Tracking or behavioral profiling of minors under 18 is strictly blocked.`;
      case "uae-pdpl":
      case "ae-pdpl":
        return `Under Federal Decree-Law No. 45 of 2021 (UAE PDPL), personal data is processed strictly in accordance with cross-border transfer protections and Data Office supervisory mandates. Data Subjects maintain statutory rights to erasure, objection, and rectification under Articles 13–18.`;
      case "eu-gdpr":
        return `In compliance with Articles 13 & 14 of Regulation (EU) 2016/679 (GDPR), users are provided transparent notices regarding controller identity, lawful bases for processing, and 30-day SAR redressal. Unconsented cross-border data flows are restricted under EU Standard Contractual Clauses (SCCs).`;
      case "us-cpra":
        return `In accordance with Cal. Civ. Code § 1798.100 et seq. (CCPA/CPRA), California residents retain affirmative rights to opt-out of the sale/sharing of personal information and limit sensitive data processing. Automated tracking signals (GPC) are honored at the edge without discrimination.`;
      case "sg-pdpa":
        return `Pursuant to Singapore's Personal Data Protection Act 2012 (No. 26 of 2012), data collection is limited to reasonable business purposes with mandatory PDPC 72-hour breach notification protocols and designated DPO accountability channels.`;
      case "brazil-lgpd":
      case "br-lgpd":
        return `Under Brazilian General Data Protection Law (Lei 13.709/2018 - LGPD), all personal data handling conforms to ANPD statutory standards with active Encarregado (DPO) oversight and verifiable legitimate interest impact assessments.`;
      case "uk-duaa":
      case "gb-ukgdpr":
        return `In strict accordance with the UK GDPR, Data Protection Act 2018, and Data (Use and Access) Act (DUAA 2026), telemetry processing adheres to PECR Regulation 6 standards, Senior Responsible Individual (SRI) governance, and ICO International Data Transfer Addendum (IDTA) safeguards.`;
      case "canada-pipeda":
      case "ca-pipeda":
        return `Conforming to Schedule 1 of PIPEDA (SC 2000 c.5) and pending CPPA mandates, data processing satisfies the Ten Fair Information Principles: verified meaningful consent, designated Privacy Officer accountability, and mandatory Real Risk of Significant Harm (RROSH) breach reporting.`;
      case "aus-privacy":
      case "au-privacy":
        return `Pursuant to the Privacy Act 1988 (Cth) and Australian Privacy Principles (APPs 1–13), collection notices strictly observe APP 5 disclosures, cross-border transfers satisfy APP 8 offshore recipient controls, and eligible breaches trigger 30-day NDB scheme notifications.`;
      case "jp-appi":
        return `Under Japan's Act on the Protection of Personal Information (APPI Act No. 57 of 2003), utilization purposes are explicitly defined, third-party and cross-border provisions require affirmative opt-in consent under Articles 27 & 28, and robust security safeguards are maintained.`;
      case "kr-pipa":
        return `Pursuant to South Korea's Personal Information Protection Act (PIPA Act No. 10465), consent acquisition is segregated under Article 22, designated Privacy Officer oversight is active under Article 31, and international transfers strictly adhere to Article 28-8 requirements.`;
      case "ch-fadp":
        return `Under the Swiss Federal Act on Data Protection (Revised FADP SR 235.1), systems maintain Privacy by Design and by Default under Article 7, transparent collection duties under Article 19, and immediate FDPIC security incident notifications under Article 24.`;
      case "ksa-pdpl":
      case "sa-pdpl":
        return `Under Royal Decree No. M/19 and SDAIA regulations, personal data processing within Saudi Arabia requires verified statutory consent, national data sovereignty compliance under Article 29, and mandatory 72-hour regulatory breach disclosure.`;
      case "za-popia":
        return `In adherence to South Africa's Protection of Personal Information Act (POPIA Act 4 of 2013), processing is bound by the Eight Lawful Conditions (Sections 8–25), designated Information Officer registration under Section 55, and strict direct marketing bars under Section 69.`;
      case "ng-ndpa":
        return `Pursuant to the Nigeria Data Protection Act, 2023 (NDPA Act No. 43 of 2023), processing adheres to lawful principles under Section 24, affirmative consent under Section 25, designated Data Protection Officer oversight under Section 32, and mandatory 72-hour NDPC breach notification under Section 40.`;
      default:
        return activeDraft.executiveSummary;
    }
  }, [activeDraft]);

  const handleCopy = async () => {
    try {
      const textToCopy = isUnlocked
        ? `${activeDraft.titleHeader}\n\n${activeDraft.bodyText}`
        : `${activeDraft.titleHeader}\n\n[STATUTORY EXECUTIVE EXCERPT]\n${conciseExcerpt}\n\n[STATUTORY REFERENCE]: ${activeDraft.statutoryReference}\n[SUPERVISORY BODY]: ${activeDraft.governingBody}\n[PENALTY CEILING]: ${activeDraft.statutoryPenalty}`;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleDownload = (format: "txt" | "md") => {
    if (!isUnlocked && onOpenRemediationModal) {
      onOpenRemediationModal();
      return;
    }

    const filename = `${activeDraft.tag.toLowerCase()}-statutory-template.${format}`;
    const header =
      format === "md"
        ? `# ${activeDraft.titleHeader}\n\n**Jurisdiction:** ${activeDraft.jurisdiction}\n**Governing Body:** ${activeDraft.governingBody}\n**Statutory Reference:** ${activeDraft.statutoryReference}\n**Penalty Ceiling:** ${activeDraft.statutoryPenalty}\n\n---\n\n`
        : ``;
    const content = `${header}${activeDraft.bodyText}`;
    const blob = new Blob([content], {
      type: format === "md" ? "text/markdown;charset=utf-8" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <section
      id="legal-matrix"
      className="surface-panel my-16 rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8 md:p-10"
    >
      {/* Section Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#262932] pb-6 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider text-[#C9A227] uppercase">
            <Shield className="h-3.5 w-3.5" />
            <span>15 Sovereign Data Protection Regimes</span>
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAF8F5] sm:text-3xl">
            Sovereign Legal Drafting &amp; Compliance Matrix
          </h2>
          <p className="mt-1 font-sans text-xs text-muted-foreground">
            Synchronized directly with your active jurisdiction in the Sovereign Privacy Atlas above
            for tailored statutory disclosures and legal drafting templates.
          </p>
        </div>

        <span className="font-mono text-[11px] text-[#C9A227] whitespace-nowrap">
          Synced to Atlas · {activeDraft.tag}
        </span>
      </div>

      {/* Main Legal Drafting Sandbox on Warm Alabaster (#FAF8F5) */}
      <div className="mt-6">
        <div className="legal-paper flex flex-col rounded-md border border-[#E5DEC9] bg-[#FAF8F5] p-5 sm:p-7 text-[#18181B]">
          {/* Top Bar of Legal Document Preview */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E5DEC9] pb-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs font-bold px-2 py-1 rounded border border-[#E5DEC9] bg-[#F3EFE6] text-[#18181B]">
                {activeDraft.flag}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#9A7812] uppercase tracking-wider">
                    {activeDraft.tag} · {activeDraft.jurisdiction}
                  </span>
                  <span className="rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 font-mono text-[10px] font-semibold text-[#065F46]">
                    Statutory Standard
                  </span>
                </div>
                <p className="font-mono text-[11px] text-[#52525B] mt-0.5">
                  Statutory Reference: {activeDraft.statutoryReference}
                </p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-md border border-[#E5DEC9] bg-[#F3EFE6] p-1">
              <button
                onClick={() => setViewMode("document")}
                className={`flex items-center gap-1.5 rounded px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  viewMode === "document"
                    ? "bg-[#18181B] font-bold text-[#FAF8F5]"
                    : "text-[#52525B] hover:text-[#18181B]"
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>Statutory Excerpt</span>
              </button>
              <button
                onClick={() => setViewMode("articles")}
                className={`flex items-center gap-1.5 rounded px-3 py-1 font-mono text-xs transition-colors cursor-pointer ${
                  viewMode === "articles"
                    ? "bg-[#18181B] font-bold text-[#FAF8F5]"
                    : "text-[#52525B] hover:text-[#18181B]"
                }`}
              >
                <Scale className="h-3 w-3" />
                <span>Key Articles ({activeDraft.keyArticles.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Statutory Metadata Ribbon */}
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 rounded-md border border-[#E5DEC9] bg-[#F3EFE6]/60 p-3.5 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#52525B] block">
                Statutory Reference
              </span>
              <span className="text-[#18181B] font-semibold text-[11px] leading-snug block mt-0.5">
                {activeDraft.statutoryReference}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#52525B] block">
                Maximum Statutory Exposure
              </span>
              <span className="text-[#B91C1C] font-semibold text-[11px] leading-snug block mt-0.5">
                {activeDraft.statutoryPenalty}
              </span>
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <span className="text-[10px] uppercase text-[#52525B] block">
                Jurisdiction Region
              </span>
              <span className="text-[#18181B] font-semibold text-[11px] leading-snug block mt-0.5">
                {activeDraft.region} · {activeDraft.badge}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#52525B]">Actions:</span>
              <button
                onClick={() => handleDownload("md")}
                className="flex cursor-pointer items-center gap-1.5 rounded border border-[#E5DEC9] bg-white px-2.5 py-1.5 font-mono text-[11px] text-[#18181B] hover:border-[#C9A227] transition-colors"
                title="Download as Markdown"
              >
                <Download className="h-3 w-3 text-[#9A7812]" />
                <span>Download (.md)</span>
              </button>
              <button
                onClick={() => handleDownload("txt")}
                className="flex cursor-pointer items-center gap-1.5 rounded border border-[#E5DEC9] bg-white px-2.5 py-1.5 font-mono text-[11px] text-[#18181B] hover:border-[#C9A227] transition-colors"
                title="Download as Text"
              >
                <FileCode className="h-3 w-3 text-[#9A7812]" />
                <span>Text (.txt)</span>
              </button>
            </div>

            {/* Copy Action Button */}
            <button
              onClick={handleCopy}
              className={`flex cursor-pointer items-center gap-2 rounded border px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors ${
                copied
                  ? "border-[#10B981] bg-[#10B981]/10 text-[#065F46]"
                  : "border-[#18181B] bg-[#18181B] text-[#FAF8F5] hover:bg-[#27272A]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-[#10B981]" />
                  <span>Copied Statutory Excerpt</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Statutory Excerpt</span>
                </>
              )}
            </button>
          </div>

          {/* View Content Area: Statutory Notice View */}
          {viewMode === "document" ? (
            <div className="mt-4 flex flex-col gap-4">
              {/* Statutory Executive Notice */}
              <div className="rounded-md border border-[#E5DEC9] bg-white p-5">
                <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2 mb-3">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#9A7812] flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5" />
                    Statutory Notice Excerpt
                  </span>
                  <span className="font-mono text-[10px] text-[#52525B]">
                    {activeDraft.statutoryReference.split(",")[0]}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-[#18181B] font-display italic">
                  &ldquo;{conciseExcerpt}&rdquo;
                </p>
              </div>

              {/* Unlocked Complete Draft vs Preview with Generate Statutory Pack CTA */}
              {isUnlocked ? (
                <div className="overflow-x-auto rounded-md border border-[#E5DEC9] bg-white p-5 font-mono text-xs leading-relaxed text-[#18181B] max-h-[360px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{activeDraft.bodyText}</pre>
                </div>
              ) : (
                <div className="rounded-md border border-[#E5DEC9] bg-[#F3EFE6] p-5 space-y-4">
                  <div className="select-none opacity-60 font-mono text-[11px] leading-relaxed text-[#52525B] max-h-24 overflow-hidden">
                    <p>{activeDraft.bodyText.slice(0, 420)}...</p>
                  </div>

                  {/* Statutory Pack CTA */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-md border border-[#262932] bg-[#15171C] p-5 text-[#FAF8F5]">
                    <div>
                      <div className="flex items-center gap-2">
                        <Lock className="h-4 w-4 text-[#C9A227]" />
                        <h4 className="font-display text-base font-bold text-[#FAF8F5]">
                          Complete Unredacted Legal Draft &amp; Contract Pack
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Includes full bilingual clauses, DPO appointment agreements, and Data
                        Protection Board filing dossiers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenRemediationModal && onOpenRemediationModal()}
                      className="btn-gold flex items-center gap-2 rounded-md px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
                    >
                      <span>Generate Statutory Pack</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex-1 flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1">
              <div className="rounded-md border border-[#E5DEC9] bg-[#F3EFE6] p-3 font-mono text-xs font-bold text-[#18181B]">
                Key Statutory Articles &amp; Enforcement Directives for {activeDraft.jurisdiction}:
              </div>
              {activeDraft.keyArticles.map((article, idx) => (
                <div
                  key={idx}
                  className="rounded-md border border-[#E5DEC9] bg-white p-3.5 font-sans transition-colors hover:border-[#C9A227]"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-[#E5DEC9] pb-2">
                    <span className="font-display font-bold text-[#18181B] text-sm flex items-center gap-2">
                      <Scale className="h-3.5 w-3.5 text-[#9A7812]" />
                      {article.title}
                    </span>
                    <span className="rounded border border-[#E5DEC9] bg-[#F3EFE6] px-2 py-0.5 font-mono text-[10px] font-bold text-[#9A7812]">
                      {article.ref}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#52525B] leading-relaxed">{article.desc}</p>
                </div>
              ))}

              <div className="rounded-md border border-[#EF4444]/40 bg-[#FEF2F2] p-3.5 font-mono text-xs text-[#7F1D1D]">
                <div className="flex items-center gap-2 font-bold text-[#EF4444] mb-1">
                  <ShieldAlert className="h-4 w-4" />
                  <span>Statutory Penalty &amp; Regulatory Sanctions Ceiling</span>
                </div>
                <p className="leading-relaxed">
                  {activeDraft.statutoryPenalty}. Non-compliance with mandatory notice, consent, or
                  data breach protocols is subject to statutory enforcement and administrative
                  penalties.
                </p>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5DEC9] pt-3 font-mono text-[10px] text-[#52525B]">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-[#9A7812]" />
              Verified Against 15 Sovereign International Regimes
            </span>
            <span className="text-[#9A7812] font-semibold">
              ASJi Law-Tech Standard · Statutory Instruments
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
