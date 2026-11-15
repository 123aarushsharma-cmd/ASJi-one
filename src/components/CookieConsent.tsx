import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { Shield, Settings2, Check, X, Lock } from "lucide-react";
import { saveConsentRecord } from "@/lib/firestore-service";

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
export const COOKIE_CONSENT_VERSION = "2026.3";
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
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.categories &&
      parsed.version === COOKIE_CONSENT_VERSION
    ) {
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
      saveConsentRecord("Accepted", fullConsent, COOKIE_CONSENT_VERSION).catch(() => {});
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
      saveConsentRecord("Rejected", essentialOnly, COOKIE_CONSENT_VERSION).catch(() => {});
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
    saveConsentRecord("Managed", categories, COOKIE_CONSENT_VERSION).catch(() => {});
    setShowBanner(false);
    setShowManageModal(false);
  }, [categories]);

  return (
    <>
      {/* ============================================================ */}
      {/* 1. MATTE ONYX VIEWPORT-FIXED CONSENT BANNER                  */}
      {/* ============================================================ */}
      {showBanner && !showManageModal && (
        <aside
          ref={bannerRef}
          role="region"
          aria-label="Privacy and Cookie Consent Notice"
          className="fixed bottom-24 inset-x-3 sm:inset-x-5 lg:bottom-0 lg:inset-x-0 z-[60] max-h-[75vh] overflow-y-auto touch-manipulation rounded-xl lg:rounded-none border border-[#C9A227]/45 lg:border-x-0 lg:border-b-0 lg:border-t lg:border-[#C9A227]/45 bg-[#0D0E11]/95 backdrop-blur-xl shadow-[0_-18px_48px_rgba(0,0,0,0.88)] transition-colors"
        >
          <div className="mx-auto flex max-w-[1440px] flex-col gap-3.5 px-4 py-3.5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-12 lg:py-4">
            {/* Title, Badge & Statutory Notice */}
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#15171C] text-[#C9A227]">
                <Shield className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-sm font-bold tracking-tight text-[#FAF8F5] sm:text-base">
                    Granular Privacy &amp; Consent Notice
                  </h3>
                  <span className="font-mono text-[10px] font-semibold text-[#C9A227] uppercase tracking-wider">
                    DPDP Sec. 6 · GDPR Art. 7
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-[#A1A1AA] sm:text-[13px] md:max-w-2xl lg:max-w-3xl">
                  Non-essential telemetry scripts are blocked by default until affirmative,
                  unambiguous consent is granted. Essential security and session integrity storage
                  remain active. Consent may be withdrawn anytime via{" "}
                  <span className="font-semibold text-[#FAF8F5]">Consent Preferences</span> in the
                  footer. Review our{" "}
                  <Link
                    to="/legal/privacy"
                    className="font-medium text-[#C9A227] underline underline-offset-2 hover:text-[#DFB842]"
                  >
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link
                    to="/legal/cookies"
                    className="font-medium text-[#C9A227] underline underline-offset-2 hover:text-[#DFB842]"
                  >
                    Cookie Notice
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Equal-Prominence Action Buttons (DPDP Sec 6 / GDPR Art 7) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex lg:items-center gap-2 pt-0.5 sm:pt-0 shrink-0">
              <button
                type="button"
                onClick={() => handleChoice("Accepted")}
                className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C9A227] bg-[#C9A227] px-4 py-2 text-xs font-mono font-bold text-[#0D0E11] transition-colors hover:bg-[#DFB842] cursor-pointer whitespace-nowrap"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleChoice("Rejected")}
                className="inline-flex min-h-[40px] items-center justify-center rounded-md border border-[#C9A227]/75 bg-[#15171C] px-4 py-2 text-xs font-mono font-bold text-[#FAF8F5] transition-colors hover:border-[#C9A227] hover:bg-[#1C1F26] cursor-pointer whitespace-nowrap"
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={() => handleChoice("Managed")}
                className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-md border border-[#262932] bg-[#15171C] px-4 py-2 text-xs font-mono font-bold text-[#C9A227] transition-colors hover:border-[#C9A227] cursor-pointer whitespace-nowrap"
              >
                <Settings2 className="h-3.5 w-3.5 shrink-0" />
                <span>Manage Preferences</span>
              </button>
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
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[#0D0E11]/90 p-3 pt-[max(14px,env(safe-area-inset-top))] pb-[max(14px,env(safe-area-inset-bottom))] backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowManageModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[92dvh] sm:max-h-[85vh] w-full max-w-lg md:max-w-xl flex-col overflow-hidden rounded-md border border-[#262932] bg-[#15171C]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#262932] px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227] shrink-0">
                  <Settings2 className="h-4 w-4" />
                </div>
                <div>
                  <h2
                    id="cookie-preferences-title"
                    className="font-display text-sm sm:text-base md:text-lg font-bold text-[#F4F4F5]"
                  >
                    Manage Privacy Preferences
                  </h2>
                  <p className="text-[10px] sm:text-[11px] text-[#A1A1AA]">
                    Customize your data protection &amp; script gating choices
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowManageModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:border-[#C9A227] hover:text-[#F4F4F5] cursor-pointer"
                aria-label="Close preferences"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body: Scrollable Categories */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3 sm:px-6 sm:py-4 sm:space-y-3.5 text-left">
              <p className="text-xs leading-relaxed text-[#A1A1AA]">
                We respect your personal privacy rights under global regulations including GDPR,
                India DPDP Act 2023, and CPRA. Analytics and advertising scripts are gated and only
                execute if authorized below.
              </p>

              {/* 1. Necessary (Always Active) */}
              <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-3 sm:p-3.5">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#F4F4F5]">
                        Necessary (Essential)
                      </span>
                      <span className="inline-flex items-center gap-1 rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-mono font-bold text-[#10B981]">
                        <Lock className="h-2.5 w-2.5" />
                        Always Active
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#A1A1AA]">
                      Essential for core platform security, session integrity, cryptographic
                      verification, and site operation. Cannot be disabled.
                    </p>
                  </div>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[#10B981]/15 text-[#10B981]">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* 2. Analytics (Gated behind consent) */}
              <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-3 sm:p-3.5 transition-colors hover:border-[#C9A227]/60">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="pr-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#F4F4F5]">Analytics</span>
                      <span className="font-mono text-[10px] text-[#C9A227]">Script Gated</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#A1A1AA]">
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
                    <div className="h-6 w-11 rounded-full bg-[#262932] peer-focus:ring-2 peer-focus:ring-[#C9A227] peer-checked:bg-[#C9A227] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-[#F4F4F5] after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* 3. Marketing (Gated behind consent) */}
              <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-3 sm:p-3.5 transition-colors hover:border-[#C9A227]/60">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="pr-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-[#F4F4F5]">Marketing</span>
                      <span className="font-mono text-[10px] text-[#C9A227]">Script Gated</span>
                    </div>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#A1A1AA]">
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
                    <div className="h-6 w-11 rounded-full bg-[#262932] peer-focus:ring-2 peer-focus:ring-[#C9A227] peer-checked:bg-[#C9A227] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-[#F4F4F5] after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>

              {/* 4. Preferences (Optional) */}
              <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-3 sm:p-3.5 transition-colors hover:border-[#C9A227]/60">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="pr-1">
                    <span className="text-xs sm:text-sm font-bold text-[#F4F4F5]">Preferences</span>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#A1A1AA]">
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
                    <div className="h-6 w-11 rounded-full bg-[#262932] peer-focus:ring-2 peer-focus:ring-[#C9A227] peer-checked:bg-[#C9A227] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-[#F4F4F5] after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer: Equal Prominence + One-Click Withdrawal */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 border-t border-[#262932] bg-[#0D0E11] px-4 py-3 sm:px-6 sm:py-3.5">
              <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleChoice("Rejected")}
                  className="inline-flex min-h-[42px] sm:min-h-[36px] items-center justify-center rounded-md border border-[#C9A227]/60 bg-[#15171C] px-3 py-1.5 text-xs font-mono font-bold text-[#FAF8F5] hover:border-[#C9A227] cursor-pointer whitespace-nowrap"
                >
                  Withdraw / Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={() => handleChoice("Accepted")}
                  className="inline-flex min-h-[42px] sm:min-h-[36px] items-center justify-center rounded-md border border-[#262932] bg-[#15171C] px-3 py-1.5 text-xs font-mono font-bold text-[#C9A227] hover:border-[#C9A227] cursor-pointer whitespace-nowrap"
                >
                  Accept All
                </button>
              </div>
              <button
                type="button"
                onClick={handleSaveManaged}
                className="btn-gold inline-flex min-h-[42px] sm:min-h-[36px] items-center justify-center rounded-md px-4 py-1.5 text-xs font-mono font-bold cursor-pointer w-full sm:w-auto whitespace-nowrap"
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
