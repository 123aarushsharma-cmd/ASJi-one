import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Settings2, Check, X, Lock } from "lucide-react";

export type ConsentChoice = "Accepted" | "Rejected" | "Managed";
export type ConsentStatus = "pending" | "Accepted" | "Rejected" | "Managed";

export interface CookieCategory {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

export interface CookieConsentDecision {
  version: string;
  choice: ConsentChoice;
  status?: ConsentStatus;
  timestamp: string;
  categories: CookieCategory;
}

export const COOKIE_CONSENT_STORAGE_KEY = "asji_cookie_consent_decision";
export const COOKIE_CONSENT_VERSION = "1.0";
export const COOKIE_CONSENT_UPDATED_EVENT = "asji_cookie_consent_updated";
export const OPEN_COOKIE_PREFERENCES_EVENT = "asji_open_cookie_preferences";
export const COOKIE_BANNER_STATE_EVENT = "asji_cookie_banner_state";

// Extend window interface for gated analytics declarations
declare global {
  interface Window {
    asji_analytics_allowed?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Gate potential analytics scripts strictly behind affirmative consent
 */
export function applyAnalyticsScriptGating(analyticsAllowed: boolean) {
  if (typeof window === "undefined") return;

  window.asji_analytics_allowed = analyticsAllowed;

  if (analyticsAllowed) {
    // 1. Signal consent granted to dataLayer/gtag if integrated
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }

    // 2. Dispatch custom event for client-side analytics listeners
    window.dispatchEvent(
      new CustomEvent("asji_analytics_enabled", {
        detail: { timestamp: new Date().toISOString() },
      }),
    );
  } else {
    // 1. Signal consent denied to dataLayer/gtag
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }

    // 2. Dispatch custom event informing modules that analytics is strictly blocked
    window.dispatchEvent(
      new CustomEvent("asji_analytics_disabled", {
        detail: { timestamp: new Date().toISOString() },
      }),
    );
  }
}

/**
 * Retrieve saved consent decision from localStorage
 */
export function getStoredConsent(): CookieConsentDecision | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CookieConsentDecision;
    if (parsed && typeof parsed === "object" && parsed.categories) {
      return parsed;
    }
  } catch {
    // Graceful fallback for restricted environments
  }
  return null;
}

/**
 * Persist consent decision into localStorage and apply analytics script gating
 */
export function saveStoredConsent(
  choice: ConsentChoice,
  categories: Partial<CookieCategory>,
): CookieConsentDecision {
  const isAnalyticsGranted = choice === "Accepted" || Boolean(categories.analytics);

  const decision: CookieConsentDecision = {
    version: COOKIE_CONSENT_VERSION,
    choice,
    status: choice,
    timestamp: new Date().toISOString(),
    categories: {
      necessary: true,
      analytics: isAnalyticsGranted,
      marketing: choice === "Accepted" || Boolean(categories.marketing),
      preferences: choice === "Accepted" || Boolean(categories.preferences),
    },
  };

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(decision));
      sessionStorage.setItem("asji_cookie_dismissed", "true");
    } catch {
      // Safe fallback
    }

    // Apply analytics script gating state immediately
    applyAnalyticsScriptGating(isAnalyticsGranted);

    // Notify application observers of consent update
    window.dispatchEvent(new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: decision }));
  }

  return decision;
}

/**
 * Check whether analytics script execution is currently authorized
 */
export function isAnalyticsConsentGranted(): boolean {
  const decision = getStoredConsent();
  return Boolean(decision?.categories.analytics);
}

/**
 * Helper to programmatically open the Cookie Preferences modal
 */
export function openCookiePreferencesModal(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(OPEN_COOKIE_PREFERENCES_EVENT));
  }
}

/**
 * CookieConsent Component
 * Displays a responsive, non-intrusive bottom banner with gold accents.
 * Gates potential analytics scripts behind 'Accepted', 'Rejected', or 'Managed' state.
 */
