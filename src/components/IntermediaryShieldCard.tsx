import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCheck2,
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
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] ${
              isSafe ? "text-[#10B981]" : "text-[#F59E0B]"
            }`}
          >
            {isSafe ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Statutory Intermediary Safe Harbor Status
              </span>
              <span
                className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                  isSafe
                    ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]"
                    : "border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]"
                }`}
              >
                {isSafe ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <AlertTriangle className="h-3 w-3" />
                )}
                {shield.badgeText}
              </span>
            </div>
            <h3 className="mt-1 font-display text-lg sm:text-xl font-bold text-[#F4F4F5]">
              {isSafe
                ? "Platform aligns with statutory safe harbor criteria"
                : "Platform demonstrates potential intermediary statutory risk"}
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-md border border-[#262932] bg-[#0D0E11] px-3.5 py-2 text-xs font-medium text-[#F4F4F5] transition-colors hover:border-[#C9A227] cursor-pointer whitespace-nowrap shrink-0"
        >
          <span>{isExpanded ? "Hide Legal Analysis" : "View Full Advisory"}</span>
          {isExpanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-[#A1A1AA]">{shield.summary}</p>

      {/* Expandable Deep Analysis */}
      {isExpanded && (
        <div className="mt-5 space-y-4 border-t border-[#262932] pt-5 animate-in fade-in duration-200">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#F59E0B] flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" /> Identified Legal &amp; Financial Risks
              </p>
              <ul className="mt-2.5 space-y-2 text-xs text-[#A1A1AA] leading-relaxed">
                {shield.risks.map((risk, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-[#F59E0B] font-bold">·</span>
                    <span>{risk}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-4">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#10B981] flex items-center gap-1.5">
                <FileCheck2 className="h-3.5 w-3.5" /> Statutory Safe Harbor Requirements
              </p>
              <ul className="mt-2.5 space-y-2 text-xs text-[#A1A1AA] leading-relaxed">
                {shield.remedies.map((remedy, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-[#10B981] font-bold">·</span>
                    <span>{remedy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-md border border-[#262932] bg-[#0D0E11] p-4">
            <div className="text-xs text-[#A1A1AA]">
              <strong className="text-[#F4F4F5]">Governing Statutes:</strong>{" "}
              {shield.statutoryBasis}
            </div>

            {onOpenRemediationModal && (
              <button
                type="button"
                onClick={onOpenRemediationModal}
                className="btn-gold text-xs font-semibold py-2 px-4 rounded-md cursor-pointer shrink-0 whitespace-nowrap"
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
