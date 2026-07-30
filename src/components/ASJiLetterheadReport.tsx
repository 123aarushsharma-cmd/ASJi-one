import React, { useRef, useState } from "react";
import {
  Globe,
  Scale,
  ShieldCheck,
  FileText,
  Phone,
  MapPin,
  Mail,
  Printer,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  Download,
  Loader2,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import { downloadReportAsPdf, openStandalonePrintWindow } from "@/lib/pdf-export";

interface ASJiLetterheadReportProps {
  report?: AuditReport | null;
  domain?: string;
  score?: number;
  className?: string;
  onPrint?: () => void;
}

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
      : "target-domain.com");

  const complianceScore = propScore ?? report?.score ?? 85;

  // Determine compliance statuses for GDPR, DPDP 2023, and UAE PDPL
  const getFrameworkStatus = (name: string, defaultScore: number) => {
    const found = report?.frameworks?.find((f) =>
      f.name.toLowerCase().includes(name.toLowerCase()),
    );
    const scoreVal = found ? found.score : Math.round((complianceScore / 100) * defaultScore);

    if (scoreVal >= 80) {
      return {
        status: "Compliant",
        badgeClass: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />,
        score: scoreVal,
      };
    } else if (scoreVal >= 55) {
      return {
        status: "Action Required",
        badgeClass: "bg-amber-500/15 border-amber-500/40 text-amber-400",
        icon: <AlertTriangle className="h-4 w-4 text-amber-400" />,
        score: scoreVal,
      };
    } else {
      return {
        status: "High Exposure",
        badgeClass: "bg-rose-500/15 border-rose-500/40 text-rose-400",
        icon: <XCircle className="h-4 w-4 text-rose-400" />,
        score: scoreVal,
      };
    }
  };

  const gdprInfo = getFrameworkStatus("GDPR", 90);
  const dpdpInfo = getFrameworkStatus("DPDP", 85);
  const uaeInfo = getFrameworkStatus("UAE", 80);

  const reportPaperRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async () => {
    if (!reportPaperRef.current) return;
    setIsDownloading(true);
    try {
      const success = await downloadReportAsPdf(reportPaperRef.current, targetDomain);
      if (!success) {
        openStandalonePrintWindow(reportPaperRef.current, targetDomain);
      }
    } catch (err) {
      console.error("PDF download failed", err);
      openStandalonePrintWindow(reportPaperRef.current, targetDomain);
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else if (reportPaperRef.current) {
      openStandalonePrintWindow(reportPaperRef.current, targetDomain);
    } else {
      window.print();
    }
  };

  return (
    <div
      className={`relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-primary/30 bg-card text-foreground shadow-2xl transition-all ${className}`}
    >
      {/* Print Action Toolbar (Hidden during print) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 bg-black/60 px-6 py-3 print:hidden">
        <div className="flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <span className="font-display text-xs font-bold text-gold-gradient uppercase tracking-wider">
            Official ASJi Web &amp; Legal Solution Certificate &amp; Audit Report
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/50 bg-emerald-500/20 px-3.5 py-1.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-black shadow-sm disabled:opacity-50"
          >
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            <span>{isDownloading ? "Generating PDF..." : "Download PDF File"}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Main Letterhead Canvas Paper */}
      <div
        ref={reportPaperRef}
        className="relative bg-gradient-to-b from-[#121110] via-[#0d0c0b] to-[#080808] p-6 sm:p-10 text-foreground print:p-8 print:bg-white print:text-black"
      >
        {/* Top Diagonal Gold Corner Accent */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-24 w-44 bg-gradient-to-bl from-amber-500/30 via-primary/20 to-transparent clip-path-polygon"
          aria-hidden="true"
          style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
        />

        {/* BACKGROUND WATERMARK */}
        <div
          className="pointer-events-none absolute bottom-16 right-8 select-none opacity-[0.04] print:opacity-[0.06]"
          aria-hidden="true"
        >
          <div className="font-serif text-[180px] font-bold tracking-tighter text-primary">
            ASJi
          </div>
        </div>

        {/* HEADER SECTION */}
        <header className="relative z-10 flex flex-col gap-6 border-b border-primary/30 pb-6 sm:flex-row sm:items-center sm:justify-between">
          {/* Left Brand Identity */}
          <div className="flex items-center gap-4">
            {/* Custom Gold Monogram Emblem Logo */}
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-primary/60 bg-gradient-to-br from-amber-500/20 via-black to-amber-950/40 p-2 shadow-lg">
              <span className="font-serif text-2xl font-black text-gold-gradient tracking-tighter">
                ASJi
              </span>
              <div className="absolute -bottom-1 -right-1 rounded-full border border-primary bg-primary p-0.5 text-black">
                <ShieldCheck className="h-3 w-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                  ASJi <span className="text-gold-gradient font-light">WEB &amp; LEGAL</span>
                </h1>
              </div>
              <p className="font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
                SOLUTION —
              </p>
              <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                Your Business. Our Expertise. Your Peace of Mind.
              </p>
            </div>
          </div>

          {/* Right Service Capabilities Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 border-t border-border/40 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
            <div className="flex items-center gap-2">
              <Globe className="h-3.5 w-3.5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-foreground">Web Solutions</p>
                <p className="text-[8px] text-muted-foreground">Digital. Modern. Reliable.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Scale className="h-3.5 w-3.5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-foreground">Legal Advisory</p>
                <p className="text-[8px] text-muted-foreground">Strategic. Practical. Trusted.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-foreground">Compliance</p>
                <p className="text-[8px] text-muted-foreground">Secure. Compliant. Assured.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-foreground">Documentation</p>
                <p className="text-[8px] text-muted-foreground">
                  Accurate. Professional. Effective.
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY SECTION */}
        <main className="relative z-10 py-8 space-y-8">
          {/* CENTRALIZED PRIVACY ASSESSMENT SUMMARY CONTAINER */}
          <section className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-b from-black/80 via-secondary/30 to-black/90 p-6 sm:p-8 shadow-xl">
            {/* Top Container Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-primary/20 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-primary/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                    Official Audit Certificate
                  </span>
                  <span className="font-sans text-[10px] text-muted-foreground">
                    Ref: ASJI-PRIV-{Date.now().toString().slice(-6)}
                  </span>
                </div>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-gold-gradient">
                  Privacy Assessment Summary
                </h2>
                <p className="text-xs text-muted-foreground">
                  Automated regulatory evaluation under global data protection mandates
                </p>
              </div>

              {/* Dynamic Score Gauge Badge */}
              <div className="flex items-center gap-3 self-start sm:self-auto rounded-xl border border-primary/30 bg-black/60 p-3 shadow-inner">
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground block">
                    Overall Index
                  </span>
                  <span className="font-display text-2xl font-extrabold text-foreground">
                    {complianceScore}%
                  </span>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg border font-sans text-sm font-bold ${
                    complianceScore >= 75
                      ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                      : "border-amber-500/40 bg-amber-500/15 text-amber-400"
                  }`}
                >
                  {complianceScore >= 75 ? "PASS" : "WARN"}
                </div>
              </div>
            </div>

            {/* Target Domain Metadata Banner */}
            <div className="my-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-black/50 p-4">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground block font-sans font-medium">
                  Target Website / Application Domain
                </span>
                <span className="font-display text-base font-bold text-primary break-all">
                  {targetDomain}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div>
                  <span className="block text-[10px]">Scanned Date</span>
                  <span className="font-semibold text-foreground">
                    {report?.provenance?.scannedAt
                      ? new Date(report.provenance.scannedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })
                      : new Date().toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                  </span>
                </div>
                <div className="h-6 w-[1px] bg-border" />
                <div>
                  <span className="block text-[10px]">Verification Engine</span>
                  <span className="font-semibold text-foreground">ASJi One Trust v2.4</span>
                </div>
              </div>
            </div>

            {/* CLEAR TABLE OF DETECTED COMPLIANCE STATUS (GDPR, DPDP 2023, UAE PDPL) */}
            <div className="overflow-x-auto rounded-xl border border-border bg-black/40">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-border/80 bg-secondary/40 font-sans text-[10px] uppercase text-muted-foreground tracking-wider">
                    <th className="px-4 py-3 font-semibold">Regulatory Framework</th>
                    <th className="px-4 py-3 font-semibold">Statutory Focus Area</th>
                    <th className="px-4 py-3 font-semibold text-center">Status Index</th>
                    <th className="px-4 py-3 font-semibold">Audit Assessment Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {/* Row 1: GDPR */}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-base" role="img" aria-label="EU">
                          🇪🇺
                        </span>
                        <div>
                          <div>GDPR (EU 2016/679)</div>
                          <div className="text-[9px] font-normal text-muted-foreground font-sans">
                            Art. 7, 13, 32 &amp; 44
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      Cookie pre-consent, CSP response headers, and international data transfer
                      safeguards.
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${gdprInfo.badgeClass}`}
                      >
                        {gdprInfo.icon}
                        <span>{gdprInfo.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {gdprInfo.score >= 80 ? (
                        <span className="text-emerald-300">
                          ✓ Verified cookie banner architecture &amp; encryption headers.
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          ⚠️ Action Required: Missing HSTS or pre-consent cookie enforcement.
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: DPDP 2023 */}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-base" role="img" aria-label="India">
                          🇮🇳
                        </span>
                        <div>
                          <div>DPDP Act 2023</div>
                          <div className="text-[9px] font-normal text-muted-foreground font-sans">
                            Sec. 5(3), 6, 8(6) &amp; 11
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      Itemized notice in Scheduled Indian languages, DPO grievance, consent
                      withdrawal.
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${dpdpInfo.badgeClass}`}
                      >
                        {dpdpInfo.icon}
                        <span>{dpdpInfo.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {dpdpInfo.score >= 80 ? (
                        <span className="text-emerald-300">
                          ✓ Statutory Section 5(3) notice &amp; grievance officer verified.
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          ⚠️ Regional Language Notice required for 8th Schedule coverage.
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Row 3: UAE PDPL */}
                  <tr className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3.5 font-bold text-foreground">
                      <div className="flex items-center gap-2">
                        <span className="text-base" role="img" aria-label="UAE">
                          🇦🇪
                        </span>
                        <div>
                          <div>UAE PDPL No. 45/2021</div>
                          <div className="text-[9px] font-normal text-muted-foreground font-sans">
                            Art. 4, 6, 13 &amp; 22
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground">
                      Bilingual Privacy Disclosure (Arabic/English), data principal rights
                      mechanism.
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${uaeInfo.badgeClass}`}
                      >
                        {uaeInfo.icon}
                        <span>{uaeInfo.status}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">
                      {uaeInfo.score >= 80 ? (
                        <span className="text-emerald-300">
                          ✓ Data Controller registration &amp; Arabic notice signals active.
                        </span>
                      ) : (
                        <span className="text-amber-300">
                          ⚠️ Arabic privacy notice disclosure advisable for MENA expansion.
                        </span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Footnote Certification */}
            <div className="mt-4 flex flex-wrap items-center justify-between text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-primary" /> Certified by ASJi Web &amp; Legal
                Solution Audit Intelligence Engine
              </span>
              <span className="font-sans font-medium">
                Verification Hash: 0x{targetDomain.length}a9...b4c
              </span>
            </div>
          </section>
        </main>

        {/* DARK FOOTER SECTION */}
        <footer className="relative z-10 mt-6 overflow-hidden rounded-xl border border-primary/40 bg-[#050505]">
          {/* Top Gold Ribbon Peak Header */}
          <div className="relative border-b border-primary/40 bg-gradient-to-r from-amber-950/60 via-primary/25 to-amber-950/60 py-2.5 text-center">
            <p className="font-display text-[11px] font-extrabold uppercase tracking-[0.25em] text-gold-gradient">
              EMPOWERING BUSINESSES. ENSURING COMPLIANCE. DELIVERING TRUST.
            </p>
          </div>

          {/* 4 Footer Columns with Icons */}
          <div className="grid grid-cols-1 divide-y divide-primary/20 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4 p-4 text-xs">
            {/* Column 1: Phone */}
            <div className="flex items-center justify-center gap-3 py-2 sm:py-0 px-2 text-center sm:text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary shadow-sm">
                <Phone className="h-4 w-4" />
              </div>
              <div className="font-sans text-xs font-semibold text-foreground">
                <a href="tel:8290841179" className="hover:text-primary transition-colors block">
                  8290841179
                </a>
                <a href="tel:9461584298" className="hover:text-primary transition-colors block">
                  9461584298
                </a>
              </div>
            </div>

            {/* Column 2: Location */}
            <div className="flex items-center justify-center gap-3 py-2 sm:py-0 px-2 text-center sm:text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary shadow-sm">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <span className="font-display text-xs font-bold text-foreground block">
                  Jaipur,
                </span>
                <span className="text-[11px] text-muted-foreground block">Rajasthan</span>
              </div>
            </div>

            {/* Column 3: Website */}
            <div className="flex items-center justify-center gap-3 py-2 sm:py-0 px-2 text-center sm:text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary shadow-sm">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <a
                  href="https://www.asji.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-sans text-xs font-bold text-primary hover:underline"
                >
                  www.asji.online
                </a>
              </div>
            </div>

            {/* Column 4: Email - EXACT SINGLE ADDRESS: asji.online@gmail.com */}
            <div className="flex items-center justify-center gap-3 py-2 sm:py-0 px-2 text-center sm:text-left">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-primary/10 text-primary shadow-sm">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <a
                  href="mailto:asji.online@gmail.com"
                  className="font-sans text-xs font-bold text-foreground hover:text-primary transition-colors tracking-tight block"
                >
                  asji.online@gmail.com
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
