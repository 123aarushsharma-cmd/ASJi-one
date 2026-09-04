import { useEffect, useState, useRef } from "react";
import { Terminal, Shield, Cpu, Wifi, Activity, Radio, AlertCircle } from "lucide-react";

const SNIFFER_LOGS = [
  {
    time: "00:01.42",
    tag: "SOCKET_INIT",
    text: "Opening headless socket connection to target host...",
  },
  {
    time: "00:03.85",
    tag: "TLS_INSPECT",
    text: "Handshaking TLS 1.3 certificate chain & HSTS preload headers...",
  },
  {
    time: "00:07.12",
    tag: "DOM_CAPTURE",
    text: "Ingesting client runtime DOM tree, script tags & external CDNs...",
  },
  {
    time: "00:11.40",
    tag: "TELEMETRY_HOOK",
    text: "Hooking window.dataLayer, Meta Pixel (fbq), and analytics beacons...",
  },
  {
    time: "00:15.90",
    tag: "COOKIE_SNIFF",
    text: "Intercepting pre-consent Set-Cookie storage frames & tracking tokens...",
  },
  {
    time: "00:20.30",
    tag: "CROSS_BORDER",
    text: "Analyzing DNS routing perimeter & US-East egress packet channels...",
  },
  {
    time: "00:24.70",
    tag: "SOVEREIGN_RULES",
    text: "Evaluating India DPDP Act 2023 Sec 6/8 & EU GDPR Art 7/32 mandates...",
  },
  {
    time: "00:28.90",
    tag: "SYNTHESIZING",
    text: "Compiling binary verdict matrix & statutory fine liability clock...",
  },
];

export function ScanLoader({ progress, url }: { progress: number; url: string }) {
  const [displayedProgress, setDisplayedProgress] = useState(progress);
  const [secondsRemaining, setSecondsRemaining] = useState(30.0);
  const [activeLogIndex, setActiveLogIndex] = useState(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, 30.0 - elapsed);
      setSecondsRemaining(remaining);

      // Compute step based on elapsed / progress
      const currentStep = Math.min(
        SNIFFER_LOGS.length - 1,
        Math.floor((elapsed / 30) * SNIFFER_LOGS.length),
      );
      setActiveLogIndex(currentStep);
    }, 100);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let rafId: number;
    const lerp = () => {
      setDisplayedProgress((prev) => {
        const diff = progress - prev;
        if (Math.abs(diff) < 0.05) {
          return progress;
        }
        return prev + diff * 0.15;
      });
      rafId = requestAnimationFrame(lerp);
    };

    rafId = requestAnimationFrame(lerp);
    return () => cancelAnimationFrame(rafId);
  }, [progress]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedProgress / 100) * circumference;

  const tipAngleRad = ((displayedProgress / 100) * 360 - 90) * (Math.PI / 180);
  const tipX = 100 + radius * Math.cos(tipAngleRad);
  const tipY = 100 + radius * Math.sin(tipAngleRad);

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-6 py-6 animate-rise transform-gpu">
      {/* Top Headless Sniffer Header */}
      <div className="w-full rounded-2xl border border-primary/40 bg-black/80 p-4 sm:p-5 shadow-2xl backdrop-blur-xl font-mono text-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-bold text-gold-gradient tracking-wider uppercase text-sm flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              30-SEC HEADLESS BROWSER TELEMETRY SNIFFER
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-bold text-emerald-400">
              <Radio className="h-3 w-3 animate-pulse" /> LIVE SOCKET SNIFFING
            </span>
            <span className="text-muted-foreground text-[11px]">
              ENGINE: <strong className="text-foreground">CHROMIUM V8 HOOK</strong>
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-primary font-semibold">TARGET DOMAIN:</span>
            <span className="font-bold text-foreground underline underline-offset-2">{url}</span>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <span className="text-amber-400 font-bold">SNIFFER COUNTDOWN:</span>
            <span className="text-foreground font-extrabold bg-primary/10 border border-primary/30 px-2 py-0.5 rounded text-xs">
              {secondsRemaining.toFixed(1)}s
            </span>
          </div>
        </div>
      </div>

      {/* Center Radar Scanner + Dial */}
      <div className="relative flex h-60 w-60 items-center justify-center sm:h-72 sm:w-72 transform-gpu">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute inset-2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow transform-gpu" />

        {/* Outer Spinning Dashed Orbit */}
        <svg
          className="absolute inset-0 animate-spin-slow transform-gpu opacity-40"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="94"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
            strokeDasharray="8 8"
          />
        </svg>

        {/* Circular Progress Indicator */}
        <svg
          className="absolute inset-0 h-full w-full -rotate-90 transform-gpu"
          viewBox="0 0 200 200"
        >
          <defs>
            <linearGradient id="scanGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF2B2" />
              <stop offset="35%" stopColor="#FFD700" />
              <stop offset="70%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#996515" />
            </linearGradient>

            <radialGradient id="tipGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF2B2" stopOpacity="1" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--gold-deep)"
            strokeOpacity="0.2"
            strokeWidth="6"
          />

          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="url(#scanGoldGrad)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-[stroke-dashoffset] duration-75 ease-out"
          />

          {displayedProgress > 1 && (
            <g transform="rotate(90 100 100)">
              <circle cx={tipX} cy={tipY} r="6" fill="url(#tipGlow)" opacity="0.9" />
              <circle cx={tipX} cy={tipY} r="3" fill="#FFF2B2" stroke="#D4AF37" strokeWidth="1" />
            </g>
          )}
        </svg>

        {/* Center Counter */}
        <div className="relative z-10 flex flex-col items-center justify-center h-28 w-28 sm:h-32 sm:w-32 rounded-full surface-panel border border-primary/40 shadow-gold transform-gpu">
          <Activity className="h-6 w-6 text-primary animate-pulse transform-gpu mb-1" />
          <span className="font-mono text-2xl font-extrabold text-gold-gradient tracking-tight leading-none">
            {Math.round(displayedProgress)}%
          </span>
          <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-widest mt-1">
            SNIFFING
          </span>
        </div>
      </div>

      {/* Terminal Monospace Packet Sniffer Stream Box */}
      <div className="w-full rounded-2xl border border-border/80 bg-black/90 p-4 font-mono text-xs shadow-inner">
        <div className="flex items-center justify-between border-b border-border/40 pb-2 mb-3">
          <div className="flex items-center gap-2 text-primary font-bold text-[11px]">
            <Terminal className="h-3.5 w-3.5" />
            <span>LIVE TELEMETRY SNIFFER LOGS (30s REAL-TIME STREAM)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>STREAMING PACKETS</span>
          </div>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {SNIFFER_LOGS.slice(0, activeLogIndex + 1).map((log, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 text-[11px] leading-relaxed transition-all ${
                idx === activeLogIndex
                  ? "text-emerald-400 font-bold bg-emerald-950/20 px-2 py-1 rounded"
                  : "text-muted-foreground/80"
              }`}
            >
              <span className="text-primary/70 shrink-0 select-none">[{log.time}]</span>
              <span className="rounded bg-black border border-border/60 px-1 py-0.2 text-[9px] text-amber-300/90 font-mono shrink-0">
                {log.tag}
              </span>
              <span className="break-all">{log.text}</span>
            </div>
          ))}
        </div>

        {/* Linear Gold Bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-secondary/80 p-0.5 border border-primary/20">
          <div
            className="h-full rounded-full transition-all duration-75 ease-out"
            style={{
              width: `${displayedProgress}%`,
              backgroundImage: "var(--gradient-gold)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
