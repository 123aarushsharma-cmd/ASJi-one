import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function ScoreWheel({ score }: { score: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setShown(score);
      return;
    }

    let raf = 0;
    const start = performance.now();
    // Keep animation strictly under 600ms
    const duration = 480;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Fast exponential / cubic ease out for crisp responsive feel
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(score * eased);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [score]);

  const r = 84;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - shown / 100);

  const label = score >= 80 ? "Strong" : score >= 60 ? "Moderate" : "At Risk";
  const glowColor =
    score >= 80
      ? "rgba(16, 185, 129, 0.25)"
      : score >= 60
        ? "rgba(212, 175, 55, 0.25)"
        : "rgba(244, 63, 94, 0.25)";

  const tierBadgeColor =
    score >= 80
      ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
      : score >= 60
        ? "border-amber-500/40 text-amber-400 bg-amber-500/10"
        : "border-rose-500/40 text-rose-400 bg-rose-500/10";

  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64 transform-gpu">
      {/* Dynamic Cyber Glow */}
      <div
        className="absolute inset-2 rounded-full blur-2xl transition-all duration-500"
        style={{ backgroundColor: glowColor }}
      />

      {/* Outer Tactical Radar Tick Ring */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full pointer-events-none opacity-40 animate-spin-slow"
        aria-hidden
      >
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.5"
          strokeDasharray="2 6"
        />
      </svg>

      {/* Circular Score Gauge */}
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 transform-gpu">
        <defs>
          <linearGradient id="wheelCyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="50%" stopColor="#E5C158" />
            <stop offset="100%" stopColor="#996515" />
          </linearGradient>
          <filter id="scoreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background Track */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="var(--secondary)"
          strokeWidth="12"
          opacity="0.6"
        />

        {/* Animated Fill Gauge */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="url(#wheelCyberGrad)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#scoreGlow)"
          className="transform-gpu transition-[stroke-dashoffset] duration-75 ease-out"
        />
      </svg>

      {/* Central Counter */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="absolute flex flex-col items-center"
      >
        <span className="font-display text-5xl text-gold-gradient font-extrabold tracking-tight">
          {Math.round(shown)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-mono font-semibold">
          / 100
        </span>
        <span
          className={`mt-2 rounded-full border px-3 py-0.5 text-xs tracking-wider font-mono font-bold ${tierBadgeColor}`}
        >
          {label}
        </span>
      </motion.div>
    </div>
  );
}
