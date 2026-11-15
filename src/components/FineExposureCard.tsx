import { useMemo, useState } from "react";
import { AlertTriangle, Building2, ChevronDown, Scale } from "lucide-react";
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
    <div className="rounded-md border border-[#262932] bg-[#15171C] relative overflow-hidden p-6 sm:p-8">
      {/* Top Header Row with Region/Currency Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227]">
            <Scale className="h-5 w-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-display text-xl font-bold text-[#F4F4F5]">
                {isIndiaMode
                  ? "Statutory Observations (DPDP Act, 2023 & DPDP Rules, 2025)"
                  : "Statutory Observations & Framework Mapping"}
              </h3>
              {isAutoIndia && (
                <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#C9A227]">
                  [IN] Jurisdiction
                </span>
              )}
            </div>
            <p className="text-xs text-[#A1A1AA]">
              {isIndiaMode
                ? "Mapped under the Digital Personal Data Protection Act, 2023 & DPDP Rules, 2025"
                : "Observations based on global regulatory frameworks"}
            </p>
          </div>
        </div>

        {/* Currency / Country Toggle Dropdown */}
        <div className="flex items-center gap-2">
          <label htmlFor="currency-region-select" className="text-xs font-medium text-[#A1A1AA]">
            Jurisdiction:
          </label>
          <div className="relative">
            <select
              id="currency-region-select"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value as CurrencyRegion)}
              className="cursor-pointer appearance-none rounded-md border border-[#262932] bg-[#0D0E11] px-3.5 py-2 pr-8 text-xs font-mono font-semibold text-[#F4F4F5] transition-colors focus:border-[#C9A227] focus:outline-none"
            >
              <option value="IN">[IN] India — DPDP Act, 2023 &amp; DPDP Rules, 2025</option>
              <option value="NG">[NG] Nigeria — NDPA 2023</option>
              <option value="USD">[US] Global / USA</option>
              <option value="EUR">[EU] European Union — GDPR</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#A1A1AA]" />
          </div>
        </div>
      </div>

      <div className="my-5 h-px bg-[#262932]" />

      {/* INDIA DPDP ACT 2023 & DPDP RULES, 2025 MODE */}
      {isIndiaMode ? (
        <div className="space-y-6">
          <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-[#F59E0B]">
                STATUTORY OBSERVATIONS &amp; ANALYSIS
              </span>
              <span className="font-mono font-medium text-[11px] text-[#A1A1AA]">
                Data Protection Board of India (DPBI)
              </span>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[#A1A1AA]">
              Technical observations indicate statutory obligations under the Digital Personal Data
              Protection Act, 2023 and DPDP Rules, 2025 regarding notice, consent, security
              safeguards, and grievance redressal mechanisms.
            </p>
          </div>

          {/* Statutory Mapping Schedule Cards */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 font-display text-base font-bold text-[#F4F4F5]">
                <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                DPDP Act, 2023 &amp; DPDP Rules, 2025 Observations
              </h4>
            </div>

            <div className="grid gap-3.5">
              {/* Rule 1: Security Safeguards */}
              <div
                className={`rounded-md border p-4 transition-colors bg-[#0D0E11] ${
                  dpdpMapping.isUnencryptedOrLeak
                    ? "border-[#F59E0B]/50"
                    : "border-[#262932] opacity-75"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                      Security Safeguards Observation
                    </span>
                    {dpdpMapping.isUnencryptedOrLeak && (
                      <span className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                        MATCHED IN AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#F4F4F5]">
                    Obligation to implement reasonable security safeguards to protect personal data
                  </p>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {dpdpMapping.isUnencryptedOrLeak
                    ? "Triggered by detected unencrypted personal data transmission, critical infrastructure leaks, or lack of essential security controls."
                    : "Applicable if critical data leaks, unencrypted PII forms, or missing SSL/TLS security controls are present."}
                </p>
              </div>

              {/* Rule 2: Failure to notify data breach */}
              <div
                className={`rounded-md border p-4 transition-colors bg-[#0D0E11] ${
                  dpdpMapping.isBreachNotifyFailure
                    ? "border-[#F59E0B]/50"
                    : "border-[#262932] opacity-75"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                      Breach Notification Observation
                    </span>
                    {dpdpMapping.isBreachNotifyFailure && (
                      <span className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                        MATCHED IN AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#F4F4F5]">
                    Obligation to establish personal data breach reporting and notification
                    protocols
                  </p>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {dpdpMapping.isBreachNotifyFailure
                    ? "Triggered by absence of breach notification mechanisms, missing incident reporting protocols, or unnotified user logging."
                    : "Mandated under DPDP Act, 2023 for reporting data security incidents promptly to the Board."}
                </p>
              </div>

              {/* Rule 3: Children's data or sensitive profiling */}
              <div
                className={`rounded-md border p-4 transition-colors bg-[#0D0E11] ${
                  dpdpMapping.isChildrenOrProfiling
                    ? "border-[#F59E0B]/50"
                    : "border-[#262932] opacity-75"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                      Consent &amp; Profiling Observation
                    </span>
                    {dpdpMapping.isChildrenOrProfiling && (
                      <span className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#F59E0B]">
                        MATCHED IN AUDIT
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-[#F4F4F5]">
                    Obligations regarding children&apos;s data and pre-consent behavioral tracking
                  </p>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {dpdpMapping.isChildrenOrProfiling
                    ? "Triggered by unconsented third-party tracking scripts, adtech profiling, or lack of verifiable parental consent mechanisms."
                    : "Prohibitions under Section 9 of DPDP Act, 2023 on behavioral tracking or targeted advertising directed at minors."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-md border border-[#262932] bg-[#0D0E11] p-4 text-xs text-[#A1A1AA]">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A227]" />
            <p className="leading-relaxed">
              <strong className="font-semibold text-[#F4F4F5]">Notice:</strong> {NOT_LEGAL_ADVICE}
            </p>
          </div>
        </div>
      ) : (
        /* GLOBAL / USD / EUR MODE */
        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-[#71717A]">
                Regulatory Framework Scope
              </p>
              <p className="mt-1 font-display text-xl font-bold text-[#F4F4F5]">
                Global Privacy Standard (GDPR / CPRA / NDPA)
              </p>
            </div>
          </div>

          <p className="rounded-md border border-[#262932] bg-[#0D0E11] p-4 text-sm leading-relaxed text-[#A1A1AA]">
            {report.fineRisk?.rationale ||
              "Technical observations based on severity of data protection gaps, potential user scale, and statutory framework guidelines."}
          </p>

          <p className="text-xs text-[#71717A]">
            <strong className="text-[#A1A1AA]">Note:</strong> {NOT_LEGAL_ADVICE}
          </p>
        </div>
      )}
    </div>
  );
}
