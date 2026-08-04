import { Link, createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Globe, ShieldCheck, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import logo from "@/assets/asji-logo.jpg.asset.json";
import { IntroSplash } from "@/components/IntroSplash";
import { ScanLoader } from "@/components/ScanLoader";
import { ScoreWheel } from "@/components/ScoreWheel";
import { LinkedInShareButton } from "@/components/LinkedInShareButton";
import { GroundedSearchCard } from "@/components/GroundedSearchCard";
import { FineExposureCard } from "@/components/FineExposureCard";
import { LocalizationScannerCard } from "@/components/LocalizationScannerCard";
import { RemediationBillingModal } from "@/components/RemediationBillingModal";
import { RemediationViewer } from "@/components/RemediationViewer";
import { Footer } from "@/components/Footer";
import { detectInput, validateAuditInput } from "@/lib/audit-input";
import { auditCompliance, purgeDatabase, type AuditReport } from "@/lib/audit.functions";
import { AUTHORISATION_NOTICE, LEGAL, LEGAL_PAGES, NOT_LEGAL_ADVICE } from "@/lib/legal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ASJi One — GDPR & DPDP Compliance Scanner" },
      {
        name: "description",
        content:
          "Analyse any website or infrastructure text for GDPR, India DPDP and global compliance risk. Instant 0-100 score, critical leaks and fine exposure.",
      },
      { property: "og:title", content: "ASJi One — GDPR & DPDP Compliance Scanner" },
      {
        property: "og:description",
        content:
          "Analyse any website or infrastructure text for GDPR, India DPDP and global compliance risk. Instant 0-100 score, critical leaks and fine exposure.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "idle" | "scanning" | "result";

const SEVERITY_STYLES: Record<string, string> = {
  critical: "border-destructive/50 text-destructive",
  high: "border-destructive/40 text-destructive",
  medium: "border-primary/40 text-primary",
  low: "border-border text-muted-foreground",
};

function Index() {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState("");
  const [unlockOpen, setUnlockOpen] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [retentionMode, setRetentionMode] = useState<RetentionOption>("5min");
  const [scanMode, setScanMode] = useState<"deep-grounded" | "fast-lite">("deep-grounded");
  const scanRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const runAudit = useServerFn(auditCompliance);
  const purgeDbServer = useServerFn(purgeDatabase);

  const handlePurge = () => {
    setReport(null);
    setInput("");
    setScanned("");
    setPhase("idle");
    setError(null);
    try {
      sessionStorage.clear();
      purgeDbServer();
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (phase !== "scanning") return;
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => (p >= 94 ? p : p + Math.random() * 4 + 1));
    }, 220);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === "scanning") {
      const t = setTimeout(() => {
        scanRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 60);
      return () => clearTimeout(t);
    } else if (phase === "result") {
      const t = setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 60);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const trimmed = input.trim();
  const detected = trimmed.length >= 3 ? detectInput(trimmed) : null;
  const liveCheck = trimmed.length >= 3 ? validateAuditInput(trimmed) : null;

  const startScan = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (phase === "scanning") return;
    if (!agreed) {
      setError("Please confirm you are authorised to scan this target and accept the Terms.");
      return;
    }
    const validation = validateAuditInput(value);
    if (!validation.ok) {
      setError(validation.error);
      return;
    }
    setError(null);
    const label =
      validation.detected.kind === "url"
        ? validation.detected.host!
        : "your infrastructure description";
    setScanned(label.slice(0, 60));
    setPhase("scanning");
    try {
      const result = await runAudit({ data: { input: value, scanMode } });
      setProgress(100);
      setReport(result);
      setPhase("result");
    } catch (err) {
      let msg = "Analysis failed. Please try again.";
      if (err instanceof Error) {
        msg = err.message;
      } else if (typeof err === "string") {
        msg = err;
      }

      if (msg.trim().startsWith("{")) {
        try {
          const parsed = JSON.parse(msg);
          if (parsed.error?.message) {
            msg = parsed.error.message;
          }
        } catch {
          /* keep original */
        }
      }

      if (msg.includes("503") || msg.includes("UNAVAILABLE") || msg.includes("high demand")) {
        msg =
          "The AI model engine is currently experiencing temporary peak traffic. Click 'Analyze Domain Compliance' to retry.";
      }

      setError(msg);
      setPhase("idle");
    }
  };

  return (
    <div className="min-h-screen">
      <IntroSplash />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex items-center gap-3.5"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-primary/30 bg-black/80 shadow-md shadow-primary/10"
          >
            <img
              src="/asji-logo.svg"
              alt="ASJi One Logo"
              className="h-full w-full object-contain p-0.5"
            />
          </motion.div>
          <div className="leading-tight">
            <p className="font-display text-2xl tracking-tight text-gold-gradient font-bold">
              ASJi One
            </p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium">
              Trust Intelligence
            </p>
          </div>
        </motion.div>
        <nav className="flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#scan" className="transition-colors hover:text-primary font-medium">
            Scanner
          </a>
          <a href="#capabilities" className="transition-colors hover:text-primary font-medium">
            Capabilities
          </a>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="pt-8 pb-16 text-center sm:pt-14"
        >
          <div className="mb-6 inline-flex flex-col items-center">
            <span className="inline-block rounded-full border border-primary/30 px-4 py-1.5 text-[11px] uppercase tracking-[0.28em] text-primary bg-primary/5 backdrop-blur-sm font-medium">
              GDPR · India DPDP · Global Compliance
            </span>
          </div>
          <h1 className="mt-2 font-display text-4xl leading-[1.1] sm:text-6xl">
            <span className="text-gold-gradient">Know exactly</span>
            <br />
            how compliant you are
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base text-muted-foreground">
            Submit a website URL or paste raw infrastructure details. ASJi One audits it against
            GDPR, India&apos;s DPDP Act and the regimes of your origin country — then returns a
            score, the critical leaks and your estimated fine exposure.
          </p>

          <form
            id="scan"
            onSubmit={startScan}
            className="surface-panel mx-auto mt-10 w-full max-w-2xl space-y-4 p-5 sm:p-6 text-left"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="site-input"
                  className="text-xs font-semibold uppercase tracking-wider text-gold-gradient flex items-center gap-1.5"
                >
                  <Globe className="h-3.5 w-3.5 text-primary" /> Target Domain or Website URL
                </label>
                <span className="text-[11px] text-muted-foreground font-medium">
                  Automated Inspection
                </span>
              </div>
              <div className="relative flex items-center">
                <Globe className="absolute left-4 h-5 w-5 text-muted-foreground pointer-events-none" />
                <input
                  id="site-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={8000}
                  placeholder="e.g. yourcompany.com or hostinger.com"
                  className="w-full rounded-xl bg-input/40 pl-11 pr-4 py-3.5 text-base text-foreground outline-none ring-1 ring-border transition-all placeholder:text-muted-foreground/60 focus:ring-2 focus:ring-primary/60"
                />
              </div>
            </div>

            {/* Quick Domain Suggestion Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground mr-1">Quick Test:</span>
              {["example.com", "hostinger.com", "github.com", "wikipedia.org"].map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => {
                    setInput(`https://${domain}`);
                    setError(null);
                  }}
                  className="rounded-full border border-border/80 bg-secondary/40 px-2.5 py-0.5 text-[11px] font-sans font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-secondary hover:text-foreground"
                >
                  {domain}
                </button>
              ))}
            </div>

            {detected && (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-secondary/30 px-3 py-2 text-left">
                <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-primary">
                  {detected.kind === "url"
                    ? "Live Domain Scan Active"
                    : "Custom Stack Text Detected"}
                </span>
                <span className="text-[11px] text-muted-foreground font-sans font-medium">
                  {detected.kind === "url"
                    ? `Inspecting ${detected.host}...`
                    : liveCheck && !liveCheck.ok
                      ? liveCheck.error
                      : "Custom Stack Mode"}
                </span>
              </div>
            )}

            {/* Terms Consent Checkbox */}
            <label className="flex items-start gap-3 px-1 text-left text-[11px] leading-relaxed text-muted-foreground">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary rounded border-border"
              />
              <span>
                I own this target or am authorised in writing to assess it, and I accept the{" "}
                <Link to="/legal/terms" className="text-primary underline-offset-2 hover:underline">
                  Terms
                </Link>
                ,{" "}
                <Link
                  to="/legal/acceptable-use"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Acceptable Use Policy
                </Link>{" "}
                and{" "}
                <Link
                  to="/legal/privacy"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Privacy Policy
                </Link>
                . Reports are informational technical audits and not formal legal advice.
              </span>
            </label>

            <button
              type="submit"
              disabled={phase === "scanning" || !agreed || (liveCheck ? !liveCheck.ok : true)}
              className="btn-gold w-full rounded-xl px-8 py-4 text-sm font-bold uppercase tracking-wider disabled:opacity-60 shadow-lg transition-all hover:scale-[1.01]"
            >
              {phase === "scanning" ? "Running Deep Domain Scan..." : "Analyze Domain Compliance"}
            </button>

            <p className="px-1 text-left text-[10px] leading-relaxed text-muted-foreground/80">
              {AUTHORISATION_NOTICE}
            </p>

            {error && (
              <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-left text-xs text-destructive flex flex-col gap-2">
                <p className="font-semibold text-xs flex items-center gap-1.5 text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Audit Inspection Notice</span>
                </p>
                <p className="leading-relaxed">{error}</p>
                <button
                  type="submit"
                  className="mt-1 self-start rounded-lg bg-destructive/20 px-3 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/30 transition-all cursor-pointer"
                >
                  Retry Scan
                </button>
              </div>
            )}
          </form>

          <div className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center">
            {[
              ["120+", "Checks run"],
              ["< 30s", "Full audit"],
              ["GDPR+DPDP", "Aligned"],
            ].map(([a, b]) => (
              <div key={b} className="surface-panel px-3 py-5">
                <p className="font-display text-xl text-gold-gradient sm:text-2xl">{a}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  {b}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {phase === "scanning" && (
          <section ref={scanRef} className="surface-panel px-5 my-8 scroll-mt-12">
            <ScanLoader progress={progress} url={scanned} />
          </section>
        )}

        {phase === "result" && report && (
          <section ref={resultRef} className="animate-rise space-y-6 scroll-mt-8">
            <div className="rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 text-left">
              <p className="text-[10px] uppercase tracking-[0.24em] text-primary">
                Informational report · Not legal advice
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {NOT_LEGAL_ADVICE}{" "}
                <Link
                  to="/legal/disclaimer"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  Read the full disclaimer
                </Link>
                .
              </p>
            </div>
            <div className="surface-panel flex flex-col items-center gap-8 p-8 lg:flex-row lg:items-center lg:gap-14">
              <ScoreWheel score={report.score} />
              <div className="flex-1 text-center lg:text-left">
                <div className="flex flex-wrap items-center justify-center lg:justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                      Compliance score for
                    </p>
                    <h2 className="mt-2 font-display text-3xl text-gold-gradient break-all">
                      {report.target || scanned}
                    </h2>
                  </div>
                  <LinkedInShareButton
                    domain={report.target || scanned}
                    score={report.score}
                    report={report}
                  />
                </div>
                <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Origin: {report.originCountry}
                </p>
                <div className="gold-rule my-5" />
                <p className="text-sm leading-relaxed text-muted-foreground">{report.summary}</p>
                {report.provenance && (
                  <div className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start">
                    <span className="rounded-full border border-primary/40 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-primary">
                      {report.provenance.confidence} confidence
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {report.provenance.method === "live-http-scan"
                        ? "Live HTTP scan"
                        : "Operator description"}
                    </span>
                    <span className="rounded-full border border-border px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      {(report.provenance.durationMs / 1000).toFixed(1)}s ·{" "}
                      {new Date(report.provenance.scannedAt).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <button
                    onClick={() => {
                      setPhase("idle");
                      setReport(null);
                    }}
                    className="rounded-xl border border-primary/40 px-6 py-3 text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/10"
                  >
                    Analyze another
                  </button>
                </div>
              </div>
            </div>

            {/* Google Search Grounding Section */}
            <GroundedSearchCard grounding={report.grounding} />

            {report.evidence?.length > 0 && (
              <div className="surface-panel p-6">
                <h3 className="font-display text-xl text-gold-gradient">
                  {report.inputKind === "url" ? "Live scan evidence" : "Assessment basis"}
                </h3>
                <div className="gold-rule my-4" />
                <ul className="space-y-2.5">
                  {report.evidence.map((item, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-muted-foreground"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Fine Exposure Card (DPDP Act 2023 & Global Jurisdictions) */}
            <FineExposureCard report={report} />

            {/* Global & Regional Language Notice Scanner Card */}
            <LocalizationScannerCard
              report={report}
              onOpenRemediationModal={() => setUnlockOpen(true)}
            />

            {report.frameworks?.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {report.frameworks.map((f) => (
                  <div key={f.name} className="surface-panel p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold">{f.name}</p>
                      <span className="font-display text-lg text-gold-gradient">{f.score}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, f.score))}%`,
                          backgroundImage: "var(--gradient-gold)",
                        }}
                      />
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">{f.note}</p>
                  </div>
                ))}
              </div>
            )}

            {report.criticalLeaks?.length > 0 && (
              <div className="surface-panel p-6">
                <h3 className="font-display text-xl text-gold-gradient">Critical leaks</h3>
                <div className="gold-rule my-4" />
                <ul className="space-y-4">
                  {report.criticalLeaks.map((leak) => (
                    <li key={leak.title} className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-sm font-semibold">{leak.title}</p>
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] ${
                            SEVERITY_STYLES[leak.severity] ?? SEVERITY_STYLES.low
                          }`}
                        >
                          {leak.severity}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed text-muted-foreground">{leak.detail}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {isUnlocked ? (
              <RemediationViewer report={report} />
            ) : (
              <div className="surface-panel relative overflow-hidden p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-display text-xl text-gold-gradient">Remediation plan</h3>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                      GDPR &amp; Global Suite: $1,500
                    </span>
                    <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                      DPDP Act (India): ₹50,000
                    </span>
                  </div>
                </div>
                <div className="gold-rule my-4" />
                <ul className="space-y-4 blur-[7px] select-none" aria-hidden>
                  {(report.remediation?.length ? report.remediation : Array(4).fill(null)).map(
                    (step, i) => (
                      <li key={i} className="space-y-1">
                        <p className="text-sm font-semibold">
                          {step?.step ?? "Detailed technical remediation step"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Impact: {step?.impact ?? "high"} · Effort: {step?.effort ?? "medium"}
                        </p>
                      </li>
                    ),
                  )}
                </ul>

                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3.5 bg-background/80 px-6 text-center backdrop-blur-md">
                  <span className="rounded-full border border-primary/40 px-4 py-1 text-[10px] uppercase tracking-[0.28em] text-primary font-bold">
                    Premium Technical Remediation
                  </span>
                  <p className="font-display text-2xl text-gold-gradient font-bold">
                    Unlock Remediation &amp; Compliance Billing Tiers
                  </p>
                  <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
                    Actionable code fixes, DPA templates, statutory DPDP Act &amp; GDPR compliance
                    blueprints starting at $1,500 (GDPR Global) and ₹50,000 (India DPDP Act).
                  </p>
                  <button
                    onClick={() => setUnlockOpen(true)}
                    className="btn-gold rounded-xl px-8 py-3.5 text-xs uppercase tracking-[0.2em] font-bold shadow-lg shadow-primary/10 transition-transform hover:scale-105"
                  >
                    Upgrade to Premium Remediation
                  </button>
                </div>
              </div>
            )}

            <RemediationBillingModal
              isOpen={unlockOpen}
              onClose={() => setUnlockOpen(false)}
              onUnlockSuccess={() => setIsUnlocked(true)}
              report={report}
            />
          </section>
        )}

        <section id="capabilities" className="mt-24 scroll-mt-8">
          <h2 className="text-center font-display text-3xl text-gold-gradient">Capabilities</h2>
          <div className="gold-rule mx-auto mt-5 max-w-xs" />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              [
                "Threat Surface Mapping",
                "Enumerate exposed endpoints, mixed content and insecure origins.",
              ],
              [
                "Consent Forensics",
                "Verify banner behaviour, pre-consent cookies and storage writes.",
              ],
              [
                "Regulatory Alignment",
                "GDPR, DPDP, CCPA and ePrivacy signals graded against current guidance.",
              ],
              [
                "Header Hardening",
                "CSP, HSTS, referrer and frame policy scoring with fix guidance.",
              ],
              ["Vendor Visibility", "Identify third-party scripts and the data they can observe."],
              [
                "Fine Exposure",
                "Estimate regulatory penalty risk based on jurisdiction and findings.",
              ],
            ].map(([t, d]) => (
              <article
                key={t}
                className="surface-panel p-6 transition-colors hover:border-primary/40"
              >
                <h3 className="font-display text-lg text-foreground">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{d}</p>
              </article>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
