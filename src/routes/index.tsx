import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  AlertTriangle,
  Award,
  CheckCircle2,
  Download,
  Globe,
  Loader2,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Key,
  FileCode2,
  Shield,
  XCircle,
  Scale,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { downloadReportAsPdf } from "@/lib/pdf-export";
import { motion } from "motion/react";
import logo from "@/assets/asji-logo.jpg.asset.json";
import { AnimatedLogo } from "@/components/AnimatedLogo";
import { STATUTORY_FRAMEWORKS } from "@/lib/audit-statutes";
import { ScanLoader } from "@/components/ScanLoader";
import { ScoreWheel } from "@/components/ScoreWheel";
import { LinkedInShareButton } from "@/components/LinkedInShareButton";
import { GroundedSearchCard } from "@/components/GroundedSearchCard";
import { FineExposureCard } from "@/components/FineExposureCard";
import { CountryLegalVerdictCard } from "@/components/CountryLegalVerdictCard";
import { LocalizationScannerCard } from "@/components/LocalizationScannerCard";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";
import { ASJiVectorLogo } from "@/components/ASJiVectorLogo";
import { RemediationBillingModal } from "@/components/RemediationBillingModal";
import { RemediationViewer } from "@/components/RemediationViewer";
import { IntermediaryShieldCard } from "@/components/IntermediaryShieldCard";
import { SovereignLegalMatrix } from "@/components/SovereignLegalMatrix";
import { WorldLawsAtlas } from "@/components/WorldLawsAtlas";
import { StatutoryLegalSolutionCard } from "@/components/StatutoryLegalSolutionCard";
import { StatutoryGrievanceNotice } from "@/components/StatutoryGrievanceNotice";
import type { RetentionOption } from "@/components/AutoDeletionSecurity";
import { Footer } from "@/components/Footer";
import { detectInput, validateAuditInput } from "@/lib/audit-input";
import { auditCompliance, purgeDatabase, type AuditReport } from "@/lib/audit.functions";
import { AUTHORISATION_NOTICE, LEGAL, LEGAL_PAGES, NOT_LEGAL_ADVICE } from "@/lib/legal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASJi One" },
      {
        name: "description",
        content: "Global Data privacy Compliance fixer",
      },
      { property: "og:title", content: "ASJi One" },
      {
        property: "og:description",
        content: "Global Data privacy Compliance fixer",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "ASJi One" },
      {
        name: "twitter:description",
        content: "Global Data privacy Compliance fixer",
      },
    ],
  }),
  component: Index,
});

type Phase = "idle" | "scanning" | "result";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-destructive/50 text-destructive",
  high: "border-destructive/40 text-destructive",
  medium: "border-primary/40 text-primary",
  low: "border-border text-muted-foreground",
};

const reportContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const reportItemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

