import React, { useState, useMemo } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Globe2,
  ShieldCheck,
  ShieldAlert,
  Scale,
  Building2,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import type { AuditReport } from "@/lib/audit-types";
import {
  getUnifiedJurisdictionVerdicts,
  type UnifiedJurisdictionVerdict,
} from "@/lib/unified-verdicts";

interface CountryLegalVerdictCardProps {
  report: AuditReport;
  onOpenRemediationModal?: () => void;
}

export type CountryVerdict = UnifiedJurisdictionVerdict;

export function CountryLegalVerdictCard({
  report,
  onOpenRemediationModal,
}: CountryLegalVerdictCardProps) {
  const [filterMode, setFilterMode] = useState<"ALL" | "PASS" | "FAIL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);

  // Single Source of Truth for Sovereign Verdicts across the entire application
  const unified = useMemo(() => getUnifiedJurisdictionVerdicts(report), [report]);
  const countryVerdicts: CountryVerdict[] = unified.verdicts;

  const passedCountries = useMemo(() => countryVerdicts.filter((c) => c.passed), [countryVerdicts]);

  const failedCountries = useMemo(
    () => countryVerdicts.filter((c) => !c.passed),
    [countryVerdicts],
  );

  const filteredList = useMemo(() => {
    let list = countryVerdicts;
    if (filterMode === "PASS") list = passedCountries;
    if (filterMode === "FAIL") list = failedCountries;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.country.toLowerCase().includes(q) ||
          c.statuteName.toLowerCase().includes(q) ||
          c.governingBody.toLowerCase().includes(q) ||
          c.region.toLowerCase().includes(q),
      );
    }
    return list;
  }, [countryVerdicts, passedCountries, failedCountries, filterMode, searchQuery]);

  return (
    <div className="surface-panel p-5 sm:p-7 border-primary/40 relative overflow-hidden">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 font-mono text-[11px] font-semibold text-primary">
              <Globe2 className="h-3.5 w-3.5" />
              Sovereign Jurisdictions Analysis
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              Target: <strong className="text-foreground">{report.target}</strong>
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-gold-gradient">
            Country-by-Country Legal Pass vs. Wholly Fail Audit
          </h2>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Statutory legal determination evaluating whether this website fully complies with or
            wholly violates each sovereign nation's enacted privacy and cyber statutes.
          </p>
        </div>

        {/* Global Verdict Ratio Badge */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode("PASS")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-2 transition-all cursor-pointer text-xs ${
              filterMode === "PASS"
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-300 font-bold ring-1 ring-emerald-500/50"
                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{passedCountries.length} PASS</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("FAIL")}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 sm:px-3.5 sm:py-2 transition-all cursor-pointer text-xs ${
              filterMode === "FAIL"
                ? "border-rose-500 bg-rose-500/20 text-rose-300 font-bold ring-1 ring-rose-500/50"
                : "border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>{failedCountries.length} FAIL</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-xl border border-border/80 bg-secondary/30 p-1 font-mono text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
              filterMode === "ALL"
                ? "bg-primary text-primary-foreground font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            All Nations ({countryVerdicts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("PASS")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
              filterMode === "PASS"
                ? "bg-emerald-500 text-black font-bold"
                : "text-emerald-400 hover:text-emerald-300"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Passing ({passedCountries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("FAIL")}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 whitespace-nowrap ${
              filterMode === "FAIL"
                ? "bg-rose-500 text-white font-bold"
                : "text-rose-400 hover:text-rose-300"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Failing ({failedCountries.length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search country or statute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Grid of Country Verdicts */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredList.map((c) => {
            const isSelected = selectedCountryId === c.id;

            return (
              <motion.div
                key={c.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`rounded-2xl border p-4 sm:p-5 transition-all flex flex-col justify-between ${
                  c.passed
                    ? "border-emerald-500/30 bg-emerald-500/[0.03] hover:border-emerald-500/50 hover:bg-emerald-500/[0.06]"
                    : "border-rose-500/30 bg-rose-500/[0.03] hover:border-rose-500/50 hover:bg-rose-500/[0.06]"
                }`}
              >
                <div>
                  {/* Top Header: Flag + Country + Verdict Badge */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl" role="img" aria-label={c.country}>
                        {c.flag}
                      </span>
                      <div>
                        <h3 className="font-display font-bold text-base text-foreground flex items-center gap-1.5">
                          {c.country}
                          <span className="text-[10px] font-mono font-normal text-muted-foreground">
                            ({c.region})
                          </span>
                        </h3>
                        <p className="text-[11px] font-mono text-primary/90 mt-0.5">
                          {c.statuteName}
                        </p>
                      </div>
                    </div>

                    {/* Statutory Verdict Badge */}
                    <span
                      className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1 self-start sm:self-auto ${
                        c.passed
                          ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-300"
                          : "border-rose-500/60 bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {c.passed ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span className="hidden sm:inline">{c.verdictLabel}</span>
                      <span className="sm:hidden">
                        {c.passed ? "STATUTORY PASS" : "STATUTORY FAIL"}
                      </span>
                    </span>
                  </div>

                  {/* Primary Reason for Pass or Fail */}
                  <div
                    className={`mt-3.5 rounded-xl border p-3 text-xs leading-relaxed ${
                      c.passed
                        ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                        : "border-rose-500/20 bg-rose-500/10 text-rose-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {c.passed ? (
                        <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <ShieldAlert className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <strong className="block font-semibold mb-0.5">
                          {c.passed
                            ? "Why it Passes in this Country:"
                            : "Why it Wholly Fails under National Law:"}
                        </strong>
                        <span className="text-[11.5px] opacity-90">
                          {c.passed ? c.passJustification : c.primaryViolation}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Violated Articles (if failed) */}
                  {!c.passed && c.violatedArticles && c.violatedArticles.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[10px] font-mono text-rose-400 font-semibold block uppercase tracking-wider mb-1">
                        Statutory Sections in Breach:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.violatedArticles.map((art, idx) => (
                          <span
                            key={idx}
                            className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10.5px] font-mono text-rose-300"
                          >
                            {art}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Authority & Fine Cap */}
                  <div className="mt-3.5 pt-3 border-t border-border/40 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Statutory Framework:
                      </span>
                      <span className="font-semibold text-foreground">{c.statuteName}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">
                        Max Statutory Liability:
                      </span>
                      <span
                        className={`font-semibold ${c.passed ? "text-muted-foreground" : "text-amber-400"}`}
                      >
                        {c.maxPenalty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action */}
                {!c.passed && onOpenRemediationModal && (
                  <div className="mt-4 pt-2 flex items-center justify-between">
                    <span className="text-[10.5px] text-muted-foreground">
                      Remediation available for {c.country}
                    </span>
                    <button
                      type="button"
                      onClick={onOpenRemediationModal}
                      className="text-[11px] font-mono text-primary hover:text-primary/80 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      Unlock Legal Patch
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-xs font-mono">
          No countries found matching "{searchQuery}".
        </div>
      )}
    </div>
  );
}
