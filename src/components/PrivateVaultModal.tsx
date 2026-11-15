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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0E11]/90 p-4 animate-in fade-in duration-200"
    >
      <div
        id="private_vault_modal_container"
        className="relative w-full max-w-3xl rounded-md border border-[#262932] bg-[#15171C] p-6 text-[#F4F4F5] flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#262932]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-[#0D0E11] border border-[#262932] text-[#C9A227]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg font-bold font-display text-[#F4F4F5]">
                  Private Compliance Vault
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/40 font-bold">
                  Encrypted Firestore
                </span>
              </div>
              <p className="text-xs text-[#A1A1AA]">
                Dedicated ledger for {user?.email || "Authenticated User"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Vault"
            className="p-1.5 rounded-md border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-[#262932] text-xs font-medium flex-wrap">
          <button
            onClick={() => setActiveTab("audits")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "audits"
                ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            Private Audits ({audits.length})
          </button>
          <button
            onClick={() => setActiveTab("notices")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "notices"
                ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Saved Legal Charters ({notices.length})
          </button>
          <button
            onClick={() => setActiveTab("sync")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "sync"
                ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Cloud Database
          </button>
          <button
            onClick={() => setActiveTab("privacy")}
            className={`px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === "privacy"
                ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Data Rights (DPDP/GDPR)
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#A1A1AA]">
              <RefreshCw className="w-6 h-6 animate-spin text-[#C9A227]" />
              <p className="text-xs font-mono">Synchronizing private records from Firestore...</p>
            </div>
          ) : activeTab === "audits" ? (
            audits.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-md border border-dashed border-[#262932] bg-[#0D0E11]">
                <Shield className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#F4F4F5]">No Private Audits Recorded Yet</p>
                <p className="text-xs text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                  When you execute a statutory scan while signed in, your full evidence dossier and
                  verdict are saved here privately.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {audits.map((a) => (
                  <div
                    key={a.id}
                    className="p-3.5 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227]/60 transition-colors flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-md flex items-center justify-center font-mono font-bold text-xs shrink-0 tabular-nums border ${
                          a.score >= 80
                            ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/40"
                            : a.score >= 50
                              ? "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/40"
                              : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/40"
                        }`}
                      >
                        {a.score}
                      </div>
                      <div className="truncate">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-[#F4F4F5] truncate">
                            {a.domain}
                          </p>
                          <span className="text-[11px] font-mono text-[#A1A1AA]">{a.verdict}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-mono text-[#71717A] mt-0.5">
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
                          className="px-2.5 py-1.5 rounded-md bg-[#15171C] border border-[#262932] text-[#C9A227] text-xs hover:border-[#C9A227] font-medium transition-colors cursor-pointer"
                        >
                          View
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteAudit(a.id)}
                        className="p-1.5 rounded-md text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
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
              <div className="text-center py-12 px-4 rounded-md border border-dashed border-[#262932] bg-[#0D0E11]">
                <FileText className="w-8 h-8 text-[#71717A] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#F4F4F5]">No Legal Charters Saved Yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notices.map((n) => (
                  <div
                    key={n.id}
                    className="p-3.5 rounded-md border border-[#262932] bg-[#0D0E11] flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="font-semibold text-sm text-[#F4F4F5]">{n.title}</p>
                      <div className="flex items-center gap-3 text-[11px] font-mono text-[#A1A1AA] mt-0.5">
                        <span>Domain: {n.domain || "Global"}</span>
                        <span aria-hidden="true">·</span>
                        <span>Regime: {n.lawId}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNotice(n.id)}
                      className="p-1.5 rounded-md text-[#71717A] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : activeTab === "sync" ? (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-md border border-[#262932] bg-[#0D0E11] space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-[#C9A227]" />
                  <h4 className="font-semibold text-sm text-[#F4F4F5]">
                    Cloud Database Synchronization
                  </h4>
                </div>
                <p className="text-[#A1A1AA] leading-relaxed">
                  ASJi One is integrated with Google Cloud Firestore. Synchronize the
                  15-jurisdiction World Sovereign Laws Database directly to your Firestore instance.
                </p>
                {isAdmin && (
                  <div className="pt-2">
                    <button
                      onClick={handleSyncWorldLaws}
                      disabled={isSyncing}
                      className="btn-gold px-4 py-2 rounded-md font-semibold flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
              <div className="p-4 rounded-md border border-[#262932] bg-[#0D0E11] space-y-3">
                <h4 className="font-bold text-sm text-[#10B981] flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download My Personal Data (JSON Export)
                </h4>
                <p className="text-[#A1A1AA] leading-relaxed">
                  In compliance with Section 11 of the Digital Personal Data Protection Act, 2023
                  &amp; GDPR Article 15/20, you have the right to request a complete
                  machine-readable copy of your profile, audit records, saved legal charters, and
                  consent records.
                </p>
                <button
                  onClick={handleDownloadMyData}
                  disabled={isExporting}
                  className="px-4 py-2 rounded-md border border-[#10B981]/40 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#10B981] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Exporting Data..." : "Download My Data (.json)"}
                </button>
              </div>

              <div className="p-4 rounded-md border border-[#262932] bg-[#0D0E11] space-y-3">
                <h4 className="font-bold text-sm text-[#EF4444] flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Delete My Account &amp; Data (Right to Erasure)
                </h4>
                <p className="text-[#A1A1AA] leading-relaxed">
                  Under Section 12 of India DPDP Act 2023 &amp; GDPR Article 17, you have the
                  statutory right to withdraw consent and request the permanent erasure of your
                  personal data, saved scan reports, and user credentials.
                </p>

                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-[#EF4444] font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete My Account &amp; Data
                  </button>
                ) : (
                  <div className="p-3.5 rounded-md border border-[#EF4444]/50 bg-[#15171C] space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-[#EF4444] font-bold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>Confirm Permanent Account &amp; Data Erasure</span>
                    </div>
                    <p className="text-[#A1A1AA] text-[11px]">
                      This action cannot be undone. All your private scan history, saved legal
                      charters, and account credentials will be immediately purged from Firestore.
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleConfirmDeleteAccount}
                        disabled={isDeletingAccount}
                        className="px-3.5 py-1.5 rounded-md bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        {isDeletingAccount ? "Erasing Data..." : "Yes, Permanently Erase All Data"}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3.5 py-1.5 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] text-[#F4F4F5] text-xs transition-colors cursor-pointer"
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
        <div className="pt-3 border-t border-[#262932] flex items-center justify-between text-xs text-[#A1A1AA]">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
            <span>DPDP Act 2023 &amp; GDPR Compliant Ledger</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] text-[#F4F4F5] font-medium transition-colors cursor-pointer"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
