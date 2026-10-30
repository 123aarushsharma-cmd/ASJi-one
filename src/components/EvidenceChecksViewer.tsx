import { useState } from "react";
import type { ChecksSummary, CheckCategory, CheckResult } from "@/lib/checks-types";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
} from "lucide-react";

interface EvidenceChecksViewerProps {
  summary?: ChecksSummary;
}

export function EvidenceChecksViewer({ summary }: EvidenceChecksViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CheckCategory | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!summary) return null;

  const categories: CheckCategory[] = [
    "HTTPS & Transport Security",
    "HTTP Security Headers",
    "Cookies & Storage Flags",
    "Trackers & Third Parties",
    "Consent Banner & CMP",
    "Privacy Notice & Statutory Disclosures",
    "Email & Domain Security",
    "Hygiene & Exposure Risks",
  ];

  const filteredResults =
    selectedCategory === "ALL"
      ? summary.results
      : summary.results.filter((r) => r.category === selectedCategory);

  const getStatusBadge = (status: CheckResult["status"]) => {
    switch (status) {
      case "PASS":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> PASS
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-400">
            <AlertTriangle className="h-3 w-3" /> WARNING
          </span>
        );
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-400">
            <XCircle className="h-3 w-3" /> FAIL
          </span>
        );
      case "NOT_CHECKED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-zinc-500/10 border border-zinc-500/40 px-2.5 py-0.5 text-[10px] font-mono font-bold text-zinc-400">
            <HelpCircle className="h-3 w-3" /> NOT CHECKED
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: CheckResult["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="text-[9px] font-mono text-rose-400 font-bold">CRITICAL</span>;
      case "HIGH":
        return <span className="text-[9px] font-mono text-amber-400 font-bold">HIGH</span>;
      case "MEDIUM":
        return <span className="text-[9px] font-mono text-yellow-400">MEDIUM</span>;
      case "LOW":
        return <span className="text-[9px] font-mono text-zinc-400">LOW</span>;
      default:
        return <span className="text-[9px] font-mono text-zinc-500">INFO</span>;
    }
  };

  return (
    <div className="surface-panel rounded-2xl border border-primary/30 p-5 space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-primary/20 pb-4">
        <div>
          <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>120+ Real Evidence-Based Checks</span>
            <span className="rounded-full bg-primary/20 border border-primary/50 text-primary px-2.5 py-0.5 text-[11px] font-mono font-bold">
              {summary.checksRun} of {summary.totalChecks} checks run
            </span>
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Zero hallucination: Every result is grounded strictly in observed DNS records, response
            headers, TLS certificates, or DOM telemetry.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-emerald-400 font-bold">
            {summary.passedCount} Pass
          </span>
          <span className="rounded-lg bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 text-rose-400 font-bold">
            {summary.failedCount} Fail
          </span>
          <span className="rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-amber-400 font-bold">
            {summary.warningCount} Warning
          </span>
          {summary.notCheckedCount > 0 && (
            <span className="rounded-lg bg-zinc-500/10 border border-zinc-500/30 px-2.5 py-1 text-zinc-400 font-bold">
              {summary.notCheckedCount} Not checked
            </span>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-mono transition-all cursor-pointer ${
            selectedCategory === "ALL"
              ? "bg-primary text-black font-bold shadow-md"
              : "border border-border bg-black/60 text-muted-foreground hover:text-foreground"
          }`}
        >
          All Checks ({summary.totalChecks})
        </button>
        {categories.map((cat) => {
          const catData = summary.categoryBreakdown[cat];
          if (!catData) return null;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-primary text-black font-bold shadow-md"
                  : "border border-border bg-black/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] opacity-75 font-bold">
                ({catData.run}/{catData.total})
              </span>
            </button>
          );
        })}
      </div>

      {/* Checks List */}
      <div className="space-y-2.5">
        {filteredResults.map((check) => {
          const isExpanded = expandedId === check.id;
          return (
            <div
              key={check.id}
              className="rounded-xl border border-border/80 bg-black/60 transition-all hover:border-primary/40 overflow-hidden"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : check.id)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">{getStatusBadge(check.status)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono truncate">
                        {check.id} · {check.title}
                      </span>
                      {getSeverityBadge(check.severity)}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
                      {check.evidence}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="shrink-0 text-muted-foreground hover:text-primary transition-colors p-1"
                >
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Expanded Detail Box */}
              {isExpanded && (
                <div className="border-t border-border/60 bg-secondary/10 p-3.5 space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground font-bold">Description: </span>
                    <span className="text-foreground">{check.description}</span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/80 border border-primary/20 text-primary">
                    <span className="font-bold">Real Observed Evidence: </span>
                    <span className="text-white break-all">{check.evidence}</span>
                  </div>

                  {check.reasonIfNotChecked && (
                    <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300">
                      <span className="font-bold text-zinc-400">Not Checked Reason: </span>
                      <span>{check.reasonIfNotChecked}</span>
                    </div>
                  )}

                  {check.lawRefs && check.lawRefs.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[10px] text-muted-foreground font-bold">
                        Statutory Frameworks:
                      </span>
                      {check.lawRefs.map((law) => (
                        <span
                          key={law}
                          className="rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[10px] text-primary"
                        >
                          {law}
                        </span>
                      ))}
                    </div>
                  )}

                  {check.remediation && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 mt-2">
                      <span className="font-bold">Remediation Step: </span>
                      <span>{check.remediation}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
