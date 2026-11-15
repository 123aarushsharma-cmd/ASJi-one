import { createFileRoute } from "@tanstack/react-router";
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
  Lock,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { downloadReportAsPdf } from "@/lib/pdf-export";
import { motion, AnimatePresence } from "motion/react";
import { TopNavbar } from "@/components/TopNavbar";
import { SovereignTelemetryGlobe } from "@/components/SovereignTelemetryGlobe";
import { HeroOrbitalRadar } from "@/components/HeroOrbitalRadar";
import { StatutoryTicker } from "@/components/StatutoryTicker";
import { SpecularCard } from "@/components/SpecularCard";
import { WorldLawsAtlas } from "@/components/WorldLawsAtlas";
import { PoliTechPage } from "@/components/pages/PoliTechPage";
import { PricingPage } from "@/components/pages/PricingPage";
import { AboutPage } from "@/components/pages/AboutPage";
import { LegalModal } from "@/components/LegalModal";
import { ScanLoader } from "@/components/ScanLoader";
import { ScoreWheel } from "@/components/ScoreWheel";
import { LocalizationScannerCard } from "@/components/LocalizationScannerCard";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";
import { RemediationBillingModal } from "@/components/RemediationBillingModal";
import { RemediationViewer } from "@/components/RemediationViewer";
import { IntermediaryShieldCard } from "@/components/IntermediaryShieldCard";
import { SovereignLegalMatrix } from "@/components/SovereignLegalMatrix";
import { StatutoryLegalSolutionCard } from "@/components/StatutoryLegalSolutionCard";
import { StatutoryGrievanceNotice } from "@/components/StatutoryGrievanceNotice";
import type { RetentionOption } from "@/components/AutoDeletionSecurity";
import { Footer } from "@/components/Footer";
import { detectInput, sanitizeAuditInput, validateAuditInput } from "@/lib/audit-input";
import {
  ITEMIZED_DATA_PROCESSING_NOTICE_CONTENT,
  ITEMIZED_DATA_PROCESSING_NOTICE_TITLE,
} from "@/lib/legal";
import { auditCompliance, type AuditReport } from "@/lib/audit.functions";
import { useAuth } from "@/lib/auth-context";
import {
  checkDomainPaymentUnlock,
  lookupAuditScanByRefId,
  normalizeDomainName,
  saveAuditScan,
  saveConsentRecord,
  saveUserAudit,
  type AuditScanRecord,
} from "@/lib/firestore-service";
import { STATUTORY_FRAMEWORKS } from "@/lib/audit-statutes";

const SCAN_RATE_LIMIT_MAX = 6;
const SCAN_RATE_LIMIT_WINDOW_MS = 60_000;
const SCAN_TIMESTAMPS_KEY = "asji_scan_timestamps";

function getRecentScanTimestamps(now: number): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SCAN_TIMESTAMPS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((ts): ts is number => typeof ts === "number" && Number.isFinite(ts))
      .filter((ts) => now - ts < SCAN_RATE_LIMIT_WINDOW_MS)
      .sort((a, b) => a - b);
  } catch {
    return [];
  }
}

function recordScanTimestamp(now: number): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentScanTimestamps(now);
    recent.push(now);
    localStorage.setItem(SCAN_TIMESTAMPS_KEY, JSON.stringify(recent.slice(-SCAN_RATE_LIMIT_MAX)));
  } catch {
    // ignore storage errors
  }
}

export const Route = createFileRoute("/")({
  head: () => ({}),
  component: Index,
});

type Phase = "idle" | "scanning" | "result";

