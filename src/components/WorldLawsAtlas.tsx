import React, { useState, useMemo, useEffect } from "react";
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
  Filter,
  Sparkles,
  Database,
  ArrowUpDown,
} from "lucide-react";
import { fetchWorldLaws, seedWorldLawsToFirestore } from "@/lib/firestore-service";
import { WORLD_LAWS_DATA, type WorldLaw } from "@/lib/world-laws-data";

export function WorldLawsAtlas() {
  const [laws, setLaws] = useState<WorldLaw[]>(WORLD_LAWS_DATA);
  const [selectedLawId, setSelectedLawId] = useState<string>("india-dpdp");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState<string>("ALL");
  const [filterDpo, setFilterDpo] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    async function loadData() {
      const data = await fetchWorldLaws();
      if (data && data.length > 0) {
        setLaws(data);
      }
    }
    loadData();
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await seedWorldLawsToFirestore();
    const updated = await fetchWorldLaws();
    setLaws(updated);
    setIsSyncing(false);
  };

  const filteredLaws = useMemo(() => {
    return laws.filter((l) => {
      const matchesRegion = selectedRegion === "ALL" || l.region === selectedRegion;
      const matchesDpo = filterDpo === null || l.dpoMandatory === filterDpo;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesRegion && matchesDpo;
      const matchesSearch =
        l.country.toLowerCase().includes(q) ||
        l.lawName.toLowerCase().includes(q) ||
        l.acronym.toLowerCase().includes(q) ||
        l.governingBody.toLowerCase().includes(q) ||
        l.corePrinciples.some((p) => p.toLowerCase().includes(q)) ||
        l.keyArticles.some(
          (a) => a.topic.toLowerCase().includes(q) || a.mandate.toLowerCase().includes(q),
        );
      return matchesRegion && matchesDpo && matchesSearch;
    });
  }, [laws, selectedRegion, filterDpo, searchQuery]);

  const activeLaw = laws.find((l) => l.id === selectedLawId) || filteredLaws[0] || laws[0];

  const regions = [
    { label: "All World Laws (14+)", value: "ALL" },
    { label: "Asia-Pacific", value: "Asia-Pacific" },
    { label: "Middle East", value: "Middle East" },
    { label: "Europe & UK", value: "Europe & UK" },
    { label: "Americas", value: "Americas" },
    { label: "Africa", value: "Africa" },
  ];

  return (
    <section
      id="world-laws-database"
      className="relative my-16 rounded-3xl border p-6 shadow-2xl transition-all sm:p-8 md:p-10"
      style={{
        backgroundColor: "#0a0a0a",
        borderColor: "rgba(212, 175, 55, 0.3)",
        backdropFilter: "blur(30px)",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.9), 0 0 35px rgba(212, 175, 55, 0.08)",
      }}
    >
      {/* Background Glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 h-96 w-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full bg-[#D4AF37]/5 blur-3xl" />

      {/* Header */}
      <div className="relative z-10 flex flex-col items-start justify-between gap-4 border-b border-[#D4AF37]/20 pb-6 lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-[#D4AF37] uppercase">
            <Globe className="h-4 w-4" />
            <span>0.001% Elite Sovereign Standard // Firebase Synced</span>
          </div>
          <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
            World Sovereign Data Protection Laws Atlas &amp; Repository
          </h2>
          <p className="mt-1.5 font-mono text-xs text-[#E5E5E5]/75 max-w-3xl">
            Complete international statutory database across 14+ sovereign legal systems. Fully
            integrated into Firebase Firestore for verified, zero-hallucination compliance queries.
          </p>
        </div>

        {/* Database Status Controller */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-xl border border-[#D4AF37]/40 bg-black/80 px-4 py-2 font-mono text-xs font-bold text-[#D4AF37] hover:border-[#D4AF37] hover:bg-[#D4AF37]/15 transition-all shadow-md disabled:opacity-50"
          >
            <Database className="h-3.5 w-3.5" />
            <span>{isSyncing ? "Syncing Firestore..." : "Sync Firebase DB"}</span>
          </button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="relative z-10 mt-6 flex flex-col gap-4 border-b border-white/10 pb-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Region Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {regions.map((reg) => (
            <button
              key={reg.value}
              onClick={() => setSelectedRegion(reg.value)}
              className={`rounded-xl px-3.5 py-1.5 font-mono text-xs font-semibold transition-all ${
                selectedRegion === reg.value
                  ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/25"
                  : "border border-white/10 bg-white/5 text-[#E5E5E5]/70 hover:border-[#D4AF37]/40 hover:text-white"
              }`}
            >
              {reg.label}
            </button>
          ))}
        </div>

        {/* Search & DPO Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[260px]">
            <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-[#D4AF37]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search laws, articles, regulators, fines..."
              className="w-full rounded-xl border border-[#D4AF37]/30 bg-black/70 py-2 pr-3 pl-9 font-mono text-xs text-white placeholder-[#E5E5E5]/40 outline-none transition-colors focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Law Cards + Deep Statutory Inspector */}
      <div className="relative z-10 mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: List of All World Laws */}
        <div className="flex flex-col gap-3 lg:col-span-4">
          <div className="flex items-center justify-between font-mono text-[11px] text-[#D4AF37]">
            <span>SOVEREIGN JURISDICTIONS ({filteredLaws.length})</span>
            <span className="text-[#E5E5E5]/50">Global Coverage</span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[660px] overflow-y-auto pr-1">
            {filteredLaws.map((law) => {
              const isSelected = law.id === activeLaw.id;
              return (
                <button
                  key={law.id}
                  onClick={() => setSelectedLawId(law.id)}
                  className={`group relative flex flex-col items-start rounded-2xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-[#D4AF37] bg-black shadow-xl shadow-[#D4AF37]/15 ring-1 ring-[#D4AF37]/50"
                      : "border-white/10 bg-black/40 hover:border-[#D4AF37]/40 hover:bg-black/80"
                  }`}
                >
                  <div className="flex w-full items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{law.flag}</span>
                      <span className="font-display font-bold text-sm text-white group-hover:text-[#D4AF37] transition-colors">
                        {law.country}
                      </span>
                    </div>
                    <span className="rounded-md border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#D4AF37]">
                      {law.acronym}
                    </span>
                  </div>

                  <p className="mt-2 line-clamp-1 font-mono text-[11px] text-[#E5E5E5]/70">
                    {law.lawName}
                  </p>

                  <div className="mt-3 flex w-full items-center justify-between border-t border-white/5 pt-2 font-mono text-[9.5px] text-[#E5E5E5]/50">
                    <span className="text-[#D4AF37]/80 truncate max-w-[150px]">
                      {law.governingBody.split("/")[0]}
                    </span>
                    <span className="text-red-400 font-semibold">{law.region}</span>
                  </div>

                  {isSelected && (
                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Deep Statutory Intelligence Dossier */}
        <div className="relative flex flex-col rounded-2xl border border-[#D4AF37]/30 bg-black/90 p-6 shadow-inner backdrop-blur-2xl lg:col-span-8">
          {/* Header of Active Law */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#D4AF37]/20 pb-5">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeLaw.flag}</span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-display text-xl font-bold text-white">
                    {activeLaw.country} — {activeLaw.acronym}
                  </h3>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-400">
                    {activeLaw.status}
                  </span>
                </div>
                <p className="font-mono text-xs text-[#D4AF37] mt-0.5">{activeLaw.lawName}</p>
              </div>
            </div>

            <a
              href={activeLaw.officialPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-xs text-[#E5E5E5] hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors"
            >
              <span>Official Regulator</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Key Statutory Matrix Metrics */}
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/10 bg-[#121212] p-3.5 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-[#E5E5E5]/50 uppercase">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span>Statutory Penalty Ceiling</span>
              </div>
              <div className="mt-1 font-bold text-xs text-red-400 leading-tight">
                {activeLaw.maxPenalty}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#121212] p-3.5 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-[#E5E5E5]/50 uppercase">
                <Clock className="h-3 w-3 text-[#D4AF37]" />
                <span>Breach Reporting Rule</span>
              </div>
              <div className="mt-1 font-bold text-xs text-white">
                {typeof activeLaw.breachNotificationHours === "number"
                  ? `${activeLaw.breachNotificationHours} Hours Maximum`
                  : activeLaw.breachNotificationHours}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#121212] p-3.5 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-[#E5E5E5]/50 uppercase">
                <UserCheck className="h-3 w-3 text-emerald-400" />
                <span>DPO / Encarregado</span>
              </div>
              <div className="mt-1 font-bold text-xs text-white">
                {activeLaw.dpoMandatory ? "Mandatory Officer" : "Contextual / Voluntary"}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#121212] p-3.5 font-mono">
              <div className="flex items-center gap-1.5 text-[10px] text-[#E5E5E5]/50 uppercase">
                <Shield className="h-3 w-3 text-blue-400" />
                <span>Child Data Age</span>
              </div>
              <div className="mt-1 font-bold text-xs text-white">
                {typeof activeLaw.childrenAgeThreshold === "number"
                  ? `Under ${activeLaw.childrenAgeThreshold} Years`
                  : activeLaw.childrenAgeThreshold}
              </div>
            </div>
          </div>

          {/* Statutory Summary */}
          <div className="mt-4 rounded-xl border border-[#D4AF37]/20 bg-[#141414] p-4 font-mono text-xs text-[#E5E5E5]/80 leading-relaxed">
            <span className="font-bold text-[#D4AF37] block mb-1 uppercase text-[10px]">
              Statutory Architecture &amp; Extraterritorial Application:
            </span>
            {activeLaw.statutorySummary}
          </div>

          {/* Core Principles & Key Articles */}
          <div className="mt-5 space-y-4 max-h-[380px] overflow-y-auto pr-1">
            <div>
              <h4 className="font-mono text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                Key Statutory Articles &amp; Legal Mandates:
              </h4>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {activeLaw.keyArticles.map((article, aIdx) => (
                  <div
                    key={aIdx}
                    className="rounded-xl border border-white/10 bg-[#0d0d0d] p-3 font-mono text-xs"
                  >
                    <div className="flex items-center justify-between text-[#D4AF37] font-bold pb-1 border-b border-white/5">
                      <span>{article.number}</span>
                      <span className="text-[10px] uppercase text-[#E5E5E5]/60">
                        {article.topic}
                      </span>
                    </div>
                    <p className="mt-2 text-[11px] text-[#E5E5E5]/75 leading-relaxed">
                      {article.mandate}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-mono text-xs font-bold text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Core Sovereign Principles:
              </h4>
              <ul className="space-y-1.5 font-mono text-xs text-[#E5E5E5]/80">
                {activeLaw.corePrinciples.map((principle, pIdx) => (
                  <li
                    key={pIdx}
                    className="flex items-start gap-2 bg-[#121212] p-2.5 rounded-lg border border-white/5"
                  >
                    <span className="text-[#D4AF37] font-bold">›</span>
                    <span>{principle}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-4 font-mono text-[10px] text-[#E5E5E5]/50">
            <span className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3 text-[#D4AF37]" />
              Supervisory Authority: {activeLaw.governingBody}
            </span>
            <span className="text-[#D4AF37]">
              Synced to Firebase Database // 0.001% Elite Precision Standard
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
