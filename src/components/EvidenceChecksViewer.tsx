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
  Clock,
  ExternalLink,
  ClipboardList,
} from "lucide-react";

interface EvidenceChecksViewerProps {
  summary?: ChecksSummary;
  isWafBlocked?: boolean;
  wafBadge?: string;
  wafReason?: string;
  scannedAtUtc?: string;
  scannedAtIst?: string;
}

export function EvidenceChecksViewer({
  summary,
  isWafBlocked,
  wafBadge,
  wafReason,
  scannedAtUtc,
  scannedAtIst,
}: EvidenceChecksViewerProps) {
  const [selectedCategory, setSelectedCategory] = useState<CheckCategory | "ALL">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [manualChecks, setManualChecks] = useState<{ [key: string]: boolean }>({});

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
          <span className="inline-flex items-center gap-1 rounded bg-[#10B981]/10 border border-[#10B981]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#10B981]">
            <CheckCircle2 className="h-3 w-3" /> PASS
          </span>
        );
      case "WARNING":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-[#F59E0B]/10 border border-[#F59E0B]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#F59E0B]">
            <AlertTriangle className="h-3 w-3" /> WARNING
          </span>
        );
      case "FAIL":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-[#EF4444]/10 border border-[#EF4444]/40 px-2 py-0.5 text-[10px] font-mono font-bold text-[#EF4444]">
            <XCircle className="h-3 w-3" /> FAIL
          </span>
        );
      case "NOT_CHECKED":
        return (
          <span className="inline-flex items-center gap-1 rounded bg-[#15171C] border border-[#262932] px-2 py-0.5 text-[10px] font-mono font-bold text-[#71717A]">
            <HelpCircle className="h-3 w-3" /> NOT CHECKED
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: CheckResult["severity"]) => {
    switch (severity) {
      case "CRITICAL":
        return <span className="text-[10px] font-mono text-[#EF4444] font-bold">CRITICAL</span>;
      case "HIGH":
        return <span className="text-[10px] font-mono text-[#F59E0B] font-bold">HIGH</span>;
      case "MEDIUM":
        return <span className="text-[10px] font-mono text-[#F59E0B]">MEDIUM</span>;
      case "LOW":
        return <span className="text-[10px] font-mono text-[#A1A1AA]">LOW</span>;
      default:
        return <span className="text-[10px] font-mono text-[#71717A]">INFO</span>;
    }
  };

  const toggleManualCheck = (key: string) => {
    setManualChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-6 space-y-5">
      {/* WAF Shield Detected Alert Banner */}
      {isWafBlocked && (
        <div className="rounded-md border border-[#F59E0B]/50 bg-[#0D0E11] p-4 space-y-3 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[#F59E0B]">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <h4 className="text-xs sm:text-sm font-bold font-mono uppercase tracking-wide text-[#FAF8F5]">
                {wafBadge ||
                  "WAF / Bot Shield Detected on Target — Showing Verified DNS/TLS Results + Guided Manual Audit Checklist"}
              </h4>
            </div>
            <span className="inline-flex items-center rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-0.5 text-[10px] font-mono font-bold text-[#F59E0B] self-start sm:self-auto">
              EDGE DEFENSE ACTIVE
            </span>
          </div>

          <p className="text-xs text-[#A1A1AA] leading-relaxed">
            The target domain is protected by edge perimeter security (
            {wafReason || "Cloudflare Turnstile / Imperva / Edge Shield"}), which blocked direct raw
            HTML fetching. ASJi One successfully executed cryptographically verified DNS-over-HTTPS
            (DoH) queries (A/AAAA, CAA, SPF, DMARC) and direct TLS socket inspections. Complete
            verification using the guided manual checklist below:
          </p>

          {/* Guided Manual Checklist */}
          <div className="rounded border border-[#262932] bg-[#15171C] p-3 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2 text-[#C9A227] pb-1 border-b border-[#262932] font-bold">
              <ClipboardList className="h-4 w-4" />
              <span>Guided Manual Compliance Verification Checklist</span>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px] text-[#F4F4F5]">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(manualChecks["step-cmp"])}
                  onChange={() => toggleManualCheck("step-cmp")}
                  className="mt-0.5 accent-[#C9A227] rounded"
                />
                <span>
                  1. Open in private incognito window: Confirm affirmative Cookie Consent Banner
                  appears before third-party tags fire.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(manualChecks["step-reject"])}
                  onChange={() => toggleManualCheck("step-reject")}
                  className="mt-0.5 accent-[#C9A227] rounded"
                />
                <span>
                  2. Equal Prominence: Verify 'Reject All' / 'Deny' button is immediately visible
                  alongside 'Accept All'.
                </span>
              </label>
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(manualChecks["step-privacy"])}
                  onChange={() => toggleManualCheck("step-privacy")}
                  className="mt-0.5 accent-[#C9A227] rounded"
                />
                <span>
                  3. Statutory Disclosures: Verify Privacy Policy and DPDP Grievance Officer / DPO
                  contacts are linked in footer.
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262932] pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <Shield className="h-5 w-5 text-[#C9A227]" />
            <h3 className="text-lg font-bold font-display text-[#F4F4F5]">
              120+ Evidence-Based Compliance Checks
            </h3>
            <span className="font-mono text-xs text-[#C9A227] tabular-nums">
              {summary.checksRun} of {summary.totalChecks} checks run
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Zero fabrication: Every determination is grounded strictly in observed DNS records
            (DoH), response headers, TLS socket certificates, or DOM script forensics.
          </p>
          {(scannedAtUtc || scannedAtIst) && (
            <div className="mt-2 flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
              <Clock className="h-3.5 w-3.5 text-[#C9A227]" />
              <span>Timestamp: </span>
              {scannedAtUtc && <span className="text-[#A1A1AA]">{scannedAtUtc}</span>}
              {scannedAtUtc && scannedAtIst && <span>·</span>}
              {scannedAtIst && <span className="text-[#C9A227]">{scannedAtIst}</span>}
            </div>
          )}
        </div>

        {/* Summary Counters */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono tabular-nums">
          <span className="rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2.5 py-1 text-[#10B981] font-bold">
            {summary.passedCount} Pass
          </span>
          <span className="rounded border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-[#EF4444] font-bold">
            {summary.failedCount} Fail
          </span>
          <span className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-1 text-[#F59E0B] font-bold">
            {summary.warningCount} Warning
          </span>
          {summary.notCheckedCount > 0 && (
            <span className="rounded border border-[#262932] bg-[#0D0E11] px-2.5 py-1 text-[#71717A] font-bold">
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
          className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-mono transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
            selectedCategory === "ALL"
              ? "bg-[#C9A227] text-[#0D0E11] font-bold"
              : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
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
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap tabular-nums ${
                selectedCategory === cat
                  ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                  : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
              }`}
            >
              <span>{cat}</span>
              <span className="text-[10px] opacity-80 font-bold">
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
              className="rounded-md border border-[#262932] bg-[#0D0E11] transition-colors hover:border-[#C9A227]/50 overflow-hidden"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : check.id)}
                className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="shrink-0">{getStatusBadge(check.status)}</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#F4F4F5] font-mono truncate">
                        {check.id} · {check.title}
                      </span>
                      {getSeverityBadge(check.severity)}
                    </div>
                    <p className="text-[11px] text-[#71717A] truncate mt-0.5 font-mono">
                      {check.evidence}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  aria-label={isExpanded ? "Collapse check" : "Expand check"}
                  className="shrink-0 text-[#A1A1AA] hover:text-[#C9A227] transition-colors p-1"
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
                <div className="border-t border-[#262932] bg-[#15171C] p-4 space-y-2.5 text-xs font-mono">
                  <div>
                    <span className="text-[#A1A1AA] font-bold">Description: </span>
                    <span className="text-[#F4F4F5]">{check.description}</span>
                  </div>

                  <div className="p-2.5 rounded-md bg-[#0D0E11] border border-[#262932] text-[#C9A227]">
                    <span className="font-bold">Observed Evidence: </span>
                    <span className="text-[#F4F4F5] break-all">{check.evidence}</span>
                  </div>

                  {check.reasonIfNotChecked && (
                    <div className="p-2.5 rounded-md bg-[#0D0E11] border border-[#262932] text-[#A1A1AA]">
                      <span className="font-bold text-[#F4F4F5]">Not Checked Reason: </span>
                      <span>{check.reasonIfNotChecked}</span>
                    </div>
                  )}

                  {check.testedAt && (
                    <div className="flex items-center gap-2 text-[11px] text-[#71717A] pt-0.5">
                      <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                      <span>Scan Time: {check.testedAt}</span>
                    </div>
                  )}

                  {check.lawRefs && check.lawRefs.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <span className="text-[10px] text-[#71717A] font-bold uppercase tracking-wider">
                        Statutory Frameworks:
                      </span>
                      {check.lawRefs.map((law, i) => (
                        <span key={law} className="text-[11px] font-mono text-[#C9A227]">
                          {law}
                          {i < (check.lawRefs?.length ?? 0) - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                  )}

                  {check.remediation && (
                    <div className="p-2.5 rounded-md bg-[#FAF8F5] border border-[#E5DEC9] text-[#18181B] mt-2 font-sans">
                      <span className="font-bold text-[#9A7812] font-mono text-[11px] uppercase tracking-wider block mb-0.5">
                        Remediation Step
                      </span>
                      <span className="text-xs leading-relaxed">{check.remediation}</span>
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
