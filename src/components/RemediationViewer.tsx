import React, { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  ShieldCheck,
  Code,
  BookOpen,
  Award,
  Send,
  FolderArchive,
  Lock,
  ChevronRight,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";
import {
  generateAutomatedPatches,
  generateClientHandoverDocument,
  type GeneratedPatch,
} from "@/lib/remediation-patches";
import { toast } from "sonner";

interface RemediationViewerProps {
  report: AuditReport;
  isUnlocked?: boolean;
  onOpenUnlockModal?: (
    preselectedTier?: "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle",
  ) => void;
  onRescanRequested?: () => void;
}

export function RemediationViewer({
  report,
  isUnlocked = false,
  onOpenUnlockModal,
}: RemediationViewerProps) {
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);
  const [copiedHandover, setCopiedHandover] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "patches" | "letterhead" | "handover" | "statutory" | "dpa"
  >("patches");

  const patches = generateAutomatedPatches(report);
  const [selectedPatchIndex, setSelectedPatchIndex] = useState(0);
  const currentPatch: GeneratedPatch = patches[selectedPatchIndex] || patches[0];

  const handleCopyPatch = (patch: GeneratedPatch) => {
    if (!isUnlocked) {
      toast.error("Remediation Code Patches Locked", {
        description: "Please unlock the package (₹2,499/mo) to copy executable code patches.",
      });
      onOpenUnlockModal?.("patch-code");
      return;
    }
    navigator.clipboard.writeText(patch.code);
    setCopiedPatchId(patch.id);
    toast.success(`Copied ${patch.filename}`, {
      description: "Code patch copied to clipboard.",
    });
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  const handleCopyHandover = () => {
    if (!isUnlocked) {
      toast.error("Handover Pack Locked", {
        description: "Please unlock the package (₹2,499/mo) to copy client handover documents.",
      });
      onOpenUnlockModal?.("patch-code");
      return;
    }
    const doc = generateClientHandoverDocument(report);
    navigator.clipboard.writeText(doc);
    setCopiedHandover(true);
    toast.success("Client Handover Pack Copied", {
      description: "Complete deliverable document ready to send to your client.",
    });
    setTimeout(() => setCopiedHandover(false), 2000);
  };

  const handleDownloadSinglePatch = (patch: GeneratedPatch) => {
    if (!isUnlocked) {
      toast.error("Remediation Code Patches Locked", {
        description: "Please unlock the package (₹2,499/mo) to download executable scripts.",
      });
      onOpenUnlockModal?.("patch-code");
      return;
    }
    const blob = new Blob([patch.code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = patch.filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${patch.filename}`);
  };

  const handleDownloadAllPatchesBundle = () => {
    if (!isUnlocked) {
      toast.error("Remediation Bundle Locked", {
        description: "Please unlock the package (₹2,499/mo) to export all code patches.",
      });
      onOpenUnlockModal?.("patch-code");
      return;
    }
    const doc = generateClientHandoverDocument(report);
    const blob = new Blob([doc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const domain = (report.target || "domain").replace(/^https?:\/\//i, "").split("/")[0];
    a.href = url;
    a.download = `ASJi-Autonomous-Remediation-Bundle-${domain}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Remediation Bundle Exported", {
      description: "All automated code patches and executive handoff documentation downloaded.",
    });
  };

  // Get lines for preview
  const patchLines = (currentPatch?.code || "").split("\n");
  const previewLines = patchLines.slice(0, 5).join("\n");
  const hiddenLines = patchLines.slice(5).join("\n") || "# [Additional lines concealed...]";

  return (
    <div className="surface-panel rounded-md border border-[#262932] bg-[#15171C] overflow-hidden p-5 sm:p-7 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262932] pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#0D0E11] text-[#C9A227] border border-[#C9A227]/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-bold text-[#FAF8F5]">
                Automated Remediation Code Patches
              </h3>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 rounded bg-[#10B981]/10 border border-[#10B981]/40 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[#10B981] uppercase tracking-wider">
                  <Check className="h-3 w-3" /> Activated
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/40 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-[#F59E0B] uppercase tracking-wider">
                  <Lock className="h-3 w-3" /> Locked Preview (₹2,499/mo)
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Production-ready engineering scripts, edge middleware, and client delivery pack for{" "}
              <strong className="text-foreground">{report.target || "your domain"}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isUnlocked ? (
            <button
              type="button"
              onClick={handleDownloadAllPatchesBundle}
              className="inline-flex items-center gap-1.5 rounded-md border border-[#C9A227]/40 bg-[#0D0E11] px-3.5 py-2 text-xs font-mono font-semibold text-[#C9A227] transition-colors hover:bg-[#C9A227]/10 cursor-pointer"
            >
              <FolderArchive className="h-4 w-4" /> Download Complete Patch Bundle
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenUnlockModal?.("patch-code")}
              className="btn-gold rounded-md px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" /> Unlock Code Patches (₹2,499/mo)
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-5 flex overflow-x-auto no-scrollbar border-b border-[#262932] gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("patches")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "patches"
              ? "border-[#C9A227] text-[#C9A227]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code className="h-4 w-4" />
          <span>Automated Code Patches</span>
          {!isUnlocked && <Lock className="h-3 w-3 opacity-70" />}
        </button>
        <button
          onClick={() => setActiveTab("handover")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "handover"
              ? "border-[#C9A227] text-[#C9A227]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="h-4 w-4" />
          <span>Client Handover Pack</span>
          {!isUnlocked && <Lock className="h-3 w-3 opacity-70" />}
        </button>
        <button
          onClick={() => setActiveTab("letterhead")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "letterhead"
              ? "border-[#C9A227] text-[#C9A227]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" /> Official Audit Summary Report
        </button>
        <button
          onClick={() => setActiveTab("statutory")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "statutory"
              ? "border-[#C9A227] text-[#C9A227]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Statutory Laws (DPDP &amp; GDPR)
        </button>
        <button
          onClick={() => setActiveTab("dpa")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "dpa"
              ? "border-[#C9A227] text-[#C9A227]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" /> DPA Contract Clauses
        </button>
      </div>

      {/* TAB 1: Automated Code Patches */}
      {activeTab === "patches" && (
        <div className="mt-6 space-y-6">
          {/* Sub-selector for each patch */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {patches.map((patch, idx) => (
              <button
                key={patch.id}
                onClick={() => setSelectedPatchIndex(idx)}
                className={`flex flex-col items-start p-2.5 rounded-md border text-left transition-colors cursor-pointer ${
                  selectedPatchIndex === idx
                    ? "border-[#C9A227] bg-[#0D0E11] text-[#C9A227]"
                    : "border-[#262932] bg-[#0D0E11] text-muted-foreground hover:border-[#C9A227]/40 hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-mono font-semibold uppercase tracking-wider opacity-80">
                    {patch.category}
                  </span>
                  {!isUnlocked && <Lock className="h-3 w-3 text-[#F59E0B]" />}
                </div>
                <span className="mt-1 text-xs font-medium truncate w-full">{patch.filename}</span>
              </button>
            ))}
          </div>

          {/* Active Patch Display Card */}
          {currentPatch && (
            <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262932] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-bold text-[#FAF8F5]">
                      {currentPatch.title}
                    </h4>
                    <span className="rounded bg-[#15171C] border border-[#262932] px-2 py-0.5 text-[10px] font-mono text-[#C9A227] font-bold uppercase">
                      {currentPatch.language}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{currentPatch.description}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyPatch(currentPatch)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#262932] bg-[#15171C] px-3 py-1.5 text-xs font-mono font-medium text-foreground transition-colors hover:border-[#C9A227] cursor-pointer"
                  >
                    {copiedPatchId === currentPatch.id ? (
                      <Check className="h-3.5 w-3.5 text-[#10B981]" />
                    ) : isUnlocked ? (
                      <Copy className="h-3.5 w-3.5 text-[#C9A227]" />
                    ) : (
                      <Lock className="h-3.5 w-3.5 text-[#C9A227]" />
                    )}
                    <span>
                      {copiedPatchId === currentPatch.id
                        ? "Copied"
                        : isUnlocked
                          ? "Copy Code"
                          : "Unlock Code"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSinglePatch(currentPatch)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-[#262932] bg-[#15171C] px-3 py-1.5 text-xs font-mono font-medium text-foreground transition-colors hover:border-[#C9A227] cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-[#C9A227]" />
                    <span>{isUnlocked ? "Download" : "Unlock File"}</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="relative rounded-md bg-[#0D0E11] border border-[#262932] p-4 overflow-hidden min-w-0">
                <pre className="font-mono text-xs text-[#10B981] leading-relaxed overflow-x-auto max-w-full">
                  <code>
                    {isUnlocked
                      ? currentPatch.code
                      : (() => {
                          const lines = (currentPatch?.code || "").split("\n");
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
                  </code>
                </pre>

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

              <div className="rounded-md border border-[#262932] bg-[#15171C] p-3.5 text-xs text-muted-foreground">
                <strong className="text-foreground">Deployment Instructions:</strong> Deploy this
                file directly into your server configuration or application directory. Once
                reloaded, rescan via the ASJi One audit console to verify transport compliance.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Client Handover Pack */}
      {activeTab === "handover" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262932] pb-3">
              <div>
                <h4 className="font-display text-base font-bold text-[#FAF8F5]">
                  Official Client Handover Deliverable Document
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  A turnkey compliance audit package formatted to deliver directly to clients.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyHandover}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#C9A227]/40 bg-[#15171C] px-3.5 py-2 text-xs font-mono font-semibold text-[#C9A227] transition-colors hover:bg-[#C9A227]/10 cursor-pointer shrink-0"
              >
                {copiedHandover ? (
                  <Check className="h-4 w-4 text-[#10B981]" />
                ) : isUnlocked ? (
                  <Copy className="h-4 w-4" />
                ) : (
                  <Lock className="h-4 w-4" />
                )}
                <span>
                  {copiedHandover
                    ? "Copied Handover Pack"
                    : isUnlocked
                      ? "Copy Handover Pack"
                      : "Unlock Handover Pack"}
                </span>
              </button>
            </div>

            <div className="rounded-md bg-[#15171C] border border-[#262932] p-4 max-h-96 overflow-y-auto overflow-x-auto">
              <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                {isUnlocked
                  ? generateClientHandoverDocument(report)
                  : generateClientHandoverDocument(report).slice(0, 320)}
              </pre>

              {!isUnlocked && (
                <div className="mt-4 rounded-md border border-[#262932] bg-[#0D0E11] p-6 text-center">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-md border border-[#C9A227]/40 bg-[#15171C] text-[#C9A227] mb-3">
                    <Lock className="h-5 w-5" />
                  </div>
                  <h4 className="font-display text-lg font-bold text-[#FAF8F5]">
                    Client Handover Deliverable Pack Locked
                  </h4>
                  <p className="mt-1.5 mx-auto max-w-lg text-xs font-sans text-muted-foreground leading-relaxed">
                    Full white-label client handover documents and turnkey delivery packages are
                    unlocked upon purchasing the Code Patches (₹2,499/mo) or Enterprise Bundle.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenUnlockModal?.("patch-code")}
                    className="btn-gold mt-4 mx-auto rounded-md px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2"
                  >
                    <span>Unlock Handover Pack (₹2,499/mo)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Official Letterhead Report */}
      {activeTab === "letterhead" && (
        <div className="mt-6">
          <ASJiLetterheadReport report={report} />
        </div>
      )}

      {/* TAB 4: Statutory Laws (Warm Alabaster Legal Surface) */}
      {activeTab === "statutory" && (
        <div className="mt-6 space-y-4">
          <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6">
            <h4 className="font-display text-base font-bold text-[#18181B] flex items-center gap-2 border-b border-[#E5DEC9] pb-3">
              <ShieldCheck className="h-4 w-4 text-[#9A7812]" /> GDPR Statutory Compliance Mapping
            </h4>
            <div className="mt-3 space-y-2.5 text-xs sm:text-sm text-[#52525B] leading-relaxed">
              <p>
                <strong className="text-[#18181B]">Article 32 (Security of Processing):</strong>{" "}
                Enforce TLS 1.3, strict HSTS preload, and encrypted data at rest. Pseudonymize log
                structures.
              </p>
              <p>
                <strong className="text-[#18181B]">Article 7 (Conditions for Consent):</strong>{" "}
                Pre-consent tracking cookies must remain disabled prior to active affirmative
                opt-in.
              </p>
              <p>
                <strong className="text-[#18181B]">Article 44 (Cross-Border Transfers):</strong>{" "}
                Ensure international analytics beacons use certified Data Privacy Framework (DPF)
                participants or Standard Contractual Clauses.
              </p>
            </div>
          </div>

          <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6">
            <h4 className="font-display text-base font-bold text-[#18181B] flex items-center gap-2 border-b border-[#E5DEC9] pb-3">
              <ShieldCheck className="h-4 w-4 text-[#9A7812]" /> Digital Personal Data Protection
              (DPDP) Act 2023 Mapping
            </h4>
            <div className="mt-3 space-y-2.5 text-xs sm:text-sm text-[#52525B] leading-relaxed">
              <p>
                <strong className="text-[#18181B]">Section 6 (Consent Architecture):</strong>{" "}
                Provide accessible, itemized, and clear consent notices in English and scheduled
                languages.
              </p>
              <p>
                <strong className="text-[#18181B]">Section 8 (Data Fiduciary Obligations):</strong>{" "}
                Implement technical measures to erase personal data once specified purpose is
                fulfilled.
              </p>
              <p>
                <strong className="text-[#18181B]">Section 8(6) (Breach Reporting):</strong>{" "}
                Establish automated intrusion monitoring to notify the Data Protection Board of
                India without delay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DPA Contract Clauses (Warm Alabaster Legal Surface) */}
      {activeTab === "dpa" && (
        <div className="mt-6 space-y-4">
          <div className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5DEC9] pb-4">
              <div>
                <h4 className="font-display text-base font-bold text-[#18181B]">
                  Standard Data Processing Addendum (DPA) Clause
                </h4>
                <p className="text-xs text-[#52525B] mt-0.5">
                  Statutory model clause for enterprise vendor agreements
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isUnlocked) {
                    toast.error("DPA Clauses Locked", {
                      description: "Please unlock package to copy statutory DPA clauses.",
                    });
                    onOpenUnlockModal?.("full-bundle");
                    return;
                  }
                  navigator.clipboard.writeText(
                    "Data Fiduciary and Processor agree to adhere strictly to statutory security standards under GDPR Art 28 and DPDP Act 2023 Sec 8...",
                  );
                  toast.success("DPA Clause copied to clipboard");
                }}
                className="inline-flex items-center gap-1.5 rounded border border-[#18181B] bg-[#18181B] px-3.5 py-1.5 font-mono text-xs text-[#FAF8F5] font-medium hover:bg-[#27272A] cursor-pointer shrink-0"
              >
                {isUnlocked ? <Copy className="h-3.5 w-3.5" /> : <Lock className="h-3.5 w-3.5" />}
                <span>{isUnlocked ? "Copy Clause" : "Unlock Clause"}</span>
              </button>
            </div>
            <p className="mt-4 text-sm text-[#18181B] bg-white p-4 rounded border border-[#E5DEC9] leading-relaxed font-display italic">
              &quot;Processor shall process personal data solely on documented instructions from
              Controller/Data Fiduciary, implementing technical and organizational measures under
              GDPR Art 32 and DPDP Act Sec 8, ensuring zero pre-consent third-party data
              leakage.&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
