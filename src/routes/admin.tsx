import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { seedWorldLawsToFirestore } from "@/lib/firestore-service";

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

function AdminPage() {
  const {
    user,
    loading,
    isAdmin,
    adminSignInWithGoogle,
    logout,
    logAdminActivity,
    authError,
    clearAuthError,
  } = useAuth();

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Navigation & Clearance Tabs
  const [adminTab, setAdminTab] = useState<"licensing" | "trust-hub" | "scanner">("licensing");

  // Bulk Scanner State
  const [inputText, setInputText] = useState("");

  // Transactions State
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [loadingTxns, setLoadingTxns] = useState(false);
  const [syncingLaws, setSyncingLaws] = useState(false);

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

  useEffect(() => {
    if (isAdmin) {
      fetchTransactions();
    }
  }, [isAdmin, fetchTransactions]);

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

  const handleSyncWorldLaws = async () => {
    if (!isAdmin) return;
    setSyncingLaws(true);
    try {
      const res = await seedWorldLawsToFirestore();
      await logAdminActivity("SYNC_WORLD_LAWS", { count: res.count });
      toast.success(`Synchronized ${res.count} Sovereign Jurisdictions to Cloud Firestore!`);
    } catch {
      toast.error("Failed to sync laws.");
    } finally {
      setSyncingLaws(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Firebase Auth + Admin Clearance Guard
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

  return (
    <div className="min-h-screen bg-[#07090e] text-foreground font-sans p-4 sm:p-8 space-y-6">
      {/* Header Bar */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border border-primary/30 bg-black/80 backdrop-blur-md shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/30">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-display text-white">
                ASJi Sovereign Command Citadel
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-400" />
                ADMIN CLEARANCE ACTIVE
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Logged in: <strong className="text-white">{user.email}</strong> (UID:{" "}
              {user.uid.slice(0, 8)}...)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTransactions}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-semibold transition-all cursor-pointer"
            title="Refresh Firestore Database"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Sync Firestore</span>
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-muted-foreground hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs font-mono">
        <button
          onClick={() => setAdminTab("licensing")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "licensing"
              ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
              : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Enterprise UTR Payments &amp; Licenses ({transactions.length})
        </button>

        <button
          onClick={() => setAdminTab("trust-hub")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "trust-hub"
              ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
              : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Award className="w-4 h-4" />
          Firestore Laws Database Sync
        </button>

        <button
          onClick={() => setAdminTab("scanner")}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer ${
            adminTab === "scanner"
              ? "bg-primary text-black font-bold shadow-lg shadow-primary/20"
              : "border border-white/10 bg-white/5 text-muted-foreground hover:text-white"
          }`}
        >
          <Search className="w-4 h-4" />
          Bulk Command Lead Scanner
        </button>
      </div>

      {/* TAB 1: LICENSING & TRANSACTIONS */}
      {adminTab === "licensing" && (
        <div className="space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-black/60">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Receipt className="w-4 h-4 text-primary" />
                Enterprise UPI / Bank UTR Payment Submissions (Firestore Collection: transactions)
              </h3>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Verify 12-digit UPI reference numbers and activate domain licenses in Firestore.
              </p>
            </div>
            <button
              onClick={fetchTransactions}
              className="px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Ledger</span>
            </button>
          </div>

          {loadingTxns ? (
            <div className="p-8 text-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-xs">Querying Firestore transactions ledger...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
              <p className="text-muted-foreground">
                No payment verification requests submitted yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((txn) => (
                <div
                  key={txn.id}
                  className="p-4 rounded-xl border border-white/10 bg-black/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{txn.domain}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] bg-primary/20 text-primary border border-primary/30">
                        {txn.tierName || txn.tier}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                        UTR: <strong className="text-primary">{txn.referenceId}</strong>
                      </span>
                      <span>
                        Amount: <strong className="text-emerald-400">{txn.priceInr}</strong>
                      </span>
                      <span>
                        Org: {txn.orgName} ({txn.email})
                      </span>
                    </div>
                  </div>

                  {txn.status === "pending_verification" && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleApproveTransaction(txn)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-emerald-900/30"
                      >
                        Approve License
                      </button>
                      <button
                        onClick={() => handleRejectTransaction(txn)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs transition-all cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TRUST HUB & DELIVERABLES */}
      {adminTab === "trust-hub" && (
        <div className="space-y-6 font-mono text-xs">
          <div className="p-6 rounded-2xl border border-primary/30 bg-black/60 space-y-3">
            <h3 className="font-bold text-base text-gold-gradient flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Sovereign Laws Database Synchronization
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              Synchronize the verified 15-jurisdiction World Data Protection Laws database directly
              to your Cloud Firestore instance (collection:{" "}
              <strong className="text-white">laws</strong>).
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={handleSyncWorldLaws}
                disabled={syncingLaws}
                className="px-4 py-2.5 rounded-xl bg-primary text-black font-bold flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50"
              >
                <Database className="w-4 h-4" />
                {syncingLaws
                  ? "Syncing Laws to Firestore..."
                  : "Sync 15 Sovereign Laws to Firestore"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SCANNER */}
      {adminTab === "scanner" && (
        <div className="p-6 rounded-2xl border border-white/10 bg-black/50 text-xs font-mono space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            Bulk Command Lead Scanner
          </h3>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter domain URLs to scan (e.g. domain1.com, domain2.com)..."
            className="w-full rounded-xl border border-border bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
          />
        </div>
      )}
    </div>
  );
}
