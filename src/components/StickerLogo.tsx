import { useRef, useState, useEffect } from "react";
import enhancedAsjiLogo from "@/assets/images/asji_emblem_enhanced_1794709028642.jpg";

interface StickerLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  interactive?: boolean;
  showGlow?: boolean;
  onClick?: () => void;
}

export function StickerLogo({
  size = "md",
  className = "",
  interactive = true,
  onClick,
}: StickerLogoProps) {
  const logoUrl = enhancedAsjiLogo;
  const containerRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState({ rx: 0, ry: 0, tz: 0, shineX: 50, shineY: 50 });
  const targetRef = useRef({ rx: 0, ry: 0, tz: 0, shineX: 50, shineY: 50 });
  const rafRef = useRef<number | null>(null);

  // Smooth lerp loop at high refresh rates (120Hz/60Hz)
  useEffect(() => {
    if (!interactive) return;

    let active = true;
    const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

    const tick = () => {
      if (!active) return;
      setTransform((prev) => {
        const nextRx = lerp(prev.rx, targetRef.current.rx, 0.15);
        const nextRy = lerp(prev.ry, targetRef.current.ry, 0.15);
        const nextTz = lerp(prev.tz, targetRef.current.tz, 0.15);
        const nextShineX = lerp(prev.shineX, targetRef.current.shineX, 0.15);
        const nextShineY = lerp(prev.shineY, targetRef.current.shineY, 0.15);

        // Stop updating if close enough to save GPU cycles
        if (
          Math.abs(nextRx - targetRef.current.rx) < 0.01 &&
          Math.abs(nextRy - targetRef.current.ry) < 0.01 &&
          Math.abs(nextTz - targetRef.current.tz) < 0.01 &&
          Math.abs(nextShineX - targetRef.current.shineX) < 0.1
        ) {
          return prev;
        }

        return {
          rx: nextRx,
          ry: nextRy,
          tz: nextTz,
          shineX: nextShineX,
          shineY: nextShineY,
        };
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [interactive]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = x / rect.width;
    const py = y / rect.height;

    // Calculate 3D tilt angles (-25 to +25 deg)
    targetRef.current = {
      rx: (0.5 - py) * 32,
      ry: (px - 0.5) * 32,
      tz: 18,
      shineX: px * 100,
      shineY: py * 100,
    };
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    targetRef.current = { rx: 0, ry: 0, tz: 0, shineX: 50, shineY: 50 };
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-11 h-11",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
    hero: "w-32 h-32 sm:w-40 sm:h-40",
  }[size];

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative inline-block cursor-pointer select-none perspective-600 ${sizeClasses} ${className}`}
      style={{ perspective: "800px" }}
    >
      {/* 3D Sticker Container */}
      <div
        className="relative w-full h-full transition-transform duration-75 ease-out transform-gpu will-change-transform"
        style={{
          transform: `rotateX(${transform.rx}deg) rotateY(${transform.ry}deg) translateZ(${transform.tz}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Main Transparent Logo Emblem */}
        <div className="relative w-full h-full flex items-center justify-center p-1 rounded-md border border-[#C9A227]/60 bg-[#15171C] overflow-hidden">
          <img
            src={logoUrl}
            alt="ASJi One Logo"
            className="w-full h-full object-contain transform-gpu"
            style={{
              transform: "translateZ(6px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
