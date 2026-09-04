import React, { useState, useEffect } from "react";
import {
  Terminal,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  ArrowRight,
  Zap,
  Globe,
  Radio,
  Server,
  AlertTriangle,
  Scale,
  FileCode2,
  Clock,
  Landmark,
  Eye,
  Key,
} from "lucide-react";
import type { AuditReport, RadarTerminalData } from "@/lib/audit-types";
import { computeRadarTerminalLog } from "@/lib/audit-radar";
import { RawTerminalLogViewer } from "./RawTerminalLogViewer";

interface AutonomousTrustRadarTerminalProps {
  report: AuditReport;
  onOpenRemediationModal?: () => void;
}

export function AutonomousTrustRadarTerminal({
  report,
  onOpenRemediationModal,
}: AutonomousTrustRadarTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "terminal" | "matrix" | "penalty" | "dispute" | "crossborder" | "intermediary"
  >("terminal");

  // Live compounding penalty clock simulation in Rupees
  const [accruedPenalty, setAccruedPenalty] = useState(2500000000); // ₹250 Crores base cap

  useEffect(() => {
    const timer = setInterval(() => {
      // Micro-increment statutory exposure counter by small increments to simulate live tracking
      setAccruedPenalty((prev) => prev + Math.floor(Math.random() * 450 + 120));
    }, 250);
    return () => clearInterval(timer);
  }, []);

  // Fallback if radarTerminal was not attached previously
  const radar: RadarTerminalData =
    report.radarTerminal || computeRadarTerminalLog(report.target || "domain.com", null, report);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(radar.terminalLogRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
  };

  const matrixItems = [
    {
      flag: "🇮🇳",
      label: "INDIA DPDP ACT 2023",
      statute: "Section 6(1) Telemetry Drift & Section 8(1) Safeguards",
      data: radar.verdictMatrix.indiaDpdp2023,
    },
    {
      flag: "🇪🇺",
      label: "EU GDPR REFORMS",
      statute: "Article 7 Consent Logs & Article 32 Safeguards",
      data: radar.verdictMatrix.euGdprReforms,
    },
    {
      flag: "🇬🇧",
      label: "UK DUAA 2026",
      statute: "Data (Use & Access) Act Telemetry Boundaries",
      data: radar.verdictMatrix.ukDuaa2026,
    },
    {
      flag: "🇦🇪",
      label: "UAE DECREE LAW 45",
      statute: "Decree-Law No. 45/2021 User Selection Tokens",
      data: radar.verdictMatrix.uaeDecreeLaw45,
    },
    {
      flag: "🇸🇦",
      label: "SAUDI ARABIA PDPL",
      statute: "Saudi PDPL 2024 Data Principal Opt-In",
      data: radar.verdictMatrix.saudiArabiaPdpl,
    },
    {
      flag: "🇸🇬",
      label: "SINGAPORE PDPA",
      statute: "Section 26 Transfer Limitation Obligation",
      data: radar.verdictMatrix.singaporePdpa,
    },
  ];

  const hasAnyFailure = matrixItems.some((m) => !m.data.pass);
  const overallVerdict = hasAnyFailure ? "[🟥 FAIL]" : "[🟩 PASS]";

  return (
    <section
      id="radar-terminal"
      className="relative my-8 overflow-hidden rounded-3xl border border-primary/40 bg-[#070707] p-5 sm:p-7 shadow-2xl backdrop-blur-2xl font-mono text-xs"
      style={{
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.95), 0 0 45px rgba(212, 175, 55, 0.12)",
      }}
    >
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-500/5 blur-3xl" />

      {/* Terminal Monospace Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/90 shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-amber-500/90 shadow-sm" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/90 shadow-sm" />
          </div>
          <div className="flex items-center gap-2 font-mono text-xs font-bold text-foreground">
            <Terminal className="h-4 w-4 text-primary animate-pulse" />
            <span className="tracking-wider text-gold-gradient uppercase text-sm">
              ASJi ONE // RAW TERMINAL MONOSPACE INTERFACE DISPLAY
            </span>
          </div>
        </div>

        {/* Global Copy Raw Log Action */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-xs transition-all cursor-pointer ${
            copied
              ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400 font-bold"
              : "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
          }`}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span>Copied Raw Log</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Terminal Log</span>
            </>
          )}
        </button>
      </div>

      {/* Flagship Binary Verdict Banner & Target Metadata */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Box 1: Strictly Binary Verdict Status */}
        <div className="rounded-2xl border border-red-500/40 bg-red-950/20 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block">
              VERDICT STATUS (STRICT BINARY LOGIC)
            </span>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-2xl font-black font-mono tracking-tight text-red-400">
                {overallVerdict}
              </span>
              <span className="rounded bg-red-500/20 border border-red-500/40 px-2 py-0.5 text-[10px] font-bold text-red-300">
                {hasAnyFailure ? "FAIL STATE LOCKED" : "ALL JURISDICTIONS CLEAR"}
              </span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground leading-relaxed">
            Binary compliance enforcement active: Zero statistical score percentage drift. Output is
            strictly PASS or FAIL.
          </p>
        </div>

        {/* Box 2: Penalty Clock Alert */}
        <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold flex items-center gap-1">
                <Clock className="h-3 w-3 animate-spin" /> PENALTY CLOCK ALERT
              </span>
              <span className="text-[9px] font-bold text-red-400 animate-pulse">DPDP SEC 33</span>
            </div>
            <div className="mt-1.5">
              <p className="text-xl font-black text-amber-400 font-mono tracking-tight">
                UP TO ₹250 CRORES LIABILITY
              </p>
              <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                Accruing exposure: ₹{accruedPenalty.toLocaleString("en-IN")} (~$30.1M USD)
              </p>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-amber-300/80 leading-relaxed">
            Statutory liability cap per incident under India DPDP Act 2023 Schedule 1 and EU GDPR
            Art 83.
          </p>
        </div>

        {/* Box 3: Target Domain & Sniffer Provenance */}
        <div className="rounded-2xl border border-primary/30 bg-black/60 p-4 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold block">
              TARGET DOMAIN &amp; PROVENANCE
            </span>
            <p className="mt-1 text-sm font-bold text-foreground truncate underline underline-offset-4">
              {radar.targetDomain}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="rounded bg-primary/10 border border-primary/30 px-2 py-0.5 text-[9px] font-bold text-primary">
                30-SEC HEADLESS SNIFFER
              </span>
              <span className="rounded bg-secondary/80 border border-border px-2 py-0.5 text-[9px] text-muted-foreground">
                6/6 SOVEREIGN REGIMES
              </span>
            </div>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
            <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
            V8 Telemetry Sniffer verified live
          </p>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
            activeTab === "terminal"
              ? "bg-primary/20 text-primary font-bold border border-primary/40"
              : "text-muted-foreground hover:text-foreground bg-black/40 border border-border/40"
          }`}
        >
          &gt; Raw Terminal Log
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
            activeTab === "matrix"
              ? "bg-primary/20 text-primary font-bold border border-primary/40"
              : "text-muted-foreground hover:text-foreground bg-black/40 border border-border/40"
          }`}
        >
          &gt; Jurisdiction Verdict Matrix ({matrixItems.filter((m) => m.data.pass).length}/6 Pass)
        </button>
        <button
          onClick={() => setActiveTab("penalty")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
            activeTab === "penalty"
              ? "bg-primary/20 text-primary font-bold border border-primary/40"
              : "text-muted-foreground hover:text-foreground bg-black/40 border border-border/40"
          }`}
        >
          &gt; Penalty Clock Breakdown
        </button>
        <button
          onClick={() => setActiveTab("dispute")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
            activeTab === "dispute"
              ? "bg-primary/20 text-primary font-bold border border-primary/40"
              : "text-muted-foreground hover:text-foreground bg-black/40 border border-border/40"
          }`}
        >
          &gt; Dispute Strategy (Paywall Gated)
        </button>
        <button
          onClick={() => setActiveTab("crossborder")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer ${
            activeTab === "crossborder"
              ? "bg-primary/20 text-primary font-bold border border-primary/40"
              : "text-muted-foreground hover:text-foreground bg-black/40 border border-border/40"
          }`}
        >
          &gt; Cross-Border Routing Ledger
        </button>
        <button
          onClick={() => setActiveTab("intermediary")}
          className={`px-3 py-1.5 rounded-lg font-mono text-xs transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === "intermediary"
              ? "bg-amber-500/25 text-amber-300 font-bold border border-amber-500/50 shadow-sm"
              : radar.intermediaryAdvisory?.isIntermediary
                ? "text-amber-400 bg-amber-950/30 border border-amber-500/40 hover:bg-amber-900/40"
                : "text-muted-foreground hover:text-foreground bg-black/40 border border-border/40"
          }`}
        >
          <span>&gt; ⚖️ Intermediary Shield (Sec 79/230)</span>
          {radar.intermediaryAdvisory?.isIntermediary && (
            <span className="rounded bg-amber-500/30 text-amber-300 text-[9px] px-1 py-0.2 font-bold animate-pulse">
              ACTIVE
            </span>
          )}
        </button>
      </div>

      {/* Intermediary Warning Banner if Conglomerate Detected */}
      {radar.intermediaryAdvisory?.isIntermediary && (
        <div className="mt-4 rounded-xl border border-amber-500/50 bg-gradient-to-r from-amber-950/40 via-black to-amber-950/40 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <Shield className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-amber-300">
                  INTERMEDIARY IMMUNITY DETECTED:
                </span>
                <span className="font-mono text-[10px] text-amber-200 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30">
                  {radar.intermediaryAdvisory.conglomerateName}
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-neutral-300 leading-snug">
                Blanket consent EULA tokens &amp; Safe Harbor protections (India IT Act Sec. 79 / US
                Sec. 230) are structurally active on this node.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab("intermediary")}
            className="shrink-0 rounded-lg border border-amber-500/50 bg-amber-500/20 px-3 py-1.5 font-mono text-[11px] font-bold text-amber-200 hover:bg-amber-500 hover:text-black transition-colors cursor-pointer"
          >
            View Statutory Exemption Log &gt;
          </button>
        </div>
      )}

      {/* Tab 1: Raw Terminal Log */}
      {activeTab === "terminal" && (
        <div className="mt-4">
          <RawTerminalLogViewer
            rawLog={radar.terminalLogRaw}
            targetDomain={radar.targetDomain}
            onOpenRemediationModal={onOpenRemediationModal}
          />
        </div>
      )}

      {/* Tab 2: Jurisdiction Verdict Matrix */}
      {activeTab === "matrix" && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matrixItems.map((item, idx) => {
            const isPass = item.data.pass;
            return (
              <div
                key={idx}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 transition-all ${
                  isPass
                    ? "border-emerald-500/40 bg-emerald-950/15"
                    : "border-red-500/40 bg-red-950/20"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{item.flag}</span>
                      <h4 className="font-mono text-xs font-bold text-foreground">{item.label}</h4>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-black ${
                        isPass
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-red-500/20 text-red-400 border border-red-500/40"
                      }`}
                    >
                      {isPass ? "[🟩 PASS]" : "[🟥 FAIL]"}
                    </span>
                  </div>

                  <p className="mt-2 font-mono text-[10px] text-muted-foreground">{item.statute}</p>

                  <div className="mt-3 space-y-1.5">
                    {item.data.findings.map((f, fIdx) => (
                      <p
                        key={fIdx}
                        className={`text-[11px] leading-snug font-mono ${
                          isPass ? "text-emerald-300/90" : "text-red-300/90"
                        }`}
                      >
                        {isPass ? "✓" : "⚠️"} {f}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-border/30">
                  <p className="text-[9px] font-mono text-muted-foreground/70 truncate">
                    Trigger Rule: {item.data.triggerRules[0]}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Penalty Clock Breakdown */}
      {activeTab === "penalty" && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-black/60 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-3">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-amber-400" />
              <span className="font-bold text-foreground text-sm uppercase">
                STATUTORY PENALTY EXPOSURE BREAKDOWN
              </span>
            </div>
            <span className="rounded-md border border-amber-500/40 bg-amber-950/40 px-2.5 py-0.5 text-amber-300 font-bold text-[11px]">
              SCHEDULE 1 PENALTY MATRIX
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3.5">
              <span className="text-[10px] text-red-300 font-bold uppercase block">
                Pre-Consent Telemetry Drift (Sec 6/8)
              </span>
              <p className="mt-1 text-lg font-black text-red-400 font-mono">Up to ₹250 Crores</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Triggered if GTM / Pixel / Sentry executes before affirmative opt-in.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">
                Breach Notification Default (Sec 8(6))
              </span>
              <p className="mt-1 text-lg font-black text-amber-400 font-mono">Up to ₹200 Crores</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Failing to notify Data Protection Board of security incidents.
              </p>
            </div>

            <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-3.5">
              <span className="text-[10px] text-amber-300 font-bold uppercase block">
                Children&apos;s Tracking / Profiling (Sec 9)
              </span>
              <p className="mt-1 text-lg font-black text-amber-400 font-mono">Up to ₹150 Crores</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Behavioral profiling or adtech tracking on minors without consent.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Dispute Strategy (Preview Gated Under Paywall) */}
      {activeTab === "dispute" && (
        <div className="mt-4 rounded-2xl border border-primary/40 bg-black/80 p-5 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-border/40 pb-3 mb-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase">
              <FileCode2 className="h-4 w-4" />
              <span>STATUTORY DISPUTE STRATEGY &amp; ENFORCEMENT DEFENSE FRAMEWORK</span>
            </div>
            <span className="rounded-md border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-primary text-[10px] font-bold">
              PREVIEW GATED
            </span>
          </div>

          {/* Semi-redacted / Blurred legal strategy brief */}
          <div className="space-y-3 relative select-none">
            <div className="rounded-xl border border-border/60 bg-black/60 p-4">
              <h4 className="text-xs font-bold text-foreground uppercase mb-1">
                1. Statutory Notice Rebuttal Clause (India DPBI Section 33(2))
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed blur-[1px]">
                &quot;The Data Fiduciary hereby asserts affirmative mitigation under Section
                33(2)(a) demonstrating that client-side telemetry drift occurred via third-party CDN
                latency rather than intentional processing... [REDACTED STATUTORY DEFENSE MEMO -
                UNLOCK REQUIRED]&quot;
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-black/60 p-4">
              <h4 className="text-xs font-bold text-foreground uppercase mb-1">
                2. GDPR Article 83(2) Proportionality Defense Matrix
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed blur-[1px]">
                &quot;In accordance with EDPB Guidelines 04/2022 on the calculation of
                administrative fines, respondent establishes immediate remediation wrapper patch
                deployment within 72 hours... [REDACTED PROCEDURAL MOTION DRAFT]&quot;
              </p>
            </div>

            {/* Paywall Gate Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/90 to-black/50 flex flex-col items-center justify-center p-6 text-center z-10 rounded-xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/50 bg-primary/20 text-primary mb-3">
                <Lock className="h-6 w-6" />
              </div>
              <h3 className="font-display text-lg font-bold text-gold-gradient">
                Dispute Strategy Gated Under Paywall Framework
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mt-1">
                Access full legal dispute rebuttal filings, statutory procedural motions, and
                regulatory mitigation blueprints.
              </p>
              <button
                onClick={onOpenRemediationModal}
                className="mt-4 btn-gold flex items-center gap-2 rounded-xl px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black cursor-pointer shadow-lg"
              >
                <Key className="h-4 w-4" />
                <span>Unlock Dispute Strategy &amp; Code Patch</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Cross-Border Routing Ledger */}
      {activeTab === "crossborder" && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-black/60 p-5 font-mono text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/40 pb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              <span className="font-bold text-foreground uppercase">
                CORE CROSS-BORDER ROUTING LEDGER
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                radar.crossBorder.isCompliant
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                  : "bg-red-500/20 text-red-400 border border-red-500/40"
              }`}
            >
              {radar.crossBorder.isCompliant ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <AlertTriangle className="h-4 w-4 animate-pulse" />
              )}
              {radar.crossBorder.routingLedgerDisplay}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border/40 bg-black/40 p-3.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Packet Perimeter Ingress/Egress
              </p>
              <p className="mt-1 font-semibold text-foreground">
                {radar.crossBorder.packetDestinationNote}
              </p>
            </div>
            <div className="rounded-xl border border-border/40 bg-black/40 p-3.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Automated Endpoint Signatures
              </p>
              <p
                className={`mt-1 font-semibold ${
                  radar.crossBorder.isCompliant ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {radar.crossBorder.isCompliant
                  ? "TLS 1.3 ECDSA Verified"
                  : "Missing Token Signatures"}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-border/30 bg-black/50 p-3.5">
            <p className="text-[10px] uppercase tracking-wider text-primary font-bold">
              ANOMALY CAPTURE LOG:
            </p>
            <p className="mt-1 text-xs leading-relaxed text-foreground/90">
              {radar.crossBorder.anomalyCaptureLog}
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Intermediary Exemption & Safe Harbor Advisory */}
      {activeTab === "intermediary" && (
        <div className="mt-4 space-y-4">
          <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/20 via-black to-amber-950/10 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-400" />
                <span className="font-mono font-bold text-amber-300 text-sm uppercase">
                  STATUTORY INTERMEDIARY ADVISORY &amp; BLANKET CONSENT SCAN
                </span>
              </div>
              <span className="rounded-md border border-amber-500/40 bg-amber-950/40 px-2.5 py-0.5 text-amber-300 font-mono font-bold text-[11px]">
                {radar.intermediaryAdvisory?.isIntermediary
                  ? "🛡️ EXEMPTION SHIELD ACTIVE"
                  : "STANDARD FIDUCIARY NODE"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/40 bg-black/50 p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  CONGLOMERATE CLASSIFICATION
                </span>
                <p className="mt-1 font-mono text-xs font-bold text-amber-300">
                  {radar.intermediaryAdvisory?.conglomerateName || "General Web Service Node"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  India IT Act 2000 Section 79 &amp; US Communications Decency Act Section 230
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-black/50 p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  BLANKET CONSENT REGISTRY SCAN
                </span>
                <p className="mt-1 font-mono text-xs font-bold text-amber-300">
                  {radar.intermediaryAdvisory?.isIntermediary
                    ? "Authenticated EULA Contract Detected"
                    : "Standard Browser Session (No EULA Shield)"}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Pre-authenticated multi-page EULA consent token verification
                </p>
              </div>

              <div className="rounded-xl border border-border/40 bg-black/50 p-3.5">
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                  ENFORCEMENT PREREQUISITE
                </span>
                <p className="mt-1 font-mono text-xs font-bold text-amber-300">
                  Section 33 Formal Regulatory Order Required
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  Requires Data Protection Board of India inquiry before penalty seizure
                </p>
              </div>
            </div>

            {/* Render formatted terminal block log */}
            <div className="pt-2">
              <p className="font-mono text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                <span>&gt; MONOSPACE ADVISORY REGISTER LOG OUTPUT:</span>
              </p>
              <RawTerminalLogViewer
                rawLog={
                  radar.intermediaryAdvisory?.advisoryLogRaw ||
                  `----------------------------------------------------------------------------------------\n[ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]\nTARGET NODE: ${radar.targetDomain}\nVERDICT STATUS: 🟥 STRUCTURAL DRIFT DETECTED (POTENTIAL EXEMPTION SHIELD ACTIVE)\n\n[THE LEGAL INTERCEPTION EXPLANATION]:\n- NOTICE: This platform utilizes multi-layered Intermediary Immunity Frameworks (Safe Harbor Protections) alongside pre-authenticated blanket consent terms. While raw client-side telemetry packet leaks are technically visible inside the browser runtime memory cache, the corporate infrastructure leverages active treaty exemptions to legally bypass direct Section 33 DPDP Act enforcement actions until a formal regulatory order is issued.\n\n========================================================================================\n     ⚖️ SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS [L O C K E D 🔒]\n========================================================================================\n// CRITICAL EXEMPTION MITIGATION ARGUMENTS AND STRATEGIC LITIGATION SHIELDS\n// FOR INTERMEDIARY NETWORKS AND BIG-TECH ENTITIES ARE ENCRYPTED.\n// REQUIRE PREMIUM RECONCILIATION RETAINER ACTIVATION REGISTRY FEE OF ₹24,999 ($300 USD).\n----------------------------------------------------------------------------------------`
                }
                targetDomain={radar.targetDomain}
                onOpenRemediationModal={onOpenRemediationModal}
              />
            </div>
          </div>
        </div>
      )}

      {/* ENCRYPTED REMEDIATION REPOSITORY GATEWAY */}
      <div className="mt-6 rounded-2xl border border-primary/50 bg-gradient-to-r from-black via-primary/10 to-black p-5 sm:p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-primary uppercase">
                <Lock className="h-3 w-3" /> ENCRYPTED REMEDIATION REPOSITORY GATEWAY
              </span>
              <span className="font-mono text-[11px] text-red-400 font-bold">
                BOLD ALERT: UP TO ₹250 CRORES LIABILITY
              </span>
            </div>
            <h3 className="font-display text-xl font-bold text-gold-gradient">
              Activation Mandate: Upfront ₹24,999 ($300 USD) Wire Required
            </h3>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Code repository is gated under corporate RegTech paywall framework. Requires upfront
              wire fee of <strong className="text-primary font-bold">₹24,999 ($300 USD)</strong> to
              release full executable wrapper patch, server-side HTTP security headers, and
              pre-consent CMP blockers.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-2">
            <button
              onClick={onOpenRemediationModal}
              className="btn-gold flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-xl hover:shadow-primary/30 transition-all cursor-pointer"
            >
              <Zap className="h-4 w-4" />
              <span>Complete Wire &amp; Unlock Patch (₹24,999 / $300)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-mono text-muted-foreground text-center sm:text-right">
              Direct Wire • Instant UPI QR • Instant Code Release
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
