import React, { useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Globe,
  Scale,
  ShieldCheck,
  Phone,
  MapPin,
  Mail,
  Printer,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Download,
  Loader2,
  Lock,
  FileCode2,
  FileDown,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import {
  downloadReportAsPdf,
  downloadReportAsHtml,
  openStandalonePrintWindow,
} from "@/lib/pdf-export";
import { detectDomainOriginCountry } from "@/lib/country-origin";
import { ASJiBrandLockup } from "./ASJiBrandLockup";
import { getUnifiedJurisdictionVerdicts } from "@/lib/unified-verdicts";
import {
  evaluateStatutoryExceptions,
  type DomainExceptionsAnalysis,
} from "@/lib/statutory-exceptions";
import { STATUTORY_FRAMEWORKS } from "@/lib/audit-statutes";
import { generateAutomatedPatches } from "@/lib/remediation-patches";
import { generateStatutoryLegalSolution } from "@/lib/statutory-legal-solutions";

interface ASJiLetterheadReportProps {
  report?: AuditReport | null;
  domain?: string;
  score?: number;
  frameworkId?: string;
  isPaid?: boolean;
  className?: string;
  onPrint?: () => void;
  onOpenUnlockModal?: () => void;
}

export type LawVerdict = {
  id: string;
  country: string;
  flag: string;
  lawName: string;
  statuteRef: string;
  focusArea: string;
  pass: boolean;
  isOriginCountry: boolean;
};

type ForensicStatus = "PASS" | "WARN" | "FAIL";

interface ForensicEvidenceRow {
  id: string;
  category: string;
  control: string;
  status: ForensicStatus;
  proof: string;
}

function getScoreVisuals(score: number) {
  if (score >= 80) {
    return {
      color: "#10B981",
      label: "PASS · COMPLIANT",
      badgeBg: "rgba(16, 185, 129, 0.12)",
      badgeBorder: "rgba(16, 185, 129, 0.45)",
    };
  }
  if (score >= 55) {
    return {
      color: "#C9A227",
      label: "CONDITIONAL · REVIEW",
      badgeBg: "rgba(201, 162, 39, 0.14)",
      badgeBorder: "rgba(201, 162, 39, 0.5)",
    };
  }
  return {
    color: "#EF4444",
    label: "FAIL · REMEDIATION REQUIRED",
    badgeBg: "rgba(239, 68, 68, 0.12)",
    badgeBorder: "rgba(239, 68, 68, 0.45)",
  };
}

function StatusBadge({ status }: { status: ForensicStatus }) {
  const styles: Record<ForensicStatus, { color: string; bg: string; border: string }> = {
    PASS: {
      color: "#10B981",
      bg: "rgba(16, 185, 129, 0.12)",
      border: "rgba(16, 185, 129, 0.45)",
    },
    WARN: {
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.12)",
      border: "rgba(245, 158, 11, 0.45)",
    },
    FAIL: {
      color: "#EF4444",
      bg: "rgba(239, 68, 68, 0.12)",
      border: "rgba(239, 68, 68, 0.45)",
    },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider whitespace-nowrap border"
      style={{ color: s.color, backgroundColor: s.bg, borderColor: s.border }}
    >
      {status === "PASS" && <CheckCircle2 className="h-2.5 w-2.5 shrink-0" />}
      {status === "WARN" && <AlertTriangle className="h-2.5 w-2.5 shrink-0" />}
      {status === "FAIL" && <XCircle className="h-2.5 w-2.5 shrink-0" />}
      <span>{status}</span>
    </span>
  );
}

