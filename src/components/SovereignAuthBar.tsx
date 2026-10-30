import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Lock, LogOut, Database, Shield, KeyRound, User, CheckCircle2, X } from "lucide-react";
import { PrivateVaultModal } from "./PrivateVaultModal";
import { toast } from "sonner";

export function SovereignAuthBar() {
  const { user, loading, isAdmin, signInWithCredentials, logout, dbOnline, authError } = useAuth();
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    const success = signInWithCredentials(usernameInput, passwordInput);
    setIsAuthenticating(false);

    if (success) {
      toast.success("Secure Sovereign Authentication Granted", {
        description: "Private Firestore cloud persistence and admin clearance enabled.",
      });
      setIsLoginModalOpen(false);
      setUsernameInput("");
      setPasswordInput("");
    } else {
      toast.error("Authentication Failed", {
        description: authError || "Invalid username or master access passphrase.",
      });
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out of Sovereign Citadel.");
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
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
            title="Secure Sovereign Admin Sign-In"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin Sign-In</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            {/* User Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>

              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[11px] font-semibold text-white">{user.displayName}</span>
                <span className="text-[9px] text-amber-400 font-medium">👑 Sovereign Admin</span>
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

      {/* Secure Username / Password Admin Sign-In Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-primary/40 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-6">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary/20">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Sovereign Citadel Authentication
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                Enter your private administrator credentials to access command controls.
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4 font-mono text-xs">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Administrator Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Master Access Passphrase
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              {authError && (
                <p className="text-[11px] text-red-400 bg-red-500/10 border border-red-500/30 p-2.5 rounded-xl">
                  {authError}
                </p>
              )}

              <button
                type="submit"
                disabled={isAuthenticating}
                className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 font-mono text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-xl shadow-primary/20"
              >
                <span>{isAuthenticating ? "Authenticating..." : "Authorize Citadel Access"}</span>
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] font-mono text-muted-foreground border-t border-white/10">
              <p>🔒 Zero-Knowledge Private Architecture • Zero External Leakage</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
