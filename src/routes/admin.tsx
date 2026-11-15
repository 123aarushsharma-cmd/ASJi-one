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
  Eye,
  Lock,
  Zap,
  KeyRound,
  FileSpreadsheet,
  FileJson,
  StopCircle,
  Scale,
  Mail,
  Copy,
  ChevronDown,
  ChevronUp,
  Cookie,
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { auditCompliance } from "@/lib/audit.functions";
import type { AuditReport } from "@/lib/audit-types";
import {
  seedWorldLawsToFirestore,
  fetchWorldLaws,
  publishStatutoryRuleUpdate,
  createWorldLaw,
  deleteWorldLaw,
  recordDailyStatutoryCheck,
  fetchDailyStatutoryUpdates,
  saveBulkScanBatch,
  fetchBulkScanBatches,
  deleteBulkScanBatch,
  verifyAndUnlockDomain,
  rejectPaymentUnlock,
  revokeDomainUnlock,
  resolveGrievanceTicket,
  saveAuditScan,
  normalizeDomainName,
  type AuditScanRecord,
  type BulkScanBatch,
  type BulkScanItem,
  type ConsentRecordDoc,
  type DailyStatutoryUpdate,
  type GrievanceTicketRecord,
  type PaymentUnlockRecord,
  type StatutoryRuleDoc,
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

const RECOMMENDED_FIRESTORE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isVerifiedEmail() { return isSignedIn() && request.auth.token.email_verified == true; }
    function isValidId(docId) { return docId is string && docId.size() >= 1 && docId.size() <= 128 && !docId.matches('.*[/\\\\].*'); }
    function isAdmin() {
      return (isVerifiedEmail() && request.auth.token.email.lower() in [
        '123.aarushsharma@gmail.com', 'hello@asjione.com', 'asji.online@gmail.com'
      ]) || (isVerifiedEmail() && exists(/databases/$(database)/documents/admins/$(request.auth.uid)));
    }
    function is12DigitUTR(utr) { return utr is string && utr.matches('^[0-9]{12}$'); }

    // 1. Live Telemetry Audit Scans (Public Certificate Get by ID, Admin List)
    match /audit_scans/{scanId} {
      allow get: if isValidId(scanId);
      allow list, update, delete: if isAdmin();
      allow create: if isValidId(scanId)
        && scanId.matches('^ASJI-2026-[A-Z0-9]{4,12}$')
        && request.resource.data.keys().hasAll(['audit_ref_id', 'domain', 'compliance_score', 'findings', 'created_at'])
        && request.resource.data.audit_ref_id == scanId
        && request.resource.data.compliance_score is number
        && request.resource.data.compliance_score >= 0
        && request.resource.data.compliance_score <= 100;
    }

    // 2. Persistent Domain Unlocks (Zero-PII Public Verified Get, Validated Pending Create, Admin Full Control)
    match /payment_unlocks/{unlockId} {
      allow get: if isAdmin() || (isValidId(unlockId) && (resource == null || (resource.data.status == 'verified' && resource.data.domain == unlockId)));
      allow list, update, delete: if isAdmin();
      allow create: if (isValidId(unlockId) && unlockId.matches('^req_[0-9]+_[a-z0-9]+$')
        && request.resource.data.status == 'pending'
        && is12DigitUTR(request.resource.data.referenceId)) || isAdmin();
    }

    // 3. Live 15-Nation Statutory Rules (Public Read, Admin Write)
    match /statutory_rules/{ruleId} {
      allow read: if true;
      allow write: if isAdmin() && isValidId(ruleId);
    }

    // 4. DPDP Grievance Tickets (Validated Open Create, Admin Read/Resolve)
    match /grievance_tickets/{ticketId} {
      allow create: if isValidId(ticketId) && ticketId.matches('^ASJI-GRV-2026-[0-9]{4}$')
        && request.resource.data.status == 'OPEN';
      allow read, update, delete: if isAdmin();
    }

    // 5. Consent Ledger (Validated Append-Only Create, Admin Read)
    match /consent_records/{recordId} {
      allow create: if isValidId(recordId)
        && request.resource.data.choice in ['Accepted', 'Rejected', 'Managed', 'ScanAuthorized'];
      allow read, delete: if isAdmin();
      allow update: if false;
    }
  }
}`;

const BULK_PRESETS = [
  {
    name: "[IN] India DPDP Targets",
    domains: "flipkart.com\nzomato.com\nswiggy.com\nrazorpay.com\ncred.club",
  },
  {
    name: "[GL] Global SaaS & Cloud",
    domains: "shopify.com\nstripe.com\nvercel.com\nnotion.so\nslack.com",
  },
  {
    name: "[EC] E-Commerce & Retail",
    domains: "amazon.in\nmeesho.com\nnykaa.com\najio.com\ntatamarkets.com",
  },
  {
    name: "[FT] FinTech & Banking",
    domains: "phonepe.com\npaytm.com\ngroww.in\nzerodha.com\ncred.club",
  },
];

function AdminPage() {
  const {
    user,
    fbUser,
    loading: authLoading,
    isAdmin,
    adminSignInWithGoogle,
    logout,
    logAdminActivity,
    authError,
    clearAuthError,
  } = useAuth();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [adminTab, setAdminTab] = useState<"payments" | "laws" | "grievances" | "ledger">(
    "payments",
  );

  // Server audit function
  const runAudit = useServerFn(auditCompliance);

  // -------------------------------------------------------------
  // TAB 1: PAYMENT & DOMAIN UNLOCK APPROVALS STATE
  // -------------------------------------------------------------
  const [paymentUnlocks, setPaymentUnlocks] = useState<PaymentUnlockRecord[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [activeLicenses, setActiveLicenses] = useState<ActiveLicense[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [txnFilter, setTxnFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");
  const [txnSearch, setTxnSearch] = useState("");
  const [isIssuingManual, setIsIssuingManual] = useState(false);
  const [manualDomain, setManualDomain] = useState("");
  const [manualTier, setManualTier] = useState<PaymentUnlockRecord["tier"]>("full-bundle");
  const [manualPrice, setManualPrice] = useState("₹59,999");
  const [manualOrg, setManualOrg] = useState("");

  // -------------------------------------------------------------
  // TAB 2: LIVE 15-NATION STATUTE & LAW EDITOR STATE
  // -------------------------------------------------------------
  const [laws, setLaws] = useState<StatutoryRuleDoc[]>(WORLD_LAWS_DATA);
  const [loadingLaws, setLoadingLaws] = useState(false);
  const [lawSearch, setLawSearch] = useState("");
  const [lawRegionFilter, setLawRegionFilter] = useState<string>("all");
  const [syncingLaws, setSyncingLaws] = useState(false);
  const [editingLaw, setEditingLaw] = useState<StatutoryRuleDoc | null>(null);
  const [publishingLaw, setPublishingLaw] = useState(false);
  const [isAddingLaw, setIsAddingLaw] = useState(false);
  const [newLaw, setNewLaw] = useState<Partial<StatutoryRuleDoc>>({
    region: "Asia-Pacific",
    status: "In Force",
    extraterritorialScope: true,
    dpoMandatory: true,
    maxPenalty: "Refer to the Act",
    breachNotificationHours: "72 hours or immediate",
    childrenAgeThreshold: 18,
  });
  const [dailyUpdates, setDailyUpdates] = useState<DailyStatutoryUpdate[]>([]);
  const [showDailyCheckModal, setShowDailyCheckModal] = useState(false);
  const [dailyNotes, setDailyNotes] = useState("");
  const [isRecordingDailyCheck, setIsRecordingDailyCheck] = useState(false);

  // -------------------------------------------------------------
  // TAB 3: DPDP GRIEVANCE & RIGHTS DESK STATE
  // -------------------------------------------------------------
  const [grievances, setGrievances] = useState<GrievanceTicketRecord[]>([]);
  const [grievanceFilter, setGrievanceFilter] = useState<"ALL" | "OPEN" | "RESOLVED">("ALL");
  const [grievanceSearch, setGrievanceSearch] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState<Record<string, string>>({});
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);

  // -------------------------------------------------------------
  // TAB 4: LIVE AUDIT & CONSENT LEDGER + BULK RECONNAISSANCE STATE
  // -------------------------------------------------------------
  const [auditScans, setAuditScans] = useState<AuditScanRecord[]>([]);
  const [consentRecords, setConsentRecords] = useState<ConsentRecordDoc[]>([]);
  const [selectedScanRecord, setSelectedScanRecord] = useState<AuditScanRecord | null>(null);
  const [showSecurityRulesBox, setShowSecurityRulesBox] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);
  const [showBulkScanner, setShowBulkScanner] = useState(false);

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
  // DATA FETCHING & REAL-TIME LISTENERS (onSnapshot)
  // -------------------------------------------------------------
  const fetchTransactionsAndLicenses = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingTxns(true);
    try {
      const [txnSnap, licSnap] = await Promise.all([
        getDocs(query(collection(db, "transactions"))),
        getDocs(collection(db, "licenses")),
      ]);
      const tList: AdminTransaction[] = [];
      txnSnap.forEach((d) => {
        tList.push({ id: d.id, ...(d.data() as Omit<AdminTransaction, "id">) });
      });
      tList.sort((a, b) => (b.submittedAt || "").localeCompare(a.submittedAt || ""));
      setTransactions(tList);

      const lList: ActiveLicense[] = [];
      licSnap.forEach((d) => {
        lList.push(d.data() as ActiveLicense);
      });
      setActiveLicenses(lList);
    } catch {
      // safe fallback
    } finally {
      setLoadingTxns(false);
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
    try {
      const data = await fetchDailyStatutoryUpdates();
      setDailyUpdates(data);
    } catch {
      // ignore
    }
  }, [isAdmin]);

  const loadPastBatchesFromFirestore = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingBatches(true);
    try {
      const data = await fetchBulkScanBatches();
      setPastBatches(data);
    } catch {
      // ignore
    } finally {
      setLoadingBatches(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;

    fetchTransactionsAndLicenses();
    loadLawsFromFirestore();
    loadDailyUpdatesFromFirestore();
    loadPastBatchesFromFirestore();

    const unsubUnlocks = onSnapshot(
      collection(db, "payment_unlocks"),
      (snap) => {
        const list: PaymentUnlockRecord[] = [];
        snap.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as Omit<PaymentUnlockRecord, "id">) });
        });
        list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
        setPaymentUnlocks(list);
      },
      () => {},
    );

    const unsubGrievances = onSnapshot(
      collection(db, "grievance_tickets"),
      (snap) => {
        const list: GrievanceTicketRecord[] = [];
        snap.forEach((d) => {
          list.push(d.data() as GrievanceTicketRecord);
        });
        list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
        setGrievances(list);
      },
      () => {},
    );

    const unsubAudits = onSnapshot(
      query(collection(db, "audit_scans"), orderBy("created_at", "desc"), limit(50)),
      (snap) => {
        const list: AuditScanRecord[] = [];
        snap.forEach((d) => {
          list.push(d.data() as AuditScanRecord);
        });
        setAuditScans(list);
      },
      () => {},
    );

    const unsubConsents = onSnapshot(
      query(collection(db, "consent_records"), orderBy("createdAt", "desc"), limit(50)),
      (snap) => {
        const list: ConsentRecordDoc[] = [];
        snap.forEach((d) => {
          list.push(d.data() as ConsentRecordDoc);
        });
        setConsentRecords(list);
      },
      () => {},
    );

    return () => {
      unsubUnlocks();
      unsubGrievances();
      unsubAudits();
      unsubConsents();
    };
  }, [
    isAdmin,
    fetchTransactionsAndLicenses,
    loadLawsFromFirestore,
    loadDailyUpdatesFromFirestore,
    loadPastBatchesFromFirestore,
  ]);

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
  // TAB 1: PAYMENT UNLOCK & LICENSE HANDLERS
  // -------------------------------------------------------------
  const paymentRequestsOnly = useMemo(
    () => paymentUnlocks.filter((u) => u.id.startsWith("req_") || !u.id.includes(".")),
    [paymentUnlocks],
  );

  const verifiedUnlockedDomains = useMemo(() => {
    const map = new Map<
      string,
      {
        domain: string;
        tier: string;
        tierName?: string;
        priceInr?: string;
        referenceId?: string;
        verifiedAt?: string;
        verifiedBy?: string;
      }
    >();

    for (const lic of activeLicenses) {
      if (lic.active) {
        const norm = normalizeDomainName(lic.domain);
        map.set(norm, {
          domain: norm,
          tier: lic.tier,
          tierName: lic.tierName,
          priceInr: lic.priceInr,
          verifiedBy: lic.issuedBy,
        });
      }
    }

    for (const u of paymentUnlocks) {
      if (u.status === "verified") {
        const norm = normalizeDomainName(u.domain);
        map.set(norm, {
          domain: norm,
          tier: u.tier,
          tierName: u.tierName,
          priceInr: u.priceInr,
          referenceId: u.referenceId,
          verifiedAt: u.verifiedAt,
          verifiedBy: u.verifiedBy,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      (b.verifiedAt || "").localeCompare(a.verifiedAt || ""),
    );
  }, [paymentUnlocks, activeLicenses]);

  const handleVerifyUnlockRequest = async (unlock: PaymentUnlockRecord) => {
    if (!isAdmin) return;
    try {
      await verifyAndUnlockDomain(unlock, user?.email || "Master Admin");
      await logAdminActivity("VERIFY_PAYMENT_UNLOCK", {
        domain: unlock.domain,
        referenceId: unlock.referenceId,
      });
      fetchTransactionsAndLicenses();
      toast.success(`Domain Verified & Unlocked: ${normalizeDomainName(unlock.domain)}`, {
        description:
          "Full Remediation Code Patches & Statutory Legal Suite active across all devices.",
      });
    } catch {
      toast.error("Failed to verify and unlock domain.");
    }
  };

  const handleRejectUnlockRequest = async (unlock: PaymentUnlockRecord) => {
    if (!isAdmin) return;
    try {
      await rejectPaymentUnlock(unlock.id, user?.email || "Master Admin");
      await logAdminActivity("REJECT_PAYMENT_UNLOCK", {
        domain: unlock.domain,
        referenceId: unlock.referenceId,
      });
      toast.info(`Rejected UTR request for ${unlock.domain}.`);
    } catch {
      toast.error("Failed to reject unlock request.");
    }
  };

  const handleApproveLegacyTransaction = async (txn: AdminTransaction) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "transactions", txn.id), {
        status: "approved",
        approvedAt: serverTimestamp(),
      });
      const mappedTier: PaymentUnlockRecord["tier"] =
        txn.tier === "patch-code" ||
        txn.tier === "dpdp-india" ||
        txn.tier === "gdpr-global" ||
        txn.tier === "full-bundle"
          ? txn.tier
          : "full-bundle";

      await verifyAndUnlockDomain(txn.domain, user?.email || "Master Admin", {
        tier: mappedTier,
        tierName: txn.tierName,
        priceInr: txn.priceInr,
        orgName: txn.orgName,
        referenceId: txn.referenceId,
      });
      await logAdminActivity("APPROVE_LICENSE", {
        domain: txn.domain,
        referenceId: txn.referenceId,
      });
      fetchTransactionsAndLicenses();
      toast.success(`Verified & Unlocked ${normalizeDomainName(txn.domain)}!`);
    } catch {
      toast.error("Failed to approve legacy transaction.");
    }
  };

  const handleRejectLegacyTransaction = async (txn: AdminTransaction) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, "transactions", txn.id), {
        status: "rejected",
        rejectedAt: serverTimestamp(),
      });
      fetchTransactionsAndLicenses();
      toast.info("Transaction reference rejected.");
    } catch {
      toast.error("Failed to reject transaction.");
    }
  };

  const handleIssueManualLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDomain || !isAdmin) return;
    const cleanDomain = normalizeDomainName(manualDomain);
    if (!cleanDomain || !cleanDomain.includes(".")) {
      toast.error("Please enter a valid domain name (e.g., clientcorp.com)");
      return;
    }

    const tierLabelMap: Record<PaymentUnlockRecord["tier"], string> = {
      "patch-code": "Autonomous Remediation Code Patches",
      "dpdp-india": "DPDP Act 2023 Statutory Legal Suite",
      "gdpr-global": "GDPR & Multi-Sovereign Legal Pack",
      "full-bundle": "Full-Spectrum Sovereign Enterprise Suite",
    };

    try {
      await verifyAndUnlockDomain(cleanDomain, user?.email || "Master Admin", {
        tier: manualTier,
        tierName: tierLabelMap[manualTier],
        priceInr: manualPrice || "₹59,999",
        orgName: manualOrg || cleanDomain,
        referenceId: `ADMIN_GRANT_${Date.now().toString().slice(-6)}`,
      });
      await logAdminActivity("MANUAL_DOMAIN_UNLOCK", { domain: cleanDomain, tier: manualTier });
      toast.success(`Verified & Unlocked ${cleanDomain} in Firestore!`);
      setIsIssuingManual(false);
      setManualDomain("");
      setManualOrg("");
      fetchTransactionsAndLicenses();
    } catch {
      toast.error("Failed to issue manual domain unlock.");
    }
  };

  const handleRevokeLicense = async (domain: string) => {
    if (!isAdmin) return;
    if (!confirm(`Revoke persistent verified unlock for ${domain}?`)) return;
    try {
      await revokeDomainUnlock(domain);
      await logAdminActivity("REVOKE_DOMAIN_UNLOCK", { domain });
      fetchTransactionsAndLicenses();
      toast.info(`Unlock revoked for ${domain}.`);
    } catch {
      toast.error("Failed to revoke domain unlock.");
    }
  };

  const filteredUnlockRequests = useMemo(() => {
    const q = txnSearch.toLowerCase().trim();
    return paymentRequestsOnly.filter((u) => {
      const matchesFilter = txnFilter === "all" ? true : u.status === txnFilter;
      const matchesSearch =
        !q ||
        u.domain.toLowerCase().includes(q) ||
        u.referenceId.toLowerCase().includes(q) ||
        (u.orgName || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [paymentRequestsOnly, txnFilter, txnSearch]);

  const filteredLegacyTxns = useMemo(() => {
    const q = txnSearch.toLowerCase().trim();
    return transactions.filter((t) => {
      const mappedStatus =
        t.status === "approved"
          ? "verified"
          : t.status === "pending_verification"
            ? "pending"
            : "rejected";
      const matchesFilter = txnFilter === "all" ? true : mappedStatus === txnFilter;
      const matchesSearch =
        !q ||
        t.domain.toLowerCase().includes(q) ||
        t.referenceId.toLowerCase().includes(q) ||
        (t.orgName || "").toLowerCase().includes(q) ||
        (t.email || "").toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [transactions, txnFilter, txnSearch]);

  const pendingPaymentsCount =
    paymentRequestsOnly.filter((u) => u.status === "pending").length +
    transactions.filter((t) => t.status === "pending_verification").length;

  // -------------------------------------------------------------
  // TAB 2: LIVE 15-NATION STATUTE & LAW EDITOR HANDLERS
  // -------------------------------------------------------------
  const handleSyncWorldLaws = async () => {
    if (!isAdmin) return;
    setSyncingLaws(true);
    try {
      const res = await seedWorldLawsToFirestore();
      await logAdminActivity("SYNC_STATUTORY_RULES", { count: res.count });
      await loadLawsFromFirestore();
      toast.success(
        `Synchronized ${res.count} Statutes to Cloud Firestore (statutory_rules & laws)!`,
      );
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
        dailyNotes || "Daily statutory verification confirmed all sovereign jurisdictions active.",
        laws.length || 15,
      );
      setDailyUpdates((prev) => [update, ...prev]);
      setShowDailyCheckModal(false);
      setDailyNotes("");
      toast.success("Daily Statutory Verification Recorded");
    } catch {
      toast.error("Failed to record daily statutory verification.");
    } finally {
      setIsRecordingDailyCheck(false);
    }
  };

  const handleSaveLawEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLaw || !isAdmin) return;
    setPublishingLaw(true);
    try {
      await publishStatutoryRuleUpdate(editingLaw, user?.email || "admin");
      await logAdminActivity("PUBLISH_STATUTORY_RULE", {
        id: editingLaw.id,
        country: editingLaw.country,
      });
      setLaws((prev) => prev.map((l) => (l.id === editingLaw.id ? editingLaw : l)));
      setEditingLaw(null);
      toast.success(`Published Live Law Update for ${editingLaw.country}!`, {
        description: "All future scans and the Sovereign Atlas now reflect this update.",
      });
    } catch {
      toast.error("Failed to publish live law update.");
    } finally {
      setPublishingLaw(false);
    }
  };

  const handleCreateNewLaw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLaw.country || !newLaw.lawName || !isAdmin) return;
    const id = newLaw.id || newLaw.country.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const fullLaw: StatutoryRuleDoc = {
      id,
      country: newLaw.country || "",
      countryCode: newLaw.countryCode || "GL",
      flag: newLaw.flag || newLaw.countryCode || "GL",
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
      breachNotificationHours: newLaw.breachNotificationHours || "72 hours or immediate",
      childrenAgeThreshold: Number(newLaw.childrenAgeThreshold) || 18,
      crossBorderAdequacyRequired: Boolean(newLaw.crossBorderAdequacyRequired),
      corePrinciples: [],
      keyArticles: [],
      statutorySummary: newLaw.statutorySummary || "",
      standardDraftTemplate: newLaw.legalTemplateText || "",
      legalTemplateText: newLaw.legalTemplateText || "",
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
        breachNotificationHours: "72 hours or immediate",
        childrenAgeThreshold: 18,
      });
      toast.success(`Published ${fullLaw.country} to statutory_rules!`);
    } catch {
      toast.error("Failed to create new law.");
    }
  };

  const handleDeleteLaw = async (lawId: string) => {
    if (!confirm("Delete this sovereign law from Firestore (statutory_rules & laws)?")) return;
    try {
      await deleteWorldLaw(lawId);
      setLaws((prev) => prev.filter((l) => l.id !== lawId));
      toast.info("Statutory jurisdiction removed.");
    } catch {
      toast.error("Failed to delete law.");
    }
  };

  const filteredLaws = useMemo(() => {
    const q = lawSearch.toLowerCase();
    return laws.filter((law) => {
      const matchesSearch =
        law.country.toLowerCase().includes(q) ||
        law.lawName.toLowerCase().includes(q) ||
        law.acronym.toLowerCase().includes(q) ||
        law.governingBody.toLowerCase().includes(q);
      const matchesRegion = lawRegionFilter === "all" || law.region === lawRegionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [laws, lawSearch, lawRegionFilter]);

  // -------------------------------------------------------------
  // TAB 3: DPDP GRIEVANCE DESK HANDLERS
  // -------------------------------------------------------------
  const openGrievancesCount = useMemo(
    () => grievances.filter((g) => g.status === "OPEN").length,
    [grievances],
  );

  const filteredGrievances = useMemo(() => {
    const q = grievanceSearch.toLowerCase().trim();
    return grievances.filter((g) => {
      const matchesFilter = grievanceFilter === "ALL" ? true : g.status === grievanceFilter;
      const matchesSearch =
        !q ||
        g.ticketId.toLowerCase().includes(q) ||
        g.fullName.toLowerCase().includes(q) ||
        g.email.toLowerCase().includes(q) ||
        (g.domainRef || "").toLowerCase().includes(q) ||
        g.summary.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [grievances, grievanceFilter, grievanceSearch]);

  const handleResolveGrievance = async (ticketId: string) => {
    if (!isAdmin) return;
    setResolvingTicketId(ticketId);
    try {
      await resolveGrievanceTicket(
        ticketId,
        user?.email || "Grievance Officer",
        resolutionNotes[ticketId],
      );
      await logAdminActivity("RESOLVE_GRIEVANCE", { ticketId });
      toast.success(`Grievance Ticket ${ticketId} marked RESOLVED.`);
    } catch {
      toast.error("Failed to mark grievance ticket resolved.");
    } finally {
      setResolvingTicketId(null);
    }
  };

  // -------------------------------------------------------------
  // TAB 4: BULK RECONNAISSANCE & LEDGER HANDLERS
  // -------------------------------------------------------------
  const detectedDomains = useMemo(() => {
    return bulkInput
      .split(/[\n,]/)
      .map((u) => normalizeDomainName(u))
      .filter((u) => u.length > 2 && u.includes("."));
  }, [bulkInput]);

  const handleExecuteBulkScan = async () => {
    if (detectedDomains.length === 0) {
      toast.error("Please enter at least one valid domain URL (e.g. domain.com)");
      return;
    }

    const adminIdToken = fbUser ? await fbUser.getIdToken().catch(() => undefined) : undefined;
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
        const report = await runAudit({
          data: { input: domain, scanMode: bulkScanMode, adminIdToken },
        });
        saveAuditScan(report, "ind-dpdp", false).catch(() => {});

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
        items.push({
          domain,
          score: 0,
          verdict: "SCAN FAILED",
          criticalLeaksCount: 0,
          fineExposure: "N/A",
          serverLocation: "Unknown",
          summary: `Audit execution error: ${errorMsg}`,
          scannedAt: new Date().toISOString(),
          error: errorMsg,
        });
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
        toast.warning("Batch completed locally, failed to save batch doc.");
      }
    }
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
    toast.success("CSV export downloaded.");
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
    if (!confirm("Delete this bulk scan batch from Cloud Firestore?")) return;
    try {
      await deleteBulkScanBatch(batchId);
      setPastBatches((prev) => prev.filter((b) => b.id !== batchId));
      toast.success("Batch deleted from Firestore.");
    } catch {
      toast.error("Failed to delete batch.");
    }
  };

  const handleCopyRules = async () => {
    try {
      await navigator.clipboard.writeText(RECOMMENDED_FIRESTORE_RULES);
      setCopiedRules(true);
      toast.success("Recommended Firestore Security Rules copied.");
      setTimeout(() => setCopiedRules(false), 2200);
    } catch {
      toast.error("Clipboard copy blocked by browser.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0D0E11] text-[#F4F4F5] flex items-center justify-center p-4 font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-[#C9A227]" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // SECURE AUTH GUARD (ONLY AUTHORIZED MASTER ADMINS)
  // -------------------------------------------------------------
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0D0E11] text-[#F4F4F5] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-md rounded-lg border border-[#262932] bg-[#15171C] p-8 space-y-7">
          <div className="text-center space-y-2.5">
            <div className="w-14 h-14 rounded-md bg-[#0D0E11] border border-[#262932] flex items-center justify-center text-[#C9A227] mx-auto">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="font-display text-2xl font-bold text-[#FAF8F5] tracking-tight">
              Sovereign Command Citadel
            </h1>
            <p className="text-xs font-mono text-[#9CA3AF]">
              Firebase Authentication · Cloud Firestore Secured
            </p>
          </div>

          {authError && (
            <div className="p-3.5 rounded-md border border-[#EF4444]/40 bg-[#0D0E11] text-[#EF4444] text-xs font-mono text-center leading-relaxed">
              {authError}
            </div>
          )}

          <div className="space-y-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3.5 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] py-3.5 px-5 text-sm font-semibold text-[#FAF8F5] transition-colors cursor-pointer disabled:opacity-50 font-sans"
            >
              {isAuthenticating ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#C9A227]" />
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

          <div className="text-center space-y-1.5 border-t border-[#262932] pt-5 font-mono text-[10px]">
            <div className="flex items-center justify-center gap-1.5 text-[#C9A227] font-semibold tracking-wider">
              <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
              <span>AUTHORIZED CITADEL ADMINISTRATORS ONLY</span>
            </div>
            <p className="text-[#9CA3AF] text-[10px] pt-1 flex items-center justify-center gap-1.5">
              <Lock className="w-3 h-3 text-[#9CA3AF]" />
              <span>Powered by Firebase Auth · Zero-Trust Firestore Security Rules</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED COMMAND CITADEL (4 REAL-TIME MANAGEMENT TABS)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0D0E11] text-[#F4F4F5] font-sans p-4 sm:p-8 space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-lg border border-[#262932] bg-[#15171C]">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-md bg-[#0D0E11] text-[#C9A227] border border-[#262932]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold font-display text-[#FAF8F5]">
                ASJi Sovereign Command Citadel
              </h1>
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-sm bg-[#0D0E11] text-[#10B981] border border-[#10B981]/40 flex items-center gap-1.5">
                <CheckCircle className="w-3 h-3 text-[#10B981]" />
                REAL-TIME FIRESTORE ACTIVE
              </span>
            </div>
            <p className="text-xs text-[#9CA3AF] font-mono mt-1">
              Operator: <strong className="text-[#C9A227]">{user.email}</strong> · Project:{" "}
              <code className="text-[#F4F4F5]">perceptive-bulwark-js7sz</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => {
              fetchTransactionsAndLicenses();
              loadLawsFromFirestore();
              loadDailyUpdatesFromFirestore();
              loadPastBatchesFromFirestore();
              toast.success("Firestore ledgers synchronized.");
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227] hover:border-[#C9A227] text-xs font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh All</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] text-xs font-semibold text-[#9CA3AF] hover:text-[#FAF8F5] transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* REAL-TIME METRICS SUMMARY ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 font-mono text-xs">
        <div className="p-4 rounded-lg border border-[#262932] bg-[#15171C] space-y-1">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>Pending Payment Approvals</span>
            <Receipt className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-xl font-bold tabular-nums text-[#FAF8F5]">
            {pendingPaymentsCount}
          </div>
          <div className="text-[10px] text-[#10B981]">
            {verifiedUnlockedDomains.length} Verified Domains Active
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#262932] bg-[#15171C] space-y-1">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>Live 15-Nation Statutes</span>
            <Scale className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-xl font-bold tabular-nums text-[#FAF8F5]">{laws.length}</div>
          <div
            className={`text-[10px] flex items-center gap-1 ${
              isVerifiedToday ? "text-[#10B981]" : "text-[#F59E0B]"
            }`}
          >
            {isVerifiedToday ? (
              <>
                <CheckCircle className="w-3 h-3" />
                <span>Verified Today</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>Verification Pending</span>
              </>
            )}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-[#262932] bg-[#15171C] space-y-1">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>Open DPDP Grievances</span>
            <Mail className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-xl font-bold tabular-nums text-[#FAF8F5]">{openGrievancesCount}</div>
          <div className="text-[10px] text-[#9CA3AF]">{grievances.length} Total Tickets Logged</div>
        </div>

        <div className="p-4 rounded-lg border border-[#262932] bg-[#15171C] space-y-1">
          <div className="flex items-center justify-between text-[#9CA3AF]">
            <span>Live Audit &amp; Consent Ledger</span>
            <Activity className="w-4 h-4 text-[#C9A227]" />
          </div>
          <div className="text-xl font-bold tabular-nums text-[#FAF8F5]">{auditScans.length}</div>
          <div className="text-[10px] text-[#9CA3AF]">
            {consentRecords.length} Consent Decisions Recorded
          </div>
        </div>
      </div>

      {/* 4 MANAGEMENT NAVIGATION TABS */}
      <div className="flex items-center gap-2 border-b border-[#262932] pb-3 text-xs font-mono overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdminTab("payments")}
          className={`px-4 py-2.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap tabular-nums ${
            adminTab === "payments"
              ? "bg-[#C9A227] text-[#0D0E11] font-bold"
              : "border border-[#262932] bg-[#15171C] text-[#9CA3AF] hover:text-[#FAF8F5] hover:border-[#C9A227]/50"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>1. Payment &amp; Domain Unlock Approvals ({pendingPaymentsCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab("laws")}
          className={`px-4 py-2.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap tabular-nums ${
            adminTab === "laws"
              ? "bg-[#C9A227] text-[#0D0E11] font-bold"
              : "border border-[#262932] bg-[#15171C] text-[#9CA3AF] hover:text-[#FAF8F5] hover:border-[#C9A227]/50"
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>2. Live 15-Nation Statute &amp; Law Editor ({laws.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab("grievances")}
          className={`px-4 py-2.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap tabular-nums ${
            adminTab === "grievances"
              ? "bg-[#C9A227] text-[#0D0E11] font-bold"
              : "border border-[#262932] bg-[#15171C] text-[#9CA3AF] hover:text-[#FAF8F5] hover:border-[#C9A227]/50"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>3. DPDP Grievance &amp; Rights Desk ({openGrievancesCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab("ledger")}
          className={`px-4 py-2.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap tabular-nums ${
            adminTab === "ledger"
              ? "bg-[#C9A227] text-[#0D0E11] font-bold"
              : "border border-[#262932] bg-[#15171C] text-[#9CA3AF] hover:text-[#FAF8F5] hover:border-[#C9A227]/50"
          }`}
        >
          <Database className="w-4 h-4" />
          <span>4. Live Audit &amp; Consent Ledger ({auditScans.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PAYMENT & DOMAIN UNLOCK APPROVALS                  */}
      {/* ========================================================= */}
      {adminTab === "payments" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#FAF8F5] flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#C9A227]" />
                  Payment &amp; Domain Unlock Approvals (payment_unlocks)
                </h3>
                <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">
                  Review submitted 12-digit UTR payment references and click{" "}
                  <strong className="text-[#10B981]">Verify &amp; Unlock Domain</strong> to unlock
                  full Remediation Code Patches and Statutory Legal Packs across all devices.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsIssuingManual(true)}
                className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider cursor-pointer shrink-0"
              >
                <KeyRound className="w-4 h-4" />
                <span>Manual Domain Unlock</span>
              </button>
            </div>

            {/* Filter & Search */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={txnSearch}
                  onChange={(e) => setTxnSearch(e.target.value)}
                  placeholder="Search domain, UTR reference, or email..."
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] pl-10 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#6B7280] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#0D0E11] p-1 rounded-md border border-[#262932] overflow-x-auto">
                {(["all", "pending", "verified", "rejected"] as const).map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setTxnFilter(statusKey)}
                    className={`px-3 py-1 rounded-sm text-[10px] font-semibold uppercase transition-colors cursor-pointer tabular-nums ${
                      txnFilter === statusKey
                        ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                        : "text-[#9CA3AF] hover:text-[#FAF8F5]"
                    }`}
                  >
                    {statusKey}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Payment Unlocks Queue */}
          {loadingTxns ? (
            <div className="p-10 text-center text-[#9CA3AF]">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C9A227]" />
              <p className="mt-2 text-xs">Loading payment unlock submissions...</p>
            </div>
          ) : filteredUnlockRequests.length === 0 && filteredLegacyTxns.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-[#262932] bg-[#15171C]">
              <p className="text-[#9CA3AF]">No submitted payment unlock references match filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredUnlockRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-5 rounded-lg border border-[#262932] bg-[#15171C] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base text-[#FAF8F5]">{req.domain}</span>
                      <span className="px-2.5 py-0.5 rounded-sm text-[10px] bg-[#0D0E11] text-[#C9A227] border border-[#262932]">
                        {req.tierName || req.tier}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold border uppercase ${
                          req.status === "verified"
                            ? "bg-[#0D0E11] text-[#10B981] border-[#10B981]/40"
                            : req.status === "rejected"
                              ? "bg-[#0D0E11] text-[#EF4444] border-[#EF4444]/40"
                              : "bg-[#0D0E11] text-[#F59E0B] border-[#F59E0B]/40"
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#9CA3AF] flex flex-wrap gap-4 tabular-nums">
                      <span>
                        UTR Ref: <strong className="text-[#C9A227]">{req.referenceId}</strong>
                      </span>
                      {req.priceInr && (
                        <span>
                          Amount: <strong className="text-[#10B981]">{req.priceInr}</strong>
                        </span>
                      )}
                      <span>
                        Org: {req.orgName || req.domain} ({req.email || "N/A"})
                      </span>
                      {req.created_at && (
                        <span>Submitted: {new Date(req.created_at).toLocaleString()}</span>
                      )}
                    </div>
                  </div>

                  {req.status === "pending" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleVerifyUnlockRequest(req)}
                        className="px-4 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-[#0D0E11] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Verify &amp; Unlock Domain
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectUnlockRequest(req)}
                        className="px-3.5 py-2 rounded-md border border-[#EF4444]/40 bg-[#0D0E11] text-[#EF4444] hover:border-[#EF4444] text-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Legacy `transactions` fallback records if present */}
              {filteredLegacyTxns.map((txn) => (
                <div
                  key={txn.id}
                  className="p-5 rounded-lg border border-[#262932] bg-[#15171C] flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-base text-[#FAF8F5]">{txn.domain}</span>
                      <span className="px-2 py-0.5 rounded-sm text-[9px] bg-[#0D0E11] text-[#9CA3AF] border border-[#262932]">
                        LEGACY TXN
                      </span>
                      <span className="px-2.5 py-0.5 rounded-sm text-[10px] bg-[#0D0E11] text-[#C9A227] border border-[#262932]">
                        {txn.tierName || txn.tier}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-bold border bg-[#0D0E11] text-[#F59E0B] border-[#F59E0B]/40 uppercase">
                        {txn.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#9CA3AF] flex flex-wrap gap-4 tabular-nums">
                      <span>
                        UTR Ref: <strong className="text-[#C9A227]">{txn.referenceId}</strong>
                      </span>
                      <span>
                        Amount: <strong className="text-[#10B981]">{txn.priceInr}</strong>
                      </span>
                      <span>
                        Org: {txn.orgName} ({txn.email})
                      </span>
                    </div>
                  </div>

                  {txn.status === "pending_verification" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleApproveLegacyTransaction(txn)}
                        className="px-4 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-[#0D0E11] font-bold text-xs transition-colors cursor-pointer"
                      >
                        Verify &amp; Unlock Domain
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectLegacyTransaction(txn)}
                        className="px-3.5 py-2 rounded-md border border-[#EF4444]/40 bg-[#0D0E11] text-[#EF4444] hover:border-[#EF4444] text-xs transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Active Verified Domains Registry */}
          <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-4">
            <h4 className="font-display font-bold text-base text-[#FAF8F5] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#C9A227]" />
              Verified Unlocked Domains ({verifiedUnlockedDomains.length})
            </h4>

            {verifiedUnlockedDomains.length === 0 ? (
              <p className="text-[#9CA3AF] text-xs font-sans">No verified domains unlocked yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verifiedUnlockedDomains.map((item) => (
                  <div
                    key={item.domain}
                    className="p-4 rounded-md border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#FAF8F5] text-sm">{item.domain}</span>
                        <span className="px-2 py-0.5 rounded-sm text-[9px] bg-[#15171C] text-[#10B981] border border-[#10B981]/40 font-bold">
                          VERIFIED
                        </span>
                      </div>
                      <div className="text-[10px] text-[#9CA3AF] mt-0.5 tabular-nums">
                        Tier: {item.tierName || item.tier}
                        {item.priceInr ? ` · ${item.priceInr}` : ""}
                        {item.referenceId ? ` · Ref: ${item.referenceId}` : ""}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRevokeLicense(item.domain)}
                      className="px-2.5 py-1 rounded-md border border-[#EF4444]/40 bg-[#15171C] text-[#EF4444] hover:border-[#EF4444] text-[10px] transition-colors cursor-pointer"
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
      {/* TAB 2: LIVE 15-NATION STATUTE & LAW EDITOR                */}
      {/* ========================================================= */}
      {adminTab === "laws" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="font-display text-lg font-bold text-[#FAF8F5] flex items-center gap-2">
                    <Scale className="w-5 h-5 text-[#C9A227]" />
                    Live 15-Nation Statute &amp; Law Editor (statutory_rules)
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold border inline-flex items-center gap-1.5 ${
                      isVerifiedToday
                        ? "bg-[#0D0E11] text-[#10B981] border-[#10B981]/40"
                        : "bg-[#0D0E11] text-[#F59E0B] border-[#F59E0B]/40"
                    }`}
                  >
                    {isVerifiedToday ? "VERIFIED TODAY" : "DAILY CHECK PENDING"}
                  </span>
                </div>
                <p className="text-[#9CA3AF] font-sans text-xs leading-relaxed">
                  Edit any jurisdiction&apos;s statute name, penalty ceiling, regulator, or legal
                  template text and publish live updates to Firestore <code>statutory_rules</code>.
                  All subsequent scans and the World Laws Atlas immediately apply your changes.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <button
                  type="button"
                  onClick={() => setShowDailyCheckModal(true)}
                  className="btn-gold flex items-center gap-2 px-4 py-2.5 rounded-md font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Verify Laws Today</span>
                </button>

                <button
                  type="button"
                  onClick={handleSyncWorldLaws}
                  disabled={syncingLaws}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] text-[#FAF8F5] transition-colors cursor-pointer text-xs"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#C9A227] ${syncingLaws ? "animate-spin" : ""}`}
                  />
                  <span>Sync 15 Laws</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsAddingLaw(true)}
                  className="flex items-center gap-2 px-3.5 py-2.5 rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227] hover:border-[#C9A227] transition-colors cursor-pointer text-xs font-semibold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Statute</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search & Region Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-lg border border-[#262932] bg-[#15171C]">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={lawSearch}
                onChange={(e) => setLawSearch(e.target.value)}
                placeholder="Search country, acronym, or statute..."
                className="w-full rounded-md border border-[#262932] bg-[#0D0E11] pl-10 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#6B7280] focus:border-[#C9A227] focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
              {["all", "Asia-Pacific", "Europe & UK", "Americas", "Middle East", "Africa"].map(
                (region) => (
                  <button
                    key={region}
                    type="button"
                    onClick={() => setLawRegionFilter(region)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      lawRegionFilter === region
                        ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                        : "border border-[#262932] bg-[#0D0E11] text-[#9CA3AF] hover:text-[#FAF8F5] hover:border-[#C9A227]/50"
                    }`}
                  >
                    {region === "all" ? "All Regions" : region}
                  </button>
                ),
              )}
            </div>
          </div>

          {loadingLaws ? (
            <div className="p-10 text-center text-[#9CA3AF]">
              <Loader2 className="w-7 h-7 animate-spin mx-auto text-[#C9A227]" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLaws.map((law) => (
                <div
                  key={law.id}
                  className="p-5 rounded-lg border border-[#262932] bg-[#15171C] space-y-3 flex flex-col justify-between hover:border-[#C9A227]/60 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-1 rounded-sm border border-[#262932] bg-[#0D0E11] font-mono text-xs font-bold text-[#C9A227] shrink-0">
                          [{law.countryCode || law.flag}]
                        </span>
                        <div>
                          <h4 className="font-display font-bold text-[#FAF8F5] text-sm">
                            {law.country}
                          </h4>
                          <span className="text-[10px] text-[#C9A227] font-bold tabular-nums">
                            {law.acronym} ({law.enactedYear})
                          </span>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-sm text-[9px] font-bold border bg-[#0D0E11] text-[#10B981] border-[#10B981]/40 shrink-0">
                        {law.status}
                      </span>
                    </div>

                    <p className="text-xs font-sans text-[#9CA3AF] line-clamp-2 leading-relaxed">
                      {law.lawName}
                    </p>

                    <div className="p-3 rounded-md bg-[#0D0E11] border border-[#262932] space-y-1 text-[10px]">
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9CA3AF]">Max Penalty:</span>
                        <strong className="text-[#C9A227] text-right">{law.maxPenalty}</strong>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9CA3AF]">Regulator:</span>
                        <strong className="text-[#FAF8F5] text-right truncate max-w-[180px]">
                          {law.governingBody}
                        </strong>
                      </div>
                      <div className="flex justify-between gap-2">
                        <span className="text-[#9CA3AF]">Breach Notice:</span>
                        <strong className="text-[#FAF8F5] text-right">
                          {law.breachNotificationHours}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#262932] flex items-center justify-between text-[11px]">
                    <a
                      href={law.officialPortal}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#9CA3AF] hover:text-[#C9A227] flex items-center gap-1 transition-colors text-[10px]"
                    >
                      <span>Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setEditingLaw({
                            ...law,
                            legalTemplateText:
                              law.legalTemplateText ?? law.standardDraftTemplate ?? "",
                          })
                        }
                        className="px-2.5 py-1 rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227] hover:border-[#C9A227] text-[10px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit &amp; Publish</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteLaw(law.id)}
                        className="p-1.5 rounded-md border border-[#EF4444]/40 bg-[#0D0E11] text-[#EF4444] hover:border-[#EF4444] transition-colors cursor-pointer"
                        title="Delete Law"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Daily Verification Log */}
          <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-4">
            <h4 className="font-display font-bold text-base text-[#FAF8F5] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#C9A227]" />
              Daily Statutory Verification Log ({dailyUpdates.length})
            </h4>
            {dailyUpdates.length === 0 ? (
              <p className="text-[#9CA3AF] text-xs font-sans">No daily checks recorded yet.</p>
            ) : (
              <div className="space-y-2">
                {dailyUpdates.slice(0, 6).map((up) => (
                  <div
                    key={up.id}
                    className="p-3 rounded-md border border-[#262932] bg-[#0D0E11] flex flex-col sm:flex-row sm:items-center justify-between text-[11px] gap-2"
                  >
                    <div>
                      <span className="font-bold text-[#10B981]">{up.status}</span> ·{" "}
                      <span className="text-[#FAF8F5]">{up.statutesCount} statutes validated</span>
                      <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">{up.notes}</p>
                    </div>
                    <div className="text-right text-[10px] text-[#9CA3AF] shrink-0">
                      <div>{new Date(up.verifiedAt).toLocaleString()}</div>
                      <div>{up.verifiedBy}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DPDP GRIEVANCE & RIGHTS DESK (grievance_tickets)   */}
      {/* ========================================================= */}
      {adminTab === "grievances" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold text-[#FAF8F5] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#C9A227]" />
                  DPDP Grievance &amp; Data Principal Rights Desk (grievance_tickets)
                </h3>
                <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">
                  Real-time ticket queue for submitted Data Principal Access, Correction, Erasure,
                  and Section 13 Grievance Redressal requests (7-business-day SLA).
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  value={grievanceSearch}
                  onChange={(e) => setGrievanceSearch(e.target.value)}
                  placeholder="Search ASJI-GRV-2026-..., name, email, domain..."
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] pl-10 pr-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#6B7280] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-[#0D0E11] p-1 rounded-md border border-[#262932]">
                {(["ALL", "OPEN", "RESOLVED"] as const).map((statusKey) => (
                  <button
                    key={statusKey}
                    type="button"
                    onClick={() => setGrievanceFilter(statusKey)}
                    className={`px-3 py-1 rounded-sm text-[10px] font-semibold transition-colors cursor-pointer ${
                      grievanceFilter === statusKey
                        ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                        : "text-[#9CA3AF] hover:text-[#FAF8F5]"
                    }`}
                  >
                    {statusKey}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filteredGrievances.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-[#262932] bg-[#15171C]">
              <p className="text-[#9CA3AF]">No grievance tickets match the active filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredGrievances.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="p-5 rounded-lg border border-[#262932] bg-[#15171C] space-y-3"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-bold text-sm text-[#C9A227]">{ticket.ticketId}</span>
                      <span className="px-2 py-0.5 rounded-sm text-[10px] bg-[#0D0E11] text-[#FAF8F5] border border-[#262932]">
                        {ticket.requestType}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-sm text-[10px] font-bold border ${
                          ticket.status === "RESOLVED"
                            ? "bg-[#0D0E11] text-[#10B981] border-[#10B981]/40"
                            : "bg-[#0D0E11] text-[#F59E0B] border-[#F59E0B]/40"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#9CA3AF] tabular-nums">
                      Submitted: {new Date(ticket.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-[11px] text-[#9CA3AF] flex flex-wrap gap-4">
                    <span>
                      Data Principal: <strong className="text-[#FAF8F5]">{ticket.fullName}</strong>
                    </span>
                    <span>
                      Email: <strong className="text-[#FAF8F5]">{ticket.email}</strong>
                    </span>
                    {ticket.domainRef && ticket.domainRef !== "N/A" && (
                      <span>
                        Domain/Ref: <strong className="text-[#C9A227]">{ticket.domainRef}</strong>
                      </span>
                    )}
                  </div>

                  <p className="rounded border border-[#262932] bg-[#0D0E11] p-3 font-sans text-xs text-[#FAF8F5] leading-relaxed">
                    {ticket.summary}
                  </p>

                  {ticket.status === "OPEN" ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={resolutionNotes[ticket.ticketId] || ""}
                        onChange={(e) =>
                          setResolutionNotes((prev) => ({
                            ...prev,
                            [ticket.ticketId]: e.target.value,
                          }))
                        }
                        placeholder="Optional statutory resolution note (e.g., Data erased / notice dispatched)..."
                        className="flex-1 rounded-md border border-[#262932] bg-[#0D0E11] px-3 py-2 text-xs text-[#FAF8F5] placeholder:text-[#6B7280] focus:border-[#C9A227] focus:outline-none"
                      />
                      <button
                        type="button"
                        disabled={resolvingTicketId === ticket.ticketId}
                        onClick={() => handleResolveGrievance(ticket.ticketId)}
                        className="px-4 py-2 rounded-md bg-[#10B981] hover:bg-[#059669] text-[#0D0E11] font-bold text-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                      >
                        {resolvingTicketId === ticket.ticketId ? "Updating..." : "Mark RESOLVED"}
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-[#10B981] flex flex-wrap items-center gap-3">
                      <span>
                        Resolved by {ticket.resolvedBy || "Grievance Officer"} ·{" "}
                        {ticket.resolvedAt ? new Date(ticket.resolvedAt).toLocaleString() : ""}
                      </span>
                      {ticket.resolutionNote && (
                        <span className="text-[#9CA3AF]">Note: {ticket.resolutionNote}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: LIVE AUDIT & CONSENT LEDGER                        */}
      {/* ========================================================= */}
      {adminTab === "ledger" && (
        <div className="space-y-6 font-mono text-xs">
          {/* 4A. Real-Time Live Audit Scans Log */}
          <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-display text-lg font-bold text-[#FAF8F5] flex items-center gap-2">
                  <Activity className="w-5 h-5 text-[#C9A227]" />
                  Live Telemetry Audit Scans (audit_scans · Latest 50)
                </h3>
                <p className="text-[#9CA3AF] font-sans text-xs mt-0.5">
                  Every live scan generates an immutable deterministic reference record accessible
                  to verifiers via certificate lookup.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded border border-[#10B981]/40 bg-[#0D0E11] text-[10px] text-[#10B981] font-bold">
                LIVE STREAM · {auditScans.length} LOGS
              </span>
            </div>

            {auditScans.length === 0 ? (
              <p className="text-[#9CA3AF] font-sans text-xs">
                No live audit scans logged yet. Run a domain audit on the home scanner to record.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-md border border-[#262932]">
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="border-b border-[#262932] bg-[#0D0E11] text-[#C9A227] uppercase text-[10px]">
                      <th className="p-3">Ref ID</th>
                      <th className="p-3">Domain</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Verdict</th>
                      <th className="p-3">Mode / Law</th>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3 text-right">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditScans.map((scan) => (
                      <tr
                        key={scan.audit_ref_id}
                        className="border-b border-[#262932] last:border-b-0 bg-[#15171C] hover:bg-[#0D0E11]/60"
                      >
                        <td className="p-3 font-bold text-[#C9A227]">{scan.audit_ref_id}</td>
                        <td className="p-3 font-bold text-[#FAF8F5]">{scan.domain}</td>
                        <td className="p-3 font-bold tabular-nums">{scan.compliance_score}/100</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-sm text-[9px] font-bold border ${
                              scan.verdict === "COMPLIANT"
                                ? "text-[#10B981] border-[#10B981]/40"
                                : scan.verdict === "MODERATE RISK"
                                  ? "text-[#F59E0B] border-[#F59E0B]/40"
                                  : "text-[#EF4444] border-[#EF4444]/40"
                            }`}
                          >
                            {scan.verdict}
                          </span>
                        </td>
                        <td className="p-3 text-[#9CA3AF]">
                          {scan.framework?.toUpperCase()} {scan.politech_mode ? "· POLITECH" : ""}
                        </td>
                        <td className="p-3 text-[#9CA3AF] tabular-nums">{scan.created_at}</td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedScanRecord(scan)}
                            className="inline-flex items-center gap-1 text-[#C9A227] hover:underline cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 4B. Verified Unlocked Domains Summary + 4C. Consent Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-3">
              <h4 className="font-display font-bold text-base text-[#FAF8F5] flex items-center gap-2">
                <Award className="w-4 h-4 text-[#C9A227]" />
                Unlocked Domains Registry ({verifiedUnlockedDomains.length})
              </h4>
              {verifiedUnlockedDomains.length === 0 ? (
                <p className="text-[#9CA3AF] font-sans text-xs">No verified domains unlocked.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {verifiedUnlockedDomains.map((u) => (
                    <div
                      key={u.domain}
                      className="p-3 rounded border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-[#FAF8F5]">{u.domain}</span>
                        <div className="text-[10px] text-[#9CA3AF]">
                          {u.tierName || u.tier} · {u.verifiedBy || "Admin"}
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold text-[#10B981] border border-[#10B981]/40">
                        VERIFIED
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 rounded-lg border border-[#262932] bg-[#15171C] space-y-3">
              <h4 className="font-display font-bold text-base text-[#FAF8F5] flex items-center gap-2">
                <Cookie className="w-4 h-4 text-[#C9A227]" />
                Cookie &amp; Scan Consent Ledger ({consentRecords.length})
              </h4>
              {consentRecords.length === 0 ? (
                <p className="text-[#9CA3AF] font-sans text-xs">No consent records logged yet.</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {consentRecords.map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-[#C9A227]">{c.choice}</span>
                        {c.domainContext && (
                          <span className="text-[#FAF8F5] ml-2">({c.domainContext})</span>
                        )}
                        <div className="text-[10px] text-[#9CA3AF] truncate">
                          v{c.policyVersion} · {new Date(c.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span className="text-[10px] text-[#10B981] shrink-0">LOGGED</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 4D. Collapsible "View Recommended Firestore Security Rules" Box */}
          <div className="rounded-lg border border-[#C9A227]/40 bg-[#15171C] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSecurityRulesBox((v) => !v)}
              className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#0D0E11]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-[#C9A227]" />
                <div>
                  <span className="font-display text-base font-bold text-[#FAF8F5] block">
                    View Recommended Firestore Security Rules
                  </span>
                  <span className="text-[11px] font-sans text-[#9CA3AF]">
                    Production zero-trust Firestore rules protecting audit_scans, payment_unlocks,
                    statutory_rules, grievance_tickets, and consent_records.
                  </span>
                </div>
              </div>
              {showSecurityRulesBox ? (
                <ChevronUp className="w-5 h-5 text-[#C9A227]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#C9A227]" />
              )}
            </button>

            {showSecurityRulesBox && (
              <div className="border-t border-[#262932] bg-[#0D0E11] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#C9A227] font-bold uppercase">
                    firestore.rules (Firebase Console Ready)
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRules}
                    className="inline-flex items-center gap-1.5 rounded border border-[#C9A227]/50 bg-[#15171C] px-3 py-1.5 text-[11px] font-bold text-[#C9A227] hover:bg-[#C9A227]/10 cursor-pointer"
                  >
                    {copiedRules ? (
                      <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedRules ? "Copied Rules" : "Copy Rules"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded border border-[#262932] bg-[#15171C] text-[11px] text-[#FAF8F5] overflow-x-auto leading-relaxed">
                  {RECOMMENDED_FIRESTORE_RULES}
                </pre>
              </div>
            )}
          </div>

          {/* 4E. Collapsible Bulk Lead Reconnaissance Engine */}
          <div className="rounded-lg border border-[#262932] bg-[#15171C] overflow-hidden">
            <button
              type="button"
              onClick={() => setShowBulkScanner((v) => !v)}
              className="w-full p-5 flex items-center justify-between text-left cursor-pointer hover:bg-[#0D0E11]/40 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-[#C9A227]" />
                <div>
                  <span className="font-display text-base font-bold text-[#FAF8F5] block">
                    Bulk Lead Reconnaissance Scanner ({pastBatches.length} Saved Batches)
                  </span>
                  <span className="text-[11px] font-sans text-[#9CA3AF]">
                    Run multi-domain portfolio audits bypassing public rate limits with Verified
                    Admin clearance.
                  </span>
                </div>
              </div>
              {showBulkScanner ? (
                <ChevronUp className="w-5 h-5 text-[#C9A227]" />
              ) : (
                <ChevronDown className="w-5 h-5 text-[#C9A227]" />
              )}
            </button>

            {showBulkScanner && (
              <div className="border-t border-[#262932] p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-[#9CA3AF]">Presets:</span>
                    {BULK_PRESETS.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setBulkInput(preset.domains)}
                        className="px-2.5 py-1 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] text-[#FAF8F5] text-[10px] cursor-pointer"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 bg-[#0D0E11] p-1 rounded-md border border-[#262932]">
                    <button
                      type="button"
                      onClick={() => setBulkScanMode("fast-lite")}
                      className={`px-3 py-1 rounded-sm text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                        bulkScanMode === "fast-lite"
                          ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                          : "text-[#9CA3AF]"
                      }`}
                    >
                      <Zap className="w-3 h-3" /> Fast-Lite
                    </button>
                    <button
                      type="button"
                      onClick={() => setBulkScanMode("deep-grounded")}
                      className={`px-3 py-1 rounded-sm text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                        bulkScanMode === "deep-grounded"
                          ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                          : "text-[#9CA3AF]"
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" /> Deep Audit
                    </button>
                  </div>
                </div>

                <textarea
                  rows={4}
                  value={bulkInput}
                  onChange={(e) => setBulkInput(e.target.value)}
                  disabled={isBulkScanning}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-3 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {!isBulkScanning ? (
                      <button
                        type="button"
                        onClick={handleExecuteBulkScan}
                        disabled={detectedDomains.length === 0}
                        className="btn-gold flex items-center gap-2 px-5 py-2.5 rounded-md font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Run Bulk Audit ({detectedDomains.length})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          abortScanRef.current = true;
                        }}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#EF4444] text-[#0D0E11] font-bold text-xs cursor-pointer"
                      >
                        <StopCircle className="w-4 h-4" />
                        <span>
                          Abort ({bulkProgress.current}/{bulkProgress.total})
                        </span>
                      </button>
                    )}
                  </div>

                  {bulkResults.length > 0 && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleExportCsv(bulkResults, "Live_Run")}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#10B981]/40 bg-[#0D0E11] text-[#10B981] text-xs cursor-pointer"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExportJson(bulkResults, `ASJi_Bulk_${Date.now()}`)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#262932] bg-[#0D0E11] text-[#FAF8F5] text-xs cursor-pointer"
                      >
                        <FileJson className="w-3.5 h-3.5 text-[#C9A227]" /> JSON
                      </button>
                    </div>
                  )}
                </div>

                {bulkResults.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredBulkResults.map((item, idx) => (
                      <div
                        key={`${item.domain}-${idx}`}
                        className="p-3.5 rounded-md border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-3"
                      >
                        <div>
                          <div className="font-bold text-[#FAF8F5]">{item.domain}</div>
                          <div className="text-[10px] text-[#9CA3AF]">
                            {item.verdict} · {item.criticalLeaksCount} leaks
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[#C9A227]">{item.score}/100</span>
                          {Boolean(item.reportData) && (
                            <button
                              type="button"
                              onClick={() => setSelectedAuditDetail(item.reportData as AuditReport)}
                              className="text-[#C9A227] hover:underline cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pastBatches.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-[#262932]">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-[#C9A227]">
                        Saved Bulk Batches ({pastBatches.length})
                      </span>
                      {loadingBatches && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C9A227]" />
                      )}
                    </div>
                    {pastBatches.slice(0, 5).map((batch) => (
                      <div
                        key={batch.id}
                        className="p-3 rounded border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-[#FAF8F5]">{batch.title}</div>
                          <div className="text-[10px] text-[#9CA3AF]">
                            Avg {batch.avgScore}/100 · {batch.highRiskCount} High Risk
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setBulkResults(batch.items)}
                            className="px-2.5 py-1 rounded border border-[#262932] text-[#C9A227] text-[10px] cursor-pointer"
                          >
                            Load
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeletePastBatch(batch.id)}
                            className="p-1 rounded border border-[#EF4444]/40 text-[#EF4444] cursor-pointer"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: LIVE STATUTE & LAW EDITOR                          */}
      {/* ========================================================= */}
      {editingLaw && (
        <div className="fixed inset-0 z-50 bg-[#0D0E11]/90 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-[#262932] bg-[#15171C] p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262932] pb-3">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-sm border border-[#262932] bg-[#0D0E11] font-mono text-xs font-bold text-[#C9A227]">
                  [{editingLaw.countryCode || editingLaw.flag}]
                </span>
                <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                  Edit {editingLaw.country} Statute
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingLaw(null)}
                className="text-[#9CA3AF] hover:text-[#FAF8F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLawEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Statute Full Name</label>
                <input
                  type="text"
                  required
                  value={editingLaw.lawName}
                  onChange={(e) => setEditingLaw({ ...editingLaw, lawName: e.target.value })}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Acronym</label>
                  <input
                    type="text"
                    required
                    value={editingLaw.acronym}
                    onChange={(e) => setEditingLaw({ ...editingLaw, acronym: e.target.value })}
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Status</label>
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
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Penalty Ceiling</label>
                  <input
                    type="text"
                    required
                    value={editingLaw.maxPenalty}
                    onChange={(e) => setEditingLaw({ ...editingLaw, maxPenalty: e.target.value })}
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">
                    Breach Notification Hours
                  </label>
                  <input
                    type="text"
                    required
                    value={String(editingLaw.breachNotificationHours)}
                    onChange={(e) =>
                      setEditingLaw({
                        ...editingLaw,
                        breachNotificationHours: e.target
                          .value as WorldLaw["breachNotificationHours"],
                      })
                    }
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">
                  Regulator / Governing Body
                </label>
                <input
                  type="text"
                  required
                  value={editingLaw.governingBody}
                  onChange={(e) => setEditingLaw({ ...editingLaw, governingBody: e.target.value })}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Statutory Summary</label>
                <textarea
                  rows={3}
                  value={editingLaw.statutorySummary}
                  onChange={(e) =>
                    setEditingLaw({ ...editingLaw, statutorySummary: e.target.value })
                  }
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#C9A227] mb-1 font-bold">
                  Legal Template Text (Injected Into Legal Suite Drafts)
                </label>
                <textarea
                  rows={4}
                  value={editingLaw.legalTemplateText ?? editingLaw.standardDraftTemplate ?? ""}
                  onChange={(e) =>
                    setEditingLaw({
                      ...editingLaw,
                      legalTemplateText: e.target.value,
                      standardDraftTemplate: e.target.value,
                    })
                  }
                  className="w-full rounded-md border border-[#C9A227]/40 bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] focus:border-[#C9A227] focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262932]">
                <button
                  type="button"
                  onClick={() => setEditingLaw(null)}
                  className="px-4 py-2 rounded-md border border-[#262932] bg-[#0D0E11] text-[#9CA3AF] hover:text-[#FAF8F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={publishingLaw}
                  className="btn-gold px-6 py-2 rounded-md font-bold cursor-pointer disabled:opacity-50"
                >
                  {publishingLaw ? "Publishing..." : "Publish Live Law Update"}
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
        <div className="fixed inset-0 z-50 bg-[#0D0E11]/90 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-[#262932] bg-[#15171C] p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262932] pb-3">
              <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                Add New Sovereign Law Jurisdiction
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingLaw(false)}
                className="text-[#9CA3AF] hover:text-[#FAF8F5] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewLaw} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Country</label>
                  <input
                    type="text"
                    required
                    value={newLaw.country || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, country: e.target.value })}
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">ISO Code</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={newLaw.flag || ""}
                    onChange={(e) =>
                      setNewLaw({
                        ...newLaw,
                        flag: e.target.value.toUpperCase(),
                        countryCode: e.target.value.toUpperCase(),
                      })
                    }
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5] uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Region</label>
                  <select
                    value={newLaw.region || "Asia-Pacific"}
                    onChange={(e) =>
                      setNewLaw({ ...newLaw, region: e.target.value as WorldLaw["region"] })
                    }
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
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
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Statute Title</label>
                <input
                  type="text"
                  required
                  value={newLaw.lawName || ""}
                  onChange={(e) => setNewLaw({ ...newLaw, lawName: e.target.value })}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Acronym</label>
                  <input
                    type="text"
                    required
                    value={newLaw.acronym || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, acronym: e.target.value })}
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#9CA3AF] mb-1">Max Penalty</label>
                  <input
                    type="text"
                    required
                    value={newLaw.maxPenalty || ""}
                    onChange={(e) => setNewLaw({ ...newLaw, maxPenalty: e.target.value })}
                    className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Regulator</label>
                <input
                  type="text"
                  required
                  value={newLaw.governingBody || ""}
                  onChange={(e) => setNewLaw({ ...newLaw, governingBody: e.target.value })}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Legal Template Text</label>
                <textarea
                  rows={3}
                  value={newLaw.legalTemplateText || ""}
                  onChange={(e) => setNewLaw({ ...newLaw, legalTemplateText: e.target.value })}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262932]">
                <button
                  type="button"
                  onClick={() => setIsAddingLaw(false)}
                  className="px-4 py-2 rounded-md border border-[#262932] bg-[#0D0E11] text-[#9CA3AF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-6 py-2 rounded-md font-bold cursor-pointer"
                >
                  Publish Statute
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: DAILY STATUTORY CHECK                              */}
      {/* ========================================================= */}
      {showDailyCheckModal && (
        <div className="fixed inset-0 z-50 bg-[#0D0E11]/90 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-[#262932] bg-[#15171C] p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262932] pb-3">
              <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                Record Daily Statutory Verification
              </h3>
              <button
                type="button"
                onClick={() => setShowDailyCheckModal(false)}
                className="text-[#9CA3AF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              value={dailyNotes}
              onChange={(e) => setDailyNotes(e.target.value)}
              placeholder="Optional verification notes..."
              className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDailyCheckModal(false)}
                className="px-4 py-2 rounded-md border border-[#262932] text-[#9CA3AF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isRecordingDailyCheck}
                onClick={handleDailyVerification}
                className="btn-gold px-5 py-2 rounded-md font-bold cursor-pointer disabled:opacity-50"
              >
                {isRecordingDailyCheck ? "Saving..." : "Confirm Check"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: MANUAL DOMAIN UNLOCK                               */}
      {/* ========================================================= */}
      {isIssuingManual && (
        <div className="fixed inset-0 z-50 bg-[#0D0E11]/90 flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-lg border border-[#262932] bg-[#15171C] p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262932] pb-3">
              <h3 className="font-display font-bold text-lg text-[#FAF8F5] flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#C9A227]" />
                Verify &amp; Unlock Domain
              </h3>
              <button
                type="button"
                onClick={() => setIsIssuingManual(false)}
                className="text-[#9CA3AF] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleIssueManualLicense} className="space-y-3.5">
              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Domain Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. clientcorp.com"
                  value={manualDomain}
                  onChange={(e) => setManualDomain(e.target.value)}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Unlock Package Tier</label>
                <select
                  value={manualTier}
                  onChange={(e) => setManualTier(e.target.value as PaymentUnlockRecord["tier"])}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                >
                  <option value="full-bundle">Full-Spectrum Sovereign Enterprise (₹59,999)</option>
                  <option value="gdpr-global">
                    GDPR &amp; Multi-Sovereign Legal Pack (₹45,000)
                  </option>
                  <option value="dpdp-india">DPDP Act 2023 Legal Suite (₹37,500)</option>
                  <option value="patch-code">Remediation Code Patches (₹2,499/mo)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Amount (INR)</label>
                <input
                  type="text"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                />
              </div>

              <div>
                <label className="block text-[11px] text-[#9CA3AF] mb-1">Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Client Pvt Ltd"
                  value={manualOrg}
                  onChange={(e) => setManualOrg(e.target.value)}
                  className="w-full rounded-md border border-[#262932] bg-[#0D0E11] p-2.5 text-xs text-[#FAF8F5]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#262932]">
                <button
                  type="button"
                  onClick={() => setIsIssuingManual(false)}
                  className="px-4 py-2 rounded-md border border-[#262932] text-[#9CA3AF] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-gold px-5 py-2 rounded-md font-bold cursor-pointer"
                >
                  Verify &amp; Unlock Domain
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: AUDIT SCAN LEDGER RECORD DETAIL                    */}
      {/* ========================================================= */}
      {selectedScanRecord && (
        <div className="fixed inset-0 z-50 bg-[#0D0E11]/90 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto rounded-lg border border-[#262932] bg-[#15171C] p-6 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262932] pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                  {selectedScanRecord.audit_ref_id} · {selectedScanRecord.domain}
                </h3>
                <span className="text-[11px] text-[#9CA3AF]">
                  Score: {selectedScanRecord.compliance_score}/100 ({selectedScanRecord.verdict})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedScanRecord(null)}
                className="text-[#9CA3AF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {Array.isArray(selectedScanRecord.score_breakdown) &&
              selectedScanRecord.score_breakdown.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[#C9A227] font-bold uppercase text-[10px]">
                    Deterministic Score Breakdown
                  </div>
                  {selectedScanRecord.score_breakdown.map((b, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-2"
                    >
                      <span>{b.rule}</span>
                      <span className={b.passed ? "text-[#10B981]" : "text-[#EF4444]"}>
                        {b.delta === 0 ? "0" : b.delta}
                      </span>
                    </div>
                  ))}
                </div>
              )}

            <div className="space-y-1.5">
              <div className="text-[#C9A227] font-bold uppercase text-[10px]">
                Recorded Findings ({selectedScanRecord.findings?.length || 0})
              </div>
              {selectedScanRecord.findings?.map((f, i) => (
                <div key={i} className="p-3 rounded border border-[#262932] bg-[#0D0E11]">
                  <div className="font-bold text-[#FAF8F5]">
                    [{f.severity.toUpperCase()}] {f.title}
                  </div>
                  <p className="text-[11px] font-sans text-[#9CA3AF] mt-1">{f.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: BULK SCAN AUDIT REPORT INSPECTION                  */}
      {/* ========================================================= */}
      {selectedAuditDetail && (
        <div className="fixed inset-0 z-50 bg-[#0D0E11]/90 flex items-center justify-center p-4">
          <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg border border-[#262932] bg-[#15171C] p-6 space-y-5 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#262932] pb-3">
              <h3 className="font-display font-bold text-lg text-[#FAF8F5]">
                Audit Findings: {selectedAuditDetail.target} ({selectedAuditDetail.score}/100)
              </h3>
              <button
                type="button"
                onClick={() => setSelectedAuditDetail(null)}
                className="text-[#9CA3AF] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {selectedAuditDetail.criticalLeaks?.map((leak, idx) => (
                <div key={idx} className="p-3 rounded border border-[#EF4444]/40 bg-[#0D0E11]">
                  <div className="font-bold text-[#FAF8F5]">{leak.title}</div>
                  <p className="font-sans text-[#9CA3AF] mt-1">{leak.detail}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() =>
                  handleExportJson(selectedAuditDetail, `Audit_${selectedAuditDetail.target}`)
                }
                className="btn-gold px-4 py-2 rounded font-bold inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Export JSON
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
