import React from "react";

interface ASJiVectorLogoProps {
  className?: string;
  idSuffix?: string;
}

export function ASJiVectorLogo({
  className = "h-full w-full",
  idSuffix = "default",
}: ASJiVectorLogoProps) {
  const grad1 = `goldLinear_${idSuffix}`;
  const grad2 = `goldLight_${idSuffix}`;
  const gradBg = `bgGlow_${idSuffix}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={className}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={grad1} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE79A" />
          <stop offset="30%" stopColor="#D4AF37" />
          <stop offset="60%" stopColor="#AA771C" />
          <stop offset="85%" stopColor="#F3E5AB" />
          <stop offset="100%" stopColor="#8A5A00" />
        </linearGradient>

        <linearGradient id={grad2} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#B8860B" />
          <stop offset="50%" stopColor="#FFD700" />
          <stop offset="100%" stopColor="#FFF5C0" />
        </linearGradient>

        <radialGradient id={gradBg} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1A1813" />
          <stop offset="100%" stopColor="#090806" />
        </radialGradient>
      </defs>

      {/* Outer Stepped Badge Frame */}
      <rect x="16" y="16" width="480" height="480" rx="96" fill={`url(#${gradBg})`} />
      <rect
        x="24"
        y="24"
        width="464"
        height="464"
        rx="88"
        fill="none"
        stroke={`url(#${grad1})`}
        strokeWidth="6"
      />
      <rect
        x="36"
        y="36"
        width="440"
        height="440"
        rx="76"
        fill="none"
        stroke={`url(#${grad2})`}
        strokeWidth="3"
        strokeDasharray="8 4"
        opacity="0.6"
      />

      {/* Inner Crest Shield Accent */}
      <path
        d="M 256,64 L 416,112 V 272 C 416,368 256,448 256,448 C 256,448 96,368 96,272 V 112 Z"
        fill="none"
        stroke={`url(#${grad1})`}
        strokeWidth="4"
        opacity="0.4"
      />

      {/* Central Monogram Monolith 'ASJi' */}
      <g transform="translate(256, 256)">
        {/* Letter 'A' Top Apex & Diagonal Struts */}
        <path
          d="M 0,-140 L 75,110 H 45 L 28,50 H -28 L -45,110 H -75 Z M -18,15 L 18,15 L 0,-45 Z"
          fill={`url(#${grad1})`}
        />

        {/* Interlocking 'S' Sweep */}
        <path
          d="M 50,-65 C 50,-115 -50,-115 -50,-50 C -50,15 60,0 60,65 C 60,125 -55,125 -60,60 H -25 C -20,90 25,90 25,65 C 25,35 -85,50 -85,-50 C -85,-125 75,-125 75,-65 Z"
          fill={`url(#${grad2})`}
          opacity="0.95"
        />

        {/* Accent 'J' Curve Intertwined at Base */}
        <path
          d="M 15,20 V 100 C 15,135 -25,140 -45,125 L -55,145 C -25,168 42,160 42,100 V 20 Z"
          fill={`url(#${grad1})`}
        />

        {/* Dot for 'i' in Gold */}
        <circle cx="55" cy="-115" r="10" fill={`url(#${grad2})`} />
      </g>
    </svg>
  );
}
