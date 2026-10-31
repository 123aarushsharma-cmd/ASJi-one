import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Database,
  Lock,
  Trash2,
  RefreshCw,
  X,
  FileText,
  Clock,
  CheckCircle2,
  Cloud,
  Download,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  fetchUserAudits,
  deleteUserAudit,
  fetchUserNotices,
  deleteUserNotice,
  seedWorldLawsToFirestore,
  type UserAuditRecord,
  type UserNoticeRecord,
} from "@/lib/firestore-service";
import { toast } from "sonner";

interface PrivateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAudit?: (audit: UserAuditRecord) => void;
}

export function PrivateVaultModal({ isOpen, onClose, onSelectAudit }: PrivateVaultModalProps) {
  const { user, isAdmin, exportUserDataJson, deleteUserAccountAndData } = useAuth();
  const [activeTab, setActiveTab] = useState<"audits" | "notices" | "sync" | "privacy">("audits");
  const [audits, setAudits] = useState<UserAuditRecord[]>([]);
  const [notices, setNotices] = useState<UserNoticeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const loadVaultData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [userAudits, userNotices] = await Promise.all([
        fetchUserAudits(user.uid),
        fetchUserNotices(user.uid),
      ]);
      setAudits(userAudits);
      setNotices(userNotices);
    } catch {
      // safe fallback
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen && user) {
      loadVaultData();
    }
  }, [isOpen, user, loadVaultData]);

  const handleDeleteAudit = async (auditId: string) => {
    if (!user) return;
    try {
      await deleteUserAudit(user.uid, auditId);
      setAudits((prev) => prev.filter((a) => a.id !== auditId));
      toast.success("Audit deleted from private cloud vault.");
    } catch {
      toast.error("Failed to delete audit record.");
    }
  };

  const handleDeleteNotice = async (noticeId: string) => {
    if (!user) return;
    try {
      await deleteUserNotice(user.uid, noticeId);
      setNotices((prev) => prev.filter((n) => n.id !== noticeId));
      toast.success("Notice removed from private vault.");
    } catch {
      toast.error("Failed to remove statutory notice.");
    }
  };

  const handleSyncWorldLaws = async () => {
    setIsSyncing(true);
    try {
      const result = await seedWorldLawsToFirestore();
      toast.success(
        `Synchronized ${result.count} verified sovereign data protection laws to Cloud Firestore.`,
      );
    } catch {
      toast.error("Failed to synchronize world laws.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadMyData = async () => {
    setIsExporting(true);
    try {
      const jsonData = await exportUserDataJson();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ASJi-User-Data-Export-${user?.uid || "account"}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("User Data Export Downloaded", {
        description:
          "Your complete Firestore records, consents, and audit history exported as JSON.",
      });
    } catch {
      toast.error("Failed to export user data.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await deleteUserAccountAndData();
      toast.success("Account & Associated Data Permanently Deleted", {
        description: "Pursuant to DPDP Act 2023 & GDPR Right to Erasure.",
      });
      setShowDeleteConfirm(false);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Deletion failed.";
      toast.error("Account Deletion Failed", { description: msg });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="private_vault_modal_overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
    >
      <div
        id="private_vault_modal_container"
        className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-2xl text-foreground flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-display text-white">
                  Private Sovereign Vault
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Encrypted Firestore
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Dedicated ledger for {user?.email || "Authenticated User"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/5 text-xs font-medium flex-wrap">
          <button
            onClick={() => setActiveTab("audits")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "audits"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Private Audits ({audits.length})
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "notices"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Saved Legal Charters ({notices.length})
          </button>
          <button
            onClick={() => setActiveTab("sync")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "sync"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Cloud Database
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "privacy"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-white hover:bg-white/5"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Data Rights (DPDP/GDPR)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin text-primary" />
              <p className="text-xs">Synchronizing private records from Firestore...</p>
            </div>
          ) : activeTab === "audits" ? (
            audits.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                <Shield className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-white">No Private Audits Recorded Yet</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  When you execute a statutory scan while signed in, your full evidence dossier and
                  verdict are saved here privately.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {audits.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          a.score >= 80
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : a.score >= 50
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {a.score}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-white truncate">{a.domain}</p>
                          <span className="text-[10px] text-muted-foreground border border-white/10 px-1.5 py-0.5 rounded">
                            {a.verdict}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                          <span>Critical: {a.criticalFindingsCount}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {onSelectAudit && (
                        <button
                          onClick={() => {
                            onSelectAudit(a);
                            onClose();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs hover:bg-primary/20 font-medium transition-colors"
                        >
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAudit(a.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete from Vault"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "notices" ? (
            notices.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border border-dashed border-white/10 bg-white/[0.01]">
                <FileText className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium text-white">No Legal Charters Saved Yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-sm text-white">{n.title}</p>
                      <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                        <span>Domain: {n.domain || "Global"}</span>
                        <span>Regime: {n.lawId}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "sync" ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm text-white">
                    Cloud Database Synchronization
                  </h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ASJi One is integrated with Google Cloud Firestore. Synchronize the
                  15-jurisdiction World Sovereign Laws Database directly to your Firestore instance.
                </p>
                {isAdmin && (
                  <div className="pt-2">
                    <button
                      onClick={handleSyncWorldLaws}
                      disabled={isSyncing}
                      className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                      {isSyncing
                        ? "Synchronizing to Cloud..."
                        : "Sync 15 Sovereign Laws to Firestore"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DATA PRIVACY & RIGHTS (DPDP ACT 2023 / GDPR) */
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 space-y-3">
                <h4 className="font-bold text-sm text-emerald-300 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-400" />
                  Download My Personal Data (JSON Export)
                </h4>
                <p className="text-emerald-100/80 leading-relaxed">
                  In compliance with Section 11 of the Digital Personal Data Protection Act, 2023 &
                  GDPR Article 15/20, you have the right to request a complete machine-readable copy
                  of your profile, audit records, saved legal charters, and consent records.
                </p>
                <button
                  onClick={handleDownloadMyData}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-xl border border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting Data..." : "Download My Data (.json)"}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 space-y-3">
                <h4 className="font-bold text-sm text-rose-300 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Delete My Account &amp; Data (Right to Erasure)
                </h4>
                <p className="text-rose-100/80 leading-relaxed">
                  Under Section 12 of India DPDP Act 2023 & GDPR Article 17, you have the statutory
                  right to withdraw consent and request the permanent erasure of your personal data,
                  saved scan reports, and user credentials.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-xl border border-rose-500/50 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account &amp; Data
                  </button>
                ) : (
                  <div className="p-3.5 rounded-xl border border-rose-500/60 bg-black/80 space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-rose-400 font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Confirm Permanent Account &amp; Data Erasure</span>
                    </div>
                    <p className="text-muted-foreground text-[11px]">
                      This action cannot be undone. All your private scan history, saved legal
                      charters, and account credentials will be immediately purged from Firestore.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleConfirmDeleteAccount}
                        disabled={isDeletingAccount}
                        className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all cursor-pointer"
                      >
                        {isDeletingAccount ? "Erasing Data..." : "Yes, Permanently Erase All Data"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3.5 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>DPDP Act 2023 &amp; GDPR Compliant Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
