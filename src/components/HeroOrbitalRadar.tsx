import React from "react";

const RADAR_SIZE = 720;
const CENTER = RADAR_SIZE / 2;

const DEGREE_TICKS = Array.from({ length: 24 }, (_, idx) => {
  const deg = idx * 15;
  const rad = (deg * Math.PI) / 180;
  const isCardinal = deg % 90 === 0;
  const rInner = isCardinal ? 276 : 284;
  const rOuter = 294;
  return {
    deg,
    isCardinal,
    x1: Number((CENTER + rInner * Math.cos(rad)).toFixed(2)),
    y1: Number((CENTER + rInner * Math.sin(rad)).toFixed(2)),
    x2: Number((CENTER + rOuter * Math.cos(rad)).toFixed(2)),
    y2: Number((CENTER + rOuter * Math.sin(rad)).toFixed(2)),
    lx: Number((CENTER + 312 * Math.cos(rad)).toFixed(2)),
    ly: Number((CENTER + 312 * Math.sin(rad)).toFixed(2)),
  };
});

const ORBIT_NODES = [
  { id: "in", radius: 220, deg: 35, delay: "0s" },
  { id: "eu", radius: 294, deg: 112, delay: "0.7s" },
  { id: "uk", radius: 155, deg: 168, delay: "1.3s" },
  { id: "us", radius: 294, deg: 224, delay: "0.4s" },
  { id: "sg", radius: 220, deg: 292, delay: "1.9s" },
  { id: "ae", radius: 155, deg: 336, delay: "1.1s" },
].map((n) => {
  const rad = (n.deg * Math.PI) / 180;
  return {
    ...n,
    cx: Number((CENTER + n.radius * Math.cos(rad)).toFixed(2)),
    cy: Number((CENTER + n.radius * Math.sin(rad)).toFixed(2)),
  };
});

/**
 * Interactive SVG Orbital Compliance Radar rendered behind the Hero Scanner.
 * Consumes --radar-x and --radar-y CSS variables updated from pointer movement
 * on the hero stage for 60fps parallax depth without React re-renders.
 */
export function HeroOrbitalRadar() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
    >
      <div
        className="relative h-[580px] w-[580px] sm:h-[700px] sm:w-[700px] lg:h-[780px] lg:w-[780px] opacity-65 transition-transform duration-500 ease-out"
        style={{
          transform: "translate3d(var(--radar-x, 0px), var(--radar-y, 0px), 0)",
        }}
      >
        <svg viewBox={`0 0 ${RADAR_SIZE} ${RADAR_SIZE}`} className="h-full w-full">
          <defs>
            <radialGradient id="heroRadarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0.09" />
              <stop offset="55%" stopColor="#C9A227" stopOpacity="0.025" />
              <stop offset="100%" stopColor="#0D0E11" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Ambient Radial Core */}
          <circle cx={CENTER} cy={CENTER} r="320" fill="url(#heroRadarGlow)" />

          {/* Crosshair Axis Hairlines */}
          <line
            x1="40"
            y1={CENTER}
            x2={RADAR_SIZE - 40}
            y2={CENTER}
            stroke="#262932"
            strokeWidth="0.9"
            strokeDasharray="3 6"
          />
          <line
            x1={CENTER}
            y1="40"
            x2={CENTER}
            y2={RADAR_SIZE - 40}
            stroke="#262932"
            strokeWidth="0.9"
            strokeDasharray="3 6"
          />

          {/* Coordinate Degree Ticks & Cardinal Bearings */}
          <g>
            {DEGREE_TICKS.map((t) => (
              <g key={t.deg}>
                <line
                  x1={t.x1}
                  y1={t.y1}
                  x2={t.x2}
                  y2={t.y2}
                  stroke={t.isCardinal ? "#C9A227" : "#334155"}
                  strokeWidth={t.isCardinal ? "1.3" : "0.8"}
                  opacity={t.isCardinal ? "0.65" : "0.45"}
                />
                {t.isCardinal && (
                  <text
                    x={t.lx}
                    y={t.ly}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill="#C9A227"
                    opacity="0.45"
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="600"
                  >
                    {String(t.deg).padStart(3, "0")}°
                  </text>
                )}
              </g>
            ))}
          </g>

          {/* Outer Slow-Rotating Gold Orbital Ring */}
          <g
            className="animate-[spin_68s_linear_infinite]"
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r="294"
              fill="none"
              stroke="#C9A227"
              strokeWidth="0.9"
              strokeDasharray="6 10"
              opacity="0.34"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r="260"
              fill="none"
              stroke="#334155"
              strokeWidth="0.8"
              opacity="0.4"
            />
          </g>

          {/* Middle Counter-Rotating Slate & Gold Ring with Pulsing Coordinate Nodes */}
          <g
            className="animate-[spin_46s_linear_infinite_reverse]"
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          >
            <circle
              cx={CENTER}
              cy={CENTER}
              r="220"
              fill="none"
              stroke="#C9A227"
              strokeWidth="0.9"
              strokeDasharray="2 7"
              opacity="0.32"
            />
            <circle
              cx={CENTER}
              cy={CENTER}
              r="155"
              fill="none"
              stroke="#475569"
              strokeWidth="0.85"
              strokeDasharray="10 6"
              opacity="0.42"
            />

            {ORBIT_NODES.map((node) => (
              <g key={node.id}>
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="8"
                  fill="#C9A227"
                  opacity="0.16"
                  className="animate-radar-node"
                  style={{ animationDelay: node.delay }}
                />
                <circle cx={node.cx} cy={node.cy} r="2.6" fill="#C9A227" opacity="0.85" />
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  );
}