function Index() {
  const { user, recordUserConsent } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "scanner" | "atlas" | "politech" | "pricing" | "about"
  >("scanner");
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
  const [agreed, setAgreed] = useState(false);
  const [politechMode, setPolitechMode] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [scanMode] = useState<"deep-grounded" | "fast-lite">("deep-grounded");
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  // Certificate Lookup State
  const [showCertLookup, setShowCertLookup] = useState(false);
  const [certLookupInput, setCertLookupInput] = useState("");
  const [certLookupLoading, setCertLookupLoading] = useState(false);
  const [certLookupResult, setCertLookupResult] = useState<AuditScanRecord | null>(null);
  const [certLookupError, setCertLookupError] = useState<string | null>(null);

  // Mobile accordion state for hero subheadline
  const [heroExpanded, setHeroExpanded] = useState(false);

  // Legal Modal State
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTitle, setLegalModalTitle] = useState("");
  const [legalModalContent, setLegalModalContent] = useState("");

  const scanRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const runAudit = useServerFn(auditCompliance);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as
        "scanner" | "atlas" | "politech" | "pricing" | "about";
      if (["scanner", "atlas", "politech", "pricing", "about"].includes(hash)) {
        setActiveTab(hash);
      }
    };
    const handleCustomTabChange = (e: Event) => {
      const custom = e as CustomEvent<"scanner" | "atlas" | "politech" | "pricing" | "about">;
      if (
        custom.detail &&
        ["scanner", "atlas", "politech", "pricing", "about"].includes(custom.detail)
      ) {
        setActiveTab(custom.detail);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    window.addEventListener("asji:tab-change", handleCustomTabChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      window.removeEventListener("asji:tab-change", handleCustomTabChange);
    };
  }, []);

  const handleTabSwitch = (id: "scanner" | "atlas" | "politech" | "pricing" | "about") => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.location.hash = `#${id}`;
      window.dispatchEvent(new CustomEvent("asji:tab-change", { detail: id }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    setUnlockedTiers([]);
    if (!report?.target) return;

    const domain = normalizeDomainName(report.target);
    if (!domain) return;

    let cancelled = false;
    checkDomainPaymentUnlock(domain)
      .then((res) => {
        if (cancelled) return;
        if (res.unlocked && res.tiers.length > 0) {
          setUnlockedTiers(res.tiers);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
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
      setProgress((p) => (p >= 94 ? p : Math.min(94, p + 3.5)));
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

  useEffect(() => {
    const syncRateLimit = () => {
      const now = Date.now();
      const recent = getRecentScanTimestamps(now);
      if (recent.length >= SCAN_RATE_LIMIT_MAX) {
        const secs = Math.max(1, Math.ceil((recent[0] + SCAN_RATE_LIMIT_WINDOW_MS - now) / 1000));
        setCooldownRemaining(secs);
      } else {
        setCooldownRemaining(0);
      }
    };
    syncRateLimit();
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(syncRateLimit, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  const trimmed = sanitizeAuditInput(input);
  const detected = trimmed.length >= 3 ? detectInput(trimmed) : null;
  const liveCheck = trimmed.length >= 3 ? validateAuditInput(trimmed) : null;

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phase === "scanning") return;

    const now = Date.now();
    const recentScans = getRecentScanTimestamps(now);
    if (recentScans.length >= SCAN_RATE_LIMIT_MAX) {
      const waitSeconds = Math.max(
        1,
        Math.ceil((recentScans[0] + SCAN_RATE_LIMIT_WINDOW_MS - now) / 1000),
      );
      setCooldownRemaining(waitSeconds);
      setError(
        `Institutional rate-limit guard active (max ${SCAN_RATE_LIMIT_MAX} telemetry scans per minute). Please wait ${waitSeconds}s before initiating the next inspection.`,
      );
      return;
    }

    if (!agreed) {
      setError(
        "Authorization required: confirm inspection authority and review the Itemized Data Processing Notice below.",
      );
      return;
    }

    const validation = validateAuditInput(input);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }

    const cleanValue = validation.detected.value;
    setInput(cleanValue);
    setError(null);
    recordScanTimestamp(now);
    const updatedScans = getRecentScanTimestamps(now);
    if (updatedScans.length >= SCAN_RATE_LIMIT_MAX) {
      setCooldownRemaining(
        Math.max(1, Math.ceil((updatedScans[0] + SCAN_RATE_LIMIT_WINDOW_MS - now) / 1000)),
      );
    }

    await recordUserConsent("2025.1", "website_scan_consent");
    saveConsentRecord("ScanAuthorized", undefined, "2025.1", cleanValue).catch(() => {});

    const label =
      validation.detected.kind === "url" ? validation.detected.host! : "infrastructure summary";
    setScanned(label.slice(0, 60));
    setPhase("scanning");
    try {
      const result = await runAudit({
        data: { input: cleanValue, scanMode, politechMode },
      });
      setProgress(100);
      setReport(result);
      setPhase("result");

      saveAuditScan(result, selectedFramework, politechMode).catch(() => {});

      if (user?.uid) {
        const computedVerdict =
          result.score >= 80
            ? "COMPLIANT"
            : result.score >= 50
              ? "MODERATE RISK"
              : "CRITICAL NON-COMPLIANT";
        saveUserAudit(user.uid, {
          id: result.auditRefId || result.dbRecordId || `audit_${Date.now()}`,
          domain: result.target,
          score: result.score,
          verdict: computedVerdict,
          criticalFindingsCount: result.criticalLeaks?.length || 0,
          statutoryExceptionsCount: 0,
          reportSummary: result.summary,
          createdAt: new Date().toISOString(),
          reportData: result,
        }).catch(() => {});
      }
    } catch (err) {
      let msg = "Domain analysis failed. Please verify the URL and try again.";
      if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      setPhase("idle");
    }
  };

  const handleCertLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = certLookupInput.trim().toUpperCase();
    if (!/^ASJI-2026-[A-Z0-9]{4,12}$/.test(cleaned)) {
      setCertLookupResult(null);
      setCertLookupError("Enter a valid Audit Reference ID (e.g., ASJI-2026-A1B2C3).");
      return;
    }
    setCertLookupLoading(true);
    setCertLookupError(null);
    setCertLookupResult(null);
    try {
      const found = await lookupAuditScanByRefId(cleaned);
      if (!found) {
        setCertLookupError(`No archived live audit record found for ${cleaned}.`);
      } else {
        setCertLookupResult(found);
      }
    } catch {
      setCertLookupError("Certificate registry lookup unavailable. Please retry.");
    } finally {
      setCertLookupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#FAF8F5] flex flex-col overflow-x-hidden selection:bg-[#C9A227]/30 selection:text-[#FAF8F5]">
      {/* Top Navigation */}
      <TopNavbar
        activeTab={activeTab}
        setActiveTab={handleTabSwitch}
        onOpenUnlockModal={() => handleOpenUnlockModal("full-bundle")}
      />

      {/* Main Content Area with Smooth Spring Page Morphing */}
      <main className="flex-1 w-full">
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "atlas" && (
            <motion.div
              key="atlas"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12"
            >
              <WorldLawsAtlas
                selectedFramework={selectedFramework}
                onSelectFramework={(fw) => {
                  setSelectedFramework(fw);
                  handleTabSwitch("scanner");
                }}
              />
            </motion.div>
          )}

          {activeTab === "politech" && (
            <motion.div
              key="politech"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <PoliTechPage
                onOpenUnlockModal={handleOpenUnlockModal}
                isUnlocked={isLegalUnlocked}
              />
            </motion.div>
          )}

          {activeTab === "pricing" && (
            <motion.div
              key="pricing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <PricingPage
                onOpenUnlockModal={handleOpenUnlockModal}
                setActiveTab={handleTabSwitch}
              />
            </motion.div>
          )}

          {activeTab === "about" && (
            <motion.div
              key="about"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <AboutPage />
            </motion.div>
          )}

          {activeTab === "scanner" && (
            <motion.div
              key="scanner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-8 sm:pt-10 pb-0 space-y-16"
            >
              {/* Full-Bleed Architectural Hero Stage with Interactive Orbital Radar */}
              <section
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const nx = (e.clientX - rect.left) / rect.width - 0.5;
                  const ny = (e.clientY - rect.top) / rect.height - 0.5;
                  e.currentTarget.style.setProperty("--radar-x", `${(nx * 24).toFixed(1)}px`);
                  e.currentTarget.style.setProperty("--radar-y", `${(ny * 18).toFixed(1)}px`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty("--radar-x", "0px");
                  e.currentTarget.style.setProperty("--radar-y", "0px");
                }}
                className="relative min-h-[82vh] flex flex-col items-center justify-center text-center py-12 px-4 rounded-3xl border border-[#262932] bg-[#15171C] overflow-hidden shadow-2xl"
              >
                {/* Architectural Blueprint Grid Background */}
                <div
                  className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #C9A227 1px, transparent 1px), linear-gradient(to bottom, #C9A227 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />

                {/* Interactive SVG Orbital Compliance Radar Behind Hero Scanner */}
                <HeroOrbitalRadar />

                <div className="relative z-10 w-full flex flex-col items-center">
                  {/* Interactive 3D Sovereign Telemetry Globe & Bespoke A1 Brand Emblem */}
                  <SovereignTelemetryGlobe />

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-4 py-1.5 text-xs font-mono font-bold text-[#C9A227] mb-4">
                    <span>[IN] [EU] [UK] [US] [AE] 15 SOVEREIGN STATUTES INDEXED</span>
                  </div>

                  <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-[#FAF8F5] max-w-5xl mx-auto">
                    Statute-Locked Compliance &amp; Remediation Workbench
                  </h1>

                  {/* Mobile Compact Subheadline with Smooth Spring Accordion */}
                  <div className="mt-4 max-w-3xl mx-auto font-sans text-sm sm:text-base text-muted-foreground leading-relaxed">
                    <p className="line-clamp-2 md:line-clamp-none">
                      Inspect public transport security headers, pre-consent tracking scripts, and
                      statutory exposure across 15 sovereign privacy mandates with deterministic
                      evidence mapping.
                    </p>
                    <div className="md:hidden mt-2">
                      <button
                        type="button"
                        onClick={() => setHeroExpanded(!heroExpanded)}
                        className="inline-flex items-center gap-1 font-mono text-xs text-[#C9A227] underline cursor-pointer"
                      >
                        <span>
                          {heroExpanded ? "Hide Statutory Scope ▴" : "Read Statutory Scope ▾"}
                        </span>
                      </button>
                      <AnimatePresence initial={false}>
                        {heroExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="overflow-hidden"
                          >
                            <p className="mt-2 text-xs text-muted-foreground font-sans leading-relaxed text-left bg-[#0D0E11] p-3 rounded-lg border border-[#262932]">
                              ASJi One inspects live public HTTP headers, TLS metadata, and script
                              tags via hardened proxy routes—flagging GTM, GA4, Meta pixels, and
                              missing CSP/HSTS directives transiently with zero retention.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Domain Input & Scan Console */}
                  <div className="mt-10 w-full max-w-3xl mx-auto space-y-5">
                    <form onSubmit={startScan} className="space-y-4">
                      <div className="relative flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5 rounded-xl border border-[#262932] bg-[#0D0E11] p-2.5 shadow-2xl">
                        <div className="flex flex-col sm:flex-row lg:flex-1 items-stretch sm:items-center gap-2 min-w-0">
                          <div className="flex items-center gap-2 pl-2.5 pr-2 sm:border-r border-[#262932] shrink-0">
                            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-[#C9A227] shrink-0" />
                            <select
                              aria-label="Select governing privacy jurisdiction"
                              value={selectedFramework}
                              onChange={(e) => setSelectedFramework(e.target.value)}
                              className="w-full sm:w-auto max-w-[230px] bg-transparent font-mono text-xs font-bold text-[#FAF8F5] outline-none cursor-pointer py-2"
                            >
                              {STATUTORY_FRAMEWORKS.map((fw) => (
                                <option
                                  key={fw.id}
                                  value={fw.id}
                                  className="bg-[#15171C] text-[#FAF8F5]"
                                >
                                  {fw.country} ({fw.id.toUpperCase()})
                                </option>
                              ))}
                            </select>
                          </div>

                          <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Enter public domain (e.g., example.com)"
                            aria-label="Target domain URL"
                            className="w-full min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm text-[#FAF8F5] placeholder:text-muted-foreground outline-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={phase === "scanning" || cooldownRemaining > 0}
                          className="btn-gold w-full lg:w-auto rounded-lg px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0 whitespace-nowrap shadow-2xl"
                        >
                          {phase === "scanning" ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Running Live Audit...</span>
                            </>
                          ) : cooldownRemaining > 0 ? (
                            <>
                              <Lock className="h-4 w-4" />
                              <span>Cooldown ({cooldownRemaining}s)</span>
                            </>
                          ) : (
                            <>
                              <span>Run Live Audit</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      </div>

                      {/* DPDP Section 5 Unchecked Authorization Gate & PoliTech Mode Switch */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 rounded-lg border border-[#262932] bg-[#0D0E11]/85 px-3.5 py-2.5 text-left">
                        <div className="flex items-start gap-2.5">
                          <input
                            id="dpdp-scan-authorization"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => {
                              setAgreed(e.target.checked);
                              if (
                                e.target.checked &&
                                error?.toLowerCase().includes("authorization")
                              ) {
                                setError(null);
                              }
                            }}
                            className="mt-0.5 h-4 w-4 shrink-0 rounded border border-[#C9A227]/60 bg-[#0D0E11] accent-[#C9A227] cursor-pointer"
                          />
                          <label
                            htmlFor="dpdp-scan-authorization"
                            className="font-sans text-xs text-zinc-300 leading-relaxed cursor-pointer select-none"
                          >
                            I confirm authorization to inspect publicly observable signals of this
                            domain and agree to the{" "}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setLegalModalTitle(ITEMIZED_DATA_PROCESSING_NOTICE_TITLE);
                                setLegalModalContent(ITEMIZED_DATA_PROCESSING_NOTICE_CONTENT);
                                setLegalModalOpen(true);
                              }}
                              className="font-mono font-semibold text-[#C9A227] underline underline-offset-2 hover:text-[#DFB842] cursor-pointer"
                            >
                              [Itemized Data Processing Notice]
                            </button>
                            .
                          </label>
                        </div>

                        <label
                          htmlFor="politech-mode-toggle"
                          className="inline-flex items-center gap-2 rounded-md border border-[#262932] bg-[#15171C] px-2.5 py-1.5 font-mono text-[11px] font-semibold text-[#C9A227] shrink-0 cursor-pointer select-none hover:border-[#C9A227]/50"
                        >
                          <input
                            id="politech-mode-toggle"
                            type="checkbox"
                            checked={politechMode}
                            onChange={(e) => setPolitechMode(e.target.checked)}
                            className="h-3.5 w-3.5 accent-[#C9A227] cursor-pointer"
                          />
                          <span>PoliTech Mode</span>
                        </label>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/30 p-3 rounded-lg text-left">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-center gap-3.5 text-[11px] font-mono text-muted-foreground pt-1">
                        <span className="inline-flex items-center gap-1.5 text-[#10B981]">
                          <ShieldCheck className="h-3.5 w-3.5" /> 100% Live Deterministic Telemetry
                        </span>
                        <span>·</span>
                        <span>Rate-Limited (6/min)</span>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => setShowCertLookup((v) => !v)}
                          className="inline-flex items-center gap-1 text-[#C9A227] hover:underline cursor-pointer"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>
                            {showCertLookup ? "Hide Certificate Lookup" : "Verify Certificate ID"}
                          </span>
                        </button>
                        <span>·</span>
                        <span>ASJi Web and Legal Solution, Jaipur</span>
                      </div>
                    </form>

                    {showCertLookup && (
                      <div className="rounded-xl border border-[#262932] bg-[#0D0E11] p-4 text-left space-y-3">
                        <form
                          onSubmit={handleCertLookup}
                          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                        >
                          <input
                            type="text"
                            value={certLookupInput}
                            onChange={(e) => setCertLookupInput(e.target.value)}
                            placeholder="Enter Certificate Ref ID (e.g., ASJI-2026-A1B2C3)"
                            className="flex-1 rounded-md border border-[#262932] bg-[#15171C] px-3 py-2 font-mono text-xs text-[#FAF8F5] placeholder:text-zinc-500 focus:border-[#C9A227] outline-none uppercase"
                          />
                          <button
                            type="submit"
                            disabled={certLookupLoading}
                            className="rounded-md border border-[#C9A227]/60 bg-[#15171C] px-4 py-2 font-mono text-xs font-bold text-[#C9A227] hover:bg-[#C9A227]/10 cursor-pointer disabled:opacity-50"
                          >
                            {certLookupLoading ? "Verifying..." : "Verify Certificate"}
                          </button>
                        </form>
                        {certLookupError && (
                          <p className="font-mono text-xs text-[#EF4444]">{certLookupError}</p>
                        )}
                        {certLookupResult && (
                          <div className="rounded-lg border border-[#10B981]/40 bg-[#15171C] p-3.5 font-mono text-xs space-y-1.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-bold text-[#FAF8F5]">
                                {certLookupResult.audit_ref_id} · {certLookupResult.domain}
                              </span>
                              <span className="rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-bold text-[#10B981]">
                                {certLookupResult.compliance_score}/100 ({certLookupResult.verdict})
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-400">
                              Framework: {certLookupResult.framework.toUpperCase()} · Findings:{" "}
                              {certLookupResult.findings?.length || 0} · Verified Timestamp:{" "}
                              {certLookupResult.created_at}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Live Rolling Statutory Coverage Ticker Strip */}
                    <StatutoryTicker
                      selectedFramework={selectedFramework}
                      onSelectFramework={(fw) => setSelectedFramework(fw)}
                      onOpenPoliTech={() => handleTabSwitch("politech")}
                    />
                  </div>
                </div>
              </section>

              {/* SCANNING LOADER STATE */}
              {phase === "scanning" && (
                <div ref={scanRef} className="py-12">
                  <ScanLoader progress={progress} url={scanned || input} />
                </div>
              )}

              {/* SCAN RESULTS & REMEDIATION WORKBENCH */}
              {phase === "result" && report && (
                <div ref={resultRef} className="space-y-12 animate-in fade-in duration-500">
                  {/* Result Header & Score */}
                  <div className="surface-panel rounded-2xl border border-[#262932] bg-[#15171C] p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                    <div className="space-y-3 text-center lg:text-left min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-xs font-mono font-bold text-[#C9A227]">
                        <ShieldCheck className="h-4 w-4" /> VERIFIED TECHNICAL AUDIT REPORT
                      </div>
                      <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-[#FAF8F5] break-words">
                        Target: <span className="text-[#C9A227]">{report.target}</span>
                      </h2>
                      <p className="text-xs sm:text-sm font-mono text-muted-foreground">
                        Ref ID:{" "}
                        <strong className="text-[#C9A227]">{report.auditRefId || "LIVE"}</strong> ·{" "}
                        Framework:{" "}
                        <strong className="text-foreground">{report.frameworkName}</strong> ·{" "}
                        {report.scannedAtUtc || new Date().toUTCString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-5 shrink-0">
                      <ScoreWheel score={report.score} />
                      <div className="space-y-2">
                        <button
                          type="button"
                          onClick={handleDownloadReportPdf}
                          disabled={isDownloadingPdf}
                          className="btn-gold rounded-lg px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center gap-2 shadow-xl"
                        >
                          {isDownloadingPdf ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                          <span>Download PDF Certificate</span>
                        </button>
                        <button
                          type="button"
                          onClick={handlePurge}
                          className="w-full rounded-lg border border-[#262932] bg-[#0D0E11] px-4 py-2 text-xs font-mono text-muted-foreground hover:text-[#FAF8F5] transition-colors cursor-pointer"
                        >
                          New Scan
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Executive Dark & Gold Compliance Audit Report & Certificate */}
                  <ASJiLetterheadReport
                    report={report}
                    frameworkId={selectedFramework}
                    isPaid={isCodePatchesUnlocked || isLegalUnlocked}
                    onOpenUnlockModal={() => handleOpenUnlockModal("full-bundle")}
                  />

                  {/* Free Diagnostic Findings */}
                  <div className="grid gap-8 lg:grid-cols-2">
                    <IntermediaryShieldCard report={report} />
                    <LocalizationScannerCard
                      report={report}
                      onOpenRemediationModal={() => handleOpenUnlockModal("full-bundle")}
                    />
                  </div>

                  {/* Remediation Fixer Workbench (Code Patches) */}
                  <RemediationViewer
                    report={report}
                    isUnlocked={isCodePatchesUnlocked}
                    unlockedTier={unlockedTiers[0] || null}
                    onOpenUnlockModal={handleOpenUnlockModal}
                  />

                  {/* Statutory Legal Solution Card */}
                  <StatutoryLegalSolutionCard
                    report={report}
                    frameworkId={selectedFramework}
                    isUnlocked={isLegalUnlocked}
                    unlockedTier={unlockedTiers[0] || null}
                    onOpenUnlockModal={handleOpenUnlockModal}
                  />
                </div>
              )}

              {/* DEFAULT LANDING EXECUTIVES & ATLAS IF NO ACTIVE SCAN */}
              {!report && (
                <div className="space-y-16">
                  <section className="rounded-2xl border border-[#262932] bg-[#15171C] p-8 sm:p-12">
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                      <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#C9A227]">
                        Statutory Audit Pipeline
                      </span>
                      <h2 className="font-display text-3xl font-bold text-[#FAF8F5]">
                        How ASJi One Identifies Gaps &amp; Remediates Risk
                      </h2>
                      <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
                        Controlled, verifiable, and non-disruptive inspection across 15 sovereign
                        global privacy mandates.
                      </p>
                    </div>

                    <div className="mt-10 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                      <SpecularCard className="rounded-xl border border-[#262932] bg-[#0D0E11] p-6 space-y-3">
                        <div className="font-mono text-xs font-bold text-[#C9A227]">
                          01. DOMAIN &amp; LAW
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#FAF8F5]">
                          Target &amp; Jurisdiction
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Enter your production domain and select from 15 sovereign privacy
                          frameworks with verified maximum penalty ceilings.
                        </p>
                      </SpecularCard>

                      <SpecularCard className="rounded-xl border border-[#262932] bg-[#0D0E11] p-6 space-y-3">
                        <div className="font-mono text-xs font-bold text-[#C9A227]">
                          02. FORENSIC AUDIT
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#FAF8F5]">
                          Direct Statutory Mapping
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Live telemetry inspection detects pre-consent tracking, missing HSTS/CSP
                          headers, and unappointed grievance officers.
                        </p>
                      </SpecularCard>

                      <SpecularCard className="rounded-xl border border-[#262932] bg-[#0D0E11] p-6 space-y-3 md:col-span-2 lg:col-span-1">
                        <div className="font-mono text-xs font-bold text-[#C9A227]">
                          03. REMEDIATION VAULT
                        </div>
                        <h3 className="font-display text-lg font-bold text-[#FAF8F5]">
                          Code &amp; Legal Suite
                        </h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Deploy server configuration hardening alongside tailored statutory privacy
                          notices and grievance officer charters.
                        </p>
                      </SpecularCard>
                    </div>
                  </section>

                  <WorldLawsAtlas
                    selectedFramework={selectedFramework}
                    onSelectFramework={setSelectedFramework}
                  />

                  <SovereignLegalMatrix
                    onOpenRemediationModal={() => handleOpenUnlockModal("gdpr-global")}
                    isUnlocked={isLegalUnlocked}
                    selectedFramework={selectedFramework}
                  />
                </div>
              )}

              <StatutoryGrievanceNotice />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer
        onOpenLegalModal={(title, content) => {
          setLegalModalTitle(title);
          setLegalModalContent(content);
          setLegalModalOpen(true);
        }}
      />

      {/* Legal Modal Reader */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        title={legalModalTitle}
        content={legalModalContent}
      />

      {/* Remediation & Payment Unlock Modal */}
      <RemediationBillingModal
        isOpen={unlockOpen}
        onClose={() => setUnlockOpen(false)}
        onUnlockSuccess={handleUnlockSuccess}
        report={report}
        frameworkId={selectedFramework}
        initialTier={initialBillingTier}
      />
    </div>
  );
}
