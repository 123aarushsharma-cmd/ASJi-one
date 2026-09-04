import React, { useState, useMemo } from "react";
import {
  Check,
  Copy,
  Download,
  FileCode,
  FileText,
  Globe,
  Scale,
  Search,
  Shield,
  ShieldAlert,
  Terminal,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { interactiveLegalDrafts, type LegalDraft } from "@/lib/legal-drafts";

interface SovereignLegalMatrixProps {
  onOpenRemediationModal?: () => void;
  isUnlocked?: boolean;
}

export function SovereignLegalMatrix({
  onOpenRemediationModal,
  isUnlocked = false,
}: SovereignLegalMatrixProps) {
  const [selectedId, setSelectedId] = useState<string>("ind-dpdp");
  const [activeRegion, setActiveRegion] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"document" | "articles">("document");
  const [copied, setCopied] = useState<boolean>(false);

  const filteredDrafts = useMemo(() => {
    return interactiveLegalDrafts.filter((draft) => {
      const matchesRegion = activeRegion === "ALL" || draft.region === activeRegion;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRegion;
      const matchesSearch =
        draft.jurisdiction.toLowerCase().includes(q) ||
        draft.tag.toLowerCase().includes(q) ||
        draft.statutoryReference.toLowerCase().includes(q) ||
        draft.governingBody.toLowerCase().includes(q) ||
        draft.titleHeader.toLowerCase().includes(q) ||
        draft.executiveSummary.toLowerCase().includes(q) ||
        draft.keyArticles.some(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            a.ref.toLowerCase().includes(q) ||
            a.desc.toLowerCase().includes(q),
        );
      return matchesRegion && matchesSearch;
    });
  }, [activeRegion, searchQuery]);

  const activeDraft: LegalDraft =
    interactiveLegalDrafts.find((d) => d.id === selectedId) ||
    filteredDrafts[0] ||
    interactiveLegalDrafts[0];

  // Concise 2-to-4 line executive statutory excerpt tailored to the law
  const conciseExcerpt = useMemo(() => {
    switch (activeDraft.id) {
      case "ind-dpdp":
        return `Pursuant to Sections 5(1) & 13 of the Digital Personal Data Protection Act, 2023, data processing across this digital asset is restricted to verified legitimate uses with mandatory itemized notices. Shri/Smt. [Grievance Officer Name] is designated with a 48-hour resolution mandate and DPBI escalation protocols. Tracking or behavioral profiling of minors under 18 is strictly blocked.`;
      case "uae-pdpl":
        return `Under Federal Decree-Law No. 45 of 2021 (UAE PDPL), personal data is processed strictly in accordance with cross-border transfer protections and Data Office supervisory mandates. Data Subjects maintain statutory rights to erasure, objection, and rectification under Articles 13–18.`;
      case "eu-gdpr":
        return `In compliance with Articles 13 & 14 of Regulation (EU) 2016/679 (GDPR), users are provided transparent notices regarding controller identity, lawful bases for processing, and 30-day SAR redressal. Unconsented cross-border data flows are restricted under EU Standard Contractual Clauses (SCCs).`;
      case "us-cpra":
        return `In accordance with Cal. Civ. Code § 1798.100 et seq. (CCPA/CPRA), California residents retain affirmative rights to opt-out of the sale/sharing of personal information and limit sensitive data processing. Automated tracking signals (GPC) are honored at the edge without discrimination.`;
      case "sg-pdpa":
        return `Pursuant to Singapore's Personal Data Protection Act 2012 (No. 26 of 2012), data collection is limited to reasonable business purposes with mandatory PDPC 72-hour breach notification protocols and designated DPO accountability channels.`;
      case "brazil-lgpd":
        return `Under Brazilian General Data Protection Law (Lei 13.709/2018 - LGPD), all personal data handling conforms to ANPD statutory standards with active Encarregado (DPO) oversight and verifiable legitimate interest impact assessments.`;
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

  const regions = [
    { label: "All 6 Sovereign Regimes", value: "ALL" },
    { label: "🇮🇳 India (DPDP)", value: "Asia-Pacific" },
    { label: "🇦🇪 UAE (PDPL)", value: "Middle East" },
    { label: "🇪🇺 Europe & UK (GDPR)", value: "Europe & UK" },
    { label: "🌎 Americas (CPRA / LGPD)", value: "Americas" },
  ];

  return (
    <section
      id="legal-matrix"
      className="relative my-16 rounded-3xl border p-6 shadow-2xl transition-all sm:p-8 md:p-10"
      style={{
        backgroundColor: "#0d0d0d",
        borderColor: "rgba(212, 175, 55, 0.22)",
        backdropFilter: "blur(30px)",
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.8), 0 0 30px rgba(212, 175, 55, 0.05)",
      }}
    >
      {/* Background Accent Glow */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />

      {/* Section Header */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-4 border-b border-[#D4AF37]/15 pb-6 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#D4AF37] uppercase">
            <Shield className="h-3.5 w-3.5" />
            <span>6 Sovereign Data Protection Regimes</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#E5E5E5] sm:text-3xl">
            Sovereign Legal Drafting Sandbox &amp; Compliance Matrix
          </h2>
          <p className="mt-1 font-mono text-xs text-[#E5E5E5]/70">
            Tailored 2-to-4 line statutory disclosures &amp; turnkey legal drafting templates for
            India, UAE, Europe (GDPR), United States (CPRA), Singapore (PDPA), and Brazil (LGPD).
          </p>
        </div>

        {/* Console Signature Badge */}
        <div className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/20 bg-black/60 px-3 py-1.5 font-mono text-[10px] text-[#D4AF37]/90 backdrop-blur-md">
          <Terminal className="h-3.5 w-3.5 animate-pulse text-[#D4AF37]" />
          <span>ASJi LAW-TECH SUITE // 6 SOVEREIGN PROTOCOLS</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="relative z-10 mt-6 flex flex-col gap-4 border-b border-[#D4AF37]/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Region Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {regions.map((reg) => (
            <button
              key={reg.value}
              onClick={() => setActiveRegion(reg.value)}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold transition-all duration-150 cursor-pointer ${
                activeRegion === reg.value
                  ? "border border-[#D4AF37] bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                  : "border border-white/10 bg-white/5 text-[#E5E5E5]/70 hover:border-[#D4AF37]/40 hover:text-white"
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[260px] max-w-sm">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#D4AF37]/60" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clauses, articles, penalties..."
            className="w-full rounded-xl border border-[#D4AF37]/20 bg-black/60 py-2 pr-3 pl-9 font-mono text-xs text-[#E5E5E5] placeholder-[#E5E5E5]/40 outline-none transition-all focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 font-mono text-[10px] text-[#E5E5E5]/50 hover:text-white cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Partition */}
      <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: 6 Sovereign Law Selection Cards */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#D4AF37]/80">
              Select Statutory Framework ({filteredDrafts.length} of 6)
            </p>
            <span className="font-mono text-[10px] text-[#E5E5E5]/50">
              Official 2025/2026 Standards
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
            {filteredDrafts.map((draft) => {
              const isSelected = draft.id === activeDraft.id;
              return (
                <button
                  key={draft.id}
                  onClick={() => {
                    setSelectedId(draft.id);
                    setCopied(false);
                  }}
                  className={`group relative flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
                    isSelected
                      ? "border-[#D4AF37] bg-black/90 shadow-xl shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]/50"
                      : "border-[#D4AF37]/15 bg-black/40 hover:border-[#D4AF37]/40 hover:bg-black/70"
                  }`}
                >
                  {/* Selection Indicator Pill */}
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{draft.flag}</span>
                      <span
                        className={`rounded-md px-2 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
                          isSelected
                            ? "bg-[#D4AF37] text-black"
                            : "bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37]/20"
                        }`}
                      >
                        {draft.tag}
                      </span>
                    </div>
                    <span className="font-mono text-[9.5px] text-[#E5E5E5]/60 truncate max-w-[130px]">
                      {draft.badge}
                    </span>
                  </div>

                  <h3
                    className={`mt-2 font-display text-sm font-semibold transition-colors ${
                      isSelected ? "text-[#D4AF37]" : "text-[#E5E5E5] group-hover:text-white"
                    }`}
                  >
                    {draft.jurisdiction}
                  </h3>

                  <p className="mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed text-[#E5E5E5]/70">
                    {draft.titleHeader}
                  </p>

                  <div className="mt-2.5 flex w-full items-center justify-between border-t border-white/5 pt-2 font-mono text-[9.5px] text-[#E5E5E5]/50">
                    <span className="text-[#D4AF37]/80 truncate max-w-[160px]">
                      {draft.governingBody.split("/")[0]}
                    </span>
                    <span className="text-rose-400 font-medium">
                      Penalty: {draft.statutoryPenalty.split(" ")[0]}{" "}
                      {draft.statutoryPenalty.split(" ")[1]}
                    </span>
                  </div>

                  {isSelected && (
                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                  )}
                </button>
              );
            })}

            {filteredDrafts.length === 0 && (
              <div className="rounded-2xl border border-white/10 bg-black/40 p-6 text-center">
                <ShieldAlert className="mx-auto h-8 w-8 text-[#D4AF37]/60" />
                <p className="mt-2 font-mono text-xs text-[#E5E5E5]/70">
                  No statutory frameworks matched &ldquo;{searchQuery}&rdquo;
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveRegion("ALL");
                  }}
                  className="mt-3 rounded-lg border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 font-mono text-xs text-[#D4AF37] cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 2-to-4 Line Statutory Excerpt & Unlock Action Pane */}
        <div className="relative flex flex-col rounded-2xl border border-[#D4AF37]/20 bg-black/80 p-5 shadow-inner backdrop-blur-2xl sm:p-6 lg:col-span-8">
          {/* Top Bar of Document Preview */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/15 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">{activeDraft.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                    {activeDraft.tag} // {activeDraft.jurisdiction}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 font-mono text-[9px] text-emerald-400">
                    Statutory Compliant
                  </span>
                </div>
                <p className="font-mono text-[10px] text-[#E5E5E5]/60">
                  Supervisory Authority: {activeDraft.governingBody}
                </p>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-white/10 bg-black/60 p-1">
              <button
                onClick={() => setViewMode("document")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs transition-all cursor-pointer ${
                  viewMode === "document"
                    ? "bg-[#D4AF37] font-bold text-black shadow-sm"
                    : "text-[#E5E5E5]/70 hover:text-white"
                }`}
              >
                <FileText className="h-3 w-3" />
                <span>Statutory Excerpt (2-4 Lines)</span>
              </button>
              <button
                onClick={() => setViewMode("articles")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1 font-mono text-xs transition-all cursor-pointer ${
                  viewMode === "articles"
                    ? "bg-[#D4AF37] font-bold text-black shadow-sm"
                    : "text-[#E5E5E5]/70 hover:text-white"
                }`}
              >
                <Scale className="h-3 w-3" />
                <span>Key Articles ({activeDraft.keyArticles.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Statutory Metadata Ribbon */}
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3 rounded-xl border border-[#D4AF37]/15 bg-black/60 p-3 font-mono text-xs">
            <div>
              <span className="text-[10px] uppercase text-[#E5E5E5]/50 block">
                Statutory Reference
              </span>
              <span className="text-[#D4AF37] font-semibold text-[11px] line-clamp-1">
                {activeDraft.statutoryReference}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#E5E5E5]/50 block">
                Maximum Statutory Exposure
              </span>
              <span className="text-rose-400 font-semibold text-[11px] line-clamp-1">
                {activeDraft.statutoryPenalty}
              </span>
            </div>
            <div>
              <span className="text-[10px] uppercase text-[#E5E5E5]/50 block">
                Jurisdiction Region
              </span>
              <span className="text-[#E5E5E5] font-semibold text-[11px] line-clamp-1">
                {activeDraft.region} // {activeDraft.badge}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/10 pb-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[11px] text-[#E5E5E5]/60">Statutory Actions:</span>
              <button
                onClick={() => handleDownload("md")}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] text-[#E5E5E5] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
                title="Download as Markdown"
              >
                <Download className="h-3 w-3" />
                <span>Download (.md)</span>
              </button>
              <button
                onClick={() => handleDownload("txt")}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 font-mono text-[11px] text-[#E5E5E5] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] transition-all"
                title="Download as Text"
              >
                <FileCode className="h-3 w-3" />
                <span>Text (.txt)</span>
              </button>
            </div>

            {/* Copy Action Button */}
            <button
              onClick={handleCopy}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3.5 py-1.5 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                copied
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400 shadow-md shadow-emerald-500/10"
                  : "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
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

          {/* View Content Area: 2-to-4 Line Statutory Notice View */}
          {viewMode === "document" ? (
            <div className="mt-4 flex flex-col gap-4">
              {/* 2 to 4 Line Statutory Executive Notice */}
              <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-[#121212] to-black p-4 font-mono">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-primary" />
                    Statutory Legal Excerpt (Tailored 2–4 Line Notice):
                  </span>
                  <span className="text-[9.5px] text-muted-foreground">
                    Section {activeDraft.statutoryReference.split(",")[0]}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-foreground font-sans italic bg-black/40 p-3 rounded-lg border border-white/5">
                  &ldquo;{conciseExcerpt}&rdquo;
                </p>
              </div>

              {/* Unlocked Complete Draft vs Blurred Preview with Transaction CTA */}
              {isUnlocked ? (
                <div className="relative mt-2 overflow-x-auto rounded-xl border border-white/10 bg-[#080808] p-4 font-mono text-xs leading-relaxed text-[#E5E5E5] max-h-[360px] overflow-y-auto">
                  <pre className="whitespace-pre-wrap">{activeDraft.bodyText}</pre>
                </div>
              ) : (
                <div className="relative mt-2 rounded-xl border border-primary/30 bg-black/70 p-5 overflow-hidden">
                  {/* Blurred Text Teaser */}
                  <div className="select-none blur-[3.5px] opacity-40 font-mono text-[11px] leading-relaxed text-muted-foreground max-h-24 overflow-hidden">
                    <p>{activeDraft.bodyText.slice(0, 450)}</p>
                  </div>

                  {/* Transaction & Unlock Callout */}
                  <div className="relative z-10 -mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-primary/40 bg-black/90 p-4 shadow-xl backdrop-blur-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h4 className="font-display text-sm font-bold text-gold-gradient">
                          Unlock Complete Unredacted Legal Draft &amp; Contract Pack
                        </h4>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Includes full bilingual clauses, DPO appointment agreements, and Data
                        Protection Board filing dossiers.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenRemediationModal && onOpenRemediationModal()}
                      className="btn-gold flex items-center gap-2 rounded-xl px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black cursor-pointer shadow-lg shadow-primary/20 shrink-0"
                    >
                      <Zap className="h-3.5 w-3.5" />
                      <span>Initiate Transaction &amp; Unlock Suite</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 flex-1 flex flex-col gap-3 max-h-[440px] overflow-y-auto pr-1">
              <div className="rounded-xl border border-[#D4AF37]/20 bg-black/60 p-3 font-mono text-xs text-[#D4AF37]">
                Key Statutory Articles &amp; Enforcement Directives for {activeDraft.jurisdiction}:
              </div>
              {activeDraft.keyArticles.map((article, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-white/10 bg-[#121212] p-3.5 font-mono transition-all hover:border-[#D4AF37]/30"
                >
                  <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
                    <span className="font-bold text-[#E5E5E5] text-xs flex items-center gap-2">
                      <Scale className="h-3.5 w-3.5 text-[#D4AF37]" />
                      {article.title}
                    </span>
                    <span className="rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                      {article.ref}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#E5E5E5]/75 leading-relaxed">{article.desc}</p>
                </div>
              ))}

              <div className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-3.5 font-mono text-xs text-rose-200">
                <div className="flex items-center gap-2 font-bold text-rose-400 mb-1">
                  <ShieldAlert className="h-4 w-4 text-rose-400" />
                  <span>Statutory Penalty &amp; Regulatory Sanctions Ceiling</span>
                </div>
                <p className="text-rose-300/80 leading-relaxed">
                  {activeDraft.statutoryPenalty}. Non-compliance with mandatory notice, consent, or
                  data breach protocols is subject to direct administrative action by{" "}
                  {activeDraft.governingBody}.
                </p>
              </div>
            </div>
          )}

          {/* Footer Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3 font-mono text-[10px] text-[#E5E5E5]/50">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3 w-3 text-[#D4AF37]" />
              Cryptographically Verified Against 6 Sovereign International Regimes
            </span>
            <span className="text-[#D4AF37]/70">
              ASJi SOVEREIGN LAW-TECH AUTOMATION // VERIFIED STATUTORY INSTRUMENTS
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
