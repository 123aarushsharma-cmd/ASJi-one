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
  RotateCcw,
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
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-7 relative overflow-hidden">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#262932] pb-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap text-xs font-mono">
            <span className="inline-flex items-center gap-1.5 text-[#C9A227] uppercase tracking-wider font-semibold">
              <Globe2 className="h-3.5 w-3.5" />
              Sovereign Jurisdictions Analysis
            </span>
            <span aria-hidden="true" className="text-[#52525B]">
              ·
            </span>
            <span className="text-[#A1A1AA]">
              Target Domain: <strong className="text-[#F4F4F5]">{report.target}</strong>
            </span>
          </div>
          <h2 className="mt-2 font-display text-xl sm:text-2xl font-bold text-[#F4F4F5]">
            Country-by-Country Legal Pass vs. Fail Audit
          </h2>
          <p className="text-xs text-[#A1A1AA] mt-1 max-w-2xl leading-relaxed">
            Statutory legal determination evaluating whether this domain complies with or violates
            each sovereign nation&apos;s enacted privacy and cyber statutes.
          </p>
        </div>

        {/* Global Verdict Ratio Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setFilterMode("PASS")}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 sm:px-3.5 sm:py-2 transition-colors cursor-pointer text-xs tabular-nums ${
              filterMode === "PASS"
                ? "border-[#10B981] bg-[#10B981]/15 text-[#10B981] font-bold"
                : "border-[#262932] bg-[#0D0E11] text-[#10B981] hover:border-[#10B981]/60"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{passedCountries.length} PASS</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterMode("FAIL")}
            className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 sm:px-3.5 sm:py-2 transition-colors cursor-pointer text-xs tabular-nums ${
              filterMode === "FAIL"
                ? "border-[#EF4444] bg-[#EF4444]/15 text-[#EF4444] font-bold"
                : "border-[#262932] bg-[#0D0E11] text-[#EF4444] hover:border-[#EF4444]/60"
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>{failedCountries.length} FAIL</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center rounded-md border border-[#262932] bg-[#0D0E11] p-1 font-mono text-xs overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setFilterMode("ALL")}
            className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer shrink-0 whitespace-nowrap tabular-nums ${
              filterMode === "ALL"
                ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                : "text-[#A1A1AA] hover:text-[#F4F4F5]"
            }`}
          >
            All Nations ({countryVerdicts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("PASS")}
            className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap tabular-nums ${
              filterMode === "PASS"
                ? "bg-[#10B981] text-[#0D0E11] font-bold"
                : "text-[#10B981] hover:bg-[#10B981]/10"
            }`}
          >
            <CheckCircle2 className="h-3 w-3" />
            Passing ({passedCountries.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("FAIL")}
            className={`px-3 py-1.5 rounded-sm transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 whitespace-nowrap tabular-nums ${
              filterMode === "FAIL"
                ? "bg-[#EF4444] text-white font-bold"
                : "text-[#EF4444] hover:bg-[#EF4444]/10"
            }`}
          >
            <XCircle className="h-3 w-3" />
            Failing ({failedCountries.length})
          </button>
        </div>

        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#71717A]" />
          <input
            type="text"
            placeholder="Search country or statute..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-[#262932] bg-[#0D0E11] pl-9 pr-3 py-1.5 text-xs text-[#F4F4F5] placeholder:text-[#71717A] focus:border-[#C9A227] focus:outline-none font-sans"
          />
        </div>
      </div>

      {/* Grid of Country Verdicts with Stagger and 3D Flip */}
      <motion.div
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.035, delayChildren: 0.02 },
          },
        }}
        initial="hidden"
        animate="show"
        className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 flip-card-container"
      >
        <AnimatePresence mode="popLayout">
          {filteredList.map((c) => {
            const isFlipped = !!flippedCards[c.id];
            const isoCode = `[${c.flag.replace(/[[\]\s]/g, "").toUpperCase()}]`;

            return (
              <motion.div
                key={c.id}
                layout
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                  },
                }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
                className={`relative rounded-md border p-4 sm:p-5 transition-colors duration-200 flex flex-col justify-between cursor-pointer bg-[#0D0E11] ${
                  c.passed
                    ? "border-[#262932] hover:border-[#10B981]/60"
                    : "border-[#262932] hover:border-[#EF4444]/60"
                }`}
                onClick={() => toggleFlip(c.id)}
              >
                {/* 3D Animated Flip Container */}
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformStyle: "preserve-3d" }}
                  className="w-full flex-1 flex flex-col justify-between"
                >
                  {!isFlipped ? (
                    /* Front Face: Executive Statutory Verdict */
                    <div style={{ backfaceVisibility: "hidden" }} className="w-full">
                      {/* Top Header: ISO Code + Country + Verdict Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                        <div className="flex items-start gap-2.5">
                          <span
                            className="inline-flex shrink-0 items-center justify-center rounded border border-[#262932] bg-[#15171C] px-2 py-1 font-mono text-xs font-bold text-[#C9A227]"
                            aria-label={c.country}
                          >
                            {isoCode}
                          </span>
                          <div>
                            <h3 className="font-display font-bold text-base text-[#F4F4F5] flex items-center gap-1.5 flex-wrap">
                              {c.country}
                              <span className="text-[11px] font-mono font-normal text-[#71717A]">
                                ({c.region})
                              </span>
                            </h3>
                            <p className="text-[11px] font-mono text-[#C9A227] mt-0.5">
                              {c.statuteName}
                            </p>
                          </div>
                        </div>

                        {/* Statutory Verdict Badge */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          <span
                            className={`shrink-0 rounded border px-2 py-1 text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1 whitespace-nowrap ${
                              c.passed
                                ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]"
                                : "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]"
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

                          <button
                            type="button"
                            onClick={(e) => toggleFlip(c.id, e)}
                            className="rounded border border-[#262932] bg-[#15171C] p-1.5 text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227] cursor-pointer transition-colors"
                            title="Flip card for statute citations"
                            aria-label="Flip card for statute citations"
                          >
                            <RotateCcw className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Primary Reason for Pass or Fail */}
                      <div className="mt-3.5 rounded-md border border-[#262932] bg-[#15171C] p-3 text-xs leading-relaxed">
                        <div className="flex items-start gap-2">
                          {c.passed ? (
                            <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                          ) : (
                            <ShieldAlert className="h-4 w-4 text-[#EF4444] shrink-0 mt-0.5" />
                          )}
                          <div>
                            <strong className="block font-semibold text-[#F4F4F5] mb-0.5">
                              {c.passed
                                ? "Why it Passes in this Jurisdiction:"
                                : "Why it Fails under National Law:"}
                            </strong>
                            <span className="text-[11.5px] text-[#A1A1AA]">
                              {c.passed ? c.passJustification : c.primaryViolation}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Violated Articles (if failed) */}
                      {!c.passed && c.violatedArticles && c.violatedArticles.length > 0 && (
                        <div className="mt-3">
                          <span className="text-[10px] font-mono text-[#EF4444] font-semibold block uppercase tracking-wider mb-1">
                            Statutory Sections in Breach:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {c.violatedArticles.map((art, idx) => (
                              <span
                                key={idx}
                                className="rounded border border-[#262932] bg-[#15171C] px-2 py-0.5 text-[10.5px] font-mono text-[#F4F4F5]"
                              >
                                {art}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Authority & Fine Cap */}
                      <div className="mt-3.5 pt-3 border-t border-[#262932] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
                        <div>
                          <span className="text-[#71717A] block text-[10px]">
                            Statutory Framework:
                          </span>
                          <span className="font-semibold text-[#F4F4F5]">{c.statuteName}</span>
                        </div>
                        <div>
                          <span className="text-[#71717A] block text-[10px]">
                            Max Statutory Liability:
                          </span>
                          <span
                            className={`font-semibold ${c.passed ? "text-[#A1A1AA]" : "text-[#F59E0B]"}`}
                          >
                            {c.maxPenalty}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Back Face: Legal Authority, Citation & Scope (Flipped) */
                    <div
                      style={{
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden",
                      }}
                      className="w-full flex flex-col justify-between py-1 font-mono text-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between border-b border-[#262932] pb-2">
                          <span className="text-[#C9A227] font-bold text-xs flex items-center gap-1.5">
                            <Scale className="h-3.5 w-3.5" />
                            {isoCode} {c.country} Statutory Dossier
                          </span>
                          <button
                            type="button"
                            onClick={(e) => toggleFlip(c.id, e)}
                            className="inline-flex items-center gap-1 text-[10px] text-[#A1A1AA] hover:text-[#F4F4F5] px-2 py-1 rounded border border-[#262932] bg-[#15171C] cursor-pointer"
                          >
                            <RotateCcw className="h-3 w-3" />
                            Flip Back
                          </button>
                        </div>

                        <div className="mt-3 space-y-2.5 text-[11px]">
                          <div>
                            <span className="text-[#71717A] block text-[10px] uppercase">
                              Governing Regulatory Authority:
                            </span>
                            <span className="text-[#F4F4F5] font-bold">{c.governingBody}</span>
                          </div>

                          <div>
                            <span className="text-[#71717A] block text-[10px] uppercase">
                              Territorial Extraterritoriality Scope:
                            </span>
                            <span className="text-[#F4F4F5] font-medium">
                              Applies to all inbound digital services targeting {c.country}{" "}
                              residents.
                            </span>
                          </div>

                          <div>
                            <span className="text-[#71717A] block text-[10px] uppercase">
                              Statutory Audit Classification:
                            </span>
                            <span
                              className={`font-semibold ${c.passed ? "text-[#10B981]" : "text-[#EF4444]"}`}
                            >
                              {c.passed
                                ? "Full Statutory Clearance Verified"
                                : "Active Statutory Breach Detected"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#262932] flex items-center justify-between text-[10px]">
                        <span className="text-[#71717A]">Click to return to summary</span>
                        <span className="text-[#C9A227] font-semibold">
                          ASJi Statutory Intelligence
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Bottom Action */}
                {!c.passed && onOpenRemediationModal && (
                  <div className="mt-4 pt-2.5 flex items-center justify-between border-t border-[#262932]">
                    <span className="text-[11px] text-[#A1A1AA]">
                      Remediation available for {c.country}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenRemediationModal();
                      }}
                      className="text-[11px] font-mono text-[#C9A227] hover:text-[#DFB842] font-semibold flex items-center gap-1 cursor-pointer"
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
      </motion.div>

      {filteredList.length === 0 && (
        <div className="text-center py-12 text-[#71717A] text-xs font-mono">
          No jurisdictions found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      )}
    </div>
  );
}
