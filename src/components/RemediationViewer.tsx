import React, { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  ShieldCheck,
  Code,
  Sparkles,
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
    <div className="surface-panel overflow-hidden p-4 sm:p-7 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-gold-gradient">
                Automated Remediation Code Patches
              </h3>
              {isUnlocked ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" /> Activated
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer shadow-sm"
            >
              <FolderArchive className="h-4 w-4" /> Download Complete Patch Bundle
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onOpenUnlockModal?.("patch-code")}
              className="btn-gold rounded-xl px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider text-black cursor-pointer shadow-lg flex items-center gap-1.5"
            >
              <Lock className="h-3.5 w-3.5" /> Unlock Code Patches (₹2,499/mo)
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs (Touch-friendly & responsive) */}
      <div className="mt-5 flex overflow-x-auto no-scrollbar border-b border-border/60 gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab("patches")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "patches"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code className="h-4 w-4" /> Automated Code Patches {!isUnlocked && "🔒"}
        </button>
        <button
          onClick={() => setActiveTab("handover")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "handover"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="h-4 w-4" /> Client Handover Pack {!isUnlocked && "🔒"}
        </button>
        <button
          onClick={() => setActiveTab("letterhead")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "letterhead"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" /> Official Audit Summary Report
        </button>
        <button
          onClick={() => setActiveTab("statutory")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "statutory"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Statutory Laws (DPDP &amp; GDPR)
        </button>
        <button
          onClick={() => setActiveTab("dpa")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "dpa"
              ? "border-primary text-primary"
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {patches.map((patch, idx) => (
              <button
                key={patch.id}
                onClick={() => setSelectedPatchIndex(idx)}
                className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                  selectedPatchIndex === idx
                    ? "border-primary bg-primary/10 text-primary shadow-sm"
                    : "border-border/60 bg-secondary/20 text-muted-foreground hover:border-border hover:text-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                    {patch.category}
                  </span>
                  {!isUnlocked && <Lock className="h-3 w-3 text-amber-400" />}
                </div>
                <span className="mt-1 text-xs font-medium truncate w-full">{patch.filename}</span>
              </button>
            ))}
          </div>

          {/* Active Patch Display Card */}
          {currentPatch && (
            <div className="rounded-2xl border border-primary/20 bg-background/80 p-4 sm:p-6 space-y-4 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-semibold text-foreground">
                      {currentPatch.title}
                    </h4>
                    <span className="rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] font-mono text-primary font-bold uppercase">
                      {currentPatch.language}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{currentPatch.description}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleCopyPatch(currentPatch)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
                  >
                    {copiedPatchId === currentPatch.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span>
                      {copiedPatchId === currentPatch.id
                        ? "Copied"
                        : isUnlocked
                          ? "Copy Code"
                          : "🔒 Unlock Code"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSinglePatch(currentPatch)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" />
                    <span>{isUnlocked ? "Download" : "🔒 Download"}</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box with Preview & Blur Lock Overlay */}
              <div className="relative rounded-xl bg-black/95 border border-border p-4 overflow-hidden">
                {/* Visible Preview Lines */}
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
                  <code>{previewLines}</code>
                </pre>

                {/* Blurred Concealed Lines */}
                <div
                  className={`relative mt-1 filter ${
                    isUnlocked ? "blur-0" : "blur-[6px] opacity-25 select-none pointer-events-none"
                  }`}
                >
                  <pre className="font-mono text-xs text-emerald-400/80 leading-relaxed">
                    <code>{hiddenLines}</code>
                  </pre>
                </div>

                {/* Glassmorphic Lock Overlay for Non-Unlocked State */}
                {!isUnlocked && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/50 bg-primary/20 text-primary mb-3 shadow-xl">
                      <Lock className="h-6 w-6" />
                    </div>
                    <h4 className="font-display text-lg sm:text-xl font-bold text-gold-gradient">
                      Remediation Code Patches Locked (₹2,499/mo)
                    </h4>
                    <p className="mt-1.5 max-w-lg text-xs font-mono text-muted-foreground leading-relaxed">
                      Full executable NGINX, Apache, Cloudflare Worker Edge Shields, and CMP scripts
                      for <strong className="text-white">{report.target || "your domain"}</strong>{" "}
                      are locked until subscription payment.
                    </p>
                    <button
                      type="button"
                      onClick={() => onOpenUnlockModal?.("patch-code")}
                      className="btn-gold mt-4 rounded-xl px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black cursor-pointer shadow-xl flex items-center gap-2 hover:scale-[1.02] transition-transform"
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Unlock Code Patches (₹2,499/mo)</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border/40 bg-secondary/20 p-3.5 text-xs text-muted-foreground">
                <strong className="text-foreground">Deployment Instructions:</strong> Deploy this
                file directly into your server configuration or application directory. Once
                reloaded, test via the ASJi One terminal to verify transport compliance.
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Client Handover Pack */}
      {activeTab === "handover" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-background/80 p-5 space-y-4 relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
              <div>
                <h4 className="text-base font-semibold text-foreground">
                  Official Client Handover Deliverable Document
                </h4>
                <p className="mt-1 text-xs text-muted-foreground">
                  A turnkey, professional compliance audit package formatted to send directly to
                  clients after receiving payment.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyHandover}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer shadow-sm"
                >
                  {copiedHandover ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span>
                    {copiedHandover
                      ? "Copied Handover Pack"
                      : isUnlocked
                        ? "Copy Handover Pack"
                        : "🔒 Unlock Handover Pack"}
                  </span>
                </button>
              </div>
            </div>

            <div className="relative rounded-xl bg-black/95 border border-border p-4 max-h-96 overflow-hidden">
              <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {generateClientHandoverDocument(report).slice(0, 300)}
              </pre>

              <div
                className={`relative mt-2 filter ${
                  isUnlocked ? "blur-0" : "blur-[6px] opacity-25 select-none pointer-events-none"
                }`}
              >
                <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {generateClientHandoverDocument(report).slice(300)}
                </pre>
              </div>

              {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/50 bg-primary/20 text-primary mb-3 shadow-xl">
                    <Lock className="h-6 w-6" />
                  </div>
                  <h4 className="font-display text-lg sm:text-xl font-bold text-gold-gradient">
                    Client Handover Deliverable Pack Locked
                  </h4>
                  <p className="mt-1.5 max-w-lg text-xs font-mono text-muted-foreground leading-relaxed">
                    Full white-label client handover documents and turnkey delivery packages are
                    unlocked upon purchasing the Code Patches (₹2,499/mo) or Enterprise Bundle.
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenUnlockModal?.("patch-code")}
                    className="btn-gold mt-4 rounded-xl px-6 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-black cursor-pointer shadow-xl flex items-center gap-2 hover:scale-[1.02] transition-transform"
                  >
                    <Sparkles className="h-4 w-4" />
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

      {/* TAB 4: Statutory Laws */}
      {activeTab === "statutory" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border/60 bg-secondary/20 p-5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> GDPR Statutory Compliance Mapping
            </h4>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Article 32 (Security of Processing):</strong>{" "}
                Enforce TLS 1.3, strict HSTS preload, and encrypted data at rest. Pseudonymize log
                structures.
              </p>
              <p>
                <strong className="text-foreground">Article 7 (Conditions for Consent):</strong>{" "}
                Pre-consent tracking cookies must remain disabled prior to active affirmative
                opt-in.
              </p>
              <p>
                <strong className="text-foreground">Article 44 (Cross-Border Transfers):</strong>{" "}
                Ensure international analytics beacons use certified Data Privacy Framework (DPF)
                participants or Standard Contractual Clauses.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/20 p-5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Digital Personal Data Protection
              (DPDP) Act 2023 Mapping
            </h4>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p>
                <strong className="text-foreground">Section 6 (Consent Architecture):</strong>{" "}
                Provide accessible, itemized, and clear consent notices in English and scheduled
                languages.
              </p>
              <p>
                <strong className="text-foreground">Section 8 (Data Fiduciary Obligations):</strong>{" "}
                Implement technical measures to erase personal data once specified purpose is
                fulfilled.
              </p>
              <p>
                <strong className="text-foreground">Section 8(6) (Breach Reporting):</strong>{" "}
                Establish automated intrusion monitoring to notify the Data Protection Board of
                India without delay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DPA Contract Clauses */}
      {activeTab === "dpa" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Standard Data Processing Addendum (DPA) Clause
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
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
                className="inline-flex items-center gap-1.5 rounded border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/20 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" /> {isUnlocked ? "Copy Clause" : "🔒 Unlock Clause"}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground bg-black/60 p-3.5 rounded-lg border border-border leading-relaxed font-sans">
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
