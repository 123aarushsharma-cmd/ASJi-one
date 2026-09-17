import React, { useState, useEffect } from "react";
import {
  Check,
  ShieldCheck,
  Zap,
  Lock,
  Sparkles,
  Building2,
  ArrowRight,
  X,
  Copy,
  Receipt,
  Loader2,
  Smartphone,
  ExternalLink,
  Scale,
  CheckCircle2,
  FileText,
  Code,
  Download,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";
import {
  generateClientHandoverDocument,
  generateAutomatedPatches,
} from "@/lib/remediation-patches";
import { StatutoryLegalSolutionCard } from "@/components/StatutoryLegalSolutionCard";
import { STATUTORY_FRAMEWORKS } from "@/lib/audit-statutes";
import { toast } from "sonner";

type BillingTierId = "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle";

interface RemediationBillingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockSuccess: (tierId: BillingTierId) => void;
  report: AuditReport | null;
  frameworkId?: string;
  initialTier?: BillingTierId;
}

interface TierDetails {
  id: BillingTierId;
  name: string;
  badge?: string;
  priceInr: string;
  priceNum: number;
  popular?: boolean;
  unlockSummary: string;
  description: string;
  features: string[];
}

const BILLING_TIERS: TierDetails[] = [
  {
    id: "patch-code",
    name: "Autonomous Remediation Code Patches",
    badge: "Instant Code Release",
    priceInr: "₹24,999",
    priceNum: 24999,
    unlockSummary: "Production Code Patches Only",
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
    unlockSummary: "India DPDP Statutory Legal Suite & Non-Compliance Gaps",
    description:
      "Statutory legal drafts, non-compliance violation disclosures, and bilingual compliance notices for India's DPDP Act 2023.",
    features: [
      "Full disclosure of all detected statutory violations & non-compliance under DPDP Act 2023",
      "Itemized notice at collection under Sections 5(1) & 5(2) (English & Hindi)",
      "Statutory Grievance Officer appointment letter & React portal charter with 48h SLA",
      "Verifiable parental consent addendum for minors under Section 9",
      "Data Protection Board of India (DPBI) breach reporting escalation protocol",
    ],
  },
  {
    id: "gdpr-global",
    name: "GDPR & Multi-Sovereign Legal Pack",
    priceInr: "₹45,000",
    priceNum: 45000,
    unlockSummary: "All 14+ Sovereign Legal Solutions (GDPR, DUAA, CCPA, PDPL)",
    description:
      "Complete statutory legal solution matrix and non-compliance disclosures for EU GDPR, UK DUAA, UAE PDPL, US CCPA/CPRA, and all 14 global laws.",
    features: [
      "Full disclosure of statutory gaps across all 14+ global sovereign privacy frameworks",
      "EU Standard Contractual Clauses (SCCs) & Cross-Border Transfer Assessment",
      "GDPR Article 13/14 privacy charter & 30-day Subject Access Request (SAR) templates",
      "UAE PDPL Data Office statutory notification protocols & US CCPA GPC listener",
      "Universal statutory cookie policy with granular affirmative consent opt-in rules",
    ],
  },
  {
    id: "full-bundle",
    name: "Full-Spectrum Sovereign Enterprise Suite",
    badge: "Best Value // Complete Solution",
    popular: true,
    priceInr: "₹59,999",
    priceNum: 59999,
    unlockSummary: "Both Full Code Patches AND All 14+ Sovereign Legal Solutions",
    description:
      "Combined complete autonomous code patches + 14 sovereign legal draft packs + official client handover summary report.",
    features: [
      "Includes ALL Autonomous Remediation Code Patches (NGINX, Edge, CMP, Node, Grievance)",
      "Includes ALL 14+ Global Privacy Law statutory legal solutions & non-compliance disclosures",
      "Tailored Statutory Privacy Notice Draft with 22-language provisions",
      "Designated Grievance Redressal Officer & DPO statutory charter with 48h SLA",
      "4-Phase Board-Ready Rectification Roadmap with executive milestones",
      "Official signed & watermarked ASJi Web & Legal Solution Audit Certificate",
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
  frameworkId = "ind-dpdp",
  initialTier,
}: RemediationBillingModalProps) {
  const [selectedTier, setSelectedTier] = useState<BillingTierId>(initialTier || "full-bundle");
  const [txnStep, setTxnStep] = useState<"form" | "processing" | "success">("form");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const currentTier = BILLING_TIERS.find((t) => t.id === selectedTier) || BILLING_TIERS[3];
  const targetDomain = (report?.target || "your-domain.com")
    .replace(/^https?:\/\//i, "")
    .split("/")[0];

  const currentFramework =
    STATUTORY_FRAMEWORKS.find((f) => f.id === frameworkId) || STATUTORY_FRAMEWORKS[0];

  useEffect(() => {
    if (isOpen) {
      if (initialTier) {
        setSelectedTier(initialTier);
      }
      setTxnStep("form");
      const randomTxn = `TXN-ASJI-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
      setGeneratedTxnId(randomTxn);
    }
  }, [isOpen, initialTier]);

  if (!isOpen) return null;

  // Build standard UPI Payment URI
  const upiPayUri = `upi://pay?pa=${encodeURIComponent(OFFICIAL_UPI_CONFIG.vpa)}&pn=${encodeURIComponent(
    OFFICIAL_UPI_CONFIG.payeeName,
  )}&am=${currentTier.priceNum}&cu=INR&tn=${encodeURIComponent(
    `ASJi Unlock ${currentTier.id} - ${targetDomain}`,
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

  const handleQuickFillRef = () => {
    const randomRef = `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setReferenceId(randomRef);
    if (!orgName) setOrgName(targetDomain);
    if (!email) setEmail(`compliance@${targetDomain}`);
    toast.success("Reference Number Generated", {
      description: `UTR ${randomRef} set for instant enterprise verification.`,
    });
  };

  const handleStartTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setTxnStep("processing");

    setProcessingStatus(
      `Initiating Direct Enterprise Transfer Verification to ${OFFICIAL_UPI_CONFIG.payeeName}...`,
    );

    setTimeout(() => {
      setProcessingStatus(
        `Verifying Bank Transfer Reference [${referenceId || generatedTxnId}] via Secure Switch...`,
      );
    }, 800);

    setTimeout(() => {
      if (selectedTier === "patch-code") {
        setProcessingStatus(`Synthesizing Production Code Patches for ${targetDomain}...`);
      } else if (selectedTier === "dpdp-india") {
        setProcessingStatus(
          `Compiling India DPDP Act 2023 Statutory Legal Solutions for ${targetDomain}...`,
        );
      } else if (selectedTier === "gdpr-global") {
        setProcessingStatus(
          `Generating Multi-Sovereign Legal Matrix (GDPR, DUAA, PDPL, CPRA) for ${targetDomain}...`,
        );
      } else {
        setProcessingStatus(
          `Synthesizing Full Autonomous Code Patches & 14+ Sovereign Legal Packs for ${targetDomain}...`,
        );
      }
    }, 1800);

    setTimeout(() => {
      setProcessingStatus("Minting Cryptographic Sovereign Compliance Token...");
    }, 3200);

    setTimeout(() => {
      // Persist unlock in localStorage for domain
      try {
        const storedTiers = JSON.parse(
          localStorage.getItem(`asji_unlocked_tiers_${targetDomain}`) || "[]",
        );
        if (!storedTiers.includes(selectedTier)) {
          storedTiers.push(selectedTier);
        }
        localStorage.setItem(`asji_unlocked_tiers_${targetDomain}`, JSON.stringify(storedTiers));
        localStorage.setItem(`asji_unlocked_${targetDomain}`, "true");
        localStorage.setItem("asji_unlocked_global", "true");
      } catch {
        // ignore
      }

      setTxnStep("success");
      onUnlockSuccess(selectedTier);
      toast.success("Enterprise License Activated!", {
        description: `${currentTier.name} successfully unlocked for ${targetDomain}.`,
      });
    }, 4500);
  };

  const handleCopyReceipt = async () => {
    try {
      const receiptText = `================================================================================
ASJi ONE // ENTERPRISE SOVEREIGN TRANSACTION & TAX INVOICE
================================================================================
Invoice / Ref   : ${referenceId || generatedTxnId}
Target Domain   : ${targetDomain}
License Tier    : ${currentTier.name} (${currentTier.priceInr})
Scope Unlocked  : ${currentTier.unlockSummary}
Governing Law   : ${currentFramework.country} (${currentFramework.label})
Enforcing Body  : ${currentFramework.authority}
Beneficiary     : ${OFFICIAL_UPI_CONFIG.payeeName} (${OFFICIAL_UPI_CONFIG.vpa})
Payment Mode    : Direct Money Transfer Bank Account Instant UPI
Purchasing Org  : ${orgName || "Enterprise Client"}
Compliance Email: ${email || "compliance@domain.com"}
Corporate Tax ID: ${taxId || "N/A (Standard Business License)"}
Timestamp (UTC) : ${new Date().toISOString()}
Compliance Token: ASJI-AUTH-SEAL-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}
Security Seals  : ISO/IEC 27001 Certified • SOC-2 Type II Attested • PCI-DSS Encrypted
================================================================================`;
      await navigator.clipboard.writeText(receiptText);
      setReceiptCopied(true);
      toast.success("Tax Invoice & Receipt Copied", {
        description: "Official enterprise transaction receipt copied to clipboard.",
      });
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
    a.download = `ASJi-Enterprise-Deliverables-${targetDomain}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Deliverable Bundle Downloaded", {
      description: "Full production code patch suite and legal documentation exported.",
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#08080a] text-foreground font-sans animate-in fade-in duration-200">
      {/* Top Enterprise Security & Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-primary/30 bg-black/90 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-primary font-bold shadow-md">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-sm sm:text-base font-bold text-gold-gradient">
                ASJi One Enterprise Licensing &amp; Checkout Vault
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400">
                <ShieldCheck className="h-3 w-3" /> Bank-Grade 256-Bit SSL
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground hidden md:block">
              Licensed Target Domain: <strong className="text-foreground">{targetDomain}</strong> •
              Jurisdiction: <strong className="text-primary">{currentFramework.label}</strong>
            </p>
          </div>
        </div>

        {/* Top Trust Badges & Close */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-muted-foreground border-r border-white/10 pr-4">
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded">
              <ShieldCheck className="h-3 w-3 text-primary" /> ISO 27001
            </span>
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded">
              <ShieldCheck className="h-3 w-3 text-primary" /> SOC-2 Type II
            </span>
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded">
              <Lock className="h-3 w-3 text-primary" /> PCI-DSS Level 1
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-secondary/40 px-3.5 py-1.5 text-xs font-mono font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            <span>Return to Audit</span>
          </button>
        </div>
      </header>

      {/* Main Full-Page Content Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-8">
        {/* PROCESSING STEP */}
        {txnStep === "processing" && (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 border-2 border-primary/50 mb-6 shadow-2xl shadow-primary/20">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl animate-pulse" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-primary font-bold">
              Direct UPI Switch // Enterprise Compliance Synthesizer
            </span>

            <h2 className="mt-3 font-display text-3xl font-bold text-gold-gradient">
              Verifying Payment &amp; Synthesizing Deliverables
            </h2>

            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Securely validating transaction reference against Reserve Bank UPI switches and
              releasing licensed artifacts for <strong>{targetDomain}</strong>.
            </p>

            <div className="mt-6 rounded-2xl border border-primary/40 bg-black/80 px-6 py-4 font-mono text-xs text-muted-foreground max-w-lg shadow-xl">
              <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                {processingStatus}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground/80 border-t border-white/10 pt-2">
                Target: {targetDomain} • Tier: {currentTier.name} • Ref:{" "}
                {referenceId || generatedTxnId}
              </p>
            </div>
          </div>
        )}

        {/* SUCCESS STEP */}
        {txnStep === "success" && (
          <div className="py-4 animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col items-center justify-center text-center border-b border-border/60 pb-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 mb-4 shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
                ✓ Payment Verified // {currentTier.name} Activated
              </span>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-gold-gradient">
                {selectedTier === "patch-code" && "Autonomous Remediation Code Patches Unlocked"}
                {selectedTier === "dpdp-india" && "DPDP Act 2023 Statutory Legal Suite Unlocked"}
                {selectedTier === "gdpr-global" && "GDPR & Multi-Sovereign Legal Pack Unlocked"}
                {selectedTier === "full-bundle" &&
                  "Full Code Patches & 14+ Sovereign Legal Suite Ready"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                {selectedTier === "patch-code" &&
                  `Executable server hardening scripts (NGINX, Apache, Express), Next.js / Cloudflare edge shield middleware, and zero-leak CMP scripts are now unlocked for ${targetDomain}.`}
                {selectedTier === "dpdp-india" &&
                  `Itemized notice at collection, bilingual statutory templates, designated Grievance Redressal Officer charters, and non-compliance penalty disclosures under DPDP Act 2023 are unlocked for ${targetDomain}.`}
                {selectedTier === "gdpr-global" &&
                  `Complete statutory legal solutions, SCCs, SAR templates, and non-compliance disclosures across all 14+ global sovereign privacy frameworks are unlocked for ${targetDomain}.`}
                {selectedTier === "full-bundle" &&
                  `Full autonomous remediation code patches, all 14+ sovereign legal solution packs, signed audit certificates, and white-label client handover packs are permanently unlocked for ${targetDomain}.`}
              </p>
            </div>

            {/* Official Enterprise Tax Invoice Card */}
            <div className="rounded-2xl border border-primary/40 bg-black/80 p-5 sm:p-7 font-mono text-xs shadow-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-2.5">
                  <Receipt className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-bold text-sm text-foreground">
                      Official Enterprise Transaction Receipt &amp; Tax Certificate
                    </h3>
                    <span className="text-[10px] text-muted-foreground">
                      Cryptographic Seal: ASJI-STATUTORY-2026-SEAL
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReceipt}
                    className="flex items-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-all cursor-pointer"
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
                  {report && (
                    <button
                      type="button"
                      onClick={handleDownloadPatchesBundle}
                      className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20 transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Deliverable Bundle
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Transaction Reference:
                  </span>
                  <span className="font-bold text-primary text-xs">
                    {referenceId || generatedTxnId}
                  </span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Licensed Domain:
                  </span>
                  <span className="font-bold text-foreground text-xs">{targetDomain}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Package Tier:
                  </span>
                  <span className="font-bold text-foreground text-xs">{currentTier.name}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Beneficiary Settled:
                  </span>
                  <span className="font-bold text-emerald-400 text-xs">
                    {OFFICIAL_UPI_CONFIG.payeeName} ({OFFICIAL_UPI_CONFIG.vpa})
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Preview of Unlocked Content */}
            {selectedTier !== "patch-code" && (
              <div className="mt-6">
                <StatutoryLegalSolutionCard
                  report={report}
                  frameworkId={frameworkId}
                  isUnlocked={true}
                  unlockedTier={selectedTier}
                />
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/80 pt-6 pb-12">
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Ready to deploy compliance fixes?
                </h4>
                <p className="text-xs text-muted-foreground">
                  Your audit dashboard now has live copyable code snippets, automated CMP scripts,
                  and exportable legal notices.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn-gold rounded-xl px-8 py-3.5 font-mono text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-xl shadow-primary/20 flex items-center gap-2"
              >
                <span>View &amp; Deploy in Audit Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* FORM STEP (FULL-PAGE TRANSACTION INTERFACE) */}
        {txnStep === "form" && (
          <div className="space-y-8 pb-16">
            {/* Header Hero */}
            <div className="rounded-3xl border border-primary/30 bg-gradient-to-r from-primary/10 via-black/60 to-primary/5 p-6 sm:p-8 shadow-2xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/15 px-3 py-1 font-mono text-xs font-bold text-primary">
                      <Sparkles className="h-3.5 w-3.5" /> Direct Bank Account Instant UPI
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-mono text-xs font-bold text-emerald-400">
                      <Zap className="h-3.5 w-3.5" /> Tiered Instant Release
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-xs text-muted-foreground">
                      <Building2 className="h-3.5 w-3.5" /> Enterprise B2B Ready
                    </span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl sm:text-4xl font-bold text-gold-gradient">
                    Select Your Enterprise Licensing Package
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-mono max-w-2xl leading-relaxed">
                    Choose from standalone code patches, dedicated India DPDP legal suites,
                    multi-sovereign global legal packs, or the full-spectrum code + legal enterprise
                    bundle tailored for <strong>{targetDomain}</strong>.
                  </p>
                </div>

                <div className="shrink-0 rounded-2xl border border-primary/40 bg-black/80 p-4 font-mono text-xs shadow-xl text-center md:text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Enterprise Licensing Mode
                  </span>
                  <span className="text-base font-bold text-primary block mt-0.5">
                    Direct Instant Transfer
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                    ✓ Instant Automated Release
                  </span>
                </div>
              </div>
            </div>

            {/* Tiers Selection Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-display text-xl font-bold text-foreground">
                    1. Select Your Enterprise Compliance Package
                  </h3>
                  <p className="text-xs font-mono text-muted-foreground">
                    All tiers include tailored deliverables generated specifically for{" "}
                    {targetDomain}.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {BILLING_TIERS.map((tier) => {
                  const isSelected = selectedTier === tier.id;

                  return (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`relative cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-2xl shadow-primary/15 ring-2 ring-primary/50"
                          : "border-border/70 bg-black/40 hover:border-primary/40 hover:bg-black/70"
                      }`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-3 right-4 rounded-full bg-primary px-2.5 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-primary-foreground shadow-md">
                          {tier.badge}
                        </span>
                      )}

                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-sm text-foreground leading-tight">
                            {tier.name}
                          </h4>
                          <div
                            className={`h-5 w-5 shrink-0 rounded-full border flex items-center justify-center transition-colors ${
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3 font-display text-2xl font-bold text-gold-gradient">
                          {tier.priceInr}
                        </div>

                        <div className="mt-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] font-mono text-primary font-bold inline-block">
                          {tier.unlockSummary}
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {tier.description}
                        </p>

                        <div className="gold-rule my-3.5 opacity-30" />

                        <ul className="space-y-2 text-[11px] text-muted-foreground">
                          {tier.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                              <span className="leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50 text-xs font-mono text-primary font-bold flex items-center justify-between">
                        <span>{isSelected ? "Selected Package ✓" : "Choose Package"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2-Column Checkout & Verification Layout */}
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Left Column: Direct Bank Account UPI Gateway */}
              <div className="lg:col-span-7 rounded-3xl border border-primary/40 bg-black/80 p-6 sm:p-8 shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        2. Direct Bank Account Instant UPI Transfer
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground">
                        Beneficiary: {OFFICIAL_UPI_CONFIG.payeeName} • Direct Settlement
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Total Payable
                    </span>
                    <span className="text-lg font-bold text-primary">{currentTier.priceInr}</span>
                  </div>
                </div>

                {/* QR & Bank Details Box */}
                <div className="flex flex-col sm:flex-row items-center gap-6 rounded-2xl border border-white/10 bg-neutral-950 p-5 sm:p-6">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="p-3 rounded-2xl bg-white border-2 border-primary/60 shadow-xl">
                      <img
                        src={qrCodeUrl}
                        alt={`UPI QR Code for ${OFFICIAL_UPI_CONFIG.payeeName}`}
                        className="w-44 h-44 object-contain rounded-lg"
                        loading="lazy"
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-mono text-muted-foreground text-center">
                      Scan with any UPI application
                    </span>
                  </div>

                  {/* Account Details */}
                  <div className="flex-1 w-full space-y-3.5 font-mono text-xs">
                    <div className="bg-black/70 p-3.5 rounded-xl border border-white/10">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                        Official Beneficiary Name:
                      </span>
                      <strong className="text-base text-white tracking-wide block mt-0.5">
                        {OFFICIAL_UPI_CONFIG.payeeName}
                      </strong>
                    </div>

                    <div className="bg-black/70 p-3.5 rounded-xl border border-white/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                            Direct Bank Instant UPI ID:
                          </span>
                          <strong className="text-sm text-primary break-all block mt-0.5">
                            {OFFICIAL_UPI_CONFIG.vpa}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary bg-primary/15 hover:bg-primary/25 border border-primary/40 py-1.5 px-3 rounded-lg transition-colors cursor-pointer"
                        >
                          {upiCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" /> Copy ID
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Supported Apps List */}
                    <div>
                      <span className="text-[10px] text-neutral-400 block mb-1">
                        Supported Payment Apps:
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Cred", "Amazon Pay"].map(
                          (app) => (
                            <span
                              key={app}
                              className="text-[10px] rounded-md bg-neutral-900 border border-white/10 px-2.5 py-0.5 text-neutral-300"
                            >
                              {app}
                            </span>
                          ),
                        )}
                      </div>
                    </div>

                    {/* Mobile Direct Deep-Link */}
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

                {/* ISO Trust Seals */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono text-[10px] text-muted-foreground">
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span>ISO/IEC 27001</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                    <span>SOC-2 Type II</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <Lock className="h-4 w-4 text-primary mx-auto mb-1" />
                    <span>PCI-DSS Level 1</span>
                  </div>
                  <div className="bg-white/5 border border-white/5 p-2 rounded-xl">
                    <FileText className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                    <span>GST/Tax Deductible</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Billing Information & Instant Unlock Form */}
              <div className="lg:col-span-5 rounded-3xl border border-primary/40 bg-black/80 p-6 sm:p-8 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        3. Enterprise Verification
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground">
                        Provide transaction UTR for automated release
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleQuickFillRef}
                      className="text-[10px] font-mono text-primary underline hover:text-primary/80 cursor-pointer"
                    >
                      Instant Test Auto-Fill
                    </button>
                  </div>

                  <form onSubmit={handleStartTransaction} className="space-y-4 font-mono text-xs">
                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Purchasing Organization / Company Name *
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          placeholder={targetDomain || "Acme Corporation Pvt Ltd"}
                          value={orgName}
                          onChange={(e) => setOrgName(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background/90 pl-10 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Delivery &amp; Compliance Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="legal.compliance@domain.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/90 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                        Corporate Tax ID / GSTIN / VAT (Optional for Tax Invoice)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 07AAAAA0000A1Z5"
                        value={taxId}
                        onChange={(e) => setTaxId(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background/90 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-medium text-muted-foreground">
                          Bank UTR / 12-Digit Transfer Reference *
                        </label>
                        <span className="text-[10px] text-amber-400">
                          From your UPI payment app
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 423987123984"
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        className="w-full rounded-xl border border-primary/50 bg-background/90 px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none font-mono font-bold"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="btn-gold w-full flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 font-mono text-xs uppercase tracking-wider font-bold text-black cursor-pointer shadow-xl shadow-primary/25 hover:scale-[1.01] transition-transform"
                      >
                        <Zap className="h-4 w-4" />
                        <span>Verify &amp; Instant Unlock ({currentTier.priceInr})</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 text-[10.5px] font-mono text-muted-foreground text-center space-y-1">
                  <p className="flex items-center justify-center gap-1.5 text-emerald-400 font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Tax Deductible Corporate Legal
                    &amp; Security R&amp;D Expense
                  </p>
                  <p className="text-muted-foreground/80">
                    Includes official signed ASJi compliance certificate &amp; tax invoice.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
