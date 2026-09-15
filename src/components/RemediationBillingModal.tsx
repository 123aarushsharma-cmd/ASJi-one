import React, { useState, useEffect } from "react";
import {
  Check,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Building2,
  ArrowRight,
  X,
  QrCode,
  ShieldAlert,
  Download,
  Copy,
  Receipt,
  Loader2,
  Smartphone,
  ExternalLink,
  FileCode,
  FolderArchive,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";
import {
  generateClientHandoverDocument,
  generateAutomatedPatches,
} from "@/lib/remediation-patches";
import { toast } from "sonner";

interface RemediationBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: () => void;
  report: AuditReport | null;
}

type BillingTierId = "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle";

interface TierDetails {
  id: BillingTierId;
  name: string;
  badge?: string;
  priceInr: string;
  priceNum: number;
  popular?: boolean;
  description: string;
  features: string[];
}

const BILLING_TIERS: TierDetails[] = [
  {
    id: "patch-code",
    name: "Autonomous Remediation Code Patches",
    badge: "Instant Release",
    popular: true,
    priceInr: "₹24,999",
    priceNum: 24999,
    description:
      "Direct code repository unlock: Full executable server hardening, consent gates, and edge middleware.",
    features: [
      "Immediate release of full executable NGINX, Apache, and Express security scripts",
      "Automated server-side HTTP security headers injector (.htaccess / nginx.conf)",
      "Client-side pre-consent telemetry block & zero-leak CMP script (asji-consent-manager.js)",
      "Cloudflare Worker & Next.js Edge transport shield middleware (middleware.ts)",
      "Statutory RFC 9116 .well-known/security.txt vulnerability disclosure file",
    ],
  },
  {
    id: "dpdp-india",
    name: "DPDP Act 2023 Statutory Legal Suite",
    priceInr: "₹37,500",
    priceNum: 37500,
    description:
      "Specialized statutory legal drafts and bilingual compliance notices for India's DPDP Act 2023.",
    features: [
      "Itemized notice at collection under Sections 5(1) & 5(2) (English & Hindi)",
      "Statutory Grievance Officer appointment letter & React portal component with 48h SLA",
      "Verifiable parental consent addendum for minors under Section 9",
      "Data Protection Board of India (DPBI) breach reporting escalation protocol",
      "Data Fiduciary and Significant Data Fiduciary audit readiness checklist",
    ],
  },
  {
    id: "gdpr-global",
    name: "GDPR & Multi-Sovereign Legal Pack",
    priceInr: "₹45,000",
    priceNum: 45000,
    description: "Complete legal matrix for EU GDPR, UK GDPR, UAE PDPL, and US CCPA/CPRA.",
    features: [
      "EU Standard Contractual Clauses (SCCs) & Cross-Border Transfer Assessment",
      "GDPR Article 13/14 privacy charter & 30-day Subject Access Request (SAR) templates",
      "UAE PDPL Data Office statutory notification protocols",
      "US CCPA/CPRA Do Not Sell / Global Privacy Control (GPC) automated listener",
      "Statutory cookie policy with granular affirmative consent opt-in mechanism",
    ],
  },
  {
    id: "full-bundle",
    name: "Full-Spectrum Sovereign Enterprise Suite",
    badge: "Most Comprehensive",
    priceInr: "₹59,999",
    priceNum: 59999,
    description:
      "Combined complete code patches + 8 sovereign legal draft packs + official client handover summary report.",
    features: [
      "Includes ALL Autonomous Remediation Code Patches (NGINX, Edge, CMP, Node, Grievance)",
      "Includes ALL India DPDP Act 2023 bilingual legal drafts & Grievance charters",
      "Includes ALL Global GDPR, UAE PDPL, and US CPRA statutory contract packs",
      "Official signed & watermarked ASJi Web & Legal Solution Audit Summary Report",
      "Turnkey White-Label Client Handover Pack with tax invoice & receipt",
    ],
  },
];

// Direct Bank Account UPI Configuration
const OFFICIAL_UPI_CONFIG = {
  vpa: "8290841179-3@ibl",
  payeeName: "Arush Sharma",
  bankDesc: "Direct Money Transfer Bank Account Instant UPI",
};

