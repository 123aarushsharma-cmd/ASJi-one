import { useEffect, useState, useRef } from "react";
import { motion } from "motion/react";
import { Activity, CheckCircle2, Clock, Globe, Lock, ShieldCheck, Terminal } from "lucide-react";

const VERIFICATION_STAGES = [
  { id: "dns", threshold: 22, label: "DNS & TLS Handshake", detail: "SPF, DMARC & X.509 Chain" },
  {
    id: "headers",
    threshold: 48,
    label: "HTTP Security Headers",
    detail: "HSTS, CSP & Referrer Policy",
  },
  {
    id: "trackers",
    threshold: 74,
    label: "DOM Trackers & Cookies",
    detail: "GA4, Meta & Consent Gate",
  },
  {
    id: "statutes",
    threshold: 94,
    label: "15 Sovereign Statutes",
    detail: "DPDP, GDPR, DUAA & CPRA",
  },
] as const;

export function ScanLoader({ progress, url }: { progress: number; url: string }) {
  const [displayedProgress, setDisplayedProgress] = useState(progress);
  const displayedProgressRef = useRef(progress);
  const [secondsRemaining, setSecondsRemaining] = useState(30.0);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const remainingSec = Math.max(0, 30.0 - elapsedMs / 1000);
      setSecondsRemaining(remainingSec);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let rafId: number;
    const lerp = () => {
      const diff = progress - displayedProgressRef.current;
      if (Math.abs(diff) > 0.05) {
        displayedProgressRef.current += diff * 0.16;
        setDisplayedProgress(displayedProgressRef.current);
        rafId = requestAnimationFrame(lerp);
      } else {
        displayedProgressRef.current = progress;
        setDisplayedProgress(progress);
      }
    };

    rafId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(rafId);
  }, [progress]);

  const p = Math.round(displayedProgress);
  const checkCount = Math.min(124, Math.max(1, Math.round((p / 100) * 124)));
  const cleanHost = (url || "target-domain.com").replace(/^https?:\/\//i, "").replace(/\/.*$/, "");

  const getStatusText = (pct: number) => {
    if (pct < 25) return "DNS / TLS";
    if (pct < 50) return "HEADERS";
    if (pct < 75) return "TRACKERS";
    if (pct < 95) return "STATUTES";
    return "VERIFIED";
  };

  const getStepDescription = (pct: number) => {
    if (pct < 25) return "Checking HTTPS, TLS 1.3 & Server Security Headers…";
    if (pct < 50) return "Inspecting Third-Party Telemetry & Tracking Pixels…";
    if (pct < 75) return "Mapping Pre-Consent Cookies & Local Storage Writes…";
    if (pct < 95) return "Auditing 15 Sovereign Jurisdictions (DPDP, GDPR, CPRA)…";
    return "Finalizing 124 Evidence-Based Statutory Checks…";
  };

  const liveProbeLogs = [
    "Negotiating TLS 1.3 handshake & verifying HSTS directives…",
    "Inspecting Content-Security-Policy & Referrer-Policy headers…",
    "Testing for missing HttpOnly, Secure & SameSite cookie flags…",
    "Scanning DOM for unconsented analytics & tracking scripts…",
    "Simulating user consent opt-out & zero-leak CMP compliance…",
    "Cross-referencing India DPDP Act 2023 Sec 6 consent standards…",
    "Cross-referencing EU GDPR Art 44 international transfer rules…",
    "Verifying UK DUAA 2026 & US CPRA opt-out requirements…",
    "Synthesizing 124 real-time statutory evidence signals…",
  ];

  const activeLogIndex = Math.min(
    liveProbeLogs.length - 1,
    Math.floor((p / 100) * liveProbeLogs.length),
  );

  const ringRadius = 44;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (ringCircumference * Math.min(100, p)) / 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center gap-6 py-8 px-4 font-mono"
    >
      {/* Audit-Grade 30-Second SLA Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl border border-[#262932] bg-[#0D0E11]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#15171C] text-[#C9A227] border border-[#262932]">
            <Clock className="h-4 w-4 text-[#C9A227]" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-[#FAF8F5] flex items-center gap-2 uppercase tracking-wider">
              <span>Audit-Grade 30-Second SLA</span>
              <span className="rounded border border-[#C9A227]/40 bg-[#C9A227]/10 text-[#C9A227] px-1.5 py-0.5 text-[10px]">
                Live Telemetry
              </span>
            </span>
            <p className="text-[11px] text-zinc-400">
              Statute-locked &amp; verifiable inspection delivered in under 30 seconds
            </p>
          </div>
        </div>

        {/* Live Timer Countdown */}
        <div className="flex items-center gap-2 rounded-lg border border-[#262932] bg-[#15171C] px-3.5 py-1.5 tabular-nums">
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest">SLA Timer:</span>
          <span className="font-mono text-base font-bold text-[#C9A227] tracking-tight">
            {secondsRemaining > 0
              ? `00:${secondsRemaining.toFixed(1).padStart(4, "0")}`
              : "00:00.0"}
          </span>
        </div>
      </div>

      {/* Cinematic 2-Column Stage: Laser-Scanned Domain Mini-Preview + SVG Progress Ring & Staggered Checks */}
      <div className="w-full grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left: Live Mini-Preview Card of Target Domain with Gold Laser Scan Line */}
        <div className="lg:col-span-7 relative rounded-2xl border border-[#C9A227]/40 bg-[#0D0E11] overflow-hidden shadow-2xl flex flex-col justify-between">
          {/* Simulated Browser Header Chrome */}
          <div className="flex items-center justify-between gap-2 border-b border-[#262932] bg-[#15171C] px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#262932]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#262932]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#C9A227]/70" />
            </div>
            <div className="flex items-center gap-1.5 rounded-md border border-[#262932] bg-[#0D0E11] px-3 py-1 text-[11px] text-zinc-300 max-w-[260px] sm:max-w-xs truncate">
              <Lock className="h-3 w-3 text-[#10B981] shrink-0" />
              <span className="truncate">https://{cleanHost}</span>
            </div>
            <span className="text-[10px] text-[#C9A227] uppercase tracking-wider shrink-0">
              LIVE DOM
            </span>
          </div>

          {/* Architectural Target Wireframe Viewport + Vertical Gold Laser Scan Line */}
          <div className="relative flex-1 p-5 min-h-[210px] flex flex-col justify-between overflow-hidden">
            {/* Blueprint Grid Overlay */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #C9A227 1px, transparent 1px), linear-gradient(to bottom, #C9A227 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Animated Vertical Gold Laser Scan Sweep */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 overflow-hidden"
            >
              <div className="animate-laser-scan w-full h-full">
                <div
                  className="w-full h-[2px] bg-[#DFB842]"
                  style={{
                    boxShadow:
                      "0 0 14px 2px rgba(201, 162, 39, 0.75), 0 0 32px 6px rgba(201, 162, 39, 0.28)",
                  }}
                />
                <div
                  className="w-full h-14 -mt-14 opacity-35"
                  style={{
                    background: "linear-gradient(to top, rgba(201, 162, 39, 0.25), transparent)",
                  }}
                />
              </div>
            </div>

            {/* Domain Architectural Skeleton Preview */}
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs text-[#FAF8F5] font-bold">
                  <Globe className="h-4 w-4 text-[#C9A227]" />
                  <span className="truncate">{cleanHost}</span>
                </div>
                <span className="text-[10px] text-zinc-400 tabular-nums">
                  {checkCount}/124 Probes
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg border border-[#262932] bg-[#15171C]/90 p-2.5 space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase block">Transport</span>
                  <span className="text-[11px] font-bold text-[#FAF8F5] block">TLS 1.3 / HSTS</span>
                </div>
                <div className="rounded-lg border border-[#262932] bg-[#15171C]/90 p-2.5 space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase block">Telemetry</span>
                  <span className="text-[11px] font-bold text-[#C9A227] block">Script Audit</span>
                </div>
                <div className="rounded-lg border border-[#262932] bg-[#15171C]/90 p-2.5 space-y-1">
                  <span className="text-[9px] text-zinc-500 uppercase block">Consent</span>
                  <span className="text-[11px] font-bold text-[#FAF8F5] block">CMP Barrier</span>
                </div>
              </div>
            </div>

            {/* Terminal Probe Stream */}
            <div className="relative z-10 mt-4 rounded-lg bg-[#15171C] border border-[#262932] px-3 py-2 text-left text-[11px] text-zinc-300 flex items-center gap-2 overflow-hidden">
              <Terminal className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
              <span className="truncate text-zinc-500">PROBE:</span>
              <span className="truncate text-zinc-200 font-medium">
                {liveProbeLogs[activeLogIndex]}
              </span>
            </div>
          </div>

          {/* Linear Progress Footer */}
          <div className="border-t border-[#262932] bg-[#15171C] px-4 py-2.5 space-y-1.5">
            <div className="text-xs font-sans font-semibold text-[#FAF8F5] truncate">
              {getStepDescription(p)}
            </div>
            <div className="w-full bg-[#0D0E11] h-1.5 rounded-full overflow-hidden border border-[#262932]">
              <div
                className="h-full bg-[#C9A227] transition-all duration-200 ease-out"
                style={{ width: `${p}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right: SVG Progress Ring + Staggered Checkmarks (200ms stagger) */}
        <div className="lg:col-span-5 rounded-2xl border border-[#262932] bg-[#15171C] p-5 flex flex-col items-center justify-between gap-4">
          {/* Animated SVG Progress Ring */}
          <div className="relative w-40 h-40 flex items-center justify-center select-none">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r={ringRadius}
                fill="none"
                stroke="#262932"
                strokeWidth="3.5"
              />
              <circle
                cx="50"
                cy="50"
                r={ringRadius}
                fill="none"
                stroke="#C9A227"
                strokeWidth="4"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                strokeLinecap="round"
                className="transition-all duration-200 ease-out"
              />
            </svg>

            <div className="absolute inset-4 rounded-full bg-[#0D0E11] border border-[#262932] flex flex-col items-center justify-center text-center">
              <Activity className="w-4 h-4 text-[#C9A227] mb-1" />
              <div className="text-3xl font-display font-bold text-[#FAF8F5] tracking-tight tabular-nums">
                {p}%
              </div>
              <div className="text-[9.5px] font-mono font-bold tracking-widest text-[#C9A227] uppercase mt-0.5">
                {getStatusText(p)}
              </div>
            </div>
          </div>

          {/* 4 Staggered Verification Checkmarks (200ms stagger) */}
          <div className="w-full space-y-2">
            {VERIFICATION_STAGES.map((stage, idx) => {
              const isVerified = p >= stage.threshold;
              const isActive =
                !isVerified && (idx === 0 || p >= VERIFICATION_STAGES[idx - 1].threshold);
              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.28,
                    delay: idx * 0.2,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={`flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs transition-colors ${
                    isVerified
                      ? "border-[#10B981]/40 bg-[#0D0E11] text-[#FAF8F5]"
                      : isActive
                        ? "border-[#C9A227]/60 bg-[#0D0E11] text-[#FAF8F5]"
                        : "border-[#262932] bg-[#0D0E11]/60 text-zinc-500"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{stage.label}</div>
                    <div className="text-[10px] text-zinc-400 truncate">{stage.detail}</div>
                  </div>
                  <div className="shrink-0">
                    {isVerified ? (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 420,
                          damping: 22,
                          delay: idx * 0.05,
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#10B981]" />
                      </motion.div>
                    ) : (
                      <ShieldCheck
                        className={`h-4 w-4 ${isActive ? "text-[#C9A227]" : "text-zinc-600"}`}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
