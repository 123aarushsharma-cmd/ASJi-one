import React, { useState } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Scale,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";
import { evaluateIntermediaryShield } from "@/lib/remediation-patches";

interface IntermediaryShieldCardProps {
  report: AuditReport;
  onOpenRemediationModal?: () => void;
}

export function IntermediaryShieldCard({
  report,
  onOpenRemediationModal,
}: IntermediaryShieldCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shield = evaluateIntermediaryShield(report);

  const isSafe = shield.status === "ACTIVE";

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-7 transition-all ${
        isSafe ? "border-emerald-500/30 bg-emerald-950/10" : "border-amber-500/40 bg-amber-950/15"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${
              isSafe
                ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-400"
                : "border-amber-500/40 bg-amber-500/20 text-amber-400"
            }`}
          >
            {isSafe ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Statutory Intermediary Safe Harbor Status
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                  isSafe
                    ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                    : "border border-amber-500/40 bg-amber-500/20 text-amber-300"
                }`}
              >
                {isSafe ? <Sparkles className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {shield.badgeText}
              </span>
            </div>
            <h3 className="mt-1 text-base sm:text-lg font-semibold text-foreground">
              {isSafe
                ? "Platform qualifies for statutory safe harbor liability shield"
                : "Platform risks losing legal intermediary immunity"}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-border bg-secondary/40 px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary cursor-pointer"
        >
          <span>{isExpanded ? "Hide Legal Analysis" : "View Full Advisory"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{shield.summary}</p>

      {/* Expandable Deep Analysis */}
      {isExpanded && (
        <div className="mt-5 space-y-4 border-t border-border/60 pt-5 animate-in fade-in duration-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Identified Legal & Financial Risks
              </p>
              <ul className="mt-2.5 space-y-2 text-xs text-muted-foreground leading-relaxed">
                {shield.risks.map((risk, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5" /> Statutory Safe Harbor Requirements
              </p>
              <ul className="mt-2.5 space-y-2 text-xs text-muted-foreground leading-relaxed">
                {shield.remedies.map((remedy, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="text-xs text-muted-foreground">
              <strong className="text-foreground">Governing Statutes:</strong>{" "}
              {shield.statutoryBasis}
            </div>

            {onOpenRemediationModal && (
              <button
                type="button"
                onClick={onOpenRemediationModal}
                className="btn-gold text-xs font-semibold py-2 px-4 rounded-lg text-black cursor-pointer shadow-md shrink-0"
              >
                Unlock Safe Harbor Defense Patch
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