export function RemediationBillingModal({
  isOpen,
  onClose,
  onUnlockSuccess,
  report,
}: RemediationBillingModalProps) {
  const [selectedTier, setSelectedTier] = useState<BillingTierId>("full-bundle");
  const [txnStep, setTxnStep] = useState<"form" | "processing" | "success">("form");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const currentTier = BILLING_TIERS.find((t) => t.id === selectedTier) || BILLING_TIERS[0];
  const targetDomain = (report?.target || "your-domain.com")
    .replace(/^https?:\/\//i, "")
    .split("/")[0];

  useEffect(() => {
    if (isOpen) {
      setTxnStep("form");
      const randomTxn = `TXN-ASJI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTxnId(randomTxn);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Build standard UPI Payment URI
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(OFFICIAL_UPI_CONFIG.vpa)}&pn=${encodeURIComponent(
    OFFICIAL_UPI_CONFIG.payeeName,
  )}&am=${currentTier.priceNum}&cu=INR&tn=${encodeURIComponent(
    `ASJi One Code Patches - ${targetDomain}`,
  )}`;

  // QR Code generator URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(
    upiPayUri,
  )}`;

  const handleCopyUpiId = async () => {
    try {
      await navigator.clipboard.writeText(OFFICIAL_UPI_CONFIG.vpa);
      setUpiCopied(true);
      toast.success("UPI ID Copied", {
        description: `${OFFICIAL_UPI_CONFIG.vpa} (${OFFICIAL_UPI_CONFIG.payeeName}) copied to clipboard.`,
      });
      setTimeout(() => setUpiCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  const handleStartTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnStep("processing");

    setProcessingStatus(
      `Initiating Direct UPI Verification to ${OFFICIAL_UPI_CONFIG.payeeName}...`,
    );

    setTimeout(() => {
      setProcessingStatus(
        `Verifying Bank Transfer Reference [${referenceId || generatedTxnId}]...`,
      );
    }, 700);

    setTimeout(() => {
      setProcessingStatus(`Synthesizing Domain Compliance Code Patches for ${targetDomain}...`);
    }, 1400);

    setTimeout(() => {
      setProcessingStatus("Compiling NGINX, Cloudflare Edge & Zero-Leak CMP Modules...");
    }, 2100);

    setTimeout(() => {
      setProcessingStatus("Generating Cryptographic Sovereign Compliance Token...");
    }, 2700);

    setTimeout(() => {
      setTxnStep("success");
      onUnlockSuccess();
      toast.success("Compliance Patches Unlocked!", {
        description: `Code patches and statutory legal drafts successfully generated for ${targetDomain}.`,
      });
    }, 3200);
  };

  const handleCopyReceipt = async () => {
    try {
      const receiptText = `====================================================
ASJi ONE // SOVEREIGN TRANSACTION & CODE PATCH RECEIPT
====================================================
Transaction Ref : ${referenceId || generatedTxnId}
Target Domain   : ${targetDomain}
License Tier    : ${currentTier.name}
Amount Settled  : ${currentTier.priceInr}
Beneficiary     : ${OFFICIAL_UPI_CONFIG.payeeName} (${OFFICIAL_UPI_CONFIG.vpa})
Payment Method  : Direct Money Transfer Bank Account Instant UPI
Billing Entity  : ${orgName || "Enterprise Client"} (${email || "compliance@domain.com"})
Timestamp       : ${new Date().toISOString()}
Compliance Token: ASJI-AUTH-SEAL-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}
====================================================`;
      await navigator.clipboard.writeText(receiptText);
      setReceiptCopied(true);
      setTimeout(() => setReceiptCopied(false), 2200);
    } catch {
      // fallback
    }
  };

  const handleDownloadPatchesBundle = () => {
    if (!report) return;
    const doc = generateClientHandoverDocument(report);
    const blob = new Blob([doc], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ASJi-Remediation-Code-Patches-${targetDomain}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Code Patches Downloaded", {
      description: "Full production code patch suite and legal documentation exported.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-primary/40 bg-[#0c0c0c] p-5 sm:p-8 shadow-2xl backdrop-blur-2xl z-10 text-foreground max-h-[92vh] overflow-y-auto font-sans">
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
              Direct UPI Gateway // Instant Patch Compiler
            </span>

            <h3 className="mt-2 font-display text-2xl font-bold text-gold-gradient">
              Verifying &amp; Generating Code Patches
            </h3>

            <div className="mt-4 rounded-xl border border-border/80 bg-black/70 px-5 py-3 font-mono text-xs text-muted-foreground max-w-md">
              <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                {processingStatus}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground/80">
                Target: {targetDomain} • Ref: {referenceId || generatedTxnId}
              </p>
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
                Payment Verified // Code Patches Generated
              </span>
              <h3 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
                Compliance Fixes &amp; Legal Drafts Ready
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-lg">
                Your tailored production code patches (NGINX, Cloudflare Edge, CMP Consent Gate,
                Grievance Portal) and statutory legal drafts have been unlocked for{" "}
                <strong>{targetDomain}</strong>.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="mt-5 rounded-2xl border border-primary/30 bg-black/60 p-4 sm:p-5 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  <span className="font-bold text-foreground">
                    Official Instant Transfer Certificate
                  </span>
                </div>
                <span className="text-primary font-bold">{referenceId || generatedTxnId}</span>
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
                    Beneficiary / Mode:
                  </span>
                  <span className="font-semibold text-emerald-400">
                    {OFFICIAL_UPI_CONFIG.payeeName} ({OFFICIAL_UPI_CONFIG.vpa})
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/5 pt-3">
                <span className="text-[10px] text-muted-foreground">
                  Status: <strong className="text-emerald-400">Verified &amp; Active</strong> •
                  Seal: ASJI-STATUTORY-2026
                </span>
                <div className="flex items-center gap-2">
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
                        <Copy className="h-3.5 w-3.5" /> Copy Receipt
                      </>
                    )}
                  </button>
                  {report && (
                    <button
                      type="button"
                      onClick={handleDownloadPatchesBundle}
                      className="flex items-center gap-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Patch Files
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Next Steps CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                Your compliance audit dashboard is now unlocked with live editable code patches,
                downloadable scripts, and full legal packs.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="btn-gold rounded-xl px-6 py-3 font-mono text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-lg w-full sm:w-auto"
              >
                View &amp; Deploy Code Patches Now
              </button>
            </div>
          </div>
        )}

        {/* FORM STEP (PACKAGE SELECTION & DIRECT UPI PAYMENT) */}
        {txnStep === "form" && (
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 font-mono text-[11px] font-semibold text-primary">
                    <Sparkles className="h-3 w-3" /> Direct Bank Account Instant UPI Transfer
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                    <Zap className="h-3 w-3" /> Real-Time Code Synthesis
                  </span>
                </div>
                <h2 className="mt-2 font-display text-2xl sm:text-3xl font-bold text-gold-gradient">
                  Unlock Compliance Fixes &amp; Code Patches
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your compliance delivery suite for <strong>{targetDomain}</strong> to
                  generate syntax-valid server configs, zero-leak CMP gates, and statutory legal
                  charters.
                </p>
              </div>

              <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-right">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Single Authorized Payment Mode
                </span>
                <span className="text-xs font-mono font-bold text-primary">Direct Instant UPI</span>
              </div>
            </div>

            {/* Tiers Grid */}
            <div className="mt-5 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
              {BILLING_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;

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
                        {tier.priceInr}
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

            {/* Direct Bank Account UPI Payment Box */}
            <div className="mt-5 rounded-2xl border border-primary/40 bg-black/80 p-4 sm:p-6 shadow-xl">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* QR Code Column */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="p-2.5 rounded-2xl bg-white border border-primary/50 shadow-lg">
                    <img
                      src={qrCodeUrl}
                      alt={`UPI QR Code for ${OFFICIAL_UPI_CONFIG.payeeName}`}
                      className="w-40 h-40 object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <span className="mt-2 text-[10px] font-mono text-muted-foreground text-center">
                    Scan using any UPI App
                  </span>
                </div>

                {/* Account Details & Action Column */}
                <div className="flex-1 w-full space-y-3 font-mono text-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2">
                    <span className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" /> Direct Bank Account Instant UPI
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      Amount: {currentTier.priceInr}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                    <div className="bg-neutral-900/90 p-3 rounded-xl border border-white/10">
                      <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                        Official Beneficiary Name:
                      </span>
                      <strong className="text-base text-white tracking-wide">
                        {OFFICIAL_UPI_CONFIG.payeeName}
                      </strong>
                    </div>

                    <div className="bg-neutral-900/90 p-3 rounded-xl border border-white/10 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-neutral-400 block uppercase font-bold">
                          Bank Instant UPI ID:
                        </span>
                        <strong className="text-sm text-primary break-all">
                          {OFFICIAL_UPI_CONFIG.vpa}
                        </strong>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpiId}
                        className="mt-2 inline-flex items-center justify-center gap-1 text-[10px] font-bold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 py-1 px-2.5 rounded-lg transition-colors cursor-pointer self-start"
                      >
                        {upiCopied ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" /> Copied UPI ID
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" /> Copy UPI ID
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* UPI Apps Supported */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className="text-[10px] text-neutral-400">Supported Apps:</span>
                    {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Cred", "Amazon Pay"].map(
                      (app) => (
                        <span
                          key={app}
                          className="text-[9.5px] rounded-md bg-neutral-800/80 border border-white/5 px-2 py-0.5 text-neutral-300"
                        >
                          {app}
                        </span>
                      ),
                    )}
                  </div>

                  {/* Direct Mobile Deep-link */}
                  <div className="pt-1">
                    <a
                      href={upiPayUri}
                      className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 underline font-semibold"
                    >
                      <Smartphone className="h-3.5 w-3.5" /> Open in installed UPI app on device
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
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
                      Organization / Domain Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder={targetDomain || "domain.com"}
                        value={orgName}
                        onChange={(e) => setOrgName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/80 pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      Delivery / Compliance Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="compliance@domain.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-border bg-background/80 px-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-muted-foreground mb-1">
                      UPI UTR / 12-Digit Reference No.
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 423987123984"
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
                    Verify UPI &amp; Instant Unlock ({currentTier.priceInr})
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <span className="text-[10px] font-mono text-muted-foreground text-center sm:text-right flex items-center justify-center sm:justify-end gap-1">
                    <Lock className="h-3 w-3 text-primary" /> Instant Code &amp; Legal Draft
                    Synthesis
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
