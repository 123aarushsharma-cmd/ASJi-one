import { useEffect, useState } from "react";

export function ScoreWheel({ score }: { score: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const duration = 1200;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      // Cubic ease out
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

  return (
    <div className="relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64 transform-gpu">
      <div className="absolute inset-4 rounded-full bg-primary/10 blur-2xl" />
      <svg viewBox="0 0 200 200" className="h-full w-full -rotate-90 transform-gpu">
        <defs>
          <linearGradient id="wheelGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold-deep)" />
            <stop offset="50%" stopColor="var(--gold-light)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r={r} fill="none" stroke="var(--secondary)" strokeWidth="14" />
        <circle
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="url(#wheelGold)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-75 ease-out"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-5xl text-gold-gradient font-extrabold tracking-tight">
          {Math.round(shown)}
        </span>
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-semibold">
          / 100
        </span>
        <span className="mt-2 rounded-full border border-primary/30 px-3 py-1 text-xs tracking-widest text-primary font-medium bg-primary/5">
          {label}
        </span>
      </div>
    </div>
  );
}
