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
  Terminal,
  Send,
  Share2,
  FolderArchive,
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
  onRescanRequested?: () => void;
}

export function RemediationViewer({ report }: RemediationViewerProps) {
  const [copiedPatchId, setCopiedPatchId] = useState<string | null>(null);
  const [copiedHandover, setCopiedHandover] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "patches" | "letterhead" | "handover" | "statutory" | "dpa"
  >("patches");

  const patches = generateAutomatedPatches(report);
  const [selectedPatchIndex, setSelectedPatchIndex] = useState(0);
  const currentPatch: GeneratedPatch = patches[selectedPatchIndex] || patches[0];

  const handleCopyPatch = (patch: GeneratedPatch) => {
    navigator.clipboard.writeText(patch.code);
    setCopiedPatchId(patch.id);
    toast.success(`Copied ${patch.filename}`, {
      description: "Code patch copied to clipboard.",
    });
    setTimeout(() => setCopiedPatchId(null), 2000);
  };

  const handleCopyHandover = () => {
    const doc = generateClientHandoverDocument(report);
    navigator.clipboard.writeText(doc);
    setCopiedHandover(true);
    toast.success("Client Handover Pack Copied", {
      description: "Complete deliverable document ready to send to your client.",
    });
    setTimeout(() => setCopiedHandover(false), 2000);
  };

  const handleDownloadSinglePatch = (patch: GeneratedPatch) => {
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
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Activated
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Production-ready engineering scripts, edge middleware, and client delivery pack for{" "}
              {report.target || "your domain"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadAllPatchesBundle}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20 cursor-pointer shadow-sm"
          >
            <FolderArchive className="h-4 w-4" /> Download Complete Patch Bundle
          </button>
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
          <Code className="h-4 w-4" /> Automated Code Patches
        </button>
        <button
          onClick={() => setActiveTab("handover")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "handover"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Send className="h-4 w-4" /> Client Handover Pack
        </button>
        <button
          onClick={() => setActiveTab("letterhead")}
          className={`flex items-center gap-2 border-b-2 px-3 sm:px-4 py-2.5 text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            activeTab === "letterhead"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" /> Official Certificate Report
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
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">
                  {patch.category}
                </span>
                <span className="mt-1 text-xs font-medium truncate w-full">{patch.filename}</span>
              </button>
            ))}
          </div>

          {/* Active Patch Display Card */}
          {currentPatch && (
            <div className="rounded-2xl border border-primary/20 bg-background/80 p-4 sm:p-6 space-y-4">
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
                    <span>{copiedPatchId === currentPatch.id ? "Copied" : "Copy Code"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownloadSinglePatch(currentPatch)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5 text-primary" />
                    <span>Download</span>
                  </button>
                </div>
              </div>

              {/* Code Snippet Box with horizontal scroll */}
              <div className="relative rounded-xl bg-black/90 border border-border p-4 overflow-x-auto">
                <pre className="font-mono text-xs text-emerald-400 leading-relaxed">
                  <code>{currentPatch.code}</code>
                </pre>
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
          <div className="rounded-2xl border border-primary/20 bg-background/80 p-5 space-y-4">
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
                  <span>{copiedHandover ? "Copied Handover Pack" : "Copy Handover Pack"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAllPatchesBundle}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3.5 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-secondary cursor-pointer"
                >
                  <Download className="h-4 w-4 text-primary" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <div className="rounded-xl bg-black/90 border border-border p-4 max-h-96 overflow-y-auto overflow-x-auto">
              <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {generateClientHandoverDocument(report)}
              </pre>
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
                  navigator.clipboard.writeText(
                    "Data Fiduciary and Processor agree to adhere strictly to statutory security standards under GDPR Art 28 and DPDP Act 2023 Sec 8...",
                  );
                  toast.success("DPA Clause copied to clipboard");
                }}
                className="inline-flex items-center gap-1.5 rounded border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs text-primary font-medium hover:bg-primary/20 cursor-pointer"
              >
                <Copy className="h-3.5 w-3.5" /> Copy Clause
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
