import { Globe, Search, ExternalLink, ShieldCheck, CheckCircle2 } from "lucide-react";
import type { GroundingInfo } from "@/lib/audit-types";

interface GroundedSearchCardProps {
  grounding?: GroundingInfo;
}

export function GroundedSearchCard({ grounding }: GroundedSearchCardProps) {
  if (!grounding || !grounding.isGrounded) return null;

  return (
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#262932] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0D0E11] text-[#C9A227] border border-[#262932]">
            <Globe className="h-4 w-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display text-base font-bold text-[#F4F4F5]">
                Regulatory Precedent &amp; Legal Verification
              </h3>
              <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold text-[#10B981]">
                <CheckCircle2 className="h-3 w-3" /> Statutory Cross-Referenced
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA]">
              Cross-referenced against current regulatory gazettes, enforcement precedents &amp;
              public domain disclosures
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono font-semibold text-[#C9A227] tabular-nums">
            {grounding.sources.length} Verified Citations
          </span>
        </div>
      </div>

      {/* Verification checks executed */}
      {grounding.searchQueries.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#A1A1AA] mb-2 flex items-center gap-1.5">
            <Search className="h-3.5 w-3.5 text-[#C9A227]" />
            Verification queries &amp; regulatory index lookups:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {grounding.searchQueries.map((query, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded bg-[#0D0E11] px-2.5 py-1 text-xs font-mono text-[#F4F4F5] border border-[#262932]"
              >
                &ldquo;{query}&rdquo;
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Grounded sources / citations */}
      {grounding.sources.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium text-[#A1A1AA] mb-2 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#C9A227]" />
            Statutory &amp; Technical References:
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {grounding.sources.map((src, i) => (
              <a
                key={i}
                href={src.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start justify-between gap-2 rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs transition-colors hover:border-[#C9A227]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-[#F4F4F5] group-hover:text-[#C9A227]">
                    {src.title || "Legal Reference"}
                  </p>
                  <p className="truncate text-[11px] text-[#71717A] font-mono mt-0.5">{src.uri}</p>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[#71717A] shrink-0 group-hover:text-[#C9A227] mt-0.5" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
