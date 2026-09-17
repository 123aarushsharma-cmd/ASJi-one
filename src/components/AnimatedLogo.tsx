import React from "react";
import { motion } from "motion/react";

interface AnimatedLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  withGlow?: boolean;
  withRays?: boolean;
  idSuffix?: string;
}

const sizeMap = {
  xs: "w-8 h-8",
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32 sm:w-40 sm:h-40",
};

export function AnimatedLogo({
  size = "md",
  className = "",
  withGlow = true,
  withRays = true,
  idSuffix = "primary",
}: AnimatedLogoProps) {
  const sizeClass = sizeMap[size];
  const linearId = `goldLinear_${idSuffix}`;
  const lightId = `goldLight_${idSuffix}`;
  const bgGlowId = `bgGlow_${idSuffix}`;

  return (
    <div
      className={`relative flex items-center justify-center select-none ${sizeClass} ${className}`}
    >
      {/* Background ambient radial glow */}
      {withGlow && (
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.35, 0.65, 0.35],
          }}
          transition={{
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#8A5A00] via-[#D4AF37]/50 to-[#FFE79A]/20 blur-xl pointer-events-none"
        />
      )}

      {/* Rotating orbit rays for luxury high-tech atmosphere */}
      {withRays && (size === "lg" || size === "xl") && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -inset-4 pointer-events-none opacity-40"
        >
          <div className="h-full w-full rounded-full border border-dashed border-[#D4AF37]/40" />
        </motion.div>
      )}

      {/* Core SVG Sovereign Emblem */}
      <svg
        viewBox="0 0 512 512"
        className="relative z-10 h-full w-full drop-shadow-[0_4px_16px_rgba(212,175,55,0.35)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Rich Sovereign Gold Gradients */}
          <linearGradient id={linearId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF2B2" />
            <stop offset="30%" stopColor="#E5C158" />
            <stop offset="60%" stopColor="#D4AF37" />
            <stop offset="85%" stopColor="#AA771C" />
            <stop offset="100%" stopColor="#8A5A00" />
          </linearGradient>

          <linearGradient id={lightId} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B8860B" />
            <stop offset="45%" stopColor="#FFD700" />
            <stop offset="80%" stopColor="#FFE79A" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>

          <radialGradient id={bgGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1E190E" />
            <stop offset="65%" stopColor="#12100A" />
            <stop offset="100%" stopColor="#060604" />
          </radialGradient>
        </defs>

        {/* Outer Stepped Frame with Smooth Rounded Corners */}
        <rect x="16" y="16" width="480" height="480" rx="96" fill={`url(#${bgGlowId})`} />

        {/* Gold Border Frame with Dash Accents */}
        <rect
          x="24"
          y="24"
          width="464"
          height="464"
          rx="88"
          fill="none"
          stroke={`url(#${linearId})`}
          strokeWidth="6"
        />
        <rect
          x="36"
          y="36"
          width="440"
          height="440"
          rx="76"
          fill="none"
          stroke={`url(#${lightId})`}
          strokeWidth="3"
          strokeDasharray="8 4"
          opacity="0.65"
        />

        {/* Inner Crest Shield Accent */}
        <path
          d="M 256,64 L 416,112 V 272 C 416,368 256,448 256,448 C 256,448 96,368 96,272 V 112 Z"
          fill="none"
          stroke={`url(#${linearId})`}
          strokeWidth="4"
          opacity="0.45"
        />

        {/* Central Monogram Monolith 'ASJi' */}
        <g transform="translate(256, 256)">
          {/* Letter 'A' Top Apex & Diagonal Struts */}
          <path
            d="M 0,-140 L 75,110 H 45 L 28,50 H -28 L -45,110 H -75 Z M -18,15 L 18,15 L 0,-45 Z"
            fill={`url(#${linearId})`}
          />

          {/* Interlocking 'S' Sweep with Sovereign Sheen */}
          <path
            d="M 50,-65 C 50,-115 -50,-115 -50,-50 C -50,15 60,0 60,65 C 60,125 -55,125 -60,60 H -25 C -20,90 25,90 25,65 C 25,35 -85,50 -85,-50 C -85,-125 75,-125 75,-65 Z"
            fill={`url(#${lightId})`}
            opacity="0.95"
          />

          {/* Accent 'J' Curve Intertwined at Base */}
          <path
            d="M 15,20 V 100 C 15,135 -25,140 -45,125 L -55,145 C -25,168 42,160 42,100 V 20 Z"
            fill={`url(#${linearId})`}
          />

          {/* Dot for 'i' in Gold */}
          <circle cx="55" cy="-115" r="10" fill={`url(#${lightId})`} />
        </g>
      </svg>
    </div>
  );
}
