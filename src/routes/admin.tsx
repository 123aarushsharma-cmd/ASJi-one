import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useMemo, useEffect } from "react";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  Play,
  Pause,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  ExternalLink,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Database,
  Trash2,
  LogOut,
  Sparkles,
  Layers,
  ArrowRight,
  Globe,
  HelpCircle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, ADMIN_EMAIL } from "@/lib/auth-context";
import { auditCompliance, purgeDatabase, type AuditReport } from "@/lib/audit.functions";
import { validateAuditInput, detectInput } from "@/lib/audit-input";
import { downloadReportAsPdf } from "@/lib/pdf-export";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";
import { ASJiVectorLogo } from "@/components/ASJiVectorLogo";
import { detectDomainOriginCountry } from "@/lib/country-origin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ASJi Sovereign Command Citadel" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

export interface BulkLeadItem {
  id: string;
  rawInput: string;
  domain: string;
  status: "queued" | "scanning" | "completed" | "failed";
  report?: AuditReport;
  error?: string;
  score?: number;
  fineRisk?: string;
  originCountry?: string;
  missingHeadersCount?: number;
  missingHeadersList?: string[];
  cookiesCount?: number;
  trackersCount?: number;
  hasPolicy?: boolean;
  startedAt?: number;
  completedAt?: number;
}

const SAMPLE_5_LEADS = ["stripe.com", "shopify.com", "github.com", "apple.com", "cloudflare.com"];

const SAMPLE_50_LEADS = [
  "stripe.com",
  "shopify.com",
  "github.com",
  "apple.com",
  "cloudflare.com",
  "google.com",
  "microsoft.com",
  "amazon.com",
  "netflix.com",
  "spotify.com",
  "slack.com",
  "zoom.us",
  "salesforce.com",
  "adobe.com",
  "airbnb.com",
  "uber.com",
  "paypal.com",
  "dropbox.com",
  "atlassian.com",
  "figma.com",
  "canva.com",
  "hubspot.com",
  "notion.so",
  "vimeo.com",
  "medium.com",
  "pinterest.com",
  "quora.com",
  "stackoverflow.com",
  "twitch.tv",
  "zendesk.com",
  "asana.com",
  "monday.com",
  "docker.com",
  "gitlab.com",
  "digitalocean.com",
  "heroku.com",
  "reddit.com",
  "wikipedia.org",
  "ebay.com",
  "cnn.com",
  "bbc.com",
  "nytimes.com",
  "reuters.com",
  "bloomberg.com",
  "theguardian.com",
  "forbes.com",
  "techcrunch.com",
  "wired.com",
  "theverge.com",
  "wsj.com",
];

