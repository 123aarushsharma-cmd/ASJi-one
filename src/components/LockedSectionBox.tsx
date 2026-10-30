import { Lock, Sparkles, ArrowRight } from "lucide-react";

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
    <div className="surface-panel relative overflow-hidden p-6 sm:p-8 border-primary/40 bg-black/70 rounded-2xl">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/50 bg-primary/15 text-primary shadow-lg shadow-primary/20">
            <Lock className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-mono font-semibold text-primary uppercase tracking-wider">
                🔒 Enterprise Locked Feature
              </span>
            </div>
            <h3 className="mt-1.5 font-display text-xl sm:text-2xl font-bold text-gold-gradient">
              {title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-mono font-bold text-primary shadow-sm">
            {priceTag}
          </span>
        </div>
      </div>

      <p className="mt-4 text-xs sm:text-sm text-muted-foreground leading-relaxed font-mono">
        {description}
      </p>

      {/* Blurred preview placeholder */}
      <div className="relative mt-5 rounded-xl bg-black/90 border border-border/80 p-5 select-none blur-[5px] opacity-60 pointer-events-none">
        <div className="space-y-3 font-mono text-xs text-muted-foreground">
          <div className="h-4 w-3/4 rounded bg-primary/20 animate-pulse" />
          <div className="h-4 w-full rounded bg-secondary/60" />
          <div className="h-4 w-5/6 rounded bg-secondary/60" />
          <div className="h-4 w-2/3 rounded bg-primary/10" />
        </div>
      </div>

      {/* Action / Unlock CTA */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
        <div>
          <p className="text-sm font-bold text-foreground font-mono">
            Unlock Full Report &amp; Autonomous Remediation Suite
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            Get instant access to 15 jurisdictional verdicts, PDF report export, code patches, and
            legal solution generators.
          </p>
        </div>

        <button
          type="button"
          onClick={onUnlock}
          className="btn-gold rounded-xl px-7 py-3.5 text-xs font-bold uppercase tracking-wider text-black cursor-pointer shadow-lg shadow-primary/25 shrink-0 flex items-center gap-2 font-mono hover:scale-[1.02] transition-all"
        >
          <Sparkles className="h-4 w-4" />
          <span>Unlock full report</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
