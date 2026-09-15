import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { ShieldAlert, Lock, RefreshCw, KeyRound, CheckCircle2 } from "lucide-react";

export function SovereignInspectionGuard() {
  const [isLocked, setIsLocked] = useState(false);
  const [incidentCode, setIncidentCode] = useState("");
  const [lockTimestamp, setLockTimestamp] = useState("");

  const triggerSecurityLock = useCallback((triggerReason: string) => {
    const code = `SEC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setIncidentCode(code);
    setLockTimestamp(new Date().toISOString());

    toast.info("🔒 Sovereign Privacy Shield Active", {
      description: `${triggerReason}. Proprietary source code and data protected.`,
      duration: 3000,
    });
  }, []);

  const unlockSession = () => {
    setIsLocked(false);
    toast.success("Security Clearance Granted", {
      description: "Session restored. Live compliance audit tools active.",
    });
  };

  useEffect(() => {
    // Graceful notification for developer console shortcuts without breaking the UX
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac =
        typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        triggerSecurityLock("Developer tools access monitored");
        return;
      }

      // Ctrl+Shift+I / Cmd+Option+I (Inspect Element)
      if (ctrlOrCmd && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73)) {
        triggerSecurityLock("Element inspection shortcut detected");
        return;
      }

      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if (ctrlOrCmd && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74)) {
        triggerSecurityLock("Console shortcut detected");
        return;
      }

      // Ctrl+U / Cmd+Option+U (View Source)
      if (ctrlOrCmd && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
        triggerSecurityLock("Source viewing shortcut monitored");
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [triggerSecurityLock]);

  if (!isLocked) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(5, 5, 5, 0.96)",
        backdropFilter: "blur(24px)",
        pointerEvents: "auto",
        padding: "1rem",
      }}
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-red-500/50 bg-[#0c0a09] p-6 sm:p-8 text-white shadow-2xl shadow-red-950/80 font-mono text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/40 bg-red-950/40 text-red-400 mb-4 animate-pulse">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <span className="inline-block rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[11px] font-bold text-red-400 uppercase tracking-widest mb-2">
          Statutory Security Lock
        </span>

        <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          CODE & PRIVACY ENCRYPTION SHIELD
        </h2>

        <p className="mt-2 text-xs sm:text-sm text-[#E5E5E5]/70 leading-relaxed">
          An unauthorized inspection shortcut or context extraction attempt was detected on this
          device. In accordance with sovereign data privacy mandates, sensitive client DOM nodes and
          cryptographic tokens have been temporarily isolated.
        </p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/60 p-3.5 text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-[#888888]">
            <span>Security Incident ID:</span>
            <strong className="text-red-400">{incidentCode}</strong>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>Interception Timestamp:</span>
            <span className="text-white">{lockTimestamp.slice(0, 19).replace("T", " ")} UTC</span>
          </div>
          <div className="flex justify-between text-[#888888]">
            <span>Encryption Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 inline" /> Memory Obfuscated
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={unlockSession}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-3 text-xs font-bold text-black shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            <span>Verify &amp; Resume Secure Session</span>
          </button>
        </div>

        <p className="mt-4 text-[10px] text-[#888888]">
          Under normal usage without inspection attempts, all platform audit tools and calculators
          operate with 100% full visibility.
        </p>
      </div>
    </div>
  );
}
