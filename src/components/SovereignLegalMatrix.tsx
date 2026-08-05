import React, { useState } from "react";
import { Check, Copy, FileText, Shield, Terminal } from "lucide-react";
import { interactiveLegalDrafts } from "@/lib/legal-drafts";

export function SovereignLegalMatrix() {
  const [selectedId, setSelectedId] = useState<string>("ind-dpdp");
  const [copied, setCopied] = useState<boolean>(false);

  const activeDraft =
    interactiveLegalDrafts.find((d) => d.id === selectedId) || interactiveLegalDrafts[0];

  const handleCopy = async () => {
    try {
      const fullTextToCopy = `${activeDraft.titleHeader}\n\n${activeDraft.bodyText}`;
      await navigator.clipboard.writeText(fullTextToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // fallback
    }
  };

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
            <span>Statutory Compliance Architecture</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#E5E5E5] sm:text-3xl">
            Sovereign Legal Drafting Template Sandbox Matrix
          </h2>
          <p className="mt-1 font-mono text-xs text-[#E5E5E5]/70">
            Pre-compiled corporate statutory frameworks for real-time B2B integration
          </p>
        </div>

        {/* Console Signature Badge */}
        <div className="flex items-center gap-2 rounded-lg border border-[#D4AF37]/20 bg-black/60 px-3 py-1.5 font-mono text-[10px] text-[#D4AF37]/90 backdrop-blur-md">
          <Terminal className="h-3.5 w-3.5 animate-pulse text-[#D4AF37]" />
          <span>ASJi LAW-TECH AUTOMATION SUITE // SECURE CONSOLE LOGS ACTIVE</span>
        </div>
      </div>

      {/* Main Grid Partition */}
      <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Module Selection Buttons */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#D4AF37]/80">
            Select Statutory Framework
          </p>
          {interactiveLegalDrafts.map((draft) => {
            const isSelected = draft.id === selectedId;
            return (
              <button
                key={draft.id}
                onClick={() => {
                  setSelectedId(draft.id);
                  setCopied(false);
                }}
                className={`group relative flex cursor-pointer flex-col items-start rounded-2xl border p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-[#D4AF37] bg-black/80 shadow-lg shadow-[#D4AF37]/10"
                    : "border-[#D4AF37]/15 bg-black/40 hover:border-[#D4AF37]/40 hover:bg-black/60"
                }`}
              >
                {/* Selection Indicator Pill */}
                <div className="flex w-full items-center justify-between">
                  <span
                    className={`rounded-md px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
                      isSelected
                        ? "bg-[#D4AF37] text-black"
                        : "bg-[#D4AF37]/10 text-[#D4AF37] group-hover:bg-[#D4AF37]/20"
                    }`}
                  >
                    {draft.tag}
                  </span>
                  <span className="font-mono text-[10px] text-[#E5E5E5]/60">{draft.badge}</span>
                </div>

                <h3
                  className={`mt-2.5 font-display text-sm font-semibold transition-colors ${
                    isSelected ? "text-[#D4AF37]" : "text-[#E5E5E5] group-hover:text-white"
                  }`}
                >
                  {draft.jurisdiction}
                </h3>

                <p className="mt-1 line-clamp-2 font-mono text-[11px] leading-relaxed text-[#E5E5E5]/70">
                  {draft.titleHeader}
                </p>

                {isSelected && (
                  <div className="absolute right-3 bottom-3 h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Column: Document Preview Pane */}
        <div className="relative flex flex-col rounded-2xl border border-[#D4AF37]/20 bg-black/70 p-5 shadow-inner backdrop-blur-2xl sm:p-6 lg:col-span-8">
          {/* Top Bar of Document Preview */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/15 pb-4">
            <div className="flex items-center gap-2.5">
              <FileText className="h-4 w-4 text-[#D4AF37]" />
              <span className="font-mono text-xs font-semibold text-[#D4AF37] uppercase tracking-wider">
                {activeDraft.tag} // {activeDraft.jurisdiction}
              </span>
            </div>

            {/* Copy Action Button */}
            <button
              onClick={handleCopy}
              className={`flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-wider transition-all duration-200 ${
                copied
                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                  : "border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/20"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Professional B2B Compliance Template to Clipboard</span>
                </>
              )}
            </button>
          </div>

          {/* Header Title */}
          <div className="mt-4 rounded-xl border border-[#D4AF37]/10 bg-black/50 p-3.5 font-mono text-xs font-semibold text-[#D4AF37]">
            {activeDraft.titleHeader}
          </div>

          {/* Document Content Box with Watermark Overlay */}
          <div className="relative mt-4 flex-1 overflow-x-auto rounded-xl border border-white/5 bg-[#080808] p-5 font-mono text-xs leading-relaxed text-[#E5E5E5]">
            {/* Watermark Overlay */}
            <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center opacity-[0.03]">
              <p className="rotate-[-12deg] text-center font-mono text-2xl font-black uppercase tracking-widest text-[#D4AF37]">
                ASJi LAW-TECH AUTOMATION SUITE
                <br />
                SECURE CONSOLE LOGS ACTIVE
              </p>
            </div>

            {/* Formatted Legal Text */}
            <pre className="relative z-10 whitespace-pre-wrap font-mono text-xs leading-relaxed text-[#E5E5E5] selection:bg-[#D4AF37]/30 selection:text-white">
              {activeDraft.bodyText}
            </pre>
          </div>

          {/* Footer Bar */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-[#E5E5E5]/50">
            <span>Cryptographically Verified Statutory Template</span>
            <span className="text-[#D4AF37]/70">
              ASJi LAW-TECH AUTOMATION SUITE // SECURE CONSOLE LOGS ACTIVE
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
