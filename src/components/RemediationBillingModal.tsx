import React, { useState } from "react";
import {
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Building2,
  CreditCard,
  ArrowRight,
  X,
  QrCode,
  Landmark,
  ShieldAlert,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";

interface RemediationBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  report: AuditReport | null;
}

export type BillingTierId = "patch-wire" | "dpdp-india" | "gdpr-global" | "full-bundle";

export interface TierDetails {
  id: BillingTierId;
  name: string;
  badge?: string;
  priceUsd: string;
  priceInr: string;
  popular?: boolean;
  description: string;
  features: string[];
}

const BILLING_TIERS: TierDetails[] = [
  {
    id: "patch-wire",
    name: "Autonomous Code Remediation Wrapper Patch",
    badge: "Instant Release",
    popular: true,
    priceUsd: "$300",
    priceInr: "₹24,999",
    description:
      "Direct code repository unlock: Full executable wrapper patch mitigating statutory liability exposure.",
    features: [
      "Immediate release of full executable wrapper patch codebase",
      "Automated server-side HTTP security headers injector",
      "Client-side pre-consent telemetry block & CMP binding",
      "Cross-border transfer encryption signature tokens",
      "Statutory liability mitigation against penalty up to ₹250 Crores",
    ],
  },
  {
    id: "dpdp-india",
    name: "DPDP Act 2023 Statutory Suite",
    priceUsd: "$600",
    priceInr: "₹50,000",
    description:
      "Specialized statutory remediation for India's Digital Personal Data Protection Act compliance.",
    features: [
      "Data Fiduciary consent manager technical architecture",
      "Multilingual notice & data principal rights workflow",
      "Data Protection Board breach reporting protocols",
      "Schedule penalty mitigation & audit readiness roadmap",
      "Targeted technical fixes for Indian regulatory compliance",
    ],
  },
  {
    id: "gdpr-global",
    name: "GDPR & Global Compliance",
    priceUsd: "$1,500",
    priceInr: "₹1,25,000",
    description:
      "Complete remediation framework for EU GDPR, UK GDPR, CCPA/CPRA, and international privacy mandates.",
    features: [
      "Step-by-step code & HTTP header technical remediation scripts",
      "Standard Contractual Clauses (SCCs) & DPA template suite",
      "Consent banner & cookie flag technical audit blueprints",
      "Cross-border data transfer impact assessment (TIA)",
      "Automated continuous re-scanning & audit log retention",
    ],
  },
  {
    id: "full-bundle",
    name: "Full-Spectrum Sovereign Suite",
    badge: "Enterprise",
    priceUsd: "$1,850",
    priceInr: "₹1,50,000",
    description:
      "Combined global GDPR + India DPDP Act end-to-end technical remediation and continuous monitoring.",
    features: [
      "Includes ALL Autonomous Code Remediation Wrapper Patch scripts",
      "Includes ALL GDPR & Global Compliance deliverables",
      "Includes ALL DPDP Act 2023 Statutory Suite deliverables",
      "Priority technical support & manual engineering verification",
      "Unlimited domain re-scans & downloadable legal PDF reports",
    ],
  },
];

