import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function ScoreWheel({ score }: { score: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setShown(score);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const duration = 480;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
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

  const label = score >= 80 ? "Compliant" : score >= 60 ? "Warning" : "Critical";
  const strokeColor = score >= 80 ? "#10B981" : score >= 60 ? "#F59E0B" : "#EF4444";

  const tierBadgeColor =
    score >= 80
      ? "border-[#10B981]/50 text-[#10B981] bg-[#10B981]/10"
      : score >= 60
        ? "border-[#F59E0B]/50 text-[#F59E0B] bg-[#F59E0B]/10"
        : "border-[#EF4444]/50 text-[#EF4444] bg-[#EF4444]/10";

  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64 transform-gpu">
      {/* Outer Precision Index Ring */}
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full pointer-events-none opacity-40"
        aria-hidden
      >
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke="#262932"
          strokeWidth="1.5"
          strokeDasharray="2 6"
        />
      </svg>

      {/* Circular Score Gauge */}
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 transform-gpu">
        {/* Background Track */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="#262932" strokeWidth="10" />

        {/* Animated Fill Gauge */}
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transform-gpu transition-[stroke-dashoffset] duration-75 ease-out"
        />
      </svg>

      {/* Central Counter */}
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="absolute flex flex-col items-center"
      >
        <span className="font-display text-5xl text-[#FAF8F5] font-bold tracking-tight tabular-nums">
          {Math.round(shown)}
        </span>
        <span className="text-[11px] uppercase tracking-[0.25em] text-zinc-400 font-mono font-semibold tabular-nums">
          / 100
        </span>
        <span
          className={`mt-2.5 rounded border px-2.5 py-0.5 text-[11px] uppercase tracking-wider font-mono font-bold ${tierBadgeColor}`}
        >
          {label}
        </span>
      </motion.div>
    </div>
  );
}
