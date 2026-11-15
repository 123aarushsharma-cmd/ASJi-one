import React from "react";
import enhancedAsjiLogo from "@/assets/images/asji_emblem_enhanced_1794709028642.jpg";

/**
 * Brand Logo Config:
 * Defaults to the enhanced ASJi monogram crest emblem.
 * Swap with any custom PNG or SVG URL to override globally.
 */
export const logoUrl: string | null = enhancedAsjiLogo;

interface ASJiVectorLogoProps {
  className?: string;
  idSuffix?: string;
  width?: number | string;
  height?: number | string;
}

export function ASJiVectorLogo({
  className = "h-full w-full",
  idSuffix = "default",
  width,
  height,
}: ASJiVectorLogoProps) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="ASJi One Brand Emblem"
        width={width}
        height={height}
        draggable={false}
        className={`object-cover bg-[#0D0E11] rounded-[14%] select-none ${className}`}
        style={{
          display: "block",
          filter: "contrast(1.04) saturate(1.05)",
        }}
      />
    );
  }

  const gradGold = `asjiGold_${idSuffix}`;
  const gradGoldBright = `asjiGoldBright_${idSuffix}`;
  const gradOnyx = `asjiOnyx_${idSuffix}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width={width}
      height={height}
      className={className}
      style={{ display: "block" }}
      aria-label="ASJi One Brand Emblem"
    >
      <defs>
        <linearGradient id={gradGold} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E9C963" />
          <stop offset="45%" stopColor="#C9A227" />
          <stop offset="100%" stopColor="#8F6E11" />
        </linearGradient>
        <linearGradient id={gradGoldBright} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#A68116" />
          <stop offset="50%" stopColor="#DFB842" />
          <stop offset="100%" stopColor="#F5DFA0" />
        </linearGradient>
        <radialGradient id={gradOnyx} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#1A1D24" />
          <stop offset="100%" stopColor="#0D0E11" />
        </radialGradient>
      </defs>
      <polygon
        points="78,14 178,14 242,78 242,178 178,242 78,242 14,178 14,78"
        fill={`url(#${gradOnyx})`}
        stroke={`url(#${gradGold})`}
        strokeWidth="4"
      />
      <path
        d="M 106,62 L 62,190 H 78 L 91,150 H 126"
        fill="none"
        stroke={`url(#${gradGoldBright})`}
        strokeWidth="10"
        strokeLinecap="square"
      />
      <path
        d="M 106,62 L 146,190"
        fill="none"
        stroke={`url(#${gradGold})`}
        strokeWidth="10"
        strokeLinecap="square"
      />
      <path
        d="M 148,84 L 172,64 V 190"
        fill="none"
        stroke={`url(#${gradGoldBright})`}
        strokeWidth="11"
        strokeLinecap="square"
      />
    </svg>
  );
}