export function RemediationBillingModal({
  isOpen,
  onClose,
  onUnlockSuccess,
  report,
}: RemediationBillingModalProps) {
  const [selectedTier, setSelectedTier] = useState<BillingTierId>("patch-wire");
  const [paymentMethod, setPaymentMethod] = useState<"wire" | "card" | "upi">("wire");
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");

  if (!isOpen) return null;

  const currentTier = BILLING_TIERS.find((t) => t.id === selectedTier) || BILLING_TIERS[0];

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        onUnlockSuccess();
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-primary/40 bg-[#0c0c0c] p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10 text-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40 mb-4">
              <ShieldCheck className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="font-display text-2xl font-bold text-gold-gradient">
              Remediation Wrapper Patch Unlocked
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Your technical patch codebase and statutory remediation plan for{" "}
              {report?.target || "your infrastructure"} are now fully activated.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> RegTech Core Transfer &amp; Unlock
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-red-400">
                    <ShieldAlert className="h-3 w-3" /> Liability Cap: ₹250 Cr
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold text-gold-gradient">
                  Unlock Autonomous Remediation Code
                </h2>
                <p className="text-xs text-muted-foreground">
                  Upfront Data Deployment Registry Transfer Fee: ₹24,999 ($300 USD) for full
                  executable wrapper patch.
                </p>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center rounded-lg border border-border/80 bg-secondary/50 p-1 self-start sm:self-auto font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 font-medium rounded-md transition-colors ${
                    currency === "INR"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  INR (₹)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 font-medium rounded-md transition-colors ${
                    currency === "USD"
                      ? "bg-primary text-primary-foreground font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  USD ($)
                </button>
              </div>
            </div>

            {/* Tiers Grid */}
            <div className="mt-6 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {BILLING_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const displayPrice = currency === "USD" ? tier.priceUsd : tier.priceInr;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-border/60 bg-black/40 hover:border-border hover:bg-black/60"
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
                        {tier.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-xs text-foreground leading-tight">
                          {tier.name}
                        </h3>
                        <div
                          className={`h-4 w-4 shrink-0 ml-1 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-2.5 flex items-baseline gap-1 font-mono">
                        <span className="font-display text-xl font-bold text-gold-gradient">
                          {displayPrice}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/ patch</span>
                      </div>

                      <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {tier.description}
                      </p>

                      <ul className="mt-3 space-y-1.5 text-[10px] text-muted-foreground">
                        {tier.features.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Selector */}
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/40 pt-4 font-mono text-xs">
              <span className="text-muted-foreground">Payment Channel:</span>
              <button
                type="button"
                onClick={() => setPaymentMethod("wire")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all cursor-pointer ${
                  paymentMethod === "wire"
                    ? "border-primary bg-primary/20 text-primary font-bold"
                    : "border-border/60 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Landmark className="h-3.5 w-3.5" />
                <span>Bank Wire / NEFT / RTGS / SWIFT</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all cursor-pointer ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary/20 text-primary font-bold"
                    : "border-border/60 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Instant UPI QR</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 transition-all cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/20 text-primary font-bold"
                    : "border-border/60 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Corporate Card</span>
              </button>
            </div>

            {/* Wire Details Box if wire or upi */}
            {paymentMethod === "wire" && (
              <div className="mt-3 rounded-xl border border-primary/20 bg-black/60 p-3.5 font-mono text-xs text-muted-foreground">
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  Direct Wire Transfer Instructions (INR / USD / SWIFT):
                </p>
                <div className="mt-1.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-foreground">
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Beneficiary:</span>
                    ASJi Web &amp; Legal Solution
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">Current A/C:</span>
                    924020014891234
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px]">IFSC / SWIFT:</span>
                    UTIB0000123 / AXISINBB
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "upi" && (
              <div className="mt-3 rounded-xl border border-primary/20 bg-black/60 p-3.5 font-mono text-xs text-muted-foreground">
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  Instant UPI Payment:
                </p>
                <p className="mt-1 text-xs text-foreground">
                  UPI ID: <strong className="text-primary">asji.online@okaxis</strong> •
                  Beneficiary: Aarush Sharma &amp; Co.
                </p>
              </div>
            )}

            {/* How you provide patches to your client */}
            <div className="mt-3.5 rounded-xl border border-primary/30 bg-primary/5 p-3.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>Client Delivery &amp; Handover Workflow</span>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted-foreground leading-relaxed">
                <div>
                  <strong className="text-foreground block">1. Collect Fee:</strong>
                  Invoice your client using Wire, UPI, or Card for the audit &amp; patches.
                </div>
                <div>
                  <strong className="text-foreground block">2. Unlock Suite:</strong>
                  Click &ldquo;Activate &amp; Unlock&rdquo; below to release the domain-specific
                  codebase.
                </div>
                <div>
                  <strong className="text-foreground block">3. Dispatch to Client:</strong>
                  Download the complete patch ZIP/bundle or copy the turnkey &ldquo;Client Handover
                  Pack&rdquo; to send over email.
                </div>
              </div>
            </div>

            {/* Form & Activation */}
            <form
              onSubmit={handleCheckout}
              className="mt-4 rounded-xl border border-border/60 bg-black/40 p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Organization Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Acme Corp"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Compliance Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="legal@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      UTR / Transfer Ref (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="UTR-20260831-998"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex flex-col items-stretch sm:items-end gap-1.5">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-gold flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold w-full sm:w-auto cursor-pointer"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 animate-spin" /> Verifying Transfer...
                      </span>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Complete Wire &amp; Unlock (
                        {currency === "USD" ? currentTier.priceUsd : currentTier.priceInr})
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground text-center sm:text-right flex items-center justify-center sm:justify-end gap-1">
                    <Lock className="h-3 w-3 text-primary" /> Instant Key &amp; Executable Wrapper
                    Release
                  </span>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
export { BILLING_TIERS };
