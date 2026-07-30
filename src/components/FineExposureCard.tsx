import { useMemo, useState } from "react";
import { AlertTriangle, Building2, ChevronDown, Scale, ShieldAlert, Zap } from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";

interface FineExposureCardProps {
  report: AuditReport;
}

type CurrencyRegion = "IN" | "USD" | "EUR";

function detectIsIndiaTarget(target: string, originCountry?: string): boolean {
  if (!target) return false;
  const clean = target.toLowerCase().trim();
  const hasInDomain =
    /\.(in|co\.in|gov\.in|edu\.in|org\.in|net\.in|res\.in|ac\.in)($|\/|\?|:)/i.test(clean) ||
    clean.endsWith(".in") ||
    clean.endsWith(".co.in");
  const isIndiaCountry = originCountry ? /india|\bin\b/i.test(originCountry) : false;
  return hasInDomain || isIndiaCountry;
}

export function FineExposureCard({ report }: FineExposureCardProps) {
  const isAutoIndia = useMemo(
    () => detectIsIndiaTarget(report.target, report.originCountry),
    [report.target, report.originCountry],
  );

  const [selectedRegion, setSelectedRegion] = useState<CurrencyRegion>(() =>
    isAutoIndia ? "IN" : "USD",
  );

  // Analyze leaks for DPDP 2023 statutory mapping
  const dpdpMapping = useMemo(() => {
    const leaks = report.criticalLeaks || [];
    const evidenceText = (report.evidence || []).join(" ").toLowerCase();
    const summaryText = (report.summary || "").toLowerCase();

    // 1. Critical data leak or unencrypted personal data transmission
    const isUnencryptedOrLeak =
      leaks.some(
        (l) =>
          l.severity === "critical" ||
          /leak|unencrypted|tls|http\b|ssl|password|token|pii|transmission|database|exposure|plain/i.test(
            l.title + " " + l.detail,
          ),
      ) ||
      /unencrypted|no-https|http\b|leak|token|password/i.test(evidenceText + " " + summaryText) ||
      report.score < 65;

    // 2. Failure to notify a data breach
    const isBreachNotifyFailure =
      leaks.some((l) =>
        /notify|breach|incident|disclosure|report|log|telemetry|unnotified/i.test(
          l.title + " " + l.detail,
        ),
      ) ||
      /breach|notification|incident|disclose/i.test(evidenceText + " " + summaryText) ||
      report.score < 55;

    // 3. Children's data or sensitive profiling without verifiable consent
    const isChildrenOrProfiling =
      leaks.some((l) =>
        /child|children|minor|profiling|tracking|cookie|adtech|behavioral|pixel|third-party|consent/i.test(
          l.title + " " + l.detail,
        ),
      ) ||
      /child|minor|profiling|tracker|analytics|pixel|google analytics|facebook/i.test(
        evidenceText + " " + summaryText,
      ) ||
      report.score < 75;

    let maxTotalCrores = 50;
    if (isUnencryptedOrLeak) maxTotalCrores = 250;
    else if (isBreachNotifyFailure) maxTotalCrores = 200;
    else if (isChildrenOrProfiling) maxTotalCrores = 150;

    return {
      isUnencryptedOrLeak,
      isBreachNotifyFailure,
      isChildrenOrProfiling,
      maxTotalCrores,
    };
  }, [report]);

  const isIndiaMode = selectedRegion === "IN";

  return (
    <div className="surface-panel relative overflow-hidden rounded-2xl p-6 sm:p-8">
      {/* Top Header Row with Region/Currency Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/15 text-primary">
            <Scale className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl text-gold-gradient">
                {isIndiaMode
                  ? "Statutory Fine Exposure (DPDP Act 2023)"
                  : "Estimated Fine Exposure"}
              </h3>
              {isAutoIndia && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  .IN Jurisdiction
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isIndiaMode
                ? "Mapped directly under the Digital Personal Data Protection Act, 2023 (Section 33 & Schedule 1)"
                : "Calculated exposure based on global regulatory penalty frameworks"}
            </p>
          </div>
        </div>

        {/* Currency / Country Toggle Dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="currency-region-select"
            className="text-xs font-medium text-muted-foreground"
          >
            Jurisdiction:
          </label>
          <div className="relative">
            <select
              id="currency-region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as CurrencyRegion)}
              className="cursor-pointer appearance-none rounded-xl border border-primary/40 bg-black/80 px-3.5 py-2 pr-8 text-xs font-semibold text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="IN">🇮🇳 India — DPDP Act 2023 (₹ INR)</option>
              <option value="USD">🌐 Global / USA ($ USD)</option>
              <option value="EUR">🇪🇺 EU — GDPR (€ EUR)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="gold-rule my-5" />

      {/* INDIA DPDP ACT 2023 MODE */}
      {isIndiaMode ? (
        <div className="space-y-6">
          {/* Refined Executive Banner */}
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-300">
                STATUTORY LIABILITY EXPOSURE
              </span>
              <span className="font-sans font-medium text-[11px] text-muted-foreground">
                Data Protection Board of India (DPBI)
              </span>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Maximum Statutory Penalty Cap
                </p>
                <p className="mt-1 font-display text-4xl font-extrabold tracking-tight text-amber-400 sm:text-5xl">
                  Up to ₹{dpdpMapping.maxTotalCrores} Crores
                </p>
              </div>
              <div className="text-right sm:self-end">
                <p className="font-sans font-semibold text-xs text-muted-foreground">
                  Approx. ${(dpdpMapping.maxTotalCrores * 1.2).toFixed(1)} Million USD
                </p>
                <p className="text-[10px] text-muted-foreground/80">
                  Per violation instance under DPDP Schedule 1
                </p>
              </div>
            </div>

            <p className="mt-3 border-t border-border/50 pt-3 text-xs leading-relaxed text-muted-foreground">
              The Digital Personal Data Protection (DPDP) Act 2023 empowers the Data Protection
              Board of India to impose direct monetary penalties up to ₹250 Crores per adjudication.
            </p>
          </div>

          {/* Statutory Mapping Schedule Cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                DPDP Act 2023 Schedule 1 Violation Mappings
              </h4>
              <span className="font-sans font-medium text-[11px] text-muted-foreground">
                Section 33(1) Penalty Matrix
              </span>
            </div>

            <div className="grid gap-3.5">
              {/* Rule 1: Security Safeguard Failure -> Up to ₹250 Crores */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  dpdpMapping.isUnencryptedOrLeak
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-border/60 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Section 33(1) · Schedule 1 (Item 1)
                      </span>
                      {dpdpMapping.isUnencryptedOrLeak && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Zap className="h-3 w-3" /> MATCHED IN AUDIT
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      Failure to take reasonable security safeguards to prevent personal data breach
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-display text-lg font-extrabold text-amber-400">
                      Up to ₹250 Crores
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 rounded-lg border border-border/50 bg-black/60 p-2.5">
                  <p className="font-sans text-xs font-bold text-amber-300">
                    Potential Penalty: Up to ₹250 Crores (Section 33(1))
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {dpdpMapping.isUnencryptedOrLeak
                      ? "Triggered by detected unencrypted personal data transmission, critical infrastructure leaks, or lack of essential security controls."
                      : "Applicable if critical data leaks, unencrypted PII forms, or missing SSL/TLS security controls are present."}
                  </p>
                </div>
              </div>

              {/* Rule 2: Failure to notify data breach -> Up to ₹200 Crores */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  dpdpMapping.isBreachNotifyFailure
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-border/60 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Section 33(1) · Schedule 1 (Item 2)
                      </span>
                      {dpdpMapping.isBreachNotifyFailure && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Zap className="h-3 w-3" /> MATCHED IN AUDIT
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      Failure to notify Data Protection Board &amp; affected Data Principals of a
                      personal data breach
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-display text-lg font-extrabold text-amber-400">
                      Up to ₹200 Crores
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 rounded-lg border border-border/50 bg-black/60 p-2.5">
                  <p className="font-sans text-xs font-bold text-amber-300">
                    Potential Penalty: Up to ₹200 Crores
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {dpdpMapping.isBreachNotifyFailure
                      ? "Triggered by absence of breach notification mechanisms, missing incident reporting protocols, or unnotified user logging."
                      : "Mandated under DPDP Act 2023 for failing to report data security incidents promptly to the Board."}
                  </p>
                </div>
              </div>

              {/* Rule 3: Children's data or sensitive profiling -> Up to ₹150 Crores */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  dpdpMapping.isChildrenOrProfiling
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-border/60 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                        Section 9 · Schedule 1 (Item 3)
                      </span>
                      {dpdpMapping.isChildrenOrProfiling && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                          <Zap className="h-3 w-3" /> MATCHED IN AUDIT
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-bold text-foreground">
                      Violation of obligations regarding children's data or behavioral tracking
                      without verifiable consent
                    </p>
                  </div>
                  <div className="shrink-0 sm:text-right">
                    <p className="font-display text-lg font-extrabold text-amber-400">
                      Up to ₹150 Crores
                    </p>
                  </div>
                </div>

                <div className="mt-2.5 rounded-lg border border-border/50 bg-black/60 p-2.5">
                  <p className="font-sans text-xs font-bold text-amber-300">
                    Potential Penalty: Up to ₹150 Crores
                  </p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {dpdpMapping.isChildrenOrProfiling
                      ? "Triggered by unconsented third-party tracking scripts, adtech profiling, or lack of verifiable parental consent mechanisms."
                      : "Strict ban under Section 9 of DPDP Act 2023 on behavioral tracking or targeted advertising directed at minors."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-foreground">DPDP Statutory Note:</strong>{" "}
              Section 33(2) factors include the nature, gravity, duration, repetitive character of
              breach, and revenue impact. Data Fiduciaries operating in India must designate a Data
              Protection Officer (DPO) and publish an active Grievance Redressal mechanism.
            </p>
          </div>
        </div>
      ) : (
        /* GLOBAL / USD / EUR MODE */
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Estimated Maximum Exposure ({selectedRegion === "EUR" ? "EUR €" : "USD $"})
              </p>
              <p className="mt-1 font-display text-3xl font-bold text-foreground sm:text-4xl">
                {selectedRegion === "EUR"
                  ? report.fineRisk?.estimate.replace(/USD|\$/g, "€") || "€20,000,000"
                  : report.fineRisk?.estimate || "$20,000,000"}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {selectedRegion === "EUR"
                ? "GDPR Cap: Up to €20M or 4% of annual global turnover"
                : "CCPA / FTC / GDPR Equivalent Exposure"}
            </div>
          </div>

          <p className="rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
            {report.fineRisk?.rationale ||
              "Estimated regulatory exposure based on severity of data protection gaps, potential user scale, and statutory penalty caps."}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3.5 text-xs text-muted-foreground">
            <span>Scanning a target operating in or serving residents of India?</span>
            <button
              onClick={() => setSelectedRegion("IN")}
              className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300 transition-colors hover:bg-amber-500/20"
            >
              View DPDP Act 2023 (₹ Crores)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
