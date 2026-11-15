import React from "react";
import { ASJiVectorLogo } from "./ASJiVectorLogo";

export type BrandLockupSize = "navbar" | "hero" | "footer" | "report";

interface ASJiBrandLockupProps {
  size?: BrandLockupSize;
  idSuffix?: string;
  className?: string;
}

const OCTAGON_CLIP_STYLE: React.CSSProperties = {
  clipPath: "polygon(28% 0%, 72% 0%, 100% 28%, 100% 72%, 72% 100%, 28% 100%, 0% 72%, 0% 28%)",
};

export function ASJiBrandLockup({
  size = "navbar",
  idSuffix = "brand_lockup",
  className = "",
}: ASJiBrandLockupProps) {
  const emblemDimensions =
    size === "report"
      ? "h-12 w-12 sm:h-14 sm:w-14"
      : size === "hero"
        ? "h-11 w-11 sm:h-12 sm:w-12"
        : size === "footer"
          ? "h-10 w-10 sm:h-11 sm:w-11"
          : "h-9 w-9 sm:h-10 sm:w-10";

  const titleClasses = size === "report" ? "text-2xl lg:text-[28px]" : "text-lg lg:text-xl";

  const taglineClasses = "text-[7.5px] lg:text-[8px] font-medium tracking-[0.24em] leading-none";

  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 min-w-0 text-left ${className}`}>
      {/* Custom ASJi One Octagonal Gold Monogram Emblem */}
      <div
        className={`relative shrink-0 p-[1.5px] shadow-[0_0_20px_-4px_rgba(201,162,39,0.42)] transition-transform duration-300 group-hover:scale-[1.03] ${emblemDimensions}`}
        style={{
          ...OCTAGON_CLIP_STYLE,
          background: "linear-gradient(135deg, #E9C963 0%, #C9A227 52%, #8F6E11 100%)",
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center bg-[#0D0E11] p-0.5 overflow-hidden"
          style={OCTAGON_CLIP_STYLE}
        >
          <ASJiVectorLogo className="h-full w-full" idSuffix={idSuffix} />
        </div>
      </div>

      {/* Vertical Executive Two-Line Lockup */}
      <div className="flex flex-col justify-center leading-none min-w-0">
        <span
          className={`font-display font-bold leading-none tracking-tight text-[#F9FAFB] whitespace-nowrap ${titleClasses}`}
        >
          ASJi <span className="text-[#C9A227]">One</span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 min-w-0">
          <span aria-hidden="true" className="w-2.5 h-[1px] bg-[#C9A227]/60 shrink-0" />
          <span
            className={`font-mono uppercase text-[#C9A227] whitespace-nowrap ${taglineClasses}`}
          >
            TRUST INTELLIGENCE
          </span>
        </span>
      </div>
    </div>
  );
}
