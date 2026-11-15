import { useState, useEffect, useCallback } from "react";
import { Database, Trash2, Clock, CheckCircle2, RefreshCw, FileText, Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getSavedAudits, purgeDatabase, getAuditById } from "@/lib/audit.functions";
import { useAuth } from "@/lib/auth-context";
import type { AuditReport } from "@/lib/audit-types";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SavedAuditsDrawerProps {
  onSelectAudit: (report: AuditReport) => void;
  onPurgeComplete: () => void;
  currentReportId?: string;
}

export function SavedAuditsDrawer({
  onSelectAudit,
  onPurgeComplete,
  currentReportId,
}: SavedAuditsDrawerProps) {
  const { fbUser, isAdmin } = useAuth();
  const [open, setOpen] = useState(false);
  const [audits, setAudits] = useState<
    { id: string; target: string; score: number; savedAt: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [purging, setPurging] = useState(false);

  const fetchAuditsFn = useServerFn(getSavedAudits);
  const fetchAuditByIdFn = useServerFn(getAuditById);
  const purgeDbFn = useServerFn(purgeDatabase);

  const loadSavedAudits = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAuditsFn();
      setAudits(data || []);
    } catch (err) {
      console.error("Failed to fetch saved audits", err);
    } finally {
      setLoading(false);
    }
  }, [fetchAuditsFn]);

  useEffect(() => {
    if (open) {
      loadSavedAudits();
    }
  }, [open, loadSavedAudits]);

  const handleSelect = async (id: string) => {
    try {
      const report = await fetchAuditByIdFn({ data: { id } });
      if (report) {
        onSelectAudit(report);
        setOpen(false);
        toast.success("Loaded saved audit report from backend database");
      }
    } catch {
      toast.error("Could not load report record");
    }
  };

  const handlePurgeAll = async () => {
    if (!isAdmin || !fbUser) {
      toast.error("Master Administrator sign-in required to purge server records.");
      return;
    }
    setPurging(true);
    try {
      const idToken = await fbUser.getIdToken();
      await purgeDbFn({ data: { idToken } });
      setAudits([]);
      onPurgeComplete();
      toast.error("Backend Database Wiped & Zeroed", {
        description: "All stored compliance records and buffers have been permanently destroyed.",
        icon: <Trash2 className="h-4 w-4 text-destructive" />,
      });
      setOpen(false);
    } catch {
      toast.error("Failed to purge backend database");
    } finally {
      setPurging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-2 rounded-md border border-[#262932] bg-[#15171C] px-3 py-1.5 text-xs font-medium text-[#C9A227] hover:border-[#C9A227] transition-colors cursor-pointer whitespace-nowrap">
          <Database className="h-3.5 w-3.5" />
          <span>Backend Database</span>
          {audits.length > 0 && (
            <span className="font-mono text-[11px] font-bold text-[#F4F4F5] tabular-nums">
              ({audits.length})
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl bg-[#15171C] border border-[#262932] text-[#F4F4F5]">
        <DialogHeader>
          <div className="flex items-center gap-2 text-[#C9A227]">
            <Database className="h-5 w-5" />
            <DialogTitle className="font-display text-[#F4F4F5]">
              Backend Secure Database Records
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-[#A1A1AA] mt-1">
            Audit scans are held in isolated server storage. Records persist strictly until you
            trigger a purge operation.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-3">
          <div className="flex items-center justify-between rounded-md border border-[#262932] bg-[#0D0E11] p-3 text-xs text-[#A1A1AA]">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-[#10B981] shrink-0" />
              <span>
                <strong className="text-[#F4F4F5]">Zero-Trace Security:</strong> Click Purge to
                zero-fill and delete all database records.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedAudits}
              disabled={loading}
              className="h-7 px-2 text-xs border-[#262932] bg-[#15171C] hover:border-[#C9A227]"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs font-mono text-[#A1A1AA]">
              Reading backend database records...
            </div>
          ) : audits.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#71717A]">
              No audit records currently stored in backend database.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {audits.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleSelect(record.id)}
                  className={`flex items-center justify-between p-3 rounded-md border transition-colors cursor-pointer ${
                    currentReportId === record.id
                      ? "border-[#C9A227] bg-[#0D0E11]"
                      : "border-[#262932] bg-[#0D0E11] hover:border-[#C9A227]/60"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
                      <p className="text-xs font-semibold truncate text-[#F4F4F5]">
                        {record.target}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] font-mono text-[#A1A1AA] tabular-nums">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(record.savedAt).toLocaleTimeString()}
                      </span>
                      <span className="font-bold text-[#F4F4F5]">Score: {record.score}/100</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-[#C9A227] font-semibold hover:underline ml-2">
                    Load
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-[#262932] pt-3 mt-2">
          <span className="text-[11px] text-[#A1A1AA] font-mono tabular-nums">
            {audits.length} record(s) in backend storage
          </span>
          {isAdmin ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handlePurgeAll}
              disabled={purging || audits.length === 0}
              className="gap-1.5 text-xs bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {purging ? "Purging & Zeroing..." : "Purge All DB Records"}
            </Button>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA]">
              <Lock className="h-3 w-3 text-[#C9A227]" /> Admin-Protected Storage
            </span>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
