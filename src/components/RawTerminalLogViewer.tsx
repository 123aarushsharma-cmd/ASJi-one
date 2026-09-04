import React, { useState } from "react";
import { Check, Copy, Terminal, Shield, Sparkles, Lock, ExternalLink } from "lucide-react";

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

    // 1. Horizontal Border Delimiters (----- or =====)
    if (/^[-=]{10,}$/.test(trimmed)) {
      return (
        <div key={index} className="py-0.5 select-none opacity-60">
          <div className="border-t border-[#D4AF37]/35 relative">
            <span className="sr-only">{line}</span>
          </div>
        </div>
      );
    }

    // 2. Main System Header: [ASJi ONE // AUTONOMOUS TRUST RADAR TERMINAL LOG]
    if (trimmed.includes("[ASJi ONE // AUTONOMOUS TRUST RADAR TERMINAL LOG]")) {
      return (
        <div key={index} className="py-1">
          <div className="inline-flex items-center gap-2 rounded-md border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/10 to-transparent px-2.5 py-1">
            <Terminal className="h-3.5 w-3.5 text-[#E5C158] animate-pulse shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-[#E5C158] drop-shadow-[0_0_10px_rgba(212,175,55,0.4)]">
              [ASJi ONE // AUTONOMOUS TRUST RADAR TERMINAL LOG]
            </span>
          </div>
        </div>
      );
    }

    // 2B. Intermediary Header: [ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]
    if (trimmed.includes("[ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]")) {
      return (
        <div key={index} className="py-1.5">
          <div className="inline-flex items-center gap-2 rounded-md border border-amber-500/60 bg-gradient-to-r from-amber-500/25 via-amber-500/10 to-transparent px-3 py-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Shield className="h-4 w-4 text-amber-400 animate-pulse shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-amber-300 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              [ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]
            </span>
          </div>
        </div>
      );
    }

    // 3. Target Domain Line: TARGET DOMAIN: example.com OR TARGET NODE: example.com
    if (trimmed.startsWith("TARGET DOMAIN:") || trimmed.startsWith("TARGET NODE:")) {
      const isNode = trimmed.startsWith("TARGET NODE:");
      const parts = line.split(isNode ? "TARGET NODE:" : "TARGET DOMAIN:");
      const domainVal = parts[1] || "";
      return (
        <div key={index} className="py-0.5 font-mono text-xs">
          <span className="text-[#D4AF37] font-bold tracking-wide">
            {isNode ? "TARGET NODE:" : "TARGET DOMAIN:"}
          </span>
          <span className="ml-2 font-bold text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-0.5 rounded shadow-sm">
            {domainVal.trim() || targetDomain || "domain.com"}
          </span>
        </div>
      );
    }

    // 3B. Intermediary Verdict Status: VERDICT STATUS: 🟥 STRUCTURAL DRIFT DETECTED (POTENTIAL EXEMPTION SHIELD ACTIVE)
    if (trimmed.startsWith("VERDICT STATUS:")) {
      return (
        <div
          key={index}
          className="my-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-950/30 px-2.5 py-1.5 font-mono text-xs"
        >
          <span className="text-amber-400 font-bold">VERDICT STATUS:</span>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-rose-500/60 bg-rose-500/20 px-2 py-0.5 text-[11px] font-black text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
            <span>🟥</span>
            <span>STRUCTURAL DRIFT DETECTED</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/50 bg-amber-500/20 px-2 py-0.5 text-[11px] font-bold text-amber-200">
            <span>🛡️</span>
            <span>POTENTIAL EXEMPTION SHIELD ACTIVE</span>
          </span>
        </div>
      );
    }

    // 4. Section Headers: [JURISDICTION VERDICT MATRIX]: and [CROSS-BORDER DATA ANALYSIS]: and [THE LEGAL INTERCEPTION EXPLANATION]:
    if (
      trimmed === "[JURISDICTION VERDICT MATRIX]:" ||
      trimmed === "[CROSS-BORDER DATA ANALYSIS]:" ||
      trimmed === "[THE LEGAL INTERCEPTION EXPLANATION]:"
    ) {
      return (
        <div key={index} className="pt-2.5 pb-1">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-2.5 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[#F3E5AB] shadow-sm">
            <Shield className="h-3 w-3 text-[#D4AF37]" />
            {trimmed}
          </span>
        </div>
      );
    }

    // 4B. Legal Interception Explanation Notice
    if (
      trimmed.startsWith(
        "- NOTICE: This platform utilizes multi-layered Intermediary Immunity Frameworks",
      )
    ) {
      return (
        <div
          key={index}
          className="my-1.5 rounded-lg border border-amber-500/30 bg-amber-950/20 p-3 font-mono text-xs leading-relaxed text-amber-100/90 shadow-inner"
        >
          <div className="flex items-center gap-1.5 text-amber-400 font-black mb-1">
            <span className="text-[#D4AF37]">⚖️</span>
            <span>STATUTORY INTERMEDIARY NOTICE &amp; SAFE HARBOR AUDIT:</span>
          </div>
          <p className="text-neutral-200">{trimmed.replace(/^- NOTICE:\s*/, "")}</p>
          <div className="mt-2 flex flex-wrap gap-2 pt-1 border-t border-amber-500/20 text-[10px] text-amber-300">
            <span className="rounded bg-amber-900/40 border border-amber-500/30 px-1.5 py-0.5 font-bold">
              INDIA IT ACT SEC 79 (SAFE HARBOR)
            </span>
            <span className="rounded bg-amber-900/40 border border-amber-500/30 px-1.5 py-0.5 font-bold">
              US CDA SEC 230 / GLOBAL TREATY
            </span>
            <span className="rounded bg-amber-900/40 border border-amber-500/30 px-1.5 py-0.5 font-bold">
              DPDP SEC 33 REGULATORY ORDER PREREQUISITE
            </span>
          </div>
        </div>
      );
    }

    // 5. Jurisdiction Matrix Lines (e.g., - 🇮🇳 INDIA DPDP ACT 2023: [🟥 FAIL])
    if (/^-\s*(🇮🇳|🇪🇺|🇬🇧|🇦🇪|🇸🇦|🇸🇬)/.test(trimmed)) {
      const passMatch = trimmed.includes("[🟩 PASS]");
      const failMatch = trimmed.includes("[🟥 FAIL]");

      // Split before status
      const splitToken = passMatch ? "[🟩 PASS]" : failMatch ? "[🟥 FAIL]" : ":";
      const parts = line.split(splitToken);
      const labelPart = parts[0] || "";

      return (
        <div
          key={index}
          className={`my-0.5 flex flex-wrap items-center justify-between gap-2 rounded-lg px-2 py-1 font-mono text-xs transition-colors ${
            passMatch
              ? "bg-emerald-950/20 border border-emerald-500/20"
              : "bg-rose-950/20 border border-rose-500/20"
          }`}
        >
          <div className="flex items-center gap-2 text-neutral-100 font-semibold">
            <span className="text-[#D4AF37] select-none font-bold">›</span>
            <span>{labelPart.replace(/^-/, "").trim()}</span>
          </div>

          <div>
            {passMatch && (
              <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/60 bg-emerald-500/20 px-2 py-0.5 text-[11px] font-black text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                <span>🟩</span>
                <span>PASS</span>
              </span>
            )}
            {failMatch && (
              <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/60 bg-rose-500/20 px-2 py-0.5 text-[11px] font-black text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.25)]">
                <span>🟥</span>
                <span>FAIL</span>
              </span>
            )}
            {!passMatch && !failMatch && (
              <span className="text-[#E5C158] font-bold">{parts[1]}</span>
            )}
          </div>
        </div>
      );
    }

    // 6. Cross-Border Routing Ledger Status
    if (trimmed.startsWith("- ROUTING LEDGER STATUS:")) {
      const isCompliant = trimmed.includes("[COMPLIANT]") && !trimmed.includes("NON-COMPLIANT");
      return (
        <div
          key={index}
          className="my-1 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/40 bg-black/60 px-2.5 py-1.5 font-mono text-xs"
        >
          <div className="flex items-center gap-1.5">
            <span className="text-[#D4AF37] select-none font-bold">›</span>
            <span className="text-[#D4AF37] font-bold">ROUTING LEDGER STATUS:</span>
          </div>
          {isCompliant ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/60 bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-black text-emerald-300">
              <span>🛡️</span>
              <span>[COMPLIANT - SOVEREIGN PERIMETER]</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/60 bg-rose-500/20 px-2.5 py-0.5 text-[11px] font-black text-rose-300">
              <span>⚠️</span>
              <span>[🟥 NON-COMPLIANT - US-EAST DRIFT]</span>
            </span>
          )}
        </div>
      );
    }

    // 7. Anomaly Capture Log
    if (trimmed.startsWith("- ANOMALY CAPTURE LOG:")) {
      const logContent = line.replace(/^- ANOMALY CAPTURE LOG:\s*/, "");
      return (
        <div
          key={index}
          className="my-1 rounded-lg border border-border/40 bg-black/50 p-2.5 font-mono text-xs leading-relaxed"
        >
          <span className="text-[#D4AF37] font-bold block mb-1">› ANOMALY CAPTURE LOG:</span>
          <span className="text-neutral-200">
            {logContent.includes("US-East") ? (
              <>
                Outbound telemetry stream detected transmitting client session tokens to{" "}
                <strong className="text-rose-300 font-black underline decoration-rose-500/60">
                  US-East
                </strong>{" "}
                without automated endpoint encryption signatures.
              </>
            ) : logContent.includes("TLS 1.3") ? (
              <>
                All client transaction and telemetry packets remain strictly routed through
                sovereign-compliant <strong className="text-emerald-300 font-bold">TLS 1.3</strong>{" "}
                endpoints with valid cryptographic signatures.
              </>
            ) : (
              logContent
            )}
          </span>
        </div>
      );
    }

    // 8. Remediation Box Header: 🛠️ AUTONOMOUS CODE REMEDIATION WRAPPER PATCH [L O C K E D 🔒]
    if (trimmed.includes("AUTONOMOUS CODE REMEDIATION WRAPPER PATCH")) {
      return (
        <div key={index} className="my-2">
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-[#D4AF37]/70 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/35 to-[#D4AF37]/20 p-2.5 text-center shadow-[0_0_20px_rgba(212,175,55,0.2)]">
            <Lock className="h-4 w-4 text-[#E5C158] animate-bounce shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-[#E5C158]">
              🛠️ AUTONOMOUS CODE REMEDIATION WRAPPER PATCH [L O C K E D 🔒]
            </span>
          </div>
        </div>
      );
    }

    // 8B. Defense Analysis Header: ⚖️ SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS [L O C K E D 🔒]
    if (trimmed.includes("SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS")) {
      return (
        <div key={index} className="my-2.5">
          <div className="flex items-center justify-center gap-2 rounded-lg border-2 border-amber-500/80 bg-gradient-to-r from-amber-500/25 via-amber-500/40 to-amber-500/25 p-2.5 text-center shadow-[0_0_25px_rgba(245,158,11,0.25)]">
            <Lock className="h-4 w-4 text-amber-300 animate-bounce shrink-0" />
            <span className="font-mono text-xs sm:text-sm font-black tracking-wider uppercase text-amber-200 drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]">
              ⚖️ SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS [L O C K E D 🔒]
            </span>
          </div>
        </div>
      );
    }

    // 9. Locked Code Comments: // CODE REPOSITORY IS LOCKED... or // CRITICAL EXEMPTION MITIGATION ARGUMENTS...
    if (
      trimmed.startsWith("// CODE REPOSITORY IS LOCKED") ||
      trimmed.startsWith("// CRITICAL EXEMPTION MITIGATION") ||
      trimmed.startsWith("// FOR INTERMEDIARY NETWORKS")
    ) {
      return (
        <div key={index} className="py-0.5 font-mono text-xs text-amber-200/90 italic">
          <span className="text-amber-400/80 font-bold">// </span>
          <span className="font-semibold">{trimmed.replace(/^\/\/\s*/, "")}</span>
        </div>
      );
    }

    // 10. Liability Penalty Warning: // LIABILITY PENALTY STATUS: ACCRUING UP TO ₹250 CRORES...
    if (trimmed.startsWith("// LIABILITY PENALTY STATUS:")) {
      return (
        <div
          key={index}
          className="my-1 rounded-md border border-rose-500/40 bg-rose-950/30 px-2.5 py-1 font-mono text-xs font-bold text-rose-300 shadow-sm"
        >
          <span className="text-rose-400">// </span>
          <span className="text-rose-200 font-black tracking-wide">
            LIABILITY PENALTY STATUS:{" "}
            <span className="text-rose-400 underline decoration-rose-500/80 font-black">
              ACCRUING UP TO ₹250 CRORES
            </span>{" "}
            UNTIL COMPLETION PATCH IS INJECTED.
          </span>
        </div>
      );
    }

    // 11. Upfront Transfer Fee / Retainer Fee: // REQUIRE UPFRONT DATA DEPLOYMENT... or // REQUIRE PREMIUM RECONCILIATION RETAINER...
    if (
      trimmed.startsWith("// REQUIRE UPFRONT DATA DEPLOYMENT") ||
      trimmed.startsWith("// REQUIRE PREMIUM RECONCILIATION RETAINER")
    ) {
      const isRetainer = trimmed.startsWith("// REQUIRE PREMIUM RECONCILIATION RETAINER");
      return (
        <div
          key={index}
          className="my-1 rounded-md border border-amber-500/60 bg-amber-500/15 px-2.5 py-1.5 font-mono text-xs font-bold text-amber-100"
        >
          <span className="text-amber-400">// </span>
          <span>
            {isRetainer
              ? "REQUIRE PREMIUM RECONCILIATION RETAINER ACTIVATION REGISTRY FEE OF "
              : "REQUIRE UPFRONT DATA DEPLOYMENT REGISTRY TRANSFER FEE OF "}
          </span>
          <span className="rounded bg-gradient-to-r from-[#D4AF37] to-amber-400 px-1.5 py-0.5 text-black font-black shadow-sm">
            ₹24,999 ($300 USD)
          </span>
          <span>{isRetainer ? " TO UNLOCK ESCAPE ARGUMENTS." : " TO RELEASE FULL CODE."}</span>
        </div>
      );
    }

    // 12. Button Action CTA: 👉 [BUTTON ACTION: COMPLETE CORE WIRE TRANSFER...]
    if (trimmed.includes("[BUTTON ACTION:") || trimmed.startsWith("👉")) {
      return (
        <div key={index} className="my-3 flex justify-center sm:justify-start">
          <button
            type="button"
            onClick={onOpenRemediationModal}
            className="group relative inline-flex items-center gap-2.5 rounded-xl border-2 border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] via-[#E5C158] to-[#D4AF37] px-4 py-2.5 font-mono text-xs font-black uppercase tracking-wider text-black shadow-[0_0_20px_rgba(212,175,55,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(212,175,55,0.6)] cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-black animate-spin" />
            <span>👉 COMPLETE WIRE TRANSFER &amp; UNLOCK EXECUTABLE PATCH</span>
            <ExternalLink className="h-3.5 w-3.5 text-black opacity-80 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      );
    }

    // 13. Empty blank lines
    if (trimmed === "") {
      return <div key={index} className="h-2.5 select-none" />;
    }

    // 14. Fallback formatted line with ASJi Theme Colors
    return (
      <div key={index} className="py-0.5 font-mono text-xs text-neutral-200">
        {line}
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#080807] shadow-2xl transition-all ${className}`}
      style={{
        boxShadow: "0 20px 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(212, 175, 55, 0.08)",
      }}
    >
      {/* Top Terminal macOS / Linux Control Chrome */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 bg-gradient-to-r from-[#14120e] via-[#0d0c0b] to-[#14120e] px-4 py-2.5">
        {/* Left: Window Dots & Daemon Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-rose-500/90 shadow-sm inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/90 shadow-sm inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/90 shadow-sm inline-block" />
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <Terminal className="h-3.5 w-3.5 text-[#E5C158] animate-pulse" />
            <span className="font-mono text-[11px] font-bold tracking-wider text-[#E5C158] uppercase">
              ASJI_TRUST_RADAR_DAEMON // V8_HEADLESS_SOCKET_STREAM
            </span>
          </div>
        </div>

        {/* Right: Telemetry Indicators & Quick Actions */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/30 px-2.5 py-0.5 text-emerald-300 font-bold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>LIVE SOCKET // 80_COLS</span>
          </div>

          <button
            type="button"
            onClick={() => setShowLineNumbers(!showLineNumbers)}
            className="rounded border border-[#D4AF37]/30 bg-black/60 px-2 py-1 text-[#E5C158] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
            title="Toggle line numbers"
          >
            {showLineNumbers ? "Hide #s" : "Show #s"}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 rounded border px-2.5 py-1 font-bold transition-all cursor-pointer ${
              copied
                ? "border-emerald-500/70 bg-emerald-500/20 text-emerald-300"
                : "border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#E5C158] hover:bg-[#D4AF37] hover:text-black"
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
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

      {/* Main Terminal Output Stream Body */}
      <div className="relative p-4 sm:p-5 font-mono overflow-x-auto max-h-[550px] overflow-y-auto selection:bg-[#D4AF37]/30 selection:text-white">
        {/* Subtle Scanlines effect overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02] bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:16px_16px]"
          aria-hidden="true"
        />

        <div className="space-y-0.5">
          {lines.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3 group">
              {showLineNumbers && (
                <span className="w-6 shrink-0 select-none font-mono text-[10px] text-[#D4AF37]/40 group-hover:text-[#D4AF37]/80 text-right pt-0.5">
                  {String(idx + 1).padStart(2, "0")}
                </span>
              )}
              <div className="flex-1 min-w-0">{renderHighlightedLine(line, idx)}</div>
            </div>
          ))}

          {/* Active Terminal Cursor */}
          <div className="flex items-center gap-2 pt-2 text-[#D4AF37]">
            {showLineNumbers && <span className="w-6 shrink-0" />}
            <span className="inline-block h-3.5 w-2 bg-[#D4AF37] animate-pulse shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
            <span className="font-mono text-[10px] text-[#D4AF37]/60 select-none">
              Awaiting next sovereign socket frame...
            </span>
          </div>
        </div>
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="flex items-center justify-between border-t border-[#D4AF37]/25 bg-black/80 px-4 py-1.5 font-mono text-[10px] text-[#a3a3a3]">
        <div className="flex items-center gap-2">
          <span className="text-[#E5C158] font-bold">ASJi PROTOCOL:</span>
          <span>TLS 1.3 / ECDSA_P384 / SHA-256</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">BUFFER: 100% VERIFIED</span>
          <span className="text-[#34d399] font-bold flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
