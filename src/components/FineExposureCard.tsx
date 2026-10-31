import { useMemo, useState } from "react";
import { AlertTriangle, Building2, ChevronDown, Scale, Zap } from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import { NOT_LEGAL_ADVICE } from "@/lib/legal";

interface FineExposureCardProps {
  report: AuditReport;
}

type CurrencyRegion = "IN" | "USD" | "EUR" | "NG";

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

function detectIsNigeriaTarget(target: string, originCountry?: string): boolean {
  if (!target) return false;
  const clean = target.toLowerCase().trim();
  const hasNgDomain =
    /\.(ng|com\.ng|gov\.ng|edu\.ng|org\.ng)($|\/|\?|:)/i.test(clean) ||
    clean.endsWith(".ng") ||
    clean.endsWith(".com.ng");
  const isNigeriaCountry = originCountry ? /nigeria|\bng\b/i.test(originCountry) : false;
  return hasNgDomain || isNigeriaCountry;
}

export function FineExposureCard({ report }: FineExposureCardProps) {
  const isAutoIndia = useMemo(
    () => detectIsIndiaTarget(report.target, report.originCountry),
    [report.target, report.originCountry],
  );

  const isAutoNigeria = useMemo(
    () => detectIsNigeriaTarget(report.target, report.originCountry),
    [report.target, report.originCountry],
  );

  const [selectedRegion, setSelectedRegion] = useState<CurrencyRegion>(() =>
    isAutoIndia ? "IN" : isAutoNigeria ? "NG" : "USD",
  );

  // Analyze leaks for DPDP Act 2023 & DPDP Rules, 2025 statutory mapping
  const dpdpMapping = useMemo(() => {
    const leaks = report.criticalLeaks || [];
    const evidenceText = (report.evidence || []).join(" ").toLowerCase();
    const summaryText = (report.summary || "").toLowerCase();

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

    const isBreachNotifyFailure =
      leaks.some((l) =>
        /notify|breach|incident|disclosure|report|log|telemetry|unnotified/i.test(
          l.title + " " + l.detail,
        ),
      ) ||
      /breach|notification|incident|disclose/i.test(evidenceText + " " + summaryText) ||
      report.score < 55;

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

    return {
      isUnencryptedOrLeak,
      isBreachNotifyFailure,
      isChildrenOrProfiling,
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
                  ? "Statutory Observations (DPDP Act, 2023 & DPDP Rules, 2025)"
                  : "Statutory Observations & Framework Mapping"}
              </h3>
              {isAutoIndia && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  .IN Jurisdiction
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isIndiaMode
                ? "Mapped under the Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025"
                : "Observations based on global regulatory frameworks"}
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
              <option value="IN">🇮🇳 India — DPDP Act, 2023 &amp; DPDP Rules, 2025</option>
              <option value="NG">🇳🇬 Nigeria — NDPA 2023</option>
              <option value="USD">🌐 Global / USA</option>
              <option value="EUR">🇪🇺 EU — GDPR</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="gold-rule my-5" />

      {/* INDIA DPDP ACT 2023 & DPDP RULES, 2025 MODE */}
      {isIndiaMode ? (
        <div className="space-y-6">
          <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-amber-300">
                STATUTORY OBSERVATIONS &amp; ANALYSIS
              </span>
              <span className="font-sans font-medium text-[11px] text-muted-foreground">
                Data Protection Board of India (DPBI)
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Technical observations indicate statutory obligations under the Digital Personal Data
              Protection Act, 2023 and DPDP Rules, 2025 regarding notice, consent, security
              safeguards, and grievance redressal mechanisms.
            </p>
          </div>

          {/* Statutory Mapping Schedule Cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
                <AlertTriangle className="h-4 w-4 text-amber-400" />
                DPDP Act, 2023 &amp; DPDP Rules, 2025 Observations
              </h4>
            </div>

            <div className="grid gap-3.5">
              {/* Rule 1: Security Safeguards */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  dpdpMapping.isUnencryptedOrLeak
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-border/60 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Security Safeguards Observation
                    </span>
                    {dpdpMapping.isUnencryptedOrLeak && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Zap className="h-3 w-3" /> MATCHED IN AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Obligation to implement reasonable security safeguards to protect personal data
                  </p>
                </div>

                <div className="mt-2.5 rounded-lg border border-border/50 bg-black/60 p-2.5">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {dpdpMapping.isUnencryptedOrLeak
                      ? "Triggered by detected unencrypted personal data transmission, critical infrastructure leaks, or lack of essential security controls."
                      : "Applicable if critical data leaks, unencrypted PII forms, or missing SSL/TLS security controls are present."}
                  </p>
                </div>
              </div>

              {/* Rule 2: Failure to notify data breach */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  dpdpMapping.isBreachNotifyFailure
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-border/60 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Breach Notification Observation
                    </span>
                    {dpdpMapping.isBreachNotifyFailure && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Zap className="h-3 w-3" /> MATCHED IN AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Obligation to establish personal data breach reporting and notification
                    protocols
                  </p>
                </div>

                <div className="mt-2.5 rounded-lg border border-border/50 bg-black/60 p-2.5">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {dpdpMapping.isBreachNotifyFailure
                      ? "Triggered by absence of breach notification mechanisms, missing incident reporting protocols, or unnotified user logging."
                      : "Mandated under DPDP Act, 2023 for reporting data security incidents promptly to the Board."}
                  </p>
                </div>
              </div>

              {/* Rule 3: Children's data or sensitive profiling */}
              <div
                className={`rounded-xl border p-4 transition-all ${
                  dpdpMapping.isChildrenOrProfiling
                    ? "border-amber-500/40 bg-amber-950/15"
                    : "border-border/60 bg-secondary/20 opacity-70"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      Consent &amp; Profiling Observation
                    </span>
                    {dpdpMapping.isChildrenOrProfiling && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                        <Zap className="h-3 w-3" /> MATCHED IN AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Obligations regarding children's data and pre-consent behavioral tracking
                  </p>
                </div>

                <div className="mt-2.5 rounded-lg border border-border/50 bg-black/60 p-2.5">
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {dpdpMapping.isChildrenOrProfiling
                      ? "Triggered by unconsented third-party tracking scripts, adtech profiling, or lack of verifiable parental consent mechanisms."
                      : "Prohibitions under Section 9 of DPDP Act, 2023 on behavioral tracking or targeted advertising directed at minors."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-border bg-secondary/30 p-4 text-xs text-muted-foreground">
            <Building2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-foreground">Notice:</strong> {NOT_LEGAL_ADVICE}
            </p>
          </div>
        </div>
      ) : (
        /* GLOBAL / USD / EUR MODE */
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Regulatory Framework Scope
              </p>
              <p className="mt-1 font-display text-xl font-bold text-foreground">
                Global Privacy Standard (GDPR / CPRA / NDPA)
              </p>
            </div>
          </div>

          <p className="rounded-xl border border-border bg-secondary/30 p-4 text-sm leading-relaxed text-muted-foreground">
            {report.fineRisk?.rationale ||
              "Technical observations based on severity of data protection gaps, potential user scale, and statutory framework guidelines."}
          </p>

          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> {NOT_LEGAL_ADVICE}
          </p>
        </div>
      )}
    </div>
  );
}
