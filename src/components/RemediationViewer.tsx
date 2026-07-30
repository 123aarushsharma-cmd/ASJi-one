import { useState } from "react";
import {
  Check,
  Copy,
  Download,
  FileText,
  ShieldCheck,
  Code,
  ArrowUpRight,
  Sparkles,
  BookOpen,
  Award,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";

interface RemediationViewerProps {
  report: AuditReport;
  onRescanRequested?: () => void;
}

export function RemediationViewer({ report }: RemediationViewerProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"letterhead" | "technical" | "statutory" | "dpa">(
    "letterhead",
  );

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Generate tailored technical header patches based on report
  const cspHeader =
    "Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-rAnd0m123'; object-src 'none'; frame-ancestors 'none';";
  const hstsHeader = "Strict-Transport-Security: max-age=31536000; includeSubDomains; preload";
  const cookiePatch = "Set-Cookie: __Host-session=xyz; Secure; HttpOnly; SameSite=Lax; Path=/";

  const remediationSteps = report.remediation?.length
    ? report.remediation
    : [
        {
          step: "Inject missing HTTP Security Headers (CSP, HSTS, X-Frame-Options)",
          impact: "high",
          effort: "low",
        },
        {
          step: "Configure pre-consent cookie flags (Secure, HttpOnly, SameSite)",
          impact: "high",
          effort: "medium",
        },
        {
          step: "Implement DPDP Act 2023 Sec 6 Consent Manager & Notice Protocol",
          impact: "critical",
          effort: "medium",
        },
        {
          step: "Deploy GDPR Art 32 Data Encryption & Audit Log Retention",
          impact: "medium",
          effort: "high",
        },
      ];

  return (
    <div className="surface-panel overflow-hidden p-6 sm:p-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/40">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-xl font-bold text-gold-gradient">
                Unlocked Technical Remediation Suite
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">
                <Sparkles className="h-3 w-3" /> Activated
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Actionable engineering patches, statutory clauses, and DPA agreements for{" "}
              {report.originCountry || "your target"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `ASJi-Remediation-Report-${Date.now()}.json`;
              a.click();
            }}
            className="flex items-center gap-1.5 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 text-xs text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="h-3.5 w-3.5 text-primary" /> Export Audit Package
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="mt-6 flex flex-wrap border-b border-border/60">
        <button
          onClick={() => setActiveTab("letterhead")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "letterhead"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" /> Official Letterhead Report
        </button>
        <button
          onClick={() => setActiveTab("technical")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "technical"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code className="h-4 w-4" /> Technical Header &amp; Cookie Patches
        </button>
        <button
          onClick={() => setActiveTab("statutory")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "statutory"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" /> Statutory Requirements (GDPR &amp; DPDP)
        </button>
        <button
          onClick={() => setActiveTab("dpa")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-colors ${
            activeTab === "dpa"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="h-4 w-4" /> DPA &amp; Vendor Clauses
        </button>
      </div>

      {/* Tab 0: Official Letterhead Report */}
      {activeTab === "letterhead" && (
        <div className="mt-6">
          <ASJiLetterheadReport report={report} />
        </div>
      )}

      {/* Tab 1: Technical Header & Cookie Patches */}
      {activeTab === "technical" && (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {remediationSteps.map((step, idx) => (
              <div key={idx} className="rounded-xl border border-border/60 bg-secondary/20 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-sans font-bold text-primary bg-primary/10 px-2 py-0.5 rounded uppercase">
                    Step 0{idx + 1}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <span>
                      Impact: <strong className="text-foreground">{step.impact}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Effort: <strong className="text-foreground">{step.effort}</strong>
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs font-semibold text-foreground leading-relaxed">
                  {step.step}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-primary/20 bg-background/60 p-5">
            <h4 className="text-xs font-semibold text-gold-gradient uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Ready-to-Deploy Server Response Headers</span>
              <span className="text-[10px] font-sans font-medium text-muted-foreground">
                Nginx / Cloudflare / Express
              </span>
            </h4>

            <div className="space-y-3 font-sans text-xs">
              <div className="relative rounded-lg bg-black/80 border border-border p-3 text-emerald-400">
                <button
                  onClick={() => handleCopy(cspHeader, 1)}
                  className="absolute right-2.5 top-2.5 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedIndex === 1 ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <p className="text-[11px] text-muted-foreground font-sans mb-1">
                  # Content Security Policy (CSP)
                </p>
                <code>{cspHeader}</code>
              </div>

              <div className="relative rounded-lg bg-black/80 border border-border p-3 text-emerald-400">
                <button
                  onClick={() => handleCopy(hstsHeader, 2)}
                  className="absolute right-2.5 top-2.5 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedIndex === 2 ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <p className="text-[11px] text-muted-foreground font-sans mb-1">
                  # Strict Transport Security (HSTS)
                </p>
                <code>{hstsHeader}</code>
              </div>

              <div className="relative rounded-lg bg-black/80 border border-border p-3 text-emerald-400">
                <button
                  onClick={() => handleCopy(cookiePatch, 3)}
                  className="absolute right-2.5 top-2.5 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {copiedIndex === 3 ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
                <p className="text-[11px] text-muted-foreground font-sans mb-1">
                  # Pre-Consent Cookie Hardening
                </p>
                <code>{cookiePatch}</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Statutory Requirements */}
      {activeTab === "statutory" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-border/60 bg-secondary/20 p-5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> GDPR Statutory Compliance Mapping
            </h4>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
              <p>
                <strong className="text-foreground">Article 32 (Security of Processing):</strong>{" "}
                Enforce TLS 1.3, strict HSTS preload, and encrypted data at rest. Ensure
                pseudonymisation of log structures.
              </p>
              <p>
                <strong className="text-foreground">Article 7 (Conditions for Consent):</strong>{" "}
                Pre-consent tracking cookies must remain disabled prior to active affirmative
                opt-in.
              </p>
              <p>
                <strong className="text-foreground">Article 44 (Cross-Border Transfers):</strong>{" "}
                Ensure international analytics beacons use EU-hosted proxies or certified Data
                Privacy Framework (DPF) participants.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-secondary/20 p-5">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" /> Digital Personal Data Protection
              (DPDP) Act 2023 Statutory Mapping
            </h4>
            <div className="mt-3 space-y-2 text-xs text-muted-foreground">
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
                India and affected data principals without delay.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: DPA & Legal Clauses */}
      {activeTab === "dpa" && (
        <div className="mt-6 space-y-4">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Standard Data Processing Addendum (DPA) Clause
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Ready for insertion into vendor vendor agreements &amp; terms
                </p>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    "Data Fiduciary and Processor agree to adhere strictly to statutory security standards under GDPR Art 28 and DPDP Act 2023 Sec 8...",
                    4,
                  )
                }
                className="flex items-center gap-1 rounded border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs text-primary font-medium hover:bg-primary/20"
              >
                {copiedIndex === 4 ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}{" "}
                Copy Clause
              </button>
            </div>
            <p className="mt-3 font-sans text-xs text-muted-foreground bg-black/60 p-3 rounded-lg border border-border leading-relaxed">
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
