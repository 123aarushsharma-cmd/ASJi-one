import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Shield,
  ShieldCheck,
  Search,
  Loader2,
  Database,
  LogOut,
  Receipt,
  Award,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Play,
  Download,
  Plus,
  Trash2,
  Edit3,
  X,
  ExternalLink,
  Calendar,
  Check,
  Globe,
  Activity,
  Filter,
  Eye,
  Clock,
  Sparkles,
  KeyRound,
  FileSpreadsheet,
  FileJson,
  RotateCcw,
  StopCircle,
  Scale,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { auditCompliance } from "@/lib/audit.functions";
import type { AuditReport } from "@/lib/audit-types";
import {
  seedWorldLawsToFirestore,
  fetchWorldLaws,
  updateWorldLaw,
  createWorldLaw,
  deleteWorldLaw,
  recordDailyStatutoryCheck,
  fetchDailyStatutoryUpdates,
  saveBulkScanBatch,
  fetchBulkScanBatches,
  deleteBulkScanBatch,
  type BulkScanBatch,
  type BulkScanItem,
  type DailyStatutoryUpdate,
} from "@/lib/firestore-service";
import { WORLD_LAWS_DATA, type WorldLaw } from "@/lib/world-laws-data";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "ASJi Sovereign Command Citadel" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

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

interface ActiveLicense {
  domain: string;
  active: boolean;
  tier: string;
  tierName?: string;
  priceInr?: string;
  orgName?: string;
  approvedAt?: unknown;
  issuedBy?: string;
  manualGrant?: boolean;
}

const BULK_PRESETS = [
  {
    name: "🇮🇳 India DPDP Targets",
    domains: "flipkart.com\nzomato.com\nswiggy.com\nrazorpay.com\ncred.club",
  },
  {
    name: "🌐 Global SaaS & Cloud",
    domains: "shopify.com\nstripe.com\nvercel.com\nnotion.so\nslack.com",
  },
  {
    name: "🛍️ E-Commerce & Retail",
    domains: "amazon.in\nmeesho.com\nnykaa.com\najio.com\ntatamarkets.com",
  },
  {
    name: "🏦 FinTech & Banking",
    domains: "phonepe.com\npaytm.com\ngroww.in\nzerodha.com\ncred.club",
  },
];