function OfficialSignOffBlock({
  auditRefId,
  shaDigest,
}: {
  auditRefId: string;
  shaDigest: string;
}) {
  return (
    <div className="space-y-2.5 pt-2 pdf-avoid-break" style={{ breakInside: "avoid" }}>
      {/* Safe Harbor Disclaimer & Authorization Signatory */}
      <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-3 rounded-lg border border-[#262932] bg-[#15171C] p-3.5 font-mono text-[10px]">
        <div className="md:col-span-2 print:col-span-2 space-y-1">
          <span className="font-bold uppercase tracking-wider text-[#C9A227] block">
            Safe Harbor Disclaimer &amp; Technical Observation Scope
          </span>
          <p className="text-zinc-300 leading-snug">
            This dossier documents passive, deterministic inspection of publicly reachable DNS, TLS,
            HTTP headers, scripts, and statutory disclosures across 15 privacy frameworks. Outputs
            support engineering and governance workflows and do not constitute formal legal counsel.
          </p>
        </div>

        <div className="border-t border-[#262932] pt-2 md:border-l md:border-t-0 md:pl-3 md:pt-0 print:border-l print:border-t-0 print:pl-3 print:pt-0 flex flex-col justify-between space-y-1.5">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">
              Authorization Signatory · {auditRefId}
            </span>
            <span className="font-display text-sm italic font-bold text-[#FAF8F5] block">
              ASJi Sovereign Legal Operations
            </span>
            <span className="text-[9.5px] text-zinc-400 block">
              Jaipur Headquarters · Compliance Directorate
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-[#10B981]">
            <Lock className="h-3 w-3 shrink-0" />
            <span>SHA-256 SEAL: {shaDigest}</span>
          </div>
        </div>
      </div>

      {/* Gold-Stamped Official Footer */}
      <footer
        className="overflow-hidden rounded-lg border pdf-avoid-break"
        style={{
          borderColor: "rgba(201, 162, 39, 0.55)",
          backgroundColor: "#15171C",
          breakInside: "avoid",
        }}
      >
        <div
          className="border-b px-3 py-1.5 text-center"
          style={{
            backgroundColor: "#0D0E11",
            borderBottomColor: "rgba(201, 162, 39, 0.35)",
          }}
        >
          <p className="font-mono text-[9.5px] font-bold uppercase tracking-[0.14em] text-[#C9A227]">
            Issued by ASJi Web and Legal Solution (www.asji.online | hello@asjione.com)
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#262932] text-[10px] font-mono text-[#FAF8F5]">
          <div className="flex items-center gap-2 p-2.5">
            <Phone className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
            <div className="tabular-nums leading-tight">
              <a href="tel:+918290841179" className="block font-bold hover:text-[#C9A227]">
                +91 82908 41179
              </a>
              <a href="tel:+919461584298" className="block text-zinc-400 hover:text-[#C9A227]">
                +91 94615 84298
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5">
            <MapPin className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
            <div className="leading-tight">
              <span className="font-bold block">Jaipur,</span>
              <span className="text-zinc-400">Rajasthan, India</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 min-w-0">
            <Globe className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
            <a
              href="https://www.asji.online"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#C9A227] hover:underline truncate"
            >
              www.asji.online
            </a>
          </div>

          <div className="flex items-center gap-2 p-2.5 min-w-0">
            <Mail className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
            <a
              href="mailto:hello@asjione.com"
              className="font-bold text-[#FAF8F5] hover:text-[#C9A227] truncate"
            >
              hello@asjione.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function ASJiLetterheadReport({
  report,
  domain: propDomain,
  score: propScore,
  frameworkId = "ind-dpdp",
  isPaid = false,
  className = "",
  onPrint,
  onOpenUnlockModal,
}: ASJiLetterheadReportProps) {
  const targetDomain =
    propDomain ||
    (report?.target
      ? report.target.replace(/^https?:\/\//i, "").replace(/\/.*$/, "")
      : "enterprise-gateway.com");

  const complianceScore = propScore ?? report?.score ?? 0;
  const scoreVisual = getScoreVisuals(complianceScore);
  const origin = detectDomainOriginCountry(targetDomain, report?.originCountry);

  const activeFramework = useMemo(() => {
    return STATUTORY_FRAMEWORKS.find((f) => f.id === frameworkId) || STATUTORY_FRAMEWORKS[0];
  }, [frameworkId]);

  const { utcTimestamp, istTimestamp } = useMemo(() => {
    if (report?.scannedAtUtc && report?.scannedAtIst) {
      return { utcTimestamp: report.scannedAtUtc, istTimestamp: report.scannedAtIst };
    }
    const baseDate = report?.provenance?.scannedAt
      ? new Date(report.provenance.scannedAt)
      : new Date();
    const utc = baseDate.toISOString().replace("T", " ").slice(0, 19) + " UTC";
    const ist =
      baseDate.toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " IST";
    return { utcTimestamp: utc, istTimestamp: ist };
  }, [report?.scannedAtUtc, report?.scannedAtIst, report?.provenance?.scannedAt]);

  const { auditRefId, shaDigest } = useMemo(() => {
    let hash = 2166136261;
    const seed = `${targetDomain}|${frameworkId}|${complianceScore}`;
    for (let i = 0; i < seed.length; i++) {
      hash ^= seed.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const hexHash = (hash >>> 0).toString(16).toUpperCase().padStart(8, "0");
    return {
      auditRefId: report?.auditRefId || `ASJI-2026-${hexHash.slice(0, 6)}`,
      shaDigest: `${hexHash}${hexHash.split("").reverse().join("")}`.slice(0, 16),
    };
  }, [report?.auditRefId, targetDomain, frameworkId, complianceScore]);

  const unified = useMemo(() => {
    const reportData: AuditReport = (report || {
      target: targetDomain,
      score: complianceScore,
      frameworks: [],
      criticalLeaks: [],
      evidence: [],
      summary: "",
      originCountry: origin.countryName,
    }) as AuditReport;
    return getUnifiedJurisdictionVerdicts(reportData);
  }, [report, targetDomain, complianceScore, origin.countryName]);

  const statutoryExceptions: DomainExceptionsAnalysis = useMemo(() => {
    return evaluateStatutoryExceptions(report ?? null, targetDomain);
  }, [report, targetDomain]);

  const lawsVerdictList: LawVerdict[] = useMemo(() => {
    const primaryIds = [
      { id: "in-dpdp", statuteRef: "Sec. 5(1), 6(1) & 8(1)" },
      { id: "eu-gdpr", statuteRef: "Art. 7, 13, 32 & 44" },
      { id: "gb-ukgdpr", statuteRef: "DUAA & PECR Reg 6" },
      { id: "us-ccpa", statuteRef: "Cal. Civ. Code § 1798.100" },
      { id: "br-lgpd", statuteRef: "Law 13.709 Art. 6, 7 & 46" },
      { id: "ca-pipeda", statuteRef: "Sched. 1 Principle 4.3" },
      { id: "au-privacy", statuteRef: "Privacy Act APPs 1, 5, 8" },
      { id: "sg-pdpa", statuteRef: "Section 26 Transfer Lim." },
      { id: "jp-appi", statuteRef: "APPI Art. 17, 23, 24 & 27" },
      { id: "ae-pdpl", statuteRef: "Decree-Law 45 Art. 4, 9" },
      { id: "kr-pipa", statuteRef: "PIPA Art. 15, 22, 28 & 29" },
      { id: "ch-fadp", statuteRef: "Revised FADP Art. 6, 8, 19" },
      { id: "sa-pdpl", statuteRef: "Royal Decree M/19" },
      { id: "za-popia", statuteRef: "POPIA Cond. 2, 7 & Sec 19" },
      { id: "ng-ndpa", statuteRef: "NDPA Sec. 24, 25, 30, 39" },
    ];

    return primaryIds.map((item) => {
      const v = unified.verdictMap[item.id];
      const isOriginCountry =
        v?.isOriginCountry ||
        origin.countryName.toLowerCase().includes(v?.country.toLowerCase() || "");

      return {
        id: v ? v.id : item.id,
        country: v ? v.country : "Jurisdiction",
        flag: v ? v.flag : "[GL]",
        lawName: v ? v.statuteName : "Statutory Standard",
        statuteRef: v ? v.statuteRef : item.statuteRef,
        focusArea: v ? v.focusArea : "Statutory compliance and telemetry safeguard controls",
        pass: v ? v.passed : complianceScore >= 75,
        isOriginCountry: Boolean(isOriginCountry),
      };
    });
  }, [unified, origin.countryName, complianceScore]);

  const failingLaws = lawsVerdictList.filter((l) => !l.pass);
  const passingLaws = lawsVerdictList.filter((l) => l.pass);

  // Build deterministic forensic rows from actual scan output
  const forensicRows: ForensicEvidenceRow[] = useMemo(() => {
    const rows: ForensicEvidenceRow[] = [];

    if (Array.isArray(report?.provenance?.checks)) {
      report.provenance.checks.forEach((chk, idx) => {
        const valLower = (chk.value || "").toLowerCase();
        const labelLower = (chk.label || "").toLowerCase();
        let status: ForensicStatus = "PASS";
        if (
          valLower.includes("missing") ||
          valLower.includes("fail") ||
          valLower.includes("none detected") ||
          valLower.includes("not enforced") ||
          valLower.includes("expired") ||
          valLower.includes("unencrypted")
        ) {
          status = "FAIL";
        } else if (
          valLower.includes("warn") ||
          valLower.includes("partial") ||
          valLower.includes("limited") ||
          valLower.includes("waf") ||
          valLower.includes("blocked")
        ) {
          status = "WARN";
        }
        const cat =
          labelLower.includes("dns") || labelLower.includes("spf") || labelLower.includes("dmarc")
            ? "DNS / Email"
            : labelLower.includes("tls") ||
                labelLower.includes("ssl") ||
                labelLower.includes("https")
              ? "Transport / TLS"
              : labelLower.includes("script") ||
                  labelLower.includes("cookie") ||
                  labelLower.includes("cmp")
                ? "Tracking / Consent"
                : "HTTP Inspection";
        rows.push({
          id: `prov-${idx}`,
          category: cat,
          control: chk.label,
          status,
          proof: chk.value,
        });
      });
    }

    if (report?.sslCert) {
      rows.push({
        id: "ssl-cert",
        category: "Transport / TLS",
        control: "X.509 SSL/TLS Certificate",
        status: report.sslCert.valid ? "PASS" : "FAIL",
        proof: report.sslCert.valid
          ? `Issuer: ${report.sslCert.issuer || "Verified CA"}${
              report.sslCert.daysRemaining !== undefined
                ? ` · ${report.sslCert.daysRemaining} days left`
                : ""
            }`
          : "TLS certificate invalid, unreachable, or self-signed",
      });
    }

    if (report?.dnsSecurity) {
      const dns = report.dnsSecurity;
      rows.push({
        id: "dns-spf-dmarc",
        category: "DNS / Email",
        control: "SPF, DMARC & CAA Records",
        status:
          dns.spfRecord && dns.dmarcRecord
            ? "PASS"
            : dns.spfRecord || dns.dmarcRecord
              ? "WARN"
              : "FAIL",
        proof: `SPF: ${dns.spfRecord ? "Present" : "Missing"} · DMARC: ${
          dns.dmarcRecord ? "Present" : "Missing"
        } · CAA: ${dns.caaRecords?.length ? dns.caaRecords.join(", ") : "None"}`,
      });
    }

    if (report && "detectedCmp" in report) {
      const cmp = report.detectedCmp;
      rows.push({
        id: "cmp-status",
        category: "Consent Gate",
        control: "Consent Management Platform (CMP)",
        status: cmp ? (cmp.isStandardCmp ? "PASS" : "WARN") : "FAIL",
        proof: cmp
          ? `${cmp.name} (${cmp.evidence})`
          : "No verifiable CMP banner or affirmative consent gate detected in DOM",
      });
    }

    if (Array.isArray(report?.detectedScripts)) {
      if (report.detectedScripts.length > 0) {
        report.detectedScripts.forEach((script, idx) => {
          rows.push({
            id: `script-${idx}`,
            category: "Tracker Forensics",
            control: `${script.name} (${script.category})`,
            status: report.detectedCmp ? "WARN" : "FAIL",
            proof: `${script.privacyRisk} · ${script.scriptUrlOrSnippet}`,
          });
        });
      } else {
        rows.push({
          id: "script-none",
          category: "Tracker Forensics",
          control: "Third-Party Trackers",
          status: "PASS",
          proof: "Zero unconsented third-party analytics or ad-tech scripts detected",
        });
      }
    }

    if (report?.policyDisclosures) {
      const pd = report.policyDisclosures;
      const missingCount = [
        !pd.privacyPolicyUrl,
        !pd.cookiePolicyUrl,
        !pd.termsUrl,
        !pd.grievanceContact,
      ].filter(Boolean).length;
      rows.push({
        id: "policy-links",
        category: "Disclosures",
        control: "Privacy, Cookie, Terms & Grievance Links",
        status: missingCount === 0 ? "PASS" : missingCount <= 2 ? "WARN" : "FAIL",
        proof: `Privacy: ${pd.privacyPolicyUrl ? "Linked" : "Missing"} · Cookies: ${
          pd.cookiePolicyUrl ? "Linked" : "Missing"
        } · Terms: ${pd.termsUrl ? "Linked" : "Missing"} · Grievance: ${
          pd.grievanceContact ? pd.grievanceContact : "Not Listed"
        }`,
      });
    }

    if (Array.isArray(report?.criticalLeaks)) {
      report.criticalLeaks.forEach((leak, idx) => {
        rows.push({
          id: `leak-${idx}`,
          category: "Exposure Finding",
          control: leak.title,
          status: leak.severity === "critical" || leak.severity === "high" ? "FAIL" : "WARN",
          proof: leak.detail,
        });
      });
    }

    if (rows.length === 0 && Array.isArray(report?.evidence)) {
      report.evidence.forEach((ev, idx) => {
        const lower = ev.toLowerCase();
        const status: ForensicStatus =
          lower.includes("missing") || lower.includes("fail") || lower.includes("leak")
            ? "FAIL"
            : lower.includes("warn") || lower.includes("partial")
              ? "WARN"
              : "PASS";
        rows.push({
          id: `ev-${idx}`,
          category: "Audit Signal",
          control: `Verification #${idx + 1}`,
          status,
          proof: ev,
        });
      });
    }

    return rows;
  }, [report]);

  // Statutory gap mapping (diagnostic gap pointers visible on Page 2; full patches/drafts gated behind isPaid)
  const legalSolutionSuite = useMemo(() => {
    return generateStatutoryLegalSolution(report ?? null, frameworkId);
  }, [report, frameworkId]);

  const automatedPatches = useMemo(() => {
    if (!isPaid || !report) return [];
    return generateAutomatedPatches(report);
  }, [isPaid, report]);

  const criticalViolationsCount =
    (report?.criticalLeaks?.length || 0) + forensicRows.filter((r) => r.status === "FAIL").length;

  const statutoryCeiling =
    report?.fineRisk?.estimate ||
    (frameworkId === "ind-dpdp"
      ? "Up to INR 250 Crore (DPDP Act, 2023)"
      : frameworkId === "eu-gdpr"
        ? "Up to EUR 20M or 4% Global Turnover"
        : frameworkId === "uk-duaa"
          ? "Up to GBP 17.5M or 4% Global Turnover"
          : frameworkId === "us-cpra"
            ? "Up to USD 7,500 per Intentional Violation"
            : "Statutory Regulatory Penalty Ceiling");

  const reportPaperRef = useRef<HTMLDivElement>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingHtml, setIsDownloadingHtml] = useState(false);

  const handleDownloadPdf = async () => {
    const paperEl =
      reportPaperRef.current || document.getElementById("asji-letterhead-report-paper");
    if (!paperEl) return;
    setIsDownloadingPdf(true);
    try {
      const success = await downloadReportAsPdf(paperEl, targetDomain);
      if (success) {
        toast.success("Executive PDF Certificate Saved", {
          description: `2–3 page Dark & Gold audit dossier exported for ${targetDomain}`,
        });
      }
    } catch (err) {
      console.error("PDF download failed", err);
      openStandalonePrintWindow(paperEl, targetDomain);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadHtml = async () => {
    const paperEl =
      reportPaperRef.current || document.getElementById("asji-letterhead-report-paper");
    if (!paperEl) return;
    setIsDownloadingHtml(true);
    try {
      const success = await downloadReportAsHtml(paperEl, targetDomain);
      if (success) {
        toast.success("Executive Dossier (.html) Downloaded", {
          description: `Standalone dark & gold dossier saved for ${targetDomain}`,
        });
      }
    } catch (err) {
      console.error("HTML dossier export failed", err);
      toast.error("Could not export HTML dossier");
    } finally {
      setIsDownloadingHtml(false);
    }
  };

  const handlePrint = () => {
    const paperEl =
      reportPaperRef.current || document.getElementById("asji-letterhead-report-paper");
    if (onPrint) {
      onPrint();
    } else if (paperEl) {
      openStandalonePrintWindow(paperEl, targetDomain);
    } else {
      window.print();
    }
  };

  const gaugeRadius = 36;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const clampedScore = Math.max(0, Math.min(100, complianceScore));
  const gaugeDashOffset = gaugeCircumference - (clampedScore / 100) * gaugeCircumference;

  return (
    <section
      aria-label="Executive Audit Report and Certificate"
      className={`relative w-full overflow-hidden rounded-xl border border-[#C9A227]/45 bg-[#0D0E11] text-[#F3F4F6] shadow-2xl ${className}`}
    >
      {/* Top Action Toolbar (Hidden in Print & PDF Exports) */}
      <div
        data-export-strip="true"
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 border-b border-[#262932] bg-[#15171C] px-4 py-3 print:hidden"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Award className="h-4 w-4 text-[#C9A227] shrink-0" />
          <span className="font-mono text-xs font-bold text-[#FAF8F5] uppercase tracking-wider truncate">
            Executive Audit Dossier ({isPaid ? "3-Page Full Pack" : "2-Page Audit Brief"})
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf}
            className="btn-gold inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-mono font-bold whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            {isDownloadingPdf ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isDownloadingPdf ? "Generating PDF..." : "Export PDF"}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadHtml}
            disabled={isDownloadingHtml}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#C9A227]/50 bg-[#0D0E11] px-3 py-1.5 text-xs font-mono font-bold text-[#C9A227] transition-colors hover:bg-[#C9A227]/10 whitespace-nowrap disabled:opacity-50 cursor-pointer"
          >
            {isDownloadingHtml ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            <span>Dossier (.html)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#262932] bg-[#0D0E11] px-3 py-1.5 text-xs font-mono font-bold text-[#FAF8F5] transition-colors hover:border-[#C9A227] hover:text-[#C9A227] whitespace-nowrap cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Matte Onyx & Brushed Antique Gold Executive Dossier Paper */}
      <div
        id="asji-letterhead-report-paper"
        ref={reportPaperRef}
        data-pdf-paper="true"
        className="relative p-3 sm:p-5 space-y-5"
        style={{
          backgroundColor: "#0D0E11",
          color: "#F3F4F6",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* =====================================================================
            PAGE 1 — EXECUTIVE VERDICT & TECHNICAL TELEMETRY MATRIX
           ===================================================================== */}
        <div
          data-dossier-page="1"
          className="relative rounded-xl border p-4 space-y-3.5"
          style={{
            backgroundColor: "#0D0E11",
            borderColor: "rgba(201, 162, 39, 0.45)",
          }}
        >
          {/* Decorative Antique Gold Corner Rules */}
          <div className="pointer-events-none absolute top-1.5 left-1.5 h-3 w-3 border-t-2 border-l-2 border-[#C9A227]" />
          <div className="pointer-events-none absolute top-1.5 right-1.5 h-3 w-3 border-t-2 border-r-2 border-[#C9A227]" />
          <div className="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 border-b-2 border-l-2 border-[#C9A227]" />
          <div className="pointer-events-none absolute bottom-1.5 right-1.5 h-3 w-3 border-b-2 border-r-2 border-[#C9A227]" />

          {/* 1. Compact Executive Dark & Gold Report Header */}
          <header
            className="flex flex-col md:flex-row print:flex-row md:items-center justify-between gap-3 border-b pb-3.5"
            style={{ borderBottomColor: "rgba(201, 162, 39, 0.3)" }}
          >
            <div className="flex flex-col items-start min-w-0">
              <ASJiBrandLockup size="report" idSuffix="cert_logo" />
              <p className="mt-1.5 font-mono text-[10.5px] text-zinc-400">
                ASJi Web and Legal Solution · Page 01 · Executive Verdict &amp; Technical Telemetry
                Matrix
              </p>
            </div>

            {/* Gold-Bordered Audit Verification Seal */}
            <div
              className="rounded-lg border p-2.5 shrink-0 md:min-w-[270px]"
              style={{
                backgroundColor: "#15171C",
                borderColor: "rgba(201, 162, 39, 0.6)",
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#262932] pb-1 mb-1.5">
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-[0.15em] text-[#C9A227]">
                  AUDIT VERIFICATION SEAL
                </span>
                <ShieldCheck className="h-3 w-3 text-[#C9A227] shrink-0" />
              </div>

              <dl className="space-y-0.5 font-mono text-[9.5px] tabular-nums">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-zinc-400">Audit ID:</dt>
                  <dd className="font-bold text-[#FAF8F5]">{auditRefId}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-zinc-400">Target:</dt>
                  <dd className="font-bold text-[#C9A227] break-all text-right">
                    https://{targetDomain}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-zinc-400">UTC:</dt>
                  <dd className="text-zinc-200 text-right">{utcTimestamp}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-zinc-400">IST:</dt>
                  <dd className="text-zinc-200 text-right">{istTimestamp}</dd>
                </div>
              </dl>
            </div>
          </header>

          {report?.isWafBlocked && (
            <div className="rounded border border-[#F59E0B]/40 bg-[#F59E0B]/10 px-3 py-1.5 font-mono text-[10px] text-[#F59E0B]">
              WAF / Bot Shield Detected — Displaying verified DNS, TLS, and transport-layer
              telemetry only.
            </div>
          )}

          {/* 2. Compact 2-Column Executive Summary Block */}
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3 pdf-avoid-break">
            {/* Left Block: Score Gauge + Verdict */}
            <div
              className="rounded-lg border p-3.5 flex items-center gap-3.5"
              style={{ backgroundColor: "#15171C", borderColor: "#262932" }}
            >
              <div className="relative h-16 w-16 shrink-0">
                <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="none"
                    stroke="#262932"
                    strokeWidth="9"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r={gaugeRadius}
                    fill="none"
                    stroke={scoreVisual.color}
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeDashOffset}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-mono text-sm font-bold text-[#FAF8F5] tabular-nums">
                    {complianceScore}%
                  </span>
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                  Overall Compliance Posture
                </span>
                <div
                  className="inline-block rounded px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider border"
                  style={{
                    color: scoreVisual.color,
                    backgroundColor: scoreVisual.badgeBg,
                    borderColor: scoreVisual.badgeBorder,
                  }}
                >
                  {scoreVisual.label}
                </div>
                <p className="font-mono text-[10px] text-zinc-300 tabular-nums">
                  {passingLaws.length}/15 Laws Aligned ·{" "}
                  <span
                    className="font-bold"
                    style={{ color: criticalViolationsCount > 0 ? "#EF4444" : "#10B981" }}
                  >
                    {criticalViolationsCount} Failed Controls
                  </span>
                </p>
              </div>
            </div>

            {/* Right Block: Jurisdiction + Penalty Ceiling */}
            <div
              className="rounded-lg border p-3.5 flex flex-col justify-between space-y-1.5"
              style={{ backgroundColor: "#15171C", borderColor: "#262932" }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Governing Jurisdiction &amp; Origin
                  </span>
                  <p className="font-display text-xs sm:text-sm font-bold text-[#FAF8F5] leading-snug mt-0.5">
                    <span className="text-[#C9A227] font-mono mr-1">{activeFramework.flag}</span>
                    {activeFramework.label}
                  </p>
                </div>
                <span className="rounded border border-[#C9A227]/40 bg-[#0D0E11] px-2 py-0.5 font-mono text-[9.5px] font-bold text-[#C9A227] shrink-0">
                  {origin.flag} {origin.countryName}
                </span>
              </div>
              <div className="border-t border-[#262932] pt-1.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[9.5px]">
                <span className="text-zinc-400">
                  Exposure:{" "}
                  <strong className="text-[#EF4444]">{failingLaws.length} Jurisdictions</strong>
                </span>
                <span className="font-bold text-[#C9A227]">{statutoryCeiling}</span>
              </div>
            </div>
          </div>

          {/* 2B. Deterministic Rule-Based Scoring Breakdown */}
          {Array.isArray(report?.scoreBreakdown) && report.scoreBreakdown.length > 0 && (
            <div
              className="rounded-lg border p-3 space-y-2 pdf-avoid-break"
              style={{ backgroundColor: "#15171C", borderColor: "#262932" }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262932] pb-1.5 font-mono text-[10px]">
                <span className="font-bold uppercase tracking-wider text-[#C9A227]">
                  Deterministic Scoring Formula Breakdown (Base 100 · Live Final {complianceScore}
                  /100)
                </span>
                <span className="text-zinc-400">
                  {report.politechMode ? "Standard + PoliTech Mode" : "Live Signal Telemetry"}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-1.5 font-mono text-[10px]">
                {report.scoreBreakdown.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-start justify-between gap-2 rounded border border-[#262932] bg-[#0D0E11] px-2.5 py-1.5"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-[#FAF8F5] truncate">{item.rule}</div>
                      <div className="text-[9px] text-zinc-400 leading-snug">{item.detail}</div>
                    </div>
                    <span
                      className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-bold tabular-nums border ${
                        item.passed
                          ? "border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]"
                          : "border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]"
                      }`}
                    >
                      {item.delta === 0 ? "0" : item.delta}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Compact Full-Width Technical Forensics Matrix */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-[#262932] pb-1.5">
              <h2 className="font-display text-sm font-bold text-[#FAF8F5] flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                <span>Technical Forensics &amp; HTTP Telemetry Matrix</span>
              </h2>
              <span className="font-mono text-[9.5px] text-zinc-400 tabular-nums">
                {forensicRows.length} Signals · {report?.scanMethodWorked || "Live HTTP Inspection"}
              </span>
            </div>

            {forensicRows.length > 0 ? (
              <>
                {/* Mobile Stacked Cards */}
                <div className="space-y-2 md:hidden print:hidden">
                  {forensicRows.map((row) => (
                    <div
                      key={row.id}
                      className="dossier-card rounded border border-[#262932] bg-[#15171C] p-2.5 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[9.5px] font-bold uppercase text-[#C9A227]">
                          {row.category} · {row.control}
                        </span>
                        <StatusBadge status={row.status} />
                      </div>
                      <p className="font-mono text-[10px] text-zinc-300 break-words leading-snug">
                        {row.proof}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Desktop & Print Institutional Compact Table */}
                <div className="hidden md:block print:block overflow-x-auto rounded-lg border border-[#262932]">
                  <table className="w-full min-w-[640px] print:min-w-0 text-left font-mono text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#262932] bg-[#15171C] text-[9px] uppercase tracking-wider text-[#C9A227]">
                        <th className="px-2.5 py-1.5 font-bold w-[16%]">Layer</th>
                        <th className="px-2.5 py-1.5 font-bold w-[26%]">Control</th>
                        <th className="px-2.5 py-1.5 font-bold w-[46%]">
                          Verified Technical Proof
                        </th>
                        <th className="px-2.5 py-1.5 font-bold text-right w-[12%]">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forensicRows.map((row, idx) => (
                        <tr
                          key={row.id}
                          style={{
                            backgroundColor: idx % 2 === 0 ? "#0D0E11" : "#12141A",
                            borderBottom:
                              idx < forensicRows.length - 1 ? "1px solid #262932" : "none",
                          }}
                        >
                          <td className="px-2.5 py-1.5 text-[9.5px] font-bold uppercase text-[#C9A227] align-top">
                            {row.category}
                          </td>
                          <td className="px-2.5 py-1.5 font-sans text-[10.5px] font-semibold text-[#FAF8F5] align-top">
                            {row.control}
                          </td>
                          <td className="px-2.5 py-1.5 text-[10px] text-zinc-300 break-words align-top leading-snug">
                            {row.proof}
                          </td>
                          <td className="px-2.5 py-1.5 text-right align-top">
                            <StatusBadge status={row.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="rounded border border-[#262932] bg-[#15171C] p-3 font-mono text-[10px] text-zinc-400">
                No technical anomalies captured in this inspection record.
              </div>
            )}
          </div>

          {/* 4. Compact 15-Jurisdiction Sovereign Evaluation Grid (5 tight rows x 3 cols) */}
          <div className="space-y-2 pdf-avoid-break">
            <div className="flex items-center justify-between gap-2 border-b border-[#262932] pb-1.5">
              <h2 className="font-display text-sm font-bold text-[#FAF8F5] flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                <span>15-Jurisdiction Sovereign Verdict Grid</span>
              </h2>
              <span className="font-mono text-[9.5px] text-zinc-400 tabular-nums">
                {passingLaws.length} Pass · {failingLaws.length} Fail
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 print:grid-cols-3 gap-2">
              {lawsVerdictList.map((item) => (
                <div
                  key={item.id}
                  className="dossier-card rounded border px-2.5 py-2 flex items-center justify-between gap-2"
                  style={{
                    backgroundColor: item.isOriginCountry ? "rgba(201, 162, 39, 0.08)" : "#15171C",
                    borderColor: item.isOriginCountry ? "rgba(201, 162, 39, 0.55)" : "#262932",
                  }}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 font-mono text-[10px] font-bold text-[#FAF8F5] truncate">
                      <span className="text-[#C9A227] shrink-0">{item.flag}</span>
                      <span className="truncate">{item.country}</span>
                      {item.isOriginCountry && (
                        <span className="rounded bg-[#C9A227] px-1 text-[8px] font-bold uppercase text-[#0D0E11] shrink-0">
                          Origin
                        </span>
                      )}
                    </div>
                    <div className="font-mono text-[9px] text-zinc-400 truncate">
                      {item.statuteRef}
                    </div>
                  </div>
                  <StatusBadge status={item.pass ? "PASS" : "FAIL"} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* =====================================================================
            PAGE 2 — STATUTORY GAP MAPPING & REMEDIATION CODE PATCHES
           ===================================================================== */}
        <div
          data-dossier-page="2"
          className="dossier-page-break relative rounded-xl border p-4 space-y-3.5"
          style={{
            backgroundColor: "#0D0E11",
            borderColor: "rgba(201, 162, 39, 0.45)",
          }}
        >
          {/* Page 2 Running Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9A227]/30 pb-2 font-mono text-[10px]">
            <span className="font-bold text-[#C9A227] uppercase tracking-wider">
              ASJi WEB AND LEGAL SOLUTION · PAGE 02 · STATUTORY GAPS &amp; REMEDIATION
            </span>
            <span className="text-zinc-400 tabular-nums">
              {auditRefId} · {targetDomain}
            </span>
          </div>

          {/* 2A. Section-by-Section Statutory Gap Mapping */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-sm font-bold text-[#FAF8F5] flex items-center gap-1.5">
                <Scale className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                <span>Statutory Gap Mapping ({legalSolutionSuite.lawName})</span>
              </h2>
              <span className="font-mono text-[9.5px] text-zinc-400 tabular-nums">
                {legalSolutionSuite.nonComplianceGaps.length} Mapped Observations
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2.5">
              {legalSolutionSuite.nonComplianceGaps.map((gap) => (
                <div
                  key={gap.id}
                  className="dossier-card pdf-avoid-break rounded-lg border border-[#262932] bg-[#15171C] p-3 space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-[10px] font-bold text-[#C9A227]">
                      {gap.lawArticle}
                    </span>
                    <StatusBadge status={gap.severity === "critical" ? "FAIL" : "WARN"} />
                  </div>
                  <div className="font-sans text-xs font-bold text-[#FAF8F5]">{gap.issue}</div>
                  <p className="text-[10.5px] text-zinc-300 leading-snug">
                    {gap.whatYouDoNotFollow}
                  </p>
                  <div className="border-t border-[#262932] pt-1 font-mono text-[9.5px] text-zinc-400">
                    <strong className="text-[#10B981]">Remedy: </strong>
                    {gap.statutoryRemedy}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2B. Compact Statutory Exceptions & Safe Harbor Register */}
          <div className="rounded-lg border border-[#262932] bg-[#15171C] p-3 space-y-2 pdf-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#FAF8F5]">
                Statutory Exceptions &amp; Safe Harbor Qualification
              </span>
              <span
                className={`rounded px-2 py-0.5 font-mono text-[9px] font-bold uppercase border ${
                  statutoryExceptions.hasAnyQualifiedException
                    ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40"
                    : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/40"
                }`}
              >
                {statutoryExceptions.hasAnyQualifiedException
                  ? `${statutoryExceptions.qualifiedCount}/${statutoryExceptions.totalEvaluated} Qualified`
                  : "Full Scope Applicable (No Exemptions)"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2">
              {statutoryExceptions.exceptionsList.map((exc) => {
                const isQualified =
                  exc.qualificationStatus === "QUALIFIED_EXEMPTION" ||
                  exc.qualificationStatus === "CONDITIONAL_SAFE_HARBOR";
                return (
                  <div
                    key={exc.id}
                    className="rounded border p-2.5 flex items-start justify-between gap-2 bg-[#0D0E11]"
                    style={{
                      borderColor: isQualified ? "rgba(16, 185, 129, 0.35)" : "#262932",
                    }}
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-[10px] font-bold text-[#FAF8F5] truncate">
                        <span className="text-[#C9A227] mr-1">{exc.flag}</span>
                        {exc.exceptionTitle}
                      </div>
                      <div className="font-mono text-[9px] text-[#C9A227] truncate">
                        {exc.sectionOrArticle}
                      </div>
                      <p className="text-[9.5px] text-zinc-400 leading-snug mt-0.5">
                        {exc.impactOnVerdict}
                      </p>
                    </div>
                    <span
                      className={`rounded px-1.5 py-0.5 font-mono text-[8.5px] font-bold uppercase shrink-0 border ${
                        exc.qualificationStatus === "QUALIFIED_EXEMPTION"
                          ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40"
                          : exc.qualificationStatus === "CONDITIONAL_SAFE_HARBOR"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/40"
                            : "bg-[#15171C] text-zinc-400 border-[#262932]"
                      }`}
                    >
                      {exc.qualificationStatus === "QUALIFIED_EXEMPTION"
                        ? "EXEMPT"
                        : exc.qualificationStatus === "CONDITIONAL_SAFE_HARBOR"
                          ? "CONDITIONAL"
                          : "NOT EXEMPT"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2C. Remediation Code Patches (Unlocked when isPaid) OR Sealed Notice + Sign-Off */}
          {isPaid ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-sm font-bold text-[#FAF8F5] flex items-center gap-1.5">
                  <FileCode2 className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                  <span>Production Server &amp; Consent Blocker Remediation Patches</span>
                </h2>
                <span className="font-mono text-[9.5px] font-bold uppercase text-[#10B981]">
                  Verified Paid License
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-2.5">
                {automatedPatches.map((patch) => (
                  <div
                    key={patch.id}
                    className="dossier-card pdf-avoid-break rounded-lg border border-[#C9A227]/35 bg-[#15171C] overflow-hidden"
                  >
                    <div className="flex items-center justify-between gap-2 border-b border-[#262932] bg-[#0D0E11] px-2.5 py-1.5 font-mono text-[9.5px]">
                      <span className="font-bold text-[#FAF8F5] truncate">{patch.title}</span>
                      <span className="text-[#C9A227] shrink-0">{patch.filename}</span>
                    </div>
                    <pre className="p-2.5 font-mono text-[8.5px] leading-[1.35] text-[#FAF8F5] whitespace-pre-wrap break-words bg-[#0D0E11]/85">
                      {patch.code.trim()}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-[#C9A227]/40 bg-[#15171C] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pdf-avoid-break">
                <div className="flex items-start gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-[#C9A227]/40 bg-[#0D0E11] text-[#C9A227]">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-[#FAF8F5]">
                      Remediation Code Patches &amp; Tailored Legal Notices Locked
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-snug">
                      Complete the Remediation Workbench unlock to append ready-to-deploy NGINX,
                      Cloudflare, Express, and Consent Blocker patches plus Page 3 tailored
                      statutory disclosures to this dossier.
                    </p>
                  </div>
                </div>
                {onOpenUnlockModal && (
                  <button
                    type="button"
                    data-export-strip="true"
                    onClick={onOpenUnlockModal}
                    className="btn-gold rounded-lg px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider whitespace-nowrap shrink-0 cursor-pointer print:hidden"
                  >
                    Unlock Full Pack
                  </button>
                )}
              </div>

              {/* For free 2-page dossier, official sign-off concludes cleanly on Page 2 */}
              <OfficialSignOffBlock auditRefId={auditRefId} shaDigest={shaDigest} />
            </>
          )}
        </div>

        {/* =====================================================================
            PAGE 3 (ONLY WHEN PAID) — TAILORED STATUTORY NOTICE & OFFICIAL SIGN-OFF
           ===================================================================== */}
        {isPaid && (
          <div
            data-dossier-page="3"
            className="dossier-page-break relative rounded-xl border p-4 space-y-3.5"
            style={{
              backgroundColor: "#0D0E11",
              borderColor: "rgba(201, 162, 39, 0.45)",
            }}
          >
            {/* Page 3 Running Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9A227]/30 pb-2 font-mono text-[10px]">
              <span className="font-bold text-[#C9A227] uppercase tracking-wider">
                ASJi WEB AND LEGAL SOLUTION · PAGE 03 · TAILORED STATUTORY NOTICE &amp; SIGN-OFF
              </span>
              <span className="text-zinc-400 tabular-nums">
                {auditRefId} · {targetDomain}
              </span>
            </div>

            {/* Ready-to-Deploy Tailored Statutory Privacy Policy */}
            <div className="rounded-lg border border-[#C9A227]/40 bg-[#15171C] p-3.5 space-y-2 pdf-avoid-break">
              <div className="flex items-center justify-between gap-2 border-b border-[#262932] pb-1.5">
                <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#C9A227]">
                  Ready-to-Deploy Tailored Privacy Notice ({legalSolutionSuite.lawName})
                </span>
                <span className="font-mono text-[9.5px] text-zinc-400">
                  Authority: {legalSolutionSuite.authority}
                </span>
              </div>
              <pre className="font-mono text-[10px] leading-[1.45] text-[#FAF8F5] whitespace-pre-wrap break-words bg-[#0D0E11] p-3 rounded border border-[#262932]">
                {legalSolutionSuite.samplePrivacyPolicy}
              </pre>
            </div>

            {/* Consent Gate & Grievance Charters (2-Column Compact Grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-3">
              <div className="dossier-card pdf-avoid-break rounded-lg border border-[#262932] bg-[#15171C] p-3 space-y-1.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                  Zero-Leak Consent Gate Charter
                </div>
                <pre className="font-mono text-[9.5px] leading-[1.4] text-zinc-200 whitespace-pre-wrap break-words bg-[#0D0E11] p-2.5 rounded border border-[#262932]">
                  {legalSolutionSuite.sampleConsentGateCharter}
                </pre>
              </div>

              <div className="dossier-card pdf-avoid-break rounded-lg border border-[#262932] bg-[#15171C] p-3 space-y-1.5">
                <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                  Grievance Officer &amp; Rectification Roadmap
                </div>
                <pre className="font-mono text-[9.5px] leading-[1.4] text-zinc-200 whitespace-pre-wrap break-words bg-[#0D0E11] p-2.5 rounded border border-[#262932]">
                  {`${legalSolutionSuite.sampleGrievanceCharter}\n\n${legalSolutionSuite.sampleRectificationRoadmap}`}
                </pre>
              </div>
            </div>

            {/* Official Gold-Stamped Sign-Off */}
            <OfficialSignOffBlock auditRefId={auditRefId} shaDigest={shaDigest} />
          </div>
        )}
      </div>
    </section>
  );
}