export function CookieConsent() {
  const [showBanner, setShowBanner] = useState<boolean>(false);
  const [showManageModal, setShowManageModal] = useState<boolean>(false);
  const [categories, setCategories] = useState<CookieCategory>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  const bannerRef = useRef<HTMLElement>(null);

  // Initialize consent state and apply analytics gating on mount
  useEffect(() => {
    const stored = getStoredConsent();
    if (stored) {
      setCategories(stored.categories);
      setShowBanner(false);
      // Synchronize analytics gating with stored preference
      applyAnalyticsScriptGating(Boolean(stored.categories.analytics));
    } else {
      // New visitor: Show banner immediately and gate analytics OFF by default
      setShowBanner(true);
      applyAnalyticsScriptGating(false);
    }

    // Global listener for "Cookie Settings" trigger (e.g. from footer)
    const handleOpenManage = () => {
      const current = getStoredConsent();
      if (current) {
        setCategories(current.categories);
      }
      setShowManageModal(true);
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenManage);
    return () => {
      window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpenManage);
    };
  }, []);

  // Handle choice selection: 'Accepted', 'Rejected', or 'Managed'
  const handleChoice = useCallback((choice: ConsentChoice) => {
    if (choice === "Accepted") {
      const fullConsent: CookieCategory = {
        necessary: true,
        analytics: true,
        marketing: true,
        preferences: true,
      };
      saveStoredConsent("Accepted", fullConsent);
      setCategories(fullConsent);
      setShowBanner(false);
      setShowManageModal(false);
    } else if (choice === "Rejected") {
      const essentialOnly: CookieCategory = {
        necessary: true,
        analytics: false,
        marketing: false,
        preferences: false,
      };
      saveStoredConsent("Rejected", essentialOnly);
      setCategories(essentialOnly);
      setShowBanner(false);
      setShowManageModal(false);
    } else if (choice === "Managed") {
      setShowManageModal(true);
    }
  }, []);

  // Save granular custom preferences from the Managed modal
  const handleSaveManaged = useCallback(() => {
    saveStoredConsent("Managed", categories);
    setShowBanner(false);
    setShowManageModal(false);
  }, [categories]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. RESPONSIVE NON-INTRUSIVE BOTTOM BANNER (Mobile/Tablet/Desktop) */}
      {/* ============================================================ */}
      {showBanner && !showManageModal && (
        <aside
          ref={bannerRef}
          role="region"
          aria-label="Privacy and Cookie Consent Notice"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 50,
            paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
            paddingLeft: "max(12px, env(safe-area-inset-left, 12px))",
            paddingRight: "max(12px, env(safe-area-inset-right, 12px))",
            touchAction: "manipulation",
          }}
          className="max-h-[85vh] overflow-y-auto border-t border-[#D4AF37]/35 bg-[#0c0a09]/95 px-3.5 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all sm:px-6 sm:py-4"
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">
            {/* Title, Badge & Statutory Notice */}
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-sm font-bold tracking-tight text-foreground sm:text-base">
                    Privacy &amp; Cookie Consent
                  </h3>
                  <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-semibold text-[#D4AF37]">
                    DPDP · GDPR · CPRA Compliant
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground sm:text-[13px] md:max-w-2xl lg:max-w-3xl">
                  We require your consent before deploying optional analytics or marketing cookies.
                  Strictly necessary cookies for security and system integrity are active by
                  default. You can accept all, reject optional cookies, or customize your
                  preferences. Review our{" "}
                  <Link
                    to="/legal/privacy"
                    className="font-medium text-[#D4AF37] underline underline-offset-2 hover:text-[#e5c158]"
                  >
                    Privacy Notice
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/legal/cookies"
                    className="font-medium text-[#D4AF37] underline underline-offset-2 hover:text-[#e5c158]"
                  >
                    Cookie Policy
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Action Buttons: Responsive for Mobile Touch (<640px), Tablets (640px-1024px), & Desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5 sm:pt-0 shrink-0">
              <button
                type="button"
                onClick={() => handleChoice("Accepted")}
                className="inline-flex min-h-[44px] sm:min-h-[38px] items-center justify-center rounded-lg bg-[#D4AF37] px-4 py-2 text-xs font-bold text-black shadow-md transition-all hover:bg-[#c49f2f] hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
              >
                Accept All
              </button>
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleChoice("Rejected")}
                  className="inline-flex min-h-[44px] sm:min-h-[38px] items-center justify-center rounded-lg border border-border/80 bg-secondary/80 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:bg-secondary active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice("Managed")}
                  className="inline-flex min-h-[44px] sm:min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-transparent px-3.5 py-2 text-xs font-semibold text-[#D4AF37] transition-all hover:bg-[#D4AF37]/10 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] cursor-pointer"
                >
                  <Settings2 className="h-3.5 w-3.5 shrink-0" />
                  <span>Preferences</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* ============================================================ */}
      {/* 2. MANAGED PREFERENCES MODAL (Mobile & Tablet Adaptive)     */}
      {/* ============================================================ */}
      {showManageModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 70,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(5, 5, 5, 0.85)",
            backdropFilter: "blur(8px)",
            padding: "12px",
            paddingBottom: "max(14px, env(safe-area-inset-bottom, 14px))",
            paddingTop: "max(14px, env(safe-area-inset-top, 14px))",
          }}
          className="animate-in fade-in duration-200"
          onClick={() => setShowManageModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92dvh] sm:max-h-[85vh] w-full max-w-lg md:max-w-xl flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#0c0a09] shadow-2xl shadow-black/90"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/60 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37] shrink-0">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="font-serif text-sm sm:text-base md:text-lg font-bold text-foreground"
                  >
                    Manage Privacy Preferences
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                    Customize your data protection &amp; script gating choices
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-lg p-1 text-muted-foreground hover:bg-secondary hover:text-foreground focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/60 cursor-pointer"
                aria-label="Close preferences"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Categories */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3 sm:px-6 sm:py-4 sm:space-y-3.5 text-left">
              <p className="text-xs leading-relaxed text-muted-foreground">
                We respect your personal privacy rights under global regulations including GDPR,
                India DPDP Act 2023, and CPRA. Analytics and advertising scripts are gated and only
                execute if authorized below.
              </p>

              {/* 1. Necessary (Always Active) */}
              <div className="rounded-xl border border-border/60 bg-secondary/30 p-3 sm:p-3.5 transition-colors">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        Necessary (Essential)
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400">
                        <Lock className="h-2.5 w-2.5" />
                        Always Active
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground">
                      Essential for core platform security, session integrity, cryptographic
                      verification, and site operation. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex h-6 w-6 sm:h-5 sm:w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* 2. Analytics (Gated behind consent) */}
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 sm:p-3.5 transition-colors hover:border-[#D4AF37]/30">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="pr-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        Analytics
                      </span>
                      <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.2 text-[9px] text-primary">
                        Script Gated
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground">
                      Collects aggregated, non-identifying telemetry to measure platform usage,
                      diagnose system latency, and improve compliance tools. Gated behind consent.
                    </p>
                  </div>
                  <label className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={categories.analytics}
                      onChange={(e) =>
                        setCategories((prev) => ({ ...prev, analytics: e.target.checked }))
                      }
                      className="peer sr-only"
                      aria-label="Toggle Analytics Cookies"
                    />
                    <div className="h-6 w-11 rounded-full bg-secondary peer-focus:ring-2 peer-focus:ring-[#D4AF37] peer-checked:bg-[#D4AF37] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* 3. Marketing (Gated behind consent) */}
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 sm:p-3.5 transition-colors hover:border-[#D4AF37]/30">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="pr-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-foreground">
                        Marketing
                      </span>
                      <span className="rounded border border-primary/20 bg-primary/5 px-1.5 py-0.2 text-[9px] text-primary">
                        Script Gated
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground">
                      Allows non-invasive regulatory alerts, feature announcements, and relevant
                      statutory compliance advisory updates.
                    </p>
                  </div>
                  <label className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={categories.marketing}
                      onChange={(e) =>
                        setCategories((prev) => ({ ...prev, marketing: e.target.checked }))
                      }
                      className="peer sr-only"
                      aria-label="Toggle Marketing Cookies"
                    />
                    <div className="h-6 w-11 rounded-full bg-secondary peer-focus:ring-2 peer-focus:ring-[#D4AF37] peer-checked:bg-[#D4AF37] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* 4. Preferences (Optional) */}
              <div className="rounded-xl border border-border/60 bg-secondary/20 p-3 sm:p-3.5 transition-colors hover:border-[#D4AF37]/30">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="pr-1">
                    <span className="text-xs sm:text-sm font-bold text-foreground">
                      Preferences
                    </span>
                    <p className="mt-1 text-[10px] sm:text-[11px] leading-relaxed text-muted-foreground">
                      Remembers your jurisdiction filters, theme preferences, and legal matrix
                      customizations for future sessions.
                    </p>
                  </div>
                  <label className="relative inline-flex min-h-[44px] min-w-[44px] shrink-0 cursor-pointer items-center justify-center">
                    <input
                      type="checkbox"
                      checked={categories.preferences}
                      onChange={(e) =>
                        setCategories((prev) => ({ ...prev, preferences: e.target.checked }))
                      }
                      className="peer sr-only"
                      aria-label="Toggle Preferences Cookies"
                    />
                    <div className="h-6 w-11 rounded-full bg-secondary peer-focus:ring-2 peer-focus:ring-[#D4AF37] peer-checked:bg-[#D4AF37] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer: Responsive Mobile & Tablet Layout */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-border/60 bg-[#090807] px-4 py-3 sm:px-6 sm:py-3.5">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleChoice("Rejected")}
                  className="inline-flex min-h-[42px] sm:min-h-[36px] items-center justify-center rounded-lg border border-border bg-secondary/60 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary cursor-pointer"
                >
                  Reject Optional
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice("Accepted")}
                  className="inline-flex min-h-[42px] sm:min-h-[36px] items-center justify-center rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-medium text-[#D4AF37] hover:bg-[#D4AF37]/20 cursor-pointer"
                >
                  Accept All
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveManaged}
                className="inline-flex min-h-[42px] sm:min-h-[36px] items-center justify-center rounded-lg bg-[#D4AF37] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#c49f2f] shadow-md cursor-pointer w-full sm:w-auto"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default CookieConsent;