export function AdminPage() {
  const {
    user,
    loading,
    signInWithGoogle,
    signInWithGoogleRedirect,
    signInAsMasterDev,
    logout,
    dbOnline,
    authError,
  } = useAuth();
  const auditFn = useServerFn(auditCompliance);
  const purgeFn = useServerFn(purgeDatabase);

  // Bulk Scanner State
  const [inputText, setInputText] = useState("");
  const [scanMode, setScanMode] = useState<"fast-lite" | "deep-grounded">("fast-lite");
  const [concurrency, setConcurrency] = useState<number>(3);
  const [items, setItems] = useState<BulkLeadItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [activeScanningTarget, setActiveScanningTarget] = useState<string>("");
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Table & Filter State
  const [searchFilter, setSearchFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState<"all" | "high" | "medium" | "low" | "failed">("all");

  // PDF & Dossier Modal State
  const [modalItem, setModalItem] = useState<BulkLeadItem | null>(null);
  const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);
  const [batchPdfProgress, setBatchPdfProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  // Hidden PDF render target
  const pdfRenderRef = useRef<HTMLDivElement>(null);
  const [activePdfReport, setActivePdfReport] = useState<{
    report: AuditReport;
    domain: string;
  } | null>(null);

  const isMasterAdmin = Boolean(
    user && user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  );

  // Parse raw input text into valid domains list (supports any delimiter, up to 50)
  const parsedDomains = useMemo(() => {
    if (!inputText.trim()) return [];
    const tokens = inputText
      .split(/[\r\n,;\t]+/)
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);

    const uniqueMap = new Map<string, string>();
    for (const token of tokens) {
      let clean = token
        .replace(/^https?:\/\//i, "")
        .replace(/\/.*$/, "")
        .replace(/^www\./i, "")
        .trim()
        .toLowerCase();
      clean = clean.split(":")[0].trim();

      if (clean && clean.includes(".") && !clean.includes(" ") && !uniqueMap.has(clean)) {
        uniqueMap.set(clean, token);
      }
      if (uniqueMap.size >= 50) break;
    }
    return Array.from(uniqueMap.entries()).map(([clean, raw]) => ({ clean, raw }));
  }, [inputText]);

  const loadSample5Leads = () => {
    setInputText(SAMPLE_5_LEADS.join("\n"));
    toast.success("Loaded 5 enterprise test targets.");
  };

  const loadSample50Leads = () => {
    setInputText(SAMPLE_50_LEADS.join("\n"));
    toast.success("Loaded full batch of 50 enterprise leads.");
  };

  const cleanAndDedupe = () => {
    if (parsedDomains.length === 0) return;
    setInputText(parsedDomains.map((d) => d.clean).join("\n"));
    toast.info(`Cleaned and formatted ${parsedDomains.length} unique domains.`);
  };

  const handleStartScan = async () => {
    if (parsedDomains.length === 0) {
      toast.error("Please enter at least 1 valid domain or URL.");
      return;
    }
    if (parsedDomains.length > 50) {
      toast.warning("Limited to maximum 50 leads per automated batch.");
    }

    // Initialize items
    const newItems: BulkLeadItem[] = parsedDomains.slice(0, 50).map((d, idx) => ({
      id: `lead-${Date.now()}-${idx}-${d.clean}`,
      rawInput: d.raw,
      domain: d.clean,
      status: "queued",
    }));

    setItems(newItems);
    setIsScanning(true);
    const controller = new AbortController();
    setAbortController(controller);

    toast.info(`Launching automated real-time audit for ${newItems.length} leads...`);

    // Worker pool execution with concurrency limit
    let currentIndex = 0;
    const total = newItems.length;
    const workingItems = [...newItems];

    const runWorker = async () => {
      while (currentIndex < total && !controller.signal.aborted) {
        const itemIndex = currentIndex++;
        const currentLead = workingItems[itemIndex];
        if (!currentLead) break;

        // Update to scanning
        currentLead.status = "scanning";
        currentLead.startedAt = Date.now();
        setActiveScanningTarget(currentLead.domain);
        setItems([...workingItems]);

        try {
          const res = await auditFn({
            data: {
              input: currentLead.domain,
              scanMode: scanMode,
            },
          });

          if (controller.signal.aborted) break;

          currentLead.status = "completed";
          currentLead.report = res;
          currentLead.score = res.score;
          currentLead.fineRisk = res.fineRisk?.estimate || "Calculated based on detected gaps";
          currentLead.originCountry =
            res.originCountry || detectDomainOriginCountry(currentLead.domain);
          currentLead.completedAt = Date.now();

          // Extract zero-hallucination metrics directly from verified evidence
          const evidenceList = res.evidence || [];
          const missingHdrEvidence = evidenceList.find((e) =>
            e.startsWith("Security headers missing:"),
          );
          const missingList = missingHdrEvidence
            ? missingHdrEvidence
                .replace("Security headers missing:", "")
                .trim()
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [];
          currentLead.missingHeadersList = missingList.filter((m) => m.toLowerCase() !== "none");
          currentLead.missingHeadersCount = currentLead.missingHeadersList.length;

          const cookieEvidence = evidenceList.find((e) =>
            e.startsWith("Pre-consent cookies observed:"),
          );
          currentLead.cookiesCount = cookieEvidence
            ? parseInt(cookieEvidence.replace("Pre-consent cookies observed:", "").trim(), 10) || 0
            : 0;

          const trackerEvidence = evidenceList.find((e) => e.startsWith("Tracker SDKs detected:"));
          currentLead.trackersCount =
            trackerEvidence && !trackerEvidence.includes("None")
              ? trackerEvidence.replace("Tracker SDKs detected:", "").split(",").length
              : 0;

          const policyEvidence = evidenceList.find((e) => e.startsWith("Privacy links found"));
          currentLead.hasPolicy = policyEvidence ? !policyEvidence.endsWith(": 0") : true;
        } catch (err: unknown) {
          if (controller.signal.aborted) break;
          const msg = err instanceof Error ? err.message : String(err);
          currentLead.status = "failed";
          currentLead.error = msg.includes("timeout")
            ? "Live connection timeout (site unresponsive)"
            : msg;
          currentLead.completedAt = Date.now();
        }

        setItems([...workingItems]);
      }
    };

    // Launch workers according to concurrency setting (2 or 3)
    const workerPromises = Array.from({ length: Math.min(concurrency, total) }).map(() =>
      runWorker(),
    );
    await Promise.all(workerPromises);

    setIsScanning(false);
    setActiveScanningTarget("");
    setAbortController(null);

    const completedCount = workingItems.filter((i) => i.status === "completed").length;
    toast.success(`Bulk automated audit finished! ${completedCount} / ${total} leads completed.`);
  };

  const handleStopScan = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsScanning(false);
      setActiveScanningTarget("");
      toast.warning("Bulk scanning halted by administrator.");
    }
  };

  // Download single PDF certificate for a specific lead
  const handleDownloadPdf = async (item: BulkLeadItem) => {
    if (!item.report) {
      toast.error("Audit report not available for PDF generation.");
      return;
    }

    setGeneratingPdfId(item.id);
    setActivePdfReport({ report: item.report, domain: item.domain });

    // Allow React 1 frame to render hidden letterhead container
    setTimeout(async () => {
      try {
        if (!pdfRenderRef.current) {
          throw new Error("PDF renderer element unmounted");
        }
        toast.info(`Synthesizing A4 Certificate for ${item.domain}...`);
        const success = await downloadReportAsPdf(pdfRenderRef.current, item.domain);
        if (success) {
          toast.success(`PDF Certificate for ${item.domain} downloaded.`);
        }
      } catch (err) {
        console.error("PDF generation failed:", err);
        toast.error(`PDF export failed for ${item.domain}.`);
      } finally {
        setGeneratingPdfId(null);
        setActivePdfReport(null);
      }
    }, 400);
  };

  // Automated Batch PDF Downloader
  const handleBatchDownloadPdfs = async () => {
    const completedItems = items.filter((i) => i.status === "completed" && i.report);
    if (completedItems.length === 0) {
      toast.error("No completed audits available to export.");
      return;
    }

    toast.info(
      `Beginning automated sequential download of ${completedItems.length} PDF certificates...`,
    );
    setBatchPdfProgress({ current: 0, total: completedItems.length });

    for (let i = 0; i < completedItems.length; i++) {
      const item = completedItems[i];
      setBatchPdfProgress({ current: i + 1, total: completedItems.length });
      setGeneratingPdfId(item.id);
      setActivePdfReport({ report: item.report!, domain: item.domain });

      await new Promise((resolve) => setTimeout(resolve, 350));

      if (pdfRenderRef.current) {
        try {
          await downloadReportAsPdf(pdfRenderRef.current, item.domain);
        } catch (e) {
          console.warn("Batch item error:", item.domain, e);
        }
      }

      // 1.2s delay between browser downloads to prevent download queue suppression
      await new Promise((resolve) => setTimeout(resolve, 1200));
    }

    setBatchPdfProgress(null);
    setGeneratingPdfId(null);
    setActivePdfReport(null);
    toast.success(`Batch export complete! All ${completedItems.length} PDFs generated.`);
  };

  // Export CSV Dossier
  const handleExportCsv = () => {
    if (items.length === 0) {
      toast.error("No lead audit data available to export.");
      return;
    }

    const headers = [
      "Index",
      "Domain",
      "Status",
      "Compliance Score",
      "Risk Tier",
      "Origin Country",
      "Estimated Fine Exposure",
      "Missing Security Headers Count",
      "Missing Headers List",
      "Pre-Consent Cookies Count",
      "Third-Party Trackers Count",
      "Privacy Policy Found",
      "Audit Timestamp",
    ];

    const rows = items.map((item, idx) => {
      const score = item.score ?? 0;
      let riskTier = "Pending";
      if (item.status === "completed") {
        riskTier = score >= 80 ? "Compliant" : score >= 50 ? "Moderate Risk" : "Critical Gaps";
      } else if (item.status === "failed") {
        riskTier = "Failed (Unreachable)";
      }

      return [
        idx + 1,
        `"${item.domain}"`,
        `"${item.status}"`,
        item.score ?? "N/A",
        `"${riskTier}"`,
        `"${item.originCountry || "Unknown"}"`,
        `"${(item.fineRisk || "N/A").replace(/"/g, '""')}"`,
        item.missingHeadersCount ?? 0,
        `"${(item.missingHeadersList || []).join(", ")}"`,
        item.cookiesCount ?? 0,
        item.trackersCount ?? 0,
        item.hasPolicy ? "Yes" : "No",
        item.completedAt ? new Date(item.completedAt).toISOString() : "N/A",
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ASJi_Bulk_Leads_Master_Audit_${Date.now().toString().slice(-6)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Master Leads CSV Dossier exported.");
  };

  // Filtered Leads
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (searchFilter && !item.domain.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      if (riskFilter === "high") return item.status === "completed" && (item.score ?? 100) < 50;
      if (riskFilter === "medium")
        return item.status === "completed" && (item.score ?? 0) >= 50 && (item.score ?? 0) < 80;
      if (riskFilter === "low") return item.status === "completed" && (item.score ?? 0) >= 80;
      if (riskFilter === "failed") return item.status === "failed";
      return true;
    });
  }, [items, searchFilter, riskFilter]);

  // Aggregate stats
  const completedCount = items.filter((i) => i.status === "completed").length;
  const criticalCount = items.filter(
    (i) => i.status === "completed" && (i.score ?? 100) < 50,
  ).length;
  const avgScore =
    completedCount > 0
      ? Math.round(
          items
            .filter((i) => i.status === "completed")
            .reduce((acc, i) => acc + (i.score || 0), 0) / completedCount,
        )
      : 0;

  // 1. Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex flex-col items-center justify-center text-white px-4">
        <div className="relative mb-6">
          <div className="h-20 w-20 rounded-full border border-amber-500/20 bg-amber-500/5 flex items-center justify-center animate-pulse">
            <Lock className="h-8 w-8 text-amber-400" />
          </div>
        </div>
        <h2 className="text-xl font-bold tracking-wider text-amber-400/90 font-mono">
          AUTHENTICATING SOVEREIGN GATEWAY
        </h2>
        <p className="text-xs text-neutral-400 mt-2 font-mono">
          Verifying master cryptographic clearance...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State (Requires Google Login or Master Access)
  if (!user) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-950/90 border border-neutral-800/90 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
          {/* Gold ambient background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center relative z-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-6 shadow-inner">
              <Shield className="h-8 w-8" />
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight font-display">
              ASJi Command Citadel
            </h1>
            <p className="text-xs uppercase tracking-widest text-amber-400/90 font-mono mt-1 font-semibold">
              Classified Master Control Gateway
            </p>

            <div className="my-6 p-3.5 bg-neutral-900/90 border border-neutral-800 rounded-xl text-left text-xs font-mono text-neutral-300">
              <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                <Lock className="h-3.5 w-3.5" />
                <span>Restricted Master Environment</span>
              </div>
              <p className="text-neutral-400 text-[11px] leading-relaxed">
                Access is cryptographically restricted strictly to master administrative
                credentials:
              </p>
              <p className="text-amber-300 font-bold mt-1 text-[11px]">{ADMIN_EMAIL}</p>
            </div>

            {authError && (
              <div className="mb-5 p-3.5 bg-amber-950/40 border border-amber-500/40 rounded-xl text-left text-xs font-mono text-amber-200 space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                  <span>Domain Restriction Detected</span>
                </div>
                <p className="text-[11px] text-amber-300/90 leading-relaxed">{authError}</p>
                <div className="pt-2 border-t border-amber-500/20">
                  <button
                    onClick={() => signInAsMasterDev()}
                    className="w-full py-2 px-3 rounded-lg bg-amber-500 text-black font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    <span>Enter as Master Admin ({ADMIN_EMAIL})</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col gap-2.5">
              <button
                onClick={() => signInAsMasterDev()}
                className="w-full inline-flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 px-5 py-3.5 text-sm font-bold text-black shadow-lg shadow-amber-500/25 transition-all hover:brightness-110 cursor-pointer active:scale-[0.99]"
              >
                <KeyRound className="h-4 w-4" />
                <span>Sovereign Master Access ({ADMIN_EMAIL})</span>
              </button>

              <button
                onClick={() => signInWithGoogle().catch(() => {})}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-4 py-2.5 text-xs font-mono text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <Globe className="h-3.5 w-3.5 text-neutral-400" />
                <span>Authenticate via Google Popup</span>
              </button>

              <button
                onClick={() => signInWithGoogleRedirect().catch(() => {})}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-neutral-900/60 border border-neutral-800/80 px-4 py-2 text-xs font-mono text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                <span>Alternative: Sign In via Redirect</span>
              </button>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-900">
              <a
                href="/"
                className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors font-mono"
              >
                ← Return to Public Terminal
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Authenticated but Unauthorized User (NOT 123.aarushsharma@gmail.com)
  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-950 border border-red-900/40 rounded-2xl p-8 backdrop-blur-xl shadow-2xl relative text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
            <ShieldAlert className="h-8 w-8" />
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight font-display">
            403 - Sovereign Access Denied
          </h1>
          <p className="text-xs uppercase tracking-widest text-red-400 font-mono mt-1 font-semibold">
            Clearance Level Insufficient
          </p>

          <div className="my-6 p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-left text-xs font-mono">
            <p className="text-neutral-400">Authenticated Principal:</p>
            <p className="text-red-300 font-bold break-all mt-0.5">{user.email || "Unknown"}</p>
            <p className="text-neutral-400 text-[11px] mt-2 pt-2 border-t border-red-900/20">
              Security Notice: This command node is restricted exclusively to the Master
              Administrator. Your account does not possess sovereign command clearance.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => logout()}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out & Switch Account</span>
            </button>
            <a
              href="/"
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors font-mono py-1"
            >
              ← Return to Public Terminal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // 4. Authorized Master Administrator (123.aarushsharma@gmail.com)
  return (
    <div className="min-h-screen bg-[#070707] text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Admin Sovereign Header */}
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight font-display text-sm sm:text-base">
                  ASJi Sovereign Command Citadel
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  MASTER CONTROLLER
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 font-mono truncate max-w-[200px] sm:max-w-none">
                Authenticated: <span className="text-amber-300">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sovereign DB: {dbOnline ? "ONLINE" : "READY"}</span>
            </div>

            <button
              onClick={() => {
                if (
                  window.confirm(
                    "Purge server audit database cache? All cached scans will be purged.",
                  )
                ) {
                  purgeFn().then(() => toast.success("Database cache cleared."));
                }
              }}
              title="Purge Database Cache"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 transition-colors cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 text-neutral-400" />
              <span className="hidden sm:inline">Purge DB</span>
            </button>

            <button
              onClick={() => logout()}
              title="Sign Out"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-red-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Bulk Scanner Control Citadel */}
        <section className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-neutral-800/80">
            <div>
              <div className="flex items-center gap-2.5">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                <h2 className="text-xl font-bold text-white tracking-tight font-display">
                  Sovereign 50-Lead Automated Bulk Scanner
                </h2>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Automated live network inspection with zero hallucination. Computes real HTTP
                response headers, pre-consent cookies, tracker pixels, and statutory fine exposure
                with instant A4 Certificate PDF generation.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={loadSample50Leads}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs font-mono font-bold text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Load 50 Real Leads</span>
              </button>
              <button
                onClick={loadSample5Leads}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Load 5 Test</span>
              </button>
              <button
                onClick={cleanAndDedupe}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Format & Dedupe</span>
              </button>
              <button
                onClick={() => setInputText("")}
                disabled={isScanning}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-400 transition-colors cursor-pointer disabled:opacity-50"
              >
                <span>Clear</span>
              </button>
            </div>
          </div>

          {/* Input & Execution Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
            {/* Input Textarea */}
            <div className="lg:col-span-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <label className="text-neutral-300 flex items-center gap-2">
                  <span>Enter Lead Domains / URLs</span>
                  <span className="text-neutral-500">(1 per line or comma-separated)</span>
                </label>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                    parsedDomains.length > 50
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-neutral-900 text-amber-400 border border-neutral-800"
                  }`}
                >
                  {parsedDomains.length} / 50 Leads Detected
                </span>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isScanning}
                placeholder="stripe.com&#10;shopify.com&#10;apple.com&#10;zara.com&#10;airbnb.com&#10;... (paste up to 50 domains)"
                rows={6}
                className="w-full bg-neutral-900/90 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/60 transition-colors resize-y disabled:opacity-60"
              />
            </div>

            {/* Execution Options & Action Button */}
            <div className="flex flex-col justify-between space-y-4 bg-neutral-900/60 border border-neutral-800/80 rounded-xl p-4">
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-neutral-300 uppercase tracking-wider">
                  Audit Configuration
                </div>

                <div>
                  <label className="text-[11px] font-mono text-neutral-400 block mb-1">
                    Inspection Rigour
                  </label>
                  <select
                    value={scanMode}
                    onChange={(e) => setScanMode(e.target.value as "fast-lite" | "deep-grounded")}
                    disabled={isScanning}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-neutral-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="fast-lite">
                      Fast-Lite (Real HTTP + SSL + Headers + Trackers)
                    </option>
                    <option value="deep-grounded">
                      Deep-Grounded (Full Search + Statutory Dossier)
                    </option>
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                    <span>Concurrency Limit</span>
                    <span className="text-amber-400">{concurrency} parallel streams</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    value={concurrency}
                    onChange={(e) => setConcurrency(parseInt(e.target.value, 10))}
                    disabled={isScanning}
                    className="w-full accent-amber-500 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] font-mono text-neutral-500 mt-0.5">
                    <span>1 (Cautious)</span>
                    <span>2 (Recommended)</span>
                    <span>4 (Aggressive)</span>
                  </div>
                </div>
              </div>

              {/* Start / Stop Trigger */}
              <div>
                {!isScanning ? (
                  <button
                    onClick={handleStartScan}
                    disabled={parsedDomains.length === 0}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                  >
                    <Play className="h-4 w-4 fill-black" />
                    <span>Launch 50-Site Audit</span>
                  </button>
                ) : (
                  <button
                    onClick={handleStopScan}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 hover:bg-red-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all cursor-pointer active:scale-[0.99]"
                  >
                    <Pause className="h-4 w-4" />
                    <span>Halt Bulk Scan</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Live Scan Progress Indicator */}
          {isScanning && (
            <div className="mt-6 pt-4 border-t border-neutral-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2 text-amber-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>
                    Inspecting target:{" "}
                    <strong className="text-white">
                      {activeScanningTarget || "Connecting..."}
                    </strong>
                  </span>
                </div>
                <span className="text-neutral-400">
                  {completedCount} / {items.length} Completed (
                  {Math.round((completedCount / (items.length || 1)) * 100)}%)
                </span>
              </div>

              <div className="h-2 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-300 rounded-full"
                  style={{
                    width: `${Math.round((completedCount / (items.length || 1)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </section>

        {/* Live Metrics Grid */}
        {items.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
              <div className="text-[11px] font-mono text-neutral-400 uppercase">Leads in Batch</div>
              <div className="text-2xl font-bold font-mono text-white mt-1">{items.length}</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                {completedCount} completed ({items.filter((i) => i.status === "failed").length}{" "}
                failed)
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
              <div className="text-[11px] font-mono text-neutral-400 uppercase">Average Score</div>
              <div
                className={`text-2xl font-bold font-mono mt-1 ${
                  avgScore >= 80
                    ? "text-emerald-400"
                    : avgScore >= 50
                      ? "text-amber-400"
                      : "text-red-400"
                }`}
              >
                {completedCount > 0 ? `${avgScore} / 100` : "—"}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Deterministic statutory index
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
              <div className="text-[11px] font-mono text-red-400 uppercase">
                High Fine Risk Leads
              </div>
              <div className="text-2xl font-bold font-mono text-red-400 mt-1">{criticalCount}</div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Score &lt; 50 (Immediate Client Target)
              </div>
            </div>

            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4">
              <div className="text-[11px] font-mono text-neutral-400 uppercase">
                Direct PDF Status
              </div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                {completedCount > 0 ? `${completedCount} PDFs` : "0"}
              </div>
              <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                Ready for individual/batch export
              </div>
            </div>
          </div>
        )}

        {/* Results Command Table & Export Hub */}
        {items.length > 0 && (
          <section className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-4">
            {/* Table Control Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              {/* Search & Filter */}
              <div className="flex items-center gap-3 flex-wrap flex-1">
                <div className="relative min-w-[200px] flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by domain..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-neutral-200 placeholder:text-neutral-600 focus:outline-none focus:border-amber-500/50"
                  />
                </div>

                <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-[11px] font-mono">
                  {(["all", "high", "medium", "low", "failed"] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setRiskFilter(filter)}
                      className={`px-2 py-0.5 rounded cursor-pointer capitalize ${
                        riskFilter === filter
                          ? "bg-amber-500/20 text-amber-300 font-bold"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      {filter === "all" ? "All Leads" : filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Master Export Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleBatchDownloadPdfs}
                  disabled={completedCount === 0 || batchPdfProgress !== null}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 border border-amber-500/40 text-xs font-bold text-amber-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {batchPdfProgress ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>
                        Exporting {batchPdfProgress.current}/{batchPdfProgress.total} PDFs...
                      </span>
                    </>
                  ) : (
                    <>
                      <Download className="h-3.5 w-3.5" />
                      <span>Download All {completedCount} PDFs</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleExportCsv}
                  disabled={items.length === 0}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-neutral-200 transition-colors cursor-pointer disabled:opacity-40"
                >
                  <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Export CSV Dossier</span>
                </button>
              </div>
            </div>

            {/* Results Table */}
            <div className="overflow-x-auto border border-neutral-800/80 rounded-xl">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-neutral-900/90 text-neutral-400 text-[11px] uppercase border-b border-neutral-800">
                  <tr>
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-4">Domain / Lead</th>
                    <th className="py-3 px-3">Score</th>
                    <th className="py-3 px-3">Risk Tier</th>
                    <th className="py-3 px-3">Missing Headers</th>
                    <th className="py-3 px-3">Pre-Consent Cookies</th>
                    <th className="py-3 px-3">Trackers</th>
                    <th className="py-3 px-3">Fine Risk Exposure</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60 bg-neutral-950/40">
                  {filteredItems.map((item, idx) => {
                    const score = item.score ?? 0;
                    return (
                      <tr key={item.id} className="hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3 px-3 text-neutral-500">{idx + 1}</td>
                        <td className="py-3 px-4 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span>{item.domain}</span>
                            <a
                              href={`https://${item.domain}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-neutral-500 hover:text-amber-400"
                              title="Open website in new tab"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                            {item.originCountry && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800">
                                {item.originCountry}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          {item.status === "completed" ? (
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                score >= 80
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : score >= 50
                                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {score} / 100
                            </span>
                          ) : item.status === "scanning" ? (
                            <span className="inline-flex items-center gap-1.5 text-amber-400">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-[11px]">Probing...</span>
                            </span>
                          ) : item.status === "failed" ? (
                            <span className="text-red-400 text-[11px]">Error</span>
                          ) : (
                            <span className="text-neutral-500 text-[11px]">Queued</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.status === "completed" ? (
                            score >= 80 ? (
                              <span className="text-emerald-400 text-[11px]">Compliant</span>
                            ) : score >= 50 ? (
                              <span className="text-amber-400 text-[11px]">Moderate</span>
                            ) : (
                              <span className="text-red-400 font-bold text-[11px]">
                                Critical Gaps
                              </span>
                            )
                          ) : item.status === "failed" ? (
                            <span
                              className="text-red-400/80 text-[10px] truncate max-w-[120px] block"
                              title={item.error}
                            >
                              {item.error || "Unreachable"}
                            </span>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.status === "completed" ? (
                            item.missingHeadersCount && item.missingHeadersCount > 0 ? (
                              <span
                                className="text-red-400 text-[11px] underline decoration-dotted cursor-help"
                                title={item.missingHeadersList?.join(", ")}
                              >
                                {item.missingHeadersCount} Missing
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[11px]">All Present</span>
                            )
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.status === "completed" ? (
                            <span
                              className={
                                (item.cookiesCount || 0) > 0 ? "text-amber-400" : "text-neutral-400"
                              }
                            >
                              {item.cookiesCount ?? 0}
                            </span>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.status === "completed" ? (
                            <span
                              className={
                                (item.trackersCount || 0) > 0 ? "text-red-400" : "text-neutral-400"
                              }
                            >
                              {item.trackersCount ?? 0}
                            </span>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          {item.status === "completed" ? (
                            <span className="text-[11px] text-neutral-300 font-sans truncate max-w-[140px] block">
                              {item.fineRisk}
                            </span>
                          ) : (
                            <span className="text-neutral-500">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "completed" && (
                              <>
                                <button
                                  onClick={() => handleDownloadPdf(item)}
                                  disabled={generatingPdfId === item.id}
                                  title="Download Single A4 Certificate PDF"
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-[11px] font-bold text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
                                >
                                  {generatingPdfId === item.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <Download className="h-3 w-3" />
                                  )}
                                  <span>PDF</span>
                                </button>

                                <button
                                  onClick={() => setModalItem(item)}
                                  title="Inspect Full Statutory Dossier"
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-neutral-300 transition-colors cursor-pointer"
                                >
                                  <Eye className="h-3 w-3" />
                                  <span>Dossier</span>
                                </button>
                              </>
                            )}

                            {item.status === "failed" && (
                              <button
                                onClick={async () => {
                                  item.status = "scanning";
                                  setItems([...items]);
                                  try {
                                    const res = await auditFn({
                                      data: { input: item.domain, scanMode },
                                    });
                                    item.status = "completed";
                                    item.report = res;
                                    item.score = res.score;
                                    item.fineRisk = res.fineRisk?.estimate;
                                  } catch (e: unknown) {
                                    item.status = "failed";
                                    item.error = e instanceof Error ? e.message : "Failed";
                                  }
                                  setItems([...items]);
                                }}
                                className="px-2 py-1 rounded bg-neutral-900 hover:bg-neutral-800 text-[10px] text-amber-400 border border-neutral-800 cursor-pointer"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Hidden container for rendering exact vector letterhead for PDF generation */}
      <div
        className="fixed -left-[9999px] top-0 pointer-events-none opacity-0 overflow-hidden"
        aria-hidden="true"
      >
        {activePdfReport && (
          <div ref={pdfRenderRef} className="w-[794px] bg-[#0d0c0b] p-6 text-white">
            <ASJiLetterheadReport
              report={activePdfReport.report}
              domain={activePdfReport.domain}
              score={activePdfReport.report.score}
            />
          </div>
        )}
      </div>

      {/* Interactive Dossier Modal */}
      {modalItem && modalItem.report && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/60">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base font-display">
                    Statutory Dossier: {modalItem.domain}
                  </h3>
                  <p className="text-xs text-neutral-400 font-mono">
                    Compliance Score: {modalItem.score} / 100 • Origin: {modalItem.originCountry}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadPdf(modalItem)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 cursor-pointer"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF Certificate</span>
                </button>
                <button
                  onClick={() => setModalItem(null)}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white text-xs font-mono cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Executive Summary */}
              <div className="p-4 bg-neutral-900/60 border border-neutral-800 rounded-xl space-y-2">
                <div className="text-xs font-mono uppercase text-amber-400 font-bold">
                  Statutory Executive Audit
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed font-mono">
                  {modalItem.report.summary}
                </p>
              </div>

              {/* Verified Technical Evidence */}
              <div>
                <div className="text-xs font-mono uppercase text-neutral-400 font-bold mb-2">
                  Zero-Hallucination Technical Evidence Dossier
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                  {modalItem.report.evidence?.map((ev, i) => (
                    <div
                      key={i}
                      className="p-2.5 bg-neutral-900/40 border border-neutral-800/80 rounded-lg text-neutral-300"
                    >
                      {ev}
                    </div>
                  ))}
                </div>
              </div>

              {/* Letterhead Preview */}
              <div>
                <div className="text-xs font-mono uppercase text-neutral-400 font-bold mb-2">
                  Official Certificate Preview
                </div>
                <div className="border border-neutral-800 rounded-xl overflow-hidden bg-[#0d0c0b] p-4 scale-[0.95] origin-top">
                  <ASJiLetterheadReport
                    report={modalItem.report}
                    domain={modalItem.domain}
                    score={modalItem.score}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
