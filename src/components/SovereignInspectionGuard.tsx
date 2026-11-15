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

    toast.info("Sovereign Privacy Shield Active", {
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
        backgroundColor: "rgba(13, 14, 17, 0.96)",
        pointerEvents: "auto",
        padding: "1rem",
      }}
    >
      <div className="relative w-full max-w-lg rounded-md border border-[#EF4444]/50 bg-[#15171C] p-6 sm:p-8 text-[#F4F4F5] font-mono text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-md border border-[#EF4444]/40 bg-[#0D0E11] text-[#EF4444] mb-4">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <span className="inline-block rounded border border-[#EF4444]/40 bg-[#EF4444]/10 px-3 py-1 text-[11px] font-bold text-[#EF4444] uppercase tracking-widest mb-2">
          Statutory Security Lock
        </span>

        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#F4F4F5] tracking-wide">
          Code &amp; Privacy Encryption Shield
        </h2>

        <p className="mt-2 font-sans text-xs sm:text-sm text-[#A1A1AA] leading-relaxed">
          An unauthorized inspection shortcut or context extraction attempt was detected on this
          device. Sensitive client DOM nodes and cryptographic tokens have been temporarily
          isolated.
        </p>

        <div className="mt-5 rounded-md border border-[#262932] bg-[#0D0E11] p-3.5 text-left text-xs space-y-1.5 font-mono">
          <div className="flex justify-between text-[#A1A1AA]">
            <span>Security Incident ID:</span>
            <strong className="text-[#EF4444]">{incidentCode}</strong>
          </div>
          <div className="flex justify-between text-[#A1A1AA]">
            <span>Interception Timestamp:</span>
            <span className="text-[#F4F4F5]">
              {lockTimestamp.slice(0, 19).replace("T", " ")} UTC
            </span>
          </div>
          <div className="flex justify-between text-[#A1A1AA]">
            <span>Encryption Status:</span>
            <span className="text-[#10B981] font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 inline" /> Memory Obfuscated
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={unlockSession}
            className="btn-gold w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-xs font-bold cursor-pointer"
          >
            <KeyRound className="h-4 w-4" />
            <span>Verify &amp; Resume Secure Session</span>
          </button>
        </div>

        <p className="mt-4 text-[10px] text-[#71717A]">
          Under normal usage without inspection attempts, all platform audit tools operate with
          complete diagnostic visibility.
        </p>
      </div>
    </div>
  );
}
