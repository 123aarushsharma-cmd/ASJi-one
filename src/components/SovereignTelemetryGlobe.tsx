import React, { useState } from "react";
import { ASJiVectorLogo } from "./ASJiVectorLogo";

const JURISDICTION_NODES = [
  { code: "IN", label: "India DPDP 2023", angle: 0, ring: "outer" },
  { code: "EU", label: "EU GDPR", angle: 24, ring: "inner" },
  { code: "UK", label: "UK DUAA 2026", angle: 48, ring: "outer" },
  { code: "US", label: "USA CPRA", angle: 72, ring: "inner" },
  { code: "AE", label: "UAE PDPL", angle: 96, ring: "outer" },
  { code: "SA", label: "KSA PDPL", angle: 120, ring: "inner" },
  { code: "SG", label: "Singapore PDPA", angle: 144, ring: "outer" },
  { code: "BR", label: "Brazil LGPD", angle: 168, ring: "inner" },
  { code: "CA", label: "Canada PIPEDA", angle: 192, ring: "outer" },
  { code: "AU", label: "Australia Privacy Act", angle: 216, ring: "inner" },
  { code: "JP", label: "Japan APPI", angle: 240, ring: "outer" },
  { code: "KR", label: "South Korea PIPA", angle: 264, ring: "inner" },
  { code: "CH", label: "Switzerland FADP", angle: 288, ring: "outer" },
  { code: "ZA", label: "South Africa POPIA", angle: 312, ring: "inner" },
  { code: "NG", label: "Nigeria NDPA 2023", angle: 336, ring: "outer" },
] as const;

export function SovereignTelemetryGlobe() {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -ny * 12, y: nx * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHoveredNode(null);
  };

  const activeNode = JURISDICTION_NODES.find((n) => n.code === hoveredNode);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto flex h-44 w-44 sm:h-52 sm:w-52 items-center justify-center select-none mb-4"
      style={{ perspective: "900px" }}
    >
      {/* 3D Tilted Orbital Stage */}
      <div
        className="relative h-full w-full flex items-center justify-center transition-transform duration-300 ease-out"
        style={{
          transformStyle: "preserve-3d",
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* Outer Meridian Ring SVG */}
        <svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full pointer-events-none"
          aria-hidden="true"
        >
          {/* Slate Globe Meridian Ellipses */}
          <ellipse
            cx="130"
            cy="130"
            rx="112"
            ry="44"
            fill="none"
            stroke="#334155"
            strokeWidth="0.9"
            strokeDasharray="3 4"
            transform="rotate(-22 130 130)"
            opacity="0.65"
          />
          <ellipse
            cx="130"
            cy="130"
            rx="112"
            ry="44"
            fill="none"
            stroke="#C9A227"
            strokeWidth="0.8"
            strokeDasharray="2 5"
            transform="rotate(24 130 130)"
            opacity="0.45"
          />
          <ellipse
            cx="130"
            cy="130"
            rx="48"
            ry="112"
            fill="none"
            stroke="#262932"
            strokeWidth="1"
            opacity="0.85"
          />
        </svg>

        {/* Slowly Rotating Outer Gold Ring with Jurisdiction Nodes */}
        <svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full animate-[spin_42s_linear_infinite]"
        >
          <circle
            cx="130"
            cy="130"
            r="116"
            fill="none"
            stroke="#C9A227"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.45"
          />
          {JURISDICTION_NODES.filter((n) => n.ring === "outer").map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const cx = Number((130 + 116 * Math.cos(rad)).toFixed(2));
            const cy = Number((130 + 116 * Math.sin(rad)).toFixed(2));
            const isHovered = hoveredNode === node.code;
            return (
              <g
                key={node.code}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.code)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 7 : 5}
                  fill="#C9A227"
                  opacity={isHovered ? 0.35 : 0.18}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 3.5 : 2.5}
                  fill={isHovered ? "#DFB842" : "#C9A227"}
                />
              </g>
            );
          })}
        </svg>

        {/* Reverse-Rotating Inner Slate/Gold Ring */}
        <svg
          viewBox="0 0 260 260"
          className="absolute inset-0 h-full w-full animate-[spin_28s_linear_infinite_reverse]"
        >
          <circle
            cx="130"
            cy="130"
            r="84"
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="10 6"
            opacity="0.55"
          />
          {JURISDICTION_NODES.filter((n) => n.ring === "inner").map((node) => {
            const rad = (node.angle * Math.PI) / 180;
            const cx = Number((130 + 84 * Math.cos(rad)).toFixed(2));
            const cy = Number((130 + 84 * Math.sin(rad)).toFixed(2));
            const isHovered = hoveredNode === node.code;
            return (
              <g
                key={node.code}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredNode(node.code)}
              >
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 6 : 4}
                  fill="#10B981"
                  opacity={isHovered ? 0.35 : 0.16}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 3 : 2}
                  fill={isHovered ? "#34D399" : "#94A3B8"}
                />
              </g>
            );
          })}
        </svg>

        {/* Centered Enhanced ASJi Monogram Crest Emblem */}
        <div
          className="relative z-10 h-24 w-24 sm:h-28 sm:w-28 flex items-center justify-center rounded-2xl bg-[#0D0E11] p-1 border border-[#C9A227]/60 shadow-2xl overflow-hidden"
          style={{ transform: "translateZ(20px)" }}
        >
          <ASJiVectorLogo idSuffix="hero_emblem" className="h-full w-full" />
        </div>
      </div>

      {/* Subtle Hover Readout for Jurisdiction Nodes */}
      {activeNode && (
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-[#C9A227]/40 bg-[#0D0E11]/95 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#C9A227] z-20">
          [{activeNode.code}] {activeNode.label}
        </div>
      )}
    </div>
  );
}
