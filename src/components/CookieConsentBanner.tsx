import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import {
  ShieldCheck,
  Cookie,
  Settings,
  Check,
  Scale,
  AlertTriangle,
  Lock,
  FileText,
  X,
} from "lucide-react";
import { NOT_LEGAL_ADVICE } from "@/lib/legal";

export function CookieConsentBanner() {
  const [showGate, setShowGate] = useState(false);
  const [activeTab, setActiveTab] = useState<"consent" | "disclaimer">("consent");
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [acknowledgedTerms, setAcknowledgedTerms] = useState(true);

  useEffect(() => {
    // Show on every new browser session / fresh open, with fallback for private/incognito mode
    try {
      const sessionAcknowledged = sessionStorage.getItem("asji_session_consent_acknowledged");
      if (!sessionAcknowledged) {
        setShowGate(true);
      }

      const consentRaw = localStorage.getItem("asji_cookie_consent");
      if (consentRaw) {
        const parsed = JSON.parse(consentRaw);
        setAnalyticsEnabled(!!parsed.analytics);
      }
    } catch {
      // In strict incognito or legacy storage-restricted browsers, default to showing
      setShowGate(true);
    }
  }, []);

  const handleAcceptAll = () => {
    saveConsent(true, true);
  };

  const handleEssentialOnly = () => {
    saveConsent(false, true);
  };

  const saveConsent = (analytics: boolean, enterPlatform = true) => {
    const consentPayload = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
      disclaimerAcknowledged: true,
    };

    try {
      localStorage.setItem("asji_cookie_consent", JSON.stringify(consentPayload));
      sessionStorage.setItem("asji_session_consent_acknowledged", "true");
    } catch {
      // safe fallback
    }

    setAnalyticsEnabled(analytics);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("asji_cookie_consent_updated", { detail: consentPayload }),
      );
    }

    if (enterPlatform) {
      setShowGate(false);
    }
  };

  return (
    <>
      {/* Main Startup Gateway Modal */}
      {showGate && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="asji-privacy-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(5, 5, 5, 0.88)",
            padding: "12px",
            paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            paddingTop: "max(16px, env(safe-area-inset-top, 16px))",
            WebkitOverflowScrolling: "touch",
            touchAction: "manipulation",
          }}
          className="animate-in fade-in duration-200"
        >
          <div
            style={{
              backgroundColor: "#0c0a09",
              borderColor: "rgba(212, 175, 55, 0.45)",
              color: "#ffffff",
              maxHeight: "90vh",
            }}
            className="relative w-full max-w-2xl overflow-y-auto rounded-3xl border bg-[#0c0a09] p-5 sm:p-7 shadow-2xl backdrop-blur-2xl font-sans"
          >
            {/* Header / Institutional Branding */}
            <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#D4AF37]">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      id="asji-privacy-title"
                      className="font-display text-base sm:text-lg font-bold text-white tracking-wide"
                    >
                      ASJi One Governance &amp; Disclaimer Gate
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      <Lock className="h-2.5 w-2.5" /> ISO/IEC 27001 &amp; DPDP
                    </span>
                  </div>
                  <p className="text-xs text-[#E5E5E5]/70 mt-0.5">
                    Statutory ePrivacy Notice &amp; Technical Assessment Scope
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-[#888888] hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                title="Dismiss and Enter"
                aria-label="Dismiss and Enter"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 flex gap-2 border-b border-white/10 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab("consent")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "consent"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                    : "bg-white/5 text-[#E5E5E5] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Cookie className="h-3.5 w-3.5" />
                <span>1. Cookie &amp; Storage Notice</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("disclaimer")}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === "disclaimer"
                    ? "bg-[#D4AF37] text-black shadow-md shadow-[#D4AF37]/20"
                    : "bg-white/5 text-[#E5E5E5] hover:bg-white/10 hover:text-white"
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>2. Statutory Legal Disclaimer</span>
              </button>
            </div>

            {/* Tab 1: Cookie & Storage Governance */}
            {activeTab === "consent" && (
              <div className="mt-4 space-y-4 text-xs text-[#E5E5E5]/90 leading-relaxed">
                <p>
                  In compliance with the <strong>Digital Personal Data Protection Act, 2023</strong>{" "}
                  (Section 6), <strong>EU GDPR</strong> (Art. 6 &amp; 13), and the{" "}
                  <strong>ePrivacy Directive</strong> (Art. 5(3)), ASJi One operates with
                  privacy-by-design principles:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3.5">
                    <div className="flex items-center justify-between font-bold text-emerald-300 mb-1">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" /> Strictly Essential
                      </span>
                      <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#E5E5E5]/75">
                      Session tokens, rate-limit protection, and authorized public domain compliance
                      inspection. Zero third-party behavioral profiling.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/15 bg-black/50 p-3.5">
                    <div className="flex items-center justify-between font-bold text-[#D4AF37] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Settings className="h-3.5 w-3.5" /> Diagnostics &amp; Telemetry
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={analyticsEnabled}
                          onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-[#E5E5E5]/75">
                      Aggregated error and scanner performance telemetry. Initializes strictly upon
                      your affirmative opt-in.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#E5E5E5]/60">
                  <FileText className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>
                    Read complete provisions in our{" "}
                    <Link to="/legal/cookies" className="text-[#D4AF37] underline hover:text-white">
                      Cookie Notice
                    </Link>{" "}
                    and{" "}
                    <Link to="/legal/privacy" className="text-[#D4AF37] underline hover:text-white">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Statutory Legal & Assessment Disclaimer */}
            {activeTab === "disclaimer" && (
              <div className="mt-4 space-y-4 text-xs text-[#E5E5E5]/90 leading-relaxed">
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4">
                  <div className="flex items-center gap-2 font-bold text-amber-300 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Statutory Assessment Scope &amp; Non-Legal Advice Notice</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#E5E5E5]/80 leading-relaxed">
                    {NOT_LEGAL_ADVICE}
                  </p>
                </div>

                <div className="space-y-2 rounded-2xl border border-white/10 bg-black/40 p-4 text-[11px] sm:text-xs text-[#E5E5E5]/80">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>
                      <strong>Passive Non-Intrusive Inspection:</strong> Scans observe publicly
                      served HTTP response headers, SSL configurations, and frontend privacy notices
                      without accessing private backends.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span>
                      <strong>Operator Authorization:</strong> By initiating a domain audit, you
                      confirm that you have legitimate authority to evaluate the target web asset.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#E5E5E5]/60">
                  <Scale className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>
                    Read full statutory details on our{" "}
                    <Link
                      to="/legal/disclaimer"
                      className="text-[#D4AF37] underline hover:text-white"
                    >
                      Legal Disclaimer Page
                    </Link>{" "}
                    and{" "}
                    <Link to="/legal/terms" className="text-[#D4AF37] underline hover:text-white">
                      Terms of Service
                    </Link>
                    .
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="acknowledge-terms"
                  checked={acknowledgedTerms}
                  onChange={(e) => setAcknowledgedTerms(e.target.checked)}
                  className="rounded border-white/20 bg-black text-[#D4AF37] focus:ring-[#D4AF37]"
                />
                <label
                  htmlFor="acknowledge-terms"
                  className="text-[11px] text-[#E5E5E5]/80 cursor-pointer select-none"
                >
                  I acknowledge the statutory scope &amp; privacy policies
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-initial rounded-xl border border-white/20 bg-white/5 px-4 py-2.5 text-xs font-bold text-[#E5E5E5] transition-all hover:bg-white/10 hover:text-white cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="flex-1 sm:flex-initial rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#f3e5ab] px-6 py-2.5 text-xs font-extrabold text-black shadow-lg shadow-[#D4AF37]/25 transition-all hover:from-[#c49f27] hover:to-[#e2cf92] cursor-pointer"
                >
                  Accept &amp; Enter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
