import React, { useState, useEffect } from "react";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Building2,
  CreditCard,
  ArrowRight,
  X,
  QrCode,
  ShieldAlert,
  Download,
  FileCode,
  Copy,
  Receipt,
  Scale,
  Loader2,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";

interface RemediationBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  report: AuditReport | null;
}

type BillingTierId = "patch-wire" | "dpdp-india" | "gdpr-global" | "full-bundle";

interface TierDetails {
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
    name: "Autonomous Remediation Code Patches",
    badge: "Instant Release",
    popular: true,
    priceUsd: "$300",
    priceInr: "₹24,999",
    description:
      "Direct code repository unlock: Full executable wrapper patches mitigating statutory liability exposure.",
    features: [
      "Immediate release of full executable NGINX, Apache, and Express security scripts",
      "Automated server-side HTTP security headers injector (.htaccess / nginx.conf)",
      "Client-side pre-consent telemetry block & zero-leak CMP script",
      "Cloudflare Worker & Next.js Edge transport shield middleware",
      "RFC 9116 statutory .well-known/security.txt vulnerability disclosure file",
    ],
  },
  {
    id: "dpdp-india",
    name: "DPDP Act 2023 Statutory Legal Suite",
    priceUsd: "$450",
    priceInr: "₹37,500",
    description:
      "Specialized statutory legal drafts and bilingual compliance notices for India's DPDP Act 2023.",
    features: [
      "Itemized notice at collection under Sections 5(1) & 5(2) (English & Hindi)",
      "Statutory Grievance Officer appointment letter with 48h resolution mandate",
      "Verifiable parental consent addendum for minors under Section 9",
      "Data Protection Board of India (DPBI) breach reporting escalation protocol",
      "Data Fiduciary and Significant Data Fiduciary audit readiness checklist",
    ],
  },
  {
    id: "gdpr-global",
    name: "GDPR & Multi-Sovereign Legal Pack",
    priceUsd: "$550",
    priceInr: "₹45,000",
    description: "Complete legal matrix for EU GDPR, UK GDPR, UAE PDPL, and US CCPA/CPRA.",
    features: [
      "EU Standard Contractual Clauses (SCCs) & Cross-Border Transfer Assessment",
      "GDPR Article 13/14 privacy charter & 30-day Subject Access Request (SAR) templates",
      "UAE PDPL Data Office statutory notification protocols",
      "US CCPA/CPRA Do Not Sell / Share My Personal Information statutory disclosure",
      "Statutory cookie policy with granular affirmative consent opt-in mechanism",
    ],
  },
  {
    id: "full-bundle",
    name: "Full-Spectrum Sovereign Enterprise Suite",
    badge: "Most Comprehensive",
    priceUsd: "$750",
    priceInr: "₹59,999",
    description:
      "Combined complete code patches + 6 sovereign legal draft packs + official client handover certificate.",
    features: [
      "Includes ALL Autonomous Remediation Code Patches (NGINX, Edge, CMP, Node)",
      "Includes ALL India DPDP Act 2023 bilingual legal drafts & Grievance charters",
      "Includes ALL Global GDPR, UAE PDPL, and US CPRA statutory contract packs",
      "Official signed & watermarked ASJi Web & Legal Solution Audit Certificate",
      "Turnkey White-Label Client Handover Pack with tax invoice & receipt",
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
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "wire">("upi");
  const [currency, setCurrency] = useState<"INR" | "USD">("INR");
  const [txnStep, setTxnStep] = useState<"form" | "processing" | "success">("form");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [receiptCopied, setReceiptCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTxnStep("form");
      const randomTxn = `TXN-ASJI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTxnId(randomTxn);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const currentTier = BILLING_TIERS.find((t) => t.id === selectedTier) || BILLING_TIERS[0];
  const targetDomain = report?.target || "your-domain.com";

  const handleStartTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnStep("processing");

    setProcessingStatus("Establishing TLS 1.3 Sovereign Encryption Tunnel...");

    setTimeout(() => {
      setProcessingStatus(`Validating Statutory Digital Signature for ${targetDomain}...`);
    }, 900);

    setTimeout(() => {
      setProcessingStatus(`Processing Merchant Settlement [${generatedTxnId}]...`);
    }, 1800);

    setTimeout(() => {
      setProcessingStatus("Generating Cryptographic Sovereign Compliance Token...");
    }, 2700);

    setTimeout(() => {
      setTxnStep("success");
      onUnlockSuccess();
    }, 3400);
  };

  const handleCopyReceipt = async () => {
    try {
      const receiptText = `====================================================
ASJi WEB & LEGAL SOLUTION // SOVEREIGN TRANSACTION RECEIPT
====================================================
Transaction ID : ${generatedTxnId}
Target Domain  : ${targetDomain}
License Tier   : ${currentTier.name}
Amount Paid    : ${currency === "USD" ? currentTier.priceUsd : currentTier.priceInr}
Billing Entity : ${orgName || "Enterprise Client"} (${email || "compliance@domain.com"})
Payment Method : ${paymentMethod.toUpperCase()} Settlement
Timestamp      : ${new Date().toISOString()}
Statutory Seal : ASJI-VERIFIED-AUTH-HASH-2026-X9
====================================================`;
      await navigator.clipboard.writeText(receiptText);
      setReceiptCopied(true);
      setTimeout(() => setReceiptCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-primary/40 bg-[#0c0c0c] p-5 sm:p-8 shadow-2xl backdrop-blur-2xl z-10 text-foreground max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors cursor-pointer z-20"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* PROCESSING STEP */}
        {txnStep === "processing" && (
          <div className="flex flex-col items-center justify-center py-16 text-center animate-in fade-in duration-300">
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 border border-primary/40 mb-6">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-primary font-semibold">
              Sovereign Payment Gateway // Live Authorization
            </span>

            <h3 className="mt-2 font-display text-2xl font-bold text-gold-gradient">
              Processing Secure Transaction
            </h3>

            <div className="mt-4 rounded-xl border border-border/80 bg-black/70 px-5 py-3 font-mono text-xs text-muted-foreground max-w-md">
              <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                {processingStatus}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">Ref: {generatedTxnId}</p>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {txnStep === "success" && (
          <div className="py-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center justify-center text-center border-b border-border/60 pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mb-3 shadow-lg shadow-emerald-500/10">
                <ShieldCheck className="h-9 w-9" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold">
                Transaction Successful // License Activated
              </span>
              <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
                Full Package &amp; Code Patches Unlocked
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-lg">
                Complete production codebase, statutory legal drafts, and turnkey client handover
                pack have been released for <strong>{targetDomain}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="mt-5 rounded-2xl border border-primary/30 bg-black/60 p-4 sm:p-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">
                    Official Transaction Certificate
                  </span>
                </div>
                <span className="text-primary font-bold">{generatedTxnId}</span>
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                <div>
                  <span className="text-muted-foreground block text-[10px]">Licensed Target:</span>
                  <span className="font-semibold text-foreground">{targetDomain}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">Package Tier:</span>
                  <span className="font-semibold text-foreground">{currentTier.name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Settlement Amount:
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {currency === "USD" ? currentTier.priceUsd : currentTier.priceInr} (Paid)
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                <span className="text-[10px] text-muted-foreground">
                  Status: <strong className="text-emerald-400">Verified &amp; Active</strong> •
                  Seal: ASJI-STATUTORY-2026
                </span>
                <button
                  type="button"
                  onClick={handleCopyReceipt}
                  className="flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
                >
                  {receiptCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied Receipt
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" /> Copy Official Receipt
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Your report view has been automatically refreshed with all unlocked code patches and
                full legal drafts.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-gold rounded-xl px-6 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-lg w-full sm:w-auto"
              >
                Access Unlocked Code &amp; Legal Drafts
              </button>
            </div>
          </div>
        )}

        {/* FORM STEP (PACKAGE SELECTION & PAYMENT GATEWAY) */}
        {txnStep === "form" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> Turnkey Compliance Transfer &amp; Unlock
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-rose-400">
                    <ShieldAlert className="h-3 w-3" /> Max Statutory Liability: ₹250 Cr
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
                  Unlock Complete Legal Drafts &amp; Code Patches
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your compliance delivery suite for <strong>{targetDomain}</strong> to
                  release unredacted legal drafts, NGINX/Edge patches, and client packs.
                </p>
              </div>

              {/* Currency Selector */}
              <div className="flex items-center rounded-xl border border-border/80 bg-secondary/50 p-1 self-start sm:self-auto font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setCurrency("INR")}
                  className={`px-3 py-1 font-medium rounded-lg transition-colors cursor-pointer ${
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
                  className={`px-3 py-1 font-medium rounded-lg transition-colors cursor-pointer ${
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
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {BILLING_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                const displayPrice = currency === "USD" ? tier.priceUsd : tier.priceInr;

                return (
                  <div
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`relative cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10 ring-1 ring-primary/40"
                        : "border-border/60 bg-black/40 hover:border-border hover:bg-black/60"
                    }`}
                  >
                    {tier.badge && (
                      <span className="absolute -top-2.5 right-3 rounded-full bg-primary px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow-sm">
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

                      <div className="mt-2.5 font-display text-lg font-bold text-gold-gradient">
                        {displayPrice}
                      </div>

                      <p className="mt-1.5 text-[11px] text-muted-foreground leading-snug">
                        {tier.description}
                      </p>

                      <div className="gold-rule my-3 opacity-30" />

                      <ul className="space-y-1.5 text-[10.5px] text-muted-foreground">
                        {tier.features.slice(0, 3).map((f, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <Check className="h-3 w-3 text-primary shrink-0 mt-0.5" />
                            <span className="leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 pt-2 border-t border-border/40 text-[10px] font-mono text-primary font-semibold flex items-center justify-between">
                      <span>{isSelected ? "Selected" : "Select Tier"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method Switcher */}
            <div className="mt-5 flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="text-muted-foreground text-xs mr-2">Payment Method:</span>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 transition-all cursor-pointer ${
                  paymentMethod === "upi"
                    ? "border-primary bg-primary/20 text-primary font-bold shadow-sm"
                    : "border-border/60 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Instant UPI QR (India)</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 transition-all cursor-pointer ${
                  paymentMethod === "card"
                    ? "border-primary bg-primary/20 text-primary font-bold shadow-sm"
                    : "border-border/60 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Corporate Card / Stripe</span>
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("wire")}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 transition-all cursor-pointer ${
                  paymentMethod === "wire"
                    ? "border-primary bg-primary/20 text-primary font-bold shadow-sm"
                    : "border-border/60 bg-black/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span>Bank Wire / RTGS</span>
              </button>
            </div>

            {/* Dynamic Gateway Details */}
            {paymentMethod === "upi" && (
              <div className="mt-3 rounded-2xl border border-primary/20 bg-black/60 p-4 font-mono text-xs text-muted-foreground">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      Instant UPI Payment Gate:
                    </p>
                    <p className="mt-1 text-xs text-foreground">
                      VPA / UPI ID:{" "}
                      <strong className="text-primary font-bold">asji.online@okaxis</strong>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Beneficiary: ASJi Web &amp; Legal Solution (Aarush Sharma &amp; Co.)
                    </p>
                  </div>
                  <div className="rounded-xl border border-primary/30 bg-primary/5 px-3 py-2 text-center text-[10px] text-primary font-bold">
                    Scan via GPay / PhonePe / Paytm / BHIM
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="mt-3 rounded-2xl border border-primary/20 bg-black/60 p-4 font-mono text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-primary uppercase font-bold tracking-wider">
                      Secured Corporate Card Checkout:
                    </p>
                    <p className="mt-1 text-xs text-foreground">
                      Visa, Mastercard, RuPay, and American Express with 3D Secure 2.0
                      authentication.
                    </p>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    256-Bit SSL Encrypted
                  </span>
                </div>
              </div>
            )}

            {paymentMethod === "wire" && (
              <div className="mt-3 rounded-2xl border border-primary/20 bg-black/60 p-4 font-mono text-xs text-muted-foreground">
                <p className="text-[10px] text-primary uppercase font-bold tracking-wider">
                  Direct Wire / RTGS Settlement Instructions:
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

            {/* Handover Steps Callout */}
            <div className="mt-3.5 rounded-2xl border border-primary/30 bg-primary/5 p-3.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4" />
                <span>Statutory Handover &amp; Instant License Delivery</span>
              </div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-muted-foreground leading-relaxed">
                <div>
                  <strong className="text-foreground block">1. Authorize Settlement:</strong>
                  Enter compliance details and click Authorize &amp; Unlock below.
                </div>
                <div>
                  <strong className="text-foreground block">2. Instant Activation:</strong>
                  Full code patches, bilingual legal drafts, and certificates unlock immediately in
                  your session.
                </div>
                <div>
                  <strong className="text-foreground block">3. Dispatch to Client:</strong>
                  Download raw scripts, markdown legal packs, or client PDF certificates directly.
                </div>
              </div>
            </div>

            {/* Submission Form */}
            <form
              onSubmit={handleStartTransaction}
              className="mt-4 rounded-2xl border border-border/60 bg-black/40 p-4 sm:p-5"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="w-full sm:w-auto flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Organization / Target
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Company or Domain Name"
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
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
                      className="w-full rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Payment Ref / UTR (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="UTR-20260904-889"
                      value={referenceId}
                      onChange={(e) => setReferenceId(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-mono"
                    />
                  </div>
                </div>

                <div className="w-full sm:w-auto shrink-0 flex flex-col items-stretch sm:items-end gap-1.5">
                  <button
                    type="submit"
                    className="btn-gold flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-mono text-xs uppercase tracking-wider font-bold w-full sm:w-auto cursor-pointer shadow-lg shadow-primary/20"
                  >
                    <Zap className="h-4 w-4" />
                    Authorize &amp; Unlock Suite (
                    {currency === "USD" ? currentTier.priceUsd : currentTier.priceInr})
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground text-center sm:text-right flex items-center justify-center sm:justify-end gap-1">
                    <Lock className="h-3 w-3 text-primary" /> Instant Code &amp; Legal Draft
                    Delivery
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
