import React, { useState, useMemo, useEffect } from "react";
import { motion } from "motion/react";
import {
  Search,
  Globe,
  Shield,
  Scale,
  Building2,
  AlertTriangle,
  Clock,
  UserCheck,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Database,
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import { fetchWorldLaws, seedWorldLawsToFirestore } from "@/lib/firestore-service";
import { WORLD_LAWS_DATA, type WorldLaw } from "@/lib/world-laws-data";
import { SpecularCard } from "./SpecularCard";

const WORLD_LAW_TO_FRAMEWORK_ID: Record<string, string> = {
  "india-dpdp": "ind-dpdp",
  "eu-gdpr": "eu-gdpr",
  "uk-gdpr": "uk-duaa",
  "us-cpra": "us-cpra",
  "uae-pdpl": "uae-pdpl",
  "saudi-arabia-pdpl": "ksa-pdpl",
  "singapore-pdpa": "sg-pdpa",
  "brazil-lgpd": "brazil-lgpd",
  "canada-pipeda": "canada-pipeda",
  "australia-privacy-act": "aus-privacy",
  "japan-appi": "jp-appi",
  "korea-pipa": "kr-pipa",
  "switzerland-fadp": "ch-fadp",
  "south-africa-popia": "za-popia",
  "nigeria-ndpa": "ng-ndpa",
};

const FRAMEWORK_ID_TO_WORLD_LAW: Record<string, string> = Object.fromEntries(
  Object.entries(WORLD_LAW_TO_FRAMEWORK_ID).map(([lawId, fwId]) => [fwId, lawId]),
);

const CANONICAL_LAW_BY_ID = new Map(WORLD_LAWS_DATA.map((law) => [law.id, law]));

function normalizeWorldLaws(items: WorldLaw[]): WorldLaw[] {
  const byId = new Map<string, WorldLaw>();

  for (const item of items) {
    const canonical = CANONICAL_LAW_BY_ID.get(item.id);
    if (canonical) {
      byId.set(item.id, {
        ...canonical,
        ...item,
        flag: canonical.flag,
        maxPenalty: item.maxPenalty || canonical.maxPenalty,
      });
    } else {
      byId.set(item.id, item);
    }
  }

  for (const canonical of WORLD_LAWS_DATA) {
    if (!byId.has(canonical.id)) {
      byId.set(canonical.id, canonical);
    }
  }

  const ordered: WorldLaw[] = [];
  for (const canonical of WORLD_LAWS_DATA) {
    const entry = byId.get(canonical.id);
    if (entry) {
      ordered.push(entry);
      byId.delete(canonical.id);
    }
  }
  for (const extra of byId.values()) {
    ordered.push(extra);
  }
  return ordered;
}

interface WorldLawsAtlasProps {
  selectedFramework?: string;
  onSelectFramework?: (frameworkId: string) => void;
}

export function WorldLawsAtlas({ selectedFramework, onSelectFramework }: WorldLawsAtlasProps) {
  const [laws, setLaws] = useState<WorldLaw[]>(WORLD_LAWS_DATA);
  const [selectedLawId, setSelectedLawId] = useState<string>(
    (selectedFramework && FRAMEWORK_ID_TO_WORLD_LAW[selectedFramework]) || "india-dpdp",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchWorldLaws();
      if (data && data.length > 0) {
        setLaws(normalizeWorldLaws(data));
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFramework && FRAMEWORK_ID_TO_WORLD_LAW[selectedFramework]) {
      setSelectedLawId(FRAMEWORK_ID_TO_WORLD_LAW[selectedFramework]);
    }
  }, [selectedFramework]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await seedWorldLawsToFirestore();
    const updated = await fetchWorldLaws();
    setLaws(normalizeWorldLaws(updated));
    setIsSyncing(false);
  };

  const handleSelectJurisdiction = (law: WorldLaw) => {
    setSelectedLawId(law.id);
    const frameworkId = WORLD_LAW_TO_FRAMEWORK_ID[law.id];
    if (frameworkId && onSelectFramework) {
      onSelectFramework(frameworkId);
    }
  };

  const filteredLaws = useMemo(() => {
    return laws.filter((l) => {
      const matchesRegion = selectedRegion === "ALL" || l.region === selectedRegion;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRegion;
      const matchesSearch =
        l.country.toLowerCase().includes(q) ||
        l.lawName.toLowerCase().includes(q) ||
        l.acronym.toLowerCase().includes(q) ||
        l.governingBody.toLowerCase().includes(q) ||
        l.maxPenalty.toLowerCase().includes(q) ||
        l.corePrinciples.some((p) => p.toLowerCase().includes(q)) ||
        l.keyArticles.some(
          (a) => a.topic.toLowerCase().includes(q) || a.mandate.toLowerCase().includes(q),
        );
      return matchesRegion && matchesSearch;
    });
  }, [laws, selectedRegion, searchQuery]);

  const activeLaw = laws.find((l) => l.id === selectedLawId) || filteredLaws[0] || laws[0];
  const activeFrameworkId = WORLD_LAW_TO_FRAMEWORK_ID[activeLaw.id];
  const isSyncedWithScanner = selectedFramework === activeFrameworkId;

  const regions = [
    { label: "All 15", value: "ALL" },
    { label: "India & Asia-Pacific", value: "Asia-Pacific" },
    { label: "Europe & UK", value: "Europe & UK" },
    { label: "Americas", value: "Americas" },
    { label: "Middle East", value: "Middle East" },
    { label: "Africa", value: "Africa" },
  ];

  const formatBreachTimeline = (hours: WorldLaw["breachNotificationHours"]) =>
    typeof hours === "number" ? `${hours} Hours Maximum` : hours;

  return (
    <section
      id="laws-atlas"
      className="surface-panel my-16 scroll-mt-8 rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8 md:p-10"
    >
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 border-b border-[#262932] pb-6 lg:flex-row lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-wider text-[#C9A227] uppercase">
            <Globe className="h-4 w-4" />
            <span>Master Jurisdiction Directory · 15 Sovereign Statutes</span>
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAF8F5] sm:text-3xl lg:text-4xl">
            Sovereign Privacy &amp; Regulatory Atlas
          </h2>
          <p className="mt-1.5 font-sans text-xs sm:text-sm text-muted-foreground max-w-3xl">
            Select any sovereign mandate below to immediately set the active audit standard in the
            domain scanner and inspect its regulator, statutory articles, breach timeline, and
            maximum fine ceiling.
          </p>
        </div>

        {/* Repository Sync Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-md border border-[#C9A227]/40 bg-[#0D0E11] px-4 py-2 font-mono text-xs font-bold text-[#C9A227] hover:border-[#C9A227] hover:bg-[#C9A227]/10 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Database className="h-3.5 w-3.5" />
            <span>{isSyncing ? "Syncing Repository..." : "Sync Statutory Repository"}</span>
          </button>
        </div>
      </div>

      {/* Region Filter Tabs & Search */}
      <div className="mt-6 flex flex-col gap-4 border-b border-[#262932] pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div
          className="flex flex-wrap items-center gap-2"
          role="tablist"
          aria-label="Filter jurisdictions by region"
        >
          {regions.map((reg) => {
            const isTabActive = selectedRegion === reg.value;
            return (
              <button
                key={reg.value}
                type="button"
                role="tab"
                aria-selected={isTabActive}
                onClick={() => setSelectedRegion(reg.value)}
                className={`relative rounded-md px-3.5 py-1.5 font-mono text-xs font-semibold transition-colors cursor-pointer ${
                  isTabActive
                    ? "text-[#0D0E11]"
                    : "border border-[#262932] bg-[#0D0E11] text-muted-foreground hover:border-[#C9A227]/50 hover:text-foreground"
                }`}
              >
                {isTabActive && (
                  <motion.span
                    layoutId="atlasRegionTab"
                    transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 rounded-md bg-[#C9A227] border border-[#C9A227]"
                  />
                )}
                <span className="relative z-10">{reg.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#C9A227]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search country, law, regulator, penalty..."
            className="w-full rounded-md border border-[#262932] bg-[#0D0E11] py-2 pr-14 pl-9 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 outline-none transition-colors focus:border-[#C9A227]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 font-mono text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Unified Master Jurisdiction Card Grid */}
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
          <span className="text-[#C9A227] uppercase tracking-wider">
            Select Jurisdiction ({filteredLaws.length} of {laws.length})
          </span>
          <span className="text-muted-foreground">
            Click a card to activate in Domain Scanner &amp; view brief below
          </span>
        </div>

        {filteredLaws.length === 0 ? (
          <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-8 text-center">
            <Scale className="mx-auto h-7 w-7 text-[#C9A227]" />
            <p className="mt-2 font-mono text-xs text-muted-foreground">
              No sovereign jurisdictions matched &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedRegion("ALL");
              }}
              className="mt-3 rounded-md border border-[#C9A227]/40 bg-[#15171C] px-3 py-1.5 font-mono text-xs text-[#C9A227] cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLaws.map((law) => {
              const isSelected = law.id === activeLaw.id;
              return (
                <SpecularCard
                  as="button"
                  key={law.id}
                  type="button"
                  onClick={() => handleSelectJurisdiction(law)}
                  className={`group flex flex-col justify-between rounded-md border p-5 text-left cursor-pointer ${
                    isSelected
                      ? "border-[#C9A227] bg-[#0D0E11] ring-1 ring-[#C9A227]"
                      : "border-[#262932] bg-[#0D0E11] hover:border-[#C9A227]/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center justify-center rounded border border-[#262932] bg-[#15171C] px-2 py-0.5 font-mono text-xs font-bold text-[#C9A227] tracking-wider">
                        {law.flag}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400">
                        {law.region}
                      </span>
                    </div>

                    <h3
                      className={`mt-3 font-display text-base font-bold transition-colors ${
                        isSelected ? "text-[#C9A227]" : "text-[#FAF8F5] group-hover:text-[#C9A227]"
                      }`}
                    >
                      {law.country} — {law.acronym}
                    </h3>

                    <p className="mt-1 font-sans text-xs leading-relaxed text-zinc-400">
                      {law.lawName}
                    </p>

                    <p className="mt-2.5 font-sans text-xs text-zinc-400">
                      Regulator: <strong className="text-zinc-200">{law.governingBody}</strong>
                    </p>
                  </div>

                  <div className="mt-4 space-y-2.5 border-t border-[#262932] pt-3 font-mono">
                    <div className="flex items-baseline justify-between gap-2 text-[11px]">
                      <span className="text-zinc-500 uppercase text-[10px] shrink-0">
                        Breach SLA
                      </span>
                      <span className="text-zinc-200 font-semibold text-right">
                        {formatBreachTimeline(law.breachNotificationHours)}
                      </span>
                    </div>

                    <div className="text-[11px] leading-snug">
                      <span className="block text-[10px] uppercase text-zinc-500">
                        Maximum Fine Ceiling
                      </span>
                      <span className="mt-0.5 block font-semibold text-[#EF4444]">
                        {law.maxPenalty}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#262932]/80 pt-2.5 text-[11px]">
                      <span className="inline-flex items-center gap-1.5 font-semibold text-[#C9A227]">
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
                            <span className="text-[#10B981]">Active in Scanner</span>
                          </>
                        ) : (
                          <>
                            <span>Select &amp; Inspect</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </span>
                      <span className="text-[10px] text-zinc-500">{law.status}</span>
                    </div>
                  </div>
                </SpecularCard>
              );
            })}
          </div>
        )}
      </div>

      {/* Selected Jurisdiction Deep Statutory Intelligence Brief (Displayed Below Grid) */}
      <div className="legal-paper mt-8 flex flex-col rounded-md border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-7 text-[#18181B]">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5DEC9] pb-5">
          <div className="flex items-start gap-3">
            <span className="font-mono text-sm font-bold px-2.5 py-1.5 rounded border border-[#E5DEC9] bg-[#F3EFE6] text-[#18181B] shrink-0">
              {activeLaw.flag}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-xl sm:text-2xl font-bold text-[#18181B]">
                  {activeLaw.country} — {activeLaw.acronym}
                </h3>
                <span className="rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-[#065F46]">
                  {activeLaw.status}
                </span>
                {isSyncedWithScanner && (
                  <span className="rounded border border-[#C9A227] bg-[#F3EFE6] px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#9A7812] uppercase">
                    Active Scanner Law
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-[#9A7812] font-semibold mt-1">
                {activeLaw.lawName}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <a
              href={activeLaw.officialPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-md border border-[#E5DEC9] bg-white px-3 py-1.5 font-mono text-xs text-[#18181B] hover:border-[#C9A227] transition-colors"
            >
              <span>Official Regulator</span>
              <ExternalLink className="h-3 w-3 text-[#9A7812]" />
            </a>
            <button
              type="button"
              onClick={() => {
                handleSelectJurisdiction(activeLaw);
                document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="btn-gold inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <span>Scan Under {activeLaw.acronym}</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Exact Regulator, Maximum Fine Ceiling, Breach Timeline & DPO Metrics */}
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-md border border-[#E5DEC9] bg-white p-3.5 font-mono">
            <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] uppercase">
              <Building2 className="h-3 w-3 text-[#9A7812]" />
              <span>Enforcing Regulator</span>
            </div>
            <div className="mt-1 font-bold text-xs text-[#18181B] leading-snug">
              {activeLaw.governingBody}
            </div>
          </div>

          <div className="rounded-md border border-[#E5DEC9] bg-white p-3.5 font-mono">
            <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] uppercase">
              <AlertTriangle className="h-3 w-3 text-[#EF4444]" />
              <span>Maximum Fine Ceiling</span>
            </div>
            <div className="mt-1 font-bold text-xs text-[#B91C1C] leading-snug">
              {activeLaw.maxPenalty}
            </div>
          </div>

          <div className="rounded-md border border-[#E5DEC9] bg-white p-3.5 font-mono">
            <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] uppercase">
              <Clock className="h-3 w-3 text-[#9A7812]" />
              <span>Breach Timeline</span>
            </div>
            <div className="mt-1 font-bold text-xs text-[#18181B] tabular-nums">
              {formatBreachTimeline(activeLaw.breachNotificationHours)}
            </div>
          </div>

          <div className="rounded-md border border-[#E5DEC9] bg-white p-3.5 font-mono">
            <div className="flex items-center gap-1.5 text-[10px] text-[#52525B] uppercase">
              <UserCheck className="h-3 w-3 text-[#10B981]" />
              <span>DPO &amp; Minor Age</span>
            </div>
            <div className="mt-1 font-bold text-xs text-[#18181B] leading-snug">
              {activeLaw.dpoMandatory ? "Mandatory Officer" : "Contextual Officer"} ·{" "}
              {typeof activeLaw.childrenAgeThreshold === "number"
                ? `Under ${activeLaw.childrenAgeThreshold} Yrs`
                : activeLaw.childrenAgeThreshold}
            </div>
          </div>
        </div>

        {/* Statutory Summary */}
        <div className="mt-4 rounded-md border border-[#E5DEC9] bg-[#F3EFE6] p-4 font-sans text-xs sm:text-sm text-[#18181B] leading-relaxed">
          <span className="font-mono font-bold text-[#9A7812] block mb-1 uppercase text-[10px]">
            Statutory Architecture &amp; Extraterritorial Application:
          </span>
          {activeLaw.statutorySummary}
        </div>

        {/* Key Articles & Core Principles */}
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h4 className="font-mono text-xs font-bold text-[#9A7812] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              Key Statutory Articles &amp; Legal Mandates
            </h4>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {activeLaw.keyArticles.map((article, aIdx) => (
                <div
                  key={aIdx}
                  className="rounded-md border border-[#E5DEC9] bg-white p-3.5 font-sans text-xs"
                >
                  <div className="flex items-center justify-between gap-2 font-mono text-[#9A7812] font-bold pb-1.5 border-b border-[#E5DEC9]">
                    <span>{article.number}</span>
                    <span className="text-[10px] uppercase text-[#52525B] text-right">
                      {article.topic}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#52525B] leading-relaxed">{article.mandate}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <h4 className="font-mono text-xs font-bold text-[#9A7812] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-[#10B981]" />
              Core Sovereign Principles
            </h4>
            <ul className="space-y-2 font-sans text-xs text-[#18181B]">
              {activeLaw.corePrinciples.map((principle, pIdx) => (
                <li
                  key={pIdx}
                  className="flex items-start gap-2 bg-white p-3 rounded border border-[#E5DEC9]"
                >
                  <ChevronRight className="h-3.5 w-3.5 text-[#9A7812] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{principle}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5DEC9] pt-4 font-mono text-[10px] text-[#52525B]">
          <span className="flex items-center gap-1.5">
            <Shield className="h-3 w-3 text-[#9A7812]" />
            Statutory Framework: {activeLaw.lawName} ({activeLaw.acronym})
          </span>
          <span className="text-[#9A7812] font-semibold">
            Synced to Compliance Repository · Verified Statutory Standard
          </span>
        </div>
      </div>
    </section>
  );
}
