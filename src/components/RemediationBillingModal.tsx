import { useState } from "react";
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
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";

interface RemediationBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  report: AuditReport | null;
}

export type BillingTierId = "gdpr-global" | "dpdp-india" | "full-bundle";

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

export const BILLING_TIERS: TierDetails[] = [
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
    id: "full-bundle",
    name: "Full-Spectrum Remediation Suite",
    badge: "Most Value",
    popular: true,
    priceUsd: "$1,850",
    priceInr: "₹1,50,000",
    description:
      "Combined global GDPR + India DPDP Act end-to-end technical remediation and continuous monitoring.",
    features: [
      "Includes ALL GDPR & Global Compliance deliverables",
      "Includes ALL DPDP Act 2023 Statutory Suite deliverables",
      "Priority technical support & manual engineering verification",
      "Unlimited domain re-scans & downloadable legal PDF reports",
      "Save over 20% compared to separate tier licensing",
    ],
  },
];

export function RemediationBillingModal({
  isOpen,
  onClose,
  onUnlockSuccess,
  report,
}: RemediationBillingModalProps) {
  const [selectedTier, setSelectedTier] = useState<BillingTierId>("full-bundle");
  const [currency, setCurrency] = useState<"USD" | "INR">("USD");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");

  if (!isOpen) return null;

  const currentTier = BILLING_TIERS.find((t) => t.id === selectedTier) || BILLING_TIERS[2];

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
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-primary/30 bg-background/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl z-10 text-foreground">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-300">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/40 mb-4">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="font-display text-2xl font-bold text-gold-gradient">
              Remediation Suite Unlocked
            </h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Your technical remediation plan for {report?.originCountry || "your infrastructure"}{" "}
              is now activated.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> Premium Technical Remediation
                </span>
                <h2 className="mt-2 font-display text-2xl font-bold text-gold-gradient">
                  Select Remediation Billing Tier
                </h2>
                <p className="text-xs text-muted-foreground">
                  Get actionable code fixes, DPA templates, and statutory compliance blueprints
                  tailored to your findings.
                </p>
              </div>

              {/* Currency Toggle */}
              <div className="flex items-center rounded-lg border border-border/80 bg-secondary/50 p-1 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setCurrency("USD")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    currency === "USD"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  USD ($)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    currency === "INR"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  INR (₹)
                </button>
              </div>
            </div>

            {/* Tiers Grid */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {BILLING_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const displayPrice = currency === "USD" ? tier.priceUsd : tier.priceInr;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/5"
                        : "border-border/60 bg-secondary/20 hover:border-border hover:bg-secondary/40"
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-3 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
                        {tier.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-foreground">{tier.name}</h3>
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-muted-foreground"
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="font-display text-2xl font-bold text-gold-gradient">
                          {displayPrice}
                        </span>
                        <span className="text-[11px] text-muted-foreground">/ domain audit</span>
                      </div>

                      <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                        {tier.description}
                      </p>

                      <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                        {tier.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Form & Activation */}
            <form
              onSubmit={handleCheckout}
              className="mt-6 rounded-xl border border-border/60 bg-secondary/20 p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
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
                        className="w-full rounded-lg border border-border bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Compliance Officer Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="legal@acme.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex flex-col items-stretch sm:items-end gap-1.5">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="btn-gold flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs uppercase tracking-[0.18em] font-semibold w-full sm:w-auto"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <Zap className="h-4 w-4 animate-spin" /> Provisioning...
                      </span>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Unlock {currentTier.name} (
                        {currency === "USD" ? currentTier.priceUsd : currentTier.priceInr})
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-muted-foreground text-center sm:text-right flex items-center justify-center sm:justify-end gap-1">
                    <Lock className="h-3 w-3 text-primary" /> Instant Technical Unlocking &amp;
                    Invoice Receipt
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
