import { useEffect, useState } from "react";

const STEPS = [
  "Resolving domain & origins",
  "Inspecting TLS & HSTS certificate headers",
  "Auditing privacy cookies & local trackers",
  "Checking security headers & CSP policy",
  "Evaluating GDPR & India DPDP Act compliance",
  "Compiling fine exposure risk & score",
];

export function ScanLoader({ progress, url }: { progress: number; url: string }) {
  const [displayedProgress, setDisplayedProgress] = useState(progress);

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

  const stepIndex = Math.min(
    STEPS.length - 1,
    Math.floor((displayedProgress / 100) * STEPS.length),
  );

  const radius = 82;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayedProgress / 100) * circumference;

  // Calculate tip particle position on the circle arc (-90deg offset so 0% starts at top)
  const tipAngleRad = ((displayedProgress / 100) * 360 - 90) * (Math.PI / 180);
  const tipX = 100 + radius * Math.cos(tipAngleRad);
  const tipY = 100 + radius * Math.sin(tipAngleRad);

  return (
    <div className="flex flex-col items-center gap-8 py-10 animate-rise transform-gpu">
      <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80 transform-gpu">
        {/* Soft Gold Radial Ambient Glow */}
        <div className="absolute inset-2 rounded-full bg-primary/20 blur-3xl animate-pulse-glow transform-gpu" />

        {/* Outer Decorative Spinning Dashed Orbit Ring */}
        <svg
          className="absolute inset-0 animate-spin-slow transform-gpu opacity-40"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="95"
            fill="none"
            stroke="var(--gold)"
            strokeWidth="1"
            strokeDasharray="12 12"
          />
        </svg>

        {/* High-Frame-Rate Circular Progress Indicator */}
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

            <filter id="goldGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Track Background Ring */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            fill="none"
            stroke="var(--gold-deep)"
            strokeOpacity="0.18"
            strokeWidth="6"
          />

          {/* Active Smooth Circular Progress Arc */}
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
            filter="url(#goldGlowFilter)"
            className="transition-[stroke-dashoffset] duration-75 ease-out"
          />

          {/* Leading Edge Glowing Tip Indicator Dot */}
          {displayedProgress > 1 && (
            <g transform="rotate(90 100 100)">
              <circle cx={tipX} cy={tipY} r="7" fill="url(#tipGlow)" opacity="0.8" />
              <circle cx={tipX} cy={tipY} r="3.5" fill="#FFF2B2" stroke="#D4AF37" strokeWidth="1" />
            </g>
          )}
        </svg>

        {/* Center Monolith Shield & Counter */}
        <div className="relative z-10 flex flex-col items-center justify-center h-28 w-28 sm:h-32 sm:w-32 rounded-full surface-panel border border-primary/40 shadow-gold transform-gpu">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping opacity-25 transform-gpu" />
          <svg
            className="h-8 w-8 text-primary animate-pulse transform-gpu mb-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751A11.959 11.959 0 0112 2.714z"
            />
          </svg>
          <span className="font-display text-2xl font-extrabold text-gold-gradient tracking-tight leading-none">
            {Math.round(displayedProgress)}%
          </span>
        </div>
      </div>

      <div className="w-full max-w-md space-y-4 text-center">
        <p className="font-display text-2xl text-gold-gradient">Scanning {url}</p>
        <p className="text-sm text-muted-foreground transition-all duration-300">
          {STEPS[stepIndex]}…
        </p>

        {/* Linear Gold Bar Accent */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/80 p-0.5 border border-primary/20">
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
