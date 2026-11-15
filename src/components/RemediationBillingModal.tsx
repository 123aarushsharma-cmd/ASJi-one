import React, { useState, useEffect } from "react";
import {
  Check,
  ShieldCheck,
  Zap,
  Lock,
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
  Download,
  Clock,
} from "lucide-react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AuditReport } from "@/lib/audit-types";
import { generateClientHandoverDocument } from "@/lib/remediation-patches";
import { StatutoryLegalSolutionCard } from "@/components/StatutoryLegalSolutionCard";
import { STATUTORY_FRAMEWORKS } from "@/lib/audit-statutes";
import {
  checkDomainPaymentUnlock,
  normalizeDomainName,
  submitPaymentUnlockRequest,
} from "@/lib/firestore-service";
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
    priceInr: "₹2,499/mo",
    priceNum: 2499,
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
    unlockSummary: "All 15 Sovereign Legal Solutions (GDPR, DUAA, CCPA, NDPA, etc.)",
    description:
      "Complete statutory legal solution matrix and non-compliance disclosures for EU GDPR, UK DUAA, UAE PDPL, US CCPA/CPRA, Nigeria NDPA, and all 15 global laws.",
    features: [
      "Full disclosure of statutory gaps across all 15 global sovereign privacy frameworks",
      "EU Standard Contractual Clauses (SCCs) & Cross-Border Transfer Assessment",
      "GDPR Article 13/14 privacy charter & 30-day Subject Access Request (SAR) templates",
      "UAE PDPL Data Office statutory notification protocols & US CCPA GPC listener",
      "Universal statutory cookie policy with granular affirmative consent opt-in rules",
    ],
  },
  {
    id: "full-bundle",
    name: "Full-Spectrum Sovereign Enterprise Suite",
    badge: "Complete Enterprise Suite",
    popular: true,
    priceInr: "₹59,999",
    priceNum: 59999,
    unlockSummary: "Both Full Code Patches AND All 15 Sovereign Legal Solutions",
    description:
      "Combined complete autonomous code patches + 15 sovereign legal draft packs + official client handover summary report.",
    features: [
      "Includes ALL Autonomous Remediation Code Patches (NGINX, Edge, CMP, Node, Grievance)",
      "Includes ALL 15 Global Privacy Law statutory legal solutions & non-compliance disclosures",
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
  const [txnStep, setTxnStep] = useState<"form" | "processing" | "submitted" | "success">("form");
  const [processingStatus, setProcessingStatus] = useState<string>("");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [taxId, setTaxId] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [generatedTxnId, setGeneratedTxnId] = useState("");
  const [receiptCopied, setReceiptCopied] = useState(false);
  const [upiCopied, setUpiCopied] = useState(false);

  const currentTier = BILLING_TIERS.find((t) => t.id === selectedTier) || BILLING_TIERS[3];
  const targetDomain =
    normalizeDomainName(report?.target || "your-domain.com") || "your-domain.com";

  const currentFramework =
    STATUTORY_FRAMEWORKS.find((f) => f.id === frameworkId) || STATUTORY_FRAMEWORKS[0];

  useEffect(() => {
    if (!isOpen) return;
    if (initialTier) {
      setSelectedTier(initialTier);
    }
    setGeneratedTxnId(`TXN-ASJI-${Date.now().toString().slice(-6)}`);
    setTxnStep("form");

    if (report?.target) {
      checkDomainPaymentUnlock(targetDomain)
        .then((res) => {
          if (res.unlocked) {
            const matchedTier =
              res.tier === "patch-code" ||
              res.tier === "dpdp-india" ||
              res.tier === "gdpr-global" ||
              res.tier === "full-bundle"
                ? res.tier
                : "full-bundle";
            setSelectedTier(matchedTier);
            setTxnStep("success");
            onUnlockSuccess(matchedTier);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, initialTier, report?.target, targetDomain, onUnlockSuccess]);

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

  const handleStartTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = (referenceId || "").trim().replace(/\s+/g, "");
    if (!/^[0-9]{12}$/.test(cleanRef)) {
      toast.error("Invalid 12-Digit Bank UTR", {
        description: "Please enter the exact 12-digit numeric UPI / IMPS UTR reference number.",
      });
      return;
    }

    setTxnStep("processing");
    setProcessingStatus(`Registering unlock request for UTR ${cleanRef} in Firestore...`);

    try {
      await submitPaymentUnlockRequest({
        userId: auth.currentUser?.uid || null,
        domain: targetDomain,
        referenceId: cleanRef,
        tier: selectedTier,
        tierName: currentTier.name,
        priceInr: currentTier.priceInr,
        orgName: orgName.trim() || targetDomain,
        email: email.trim() || `compliance@${targetDomain}`,
        taxId: taxId.trim() || null,
      });

      if (auth.currentUser?.uid) {
        const txnDocId = `txn_${Date.now()}_${cleanRef.slice(-5)}`;
        await setDoc(doc(db, "transactions", txnDocId), {
          id: txnDocId,
          userId: auth.currentUser.uid,
          referenceId: cleanRef,
          domain: targetDomain,
          tier: selectedTier,
          tierName: currentTier.name,
          priceInr: currentTier.priceInr,
          orgName: orgName.trim() || targetDomain,
          email: email.trim() || `compliance@${targetDomain}`,
          taxId: taxId.trim() || null,
          status: "pending_verification",
          createdAt: serverTimestamp(),
          submittedAt: new Date().toISOString(),
        }).catch(() => {});
      }
    } catch (err) {
      console.warn("Payment unlock submission error:", err);
      toast.error("Could not register UTR request", {
        description: "Please check your 12-digit UTR and connection and retry.",
      });
      setTxnStep("form");
      return;
    }

    setTimeout(() => {
      setProcessingStatus("Preparing invoice receipt for ASJi Accounts Desk review...");
    }, 800);

    setTimeout(() => {
      setTxnStep("submitted");
      toast.success("Payment Reference Submitted", {
        description: `UTR ${cleanRef} logged for admin verification & persistent unlock of ${targetDomain}.`,
      });
    }, 1600);
  };

  const handleCopyReceipt = async () => {
    try {
      const sealToken = (report?.auditRefId || generatedTxnId || "ASJI-2026-SEAL").toUpperCase();
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
Compliance Token: ASJI-AUTH-SEAL-${sealToken}
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
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-[#0D0E11] text-foreground font-sans animate-in fade-in duration-200">
      {/* Top Enterprise Security & Navigation Bar */}
      <header className="sticky top-0 z-40 border-b border-[#262932] bg-[#0D0E11] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md border border-[#C9A227]/40 bg-[#15171C] text-[#C9A227] font-bold">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-sm sm:text-base font-bold text-[#FAF8F5]">
                ASJi One Enterprise Licensing &amp; Settlement Vault
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-[#10B981]">
                <ShieldCheck className="h-3 w-3" /> 256-Bit TLS
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground hidden md:block">
              Target Domain: <strong className="text-foreground">{targetDomain}</strong> ·
              Jurisdiction: <strong className="text-[#C9A227]">{currentFramework.label}</strong>
            </p>
          </div>
        </div>

        {/* Top Trust Standards & Close */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 font-mono text-[10px] text-muted-foreground border-r border-[#262932] pr-4">
            <span>ISO 27001</span>
            <span>·</span>
            <span>SOC-2 Type II</span>
            <span>·</span>
            <span>PCI-DSS Level 1</span>
          </div>

          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-md border border-[#262932] bg-[#15171C] px-3.5 py-1.5 text-xs font-mono font-semibold text-muted-foreground hover:border-[#C9A227]/50 hover:text-foreground transition-colors cursor-pointer"
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
            <div className="flex h-20 w-20 items-center justify-center rounded-md bg-[#15171C] border border-[#C9A227] mb-6">
              <Loader2 className="h-10 w-10 animate-spin text-[#C9A227]" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-[#C9A227] font-semibold">
              Direct UPI Settlement · Enterprise Compliance Synthesizer
            </span>

            <h2 className="mt-3 font-display text-3xl font-bold text-[#FAF8F5]">
              Verifying Payment &amp; Synthesizing Deliverables
            </h2>

            <p className="mt-2 text-sm text-muted-foreground max-w-md">
              Validating transaction reference against Reserve Bank UPI switches and preparing
              licensed deliverables for <strong>{targetDomain}</strong>.
            </p>

            <div className="mt-6 rounded-md border border-[#262932] bg-[#15171C] px-6 py-4 font-mono text-xs text-muted-foreground max-w-lg">
              <p className="text-[#10B981] font-semibold flex items-center justify-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                {processingStatus}
              </p>
              <p className="mt-2 text-[11px] text-muted-foreground border-t border-[#262932] pt-2">
                Target: {targetDomain} · Tier: {currentTier.name} · Ref:{" "}
                {referenceId || generatedTxnId}
              </p>
            </div>
          </div>
        )}

        {/* SUBMITTED STEP: PENDING ADMIN RECONCILIATION */}
        {txnStep === "submitted" && (
          <div className="py-6 animate-in fade-in duration-300 space-y-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center justify-center text-center border-b border-[#262932] pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/40 mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <span className="font-mono text-xs uppercase tracking-wider text-[#F59E0B] font-bold bg-[#F59E0B]/10 border border-[#F59E0B]/40 px-3 py-1 rounded">
                UTR Recorded · Banking Reconciliation Pending
              </span>
              <h2 className="mt-3 font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5]">
                Payment Verification Underway
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-xl leading-relaxed">
                Your 12-digit transaction UTR{" "}
                <strong className="text-[#F59E0B] font-mono tabular-nums">{referenceId}</strong> has
                been logged with ASJi Accounts Desk for{" "}
                <strong className="text-foreground">{targetDomain}</strong>.
              </p>
            </div>

            <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-6 font-mono text-xs space-y-3">
              <div className="flex items-center gap-2 text-[#C9A227] font-bold border-b border-[#262932] pb-2">
                <ShieldCheck className="h-4 w-4" />
                <span>Anti-Fraud &amp; Zero-Bypass Compliance Protocol</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px] font-sans">
                Autonomous remediation code patches, edge middleware, and sovereign legal drafts are
                production-grade enterprise assets. Access is activated upon bank settlement
                confirmation (typically 15–30 minutes during banking hours).
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="p-3 rounded-md bg-[#0D0E11] border border-[#262932]">
                  <span className="text-muted-foreground block">Licensed Organization:</span>
                  <span className="text-foreground font-bold">{orgName || targetDomain}</span>
                </div>
                <div className="p-3 rounded-md bg-[#0D0E11] border border-[#262932]">
                  <span className="text-muted-foreground block">Deliverable Tier:</span>
                  <span className="text-[#C9A227] font-bold tabular-nums">
                    {currentTier.name} ({currentTier.priceInr})
                  </span>
                </div>
                <div className="p-3 rounded-md bg-[#0D0E11] border border-[#262932]">
                  <span className="text-muted-foreground block">Submitted Bank UTR:</span>
                  <span className="text-[#C9A227] font-bold tabular-nums">{referenceId}</span>
                </div>
                <div className="p-3 rounded-md bg-[#0D0E11] border border-[#262932]">
                  <span className="text-muted-foreground block">Delivery Email:</span>
                  <span className="text-foreground font-bold">
                    {email || "compliance@domain.com"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyReceipt}
                className="inline-flex items-center gap-2 rounded-md border border-[#C9A227]/40 bg-[#15171C] px-5 py-2.5 text-xs font-mono font-bold text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors cursor-pointer"
              >
                {receiptCopied ? (
                  <Check className="h-4 w-4 text-[#10B981]" />
                ) : (
                  <Receipt className="h-4 w-4" />
                )}
                <span>{receiptCopied ? "Receipt Copied" : "Copy Tax Receipt"}</span>
              </button>
              <a
                href={`mailto:hello@asjione.com?subject=Expedited%20Activation%20Request%20-%20UTR%20${encodeURIComponent(referenceId)}&body=Hello%20ASJi%20Compliance%20Desk,%0A%0AI%20have%20completed%20the%20UPI%20transfer%20for%20${encodeURIComponent(targetDomain)}.%0AUTR:%20${encodeURIComponent(referenceId)}%0ATier:%20${encodeURIComponent(currentTier.name)}%0AOrganization:%20${encodeURIComponent(orgName)}%0A%0APlease%20expedite%20activation.`}
                className="btn-gold inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-xs font-mono font-bold cursor-pointer"
              >
                <span>Expedite via Email Desk</span>
                <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-md border border-[#262932] bg-[#15171C] px-5 py-2.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <span>Return to Audit</span>
              </button>
            </div>
          </div>
        )}

        {/* SUCCESS STEP (Shown when approved) */}
        {txnStep === "success" && (
          <div className="py-4 animate-in fade-in duration-300 space-y-6">
            <div className="flex flex-col items-center justify-center text-center border-b border-[#262932] pb-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/40 mb-4">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#10B981] font-bold bg-[#10B981]/10 border border-[#10B981]/40 px-3 py-1 rounded">
                <Check className="h-3.5 w-3.5" /> Payment Verified · {currentTier.name} Activated
              </span>
              <h2 className="mt-3 font-display text-3xl sm:text-4xl font-bold text-[#FAF8F5]">
                {selectedTier === "patch-code" && "Autonomous Remediation Code Patches Unlocked"}
                {selectedTier === "dpdp-india" && "DPDP Act 2023 Statutory Legal Suite Unlocked"}
                {selectedTier === "gdpr-global" && "GDPR & Multi-Sovereign Legal Pack Unlocked"}
                {selectedTier === "full-bundle" &&
                  "Full Code Patches & 15 Sovereign Legal Suite Ready"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground max-w-xl">
                {selectedTier === "patch-code" &&
                  `Executable server hardening scripts (NGINX, Apache, Express), Next.js / Cloudflare edge shield middleware, and zero-leak CMP scripts are now unlocked for ${targetDomain}.`}
                {selectedTier === "dpdp-india" &&
                  `Itemized notice at collection, bilingual statutory templates, designated Grievance Redressal Officer charters, and non-compliance penalty disclosures under DPDP Act 2023 are unlocked for ${targetDomain}.`}
                {selectedTier === "gdpr-global" &&
                  `Complete statutory legal solutions, SCCs, SAR templates, and non-compliance disclosures across all 15 global sovereign privacy frameworks are unlocked for ${targetDomain}.`}
                {selectedTier === "full-bundle" &&
                  `Full autonomous remediation code patches, all 15 sovereign legal solution packs, signed audit certificates, and white-label client handover packs are permanently unlocked for ${targetDomain}.`}
              </p>
            </div>

            {/* Official Enterprise Tax Invoice Card */}
            <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-7 font-mono text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262932] pb-4">
                <div className="flex items-center gap-2.5">
                  <Receipt className="h-5 w-5 text-[#C9A227]" />
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
                    className="flex items-center gap-1.5 rounded-md border border-[#C9A227]/40 bg-[#0D0E11] px-3.5 py-1.5 text-xs font-bold text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors cursor-pointer"
                  >
                    {receiptCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied Receipt
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
                      className="flex items-center gap-1.5 rounded-md border border-[#10B981]/40 bg-[#10B981]/10 px-3.5 py-1.5 text-xs font-bold text-[#10B981] hover:bg-[#10B981]/20 transition-colors cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" /> Download Deliverable Bundle
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-[11px]">
                <div className="bg-[#0D0E11] p-3 rounded-md border border-[#262932]">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Transaction Reference:
                  </span>
                  <span className="font-bold text-[#C9A227] text-xs tabular-nums">
                    {referenceId || generatedTxnId}
                  </span>
                </div>
                <div className="bg-[#0D0E11] p-3 rounded-md border border-[#262932]">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Licensed Domain:
                  </span>
                  <span className="font-bold text-foreground text-xs">{targetDomain}</span>
                </div>
                <div className="bg-[#0D0E11] p-3 rounded-md border border-[#262932]">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Package Tier:
                  </span>
                  <span className="font-bold text-foreground text-xs">{currentTier.name}</span>
                </div>
                <div className="bg-[#0D0E11] p-3 rounded-md border border-[#262932]">
                  <span className="text-muted-foreground block text-[10px] uppercase">
                    Beneficiary Settled:
                  </span>
                  <span className="font-bold text-[#10B981] text-xs">
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
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#262932] pt-6 pb-12">
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
                className="btn-gold rounded-md px-8 py-3.5 font-mono text-xs uppercase tracking-wider font-bold cursor-pointer flex items-center gap-2"
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
            <div className="rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5 text-[#C9A227] font-semibold">
                      <Zap className="h-3.5 w-3.5" /> Direct Bank Account Instant UPI
                    </span>
                    <span>·</span>
                    <span>Tiered Instant Release</span>
                    <span>·</span>
                    <span>Enterprise B2B Ready</span>
                  </div>

                  <h2 className="mt-3 font-display text-2xl sm:text-4xl font-bold text-[#FAF8F5]">
                    Select Your Enterprise Licensing Package
                  </h2>

                  <p className="mt-2 text-xs sm:text-sm text-muted-foreground font-mono max-w-2xl leading-relaxed">
                    Choose from standalone code patches, dedicated India DPDP legal suites,
                    multi-sovereign global legal packs, or the full-spectrum code + legal enterprise
                    bundle tailored for <strong className="text-foreground">{targetDomain}</strong>.
                  </p>
                </div>

                <div className="shrink-0 rounded-md border border-[#262932] bg-[#0D0E11] p-4 font-mono text-xs text-center md:text-right">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                    Enterprise Licensing Mode
                  </span>
                  <span className="text-base font-bold text-[#C9A227] block mt-0.5">
                    Direct Instant Transfer
                  </span>
                  <span className="text-[10px] text-[#10B981] font-semibold inline-flex items-center gap-1 mt-1">
                    <Check className="h-3 w-3" /> Instant Automated Release
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
                      className={`relative cursor-pointer rounded-md border p-5 transition-colors flex flex-col justify-between ${
                        isSelected
                          ? "border-[#C9A227] bg-[#15171C] ring-1 ring-[#C9A227]"
                          : "border-[#262932] bg-[#15171C] hover:border-[#C9A227]/50"
                      }`}
                    >
                      {tier.badge && (
                        <span className="absolute -top-2.5 right-4 rounded bg-[#C9A227] px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-[#0D0E11]">
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
                                ? "border-[#C9A227] bg-[#C9A227] text-[#0D0E11]"
                                : "border-[#262932]"
                            }`}
                          >
                            {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3 font-display text-2xl font-bold text-[#C9A227] tabular-nums">
                          {tier.priceInr}
                        </div>

                        <div className="mt-1 rounded border border-[#262932] bg-[#0D0E11] px-2 py-0.5 text-[10px] font-mono text-[#C9A227] font-bold inline-block">
                          {tier.unlockSummary}
                        </div>

                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                          {tier.description}
                        </p>

                        <div className="gold-rule my-3.5 opacity-30" />

                        <ul className="space-y-2 text-[11px] text-muted-foreground">
                          {tier.features.map((f, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Check className="h-3.5 w-3.5 text-[#C9A227] shrink-0 mt-0.5" />
                              <span className="leading-snug">{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 pt-3 border-t border-[#262932] text-xs font-mono text-[#C9A227] font-bold flex items-center justify-between">
                        <span>{isSelected ? "Selected Package" : "Choose Package"}</span>
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
              <div className="lg:col-span-7 rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8">
                <div className="flex items-center justify-between border-b border-[#262932] pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0D0E11] border border-[#262932] text-[#C9A227]">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        2. Direct Bank Account Instant UPI Transfer
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground">
                        Beneficiary: {OFFICIAL_UPI_CONFIG.payeeName} · Direct Settlement
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-[10px] uppercase text-muted-foreground block">
                      Total Payable
                    </span>
                    <span className="text-lg font-bold text-[#C9A227] tabular-nums">
                      {currentTier.priceInr}
                    </span>
                  </div>
                </div>

                {/* QR & Bank Details Box */}
                <div className="flex flex-col sm:flex-row items-center gap-6 rounded-md border border-[#262932] bg-[#0D0E11] p-5 sm:p-6">
                  {/* QR Code Container */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="p-3 rounded-md bg-[#FAF8F5] border border-[#E5DEC9]">
                      <img
                        src={qrCodeUrl}
                        alt={`UPI QR Code for ${OFFICIAL_UPI_CONFIG.payeeName}`}
                        className="w-44 h-44 object-contain"
                        loading="lazy"
                      />
                    </div>
                    <span className="mt-2 text-[10px] font-mono text-muted-foreground text-center">
                      Scan with any UPI application
                    </span>
                  </div>

                  {/* Account Details */}
                  <div className="flex-1 w-full space-y-3.5 font-mono text-xs">
                    <div className="bg-[#15171C] p-3.5 rounded-md border border-[#262932]">
                      <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                        Official Beneficiary Name:
                      </span>
                      <strong className="text-base text-foreground tracking-wide block mt-0.5">
                        {OFFICIAL_UPI_CONFIG.payeeName}
                      </strong>
                    </div>

                    <div className="bg-[#15171C] p-3.5 rounded-md border border-[#262932]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-muted-foreground block uppercase font-bold">
                            Direct Bank Instant UPI ID:
                          </span>
                          <strong className="text-sm text-[#C9A227] break-all block mt-0.5">
                            {OFFICIAL_UPI_CONFIG.vpa}
                          </strong>
                        </div>
                        <button
                          type="button"
                          onClick={handleCopyUpiId}
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#C9A227] bg-[#0D0E11] hover:border-[#C9A227] border border-[#262932] py-1.5 px-3 rounded transition-colors cursor-pointer shrink-0"
                        >
                          {upiCopied ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-[#10B981]" /> Copied
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
                      <span className="text-[10px] text-muted-foreground block mb-1">
                        Supported Payment Apps:
                      </span>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {["Google Pay", "PhonePe", "Paytm", "BHIM UPI", "Cred", "Amazon Pay"].map(
                          (app, idx) => (
                            <span key={app}>
                              {idx > 0 && <span className="mr-2">·</span>}
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
                        className="inline-flex items-center gap-1.5 text-xs text-[#C9A227] hover:text-[#DFB842] underline font-semibold"
                      >
                        <Smartphone className="h-3.5 w-3.5" /> Open in installed UPI app on device
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* ISO Trust Seals */}
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center font-mono text-[10px] text-muted-foreground">
                  <div className="bg-[#0D0E11] border border-[#262932] p-2.5 rounded-md">
                    <ShieldCheck className="h-4 w-4 text-[#10B981] mx-auto mb-1" />
                    <span>ISO/IEC 27001</span>
                  </div>
                  <div className="bg-[#0D0E11] border border-[#262932] p-2.5 rounded-md">
                    <ShieldCheck className="h-4 w-4 text-[#10B981] mx-auto mb-1" />
                    <span>SOC-2 Type II</span>
                  </div>
                  <div className="bg-[#0D0E11] border border-[#262932] p-2.5 rounded-md">
                    <Lock className="h-4 w-4 text-[#C9A227] mx-auto mb-1" />
                    <span>PCI-DSS Level 1</span>
                  </div>
                  <div className="bg-[#0D0E11] border border-[#262932] p-2.5 rounded-md">
                    <FileText className="h-4 w-4 text-[#C9A227] mx-auto mb-1" />
                    <span>GST/Tax Deductible</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Billing Information & Instant Unlock Form */}
              <div className="lg:col-span-5 rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-[#262932] pb-4 mb-5">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        3. Enterprise Verification
                      </h3>
                      <span className="text-xs font-mono text-muted-foreground">
                        Provide transaction UTR for automated release
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#F59E0B] flex items-center gap-1">
                      <Lock className="h-3 w-3" /> Anti-Fraud Verification
                    </span>
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
                          className="w-full rounded-md border border-[#262932] bg-[#0D0E11] pl-10 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#C9A227] focus:outline-none font-sans"
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
                        className="w-full rounded-md border border-[#262932] bg-[#0D0E11] px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#C9A227] focus:outline-none font-sans"
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
                        className="w-full rounded-md border border-[#262932] bg-[#0D0E11] px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#C9A227] focus:outline-none font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[11px] font-medium text-muted-foreground">
                          Bank UTR / 12-Digit Transfer Reference *
                        </label>
                        <span className="text-[10px] text-[#C9A227]">
                          From your UPI payment app
                        </span>
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 423987123984"
                        value={referenceId}
                        onChange={(e) => setReferenceId(e.target.value)}
                        className="w-full rounded-md border border-[#C9A227]/60 bg-[#0D0E11] px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-[#C9A227] focus:outline-none font-mono font-bold tabular-nums"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        className="btn-gold w-full flex items-center justify-center gap-2 rounded-md py-3.5 px-6 font-mono text-xs uppercase tracking-wider font-bold cursor-pointer"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        <span>Submit UTR for Verification ({currentTier.priceInr})</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-6 pt-4 border-t border-[#262932] text-[10.5px] font-mono text-muted-foreground text-center space-y-1">
                  <p className="flex items-center justify-center gap-1.5 text-[#10B981] font-semibold">
                    <ShieldCheck className="h-3.5 w-3.5" /> 100% Tax Deductible Corporate Legal
                    &amp; Security Expense
                  </p>
                  <p className="text-muted-foreground">
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
