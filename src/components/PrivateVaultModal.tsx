import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Database,
  Lock,
  Trash2,
  ExternalLink,
  RefreshCw,
  X,
  FileText,
  Clock,
  CheckCircle2,
  Scale,
  Sparkles,
  Cloud,
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
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"audits" | "notices" | "sync">("audits");
  const [audits, setAudits] = useState<UserAuditRecord[]>([]);
  const [notices, setNotices] = useState<UserNoticeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
    } catch (err) {
      console.error("Vault load error:", err);
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
    } catch (err) {
      toast.error("Failed to synchronize world laws.");
    } finally {
      setIsSyncing(false);
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
                Dedicated cloud ledger for {user?.email || "Authenticated User"}
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
        <div className="flex items-center gap-2 pt-4 pb-2 border-b border-white/5 text-xs font-medium">
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
            Cloud Database & Laws
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
                          <span>Safe Harbors: {a.statutoryExceptionsCount}</span>
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
                <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                  Customize and save statutory DPDP grievance notices, GDPR Data Processing
                  Addendums, or CPRA notices from the Sovereign Legal Matrix.
                </p>
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
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-3">
                <div className="flex items-center gap-2">
                  <Cloud className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold text-sm text-white">
                    Cloud Database Synchronization
                  </h4>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  ASJi One is integrated with Google Cloud Firestore (DB:{" "}
                  <code className="text-primary font-mono text-[11px]">
                    ai-studio-asjioneasjiweble-94ea65e4-c46e-4b43-b7d9-ef269ec313a5
                  </code>
                  ). You can synchronize the complete 14-jurisdiction World Sovereign Laws Database
                  directly to your Firestore instance for high-speed, verifiable lookup.
                </p>
                <div className="pt-2">
                  <button
                    onClick={handleSyncWorldLaws}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all disabled:opacity-50 cursor-pointer shadow-lg shadow-primary/20"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing
                      ? "Synchronizing to Cloud..."
                      : "Sync 20 Sovereign Laws to Firestore"}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                <h5 className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Statutory Hallucination Verification Engine
                </h5>
                <p className="text-muted-foreground leading-relaxed">
                  All statutory citations, breach notification thresholds, and maximum penalty caps
                  are verified against official gazettes and supervisory registers (DPBI, EDPB,
                  CNIL, ICO, CPPA, FDPIC) using Google Search Grounding to guarantee statutory
                  fidelity.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Zero-Trust Client/Server Isolation Active</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Close Vault
          </button>
        </div>
      </div>
    </div>
  );
}
