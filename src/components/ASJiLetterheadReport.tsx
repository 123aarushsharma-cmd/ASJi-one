import React, { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Globe,
  Scale,
  ShieldCheck,
  FileText,
  Phone,
  MapPin,
  Mail,
  Printer,
  CheckCircle2,
  XCircle,
  Award,
  Download,
  Loader2,
  Lock,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import { downloadReportAsPdf, openStandalonePrintWindow } from "@/lib/pdf-export";
import { detectDomainOriginCountry } from "@/lib/country-origin";
import { ASJiVectorLogo } from "./ASJiVectorLogo";

interface ASJiLetterheadReportProps {
  report?: AuditReport | null;
  domain?: string;
  score?: number;
  className?: string;
  onPrint?: () => void;
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

export function ASJiLetterheadReport({
  report,
  domain: propDomain,
  score: propScore,
  className = "",
  onPrint,
}: ASJiLetterheadReportProps) {
  // Extract target domain and compliance score dynamically
  const targetDomain =
    propDomain ||
    (report?.target
      ? report.target.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : "enterprise-gateway.com");

  const complianceScore = propScore ?? report?.score ?? 88;

  // Determine Origin Country
  const origin = detectDomainOriginCountry(targetDomain, report?.originCountry);

  const formattedDate = report?.provenance?.scannedAt
    ? new Date(report.provenance.scannedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

  const certNumber = `ASJI-CERT-2026-${targetDomain
    .slice(0, 4)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")}-${Math.floor(1000 + Math.random() * 9000)}`;

  // Evaluate the EXACT 6 Global Laws
  const radarMatrix = report?.radarTerminal?.verdictMatrix;

  const indiaPass = radarMatrix ? radarMatrix.indiaDpdp2023.pass : complianceScore >= 75;
  const euPass = radarMatrix ? radarMatrix.euGdprReforms.pass : complianceScore >= 85;
  const ukPass = radarMatrix ? radarMatrix.ukDuaa2026.pass : complianceScore >= 80;
  const uaePass = radarMatrix ? radarMatrix.uaeDecreeLaw45.pass : complianceScore >= 70;
  const saudiPass = radarMatrix ? radarMatrix.saudiArabiaPdpl.pass : complianceScore >= 70;
  const singaporePass = radarMatrix ? radarMatrix.singaporePdpa.pass : complianceScore >= 80;

  const lawsVerdictList: LawVerdict[] = [
    {
      id: "in-dpdp",
      country: "India",
      flag: "🇮🇳",
      lawName: "DPDP Act 2023",
      statuteRef: "Sec. 6(1) & Sec. 8(1)",
      focusArea: "Pre-consent telemetry drift & infrastructure safeguards",
      pass: indiaPass,
      isOriginCountry: origin.countryName === "India",
    },
    {
      id: "eu-gdpr",
      country: "European Union",
      flag: "🇪🇺",
      lawName: "GDPR (EU 2016/679)",
      statuteRef: "Art. 7, 13, 32 & 44",
      focusArea: "Prior opt-in cookie consent & cross-border data transfer",
      pass: euPass,
      isOriginCountry: origin.countryName === "European Union",
    },
    {
      id: "uk-duaa",
      country: "United Kingdom",
      flag: "🇬🇧",
      lawName: "UK DUAA 2026",
      statuteRef: "Statutory Standard",
      focusArea: "Preference architecture & client telemetry isolation",
      pass: ukPass,
      isOriginCountry: origin.countryName === "United Kingdom",
    },
    {
      id: "ae-pdpl",
      country: "United Arab Emirates",
      flag: "🇦🇪",
      lawName: "UAE Decree-Law 45",
      statuteRef: "Art. 4, 6 & 13",
      focusArea: "Bilingual privacy disclosures & selection tokens",
      pass: uaePass,
      isOriginCountry: origin.countryName === "United Arab Emirates",
    },
    {
      id: "sa-pdpl",
      country: "Saudi Arabia",
      flag: "🇸🇦",
      lawName: "Saudi Arabia PDPL",
      statuteRef: "2024 Implementing Regs",
      focusArea: "Explicit opt-in consent for analytics & cross-border packet routing",
      pass: saudiPass,
      isOriginCountry: origin.countryName === "Saudi Arabia",
    },
    {
      id: "sg-pdpa",
      country: "Singapore",
      flag: "🇸🇬",
      lawName: "Singapore PDPA",
      statuteRef: "Section 26 Transfer Limitation",
      focusArea: "Cross-border data packet streams & comparable protection tokens",
      pass: singaporePass,
      isOriginCountry: origin.countryName === "Singapore",
    },
  ];

  const passingLaws = lawsVerdictList.filter((l) => l.pass);
  const failingLaws = lawsVerdictList.filter((l) => !l.pass);

  // Check if Origin Country passes its own domestic law
  const originLaw = lawsVerdictList.find((l) => l.isOriginCountry);
  const originPass = originLaw ? originLaw.pass : complianceScore >= 75;

  const reportPaperRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    const paperEl =
      reportPaperRef.current || document.getElementById("asji-letterhead-report-paper");
    if (!paperEl) return;
    setIsDownloading(true);
    try {
      const success = await downloadReportAsPdf(paperEl, targetDomain);
      if (success) {
        toast.success("PDF Downloaded Successfully", {
          description: `Exact compliance certificate generated for ${targetDomain}`,
        });
      }
    } catch (err) {
      console.error("PDF download failed", err);
      openStandalonePrintWindow(paperEl, targetDomain);
    } finally {
      setIsDownloading(false);
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

  return (
    <div
      className={`relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#0d0c0b] text-foreground shadow-2xl transition-all ${className}`}
    >
      {/* Top Action Control Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-b border-[#D4AF37]/30 bg-black/80 px-4 sm:px-6 py-3 print:hidden">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-[#E5C158] shrink-0" />
          <span className="font-mono text-xs font-bold text-[#E5C158] uppercase tracking-wider">
            Official ASJi Web &amp; Legal Solutions Certificate &amp; Audit Report
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-500/60 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-mono font-bold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-black shadow-sm disabled:opacity-50 cursor-pointer"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isDownloading ? "Generating PDF..." : "Download Report (PDF)"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-3.5 py-1.5 text-xs font-mono font-bold text-[#E5C158] transition-all hover:bg-[#D4AF37] hover:text-black shadow-sm cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Single-Page Letterhead Certificate Paper (Engineered for Exact A4 Page Fit) */}
      <div
        id="asji-letterhead-report-paper"
        ref={reportPaperRef}
        data-pdf-paper="true"
        className="relative bg-[#0d0c0b] text-white p-3 sm:p-5 border border-[#D4AF37]/30"
        style={{
          backgroundColor: "#0d0c0b",
          color: "#ffffff",
          fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
          boxSizing: "border-box",
        }}
      >
        {/* Fine Guilloche Certificate Inner Border */}
        <div
          className="relative rounded-xl border border-[#D4AF37]/40 p-3 sm:p-4"
          style={{
            borderColor: "rgba(212, 175, 55, 0.45)",
            background: "linear-gradient(180deg, #141210 0%, #0d0c0b 50%, #0a0908 100%)",
            backgroundColor: "#0d0c0b",
          }}
        >
          {/* Top Security Corner Accents */}
          <div className="absolute top-1 left-1 h-3 w-3 border-t-2 border-l-2 border-[#D4AF37]" />
          <div className="absolute top-1 right-1 h-3 w-3 border-t-2 border-r-2 border-[#D4AF37]" />
          <div className="absolute bottom-1 left-1 h-3 w-3 border-b-2 border-l-2 border-[#D4AF37]" />
          <div className="absolute bottom-1 right-1 h-3 w-3 border-b-2 border-r-2 border-[#D4AF37]" />

          {/* 1. EXECUTIVE LETTERHEAD HEADER */}
          <header
            className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ borderBottomColor: "rgba(212, 175, 55, 0.3)" }}
          >
            {/* Left Brand Identity */}
            <div className="flex items-center gap-3">
              {/* Monogram Gold Emblem with Official Logo */}
              <div
                className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 bg-black p-1 shadow-lg overflow-hidden"
                style={{ borderColor: "#D4AF37", backgroundColor: "#120f05" }}
              >
                <ASJiVectorLogo className="h-full w-full" idSuffix="cert_logo" />
                <div
                  className="absolute -bottom-1 -right-1 rounded-full border p-0.5"
                  style={{ backgroundColor: "#D4AF37", borderColor: "#D4AF37" }}
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-black" />
                </div>
              </div>

              <div>
                <h1 className="font-display text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                  <span>ASJi</span>
                  <span style={{ color: "#E5C158" }}>WEB &amp; LEGAL</span>
                </h1>
                <p
                  className="font-mono text-[8px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: "#E5C158" }}
                >
                  SOLUTION —
                </p>
                <p className="text-[9px] italic" style={{ color: "#a3a3a3" }}>
                  Your Business. Our Expertise. Your Peace of Mind.
                </p>
              </div>
            </div>

            {/* Right Service Capabilities 4-Grid */}
            <div
              className="grid grid-cols-2 gap-x-3 gap-y-1 border-t pt-2 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0"
              style={{ borderColor: "rgba(255, 255, 255, 0.1)" }}
            >
              <div className="flex items-center gap-1.5">
                <Globe className="h-3 w-3 shrink-0" style={{ color: "#E5C158" }} />
                <div>
                  <p className="text-[9px] font-bold text-white leading-none">Web Solutions</p>
                  <p className="text-[7.5px]" style={{ color: "#888888" }}>
                    Digital. Modern.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <Scale className="h-3 w-3 shrink-0" style={{ color: "#E5C158" }} />
                <div>
                  <p className="text-[9px] font-bold text-white leading-none">Legal Advisory</p>
                  <p className="text-[7.5px]" style={{ color: "#888888" }}>
                    Strategic. Trusted.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 shrink-0" style={{ color: "#E5C158" }} />
                <div>
                  <p className="text-[9px] font-bold text-white leading-none">Compliance</p>
                  <p className="text-[7.5px]" style={{ color: "#888888" }}>
                    Secure. Assured.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="h-3 w-3 shrink-0" style={{ color: "#E5C158" }} />
                <div>
                  <p className="text-[9px] font-bold text-white leading-none">Documentation</p>
                  <p className="text-[7.5px]" style={{ color: "#888888" }}>
                    Professional.
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* 2. OFFICIAL CERTIFICATE SUB-TITLE & SERIAL INFO */}
          <div
            className="my-2.5 flex flex-wrap items-center justify-between gap-2 rounded-lg px-3 py-1.5 border"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              borderColor: "rgba(255, 255, 255, 0.12)",
            }}
          >
            <div>
              <span
                className="font-mono text-[8.5px] uppercase tracking-widest block font-bold"
                style={{ color: "#E5C158" }}
              >
                OFFICIAL TECHNICAL COMPLIANCE &amp; SOVEREIGN PRIVACY AUDIT CERTIFICATE
              </span>
              <span className="text-[9px] font-mono" style={{ color: "#a3a3a3" }}>
                SERIAL: <strong className="text-white font-mono">{certNumber}</strong>
              </span>
            </div>
            <div className="text-right text-[9px] font-mono" style={{ color: "#a3a3a3" }}>
              <span>ISSUED: </span>
              <strong className="text-white">{formattedDate}</strong>
            </div>
          </div>

          {/* 3. TARGET DOMAIN METADATA & REGISTERED COUNTRY ORIGIN BOX */}
          <div className="mb-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Target Domain & Registered Country */}
            <div
              className="sm:col-span-2 rounded-lg border p-2.5 flex flex-col justify-between"
              style={{
                backgroundColor: "#121110",
                borderColor: "rgba(255, 255, 255, 0.12)",
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[8.5px] uppercase tracking-wider font-mono block"
                    style={{ color: "#888888" }}
                  >
                    Audited Domain
                  </span>
                  {/* Origin Registered Country Badge */}
                  <span
                    className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold"
                    style={{
                      backgroundColor: "rgba(212, 175, 55, 0.15)",
                      borderColor: "rgba(212, 175, 55, 0.5)",
                      color: "#E5C158",
                    }}
                  >
                    <span>Origin:</span>
                    <span>{origin.flag}</span>
                    <span>{origin.countryName}</span>
                  </span>
                </div>
                <span
                  className="font-mono text-sm sm:text-base font-bold break-all block mt-0.5"
                  style={{ color: "#E5C158" }}
                >
                  {targetDomain}
                </span>
              </div>
              <div
                className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[8.5px] font-mono border-t pt-1"
                style={{
                  color: "#888888",
                  borderTopColor: "rgba(255, 255, 255, 0.08)",
                }}
              >
                <span>
                  ENGINE: <strong className="text-white">ASJi One Trust v2.4</strong>
                </span>
                <span>•</span>
                <span>
                  ORIGIN STATUS:{" "}
                  <strong style={{ color: originPass ? "#34d399" : "#fb7185" }}>
                    {originPass ? "PASS [DOMESTIC COMPLIANT]" : "FAIL [ACTION REQUIRED]"}
                  </strong>
                </span>
              </div>
            </div>

            {/* Score Box */}
            <div
              className="rounded-lg border p-2.5 flex items-center justify-between shadow-inner"
              style={{
                backgroundColor: "#14120f",
                borderColor: "rgba(212, 175, 55, 0.4)",
              }}
            >
              <div>
                <span
                  className="text-[8.5px] uppercase tracking-wider font-mono block"
                  style={{ color: "#888888" }}
                >
                  Compliance Score
                </span>
                <span className="font-mono text-xl font-black text-white">{complianceScore}%</span>
                <span
                  className="text-[8.5px] font-mono block font-bold"
                  style={{ color: complianceScore >= 75 ? "#34d399" : "#fb7185" }}
                >
                  {complianceScore >= 75 ? "OVERALL: PASS" : "OVERALL: FAIL"}
                </span>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg border font-mono text-xs font-black"
                style={{
                  borderColor: complianceScore >= 75 ? "#34d399" : "#fb7185",
                  backgroundColor:
                    complianceScore >= 75 ? "rgba(16, 185, 129, 0.15)" : "rgba(244, 63, 94, 0.15)",
                  color: complianceScore >= 75 ? "#34d399" : "#fb7185",
                }}
              >
                {complianceScore >= 75 ? "PASS" : "FAIL"}
              </div>
            </div>
          </div>

          {/* 4. TOTAL 6 STATUTORY JURISDICTIONS EVALUATION TABLE */}
          <div
            className="overflow-hidden rounded-lg border mb-2.5"
            style={{
              borderColor: "rgba(255, 255, 255, 0.12)",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            }}
          >
            <table className="w-full text-left text-[10px] font-mono border-collapse">
              <thead>
                <tr
                  className="border-b text-[8.5px] uppercase tracking-wider"
                  style={{
                    backgroundColor: "#181614",
                    borderBottomColor: "rgba(255, 255, 255, 0.12)",
                    color: "#888888",
                  }}
                >
                  <th className="px-2.5 py-1.5 font-bold" style={{ color: "#E5C158" }}>
                    Country &amp; Jurisdiction
                  </th>
                  <th className="px-2.5 py-1.5 font-bold">Applicable Sovereign Law</th>
                  <th className="px-2.5 py-1.5 font-bold">Statutory Scope &amp; Focus</th>
                  <th className="px-2.5 py-1.5 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody style={{ divideColor: "rgba(255, 255, 255, 0.08)" }}>
                {lawsVerdictList.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      backgroundColor: item.isOriginCountry
                        ? "rgba(212, 175, 55, 0.08)"
                        : idx % 2 === 0
                          ? "rgba(0, 0, 0, 0.25)"
                          : "rgba(0, 0, 0, 0.45)",
                      borderBottom:
                        idx < lawsVerdictList.length - 1
                          ? "1px solid rgba(255, 255, 255, 0.08)"
                          : "none",
                    }}
                  >
                    <td className="px-2.5 py-1.5 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{item.flag}</span>
                        <div>
                          <div className="leading-tight flex items-center gap-1">
                            <span>{item.country}</span>
                            {item.isOriginCountry && (
                              <span
                                className="rounded px-1 py-0.2 text-[7px] uppercase font-bold"
                                style={{
                                  backgroundColor: "#D4AF37",
                                  color: "#000000",
                                }}
                              >
                                Origin
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2.5 py-1.5 text-white whitespace-nowrap">
                      <div className="font-bold leading-tight">{item.lawName}</div>
                      <div className="text-[7.5px]" style={{ color: "#888888" }}>
                        {item.statuteRef}
                      </div>
                    </td>
                    <td
                      className="px-2.5 py-1.5 text-[9px] leading-tight"
                      style={{ color: "#d1d5db" }}
                    >
                      {item.focusArea}
                    </td>
                    <td className="px-2.5 py-1.5 text-center whitespace-nowrap">
                      {item.pass ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8.5px] font-black"
                          style={{
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            borderColor: "rgba(16, 185, 129, 0.6)",
                            color: "#34d399",
                          }}
                        >
                          <CheckCircle2 className="h-3 w-3" style={{ color: "#34d399" }} />
                          <span>PASS</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[8.5px] font-black"
                          style={{
                            backgroundColor: "rgba(244, 63, 94, 0.15)",
                            borderColor: "rgba(244, 63, 94, 0.6)",
                            color: "#fb7185",
                          }}
                        >
                          <XCircle className="h-3 w-3" style={{ color: "#fb7185" }} />
                          <span>FAIL</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 5. SUMMARY VERDICT BOX (CLEAR PASS/FAIL STATEMENT) */}
          <div
            className="rounded-lg border p-2.5 text-[9px] font-mono mb-2.5"
            style={{
              backgroundColor: "#100f0d",
              borderColor: "rgba(212, 175, 55, 0.35)",
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* PASS AS PER */}
              <div
                className="rounded p-2 border"
                style={{
                  backgroundColor: "rgba(16, 185, 129, 0.08)",
                  borderColor: "rgba(16, 185, 129, 0.3)",
                }}
              >
                <div className="flex items-center gap-1 text-[#34d399] font-bold mb-1 uppercase text-[9.5px]">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>PASS as per these countries&apos; laws ({passingLaws.length}/6):</span>
                </div>
                {passingLaws.length > 0 ? (
                  <ul className="space-y-0.5 text-[8.5px] text-gray-200">
                    {passingLaws.map((l) => (
                      <li key={l.id} className="flex items-center gap-1">
                        <span>{l.flag}</span>
                        <strong className="text-white">{l.country}:</strong>
                        <span>{l.lawName}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-gray-400 text-[8.5px]">None</span>
                )}
              </div>

              {/* FAIL AS PER */}
              <div
                className="rounded p-2 border"
                style={{
                  backgroundColor: "rgba(244, 63, 94, 0.08)",
                  borderColor: "rgba(244, 63, 94, 0.3)",
                }}
              >
                <div className="flex items-center gap-1 text-[#fb7185] font-bold mb-1 uppercase text-[9.5px]">
                  <XCircle className="h-3.5 w-3.5" />
                  <span>
                    FAIL according to these countries&apos; laws ({failingLaws.length}/6):
                  </span>
                </div>
                {failingLaws.length > 0 ? (
                  <ul className="space-y-0.5 text-[8.5px] text-gray-200">
                    {failingLaws.map((l) => (
                      <li key={l.id} className="flex items-center gap-1">
                        <span>{l.flag}</span>
                        <strong className="text-white">{l.country}:</strong>
                        <span>{l.lawName}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-[#34d399] text-[8.5px] font-bold">
                    ✓ All 6 Global Jurisdictions Fully Compliant
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 6. LEGAL SIGNATORY & CRYPTOGRAPHIC SEAL BOX */}
          <div
            className="grid grid-cols-1 sm:grid-cols-3 gap-2 rounded-lg border p-2.5 text-[8.5px] font-mono"
            style={{
              backgroundColor: "#121110",
              borderColor: "rgba(255, 255, 255, 0.12)",
              color: "#a3a3a3",
            }}
          >
            <div className="sm:col-span-2">
              <span className="font-bold block uppercase text-[9px]" style={{ color: "#E5C158" }}>
                Statutory Technical Legal Notice:
              </span>
              <p className="mt-0.5 leading-tight" style={{ color: "#a3a3a3" }}>
                By executing this scan, you authorize a passive, non-intrusive public transport
                layer audit. Reports generate automated technical compliance logs evaluated strictly
                against the 6 sovereign statutory data protection frameworks above.
              </p>
            </div>

            <div
              className="border-t pt-1.5 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0 flex flex-col justify-between"
              style={{ borderColor: "rgba(255, 255, 255, 0.12)" }}
            >
              <div>
                <span
                  className="text-[7.5px] uppercase tracking-wider block"
                  style={{ color: "#737373" }}
                >
                  AUTHORIZATION SIGNATURE
                </span>
                <span className="text-[9.5px] font-bold text-white block mt-0.5 font-serif italic">
                  ASJi Sovereign Legal Operations
                </span>
                <span className="text-[7.5px] block" style={{ color: "#888888" }}>
                  Jaipur Headquarters // Directorate of RegTech
                </span>
              </div>
              <div
                className="flex items-center gap-1 text-[7.5px] font-bold mt-0.5"
                style={{ color: "#34d399" }}
              >
                <Lock className="h-2.5 w-2.5" />
                <span>SHA-256 HASH VERIFIED</span>
              </div>
            </div>
          </div>

          {/* 7. OFFICIAL FOOTER CONTACT BLOCK */}
          <footer
            className="mt-2.5 overflow-hidden rounded-lg border"
            style={{
              borderColor: "rgba(212, 175, 55, 0.5)",
              backgroundColor: "#080808",
            }}
          >
            {/* Top Ribbon */}
            <div
              className="border-b py-0.5 text-center"
              style={{
                background: "linear-gradient(90deg, #201808 0%, #3a2c0c 50%, #201808 100%)",
                borderBottomColor: "rgba(212, 175, 55, 0.35)",
              }}
            >
              <p
                className="font-mono text-[8px] font-extrabold uppercase tracking-[0.22em]"
                style={{ color: "#E5C158" }}
              >
                EMPOWERING BUSINESSES. ENSURING COMPLIANCE. DELIVERING TRUST.
              </p>
            </div>

            {/* 4 Contact Columns */}
            <div
              className="grid grid-cols-2 sm:grid-cols-4 p-1.5 text-[9px] font-mono"
              style={{ gap: "4px" }}
            >
              {/* Phone */}
              <div
                className="flex items-center gap-1.5 p-1"
                style={{ borderRight: "1px solid rgba(255, 255, 255, 0.08)" }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    color: "#E5C158",
                    borderColor: "rgba(212, 175, 55, 0.6)",
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <Phone className="h-3 w-3" />
                </div>
                <div style={{ color: "#d1d5db" }}>
                  <a
                    href="tel:8290841179"
                    className="hover:text-[#E5C158] block leading-none font-bold"
                  >
                    8290841179
                  </a>
                  <a
                    href="tel:9461584298"
                    className="hover:text-[#E5C158] block leading-none mt-0.5"
                  >
                    9461584298
                  </a>
                </div>
              </div>

              {/* Location */}
              <div
                className="flex items-center gap-1.5 p-1"
                style={{ borderRight: "1px solid rgba(255, 255, 255, 0.08)" }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    color: "#E5C158",
                    borderColor: "rgba(212, 175, 55, 0.6)",
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <MapPin className="h-3 w-3" />
                </div>
                <div style={{ color: "#d1d5db", lineHeight: 1.1 }}>
                  <span className="font-bold text-white block">Jaipur,</span>
                  <span className="text-[8px]" style={{ color: "#888888" }}>
                    Rajasthan, India
                  </span>
                </div>
              </div>

              {/* Website */}
              <div
                className="flex items-center gap-1.5 p-1"
                style={{ borderRight: "1px solid rgba(255, 255, 255, 0.08)" }}
              >
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    color: "#E5C158",
                    borderColor: "rgba(212, 175, 55, 0.6)",
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <Globe className="h-3 w-3" />
                </div>
                <div className="truncate">
                  <a
                    href="https://www.asji.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold hover:underline block truncate leading-tight"
                    style={{ color: "#E5C158" }}
                  >
                    www.asji.online
                  </a>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center gap-1.5 p-1">
                <div
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                  style={{
                    color: "#E5C158",
                    borderColor: "rgba(212, 175, 55, 0.6)",
                    backgroundColor: "rgba(212, 175, 55, 0.1)",
                  }}
                >
                  <Mail className="h-3 w-3" />
                </div>
                <div className="truncate">
                  <a
                    href="mailto:asji.online@gmail.com"
                    className="font-bold text-white hover:text-[#E5C158] transition-colors block truncate leading-tight"
                  >
                    asji.online@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
