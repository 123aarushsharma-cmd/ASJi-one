import React, { useState } from "react";
import {
  Scale,
  ShieldAlert,
  FileText,
  Copy,
  Check,
  Download,
  AlertTriangle,
  Building2,
  Lock,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { AuditReport } from "@/lib/audit-types";
import {
  generateStatutoryLegalSolution,
  type StatutoryLegalSolutionSuite,
} from "@/lib/statutory-legal-solutions";

interface StatutoryLegalSolutionCardProps {
  report: AuditReport | null;
  frameworkId?: string;
  isUnlocked?: boolean;
  unlockedTier?: string | null;
  onOpenUnlockModal?: (preselectedTier?: string) => void;
}

export function StatutoryLegalSolutionCard({
  report,
  frameworkId = "ind-dpdp",
  isUnlocked = false,
  unlockedTier = null,
  onOpenUnlockModal,
}: StatutoryLegalSolutionCardProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const solution: StatutoryLegalSolutionSuite = generateStatutoryLegalSolution(report, frameworkId);

  const handleCopyText = async (text: string, sectionKey: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(sectionKey);
      toast.success(`${label} Copied`, {
        description: "Tailored statutory text has been copied to your clipboard.",
      });
      setTimeout(() => setCopiedSection(null), 2500);
    } catch {
      toast.error("Failed to copy", { description: "Please copy the text manually." });
    }
  };

  const handleDownloadFullSuite = () => {
    const fullText = `================================================================================
ASJi ONE // TAILORED STATUTORY LEGAL SOLUTION & NON-COMPLIANCE SUITE
Target Domain : ${solution.targetDomain}
Governing Law : ${solution.lawName}
Enforcing Body: ${solution.authority}
Origin Country: ${solution.country}
Issue Date    : ${new Date().toUTCString()}
================================================================================

WHAT YOU DO NOT FOLLOW (STATUTORY AUDIT GAPS & VIOLATIONS):
--------------------------------------------------------------------------------
${solution.nonComplianceGaps
  .map(
    (gap, i) => `[${i + 1}] ${gap.issue}
Article/Section: ${gap.lawArticle}
Severity: ${gap.severity.toUpperCase()}
Statutory Penalty Exposure: ${gap.legalPenalty}
What You Do Not Follow:
${gap.whatYouDoNotFollow}
Statutory Legal Remedy:
${gap.statutoryRemedy}
`,
  )
  .join("\n--------------------------------------------------------------------------------\n")}

================================================================================
STATUTORY LEGAL SOLUTIONS & REGULATORY DEFENSE SUITE
================================================================================

[A] STATUTORY PRIVACY NOTICE PROVISIONS:
--------------------------------------------------------------------------------
${solution.samplePrivacyPolicy}

[B] STATUTORY COOKIE & PRE-CONSENT GOVERNANCE CHARTER:
--------------------------------------------------------------------------------
${solution.sampleConsentGateCharter}

[C] DESIGNATED GRIEVANCE REDRESSAL OFFICER & DPO APPOINTMENT CHARTER:
--------------------------------------------------------------------------------
${solution.sampleGrievanceCharter}

[D] BOARD-READY 4-PHASE RECTIFICATION & ENFORCEMENT DEFENSE ROADMAP:
--------------------------------------------------------------------------------
${solution.sampleRectificationRoadmap}
`;

    const blob = new Blob([fullText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Statutory-Legal-Solution-${solution.targetDomain}-${solution.frameworkId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Statutory Legal Suite Exported", {
      description: `Complete legal drafts and non-compliance breakdown saved for ${solution.targetDomain}.`,
    });
  };

  return (
    <div
      id="statutory-legal-solution-section"
      className="surface-panel rounded-3xl border border-primary/40 bg-black/85 p-4 sm:p-8 shadow-2xl font-sans mt-8 overflow-hidden space-y-8"
    >
      {/* Top Title & Legal Authority Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-mono font-semibold text-primary">
              <Scale className="h-3.5 w-3.5" /> Jurisdiction: {solution.country} (
              {solution.frameworkId.toUpperCase()})
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-red-400">
              <ShieldAlert className="h-3.5 w-3.5" /> {solution.totalGapsCount} Statutory Gaps
              Detected
            </span>
            {isUnlocked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-emerald-400">
                <ShieldCheck className="h-3.5 w-3.5" /> Sovereign Legal Suite Unlocked
              </span>
            )}
            {unlockedTier === "patch-code" && !isUnlocked && (
              <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-[11px] font-mono font-bold text-amber-300">
                <Lock className="h-3 w-3" /> Code Patches Unlocked • Upgrade to Legal Suite
              </span>
            )}
          </div>

          <h3 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
            What You Don't Follow &amp; Tailored Legal Solution
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
            Governing Statute: <strong className="text-foreground">{solution.lawName}</strong> •
            Enforced by <strong className="text-primary">{solution.authority}</strong>
          </p>
        </div>

        {/* Global Download / Unlock Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleDownloadFullSuite}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/50 bg-emerald-500/15 px-4 py-2.5 text-xs font-mono font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all cursor-pointer shadow-lg"
            >
              <Download className="h-4 w-4" /> Download Complete Legal Suite (.txt)
            </button>
          ) : (
            onOpenUnlockModal && (
              <button
                type="button"
                onClick={() =>
                  onOpenUnlockModal(
                    solution.frameworkId === "ind-dpdp" ? "dpdp-india" : "gdpr-global",
                  )
                }
                className="btn-gold rounded-xl px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black cursor-pointer shadow-lg flex items-center gap-2"
              >
                <Lock className="h-4 w-4" /> Unlock Statutory Legal Suite
              </button>
            )
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: WHAT YOU DON'T FOLLOW (STATUTORY NON-COMPLIANCE VIOLATIONS) */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-4 sm:p-5 text-xs font-mono text-red-200 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-2 text-sm text-red-300">
              <AlertTriangle className="h-4.5 w-4.5 text-red-400 shrink-0" />
              <span>
                WHAT YOU DON'T FOLLOW // STATUTORY NON-COMPLIANCE ON{" "}
                {solution.targetDomain.toUpperCase()}
              </span>
            </p>
            {!isUnlocked && (
              <span className="rounded-md bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[10px] font-bold text-amber-300 uppercase shrink-0">
                🔒 Preview Notice (1 of {solution.totalGapsCount} Disclosed)
              </span>
            )}
          </div>
          <p className="mt-2 text-[11px] text-red-200/90 leading-relaxed">
            Our automated regulatory telemetry engine identified specific non-compliance items on{" "}
            <strong>{solution.targetDomain}</strong> under {solution.lawName}. Failure to address
            these items exposes the domain operator to formal regulatory proceedings and penalties
            under {solution.authority}.
          </p>
        </div>

        {/* Itemized Non-Compliance Gaps Grid */}
        <div className="space-y-3.5">
          {solution.nonComplianceGaps.map((gap, idx) => {
            const isFirst = idx === 0;
            const isLocked = !isUnlocked && !isFirst;

            if (isLocked) {
              return null;
            }

            return (
              <div
                key={gap.id}
                className="rounded-2xl border border-border/80 bg-black/60 p-4 sm:p-6 transition-all hover:border-red-500/50 font-mono text-xs shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/20 text-xs font-bold text-red-400 border border-red-500/40">
                      !
                    </span>
                    <h4 className="font-bold text-sm text-foreground">{gap.issue}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-red-500/15 border border-red-500/30 px-2.5 py-0.5 text-[10px] font-bold text-red-300 uppercase">
                      {gap.severity} risk
                    </span>
                    <span className="text-xs text-primary font-bold">{gap.lawArticle}</span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-3 text-[11px]">
                  <div>
                    <span className="text-red-400 font-bold block mb-1 uppercase tracking-wider text-[10.5px]">
                      [Violation Detected // What You Do Not Follow]:
                    </span>
                    <p className="text-muted-foreground leading-relaxed pl-3 border-l-2 border-red-500/50 text-xs">
                      {gap.whatYouDoNotFollow}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 mt-2 border-t border-white/5">
                    <div className="rounded-xl bg-amber-950/20 p-3 border border-amber-500/30">
                      <span className="text-amber-400 font-bold block text-[10px] uppercase tracking-wide">
                        Statutory Penalty Exposure:
                      </span>
                      <span className="text-amber-200 text-xs font-bold block mt-0.5">
                        {gap.legalPenalty}
                      </span>
                    </div>

                    <div className="rounded-xl bg-emerald-950/20 p-3 border border-emerald-500/30">
                      <span className="text-emerald-400 font-bold block text-[10px] uppercase tracking-wide">
                        Statutory Legal Remedy (ASJi Action):
                      </span>
                      <span className="text-emerald-200 text-xs block mt-0.5">
                        {gap.statutoryRemedy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Locked Gaps Blur Overlay (when not unlocked) */}
          {!isUnlocked && solution.totalGapsCount > 1 && (
            <div className="relative mt-2 rounded-2xl border border-primary/30 bg-black/75 p-5 sm:p-7 overflow-hidden">
              <div className="space-y-3 select-none filter blur-[5px] opacity-35 pointer-events-none">
                {[1, 2, 3].map((fake) => (
                  <div
                    key={fake}
                    className="rounded-xl border border-white/10 bg-black/60 p-4 font-mono text-xs"
                  >
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-red-400 font-bold">
                        [CONCEALED] Missing Mandatory Bilingual Notice &amp; Pre-Consent Telemetry
                        Breach
                      </span>
                      <span className="text-primary font-bold">Section 6(1) / Article 7</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Telemetry scripts executing prior to affirmative user consent, violating
                      cross-border data transfer safeguards...
                    </p>
                  </div>
                ))}
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/40 bg-primary/15 text-primary mb-2.5 shadow-lg">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-display text-lg sm:text-xl font-bold text-gold-gradient">
                  {solution.totalGapsCount - 1} Additional Statutory Violations &amp; Defenses
                  Locked
                </h4>
                <p className="mt-1.5 max-w-lg text-xs font-mono text-muted-foreground leading-relaxed">
                  Full non-compliance violation breakdowns, law article mappings, penalty schedules
                  under {solution.lawName}, and exact statutory defense remedies are available in
                  the Statutory Legal Suite.
                </p>
                {onOpenUnlockModal && (
                  <button
                    type="button"
                    onClick={() =>
                      onOpenUnlockModal(
                        solution.frameworkId === "ind-dpdp" ? "dpdp-india" : "gdpr-global",
                      )
                    }
                    className="btn-gold mt-4 rounded-xl px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black cursor-pointer shadow-xl flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      Unlock Full Statutory Legal Solution (
                      {solution.frameworkId === "ind-dpdp" ? "₹37,500" : "₹45,000"})
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: STATUTORY LEGAL SOLUTIONS & REGULATORY DEFENSE (ALL-IN-ONE)    */}
      {/* ========================================================================= */}
      <div className="space-y-6 pt-4 border-t border-border/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-gold-gradient flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" /> Statutory Legal Solution &amp; Regulatory
              Defense Suite
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Complete legally sound compliance drafts, charters, and enforcement defense compiled
              for <strong>{solution.targetDomain}</strong>.
            </p>
          </div>

          {isUnlocked && (
            <button
              type="button"
              onClick={handleDownloadFullSuite}
              className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-mono font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> Export All Drafts (.txt)
            </button>
          )}
        </div>

        {/* UNLOCKED FULL VIEW: ALL 4 DRAFTS DIRECTLY ON ONE PAGE */}
        {isUnlocked ? (
          <div className="space-y-6">
            {/* 1. Tailored Statutory Privacy Notice Draft */}
            <div className="rounded-2xl border border-primary/30 bg-black/90 p-5 sm:p-6 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <h5 className="font-bold text-sm text-foreground">
                      Statutory Privacy Notice Draft
                    </h5>
                    <span className="text-[10px] text-muted-foreground">
                      Notice at collection, data fiduciary governance &amp; 22-language provisions
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      solution.samplePrivacyPolicy,
                      "privacy-policy",
                      "Statutory Privacy Notice",
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {copiedSection === "privacy-policy" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Draft
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Statutory Notice
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/5 bg-neutral-950 p-4 font-mono text-xs text-foreground/90 max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.samplePrivacyPolicy}
              </div>
            </div>

            {/* 2. Cookie & Pre-Consent Charter */}
            <div className="rounded-2xl border border-primary/30 bg-black/90 p-5 sm:p-6 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <h5 className="font-bold text-sm text-foreground">
                      Statutory Cookie &amp; Pre-Consent Charter
                    </h5>
                    <span className="text-[10px] text-muted-foreground">
                      Zero-leak affirmative opt-in rules &amp; tracker classification schedule
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      solution.sampleConsentGateCharter,
                      "cookie-charter",
                      "Cookie & Consent Charter",
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {copiedSection === "cookie-charter" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Charter
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Cookie Charter
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/5 bg-neutral-950 p-4 font-mono text-xs text-foreground/90 max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.sampleConsentGateCharter}
              </div>
            </div>

            {/* 3. Grievance Redressal Officer Charter */}
            <div className="rounded-2xl border border-primary/30 bg-black/90 p-5 sm:p-6 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <h5 className="font-bold text-sm text-foreground">
                      Designated Grievance Redressal Officer &amp; DPO Charter
                    </h5>
                    <span className="text-[10px] text-muted-foreground">
                      Statutory officer appointment notice with 48h escalation SLA
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      solution.sampleGrievanceCharter,
                      "grievance",
                      "Grievance Officer Charter",
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {copiedSection === "grievance" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Notice
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Appointment Notice
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/5 bg-neutral-950 p-4 font-mono text-xs text-foreground/90 max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.sampleGrievanceCharter}
              </div>
            </div>

            {/* 4. Rectification & Defense Roadmap */}
            <div className="rounded-2xl border border-primary/30 bg-black/90 p-5 sm:p-6 font-mono text-xs shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-primary" />
                  <div>
                    <h5 className="font-bold text-sm text-foreground">
                      Board-Ready 4-Phase Rectification &amp; Defense Roadmap
                    </h5>
                    <span className="text-[10px] text-muted-foreground">
                      Executive milestone timeline for full technical &amp; legal compliance
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(
                      solution.sampleRectificationRoadmap,
                      "roadmap",
                      "Rectification Roadmap",
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {copiedSection === "roadmap" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Roadmap
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Roadmap
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl border border-white/5 bg-neutral-950 p-4 font-mono text-xs text-foreground/90 max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.sampleRectificationRoadmap}
              </div>
            </div>
          </div>
        ) : (
          /* LOCKED VIEW: BLURRED COMPREHENSIVE TEASER WITH UNLOCK BUTTON */
          <div className="relative rounded-3xl border border-primary/40 bg-black/85 p-6 sm:p-10 overflow-hidden shadow-2xl">
            <div className="space-y-6 select-none filter blur-[6px] opacity-35 pointer-events-none font-mono text-xs text-foreground/80 leading-relaxed">
              <div className="border border-white/10 p-4 rounded-xl">
                <h5 className="font-bold text-primary text-sm mb-2">
                  STATUTORY PRIVACY NOTICE PROVISIONS // {solution.targetDomain}
                </h5>
                <p>
                  1. ITEMISED NOTICE AT COLLECTION: Under Section 5(1) of the Digital Personal Data
                  Protection Act, 2023, notice is hereby served to every Data Principal prior to...
                </p>
                <p className="mt-2">
                  2. SPECIFIED USAGE &amp; THIRD-PARTY DISCLOSURES: Telemetry, cookies, and
                  processors are strictly enumerated under Schedules...
                </p>
              </div>

              <div className="border border-white/10 p-4 rounded-xl">
                <h5 className="font-bold text-primary text-sm mb-2">
                  DESIGNATED GRIEVANCE OFFICER &amp; STATUTORY ESCALATION SLA
                </h5>
                <p>
                  In compliance with Section 6(2) and Section 8(9), the Data Fiduciary designates
                  the statutory Grievance Redressal Officer with formal 48-hour acknowledgment
                  SLA...
                </p>
              </div>

              <div className="border border-white/10 p-4 rounded-xl">
                <h5 className="font-bold text-primary text-sm mb-2">
                  4-PHASE BOARD RECTIFICATION ROADMAP
                </h5>
                <p>
                  Phase 1 (Day 1-7): Immediate containment and header injection. Phase 2 (Day 8-21):
                  Zero-leak CMP deployment. Phase 3: Statutory Board Sign-off...
                </p>
              </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-black/80 backdrop-blur-md">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl border-2 border-primary/50 bg-primary/20 text-primary mb-4 shadow-2xl shadow-primary/20">
                <Scale className="h-7 w-7" />
              </div>
              <h4 className="font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
                Complete Statutory Legal Suite Locked
              </h4>
              <p className="mt-2 max-w-xl text-xs sm:text-sm font-mono text-muted-foreground leading-relaxed">
                Obtain complete, tailored legal policies, zero-leak cookie governance charters,
                official Grievance Officer appointment notices with 48h SLA, and executive
                rectification roadmaps for <strong>{solution.targetDomain}</strong> under{" "}
                <strong className="text-primary">{solution.lawName}</strong>.
              </p>

              {onOpenUnlockModal && (
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenUnlockModal(
                        solution.frameworkId === "ind-dpdp" ? "dpdp-india" : "gdpr-global",
                      )
                    }
                    className="btn-gold rounded-xl px-7 py-3 text-xs font-mono font-bold uppercase tracking-wider text-black cursor-pointer shadow-xl shadow-primary/25 hover:scale-[1.02] transition-transform flex items-center gap-2"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>
                      Unlock{" "}
                      {solution.frameworkId === "ind-dpdp"
                        ? "DPDP Legal Suite (₹37,500)"
                        : "Global Legal Pack (₹45,000)"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenUnlockModal("full-bundle")}
                    className="rounded-xl border border-primary/50 bg-primary/10 px-5 py-3 text-xs font-mono font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer shadow-md"
                  >
                    Get Full Bundle (Code + All 14+ Laws: ₹59,999)
                  </button>
                </div>
              )}

              <span className="mt-3 text-[10.5px] font-mono text-muted-foreground flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> Direct Instant Bank
                Transfer UPI • 100% Tax Deductible Corporate Legal Expense
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
