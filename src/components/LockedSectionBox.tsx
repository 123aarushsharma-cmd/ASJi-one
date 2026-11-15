import { Lock, ShieldCheck, ArrowRight } from "lucide-react";

interface LockedSectionBoxProps {
  title: string;
  description: string;
  onUnlock: () => void;
  priceTag?: string;
}

export function LockedSectionBox({
  title,
  description,
  onUnlock,
  priceTag = "₹24,999 ($300)",
}: LockedSectionBoxProps) {
  return (
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262932] pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227]">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-semibold text-[#C9A227] uppercase tracking-wider">
                <Lock className="h-3 w-3" />
                Enterprise Locked Module
              </span>
            </div>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold text-[#F4F4F5]">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-md border border-[#262932] bg-[#0D0E11] px-3.5 py-1.5 text-xs font-mono font-bold text-[#C9A227] tabular-nums">
            {priceTag}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">{description}</p>

      {/* Redacted statutory brief preview */}
      <div className="mt-5 rounded-md border border-[#E5DEC9] bg-[#FAF8F5] p-5 text-[#18181B]">
        <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-2.5 mb-3">
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#9A7812]">
            Sealed Statutory Instrument
          </span>
          <span className="font-mono text-[10px] text-[#52525B]">
            15 Jurisdictions · Ready for Export
          </span>
        </div>
        <div className="space-y-2.5 select-none pointer-events-none opacity-65">
          <div className="h-3 w-3/4 rounded-sm bg-[#18181B]/20" />
          <div className="h-3 w-full rounded-sm bg-[#18181B]/10" />
          <div className="h-3 w-5/6 rounded-sm bg-[#18181B]/10" />
          <div className="h-3 w-2/3 rounded-sm bg-[#18181B]/15" />
        </div>
      </div>

      {/* Action / Unlock CTA */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-md border border-[#262932] bg-[#0D0E11] p-5">
        <div>
          <p className="text-sm font-bold text-[#F4F4F5]">
            Unlock Full Report &amp; Remediation Suite
          </p>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Instant access to 15 jurisdictional verdicts, official PDF certificate export, server
            configuration patches, and statutory notice generators.
          </p>
        </div>

        <button
          type="button"
          onClick={onUnlock}
          className="btn-gold rounded-md px-6 py-3 text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 flex items-center gap-2 font-mono whitespace-nowrap"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Unlock Full Report</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
