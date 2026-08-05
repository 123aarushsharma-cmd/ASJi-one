import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Cookie, Settings, Check } from "lucide-react";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    const consentRaw = localStorage.getItem("asji_cookie_consent");
    if (!consentRaw) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(consentRaw);
        setAnalyticsEnabled(!!parsed.analytics);
      } catch {
        setShowBanner(true);
      }
    }
  }, []);

  const saveConsent = (analytics: boolean) => {
    const consentPayload = {
      essential: true,
      analytics,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("asji_cookie_consent", JSON.stringify(consentPayload));
    setAnalyticsEnabled(analytics);

    // Dispatch global event for optional tracking initialization
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("asji_cookie_consent_updated", { detail: consentPayload }),
      );
    }
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-5 duration-300">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[#D4AF37]/40 bg-[#0c0c0c]/95 p-5 sm:p-6 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 text-[#D4AF37]">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-sm font-bold text-[#E5E5E5]">
                  Privacy &amp; Cookie Notice
                </h4>
                <span className="inline-flex items-center gap-1 rounded border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-2 py-0.5 text-[10px] font-bold text-[#D4AF37]">
                  <ShieldCheck className="h-3 w-3" /> GDPR Art. 13 &amp; DPDP Compliant
                </span>
              </div>
              <p className="text-xs leading-relaxed text-[#E5E5E5]/80">
                ASJi One uses essential storage for security and session state. Non-essential
                tracking scripts initialize only after explicit opt-in. Learn more in our{" "}
                <Link to="/legal/cookies" className="text-[#D4AF37] underline hover:text-white">
                  Cookie Policy
                </Link>{" "}
                and{" "}
                <Link to="/legal/privacy" className="text-[#D4AF37] underline hover:text-white">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/60 px-3.5 py-2 text-xs font-semibold text-[#E5E5E5] transition-all hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
            >
              <Settings className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Options</span>
            </button>
            <button
              onClick={() => saveConsent(false)}
              className="rounded-xl border border-[#D4AF37]/30 bg-black/80 px-4 py-2 text-xs font-semibold text-[#E5E5E5] transition-all hover:bg-black hover:text-white"
            >
              Essential Only
            </button>
            <button
              onClick={() => saveConsent(true)}
              className="rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-5 py-2 text-xs font-bold text-black shadow-lg shadow-[#D4AF37]/20 transition-all hover:bg-[#c49f27]"
            >
              Accept &amp; Opt-In
            </button>
          </div>
        </div>

        {/* Extended Preferences drawer */}
        {showPreferences && (
          <div className="mt-4 border-t border-white/10 pt-4 animate-in fade-in">
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
                <div className="flex items-center justify-between font-bold text-emerald-300">
                  <span>Strictly Essential Storage</span>
                  <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <Check className="h-3 w-3" /> Always Active
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-[#E5E5E5]/70">
                  Required for security, session verification, and executing authorized compliance
                  evaluations under ePrivacy Directive Art. 5(3).
                </p>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/30 bg-black/60 p-3">
                <div className="flex items-center justify-between font-bold text-[#D4AF37]">
                  <span>Performance &amp; Diagnostics</span>
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
                <p className="mt-1 text-[11px] text-[#E5E5E5]/70">
                  Optional diagnostic telemetry. Scripts initialize only when toggle is enabled and
                  saved.
                </p>
                <div className="mt-2 text-right">
                  <button
                    onClick={() => saveConsent(analyticsEnabled)}
                    className="rounded-lg border border-[#D4AF37]/50 bg-[#D4AF37]/20 px-3 py-1 text-[10px] font-bold text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-all"
                  >
                    Save Selected Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
