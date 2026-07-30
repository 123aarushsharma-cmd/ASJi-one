import { useEffect, useRef, useState } from "react";
import logoAsset from "@/assets/asji-logo.jpg.asset.json";

interface StickerLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  interactive?: boolean;
  showGlow?: boolean;
  onClick?: () => void;
}

// Global cache for transparent PNG data URL
let cachedTransparentLogoUrl: string | null = null;

export function useTransparentLogo(rawUrl: string): string {
  const [transparentUrl, setTransparentUrl] = useState<string>(cachedTransparentLogoUrl || rawUrl);

  useEffect(() => {
    if (cachedTransparentLogoUrl) {
      setTransparentUrl(cachedTransparentLogoUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = rawUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setTransparentUrl(rawUrl);
          return;
        }

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Strip white/near-white background pixels (R, G, B > 220) with smooth edge antialiasing
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Distance from white
          if (r > 215 && g > 215 && b > 215) {
            const maxVal = Math.max(r, g, b);
            if (maxVal > 240) {
              data[i + 3] = 0; // Completely transparent
            } else {
              // Smooth feather transition
              const alpha = Math.round(((240 - maxVal) / 25) * 255);
              data[i + 3] = Math.max(0, Math.min(255, alpha));
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        const processed = canvas.toDataURL("image/png");
        cachedTransparentLogoUrl = processed;
        setTransparentUrl(processed);
      } catch (e) {
        console.warn("Failed to process logo background, falling back to original", e);
        setTransparentUrl(rawUrl);
      }
    };
    img.onerror = () => setTransparentUrl(rawUrl);
  }, [rawUrl]);

  return transparentUrl;
}

export function StickerLogo({
  size = "md",
  className = "",
  interactive = true,
  showGlow = true,
  onClick,
}: StickerLogoProps) {
  const logoUrl = useTransparentLogo(logoAsset?.url || "/asji-logo.svg");
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
      {/* Ambient background glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-amber-600/30 blur-xl opacity-75 animate-pulse-glow pointer-events-none"
          style={{ transform: "scale(1.25)" }}
        />
      )}

      {/* 3D Sticker Container */}
      <div
        className="relative w-full h-full transition-transform duration-75 ease-out transform-gpu will-change-transform"
        style={{
          transform: `rotateX(${transform.rx}deg) rotateY(${transform.ry}deg) translateZ(${transform.tz}px)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer 1: Sticker 3D Drop Shadow & Thick Die-Cut Border */}
        <div
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            filter: `
              drop-shadow(0px 8px 16px rgba(0,0,0,0.7))
              drop-shadow(0px 2px 4px rgba(212,175,55,0.4))
              drop-shadow(0px 0px 1px rgba(255,255,255,0.9))
            `,
            transform: "translateZ(-4px) scale(1.02)",
          }}
        />

        {/* Layer 2: Main Transparent Logo Sticker */}
        <div
          className="relative w-full h-full flex items-center justify-center p-0.5 rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.18), rgba(212,175,55,0.08) 50%, rgba(0,0,0,0.4))",
            boxShadow: `
              inset 0 1px 2px rgba(255, 255, 255, 0.4),
              inset 0 -2px 4px rgba(0, 0, 0, 0.6),
              0 0 0 1.5px rgba(212, 175, 55, 0.55),
              0 0 12px rgba(212, 175, 55, 0.25)
            `,
            backdropFilter: "blur(8px)",
          }}
        >
          <img
            src={logoUrl}
            alt="ASJi One Logo"
            className="w-full h-full object-contain filter drop-shadow(0 2px 5px rgba(0,0,0,0.5)) transform-gpu"
            style={{
              transform: "translateZ(8px)",
            }}
          />

          {/* Layer 3: 3D Metallic Gloss / Sheen Highlight Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-60 mix-blend-overlay transition-opacity duration-300"
            style={{
              background: `radial-gradient(circle at ${transform.shineX}% ${transform.shineY}%, rgba(255,255,255,0.8) 0%, rgba(255,215,0,0.3) 30%, transparent 70%)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