function AdminPage() {
  const {
    user,
    loading: authLoading,
    isAdmin,
    adminSignInWithGoogle,
    logout,
    logAdminActivity,
    authError,
    clearAuthError,
  } = useAuth();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminTab, setAdminTab] = useState<"scanner" | "laws" | "licensing">("scanner");

  // Server audit function
  const runAudit = useServerFn(auditCompliance);

  // -------------------------------------------------------------
  // TAB 1: BULK SCANNER STATE
  // -------------------------------------------------------------
  const [bulkInput, setBulkInput] = useState(BULK_PRESETS[0].domains);
  const [bulkScanMode, setBulkScanMode] = useState<"fast-lite" | "deep-grounded">("fast-lite");
  const [isBulkScanning, setIsBulkScanning] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, currentDomain: "" });
  const [bulkResults, setBulkResults] = useState<BulkScanItem[]>([]);
  const [bulkFilter, setBulkFilter] = useState<"all" | "critical" | "moderate" | "compliant">(
    "all",
  );
  const [selectedAuditDetail, setSelectedAuditDetail] = useState<AuditReport | null>(null);
  const [pastBatches, setPastBatches] = useState<BulkScanBatch[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const abortScanRef = useRef(false);

  // -------------------------------------------------------------
  // TAB 2: LAWS DATABASE STATE
  // -------------------------------------------------------------
  const [laws, setLaws] = useState<WorldLaw[]>(WORLD_LAWS_DATA);
  const [loadingLaws, setLoadingLaws] = useState(false);
  const [lawSearch, setLawSearch] = useState("");
  const [lawRegionFilter, setLawRegionFilter] = useState<string>("all");
  const [syncingLaws, setSyncingLaws] = useState(false);
  const [editingLaw, setEditingLaw] = useState<WorldLaw | null>(null);
  const [isAddingLaw, setIsAddingLaw] = useState(false);
  const [newLaw, setNewLaw] = useState<Partial<WorldLaw>>({
    region: "Asia-Pacific",
    status: "In Force",
    extraterritorialScope: true,
    dpoMandatory: true,
    maxPenalty: "Refer to the Act",
    breachNotificationHours: "72 hours",
    childrenAgeThreshold: 18,
  });
  const [dailyUpdates, setDailyUpdates] = useState<DailyStatutoryUpdate[]>([]);
  const [loadingDailyUpdates, setLoadingDailyUpdates] = useState(false);
  const [showDailyCheckModal, setShowDailyCheckModal] = useState(false);
  const [dailyNotes, setDailyNotes] = useState("");
  const [isRecordingDailyCheck, setIsRecordingDailyCheck] = useState(false);

  // -------------------------------------------------------------
  // TAB 3: LICENSING STATE
  // -------------------------------------------------------------
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [activeLicenses, setActiveLicenses] = useState<ActiveLicense[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [txnFilter, setTxnFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [txnSearch, setTxnSearch] = useState("");
  const [isIssuingManual, setIsIssuingManual] = useState(false);
  const [manualDomain, setManualDomain] = useState("");
  const [manualTier, setManualTier] = useState("enterprise");
  const [manualPrice, setManualPrice] = useState("₹49,999");
  const [manualOrg, setManualOrg] = useState("");

  // -------------------------------------------------------------
  // DATA FETCHING & SYNCHRONIZATION
  // -------------------------------------------------------------
  const fetchTransactions = useCallback(async () => {
    if (!isAdmin) return;
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
    } catch {
      // safe fallback
    } finally {
      setLoadingTxns(false);
    }
  }, [isAdmin]);

  const fetchLicenses = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const snap = await getDocs(collection(db, "licenses"));
      const list: ActiveLicense[] = [];
      snap.forEach((d) => {
        list.push(d.data() as ActiveLicense);
      });
      setActiveLicenses(list);
    } catch {
      // safe fallback
    }
  }, [isAdmin]);

  const loadLawsFromFirestore = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingLaws(true);
    try {
      const data = await fetchWorldLaws();
      setLaws(data);
    } catch {
      setLaws(WORLD_LAWS_DATA);
    } finally {
      setLoadingLaws(false);
    }
  }, [isAdmin]);

  const loadDailyUpdatesFromFirestore = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingDailyUpdates(true);
    try {
      const data = await fetchDailyStatutoryUpdates();
      setDailyUpdates(data);
    } catch {
      // safe fallback
    } finally {
      setLoadingDailyUpdates(false);
    }
  }, [isAdmin]);

  const loadPastBatchesFromFirestore = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingBatches(true);
    try {
      const data = await fetchBulkScanBatches();
      setPastBatches(data);
    } catch {
      // safe fallback
    } finally {
      setLoadingBatches(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      fetchTransactions();
      fetchLicenses();
      loadLawsFromFirestore();
      loadDailyUpdatesFromFirestore();
      loadPastBatchesFromFirestore();
    }
  }, [
    isAdmin,
    fetchTransactions,
    fetchLicenses,
    loadLawsFromFirestore,
    loadDailyUpdatesFromFirestore,
    loadPastBatchesFromFirestore,
  ]);

  // Is laws verified today?
  const isVerifiedToday = useMemo(() => {
    if (dailyUpdates.length === 0) return false;
    const latest = new Date(dailyUpdates[0].verifiedAt);
    const today = new Date();
    return (
      latest.getDate() === today.getDate() &&
      latest.getMonth() === today.getMonth() &&
      latest.getFullYear() === today.getFullYear()
    );
  }, [dailyUpdates]);

  // -------------------------------------------------------------
  // AUTHENTICATION HANDLERS
  // -------------------------------------------------------------
  const handleGoogleAuth = async () => {
    setIsAuthenticating(true);
    clearAuthError();
    try {
      await adminSignInWithGoogle();
      toast.success("Welcome to Sovereign Command Citadel", {
        description: "Authenticated with Firebase Auth & Verified Admin Clearance.",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Access denied.";
      toast.error("Authentication Error", { description: msg });
    } finally {
      setIsAuthenticating(false);
    }
  };

  // -------------------------------------------------------------
  // BULK SCANNER HANDLERS
  // -------------------------------------------------------------
  const detectedDomains = useMemo(() => {
    return bulkInput
      .split(/[\n,]/)
      .map((u) =>
        u
          .trim()
          .replace(/^https?:\/\//i, "")
          .replace(/\/.*$/, ""),
      )
      .filter((u) => u.length > 2 && u.includes("."));
  }, [bulkInput]);

  const handleExecuteBulkScan = async () => {
    if (detectedDomains.length === 0) {
      toast.error("Please enter at least one valid domain URL (e.g. domain.com)");
      return;
    }

    const uniqueDomains = Array.from(new Set(detectedDomains));
    setIsBulkScanning(true);
    abortScanRef.current = false;
    setBulkProgress({ current: 0, total: uniqueDomains.length, currentDomain: uniqueDomains[0] });

    const items: BulkScanItem[] = [];

    for (let i = 0; i < uniqueDomains.length; i++) {
      if (abortScanRef.current) {
        toast.info("Bulk scan aborted by operator.");
        break;
      }

      const domain = uniqueDomains[i];
      setBulkProgress({ current: i + 1, total: uniqueDomains.length, currentDomain: domain });

      try {
        const report = await runAudit({ data: { input: domain, scanMode: bulkScanMode } });
        const leaksCount = report.criticalLeaks?.length || 0;
        const score = typeof report.score === "number" ? report.score : 50;
        const verdict =
          score >= 80 ? "COMPLIANT" : score >= 50 ? "MODERATE RISK" : "CRITICAL NON-COMPLIANT";
        const fine = report.fineRisk?.estimate
          ? `${report.fineRisk.estimate} ${report.fineRisk.currency || ""}`
          : "Under Statutory Assessment";
        const serverLoc = report.serverLocation?.countryName || "Sovereign Cloud";

        const item: BulkScanItem = {
          domain,
          score,
          verdict,
          criticalLeaksCount: leaksCount,
          fineExposure: fine,
          serverLocation: serverLoc,
          summary:
            report.summary || "Reconnaissance completed against global data protection statutes.",
          scannedAt: new Date().toISOString(),
          reportData: report,
        };
        items.push(item);
        setBulkResults([...items]);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Reconnaissance failed.";
        const item: BulkScanItem = {
          domain,
          score: 0,
          verdict: "SCAN FAILED",
          criticalLeaksCount: 0,
          fineExposure: "N/A",
          serverLocation: "Unknown",
          summary: `Audit execution error: ${errorMsg}`,
          scannedAt: new Date().toISOString(),
          error: errorMsg,
        };
        items.push(item);
        setBulkResults([...items]);
      }
    }

    setIsBulkScanning(false);

    if (items.length > 0) {
      const validScores = items.filter((x) => x.verdict !== "SCAN FAILED").map((x) => x.score);
      const avg =
        validScores.length > 0
          ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
          : 0;
      const highRisk = items.filter((x) => x.verdict === "CRITICAL NON-COMPLIANT").length;

      const batchRecord: BulkScanBatch = {
        id: `batch-${Date.now()}`,
        title: `Batch Audit (${items.length} targets) - ${new Date().toLocaleDateString()}`,
        scannedBy: user?.email || "Master Administrator",
        createdAt: new Date().toISOString(),
        totalDomains: items.length,
        completedDomains: items.filter((x) => x.verdict !== "SCAN FAILED").length,
        avgScore: avg,
        highRiskCount: highRisk,
        items,
      };

      try {
        await saveBulkScanBatch(batchRecord);
        setPastBatches((prev) => [batchRecord, ...prev]);
        toast.success("Bulk Scan Completed & Persisted to Firestore", {
          description: `Audited ${items.length} domains (Avg Score: ${avg}/100, Critical Risk: ${highRisk}).`,
        });
      } catch {
        toast.warning("Batch completed locally, but failed to write to Firestore.");
      }
    }
  };

  const handleAbortScan = () => {
    abortScanRef.current = true;
    toast.info("Stopping bulk reconnaissance...");
  };

  const filteredBulkResults = useMemo(() => {
    if (bulkFilter === "critical")
      return bulkResults.filter((r) => r.verdict === "CRITICAL NON-COMPLIANT");
    if (bulkFilter === "moderate") return bulkResults.filter((r) => r.verdict === "MODERATE RISK");
    if (bulkFilter === "compliant") return bulkResults.filter((r) => r.verdict === "COMPLIANT");
    return bulkResults;
  }, [bulkResults, bulkFilter]);

  const handleExportCsv = (items: BulkScanItem[], title = "Batch") => {
    if (items.length === 0) return;
    const headers = [
      "Domain",
      "Score",
      "Verdict",
      "Critical Leaks",
      "Fine Exposure",
      "Server Location",
      "Scanned At",
    ];
    const rows = items.map((i) => [
      `"${i.domain}"`,
      i.score,
      `"${i.verdict}"`,
      i.criticalLeaksCount,
      `"${i.fineExposure.replace(/"/g, '""')}"`,
      `"${(i.serverLocation || "").replace(/"/g, '""')}"`,
      `"${i.scannedAt}"`,
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASJi_Bulk_Audit_${title.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV export downloaded successfully.");
  };

  const handleExportJson = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("JSON export downloaded.");
  };

  const handleDeletePastBatch = async (batchId: string) => {
    if (!confirm("Are you sure you want to delete this bulk scan batch from Cloud Firestore?"))
      return;
    try {
      await deleteBulkScanBatch(batchId);
      setPastBatches((prev) => prev.filter((b) => b.id !== batchId));
      toast.success("Batch deleted from Firestore.");
    } catch {
      toast.error("Failed to delete batch.");
    }
  };

  // -------------------------------------------------------------
  // LAWS DATABASE HANDLERS (DAILY UPDATES & FIRESTORE CRUD)
  // -------------------------------------------------------------
  const handleSyncWorldLaws = async () => {
    if (!isAdmin) return;
    setSyncingLaws(true);
    try {
      const res = await seedWorldLawsToFirestore();
      await logAdminActivity("SYNC_WORLD_LAWS", { count: res.count });
      await loadLawsFromFirestore();
      toast.success(`Synchronized ${res.count} Sovereign Jurisdictions to Cloud Firestore!`);
    } catch {
      toast.error("Failed to sync laws.");
    } finally {
      setSyncingLaws(false);
    }
  };

  const handleDailyVerification = async () => {
    if (!isAdmin) return;
    setIsRecordingDailyCheck(true);
    try {
      const update = await recordDailyStatutoryCheck(
        user?.email || "Master Administrator",
        dailyNotes ||
          "Daily statutory verification confirmed all sovereign jurisdictions active with DPDP Rules 2025 compliance.",
        laws.length || 15,
      );
      setDailyUpdates((prev) => [update, ...prev]);
      setShowDailyCheckModal(false);
      setDailyNotes("");
      toast.success("Daily Statutory Verification Recorded in Firestore", {
        description: `Verified ${laws.length || 15} sovereign jurisdictions as of today.`,
      });
    } catch {
      toast.error("Failed to record daily statutory verification.");
    } finally {
      setIsRecordingDailyCheck(false);
    }
  };

  const handleSaveLawEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaw || !isAdmin) return;
    try {
      await updateWorldLaw(editingLaw, user?.email || "admin");
      setLaws((prev) => prev.map((l) => (l.id === editingLaw.id ? editingLaw : l)));
      setEditingLaw(null);
      toast.success(`Updated statutory record for ${editingLaw.country} in Cloud Firestore!`);
    } catch {
      toast.error("Failed to update law in Firestore.");
    }
  };

  const handleCreateNewLaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaw.country || !newLaw.lawName || !isAdmin) return;
    const id = newLaw.id || newLaw.country.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fullLaw: WorldLaw = {
      id,
      country: newLaw.country || "",
      countryCode: newLaw.countryCode || "XX",
      flag: newLaw.flag || "🌐",
      region: (newLaw.region as WorldLaw["region"]) || "Asia-Pacific",
      lawName: newLaw.lawName || "",
      acronym: newLaw.acronym || "",
      enactedYear: Number(newLaw.enactedYear) || new Date().getFullYear(),
      status: (newLaw.status as WorldLaw["status"]) || "In Force",
      governingBody: newLaw.governingBody || "National Data Authority",
      officialPortal: newLaw.officialPortal || "https://",
      maxPenalty: newLaw.maxPenalty || "Refer to the Act",
      extraterritorialScope: Boolean(newLaw.extraterritorialScope),
      dpoMandatory: Boolean(newLaw.dpoMandatory),
      breachNotificationHours: newLaw.breachNotificationHours || "72 hours",
      childrenAgeThreshold: Number(newLaw.childrenAgeThreshold) || 18,
      crossBorderAdequacyRequired: Boolean(newLaw.crossBorderAdequacyRequired),
      corePrinciples:
        typeof newLaw.corePrinciples === "string"
          ? (newLaw.corePrinciples as string).split("\n").filter(Boolean)
          : newLaw.corePrinciples || [],
      keyArticles: [],
      statutorySummary: newLaw.statutorySummary || "",
      standardDraftTemplate: "",
    };
    try {
      await createWorldLaw(fullLaw, user?.email || "admin");
      setLaws((prev) => [...prev, fullLaw]);
      setIsAddingLaw(false);
      setNewLaw({
        region: "Asia-Pacific",
        status: "In Force",
        extraterritorialScope: true,
        dpoMandatory: true,
        maxPenalty: "Refer to the Act",
        breachNotificationHours: "72 hours",
        childrenAgeThreshold: 18,
      });
      toast.success(`Created statutory jurisdiction for ${fullLaw.country} in Cloud Firestore!`);
    } catch {
      toast.error("Failed to create new law in Firestore.");
    }
  };

  const handleDeleteLaw = async (lawId: string) => {
    if (!confirm("Are you sure you want to delete this sovereign law from Cloud Firestore?"))
      return;
    try {
      await deleteWorldLaw(lawId);
      setLaws((prev) => prev.filter((l) => l.id !== lawId));
      toast.info("Statutory jurisdiction removed from Firestore.");
    } catch {
      toast.error("Failed to delete law.");
    }
  };

  const filteredLaws = useMemo(() => {
    return laws.filter((law) => {
      const matchesSearch =
        law.country.toLowerCase().includes(lawSearch.toLowerCase()) ||
        law.lawName.toLowerCase().includes(lawSearch.toLowerCase()) ||
        law.acronym.toLowerCase().includes(lawSearch.toLowerCase()) ||
        law.governingBody.toLowerCase().includes(lawSearch.toLowerCase());
      const matchesRegion = lawRegionFilter === "all" || law.region === lawRegionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [laws, lawSearch, lawRegionFilter]);

  // -------------------------------------------------------------
  // LICENSING & TRANSACTION HANDLERS
  // -------------------------------------------------------------
  const handleApproveTransaction = async (txn: AdminTransaction) => {
    if (!isAdmin) return;
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
          orgName: txn.orgName,
          approvedAt: serverTimestamp(),
        },
        { merge: true },
      );
      await logAdminActivity("APPROVE_LICENSE", {
        domain: txn.domain,
        referenceId: txn.referenceId,
      });
      toast.success(`License Activated for ${txn.domain}!`);
      setTransactions((prev) =>
        prev.map((t) => (t.id === txn.id ? { ...t, status: "approved" } : t)),
      );
      fetchLicenses();
    } catch {
      toast.error("Failed to approve license.");
    }
  };

  const handleRejectTransaction = async (txn: AdminTransaction) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "transactions", txn.id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
      });
      await logAdminActivity("REJECT_LICENSE", {
        domain: txn.domain,
        referenceId: txn.referenceId,
      });
      toast.info("Transaction reference rejected.");
      setTransactions((prev) =>
        prev.map((t) => (t.id === txn.id ? { ...t, status: "rejected" } : t)),
      );
    } catch {
      toast.error("Failed to reject transaction.");
    }
  };

  const handleIssueManualLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDomain || !isAdmin) return;
    const cleanDomain = manualDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/\/.*$/, "");

    try {
      await setDoc(
        doc(db, "licenses", cleanDomain),
        {
          domain: cleanDomain,
          active: true,
          tier: manualTier,
          tierName:
            manualTier === "enterprise"
              ? "Sovereign Enterprise"
              : manualTier === "citadel"
                ? "Citadel Shield"
                : "Enterprise Pass",
          priceInr: manualPrice || "₹49,999",
          orgName: manualOrg || "Direct Corporate Grant",
          approvedAt: serverTimestamp(),
          issuedBy: user?.email || "Master Admin",
          manualGrant: true,
        },
        { merge: true },
      );
      toast.success(`Executive License Activated for ${cleanDomain}!`);
      setIsIssuingManual(false);
      setManualDomain("");
      setManualOrg("");
      fetchLicenses();
    } catch {
      toast.error("Failed to issue manual license.");
    }
  };

  const handleRevokeLicense = async (domain: string) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to revoke the active license for ${domain}?`)) return;
    try {
      await deleteDoc(doc(db, "licenses", domain));
      setActiveLicenses((prev) => prev.filter((l) => l.domain !== domain));
      toast.info(`License revoked for ${domain}.`);
    } catch {
      toast.error("Failed to revoke license.");
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesFilter =
        txnFilter === "all"
          ? true
          : txnFilter === "pending"
            ? t.status === "pending_verification"
            : t.status === txnFilter;
      const matchesSearch =
        t.domain.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.referenceId.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.orgName?.toLowerCase().includes(txnSearch.toLowerCase()) ||
        t.email?.toLowerCase().includes(txnSearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, txnFilter, txnSearch]);

  // Loading screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SECURE AUTH GUARD (ONLY AUTHORIZED MASTER ADMINS)
  // -------------------------------------------------------------
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md rounded-3xl border border-primary/40 bg-neutral-950/95 backdrop-blur-xl p-8 shadow-2xl relative z-10 space-y-7">
          <div className="text-center space-y-2.5">
            <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-xl shadow-primary/20">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="font-display text-2xl font-bold text-gold-gradient tracking-tight">
              Sovereign Command Citadel
            </h1>
            <p className="text-xs font-mono text-muted-foreground">
              Firebase Authentication • Cloud Firestore Secured
            </p>
          </div>

          {/* Auth Error Notification */}
          {authError && (
            <div className="p-3.5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono text-center leading-relaxed">
              {authError}
            </div>
          )}

          {/* Direct Google Sign-In with Firebase Auth */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3.5 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 py-4 px-5 text-sm font-semibold text-white transition-all cursor-pointer shadow-xl hover:border-primary/60 hover:shadow-primary/20 disabled:opacity-50 font-sans"
            >
              {isAuthenticating ? (
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
              ) : (
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 22.3z"
                  />
                </svg>
              )}
              <span>
                {isAuthenticating ? "Authenticating with Firebase..." : "Sign In with Google"}
              </span>
            </button>
          </div>

          {/* Master Admin Security Shield Badge */}
          <div className="text-center space-y-1.5 border-t border-white/10 pt-5 font-mono text-[10px]">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-semibold tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>AUTHORIZED CITADEL ADMINISTRATORS ONLY</span>
            </div>
            <p className="text-muted-foreground text-[10px] pt-1">
              🔒 Powered by Firebase Auth • Strict Cloud Firestore Security Rules
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED COMMAND CITADEL
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#07090e] text-foreground font-sans p-4 sm:p-8 space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-3xl border border-primary/30 bg-black/80 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-primary/15 text-primary border border-primary/30 shadow-lg shadow-primary/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-display text-white">
                ASJi Sovereign Command Citadel
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                MASTER CLEARANCE ACTIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Operator: <strong className="text-amber-300">{user.email}</strong> • Project:{" "}
              <code className="text-white/80">perceptive-bulwark-js7sz</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            onClick={() => {
              fetchTransactions();
              fetchLicenses();
              loadLawsFromFirestore();
              loadDailyUpdatesFromFirestore();
              loadPastBatchesFromFirestore();
              toast.success("Ledgers & Firestore refreshed.");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-all cursor-pointer"
            title="Refresh All Firestore Collections"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh All</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-muted-foreground hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* METRICS SUMMARY ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono text-xs">
        <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Bulk Scans Saved</span>
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold text-white">{pastBatches.length}</div>
          <div className="text-[10px] text-muted-foreground">Batches in Firestore</div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Sovereign Laws</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white">{laws.length}</div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            {isVerifiedToday ? "✅ Verified Today" : "⚠️ Verification Pending"}
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Active Licenses</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-white">{activeLicenses.length}</div>
          <div className="text-[10px] text-muted-foreground">Authorized Domains</div>
        </div>

        <div className="p-4 rounded-2xl border border-white/10 bg-black/60 space-y-1">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Pending UTRs</span>
            <Receipt className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl font-bold text-white">
            {transactions.filter((t) => t.status === "pending_verification").length}
          </div>
          <div className="text-[10px] text-muted-foreground">Payments to Review</div>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-mono overflow-x-auto">
        <button
          onClick={() => setAdminTab("scanner")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === "scanner"
              ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
              : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          Bulk Command Lead Scanner ({bulkResults.length})
        </button>

        <button
          onClick={() => setAdminTab("laws")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === "laws"
              ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
              : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Scale className="w-4 h-4" />
          Sovereign Laws Database ({laws.length})
          {isVerifiedToday && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
        </button>

        <button
          onClick={() => setAdminTab("licensing")}
          className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            adminTab === "licensing"
              ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
              : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Enterprise UTR Payments &amp; Licenses ({transactions.length})
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: BULK COMMAND LEAD SCANNER                          */}
      {/* ========================================================= */}
      {adminTab === "scanner" && (
        <div className="space-y-6 font-mono text-xs">
          {/* Scanner Control Deck */}
          <div className="p-6 rounded-3xl border border-primary/30 bg-black/60 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-primary" />
                  Bulk Lead Reconnaissance Engine
                </h3>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Batch audit multi-domain compliance portfolios against DPDP, GDPR, UK DUAA, and
                  global data statutes.
                </p>
              </div>

              {/* Mode Selector */}
              <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setBulkScanMode("fast-lite")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-semibold ${
                    bulkScanMode === "fast-lite"
                      ? "bg-primary text-black"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  ⚡ Fast-Lite (1-2s)
                </button>
                <button
                  type="button"
                  onClick={() => setBulkScanMode("deep-grounded")}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[11px] font-semibold ${
                    bulkScanMode === "deep-grounded"
                      ? "bg-primary text-black"
                      : "text-muted-foreground hover:text-white"
                  }`}
                >
                  🛡️ Deep-Grounded Audit
                </button>
              </div>
            </div>

            {/* Presets Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-muted-foreground">Presets:</span>
              {BULK_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => setBulkInput(preset.domains)}
                  className="px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-[10px] transition-all cursor-pointer"
                >
                  {preset.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setBulkInput("")}
                className="px-2.5 py-1 rounded-lg border border-rose-500/20 text-rose-400 hover:bg-rose-500/10 text-[10px] transition-all cursor-pointer ml-auto"
              >
                Clear
              </button>
            </div>

            {/* Textarea for Bulk Domains */}
            <div className="relative">
              <textarea
                rows={5}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="Enter domain URLs (one per line or comma-separated, e.g. domain1.com, domain2.com)..."
                disabled={isBulkScanning}
                className="w-full rounded-2xl border border-border bg-background/80 p-3.5 text-xs text-foreground focus:border-primary focus:outline-none font-mono leading-relaxed resize-y"
              />
              <div className="absolute right-3 bottom-3 text-[10px] text-muted-foreground font-mono">
                {detectedDomains.length} target{detectedDomains.length === 1 ? "" : "s"} detected
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2">
                {!isBulkScanning ? (
                  <button
                    type="button"
                    onClick={handleExecuteBulkScan}
                    disabled={detectedDomains.length === 0}
                    className="btn-gold flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Initiate Bulk Audit ({detectedDomains.length})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAbortScan}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer shadow-lg shadow-rose-900/30"
                  >
                    <StopCircle className="w-4 h-4" />
                    <span>Abort Scanning</span>
                  </button>
                )}

                {bulkResults.length > 0 && !isBulkScanning && (
                  <button
                    type="button"
                    onClick={() => setBulkResults([])}
                    className="px-3 py-2 rounded-xl border border-white/10 text-muted-foreground hover:text-white transition-all cursor-pointer text-xs"
                  >
                    Clear Results
                  </button>
                )}
              </div>

              {/* Export Buttons */}
              {bulkResults.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportCsv(bulkResults, "Live_Run")}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer text-xs font-semibold"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleExportJson(
                        { scannedAt: new Date().toISOString(), results: bulkResults },
                        `ASJi_Bulk_Audit_${Date.now()}`,
                      )
                    }
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer text-xs"
                  >
                    <FileJson className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              )}
            </div>

            {/* Live Progress Bar */}
            {isBulkScanning && (
              <div className="space-y-2 p-3.5 rounded-2xl border border-primary/40 bg-primary/10">
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    Auditing target {bulkProgress.current} of {bulkProgress.total}:{" "}
                    <code className="text-white underline">{bulkProgress.currentDomain}</code>
                  </span>
                  <span>
                    {Math.round((bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-primary transition-all duration-300"
                    style={{
                      width: `${(bulkProgress.current / Math.max(bulkProgress.total, 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Scanned Results Deck */}
          {bulkResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">Live Reconnaissance Ledger</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-white font-bold">
                    {bulkResults.length} domains
                  </span>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setBulkFilter("all")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10px] font-semibold ${
                      bulkFilter === "all" ? "bg-primary text-black" : "text-muted-foreground"
                    }`}
                  >
                    All ({bulkResults.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkFilter("critical")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10px] font-semibold ${
                      bulkFilter === "critical"
                        ? "bg-rose-600 text-white"
                        : "text-rose-400 hover:text-white"
                    }`}
                  >
                    Critical (
                    {bulkResults.filter((r) => r.verdict === "CRITICAL NON-COMPLIANT").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkFilter("moderate")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10px] font-semibold ${
                      bulkFilter === "moderate"
                        ? "bg-amber-500 text-black"
                        : "text-amber-400 hover:text-white"
                    }`}
                  >
                    Moderate ({bulkResults.filter((r) => r.verdict === "MODERATE RISK").length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkFilter("compliant")}
                    className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10px] font-semibold ${
                      bulkFilter === "compliant"
                        ? "bg-emerald-500 text-black"
                        : "text-emerald-400 hover:text-white"
                    }`}
                  >
                    Compliant ({bulkResults.filter((r) => r.verdict === "COMPLIANT").length})
                  </button>
                </div>
              </div>

              {/* Domains Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredBulkResults.map((item, idx) => {
                  const isCritical = item.verdict === "CRITICAL NON-COMPLIANT";
                  const isCompliant = item.verdict === "COMPLIANT";
                  const isModerate = item.verdict === "MODERATE RISK";

                  return (
                    <div
                      key={`${item.domain}-${idx}`}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isCritical
                          ? "border-rose-500/30 bg-rose-500/[0.04]"
                          : isCompliant
                            ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                            : isModerate
                              ? "border-amber-500/30 bg-amber-500/[0.04]"
                              : "border-white/10 bg-black/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{item.domain}</span>
                            <a
                              href={`https://${item.domain}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-muted-foreground hover:text-white transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3 text-primary" />
                            Server: {item.serverLocation}
                          </span>
                        </div>

                        {/* Score & Verdict Pill */}
                        <div className="text-right">
                          <div
                            className={`text-lg font-black font-display ${
                              item.score >= 80
                                ? "text-emerald-400"
                                : item.score >= 50
                                  ? "text-amber-400"
                                  : "text-rose-400"
                            }`}
                          >
                            {item.score}/100
                          </div>
                          <span
                            className={`text-[9px] font-bold px-2 py-0.5 rounded-full inline-block ${
                              isCompliant
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : isCritical
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {item.verdict}
                          </span>
                        </div>
                      </div>

                      {/* Summary findings */}
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {item.summary}
                      </p>

                      <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                        <div className="flex items-center gap-3">
                          <span className="text-rose-400 font-semibold">
                            ⚠️ {item.criticalLeaksCount} Leaks
                          </span>
                          <span className="text-amber-300 font-mono">💰 {item.fineExposure}</span>
                        </div>

                        {item.reportData && (
                          <button
                            type="button"
                            onClick={() => setSelectedAuditDetail(item.reportData as AuditReport)}
                            className="flex items-center gap-1 text-primary hover:underline cursor-pointer font-bold"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Inspect Audit</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* HISTORICAL BULK SCANS IN FIRESTORE */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-primary" />
                  Historical Bulk Audits in Cloud Firestore ({pastBatches.length})
                </h4>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Saved bulk recon batches persisted in the <code>bulk_scans</code> Firestore
                  collection.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPastBatchesFromFirestore}
                disabled={loadingBatches}
                className="px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-muted-foreground hover:text-white transition-all cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingBatches ? "animate-spin" : ""}`} />
                <span>Sync Batches</span>
              </button>
            </div>

            {pastBatches.length === 0 ? (
              <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 text-muted-foreground">
                No past bulk scan batches saved in Firestore yet. Execute a bulk scan above to
                persist.
              </div>
            ) : (
              <div className="space-y-3">
                {pastBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="p-4 rounded-2xl border border-white/10 bg-black/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-bold text-white text-sm">{batch.title}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/30">
                          {batch.totalDomains} Targets
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400">
                          Avg: {batch.avgScore}/100
                        </span>
                        {batch.highRiskCount > 0 && (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-400">
                            {batch.highRiskCount} High Risk
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground flex items-center gap-3">
                        <span>Operator: {batch.scannedBy}</span>
                        <span>•</span>
                        <span>{new Date(batch.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setBulkResults(batch.items);
                          toast.success(
                            `Loaded ${batch.items.length} domains from batch into active view.`,
                          );
                        }}
                        className="px-3 py-1.5 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer text-xs font-semibold"
                      >
                        Load into View
                      </button>

                      <button
                        type="button"
                        onClick={() => handleExportCsv(batch.items, batch.title)}
                        className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer text-xs"
                        title="Download Batch CSV"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeletePastBatch(batch.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer text-xs"
                        title="Delete from Firestore"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SOVEREIGN LAWS DATABASE & DAILY UPDATES            */}
      {/* ========================================================= */}
      {adminTab === "laws" && (
        <div className="space-y-6 font-mono text-xs">
          {/* Daily Statutory Verification Banner */}
          <div className="p-6 rounded-3xl border border-primary/30 bg-black/60 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-primary" />
                    Statutory Laws &amp; Daily Verification Matrix
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      isVerifiedToday
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                        : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                    }`}
                  >
                    {isVerifiedToday ? "🟢 VERIFIED TODAY" : "⚠️ DAILY CHECK PENDING"}
                  </span>
                </div>
                <p className="text-muted-foreground text-[11px] leading-relaxed">
                  Cloud Firestore statutory database maintains verified global privacy statutes
                  (DPDP Act 2023 &amp; Rules 2025, GDPR, UK DUAA, UAE Law 45, etc.). Update
                  penalties, articles, or enforcement statuses dynamically.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowDailyCheckModal(true)}
                  className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black cursor-pointer shadow-lg shadow-primary/20"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Laws for Today</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncWorldLaws}
                  disabled={syncingLaws}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all cursor-pointer text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncingLaws ? "animate-spin" : ""}`} />
                  <span>Sync 15 Laws to Firestore</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingLaw(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add New Law</span>
                </button>
              </div>
            </div>

            {/* Latest Verification Status Pill */}
            {dailyUpdates.length > 0 && (
              <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/10 flex items-center justify-between text-[11px] flex-wrap gap-2">
                <span className="text-muted-foreground">
                  Latest Verification:{" "}
                  <strong className="text-amber-300">
                    {new Date(dailyUpdates[0].verifiedAt).toLocaleDateString()}
                  </strong>{" "}
                  by <strong className="text-white">{dailyUpdates[0].verifiedBy}</strong>
                </span>
                <span className="text-primary font-mono italic">"{dailyUpdates[0].notes}"</span>
              </div>
            )}
          </div>

          {/* Laws Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl border border-white/10 bg-black/40">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={lawSearch}
                onChange={(e) => setLawSearch(e.target.value)}
                placeholder="Search country, acronym, or statute..."
                className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {["all", "Asia-Pacific", "Europe & UK", "Americas", "Middle East", "Africa"].map(
                (region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setLawRegionFilter(region)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      lawRegionFilter === region
                        ? "bg-primary text-black font-bold"
                        : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
                    }`}
                  >
                    {region === "all" ? "All Regions" : region}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Laws Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLaws.map((law) => (
              <div
                key={law.id}
                className="p-5 rounded-3xl border border-white/10 bg-black/50 space-y-3 flex flex-col justify-between hover:border-primary/40 transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl">{law.flag}</span>
                      <div>
                        <h4 className="font-bold text-white text-sm">{law.country}</h4>
                        <span className="text-[10px] text-amber-300 font-bold">
                          {law.acronym} ({law.enactedYear})
                        </span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        law.status === "DPDP Rules, 2025"
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {law.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                    {law.lawName}
                  </p>

                  <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1 text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Max Penalty:</span>
                      <strong className="text-primary">{law.maxPenalty}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Breach Notice:</span>
                      <strong className="text-white">{law.breachNotificationHours}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">DPO Mandatory:</span>
                      <strong className="text-white">{law.dpoMandatory ? "Yes" : "No"}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                  <a
                    href={law.officialPortal}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-white flex items-center gap-1 transition-colors text-[10px]"
                  >
                    <span>Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setEditingLaw(law)}
                      className="px-2.5 py-1 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteLaw(law.id)}
                      className="p-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                      title="Delete Law"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Updates Verification Ledger */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Daily Statutory Audit Log ({dailyUpdates.length})
            </h4>

            {dailyUpdates.length === 0 ? (
              <p className="text-muted-foreground text-[11px]">No daily updates recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {dailyUpdates.slice(0, 10).map((up) => (
                  <div
                    key={up.id}
                    className="p-3 rounded-xl border border-white/5 bg-black/50 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-400">✅ {up.status}</span>
                        <span className="text-white">({up.statutesCount} statutes validated)</span>
                      </div>
                      <p className="text-muted-foreground text-[10px]">{up.notes}</p>
                    </div>

                    <div className="text-right text-[10px] text-muted-foreground shrink-0">
                      <div>{new Date(up.verifiedAt).toLocaleString()}</div>
                      <div>Verified by: {up.verifiedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: ENTERPRISE UTR PAYMENTS & LICENSES                 */}
      {/* ========================================================= */}
      {adminTab === "licensing" && (
        <div className="space-y-6 font-mono text-xs">
          {/* Controls Bar */}
          <div className="p-6 rounded-3xl border border-primary/30 bg-black/60 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Enterprise UPI / UTR Verification Ledger
                </h3>
                <p className="text-muted-foreground text-[11px] mt-0.5">
                  Verify 12-digit Indian UPI / Bank reference numbers, activate enterprise licenses,
                  or grant offline licenses directly in Cloud Firestore.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsIssuingManual(true)}
                  className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black cursor-pointer shadow-lg shadow-primary/20"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Issue Manual License</span>
                </button>
              </div>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  placeholder="Search domain, UTR reference, or email..."
                  className="w-full rounded-xl border border-border bg-background pl-10 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-xl border border-white/10 overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setTxnFilter("all")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    txnFilter === "all" ? "bg-primary text-black" : "text-muted-foreground"
                  }`}
                >
                  All ({transactions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTxnFilter("pending")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    txnFilter === "pending" ? "bg-amber-500 text-black" : "text-amber-400"
                  }`}
                >
                  Pending ({transactions.filter((t) => t.status === "pending_verification").length})
                </button>
                <button
                  type="button"
                  onClick={() => setTxnFilter("approved")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    txnFilter === "approved" ? "bg-emerald-500 text-black" : "text-emerald-400"
                  }`}
                >
                  Approved ({transactions.filter((t) => t.status === "approved").length})
                </button>
                <button
                  type="button"
                  onClick={() => setTxnFilter("rejected")}
                  className={`px-3 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                    txnFilter === "rejected" ? "bg-rose-600 text-white" : "text-rose-400"
                  }`}
                >
                  Rejected ({transactions.filter((t) => t.status === "rejected").length})
                </button>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {loadingTxns ? (
            <div className="p-12 text-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-xs">Querying Firestore transactions ledger...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
              <p className="text-muted-foreground">No payment verification requests found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-5 rounded-2xl border border-white/10 bg-black/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base text-white">{txn.domain}</span>
                      <span className="px-2.5 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/30">
                        {txn.tierName || txn.tier}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold ${
                          txn.status === "approved"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : txn.status === "rejected"
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {txn.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="text-[11px] text-muted-foreground flex flex-wrap gap-4">
                      <span>
                        UTR Ref:{" "}
                        <strong className="text-primary font-mono">{txn.referenceId}</strong>
                      </span>
                      <span>
                        Amount: <strong className="text-emerald-400">{txn.priceInr}</strong>
                      </span>
                      <span>
                        Organization: {txn.orgName} ({txn.email})
                      </span>
                      {txn.submittedAt && (
                        <span>Submitted: {new Date(txn.submittedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {txn.status === "pending_verification" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApproveTransaction(txn)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                      >
                        Approve License
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectTransaction(txn)}
                        className="px-4 py-2 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ACTIVE LICENSES IN FIRESTORE */}
          <div className="p-6 rounded-3xl border border-white/10 bg-black/40 space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Active Domain Licenses in Cloud Firestore ({activeLicenses.length})
            </h4>

            {activeLicenses.length === 0 ? (
              <p className="text-muted-foreground text-[11px]">
                No active licenses recorded in Firestore.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeLicenses.map((lic) => (
                  <div
                    key={lic.domain}
                    className="p-4 rounded-2xl border border-white/10 bg-black/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{lic.domain}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/20 text-emerald-400 font-bold">
                          ACTIVE
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        Tier: {lic.tierName || lic.tier} • {lic.priceInr || "Executive Grant"}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeLicense(lic.domain)}
                      className="px-2.5 py-1 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-[10px] transition-all cursor-pointer"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT LAW DIALOG                                    */}
      {/* ========================================================= */}
      {editingLaw && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-primary/40 bg-neutral-950 p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{editingLaw.flag}</span>
                <h3 className="font-bold text-base text-white">
                  Edit {editingLaw.country} Statute
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLaw(null)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLawEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Law Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingLaw.lawName}
                  onChange={(e) => setEditingLaw({ ...editingLaw, lawName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Acronym</label>
                  <input
                    type="text"
                    required
                    value={editingLaw.acronym}
                    onChange={(e) => setEditingLaw({ ...editingLaw, acronym: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Status</label>
                  <input
                    type="text"
                    required
                    value={editingLaw.status}
                    onChange={(e) =>
                      setEditingLaw({
                        ...editingLaw,
                        status: e.target.value as WorldLaw["status"],
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    Maximum Statutory Penalty
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLaw.maxPenalty}
                    onChange={(e) => setEditingLaw({ ...editingLaw, maxPenalty: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    Breach Notification Hours
                  </label>
                  <input
                    type="text"
                    required
                    value={String(editingLaw.breachNotificationHours)}
                    onChange={(e) =>
                      setEditingLaw({
                        ...editingLaw,
                        breachNotificationHours: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Governing Body / Authority
                </label>
                <input
                  type="text"
                  required
                  value={editingLaw.governingBody}
                  onChange={(e) => setEditingLaw({ ...editingLaw, governingBody: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Statutory Summary
                </label>
                <textarea
                  rows={4}
                  value={editingLaw.statutorySummary}
                  onChange={(e) =>
                    setEditingLaw({ ...editingLaw, statutorySummary: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingLaw(null)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2 rounded-xl font-bold text-black cursor-pointer shadow-lg shadow-primary/20"
                >
                  Save to Cloud Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ADD NEW LAW                                        */}
      {/* ========================================================= */}
      {isAddingLaw && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-primary/40 bg-neutral-950 p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white">Add New Sovereign Law Jurisdiction</h3>
              <button
                type="button"
                onClick={() => setIsAddingLaw(false)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLaw} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Country</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Australia"
                    value={newLaw.country || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, country: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Flag Emoji</label>
                  <input
                    type="text"
                    required
                    placeholder="🇦🇺"
                    value={newLaw.flag || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, flag: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Region</label>
                  <select
                    value={newLaw.region || "Asia-Pacific"}
                    onChange={(e) =>
                      setNewLaw({ ...newLaw, region: e.target.value as WorldLaw["region"] })
                    }
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="Asia-Pacific">Asia-Pacific</option>
                    <option value="Europe & UK">Europe & UK</option>
                    <option value="Americas">Americas</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Law Full Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Privacy Act 1988 (Cth) & 2026 Reforms"
                  value={newLaw.lawName || ""}
                  onChange={(e) => setNewLaw({ ...newLaw, lawName: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">Acronym</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Privacy Act"
                    value={newLaw.acronym || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, acronym: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground mb-1">
                    Max Penalty
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AUD $50,000,000"
                    value={newLaw.maxPenalty || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, maxPenalty: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Governing Authority &amp; Portal
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Office of the Australian Information Commissioner (OAIC)"
                  value={newLaw.governingBody || ""}
                  onChange={(e) => setNewLaw({ ...newLaw, governingBody: e.target.value })}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddingLaw(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2 rounded-xl font-bold text-black cursor-pointer shadow-lg shadow-primary/20"
                >
                  Create in Cloud Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DAILY STATUTORY CHECK CONFIRMATION                 */}
      {/* ========================================================= */}
      {showDailyCheckModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-primary/40 bg-neutral-950 p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                Record Daily Statutory Verification
              </h3>
              <button
                type="button"
                onClick={() => setShowDailyCheckModal(false)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground text-[11px]">
              This will record an immutable daily verification entry in Cloud Firestore confirming
              that all {laws.length} global jurisdictions have been verified against active
              statutory gazettes as of today ({new Date().toLocaleDateString()}).
            </p>

            <div>
              <label className="block text-[11px] text-muted-foreground mb-1">
                Verification Notes / Gazette Updates (Optional)
              </label>
              <textarea
                rows={3}
                value={dailyNotes}
                onChange={(e) => setDailyNotes(e.target.value)}
                placeholder="e.g. Confirmed DPDP Rules 2025 enforcement status, verified EU GDPR adequacy and penalty schedules."
                className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDailyCheckModal(false)}
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRecordingDailyCheck}
                onClick={handleDailyVerification}
                className="btn-gold px-5 py-2 rounded-xl font-bold text-black cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                {isRecordingDailyCheck ? "Recording..." : "Confirm & Save Check"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ISSUE MANUAL LICENSE                               */}
      {/* ========================================================= */}
      {isIssuingManual && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-3xl border border-primary/40 bg-neutral-950 p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Issue Manual Executive License
              </h3>
              <button
                type="button"
                onClick={() => setIsIssuingManual(false)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueManualLicense} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. clientcorp.com"
                  value={manualDomain}
                  onChange={(e) => setManualDomain(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">License Tier</label>
                <select
                  value={manualTier}
                  onChange={(e) => setManualTier(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="enterprise">Sovereign Enterprise ($1,499)</option>
                  <option value="citadel">Citadel Shield ($499)</option>
                  <option value="pass">Single Domain Pass ($149)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">Price (INR)</label>
                <input
                  type="text"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground mb-1">
                  Organization / Client Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Offline Contract"
                  value={manualOrg}
                  onChange={(e) => setManualOrg(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsIssuingManual(false)}
                  className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 rounded-xl font-bold text-black cursor-pointer shadow-lg shadow-primary/20"
                >
                  Activate License in Firestore
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DETAILED AUDIT INSPECTION                          */}
      {/* ========================================================= */}
      {selectedAuditDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-primary/40 bg-neutral-950 p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-base text-white">
                  Audit Findings: {selectedAuditDetail.target}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAuditDetail(null)}
                className="text-muted-foreground hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score & Verdict Row */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/60 border border-white/10">
              <div>
                <span className="text-[11px] text-muted-foreground">Compliance Rating</span>
                <div
                  className={`text-2xl font-bold font-display ${
                    selectedAuditDetail.score >= 80
                      ? "text-emerald-400"
                      : selectedAuditDetail.score >= 50
                        ? "text-amber-400"
                        : "text-rose-400"
                  }`}
                >
                  {selectedAuditDetail.score}/100
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-muted-foreground">Server Jurisdiction</span>
                <div className="text-sm font-bold text-white">
                  {selectedAuditDetail.serverLocation?.countryName || "Sovereign Cloud"}
                </div>
              </div>
            </div>

            {/* Critical Leaks */}
            {selectedAuditDetail.criticalLeaks && selectedAuditDetail.criticalLeaks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-rose-400 text-xs">
                  Critical Statutory Violations Detected ({selectedAuditDetail.criticalLeaks.length}
                  )
                </h4>
                <div className="space-y-2">
                  {selectedAuditDetail.criticalLeaks.map((leak, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-rose-300">
                        <span>{leak.title}</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-rose-500/20">
                          {leak.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-rose-200/80">{leak.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Frameworks */}
            {selectedAuditDetail.frameworks && selectedAuditDetail.frameworks.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-white text-xs">Statutory Frameworks Evaluation</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedAuditDetail.frameworks.map((fw, idx) => (
                    <div key={idx} className="p-3 rounded-xl border border-white/10 bg-black/40">
                      <div className="flex justify-between font-bold text-white">
                        <span>{fw.name}</span>
                        <span className="text-primary">{fw.score}%</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{fw.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Remediation */}
            {selectedAuditDetail.remediation && selectedAuditDetail.remediation.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-amber-300 text-xs">Remediation Action Items</h4>
                <div className="space-y-1.5">
                  {selectedAuditDetail.remediation.map((rem, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl border border-amber-500/20 bg-amber-500/5 text-[11px] flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold">{idx + 1}.</span>
                      <div>
                        <div className="text-white font-semibold">{rem.step}</div>
                        <div className="text-[10px] text-muted-foreground">
                          Impact: {rem.impact} • Effort: {rem.effort}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() =>
                  handleExportJson(selectedAuditDetail, `Audit_${selectedAuditDetail.target}`)
                }
                className="px-4 py-2 rounded-xl border border-white/10 hover:bg-white/5 text-white flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAuditDetail(null)}
                className="btn-gold px-5 py-2 rounded-xl font-bold text-black"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
