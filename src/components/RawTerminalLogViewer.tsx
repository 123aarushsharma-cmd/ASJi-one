import React, { useState } from "react";
import {
  Check,
  Copy,
  Terminal,
  Shield,
  Lock,
  ExternalLink,
  Scale,
  ArrowRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from "lucide-react";

interface RawTerminalLogViewerProps {
  rawLog: string;
  targetDomain?: string;
  onOpenRemediationModal?: () => void;
  className?: string;
}

export function RawTerminalLogViewer({
  rawLog,
  targetDomain,
  onOpenRemediationModal,
  className = "",
}: RawTerminalLogViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawLog);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const lines = rawLog.split("\n");

  const renderHighlightedLine = (line: string, index: number) => {
    const trimmed = line.trim();

    if (/^[-=]{10,}$/.test(trimmed)) {
      return (
        <div key={index} className="py-1 select-none">
          <div className="border-t border-[#262932]">
            <span className="sr-only">{line}</span>
          </div>
        </div>
      );
    }

    if (trimmed.includes("[ASJi ONE // AUTONOMOUS TRUST RADAR TERMINAL LOG]")) {
      return (
        <div key={index} className="py-1">
          <div className="inline-flex items-center gap-2 rounded border border-[#C9A227]/50 bg-[#0D0E11] px-2.5 py-1">
            <Terminal className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C9A227]">
              ASJi ONE // COMPLIANCE INSPECTION LOG
            </span>
          </div>
        </div>
      );
    }

    if (trimmed.includes("[ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]")) {
      return (
        <div key={index} className="py-1.5">
          <div className="inline-flex items-center gap-2 rounded border border-[#F59E0B]/50 bg-[#0D0E11] px-3 py-1.5">
            <Shield className="h-4 w-4 text-[#F59E0B] shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-[#F59E0B]">
              ASJi ONE // STATUTORY INTERMEDIARY ADVISORY REGISTER
            </span>
          </div>
        </div>
      );
    }

    if (trimmed.startsWith("TARGET DOMAIN:") || trimmed.startsWith("TARGET NODE:")) {
      const domainVal = trimmed.replace(/^TARGET (DOMAIN|NODE):\s*/, "");
      return (
        <div key={index} className="py-1 font-mono text-xs flex flex-wrap items-center gap-2">
          <span className="text-[#C9A227] font-bold tracking-wide">TARGET DOMAIN:</span>
          <span className="font-bold text-[#FAF8F5] bg-[#0D0E11] border border-[#262932] px-2 py-0.5 rounded">
            {domainVal.trim() || targetDomain || "example.com"}
          </span>
        </div>
      );
    }

    if (trimmed.startsWith("VERDICT STATUS:")) {
      return (
        <div
          key={index}
          className="my-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-[#262932] bg-[#0D0E11] px-3 py-2 font-mono text-xs"
        >
          <span className="text-[#C9A227] font-bold">VERDICT STATUS:</span>
          <span className="inline-flex items-center gap-1.5 rounded border border-[#EF4444]/50 bg-[#EF4444]/10 px-2 py-0.5 text-[11px] font-bold text-[#EF4444]">
            <XCircle className="h-3 w-3" />
            <span>STRUCTURAL DRIFT DETECTED</span>
          </span>
          <span className="inline-flex items-center gap-1.5 rounded border border-[#F59E0B]/50 bg-[#F59E0B]/10 px-2 py-0.5 text-[11px] font-bold text-[#F59E0B]">
            <Shield className="h-3 w-3" />
            <span>POTENTIAL EXEMPTION SHIELD EVALUATED</span>
          </span>
        </div>
      );
    }

    if (
      trimmed === "[JURISDICTION VERDICT MATRIX]:" ||
      trimmed === "[CROSS-BORDER DATA ANALYSIS]:" ||
      trimmed === "[THE LEGAL INTERCEPTION EXPLANATION]:"
    ) {
      return (
        <div key={index} className="pt-2.5 pb-1">
          <span className="inline-flex items-center gap-1.5 rounded border border-[#262932] bg-[#0D0E11] px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-wider text-[#C9A227]">
            <Shield className="h-3 w-3 text-[#C9A227]" />
            {trimmed.replace(/[[\]:]/g, "")}
          </span>
        </div>
      );
    }

    if (trimmed.startsWith("- NOTICE: This platform") || trimmed.startsWith("- NOTICE:")) {
      return (
        <div
          key={index}
          className="my-1.5 rounded-lg border border-[#262932] bg-[#0D0E11] p-3 font-mono text-xs leading-relaxed text-zinc-200"
        >
          <div className="flex items-center gap-1.5 text-[#C9A227] font-bold mb-1">
            <Scale className="h-3.5 w-3.5 text-[#C9A227]" />
            <span>STATUTORY INTERMEDIARY NOTICE &amp; SAFE HARBOR AUDIT</span>
          </div>
          <p className="text-zinc-300">{trimmed.replace(/^- NOTICE:\s*/, "")}</p>
          <div className="mt-2 flex flex-wrap gap-2 pt-2 border-t border-[#262932] text-[10px] text-[#C9A227]">
            <span className="rounded bg-[#15171C] border border-[#262932] px-2 py-0.5 font-semibold">
              INDIA IT ACT SEC 79
            </span>
            <span className="rounded bg-[#15171C] border border-[#262932] px-2 py-0.5 font-semibold">
              US CDA SEC 230
            </span>
            <span className="rounded bg-[#15171C] border border-[#262932] px-2 py-0.5 font-semibold">
              DPDP SEC 33 SAFEGUARD
            </span>
          </div>
        </div>
      );
    }

    if (/^-\s*\[(IN|EU|UK|AE|SA|SG)\]/.test(trimmed)) {
      const passMatch = trimmed.includes("[PASS]");
      const failMatch = trimmed.includes("[FAIL]");
      const splitToken = passMatch ? "[PASS]" : failMatch ? "[FAIL]" : ":";
      const parts = line.split(splitToken);
      const rawLabel = (parts[0] || "").replace(/^-/, "").replace(/:\s*$/, "").trim();
      const isoMatch = rawLabel.match(/^\[(IN|EU|UK|AE|SA|SG)\]\s*(.*)$/);
      const isoCode = isoMatch ? isoMatch[1] : "";
      const restLabel = isoMatch ? isoMatch[2] : rawLabel;

      return (
        <div
          key={index}
          className="my-0.5 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#262932] bg-[#0D0E11] px-2.5 py-1.5 font-mono text-xs"
        >
          <div className="flex items-center gap-2 text-[#FAF8F5] font-semibold">
            {isoCode && (
              <span className="rounded border border-[#262932] bg-[#15171C] px-1.5 py-0.5 text-[10px] font-bold text-[#C9A227]">
                [{isoCode}]
              </span>
            )}
            <span>{restLabel}</span>
          </div>

          <div>
            {passMatch && (
              <span className="inline-flex items-center gap-1 rounded border border-[#10B981]/50 bg-[#10B981]/10 px-2 py-0.5 text-[11px] font-bold text-[#10B981]">
                <CheckCircle2 className="h-3 w-3" />
                <span>PASS</span>
              </span>
            )}
            {failMatch && (
              <span className="inline-flex items-center gap-1 rounded border border-[#EF4444]/50 bg-[#EF4444]/10 px-2 py-0.5 text-[11px] font-bold text-[#EF4444]">
                <XCircle className="h-3 w-3" />
                <span>FAIL</span>
              </span>
            )}
            {!passMatch && !failMatch && (
              <span className="text-[#C9A227] font-bold">{parts[1]}</span>
            )}
          </div>
        </div>
      );
    }

    if (trimmed.startsWith("- ROUTING LEDGER STATUS:")) {
      const isCompliant = trimmed.includes("[COMPLIANT]") && !trimmed.includes("NON-COMPLIANT");
      return (
        <div
          key={index}
          className="my-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#262932] bg-[#0D0E11] px-2.5 py-1.5 font-mono text-xs"
        >
          <span className="text-[#C9A227] font-bold">ROUTING LEDGER STATUS</span>
          {isCompliant ? (
            <span className="inline-flex items-center gap-1 rounded border border-[#10B981]/50 bg-[#10B981]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#10B981]">
              <Shield className="h-3 w-3" />
              <span>COMPLIANT · SOVEREIGN PERIMETER</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded border border-[#EF4444]/50 bg-[#EF4444]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#EF4444]">
              <AlertTriangle className="h-3 w-3" />
              <span>NON-COMPLIANT · EXTERNAL TRANSFER DRIFT</span>
            </span>
          )}
        </div>
      );
    }

    if (trimmed.startsWith("- ANOMALY CAPTURE LOG:")) {
      const logContent = line.replace(/^- ANOMALY CAPTURE LOG:\s*/, "");
      return (
        <div
          key={index}
          className="my-1 rounded-lg border border-[#262932] bg-[#0D0E11] p-2.5 font-mono text-xs leading-relaxed"
        >
          <span className="text-[#C9A227] font-bold block mb-1">ANOMALY CAPTURE LOG</span>
          <span className="text-zinc-300">
            {logContent.includes("US-East") ? (
              <>
                Outbound telemetry stream detected transmitting client session tokens to{" "}
                <strong className="text-[#EF4444] font-bold underline decoration-[#EF4444]/60">
                  US-East
                </strong>{" "}
                without automated endpoint encryption signatures.
              </>
            ) : logContent.includes("TLS 1.3") ? (
              <>
                All client transaction and telemetry packets remain routed through compliant{" "}
                <strong className="text-[#10B981] font-bold">TLS 1.3</strong> endpoints with valid
                cryptographic signatures.
              </>
            ) : (
              logContent
            )}
          </span>
        </div>
      );
    }

    if (
      trimmed.includes("PRODUCTION REMEDIATION CODE SUITE") ||
      trimmed.includes("AUTONOMOUS CODE REMEDIATION WRAPPER PATCH")
    ) {
      return (
        <div key={index} className="my-2">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-[#C9A227]/60 bg-[#0D0E11] p-2.5 text-center">
            <Lock className="h-4 w-4 text-[#C9A227] shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-[#C9A227]">
              PRODUCTION REMEDIATION CODE SUITE [RESTRICTED]
            </span>
          </div>
        </div>
      );
    }

    if (
      trimmed.includes("SPECIALIZED STATUTORY EXEMPTION & DEFENSE ANALYSIS") ||
      trimmed.includes("SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS")
    ) {
      return (
        <div key={index} className="my-2.5">
          <div className="flex items-center justify-center gap-2 rounded-lg border border-[#F59E0B]/60 bg-[#0D0E11] p-2.5 text-center">
            <Lock className="h-4 w-4 text-[#F59E0B] shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-bold tracking-wider uppercase text-[#F59E0B]">
              SPECIALIZED STATUTORY EXEMPTION &amp; DEFENSE ANALYSIS [RESTRICTED]
            </span>
          </div>
        </div>
      );
    }

    if (
      trimmed.startsWith("// CODE REPOSITORY IS LOCKED") ||
      trimmed.startsWith("// DIRECT ACCESS AVAILABLE") ||
      trimmed.startsWith("// STATUTORY EXEMPTION MITIGATION") ||
      trimmed.startsWith("// CRITICAL EXEMPTION MITIGATION") ||
      trimmed.startsWith("// FOR INTERMEDIARY NETWORKS")
    ) {
      return (
        <div key={index} className="py-0.5 font-mono text-xs text-zinc-300">
          <span className="text-[#C9A227] font-bold">// </span>
          <span>{trimmed.replace(/^\/\/\s*/, "")}</span>
        </div>
      );
    }

    if (trimmed.includes("[BUTTON ACTION:")) {
      return (
        <div key={index} className="my-3 flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={onOpenRemediationModal}
            className="btn-gold inline-flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            <span>Generate Statutory Pack &amp; Unlock Patches</span>
            <ArrowRight className="h-3.5 w-3.5" />
            <ExternalLink className="h-3 w-3 opacity-80" />
          </button>
        </div>
      );
    }

    if (trimmed === "") {
      return <div key={index} className="h-2.5 select-none" />;
    }

    return (
      <div key={index} className="py-0.5 font-mono text-xs text-zinc-300">
        {line}
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-[#262932] bg-[#15171C] transition-colors ${className}`}
    >
      {/* Top Inspection Console Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262932] bg-[#0D0E11] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Terminal className="h-4 w-4 text-[#C9A227]" />
          <span className="font-mono text-xs font-bold tracking-wider text-[#FAF8F5] uppercase">
            ASJi Compliance Inspection Stream
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            type="button"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="rounded border border-[#262932] bg-[#15171C] px-2.5 py-1 text-zinc-300 hover:border-[#C9A227] hover:text-[#C9A227] transition-colors cursor-pointer"
          >
            {showLineNumbers ? "Hide Line #s" : "Show Line #s"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-bold transition-colors cursor-pointer ${
              copied
                ? "border-[#10B981]/60 bg-[#10B981]/10 text-[#10B981]"
                : "border-[#C9A227]/60 bg-[#C9A227]/10 text-[#C9A227] hover:bg-[#C9A227] hover:text-[#0D0E11]"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>COPY LOG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Log Stream Body */}
      <div className="relative p-4 sm:p-5 font-mono overflow-x-auto max-h-[550px] overflow-y-auto selection:bg-[#C9A227]/30 selection:text-[#FAF8F5]">
        <div className="space-y-0.5">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              {showLineNumbers && (
                <span className="w-6 shrink-0 select-none font-mono text-[10px] text-zinc-600 group-hover:text-[#C9A227] text-right pt-1 tabular-nums">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              )}
              <div className="flex-1 min-w-0">{renderHighlightedLine(line, idx)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Reference */}
      <div className="flex items-center justify-between border-t border-[#262932] bg-[#0D0E11] px-4 py-2 font-mono text-[10px] text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="text-[#C9A227] font-bold">TRANSPORT VERIFICATION:</span>
          <span>TLS 1.3 · ECDSA P-384 · SHA-256</span>
        </div>
        <span className="text-zinc-500">READ-ONLY PASSIVE INSPECTION</span>
      </div>
    </div>
  );
}
