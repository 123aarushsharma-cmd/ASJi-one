import { useState, useEffect, useCallback } from "react";
import { Database, Trash2, Clock, CheckCircle2, RefreshCw, FileText, Lock } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { getSavedAudits, purgeDatabase, getAuditById } from "@/lib/audit.functions";
import type { AuditReport } from "@/lib/audit-pipeline.server";
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
    setPurging(true);
    try {
      await purgeDbFn();
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
        <button className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors">
          <Database className="h-3.5 w-3.5" />
          <span>Backend Database</span>
          {audits.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-primary/20 px-1 text-[10px] font-bold text-primary">
              {audits.length}
            </span>
          )}
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-xl bg-background border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary">
            <Database className="h-5 w-5" />
            <DialogTitle>Backend Secure Database Records</DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Audit scans are securely held in isolated server database storage. Records persist
            strictly until you trigger a purge operation.
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-border/80 bg-muted/40 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Zero-Trace Security:</strong> Click Purge to zero-fill and delete all
                database records.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSavedAudits}
              disabled={loading}
              className="h-7 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Reading backend database records...
            </div>
          ) : audits.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No audit records currently stored in backend database.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {audits.map((record) => (
                <div
                  key={record.id}
                  onClick={() => handleSelect(record.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                    currentReportId === record.id
                      ? "border-primary bg-primary/10"
                      : "border-border/60 bg-card hover:border-primary/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                      <p className="text-xs font-semibold truncate text-foreground">
                        {record.target}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-sans font-medium">
                        <Clock className="h-3 w-3" />
                        {new Date(record.savedAt).toLocaleTimeString()}
                      </span>
                      <span className="font-sans text-xs font-bold text-foreground">
                        Score: {record.score}/100
                      </span>
                    </div>
                  </div>

                  <span className="text-xs text-primary font-medium hover:underline ml-2">
                    Load
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-3 mt-2">
          <span className="text-[11px] text-muted-foreground font-sans font-medium">
            {audits.length} record(s) in backend storage
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={handlePurgeAll}
            disabled={purging || audits.length === 0}
            className="gap-1.5 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {purging ? "Purging & Zeroing..." : "Purge All DB Records"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
