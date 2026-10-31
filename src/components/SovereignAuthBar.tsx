import React, { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  Lock,
  LogOut,
  Database,
  Shield,
  KeyRound,
  User,
  X,
  Eye,
  EyeOff,
  ShieldAlert,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PrivateVaultModal } from "./PrivateVaultModal";
import { toast } from "sonner";

export function SovereignAuthBar() {
  const {
    user,
    loading,
    isAdmin,
    adminSignIn,
    signInWithGoogle,
    userSignIn,
    userSignUp,
    logout,
    authError,
    clearAuthError,
  } = useAuth();

  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    clearAuthError();
    try {
      await signInWithGoogle();
      toast.success("Google Sign-In Successful", {
        description: "Authenticated with Firebase Auth & Synced to Firestore.",
      });
      setIsLoginModalOpen(false);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication Failed.";
      toast.error("Sign-In Error", { description: msg });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticating(true);
    clearAuthError();

    try {
      if (authMode === "signin") {
        await userSignIn(emailInput, passwordInput);
        toast.success("Signed In Successfully", {
          description: "Authenticated with Firebase Auth & Cloud Firestore.",
        });
      } else {
        await userSignUp(emailInput, passwordInput, nameInput);
        toast.success("Account Created", {
          description: "User profile registered in Firebase & Cloud Firestore.",
        });
      }
      setIsLoginModalOpen(false);
      setEmailInput("");
      setPasswordInput("");
      setNameInput("");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication Failed.";
      toast.error("Authentication Error", { description: msg });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    toast.info("Signed out of ASJi One.");
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                clearAuthError();
                setAuthMode("signin");
                setIsLoginModalOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-primary/40 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
              title="Sign In / Register"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <Link
              to="/admin"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-white text-xs font-medium transition-all"
              title="Admin Citadel"
            >
              <Shield className="w-3 h-3 text-amber-400" />
              <span>Admin</span>
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {/* User Pill */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold overflow-hidden">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (user.displayName || user.email || "U").charAt(0).toUpperCase()
                )}
              </div>

              <div className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[11px] font-semibold text-white max-w-[130px] truncate">
                  {user.displayName || user.email}
                </span>
                {isAdmin ? (
                  <span className="text-[9px] text-amber-400 font-medium flex items-center gap-1">
                    👑 Citadel Admin
                  </span>
                ) : (
                  <span className="text-[9px] text-emerald-400 font-medium">🛡️ Authenticated</span>
                )}
              </div>
            </div>

            {/* If Admin, show link to Citadel Admin Panel */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-semibold transition-all shadow-sm"
                title="Open Sovereign Command Citadel"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Citadel</span>
              </Link>
            )}

            {/* Private Vault Button */}
            <button
              onClick={() => setIsVaultOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Open Private Vault"
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

      {/* Firebase Authentication Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-950 border border-primary/40 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative space-y-5">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mx-auto shadow-lg shadow-primary/20">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-bold text-white">
                Firebase Authentication
              </h2>
              <p className="text-xs font-mono text-muted-foreground">
                Google Sign-In • Cloud Firestore Persistence
              </p>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 py-3 px-4 text-xs font-semibold text-white transition-all cursor-pointer shadow-md hover:border-primary/50 disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9c-.2-.7-.4-1.5-.4-2.3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16C3.7 19.7 7.5 22.3 12 22.3z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center py-1">
              <div className="w-full border-t border-white/10" />
              <span className="absolute bg-neutral-950 px-3 text-[10px] text-muted-foreground uppercase font-mono tracking-widest">
                OR WITH EMAIL
              </span>
            </div>

            {/* Auth Mode Toggle */}
            <div className="flex rounded-xl bg-white/5 p-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setAuthMode("signin");
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                  authMode === "signin"
                    ? "bg-primary text-black font-bold shadow-md"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAuthError();
                  setAuthMode("signup");
                }}
                className={`flex-1 py-1.5 rounded-lg transition-all font-semibold cursor-pointer ${
                  authMode === "signup"
                    ? "bg-primary text-black font-bold shadow-md"
                    : "text-muted-foreground hover:text-white"
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3.5 font-mono text-xs">
              {authMode === "signup" && (
                <div>
                  <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      placeholder="Aarush Sharma"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="user@domain.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-3 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-10 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-2.5 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
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
                <span>
                  {isAuthenticating
                    ? "Authenticating..."
                    : authMode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                </span>
              </button>
            </form>

            <div className="pt-2 text-center text-[10px] font-mono text-muted-foreground border-t border-white/10">
              <p>🔒 Firebase Auth • Cloud Firestore Data Isolation</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
