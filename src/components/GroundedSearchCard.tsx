import { Globe, Search, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { GroundingInfo } from "@/lib/audit-pipeline.server";

interface GroundedSearchCardProps {
  grounding?: GroundingInfo;
}

export function GroundedSearchCard({ grounding }: GroundedSearchCardProps) {
  if (!grounding || !grounding.isGrounded) return null;

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 backdrop-blur-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary border border-primary/30">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground">
                Regulatory Precedent &amp; Legal Verification
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary border border-primary/20">
                <CheckCircle2 className="h-3 w-3" /> Statutory Cross-Referenced
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Cross-referenced against current regulatory gazettes, enforcement precedents &amp;
              public domain disclosures
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-sans font-semibold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/30">
            {grounding.sources.length} Verified Citations
          </span>
        </div>
      </div>

      {/* Verification checks executed */}
      {grounding.searchQueries.length > 0 && (
        <div className="mt-3.5">
          <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-primary" />
            Verification queries &amp; regulatory index lookups:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grounding.searchQueries.map((query, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md bg-secondary/80 px-2.5 py-1 text-xs font-sans font-medium text-foreground border border-border/50"
              >
                "{query}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grounded sources / citations */}
      {grounding.sources.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            Statutory &amp; Technical References:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {grounding.sources.map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noreferrer opacity-90 hover:opacity-100"
                className="group flex items-start justify-between gap-2 rounded-lg border border-border/60 bg-background/50 p-2.5 text-xs transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground group-hover:text-primary">
                    {src.title || "Legal Reference"}
                  </p>
                  <p className="truncate text-[11px] text-muted-foreground font-sans font-medium mt-0.5">
                    {src.uri}
                  </p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 group-hover:text-primary mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
