import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Lock, LogIn, LogOut, User, Database, Shield, ChevronDown } from "lucide-react";
import { PrivateVaultModal } from "./PrivateVaultModal";
import { toast } from "sonner";

export function SovereignAuthBar() {
  const { user, loading, isAdmin, signInWithGoogle, logout, dbOnline, authError } = useAuth();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      toast.success("Authenticated successfully. Private Firestore cloud persistence enabled.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("popup-closed-by-user")) {
        toast.error("Authentication note: " + msg);
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.info("Signed out. Local session active.");
    } catch {
      toast.error("Sign out encountered an error.");
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-24 rounded-lg bg-white/5 animate-pulse flex items-center justify-center">
        <span className="text-[10px] text-muted-foreground font-mono">Syncing...</span>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-2.5">
        {!user ? (
          <button
            onClick={handleSignIn}
            disabled={isSigningIn}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
            title="Sign in with Google to enable cloud persistence"
          >
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isSigningIn ? "Connecting..." : "Google Sign-In"}</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* User Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-white/10 bg-white/[0.03]">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || "User"}
                  className="w-6 h-6 rounded-full border border-primary/30 object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                  {user.email?.charAt(0).toUpperCase() || "U"}
                </div>
              )}

              <div className="hidden sm:flex flex-col text-left leading-tight max-w-[120px]">
                <span className="text-[11px] font-semibold text-white truncate">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                {isAdmin ? (
                  <span className="text-[9px] text-amber-400 font-medium">👑 Sovereign Lead</span>
                ) : (
                  <span className="text-[9px] text-emerald-400 font-mono">Cloud Active</span>
                )}
              </div>
            </div>

            {/* Private Vault Button */}
            <button
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Open Private Sovereign Vault"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Private Vault</span>
            </button>

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg border border-white/10 text-muted-foreground hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <PrivateVaultModal isOpen={isVaultOpen} onClose={() => setIsVaultOpen(false)} />
    </>
  );
}
