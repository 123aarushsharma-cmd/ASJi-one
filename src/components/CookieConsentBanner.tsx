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
            backgroundColor: "rgba(13, 14, 17, 0.90)",
            padding: "12px",
            paddingBottom: "max(16px, env(safe-area-inset-bottom, 16px))",
            paddingTop: "max(16px, env(safe-area-inset-top, 16px))",
            WebkitOverflowScrolling: "touch",
            touchAction: "manipulation",
          }}
          className="animate-in fade-in duration-200"
        >
          <div
            style={{ maxHeight: "90vh" }}
            className="relative w-full max-w-2xl overflow-y-auto rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-7 text-[#F4F4F5] font-sans"
          >
            {/* Header / Institutional Branding */}
            <div className="flex items-start justify-between gap-3 border-b border-[#262932] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3
                      id="asji-privacy-title"
                      className="font-display text-base sm:text-lg font-bold text-[#F4F4F5] tracking-wide"
                    >
                      ASJi One Governance &amp; Disclaimer Gate
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#10B981]">
                      <Lock className="h-2.5 w-2.5" /> ISO/IEC 27001 &amp; DPDP
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-0.5">
                    Statutory ePrivacy Notice &amp; Technical Assessment Scope
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="text-[#A1A1AA] hover:text-[#F4F4F5] p-1.5 rounded-md border border-[#262932] bg-[#0D0E11] hover:border-[#C9A227] transition-colors cursor-pointer"
                title="Dismiss and Enter"
                aria-label="Dismiss and Enter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="mt-4 flex gap-2 border-b border-[#262932] pb-2.5">
              <button
                type="button"
                onClick={() => setActiveTab("consent")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "consent"
                    ? "bg-[#C9A227] text-[#0D0E11]"
                    : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5]"
                }`}
              >
                <Cookie className="h-3.5 w-3.5" />
                <span>1. Cookie &amp; Storage Notice</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("disclaimer")}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "disclaimer"
                    ? "bg-[#C9A227] text-[#0D0E11]"
                    : "border border-[#262932] bg-[#0D0E11] text-[#A1A1AA] hover:text-[#F4F4F5]"
                }`}
              >
                <Scale className="h-3.5 w-3.5" />
                <span>2. Statutory Legal Disclaimer</span>
              </button>
            </div>

            {/* Tab 1: Cookie & Storage Governance */}
            {activeTab === "consent" && (
              <div className="mt-4 space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
                <p>
                  In compliance with the{" "}
                  <strong className="text-[#F4F4F5]">
                    Digital Personal Data Protection Act, 2023
                  </strong>{" "}
                  (Section 6), <strong className="text-[#F4F4F5]">EU GDPR</strong> (Art. 6 &amp;
                  13), and the <strong className="text-[#F4F4F5]">ePrivacy Directive</strong> (Art.
                  5(3)), ASJi One operates with privacy-by-design principles:
                </p>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-3.5">
                    <div className="flex items-center justify-between font-bold text-[#10B981] mb-1">
                      <span className="flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5" /> Strictly Essential
                      </span>
                      <span className="rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 font-mono text-[10px] font-bold text-[#10B981]">
                        Always Active
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Session tokens, rate-limit protection, and authorized public domain compliance
                      inspection. Zero third-party behavioral profiling.
                    </p>
                  </div>

                  <div className="rounded-md border border-[#262932] bg-[#0D0E11] p-3.5">
                    <div className="flex items-center justify-between font-bold text-[#C9A227] mb-1">
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
                        <div className="w-8 h-4 bg-[#262932] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[#F4F4F5] after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#C9A227]"></div>
                      </label>
                    </div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Aggregated error and scanner performance telemetry. Initializes strictly upon
                      your affirmative opt-in.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#71717A]">
                  <FileText className="h-3.5 w-3.5 text-[#C9A227]" />
                  <span>
                    Read complete provisions in our{" "}
                    <Link
                      to="/legal/cookies"
                      className="text-[#C9A227] underline hover:text-[#DFB842]"
                    >
                      Cookie Notice
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/legal/privacy"
                      className="text-[#C9A227] underline hover:text-[#DFB842]"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </div>
              </div>
            )}

            {/* Tab 2: Statutory Legal & Assessment Disclaimer */}
            {activeTab === "disclaimer" && (
              <div className="mt-4 space-y-4 text-xs text-[#A1A1AA] leading-relaxed">
                <div className="rounded-md border border-[#E5DEC9] bg-[#FAF8F5] p-4 text-[#18181B]">
                  <div className="flex items-center gap-2 font-bold text-[#9A7812] mb-1.5">
                    <AlertTriangle className="h-4 w-4 text-[#F59E0B]" />
                    <span>Statutory Assessment Scope &amp; Non-Legal Advice Notice</span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#52525B] leading-relaxed">
                    {NOT_LEGAL_ADVICE}
                  </p>
                </div>

                <div className="space-y-2 rounded-md border border-[#262932] bg-[#0D0E11] p-4 text-[11px] sm:text-xs text-[#A1A1AA]">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#F4F4F5]">Passive Non-Intrusive Inspection:</strong>{" "}
                      Scans observe publicly served HTTP response headers, SSL configurations, and
                      frontend privacy notices without accessing private backends.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-[#C9A227] shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-[#F4F4F5]">Operator Authorization:</strong> By
                      initiating a domain audit, you confirm that you have legitimate authority to
                      evaluate the target web asset.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-[11px] text-[#71717A]">
                  <Scale className="h-3.5 w-3.5 text-[#C9A227]" />
                  <span>
                    Read full statutory details on our{" "}
                    <Link
                      to="/legal/disclaimer"
                      className="text-[#C9A227] underline hover:text-[#DFB842]"
                    >
                      Legal Disclaimer Page
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/legal/terms"
                      className="text-[#C9A227] underline hover:text-[#DFB842]"
                    >
                      Terms of Service
                    </Link>
                    .
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#262932] pt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="acknowledge-terms"
                  checked={acknowledgedTerms}
                  onChange={(e) => setAcknowledgedTerms(e.target.checked)}
                  className="rounded border-[#262932] bg-[#0D0E11] text-[#C9A227] focus:ring-[#C9A227]"
                />
                <label
                  htmlFor="acknowledge-terms"
                  className="text-[11px] text-[#A1A1AA] cursor-pointer select-none"
                >
                  I acknowledge the statutory scope &amp; privacy policies
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleEssentialOnly}
                  className="flex-1 sm:flex-initial rounded-md border border-[#262932] bg-[#0D0E11] px-4 py-2.5 text-xs font-bold text-[#F4F4F5] transition-colors hover:border-[#C9A227] cursor-pointer whitespace-nowrap"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="btn-gold flex-1 sm:flex-initial rounded-md px-6 py-2.5 text-xs font-extrabold cursor-pointer whitespace-nowrap"
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
