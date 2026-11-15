import React, { useState, useEffect } from "react";
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
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import type { AuditReport } from "@/lib/audit-types";
import {
  FRAMEWORK_TO_STATUTORY_RULE_ID,
  generateStatutoryLegalSolution,
  type StatutoryLegalSolutionSuite,
} from "@/lib/statutory-legal-solutions";
import { fetchLawById, type StatutoryRuleDoc } from "@/lib/firestore-service";

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
  const [liveRule, setLiveRule] = useState<StatutoryRuleDoc | null>(null);

  useEffect(() => {
    const ruleId = FRAMEWORK_TO_STATUTORY_RULE_ID[frameworkId];
    if (!ruleId) {
      setLiveRule(null);
      return;
    }
    let cancelled = false;
    fetchLawById(ruleId)
      .then((docData) => {
        if (!cancelled) setLiveRule(docData);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [frameworkId]);

  const solution: StatutoryLegalSolutionSuite = generateStatutoryLegalSolution(
    report,
    frameworkId,
    liveRule,
  );

  const handleCopyText = async (text: string, sectionKey: string, label: string) => {
    if (!isUnlocked) {
      toast.error("Statutory Legal Pack Locked", {
        description: "Please initiate transaction to copy complete legal drafts.",
      });
      onOpenUnlockModal?.("full-bundle");
      return;
    }
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
    if (!isUnlocked) {
      toast.error("Statutory Legal Pack Locked", {
        description: "Please initiate transaction to export legal suite (.txt).",
      });
      onOpenUnlockModal?.("full-bundle");
      return;
    }
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
STATUTORY COMPLIANCE ANALYSIS & REGULATORY REMEDIATION SUITE
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

[D] ACTIONABLE 4-PHASE STATUTORY RECTIFICATION & DEFENSE ROADMAP:
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
      className="surface-panel rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-8 font-sans mt-8 space-y-8"
    >
      {/* Top Title & Legal Authority Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262932] pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 text-[#C9A227] font-semibold">
              <Scale className="h-3.5 w-3.5" /> {solution.country} (
              {solution.frameworkId.toUpperCase()})
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="inline-flex items-center gap-1 rounded border border-[#EF4444]/40 bg-[#EF4444]/10 px-2 py-0.5 text-[11px] font-bold text-[#EF4444]">
              <ShieldAlert className="h-3.5 w-3.5" /> {solution.totalGapsCount} Statutory Gaps
            </span>
            {isUnlocked && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#10B981]">
                  <ShieldCheck className="h-3.5 w-3.5" /> Legal Suite Unlocked
                </span>
              </>
            )}
            {unlockedTier === "patch-code" && !isUnlocked && (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#F59E0B]">
                  <Lock className="h-3 w-3" /> Code Unlocked · Legal Suite Upgrade Available
                </span>
              </>
            )}
          </div>

          <h3 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5]">
            Statutory Violations &amp; Tailored Legal Solution
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-mono">
            Governing Statute: <strong className="text-foreground">{solution.lawName}</strong> ·
            Enforced by <strong className="text-[#C9A227]">{solution.authority}</strong>
          </p>
        </div>

        {/* Global Download / Unlock Action */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleDownloadFullSuite}
              className="inline-flex items-center gap-2 rounded-md border border-[#10B981]/50 bg-[#10B981]/10 px-4 py-2.5 text-xs font-mono font-bold text-[#10B981] hover:bg-[#10B981]/20 transition-colors cursor-pointer"
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
                className="btn-gold rounded-md px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
              >
                <Lock className="h-4 w-4" /> Unlock Statutory Legal Suite
              </button>
            )
          )}
        </div>
      </div>

      {/* SECTION 1: STATUTORY NON-COMPLIANCE VIOLATIONS */}
      <div className="space-y-4">
        <div className="rounded-md border border-[#EF4444]/40 bg-[#0D0E11] p-4 sm:p-5 text-xs font-mono">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="font-bold flex items-center gap-2 text-sm text-[#EF4444]">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>STATUTORY NON-COMPLIANCE ON {solution.targetDomain.toUpperCase()}</span>
            </p>
            {!isUnlocked && (
              <span className="inline-flex items-center gap-1 rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-1 text-[10px] font-bold text-[#F59E0B] uppercase shrink-0">
                <Lock className="h-3 w-3" /> Preview Disclosure (1 of {solution.totalGapsCount})
              </span>
            )}
          </div>
          <p className="mt-2 text-xs font-sans text-muted-foreground leading-relaxed">
            Our regulatory telemetry engine identified specific statutory non-compliance items on{" "}
            <strong className="text-foreground">{solution.targetDomain}</strong> under{" "}
            {solution.lawName}. Failure to address these items exposes the domain operator to
            regulatory proceedings under {solution.authority}.
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
                className="rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-5 sm:p-6 font-sans text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded border border-[#EF4444]/40 bg-[#EF4444]/10 text-xs font-mono font-bold text-[#EF4444]">
                      !
                    </span>
                    <h4 className="font-display font-bold text-base text-[#18181B]">{gap.issue}</h4>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="rounded bg-[#EF4444]/10 border border-[#EF4444]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#B91C1C] uppercase">
                      {gap.severity} risk
                    </span>
                    <span className="text-xs text-[#9A7812] font-bold">{gap.lawArticle}</span>
                  </div>
                </div>

                <div className="mt-3.5 space-y-3">
                  <div>
                    <span className="text-[#B91C1C] font-mono font-bold block mb-1 uppercase tracking-wider text-[10.5px]">
                      Violation Detected · Non-Compliance Finding:
                    </span>
                    <p className="text-[#18181B] leading-relaxed text-xs sm:text-sm">
                      {gap.whatYouDoNotFollow}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-[#E5DEC9]">
                    <div className="rounded-md bg-[#FEF3C7] p-3 border border-[#F59E0B]/40">
                      <span className="text-[#B45309] font-mono font-bold block text-[10px] uppercase tracking-wide">
                        Statutory Penalty Exposure
                      </span>
                      <span className="text-[#18181B] text-xs font-semibold block mt-0.5">
                        {gap.legalPenalty}
                      </span>
                    </div>

                    <div className="rounded-md bg-[#ECFDF5] p-3 border border-[#10B981]/40">
                      <span className="text-[#047857] font-mono font-bold block text-[10px] uppercase tracking-wide">
                        Statutory Legal Remedy
                      </span>
                      <span className="text-[#18181B] text-xs block mt-0.5">
                        {gap.statutoryRemedy}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Locked Gaps Callout (when not unlocked) */}
          {!isUnlocked && solution.totalGapsCount > 1 && (
            <div className="relative mt-2 rounded-md border border-[#262932] bg-[#0D0E11] p-6 sm:p-8 text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border border-[#C9A227]/40 bg-[#15171C] text-[#C9A227] mb-3">
                <Lock className="h-5 w-5" />
              </div>
              <h4 className="font-display text-lg sm:text-xl font-bold text-[#FAF8F5]">
                {solution.totalGapsCount - 1} Additional Statutory Violations &amp; Defenses Locked
              </h4>
              <p className="mt-1.5 mx-auto max-w-lg text-xs font-sans text-muted-foreground leading-relaxed">
                Full non-compliance violation breakdowns, statutory article mappings, penalty
                schedules under {solution.lawName}, and exact legal remedies are included in the
                Statutory Legal Suite.
              </p>
              {onOpenUnlockModal && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenUnlockModal(
                      solution.frameworkId === "ind-dpdp" ? "dpdp-india" : "gdpr-global",
                    )
                  }
                  className="btn-gold mt-5 inline-flex items-center gap-2 rounded-md px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                >
                  <span>
                    Generate Statutory Pack (
                    {solution.frameworkId === "ind-dpdp" ? "₹37,500" : "₹45,000"})
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 2: STATUTORY LEGAL SOLUTIONS & REGULATORY DEFENSE */}
      <div className="space-y-6 pt-6 border-t border-[#262932]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-display text-xl sm:text-2xl font-bold text-[#FAF8F5] flex items-center gap-2">
              <Scale className="h-5 w-5 text-[#C9A227]" /> Statutory Legal Solution &amp; Regulatory
              Remediation Suite
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 font-mono">
              Comprehensive statutory compliance drafts, governance charters, and regulatory defense
              roadmap compiled for{" "}
              <strong className="text-foreground">{solution.targetDomain}</strong>.
            </p>
          </div>

          {isUnlocked && (
            <button
              type="button"
              onClick={handleDownloadFullSuite}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#C9A227]/40 bg-[#0D0E11] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors cursor-pointer shrink-0"
            >
              <Download className="h-3.5 w-3.5" /> Export All Drafts (.txt)
            </button>
          )}
        </div>

        {/* LEGAL DOCUMENTS (FREE 2-LINE PREVIEW + LOCKED & BLURRED OVERLAY) */}
        {isUnlocked ? (
          <div className="space-y-6">
            {/* 1. Tailored Statutory Privacy Notice Draft */}
            <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-[#9A7812]" />
                  <div>
                    <h5 className="font-display font-bold text-base text-[#18181B]">
                      Statutory Privacy Notice Draft
                    </h5>
                    <span className="font-mono text-[10px] text-[#52525B]">
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
                  className="flex items-center gap-1.5 rounded border border-[#18181B] bg-[#18181B] px-3 py-1.5 font-mono text-xs font-bold text-[#FAF8F5] hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  {copiedSection === "privacy-policy" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied Draft
                    </>
                  ) : (
                    <>
                      {isUnlocked ? (
                        <Copy className="h-3.5 w-3.5" />
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                      <span>{isUnlocked ? "Copy Statutory Notice" : "Unlock Notice"}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded border border-[#E5DEC9] bg-white p-4 font-mono text-xs text-[#18181B] max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap overflow-hidden">
                {isUnlocked
                  ? solution.samplePrivacyPolicy
                  : (() => {
                      const lines = (solution.samplePrivacyPolicy || "").split("\n");
                      const firstTwo = lines.slice(0, 2).join("\n");
                      const rest = lines.slice(2).join("\n");
                      return (
                        <>
                          <div>{firstTwo}</div>
                          {rest && (
                            <div
                              style={{
                                filter: "blur(6px)",
                                userSelect: "none",
                                pointerEvents: "none",
                              }}
                              aria-hidden="true"
                            >
                              {rest}
                            </div>
                          )}
                        </>
                      );
                    })()}

                {!isUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D0E11]/92 p-6 text-center border border-[#C9A227]/50 backdrop-blur-md z-10">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#C9A227] bg-[#15171C] text-[#C9A227] mb-3 shadow-2xl">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h4 className="font-display text-lg sm:text-xl font-bold text-[#FAF8F5]">
                      Full Remediation Code &amp; Statutory Legal Pack Locked
                    </h4>
                    <p className="mt-1.5 mx-auto max-w-md text-xs font-sans text-[#A1A1AA] leading-relaxed">
                      Unlock complete server security patches, zero-cookie consent blocker scripts,
                      unredacted statutory notices, and your official Compliance Certificate.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenUnlockModal?.("full-bundle")}
                      className="btn-gold mt-4 rounded-md px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-2xl"
                    >
                      <span>Initiate Transaction &amp; Unlock Suite</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Cookie & Pre-Consent Charter */}
            <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-[#9A7812]" />
                  <div>
                    <h5 className="font-display font-bold text-base text-[#18181B]">
                      Statutory Cookie &amp; Pre-Consent Charter
                    </h5>
                    <span className="font-mono text-[10px] text-[#52525B]">
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
                  className="flex items-center gap-1.5 rounded border border-[#18181B] bg-[#18181B] px-3 py-1.5 font-mono text-xs font-bold text-[#FAF8F5] hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  {copiedSection === "cookie-charter" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied Charter
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Cookie Charter
                    </>
                  )}
                </button>
              </div>

              <div className="rounded border border-[#E5DEC9] bg-white p-4 font-mono text-xs text-[#18181B] max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.sampleConsentGateCharter}
              </div>
            </div>

            {/* 3. Grievance Redressal Officer Charter */}
            <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Building2 className="h-5 w-5 text-[#9A7812]" />
                  <div>
                    <h5 className="font-display font-bold text-base text-[#18181B]">
                      Designated Grievance Redressal Officer &amp; DPO Charter
                    </h5>
                    <span className="font-mono text-[10px] text-[#52525B]">
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
                  className="flex items-center gap-1.5 rounded border border-[#18181B] bg-[#18181B] px-3 py-1.5 font-mono text-xs font-bold text-[#FAF8F5] hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  {copiedSection === "grievance" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied Notice
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Appointment Notice
                    </>
                  )}
                </button>
              </div>

              <div className="rounded border border-[#E5DEC9] bg-white p-4 font-mono text-xs text-[#18181B] max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.sampleGrievanceCharter}
              </div>
            </div>

            {/* 4. Rectification & Defense Roadmap */}
            <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-5 sm:p-6">
              <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 mb-4">
                <div className="flex items-center gap-2.5">
                  <Scale className="h-5 w-5 text-[#9A7812]" />
                  <div>
                    <h5 className="font-display font-bold text-base text-[#18181B]">
                      Actionable 4-Phase Rectification &amp; Defense Roadmap
                    </h5>
                    <span className="font-mono text-[10px] text-[#52525B]">
                      Structured milestone timeline for full technical &amp; legal compliance
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
                  className="flex items-center gap-1.5 rounded border border-[#18181B] bg-[#18181B] px-3 py-1.5 font-mono text-xs font-bold text-[#FAF8F5] hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  {copiedSection === "roadmap" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied Roadmap
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Roadmap
                    </>
                  )}
                </button>
              </div>

              <div className="rounded border border-[#E5DEC9] bg-white p-4 font-mono text-xs text-[#18181B] max-h-80 overflow-y-auto leading-relaxed whitespace-pre-wrap">
                {solution.sampleRectificationRoadmap}
              </div>
            </div>
          </div>
        ) : (
          /* LOCKED VIEW: CLEAN INSTITUTIONAL STATUTORY BRIEF PREVIEW */
          <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6 sm:p-8 space-y-6">
            <div className="grid gap-4 md:grid-cols-3 font-mono text-xs">
              <div className="border border-[#E5DEC9] bg-white p-4 rounded">
                <h5 className="font-display font-bold text-[#9A7812] text-sm mb-2">
                  Statutory Privacy Notice
                </h5>
                <p className="text-[#52525B] font-sans leading-relaxed">
                  Itemised notice at collection tailored to {solution.targetDomain} with specified
                  purpose clauses.
                </p>
              </div>

              <div className="border border-[#E5DEC9] bg-white p-4 rounded">
                <h5 className="font-display font-bold text-[#9A7812] text-sm mb-2">
                  Grievance Officer Charter
                </h5>
                <p className="text-[#52525B] font-sans leading-relaxed">
                  Section 8(9) / DPO appointment charter with statutory 48-hour acknowledgment SLA.
                </p>
              </div>

              <div className="border border-[#E5DEC9] bg-white p-4 rounded">
                <h5 className="font-display font-bold text-[#9A7812] text-sm mb-2">
                  4-Phase Board Roadmap
                </h5>
                <p className="text-[#52525B] font-sans leading-relaxed">
                  Executive rectification milestones from immediate containment to board sign-off.
                </p>
              </div>
            </div>

            <div className="rounded-md border border-[#262932] bg-[#15171C] text-[#FAF8F5] p-6 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-[#C9A227]/40 bg-[#0D0E11] text-[#C9A227] mb-3">
                <Scale className="h-6 w-6" />
              </div>
              <h4 className="font-display text-2xl font-bold text-[#FAF8F5]">
                Complete Statutory Legal Suite
              </h4>
              <p className="mt-2 mx-auto max-w-xl text-xs sm:text-sm font-sans text-muted-foreground leading-relaxed">
                Obtain tailored legal policies, zero-leak cookie governance charters, official
                Grievance Officer appointment notices with 48h SLA, and executive rectification
                roadmaps for <strong className="text-foreground">{solution.targetDomain}</strong>{" "}
                under <strong className="text-[#C9A227]">{solution.lawName}</strong>.
              </p>

              {onOpenUnlockModal && (
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      onOpenUnlockModal(
                        solution.frameworkId === "ind-dpdp" ? "dpdp-india" : "gdpr-global",
                      )
                    }
                    className="btn-gold rounded-md px-6 py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
                  >
                    <span>
                      Generate{" "}
                      {solution.frameworkId === "ind-dpdp"
                        ? "DPDP Legal Suite (₹37,500)"
                        : "Global Legal Pack (₹45,000)"}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenUnlockModal("full-bundle")}
                    className="rounded-md border border-[#C9A227]/50 bg-[#0D0E11] px-5 py-3 text-xs font-mono font-bold text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors cursor-pointer"
                  >
                    Full Enterprise Bundle (Code + All 15 Laws: ₹59,999)
                  </button>
                </div>
              )}

              <span className="mt-4 text-[11px] font-mono text-muted-foreground inline-flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#10B981]" /> Direct Bank Transfer UPI ·
                100% Tax Deductible Corporate Legal Expense
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