function Index() {
  const [input, setInput] = useState("");
  const [selectedFramework, setSelectedFramework] = useState<string>("ind-dpdp");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState("");
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [initialBillingTier, setInitialBillingTier] = useState<
    "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle"
  >("full-bundle");
  const [unlockedTiers, setUnlockedTiers] = useState<string[]>([]);
  const [showDetailedAnnexes, setShowDetailedAnnexes] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [retentionMode, setRetentionMode] = useState<RetentionOption>("5min");
  const [scanMode, setScanMode] = useState<"deep-grounded" | "fast-lite">("deep-grounded");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const scanRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const runAudit = useServerFn(auditCompliance);
  const purgeDbServer = useServerFn(purgeDatabase);

  const handleDownloadReportPdf = async () => {
    const paperElement = document.getElementById("asji-letterhead-report-paper");
    if (!paperElement) {
      window.print();
      return;
    }
    setIsDownloadingPdf(true);
    try {
      const success = await downloadReportAsPdf(
        paperElement,
        report?.target || scanned || "audit-report",
      );
      if (success) {
        toast.success("Audit Report Downloaded", {
          description: `Official ASJi compliance certificate saved for ${report?.target || scanned}`,
        });
      }
    } catch (e) {
      console.error("PDF download failed", e);
      window.print();
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handlePurge = () => {
    setReport(null);
    setInput("");
    setScanned("");
    setPhase("idle");
    setError(null);
    try {
      sessionStorage.clear();
      purgeDbServer();
    } catch {
      // ignore
    }
  };

  // Restore unlock state for scanned domain if previously purchased
  useEffect(() => {
    if (report?.target) {
      const domain = report.target.replace(/^https?:\/\//i, "").split("/")[0];
      try {
        const storedTiers = JSON.parse(
          localStorage.getItem(`asji_unlocked_tiers_${domain}`) || "[]",
        );
        const isDomainUnlocked = localStorage.getItem(`asji_unlocked_${domain}`) === "true";
        const isGlobalUnlocked = localStorage.getItem("asji_unlocked_global") === "true";
        if (storedTiers.length > 0) {
          setUnlockedTiers(storedTiers);
        } else if (isDomainUnlocked || isGlobalUnlocked) {
          setUnlockedTiers(["full-bundle"]);
        }
      } catch {
        // ignore
      }
    }
  }, [report]);

  const isCodePatchesUnlocked =
    unlockedTiers.includes("patch-code") || unlockedTiers.includes("full-bundle");

  const isLegalUnlocked =
    unlockedTiers.includes("full-bundle") ||
    unlockedTiers.includes("gdpr-global") ||
    (unlockedTiers.includes("dpdp-india") && selectedFramework === "ind-dpdp");

  const handleOpenUnlockModal = (
    tier: "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle" = "full-bundle",
  ) => {
    setInitialBillingTier(tier);
    setUnlockOpen(true);
  };

  const handleUnlockSuccess = (
    tierId: "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle",
  ) => {
    setUnlockedTiers((prev) => (prev.includes(tierId) ? prev : [...prev, tierId]));
  };

  useEffect(() => {
    if (phase !== "scanning") return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => (p >= 94 ? p : p + Math.random() * 4 + 1));
    }, 220);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "scanning") {
      const t = setTimeout(() => {
        scanRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      return () => clearTimeout(t);
    } else if (phase === "result") {
      const t = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const trimmed = input.trim();
  const detected = trimmed.length >= 3 ? detectInput(trimmed) : null;
  const liveCheck = trimmed.length >= 3 ? validateAuditInput(trimmed) : null;

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (phase === "scanning") return;
    if (!agreed) {
      setError("Please confirm you are authorised to scan this target and accept the Terms.");
      return;
    }
    const validation = validateAuditInput(value);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    const label =
      validation.detected.kind === "url"
        ? validation.detected.host!
        : "your infrastructure description";
    setScanned(label.slice(0, 60));
    setPhase("scanning");
    try {
      const result = await runAudit({ data: { input: value, scanMode } });
      setProgress(100);
      setReport(result);
      setPhase("result");
    } catch (err) {
      let msg = "Analysis failed. Please try again.";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      }

      if (msg.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error?.message) {
            msg = parsed.error.message;
          }
        } catch {
          /* keep original */
        }
      }

      if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
        msg =
          "The AI model engine is currently experiencing temporary peak traffic. Click 'Analyze Domain Compliance' to retry.";
      }

      setError(msg);
      setPhase("idle");
    }
  };

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-screen flex flex-col justify-between">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 sm:px-6 py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="relative h-10 w-10 sm:h-11 sm:w-11 shrink-0 overflow-hidden rounded-xl border border-primary/30 bg-black/80 shadow-md shadow-primary/10 p-0.5">
            <AnimatedLogo
              size="sm"
              withGlow={false}
              withRays={false}
              idSuffix="nav_emblem"
              className="h-full w-full"
            />
          </div>
          <div className="leading-tight text-left">
            <p className="font-display text-xl sm:text-2xl tracking-tight text-gold-gradient font-bold">
              ASJi One
            </p>
            <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-medium">
              Trust Intelligence
            </p>
          </div>
        </motion.div>

        <nav className="flex items-center gap-5 sm:gap-7 text-xs sm:text-sm text-muted-foreground font-medium">
          <a href="#scan" className="transition-colors hover:text-primary">
            Scanner
          </a>
          <a href="#capabilities" className="transition-colors hover:text-primary">
            Capabilities
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 pb-24 flex-1">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-8 pb-16 text-center sm:pt-14"
        >
          <div className="mb-4 inline-flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 px-3.5 py-1 text-xs uppercase tracking-wider text-primary bg-primary/10 font-mono font-semibold">
              <ShieldCheck className="h-3.5 w-3.5" /> 14+ Sovereign Global Jurisdictions //
              Remediation Patches &amp; Legal Solutions
            </span>
          </div>
          <h1 className="mt-2 font-display text-3xl leading-tight sm:text-5xl lg:text-6xl text-gold-gradient max-w-4xl mx-auto font-extrabold tracking-tight">
            Audit Any Domain Against Global Privacy Laws.
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed text-muted-foreground font-mono">
            Inspect tracking cookies, consent mechanisms, and server security headers across{" "}
            <strong>14+ sovereign global jurisdictions</strong>—including India (DPDP Act 2023),
            European Union (GDPR), United Kingdom (DUAA 2026), United States (CPRA/CCPA), UAE
            (PDPL), Saudi Arabia (PDPL), Singapore (PDPA), Brazil (LGPD), Canada (PIPEDA),
            Australia, Japan (APPI), South Korea (PIPA), Switzerland (FADP), and Nigeria (NDPA).
            Pinpoint statutory non-compliance violations, estimate legal fine exposure, and unlock
            both <strong>autonomous remediation code patches</strong> and{" "}
            <strong>bespoke statutory legal solutions</strong>.
          </p>

          <form
            id="scan"
            onSubmit={startScan}
            className="surface-panel mx-auto mt-10 w-full max-w-2xl space-y-4 p-5 sm:p-6 text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="site-input"
                  className="text-xs font-semibold uppercase tracking-wider text-gold-gradient flex items-center gap-1.5 font-mono"
                >
                  <Globe className="h-3.5 w-3.5 text-primary" /> ENTER PRODUCTION TARGET DOMAIN
                </label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Automated Inspection
                </span>
              </div>
              <div className="relative flex items-center">
                <Globe className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  id="site-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={8000}
                  placeholder="e.g., https://enterprise-gateway.com"
                  className="w-full rounded-xl bg-input/40 pl-11 pr-10 py-3.5 text-base font-mono text-foreground outline-none ring-1 ring-border transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/60 min-h-[48px]"
                />
                {input && (
                  <button
                    type="button"
                    onClick={() => setInput("")}
                    className="absolute right-3.5 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                    aria-label="Clear input"
                  >
                    <XCircle className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Statutory Regulatory Framework Selector */}
            <div>
              <label
                htmlFor="framework-select"
                className="text-xs font-semibold uppercase tracking-wider text-gold-gradient flex items-center gap-1.5 font-mono mb-2"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Statutory Regulatory Framework:
              </label>
              <select
                id="framework-select"
                value={selectedFramework}
                onChange={(e) => setSelectedFramework(e.target.value)}
                className="w-full rounded-xl border border-border/80 bg-black/80 px-4 py-3 text-sm font-mono text-foreground outline-none transition-all focus:border-primary/60 focus:ring-1 focus:ring-primary/60 min-h-[48px] cursor-pointer"
              >
                {STATUTORY_FRAMEWORKS.map((fw) => (
                  <option key={fw.id} value={fw.id} className="bg-black text-foreground py-1.5">
                    {fw.flag} {fw.country}: {fw.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Domain Suggestion Chips */}
            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto no-scrollbar py-1 flex-nowrap sm:flex-wrap">
              <span className="text-[11px] text-muted-foreground mr-1 font-mono shrink-0">
                Quick Test:
              </span>
              {["enterprise-gateway.com", "hostinger.com", "github.com", "wikipedia.org"].map(
                (domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => {
                      setInput(`https://${domain}`);
                      setError(null);
                    }}
                    className="shrink-0 rounded-full border border-border/80 bg-secondary/40 px-3 py-1.5 text-[11px] font-mono text-muted-foreground transition-all hover:border-primary/50 hover:bg-secondary hover:text-foreground cursor-pointer min-h-[32px] flex items-center"
                  >
                    {domain}
                  </button>
                ),
              )}
            </div>

            {detected && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-left font-mono">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {detected.kind === "url"
                    ? "Live Domain Scan Active"
                    : "Custom Stack Text Detected"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {detected.kind === "url"
                    ? `Inspecting ${detected.host}...`
                    : liveCheck && !liveCheck.ok
                      ? liveCheck.error
                      : "Custom Stack Mode"}
                </span>
              </div>
            )}

            {/* Terms Consent Checkbox */}
            <label className="flex items-start gap-3 px-1 text-left text-[11px] leading-relaxed text-muted-foreground font-mono">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary rounded border-border"
              />
              <span>
                I own this target or am authorised in writing to assess it, and I accept the{" "}
                <Link to="/legal/terms" className="text-primary underline-offset-2 hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link
                  to="/legal/acceptable-use"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Acceptable Use Policy
                </Link>{" "}
                and{" "}
                <Link
                  to="/legal/privacy"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
                . Reports are informational technical audits and not formal legal advice.
              </span>
            </label>

            <button
              type="submit"
              disabled={phase === "scanning" || !agreed || (liveCheck ? !liveCheck.ok : true)}
              className="btn-gold w-full rounded-xl px-8 py-4 text-xs sm:text-sm font-bold uppercase tracking-wider disabled:opacity-60 shadow-lg transition-all hover:scale-[1.01] font-mono cursor-pointer"
            >
              {phase === "scanning" ? "Running Deep Domain Scan..." : "Analyze Domain Compliance"}
            </button>

            <p className="px-1 text-left text-[10px] leading-relaxed text-muted-foreground/80 font-mono">
              {AUTHORISATION_NOTICE}
            </p>

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-left text-xs text-destructive flex flex-col gap-2 font-mono">
                <p className="font-semibold text-xs flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Audit Inspection Notice</span>
                </p>
                <p className="leading-relaxed">{error}</p>
                <button
                  type="submit"
                  className="mt-1 self-start rounded-lg bg-destructive/20 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/30 transition-all cursor-pointer"
                >
                  Retry Scan
                </button>
              </div>
            )}
          </form>

          {/* REAL-TIME MULTI-REGION METRIC BADGES */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="surface-panel p-4 border border-primary/20 bg-black/60 rounded-2xl">
              <p className="font-mono text-xs font-bold text-gold-gradient">
                120+ Real-Time Checks // Automated interface stack evaluations.
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
                Deterministic security &amp; telemetry inspection.
              </p>
            </div>
            <div className="surface-panel p-4 border border-primary/20 bg-black/60 rounded-2xl">
              <p className="font-mono text-xs font-bold text-gold-gradient">
                &lt; 30s Scan Performance // Rapid technical assessment.
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
                Headless browser verification &amp; transit trace.
              </p>
            </div>
            <div className="surface-panel p-4 border border-primary/20 bg-black/60 rounded-2xl">
              <p className="font-mono text-xs font-bold text-gold-gradient">
                14+ Global Jurisdictions // Sovereign framework coverage.
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
                Cross-border statutory routing maps &amp; continuous regulatory sync.
              </p>
            </div>
          </div>

          {/* Statutory Legal Disclaimer & Intermediary Safe Harbor Banner */}
          <div className="mx-auto mt-6 max-w-4xl rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 text-left font-mono text-xs">
            <div className="flex items-start gap-3">
              <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-foreground flex items-center gap-2">
                  <span>Statutory Legal Disclaimer &amp; Intermediary Safe Harbor Notice</span>
                  <span className="text-[10px] text-primary bg-primary/10 border border-primary/30 px-2 py-0.5 rounded">
                    Strict Operator Protection
                  </span>
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  ASJi One is an automated diagnostic software and technical verification platform.
                  Audits, gap analyses, and sample policies generated by this platform are technical
                  and informational templates designed to assist engineering and compliance teams.
                  They do not constitute formal attorney-client legal representation or statutory
                  legal advice. Organizations must have final notices reviewed by their qualified
                  legal counsel.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {phase === "scanning" && (
          <section ref={scanRef} className="surface-panel px-5 my-8 scroll-mt-12">
            <ScanLoader progress={progress} url={scanned} />
          </section>
        )}

        {phase === "result" && report && (
          <motion.section
            id="report-results"
            ref={resultRef}
            variants={reportContainerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6 scroll-mt-8"
          >
            {/* Legal Disclaimer Header Banner */}
            <motion.div
              variants={reportItemVariants}
              className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-left"
            >
              <p className="text-[10px] uppercase tracking-[0.24em] text-primary">
                Informational report · Not legal advice
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {NOT_LEGAL_ADVICE}{" "}
                <Link
                  to="/legal/disclaimer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Read the full disclaimer
                </Link>
                .
              </p>
            </motion.div>

            {/* Core Score Panel */}
            <motion.div
              variants={reportItemVariants}
              className="surface-panel flex flex-col items-center gap-8 p-8 lg:flex-row lg:items-center lg:gap-14"
            >
              <ScoreWheel score={report.score} />
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-3 mb-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-black/60 p-1 shadow-md overflow-hidden">
                    <ASJiVectorLogo className="h-full w-full" idSuffix="result_badge" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-gold-gradient">
                    ASJi One // Technical Compliance Assessment
                  </span>
                </div>
                <div className="flex flex-wrap items-center justify-center lg:justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      ASJi Trust Index (Technical Risk Indicator) for
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-gold-gradient break-all">
                      {report.target || scanned}
                    </h2>
                  </div>
                  <LinkedInShareButton
                    domain={report.target || scanned}
                    score={report.score}
                    report={report}
                  />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Origin: {report.originCountry}
                </p>
                <div className="gold-rule my-5" />
                <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                {report.provenance && (
                  <div className="mt-5 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                    {report.hasModifiedSinceLastScan === false && (
                      <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-400 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 shrink-0" /> Live Re-verified · No Site
                        Changes Detected · Score Preserved
                      </span>
                    )}
                    {report.hasModifiedSinceLastScan === true && (
                      <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400 flex items-center gap-1.5">
                        <RefreshCw className="h-3 w-3 shrink-0" /> Site Changes Detected · Score
                        Updated (Was {report.previousScore}/100 → Now {report.score}/100)
                      </span>
                    )}
                    <span className="rounded-full border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary">
                      {report.provenance.confidence} confidence
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {report.provenance.method === "live-http-scan"
                        ? "Live HTTP scan"
                        : "Operator description"}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {(report.provenance.durationMs / 1000).toFixed(1)}s ·{" "}
                      {new Date(report.provenance.scannedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <a
                    href="#asji-letterhead-report-paper"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowDetailedAnnexes(true);
                      setTimeout(() => {
                        document
                          .getElementById("asji-letterhead-report-paper")
                          ?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }, 100);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-primary/60 bg-primary/20 px-6 py-3 text-xs font-mono font-bold text-primary transition-all hover:bg-primary/30 shadow-lg cursor-pointer"
                  >
                    <Award className="h-4 w-4 text-primary" />
                    <span>View Official Report Card</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setPhase("idle");
                      setReport(null);
                    }}
                    className="rounded-xl border border-border px-6 py-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                  >
                    Analyze another
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Statutory Intermediary Safe Harbor Shield Assessment */}
            <motion.div variants={reportItemVariants}>
              <IntermediaryShieldCard
                report={report}
                onOpenRemediationModal={() => setUnlockOpen(true)}
              />
            </motion.div>

            {/* Fine Exposure Card (DPDP Act 2023 & Global Jurisdictions) */}
            <motion.div variants={reportItemVariants}>
              <FineExposureCard report={report} />
            </motion.div>

            {/* Country-by-Country Legal Pass vs Wholly Fail Audit */}
            <motion.div variants={reportItemVariants}>
              <CountryLegalVerdictCard
                report={report}
                onOpenRemediationModal={() => setUnlockOpen(true)}
              />
            </motion.div>

            {/* Top Critical Findings */}
            {report.criticalLeaks?.length > 0 && (
              <motion.div variants={reportItemVariants} className="surface-panel p-5 sm:p-7">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg sm:text-xl text-gold-gradient font-bold">
                    Key Compliance Exposures
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {report.criticalLeaks.length} Actionable Vulnerabilities Detected
                  </span>
                </div>
                <div className="gold-rule my-4" />
                <ul className="space-y-3.5">
                  {report.criticalLeaks.slice(0, 3).map((leak) => (
                    <li
                      key={leak.title}
                      className="rounded-xl border border-border/50 bg-secondary/15 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{leak.title}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            SEVERITY_STYLES[leak.severity] ?? SEVERITY_STYLES.low
                          }`}
                        >
                          {leak.severity}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                        {leak.detail}
                      </p>
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}

            {/* Regulatory Framework Grid with Statutory Pass/Fail status */}
            {report.frameworks?.length > 0 && (
              <motion.div
                variants={reportItemVariants}
                className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
              >
                {report.frameworks.map((f) => {
                  const isPass = f.score >= 70;
                  const isWarning = f.score >= 45 && f.score < 70;
                  const isFail = f.score < 45;

                  return (
                    <div
                      key={f.name}
                      className="surface-panel card-hover fps-120 p-4 sm:p-5 flex flex-col justify-between cursor-default"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                            {f.name}
                          </p>
                          <span className="font-display text-base sm:text-lg text-gold-gradient font-bold shrink-0">
                            {f.score}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 ${
                              isPass
                                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                                : isWarning
                                  ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                                  : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                            }`}
                          >
                            {isPass && <CheckCircle2 className="h-2.5 w-2.5" />}
                            {isWarning && <AlertTriangle className="h-2.5 w-2.5" />}
                            {isFail && <XCircle className="h-2.5 w-2.5" />}
                            {isPass
                              ? "STATUTORY PASS"
                              : isWarning
                                ? "CONDITIONAL"
                                : "STATUTORY FAIL"}
                          </span>
                        </div>

                        <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{
                              width: `${Math.max(0, Math.min(100, f.score))}%`,
                              backgroundImage: isPass
                                ? "linear-gradient(90deg, #10b981, #059669)"
                                : isWarning
                                  ? "linear-gradient(90deg, #f59e0b, #d97706)"
                                  : "linear-gradient(90deg, #ef4444, #dc2626)",
                            }}
                          />
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground leading-relaxed">{f.note}</p>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Automated Remediation Code Patches Suite */}
            <motion.div variants={reportItemVariants}>
              {isCodePatchesUnlocked ? (
                <RemediationViewer report={report} />
              ) : (
                <div className="surface-panel relative overflow-hidden p-6 sm:p-8 border-primary/40">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display text-xl font-bold text-gold-gradient">
                          Automated Remediation Code Patches
                        </h3>
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
                          Ready To Deploy
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Compiled syntax-valid server scripts, edge middleware, and pre-consent
                        cookie gates tailored specifically for {report.target || "your domain"}.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                        Instant Patch: ₹24,999 ($300)
                      </span>
                    </div>
                  </div>

                  {/* Patch Inventory Preview Grid */}
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      {
                        name: "security-headers.nginx.conf",
                        desc: "NGINX production server header hardening",
                        cat: "Server",
                      },
                      {
                        name: "middleware.ts",
                        desc: "Cloudflare Worker & Next.js edge transport shield",
                        cat: "Edge",
                      },
                      {
                        name: "asji-consent-manager.js",
                        desc: "Zero-leak pre-consent cookie gating CMP script",
                        cat: "Client",
                      },
                      {
                        name: ".htaccess",
                        desc: "Apache security directives & anti-sniffing rules",
                        cat: "Server",
                      },
                      {
                        name: "security-headers.express.ts",
                        desc: "Node.js Express Helmet security middleware",
                        cat: "Server",
                      },
                      {
                        name: ".well-known/security.txt",
                        desc: "RFC 9116 statutory vulnerability disclosure",
                        cat: "Statutory",
                      },
                    ].map((patch, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/60 bg-secondary/20 p-3.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-primary font-bold uppercase">
                              {patch.cat}
                            </span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              🔒 Locked
                            </span>
                          </div>
                          <p className="mt-1 text-xs font-mono font-semibold text-foreground">
                            {patch.name}
                          </p>
                          <p className="mt-1 text-[11px] text-muted-foreground leading-snug">
                            {patch.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Blurred Code Teaser */}
                  <div className="relative mt-4 rounded-xl bg-black/80 border border-border p-4 select-none blur-[4px]">
                    <pre className="font-mono text-xs text-emerald-400">
                      <code>
                        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains;
                        preload" always;{"\n"}
                        add_header Content-Security-Policy "default-src 'self'; script-src 'self'
                        'unsafe-inline' https:; frame-ancestors 'none';" always;{"\n"}
                        add_header X-Content-Type-Options "nosniff" always;{"\n"}
                        add_header X-Frame-Options "DENY" always;{"\n"}
                        proxy_cookie_flags ~* "Secure; HttpOnly; SameSite=Lax";
                      </code>
                    </pre>
                  </div>

                  {/* CTA Overlay */}
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/10 p-5">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Deliver turnkey code patches and executive certificates to your client
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Upon unlocking, export ready-to-run configurations and official client
                        handover packs instantly.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenUnlockModal("patch-code")}
                      className="btn-gold rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-wider text-black cursor-pointer shadow-lg shadow-primary/20 shrink-0"
                    >
                      Unlock Code Patches (₹24,999)
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Tailored Statutory Legal Solution & What You Don't Follow Under Your Privacy Law */}
            <motion.div variants={reportItemVariants}>
              <StatutoryLegalSolutionCard
                report={report}
                frameworkId={selectedFramework}
                isUnlocked={isLegalUnlocked}
                unlockedTier={unlockedTiers[unlockedTiers.length - 1] || null}
                onOpenUnlockModal={(tier) =>
                  handleOpenUnlockModal(
                    (tier as "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle") ||
                      (selectedFramework === "ind-dpdp" ? "dpdp-india" : "gdpr-global"),
                  )
                }
              />
            </motion.div>

            {/* Expandable Technical Engineering Logs & Statutory Annexes */}
            <motion.div variants={reportItemVariants} className="pt-2">
              <button
                type="button"
                onClick={() => setShowDetailedAnnexes(!showDetailedAnnexes)}
                className="w-full flex items-center justify-between rounded-xl border border-border/70 bg-secondary/30 p-4 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/60 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>
                    {showDetailedAnnexes
                      ? "Hide Official Certificate & Audit Annexes"
                      : "View Official Certificate, Grounded Search Evidence & Localization Annexes"}
                  </span>
                </div>
                {showDetailedAnnexes ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {showDetailedAnnexes && (
                <div className="mt-6 space-y-6 animate-in fade-in duration-300">
                  {/* Official ASJi Web & Legal Solution Audit Certificate */}
                  <ASJiLetterheadReport
                    report={report}
                    domain={report.target || scanned}
                    score={report.score}
                  />

                  {/* Google Search Grounding Section */}
                  <GroundedSearchCard grounding={report.grounding} />

                  {/* Live Scan Evidence */}
                  {report.evidence?.length > 0 && (
                    <div className="surface-panel p-6">
                      <h3 className="font-display text-xl text-gold-gradient">
                        {report.inputKind === "url" ? "Live scan evidence" : "Assessment basis"}
                      </h3>
                      <div className="gold-rule my-4" />
                      <ul className="space-y-2.5">
                        {report.evidence.map((item, i) => (
                          <li
                            key={i}
                            className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Global & Regional Language Notice Scanner Card */}
                  <LocalizationScannerCard
                    report={report}
                    onOpenRemediationModal={() => handleOpenUnlockModal("full-bundle")}
                  />
                </div>
              )}
            </motion.div>

            <RemediationBillingModal
              isOpen={unlockOpen}
              onClose={() => setUnlockOpen(false)}
              onUnlockSuccess={handleUnlockSuccess}
              report={report}
              frameworkId={selectedFramework}
              initialTier={initialBillingTier}
            />
          </motion.section>
        )}

        {/* STARTING PAGE CONTENT - SHOWN WHEN NO ACTIVE AUDIT REPORT */}
        {!report && (
          <div className="mt-12 space-y-14">
            {/* 3-Step Work Focus Pipeline */}
            <section className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/5 via-black/40 to-transparent p-6 sm:p-8">
              <div className="text-center max-w-2xl mx-auto">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                  Streamlined Statutory Audit Pipeline
                </span>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
                  How ASJi One Identifies Gaps &amp; Solves Compliance
                </h2>
                <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-mono">
                  Controlled, deterministic, and non-disruptive inspection across 14+ sovereign
                  global privacy mandates.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-border/80 bg-black/60 p-5 font-mono">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/30 font-bold mb-3">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Target &amp; Law Selection</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Input your production domain and select from 14+ sovereign jurisdictions (India
                    DPDP 2023, EU GDPR, UK DUAA, US CPRA, UAE PDPL, etc.).
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-black/60 p-5 font-mono">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 font-bold mb-3">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-foreground">Statutory Gaps Pinpointed</h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Automated scan detects pre-consent tracking, missing privacy notices,
                    unappointed grievance officers, and fine risks under that specific statute.
                  </p>
                </div>

                <div className="rounded-2xl border border-border/80 bg-black/60 p-5 font-mono">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold mb-3">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-foreground">
                    Patches &amp; Legal Solutions
                  </h3>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    Receive both autonomous engineering code patches (NGINX, Cloudflare, Express,
                    CMP) and tailored statutory legal solutions &amp; policies.
                  </p>
                </div>
              </div>
            </section>

            {/* Supported Sovereign Jurisdictions - 14+ Bento Cards with quick select */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6">
                <div>
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
                    Cross-Border Statutory Coverage
                  </span>
                  <h2 className="font-display text-2xl font-bold text-gold-gradient">
                    Supported Sovereign Privacy Mandates (14+ Global Jurisdictions)
                  </h2>
                </div>
                <span className="text-xs font-mono text-muted-foreground">
                  Click any card to activate framework
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {STATUTORY_FRAMEWORKS.map((fw) => {
                  const isSelected = selectedFramework === fw.id;
                  return (
                    <div
                      key={fw.id}
                      onClick={() => {
                        setSelectedFramework(fw.id);
                        document.getElementById("scan")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`group cursor-pointer rounded-2xl border p-5 transition-all font-mono ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                          : "border-border/80 bg-black/50 hover:border-primary/50 hover:bg-black/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{fw.flag}</span>
                        <span className="rounded bg-secondary/80 px-2 py-0.5 text-[10px] text-muted-foreground uppercase">
                          {fw.region}
                        </span>
                      </div>
                      <h3 className="mt-3 font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {fw.country}: {fw.label}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Enforced by <strong className="text-foreground">{fw.authority}</strong>
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                        <span className="text-[11px] text-primary font-semibold">
                          {isSelected ? "Active Framework ✓" : "Select Node →"}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Deterministic Audit
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Direct World Laws Database Atlas & Sovereign Matrix */}
            <div className="space-y-14">
              <WorldLawsAtlas />
              <SovereignLegalMatrix
                onOpenRemediationModal={() => handleOpenUnlockModal("gdpr-global")}
                isUnlocked={isLegalUnlocked}
              />
            </div>
          </div>
        )}

        <StatutoryGrievanceNotice />

        <section id="capabilities" className="mt-20 scroll-mt-8">
          <h2 className="text-center font-display text-3xl text-gold-gradient font-bold">
            Capabilities &amp; Core Architecture
          </h2>
          <div className="gold-rule mx-auto mt-5 max-w-xs" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Cross-Border Transit Mapping",
                "ASJi One performs controlled runtime network inspection to analyse relevant outbound traffic and data-flow signals across sovereign territorial borders.",
              ],
              [
                "Threat Surface Mapping",
                "Enumerate exposed endpoints, mixed content and insecure origins across active client interaction frames.",
              ],
              [
                "Consent Forensics",
                "Verify banner behaviour, pre-consent cookies, and storage writes against active regional DPDP / GDPR statutes.",
              ],
              [
                "Regulatory Alignment",
                "Cross-border statutory mandates audited across 6 sovereign nodes with deterministic compliance logging.",
              ],
              [
                "Header Hardening",
                "CSP, HSTS, referrer and frame policy evaluation with automated runtime isolation patch compilation.",
              ],
              [
                "Vendor Visibility",
                "Identify third-party scripts, telemetry listeners, and external data transport pathways through non-disruptive runtime verification.",
              ],
            ].map(([t, d]) => (
              <article
                key={t}
                className="surface-panel card-hover fps-120 p-6 border border-border/80 bg-black/60 rounded-2xl transition-all hover:border-primary/50 font-mono"
              >
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider text-gold-gradient">
                  {t}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
