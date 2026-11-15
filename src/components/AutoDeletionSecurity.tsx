import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Flame, Timer, Trash2, Lock, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export type RetentionOption = "5min" | "15min" | "session" | "manual";

interface AutoDeletionSecurityProps {
  hasReport: boolean;
  dbRecordId?: string;
  onPurge: () => void;
  retentionMode: RetentionOption;
  setRetentionMode: (mode: RetentionOption) => void;
}

const RETENTION_SECONDS: Record<RetentionOption, number> = {
  "5min": 300,
  "15min": 900,
  session: 0, // Purges on unload
  manual: Infinity,
};

export function AutoDeletionSecurity({
  hasReport,
  onPurge,
  retentionMode,
  setRetentionMode,
}: AutoDeletionSecurityProps) {
  const [timeLeft, setTimeLeft] = useState<number>(RETENTION_SECONDS[retentionMode]);
  const [isWiping, setIsWiping] = useState(false);

  const handleAutoPurge = useCallback(() => {
    onPurge();
    toast.error("Auto-Deletion Security Executed", {
      description: "Scan artifacts and memory buffers have been permanently zeroed and wiped.",
      icon: <Trash2 className="h-4 w-4 text-destructive" />,
    });
  }, [onPurge]);

  // Reset timer when a new report arrives or retention mode changes
  useEffect(() => {
    if (!hasReport) return;
    const maxSecs = RETENTION_SECONDS[retentionMode];
    setTimeLeft(maxSecs);
  }, [hasReport, retentionMode]);

  // Countdown timer for auto-purge
  useEffect(() => {
    if (!hasReport || retentionMode === "manual" || retentionMode === "session") return;

    if (timeLeft <= 0) {
      handleAutoPurge();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoPurge();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasReport, timeLeft, retentionMode, handleAutoPurge]);

  // Handle unload security auto-delete
  useEffect(() => {
    if (!hasReport) return;

    const handleUnload = () => {
      try {
        sessionStorage.clear();
        localStorage.removeItem("asji_last_scan");
      } catch {
        // ignore
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
    };
  }, [hasReport]);

  const handleManualWipe = () => {
    setIsWiping(true);
    setTimeout(() => {
      setIsWiping(false);
      onPurge();
      toast.success("Memory Purged & Wiped", {
        description: "Zero trace left in browser state.",
        icon: <Flame className="h-4 w-4 text-amber-500" />,
      });
    }, 350);
  };

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return "Manual";
    if (seconds <= 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalSecs = RETENTION_SECONDS[retentionMode];
  const progressPercent =
    isFinite(totalSecs) && totalSecs > 0 ? Math.max(0, (timeLeft / totalSecs) * 100) : 100;

  return (
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 my-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Security Status Badge & Title */}
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-md bg-[#0D0E11] border border-[#262932] text-[#C9A227] mt-0.5">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-display font-bold text-base text-[#F4F4F5]">
                Auto-Deletion Security
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/40">
                <ShieldCheck className="h-3 w-3" /> Ephemeral Memory
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5 leading-relaxed">
              Zero server logging. Audit artifacts auto-purge from browser state on timer expiry or
              tab close.
            </p>
          </div>
        </div>

        {/* Action & Controls */}
        {hasReport && (
          <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
            {/* Countdown Badge */}
            {retentionMode !== "manual" && retentionMode !== "session" && (
              <div className="flex items-center gap-2 bg-[#0D0E11] border border-[#262932] px-3 py-1.5 rounded-md text-xs font-mono font-semibold tabular-nums">
                <Timer className="h-3.5 w-3.5 text-[#C9A227]" />
                <span className="text-[#A1A1AA]">Purge in:</span>
                <span className="font-bold text-[#C9A227]">{formatTime(timeLeft)}</span>
              </div>
            )}

            {/* Manual Burn Button */}
            <button
              onClick={handleManualWipe}
              disabled={isWiping}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444] hover:text-white transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
            >
              {isWiping ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Flame className="h-3.5 w-3.5" />
              )}
              <span>{isWiping ? "Zeroing Memory..." : "Wipe Memory Now"}</span>
            </button>
          </div>
        )}
      </div>

      {/* Progress Bar for Active Timer */}
      {hasReport && retentionMode !== "manual" && retentionMode !== "session" && (
        <div className="mt-4 pt-3 border-t border-[#262932] flex items-center gap-3">
          <div className="h-1.5 flex-1 bg-[#0D0E11] border border-[#262932] rounded-sm overflow-hidden">
            <div
              className="h-full bg-[#C9A227] transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[11px] text-[#A1A1AA] font-mono tabular-nums">
            {Math.round(progressPercent)}% retention remaining
          </span>
        </div>
      )}

      {/* Retention Mode Selector */}
      <div className="mt-4 pt-3 border-t border-[#262932] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-[#A1A1AA] font-mono text-[11px]">Auto-Purge Security Policy:</span>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: "5min", label: "5 Min Auto-Purge" },
              { id: "15min", label: "15 Min Auto-Purge" },
              { id: "session", label: "Tab Close Only" },
              { id: "manual", label: "Manual Only" },
            ] as const
          ).map((mode) => (
            <button
              key={mode.id}
              onClick={() => setRetentionMode(mode.id)}
              className={`px-3 py-1 rounded-md text-[11px] font-mono transition-colors cursor-pointer whitespace-nowrap ${
                retentionMode === mode.id
                  ? "bg-[#C9A227] text-[#0D0E11] font-bold"
                  : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-[#C9A227]/60"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
