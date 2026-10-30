import { useEffect, useState, useRef } from "react";
import { Activity, Sparkles, CheckCircle2, Clock, ShieldCheck, Cpu } from "lucide-react";

export function ScanLoader({ progress, url }: { progress: number; url: string }) {
  const [displayedProgress, setDisplayedProgress] = useState(progress);
  const displayedProgressRef = useRef(progress);
  const [secondsRemaining, setSecondsRemaining] = useState(30.0);
  const startTimeRef = useRef<number>(Date.now());

  // Precise 30-second SLA countdown timer
  useEffect(() => {
    startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      const elapsedMs = Date.now() - startTimeRef.current;
      const remainingSec = Math.max(0, 30.0 - elapsedMs / 1000);
      setSecondsRemaining(remainingSec);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Smooth lerp progress animation
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

  const steps = [
    { threshold: 25, label: "Checking headers" },
    { threshold: 50, label: "Detecting trackers" },
    { threshold: 75, label: "Mapping cookies" },
    { threshold: 100, label: "Statutory matrix" },
  ];

  const currentStepIndex = steps.findIndex((s) => p <= s.threshold);
  const activeStepIdx = currentStepIndex === -1 ? steps.length - 1 : currentStepIndex;

  const getStatusText = (pct: number) => {
    if (pct < 25) return "SNIFFING";
    if (pct < 50) return "DETECTING";
    if (pct < 75) return "MAPPING";
    if (pct < 95) return "ANALYZING";
    return "VERIFIED";
  };

  const getStepDescription = (pct: number) => {
    if (pct < 25) return "Checking HTTPS, TLS 1.3 & Server Security Headers…";
    if (pct < 50) return "Inspecting Third-Party Telemetry & Tracking Pixels…";
    if (pct < 75) return "Mapping Pre-Consent Cookies & Local Storage Writes…";
    if (pct < 95) return "Auditing 15 Sovereign Jurisdictions (DPDP, GDPR, CCPA)…";
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
    "Verifying UK DUAA 2025 & US CPRA opt-out requirements…",
    "Synthesizing 124 real-time statutory evidence signals…",
  ];

  const activeLogIndex = Math.min(
    liveProbeLogs.length - 1,
    Math.floor((p / 100) * liveProbeLogs.length),
  );

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center gap-6 py-8 px-4 animate-rise font-mono">
      {/* 30-Second Fast SLA Guarantee Banner */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border border-primary/40 bg-gradient-to-r from-primary/10 via-black/80 to-primary/10 shadow-lg shadow-primary/10">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/20 text-primary border border-primary/40">
            <Clock className="h-4 w-4 text-primary animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <span>Deterministic 30-Second SLA</span>
              <span className="rounded bg-primary/20 text-primary px-1.5 py-0.2 text-[9px] border border-primary/30">
                Guaranteed
              </span>
            </span>
            <p className="text-[10px] text-muted-foreground">
              Results delivered in under 30 seconds without false accusations
            </p>
          </div>
        </div>

        {/* Live Timer Countdown Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-primary/50 bg-black/80 px-3.5 py-1.5 shadow-inner">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
            SLA Timer:
          </span>
          <span className="font-mono text-base font-extrabold text-gold-gradient tracking-tight">
            {secondsRemaining > 0
              ? `00:${secondsRemaining.toFixed(1).padStart(4, "0")}`
              : "00:00.0"}
          </span>
          <span className="text-[10px] text-primary/80">
            ({Math.ceil(secondsRemaining)}s remaining)
          </span>
        </div>
      </div>

      {/* Top Steps Pills Bar */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {steps.map((step, idx) => {
          const isActive = idx === activeStepIdx;
          const isCompleted = idx < activeStepIdx || p >= 100;
          return (
            <div
              key={step.label}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-300 text-xs ${
                isActive
                  ? "bg-primary/15 border-primary shadow-[0_0_20px_rgba(212,175,55,0.3)] text-foreground scale-[1.02]"
                  : isCompleted
                    ? "bg-secondary/40 border-primary/30 text-primary"
                    : "bg-secondary/20 border-border/40 text-muted-foreground opacity-60"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  isActive || isCompleted
                    ? "bg-primary text-black shadow-md shadow-primary/30"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-3 h-3 text-black" /> : idx + 1}
              </div>
              <span className="truncate font-semibold">{step.label}</span>
            </div>
          );
        })}
      </div>

      {/* Main Radar Scanner Graphic Container */}
      <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-3 select-none">
        {/* Outer rotating dashed ring with degree ticks */}
        <div className="absolute inset-0 rounded-full border border-dashed border-primary/35 animate-spin-slow pointer-events-none" />

        {/* Concentric distance radar rings */}
        <div className="absolute inset-3 rounded-full border border-primary/20 pointer-events-none" />
        <div className="absolute inset-10 rounded-full border border-primary/15 pointer-events-none" />
        <div className="absolute inset-20 rounded-full border border-primary/10 pointer-events-none" />

        {/* Sonar Expanding Waves */}
        <div className="absolute inset-8 rounded-full border border-primary/20 animate-ping opacity-25 pointer-events-none" />

        {/* Cardinal crosshair axes */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-primary/20" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-[1px] bg-primary/20" />
        </div>

        {/* Radar Cardinal Marks (0°, 90°, 180°, 270°) */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-primary/50 font-bold pointer-events-none">
          0° N
        </div>
        <div className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-primary/50 font-bold pointer-events-none">
          90° E
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-primary/50 font-bold pointer-events-none">
          180° S
        </div>
        <div className="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-primary/50 font-bold pointer-events-none">
          270° W
        </div>

        {/* Target Radar Signal Blips (Simulating detected endpoints & cookies) */}
        <div
          className="absolute top-1/4 right-1/4 w-2 h-2 rounded-full bg-primary animate-pulse pointer-events-none shadow-[0_0_8px_#d4af37]"
          title="TLS Node"
        />
        <div
          className="absolute bottom-1/3 left-1/4 w-2 h-2 rounded-full bg-emerald-400 animate-ping pointer-events-none opacity-60"
          title="HSTS Header"
        />
        <div
          className="absolute top-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse pointer-events-none shadow-[0_0_6px_#f59e0b]"
          title="Cookie Signal"
        />
        <div
          className="absolute bottom-1/4 right-1/3 w-1.5 h-1.5 rounded-full bg-primary animate-pulse pointer-events-none shadow-[0_0_6px_#d4af37]"
          title="CMP Gating"
        />

        {/* Rotating Radar Sweep Beam with Golden Phosphor Trail */}
        <div className="absolute inset-4 rounded-full overflow-hidden pointer-events-none animate-radar-sweep">
          <div
            className="absolute inset-0"
            style={{
              background:
                "conic-gradient(from 0deg at 50% 50%, rgba(212, 175, 55, 0.45) 0deg, rgba(212, 175, 55, 0.12) 45deg, transparent 75deg, transparent 360deg)",
            }}
          />
        </div>

        {/* Progress Arc / Ring SVG */}
        <div className="absolute inset-2 pointer-events-none">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-primary/20"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              fill="none"
              stroke="url(#scanGoldGradient)"
              strokeWidth="4"
              strokeDasharray="276"
              strokeDashoffset={276 - (276 * p) / 100}
              strokeLinecap="round"
              className="transition-all duration-150 ease-out"
            />
            <defs>
              <linearGradient id="scanGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8c7322" />
                <stop offset="50%" stopColor="#d4af37" />
                <stop offset="100%" stopColor="#fef08a" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Glowing Head Dot Tracking Progress on Perimeter */}
        <div
          className="absolute inset-6 pointer-events-none transition-all duration-150 ease-out"
          style={{
            transform: `rotate(${(p / 100) * 360}deg)`,
          }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_14px_#d4af37,0_0_4px_#fff]" />
        </div>

        {/* Center Hub Display */}
        <div className="relative z-10 w-42 h-42 sm:w-46 sm:h-46 rounded-full bg-gradient-to-b from-[#1a1714] to-[#0c0a09] border border-primary/50 shadow-[0_0_35px_rgba(212,175,55,0.25)] flex flex-col items-center justify-center p-4 text-center">
          <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mb-1 animate-pulse-glow shadow-sm shadow-primary/20">
            <Activity className="w-4.5 h-4.5 text-primary" />
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-black text-gold-gradient tracking-tight">
            {p}%
          </div>
          <div className="text-[10px] sm:text-[11px] font-mono font-extrabold tracking-widest text-primary uppercase mt-0.5">
            {getStatusText(p)}
          </div>
          <div className="text-[9px] text-muted-foreground uppercase tracking-wider mt-0.5 font-bold">
            {secondsRemaining > 0 ? `${Math.ceil(secondsRemaining)}s remaining` : "Completing…"}
          </div>
        </div>
      </div>

      {/* Target & Dynamic Status Telemetry Terminal Box */}
      <div className="w-full max-w-xl flex flex-col items-center gap-2.5 text-center bg-black/80 border border-primary/30 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl">
        <div className="flex items-center justify-between w-full border-b border-white/10 pb-2">
          <div className="flex items-center gap-2 text-xs text-primary font-bold">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="truncate max-w-[280px] sm:max-w-[380px]">
              Target: {url || "Target Website"}
            </span>
          </div>
          <span className="rounded bg-primary/15 border border-primary/30 px-2 py-0.5 text-[10px] text-primary font-bold uppercase tracking-wider">
            Live Inspection
          </span>
        </div>

        {/* Current Inspection Step Description */}
        <div className="text-sm font-semibold text-foreground pt-1">{getStepDescription(p)}</div>

        {/* Live Terminal Signal Ticker */}
        <div className="w-full rounded-lg bg-black/90 border border-border/80 px-3 py-2 text-left text-[11px] text-emerald-400 flex items-center gap-2 overflow-hidden shadow-inner">
          <Cpu className="h-3.5 w-3.5 text-emerald-400 shrink-0 animate-pulse" />
          <span className="truncate text-muted-foreground">PROBE // </span>
          <span className="truncate text-emerald-300 font-medium">
            {liveProbeLogs[activeLogIndex]}
          </span>
        </div>

        {/* High Precision Progress Bar */}
        <div className="w-full bg-secondary/80 h-2 rounded-full overflow-hidden mt-1 border border-primary/20">
          <div
            className="h-full bg-gradient-to-r from-primary/60 via-primary to-yellow-200 transition-all duration-150 ease-out shadow-[0_0_12px_rgba(212,175,55,0.5)]"
            style={{ width: `${p}%` }}
          />
        </div>

        <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground pt-0.5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>{checkCount}/124 Evidence Checks</span>
          </span>
          <span className="text-primary font-bold font-mono">{p}% Complete</span>
        </div>
      </div>
    </div>
  );
}
