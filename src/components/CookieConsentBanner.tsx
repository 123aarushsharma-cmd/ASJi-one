import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Cookie, X, Settings } from "lucide-react";

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("asji_cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      "asji_cookie_consent",
      JSON.stringify({ essential: true, analytics: true, timestamp: new Date().toISOString() }),
    );
    setShowBanner(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem(
      "asji_cookie_consent",
      JSON.stringify({ essential: true, analytics: false, timestamp: new Date().toISOString() }),
    );
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-in slide-in-from-bottom-5 duration-300">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-primary/40 bg-card/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/15 text-primary">
              <Cookie className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-display text-sm font-bold text-foreground">
                  Privacy &amp; Cookie Notice
                </h4>
                <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  <ShieldCheck className="h-3 w-3" /> GDPR &amp; DPDP Compliant
                </span>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                ASJi One uses essential cookies to ensure secure site operation and privacy audit
                analytics. No personal tracking or ad profile data is collected without your
                consent. Learn more in our{" "}
                <Link to="/legal/cookies" className="text-primary underline hover:text-primary/80">
                  Cookie Policy
                </Link>{" "}
                and{" "}
                <Link to="/legal/privacy" className="text-primary underline hover:text-primary/80">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-end md:self-auto shrink-0">
            <button
              onClick={() => setShowPreferences(!showPreferences)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-secondary/60 px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
            >
              <Settings className="h-3.5 w-3.5" />
              <span>Options</span>
            </button>
            <button
              onClick={handleAcceptEssential}
              className="rounded-xl border border-primary/40 bg-black/60 px-4 py-2 text-xs font-semibold text-foreground transition-all hover:bg-black/90"
            >
              Essential Only
            </button>
            <button
              onClick={handleAcceptAll}
              className="rounded-xl border border-primary bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
            >
              Accept All
            </button>
          </div>
        </div>

        {/* Extended Preferences drawer */}
        {showPreferences && (
          <div className="mt-4 border-t border-border/50 pt-4 animate-in fade-in">
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl border border-border bg-black/40 p-3">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Strictly Essential Cookies</span>
                  <span className="text-[10px] text-emerald-400">Always Active</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Necessary for website security, session state, and statutory compliance checks.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-black/40 p-3">
                <div className="flex items-center justify-between font-bold text-foreground">
                  <span>Diagnostic Analytics</span>
                  <span className="text-[10px] text-primary">Optional</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Allows anonymous performance metrics to improve ASJi One scan accuracy.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
