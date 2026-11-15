import React, { useRef } from "react";

interface SpecularCardProps {
  as?: "div" | "button";
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  ariaPressed?: boolean;
}

/**
 * Tactile 3D Specular Gold Card
 * Updates CSS custom properties directly on DOM nodes for 60fps cursor-tracking
 * radial gold border sheen and -3px spring elevation with zero React re-renders.
 */
export function SpecularCard({
  as = "div",
  children,
  className = "",
  onClick,
  type = "button",
  style,
  ariaPressed,
}: SpecularCardProps) {
  const ref = useRef<HTMLElement | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mx", `${x.toFixed(1)}px`);
    el.style.setProperty("--my", `${y.toFixed(1)}px`);
    el.style.setProperty("--spotlight-opacity", "1");
  };

  const handleMouseLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--spotlight-opacity", "0");
  };

  if (as === "button") {
    return (
      <button
        ref={(node) => {
          ref.current = node;
        }}
        type={type}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        aria-pressed={ariaPressed}
        style={style}
        className={`specular-card ${className}`}
      >
        {children}
      </button>
    );
  }

  return (
    <div
      ref={(node) => {
        ref.current = node;
      }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={style}
      className={`specular-card ${className}`}
    >
      {children}
    </div>
  );
}
