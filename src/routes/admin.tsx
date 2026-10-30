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
  Receipt,
  Clock,
  Code,
  Scale,
  Award,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { seedWorldLawsToFirestore } from "@/lib/firestore-service";
import { auditCompliance, purgeDatabase, type AuditReport } from "@/lib/audit.functions";
import { validateAuditInput, detectInput } from "@/lib/audit-input";
import { downloadReportAsPdf } from "@/lib/pdf-export";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";
import { ASJiLegalSolutionReport } from "@/components/ASJiLegalSolutionReport";
import { ASJiRemediationCodeReport } from "@/components/ASJiRemediationCodeReport";
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
  const { user, loading, signInWithGoogle, signInWithGoogleRedirect, logout, dbOnline, authError } =
    useAuth();
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
  const [samplePdfReport, setSamplePdfReport] = useState<{
    report: AuditReport;
    domain: string;
    type: "audit" | "legal" | "patches";
  } | null>(null);
  const [downloadingSampleId, setDownloadingSampleId] = useState<string | null>(null);

  // Administrative Navigation & Clearance
  const [adminTab, setAdminTab] = useState<"scanner" | "licensing" | "trust-hub">("scanner");
  const [adminUsernameInput, setAdminUsernameInput] = useState("");
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [isPasscodeAdmin, setIsPasscodeAdmin] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("asji_master_admin_session") === "true") {
        setIsPasscodeAdmin(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const isMasterAdmin = isPasscodeAdmin;

  // Enterprise Transaction Verification State
  interface AdminTransaction {
    id: string;
    referenceId: string;
    domain: string;
    tier: string;
    tierName: string;
    priceInr: string;
    orgName: string;
    email: string;
    taxId?: string | null;
    status: "pending_verification" | "approved" | "rejected";
    submittedAt?: string;
  }

  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);

  // Load transactions from Firestore
  const fetchTransactions = async () => {
    setLoadingTxns(true);
    try {
      const q = query(collection(db, "transactions"));
      const snap = await getDocs(q);
      const list: AdminTransaction[] = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...(d.data() as Omit<AdminTransaction, "id">) });
      });
      list.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
      setTransactions(list);
    } catch (err) {
      console.warn("Transactions fetch note:", err);
    } finally {
      setLoadingTxns(false);
    }
  };

  useEffect(() => {
    if (isMasterAdmin) {
      fetchTransactions();
    }
  }, [isMasterAdmin]);

  const handleApproveTransaction = async (txn: AdminTransaction) => {
    try {
      await updateDoc(doc(db, "transactions", txn.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
      });
      await setDoc(
        doc(db, "licenses", txn.domain),
        {
          domain: txn.domain,
          active: true,
          tier: txn.tier,
          tierName: txn.tierName,
          priceInr: txn.priceInr,
          approvedAt: serverTimestamp(),
          approvedBy: "Citadel Master Controller",
        },
        { merge: true },
      );
      toast.success(`License Activated for ${txn.domain}!`, {
        description: `${txn.tierName} unlocked in sovereign license registry.`,
      });
      setTransactions((prev) =>
        prev.map((t) => (t.id === txn.id ? { ...t, status: "approved" } : t)),
      );
    } catch (err) {
      toast.error("Failed to approve license in Firestore.");
    }
  };

  const handleRejectTransaction = async (txnId: string) => {
    try {
      await updateDoc(doc(db, "transactions", txnId), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
      });
      toast.info("Transaction reference marked as rejected.");
      setTransactions((prev) =>
        prev.map((t) => (t.id === txnId ? { ...t, status: "rejected" } : t)),
      );
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  const [syncingLaws, setSyncingLaws] = useState(false);

  const handleSyncWorldLaws = async () => {
    setSyncingLaws(true);
    try {
      const res = await seedWorldLawsToFirestore();
      toast.success(`Synchronized ${res.count} Sovereign Jurisdictions to Database`, {
        description: "All 15 global frameworks verified in Firestore including Nigeria NDPA 2023.",
      });
    } catch (err) {
      toast.error("Database sync notice: local framework active.");
    } finally {
      setSyncingLaws(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = adminUsernameInput.trim();
    const p = adminPasswordInput.trim();

    if (u === "ASJi$%@345267" && p === "QAWSEDRFASJi6767#$@") {
      setIsPasscodeAdmin(true);
      try {
        sessionStorage.setItem("asji_master_admin_session", "true");
      } catch (err) {
        console.debug("Session storage note:", err);
      }

      try {
        let currentAuthUser = auth.currentUser;
        if (!currentAuthUser) {
          const cred = await signInAnonymously(auth);
          currentAuthUser = cred.user;
        }
        if (currentAuthUser) {
          await setDoc(
            doc(db, "admins", currentAuthUser.uid),
            {
              role: "master_admin",
              activatedAt: serverTimestamp(),
            },
            { merge: true },
          );
        }
      } catch (authErr) {
        console.debug("Admin clearance sync note:", authErr);
      }

      toast.success("Master Sovereign Access Granted", {
        description: "Authenticated as Citadel Controller",
      });
      fetchTransactions();
    } else {
      toast.error("Invalid Sovereign Credentials", {
        description: "Access denied. Correct username and password required.",
      });
    }
  };

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

  // Download Sample Trust PDF for Client Sharing
  const handleDownloadSamplePdf = async (
    sampleType: "audit" | "legal" | "patches",
    sampleDomain: string,
  ) => {
    setDownloadingSampleId(sampleType);

    const sampleReport: AuditReport = {
      target: sampleDomain,
      score: sampleType === "audit" ? 82 : sampleType === "legal" ? 88 : 94,
      originCountry: "Global Enterprise Jurisdiction",
      frameworks: ["EU GDPR", "India DPDP Act 2023", "UK DUAA", "US CPRA", "Nigeria NDPA 2023"],
      criticalLeaks:
        sampleType === "audit"
          ? [
              {
                title: "Pre-Consent Marketing Telemetry Detected",
                severity: "high",
                detail:
                  "Third-party analytics beacons initiated prior to explicit affirmative user consent banner acknowledgment.",
              },
            ]
          : [],
      evidence: [
        "TLS Certificate: Valid 256-Bit RSA Encryption",
        "Cookie Banner: Conditional banner active",
        "Server Headers: X-Frame-Options DENY configured",
        "Cross-Border Transfer: Adequacy whitelist validated",
      ],
      summary: `Official Sovereign Compliance & Security Sample Deliverable generated for ${sampleDomain}. Verified against 15 global sovereign privacy frameworks including EU GDPR, India DPDP Act 2023, Nigeria NDPA 2023, and US CPRA.`,
      provenance: {
        scannedAt: Date.now(),
        ipAddress: "169.254.8.1",
        latencyMs: 115,
      },
      fineRisk: {
        estimate: "€150,000 / $165,000 USD (Statutory Max Threshold)",
        severity: "Moderate",
      },
    };

    setSamplePdfReport({ report: sampleReport, domain: sampleDomain, type: sampleType });

    setTimeout(async () => {
      try {
        if (!pdfRenderRef.current) {
          throw new Error("PDF renderer unmounted");
        }
        toast.info(`Synthesizing Client Trust Deliverable PDF for ${sampleDomain}...`);
        await downloadReportAsPdf(pdfRenderRef.current, sampleDomain);
        toast.success(`Sample Deliverable PDF (${sampleDomain}) downloaded successfully!`);
      } catch (err) {
        console.error("Sample PDF generation failed:", err);
        toast.error("Failed to generate sample deliverable PDF.");
      } finally {
        setDownloadingSampleId(null);
        setSamplePdfReport(null);
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

  // 2. Unauthenticated State (Requires Strict Admin Username & Password)
  if (!isMasterAdmin) {
    return (
      <div className="min-h-screen bg-[#060606] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-neutral-950/90 border border-neutral-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden animate-scale-in">
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center relative z-10 space-y-6">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-inner mx-auto">
              <Shield className="h-8 w-8" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight font-display">
                ASJi Command Citadel
              </h1>
              <p className="text-xs uppercase tracking-widest text-amber-400 font-mono mt-1 font-semibold">
                Classified Master Administration Gateway
              </p>
            </div>

            <form onSubmit={handleAdminLogin} className="space-y-4 text-left font-mono text-xs">
              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Administrator Username
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    required
                    placeholder="Enter Master Username"
                    value={adminUsernameInput}
                    onChange={(e) => setAdminUsernameInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                  Master Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-500" />
                  <input
                    type="password"
                    required
                    placeholder="Enter Master Passphrase"
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:border-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-xl shadow-amber-500/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authorize Sovereign Access</span>
                </button>
              </div>
            </form>

            <div className="pt-4 border-t border-neutral-900 text-center">
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
      <header className="border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md sticky top-0 z-40 animate-fade-down">
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
                Authenticated: <span className="text-amber-300">Sovereign Master Controller</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[11px] font-mono text-neutral-400">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sovereign DB: {dbOnline ? "ONLINE" : "READY"}</span>
            </div>

            <button
              onClick={handleSyncWorldLaws}
              disabled={syncingLaws}
              title="Synchronize 15 Sovereign Laws to Firestore Database"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono text-amber-400 hover:text-amber-300 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Database className={`h-3.5 w-3.5 ${syncingLaws ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">
                {syncingLaws ? "Syncing..." : "Sync 15 Laws"}
              </span>
            </button>

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
              onClick={() => {
                try {
                  sessionStorage.removeItem("asji_master_admin_session");
                } catch (e) {
                  console.debug("Session cleanup:", e);
                }
                setIsPasscodeAdmin(false);
                logout();
              }}
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
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800/80 pb-4 animate-fade-up delay-50">
          <button
            onClick={() => setAdminTab("scanner")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              adminTab === "scanner"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>50-Lead Bulk Scanner</span>
          </button>

          <button
            onClick={() => {
              setAdminTab("licensing");
              fetchTransactions();
            }}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer relative ${
              adminTab === "licensing"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Receipt className="h-4 w-4" />
            <span>License Approvals &amp; UTR Reconciliation</span>
            {transactions.filter((t) => t.status === "pending_verification").length > 0 && (
              <span className="h-5 w-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                {transactions.filter((t) => t.status === "pending_verification").length}
              </span>
            )}
          </button>
          <button
            onClick={() => setAdminTab("trust-hub")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              adminTab === "trust-hub"
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white"
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Client Trust &amp; Sample Deliverables Hub</span>
          </button>
        </div>

        {adminTab === "scanner" && (
          <>
            {/* Bulk Scanner Control Citadel */}
            <section className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm relative overflow-hidden animate-fade-up delay-100">
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
                    response headers, pre-consent cookies, tracker pixels, and statutory fine
                    exposure with instant A4 Certificate PDF generation.
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
                        onChange={(e) =>
                          setScanMode(e.target.value as "fast-lite" | "deep-grounded")
                        }
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-up delay-150">
                <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 animate-scale-in delay-100 hover:border-amber-500/40 transition-all">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">
                    Leads in Batch
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{items.length}</div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    {completedCount} completed ({items.filter((i) => i.status === "failed").length}{" "}
                    failed)
                  </div>
                </div>

                <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 animate-scale-in delay-150 hover:border-amber-500/40 transition-all">
                  <div className="text-[11px] font-mono text-neutral-400 uppercase">
                    Average Score
                  </div>
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

                <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 animate-scale-in delay-200 hover:border-amber-500/40 transition-all">
                  <div className="text-[11px] font-mono text-red-400 uppercase">
                    High Fine Risk Leads
                  </div>
                  <div className="text-2xl font-bold font-mono text-red-400 mt-1">
                    {criticalCount}
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500 mt-0.5">
                    Score &lt; 50 (Immediate Client Target)
                  </div>
                </div>

                <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-xl p-4 animate-scale-in delay-250 hover:border-amber-500/40 transition-all">
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
                                    (item.cookiesCount || 0) > 0
                                      ? "text-amber-400"
                                      : "text-neutral-400"
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
                                    (item.trackersCount || 0) > 0
                                      ? "text-red-400"
                                      : "text-neutral-400"
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
          </>
        )}

        {/* ENTERPRISE LICENSING & UTR RECONCILIATION DESK */}
        {adminTab === "licensing" && (
          <section className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-6 shadow-xl backdrop-blur-sm space-y-6 animate-fade-up delay-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
              <div>
                <div className="flex items-center gap-2.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <h2 className="text-xl font-bold text-white tracking-tight font-display">
                    Enterprise License Reconciliation Desk
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 mt-1">
                  Manual Bank Switch reconciliation. Verify incoming UPI/IMPS UTR references before
                  minting official cryptographic client licenses. Zero bypass guarantee.
                </p>
              </div>

              <button
                onClick={fetchTransactions}
                disabled={loadingTxns}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-xs font-mono font-bold text-neutral-300 transition-colors cursor-pointer"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${loadingTxns ? "animate-spin" : ""}`} />
                <span>Refresh Queue</span>
              </button>
            </div>

            {loadingTxns ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="h-8 w-8 text-amber-400 animate-spin mb-3" />
                <p className="text-xs font-mono text-neutral-400">
                  Loading sovereign transactions from Firestore...
                </p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="py-12 text-center rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-8 space-y-3">
                <Clock className="h-8 w-8 text-amber-400/60 mx-auto" />
                <h3 className="text-sm font-bold text-white font-mono">
                  No Transaction References Queued
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  When enterprise purchasers submit payment proofs on checkout, their bank UTR
                  numbers and domain licenses will appear here for verification.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-neutral-800">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-neutral-900 text-neutral-400 border-b border-neutral-800">
                      <th className="p-3">Target Domain</th>
                      <th className="p-3">Bank UTR Reference</th>
                      <th className="p-3">Deliverable Tier</th>
                      <th className="p-3">Purchasing Entity</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/80">
                    {transactions.map((txn) => {
                      const isPending = txn.status === "pending_verification";
                      const isApproved = txn.status === "approved";
                      return (
                        <tr key={txn.id} className="hover:bg-neutral-900/40 transition-colors">
                          <td className="p-3 font-bold text-white break-all">{txn.domain}</td>
                          <td className="p-3 font-bold text-amber-300 select-all">
                            {txn.referenceId}
                          </td>
                          <td className="p-3 text-neutral-300">
                            <div>{txn.tierName}</div>
                            <div className="text-[10px] text-amber-400/80">{txn.priceInr}</div>
                          </td>
                          <td className="p-3 text-neutral-300">
                            <div>{txn.orgName || "Enterprise Client"}</div>
                            <div className="text-[10px] text-neutral-500">{txn.email}</div>
                          </td>
                          <td className="p-3 text-neutral-400 text-[11px] whitespace-nowrap">
                            {txn.submittedAt
                              ? new Date(txn.submittedAt).toLocaleString()
                              : "Recent"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isPending
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : isApproved
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                    : "bg-red-500/10 text-red-400 border border-red-500/30"
                              }`}
                            >
                              {txn.status || "Pending"}
                            </span>
                          </td>
                          <td className="p-3 text-right whitespace-nowrap">
                            {isPending ? (
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleApproveTransaction(txn)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 transition-colors cursor-pointer"
                                >
                                  ✓ Approve License
                                </button>
                                <button
                                  onClick={() => handleRejectTransaction(txn.id)}
                                  className="px-2 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] text-red-400 transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-neutral-500 italic">
                                {isApproved ? "License Active" : "Rejected"}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {adminTab === "trust-hub" && (
          <section className="bg-neutral-950/70 border border-neutral-800/90 rounded-2xl p-6 sm:p-8 shadow-xl backdrop-blur-sm space-y-6 animate-fade-up delay-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <Award className="h-6 w-6 text-amber-400" />
                  <h2 className="text-xl font-bold text-white tracking-tight font-display">
                    Client Trust &amp; Sample Deliverables Hub
                  </h2>
                </div>
                <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed font-mono">
                  Download professional sample audit dossiers, 15-jurisdiction sovereign legal
                  solution packs, and autonomous remediation code patches generated on your custom
                  letterhead. Share these with prospective clients to demonstrate elite compliance
                  expertise and build immediate trust.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 rounded-xl shrink-0">
                <ShieldCheck className="h-4 w-4" />
                <span>Letterhead Watermark Active</span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3 font-mono">
              {/* Sample Card 1: Enterprise Audit Report */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all animate-fade-up delay-100">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    Sample Enterprise Audit Dossier
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Full 15-jurisdiction compliance breakdown, pre-consent tracker detection, and
                    fine exposure estimation for{" "}
                    <strong className="text-white">secure-enterprise-client.com</strong>.
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => handleDownloadSamplePdf("audit", "secure-enterprise-client.com")}
                    disabled={downloadingSampleId !== null}
                    className="w-full btn-gold inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {downloadingSampleId === "audit" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Download Sample Audit PDF</span>
                  </button>
                </div>
              </div>

              {/* Sample Card 2: 15-Jurisdiction Legal Solution Pack */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all animate-fade-up delay-200">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Scale className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">
                    Sample 15-Sovereign Legal Suite
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Statutory notice at collection, Grievance Officer charter, EU SCCs, and
                    multi-sovereign compliance disclosures for{" "}
                    <strong className="text-white">global-compliance-client.org</strong>.
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => handleDownloadSamplePdf("legal", "global-compliance-client.org")}
                    disabled={downloadingSampleId !== null}
                    className="w-full btn-gold inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {downloadingSampleId === "legal" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Download Sample Legal PDF</span>
                  </button>
                </div>
              </div>

              {/* Sample Card 3: Autonomous Remediation Patches */}
              <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/40 transition-all animate-fade-up delay-300">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Code className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-white text-base">Sample Remediation Code Pack</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Executable NGINX/Apache security headers, CSP configs, CMP pre-consent gating
                    script, and Cloudflare Edge middleware for{" "}
                    <strong className="text-white">hardened-gateway-client.net</strong>.
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={() =>
                      handleDownloadSamplePdf("patches", "hardened-gateway-client.net")
                    }
                    disabled={downloadingSampleId !== null}
                    className="w-full btn-gold inline-flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-lg shadow-amber-500/20 disabled:opacity-50"
                  >
                    {downloadingSampleId === "patches" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    <span>Download Sample Patches PDF</span>
                  </button>
                </div>
              </div>
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

        {samplePdfReport && (
          <div ref={pdfRenderRef}>
            {samplePdfReport.type === "legal" ? (
              <ASJiLegalSolutionReport
                report={samplePdfReport.report}
                domain={samplePdfReport.domain}
              />
            ) : samplePdfReport.type === "patches" ? (
              <ASJiRemediationCodeReport
                report={samplePdfReport.report}
                domain={samplePdfReport.domain}
              />
            ) : (
              <div className="w-[794px] bg-[#0d0c0b] p-6 text-white">
                <ASJiLetterheadReport
                  report={samplePdfReport.report}
                  domain={samplePdfReport.domain}
                  score={samplePdfReport.report.score}
                />
              </div>
            )}
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
