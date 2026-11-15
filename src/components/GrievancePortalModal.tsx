import React, { useState, useEffect } from "react";
import {
  X,
  Scale,
  ShieldCheck,
  Mail,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Send,
  AlertCircle,
  MapPin,
} from "lucide-react";
import { LEGAL, OPEN_GRIEVANCE_PORTAL_EVENT } from "@/lib/legal";
import { sanitizeAuditInput } from "@/lib/audit-input";
import { submitGrievanceTicket } from "@/lib/firestore-service";

export type DataPrincipalRequestType = "Access" | "Correction" | "Erasure" | "Grievance";

interface SubmittedTicket {
  ticketId: string;
  requestType: DataPrincipalRequestType;
  fullName: string;
  email: string;
  domainRef: string;
  summary: string;
  submittedAt: string;
}

const REQUEST_TYPES: {
  id: DataPrincipalRequestType;
  title: string;
  citation: string;
}[] = [
  { id: "Access", title: "Right to Access", citation: "DPDP Sec. 11 · GDPR Art. 15" },
  { id: "Correction", title: "Right to Correction", citation: "DPDP Sec. 12 · GDPR Art. 16" },
  { id: "Erasure", title: "Right to Erasure", citation: "DPDP Sec. 12 · GDPR Art. 17" },
  { id: "Grievance", title: "Grievance Redressal", citation: "DPDP Sec. 13 · Sec. 8(10)" },
];

function computeDeterministicTicketId(
  requestType: DataPrincipalRequestType,
  email: string,
  domainRef: string,
): string {
  const dayBucket = new Date().toISOString().slice(0, 10);
  const seed = `${requestType}|${email.trim().toLowerCase()}|${domainRef.trim().toLowerCase()}|${dayBucket}`;
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const code = (Math.abs(hash) % 9000) + 1000;
  return `ASJI-GRV-2026-${code}`;
}

export function GrievancePortalModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [requestType, setRequestType] = useState<DataPrincipalRequestType>("Grievance");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [domainRef, setDomainRef] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [persistedCloud, setPersistedCloud] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<SubmittedTicket | null>(null);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  useEffect(() => {
    const handleOpen = (e: Event) => {
      const custom = e as CustomEvent<{ requestType?: DataPrincipalRequestType } | undefined>;
      if (custom.detail?.requestType) {
        setRequestType(custom.detail.requestType);
      }
      setError(null);
      setIsOpen(true);
    };

    window.addEventListener(OPEN_GRIEVANCE_PORTAL_EVENT, handleOpen);
    return () => {
      window.removeEventListener(OPEN_GRIEVANCE_PORTAL_EVENT, handleOpen);
    };
  }, []);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    const cleanName = sanitizeAuditInput(fullName);
    const cleanEmail = sanitizeAuditInput(email);
    const cleanDomain = sanitizeAuditInput(domainRef);
    const cleanSummary = sanitizeAuditInput(summary);

    if (cleanName.length < 2) {
      setError("Please enter your full name or authorized representative name.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Please enter a valid contact email address for statutory correspondence.");
      return;
    }
    if (cleanSummary.length < 15) {
      setError("Please describe your Data Principal request or grievance (minimum 15 characters).");
      return;
    }

    const ticketId = computeDeterministicTicketId(requestType, cleanEmail, cleanDomain);
    const createdAt = new Date().toISOString();
    setError(null);
    setIsSubmitting(true);
    let savedToCloud = false;
    try {
      await submitGrievanceTicket({
        ticketId,
        requestType,
        fullName: cleanName,
        email: cleanEmail,
        domainRef: cleanDomain || "N/A",
        summary: cleanSummary,
        createdAt,
      });
      savedToCloud = true;
    } catch {
      savedToCloud = false;
    } finally {
      setIsSubmitting(false);
    }

    setPersistedCloud(savedToCloud);
    setSubmittedTicket({
      ticketId,
      requestType,
      fullName: cleanName,
      email: cleanEmail,
      domainRef: cleanDomain || "N/A",
      summary: cleanSummary,
      submittedAt: createdAt,
    });
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setPersistedCloud(false);
    setSummary("");
    setError(null);
  };

  const buildReceiptText = (ticket: SubmittedTicket) =>
    `ASJi One — Statutory Data Principal & Grievance Acknowledgment\n` +
    `Ticket ID: ${ticket.ticketId}\n` +
    `Request Category: ${ticket.requestType}\n` +
    `Data Principal / Representative: ${ticket.fullName} (${ticket.email})\n` +
    `Target Domain / Reference: ${ticket.domainRef}\n` +
    `Designated Grievance Officer: ${LEGAL.grievanceOfficer.name}\n` +
    `Entity & Jurisdiction: ${LEGAL.legalEntity}, Jaipur, India\n` +
    `Officer Email: ${LEGAL.contactEmail}\n` +
    `Statutory Response SLA: Within 7 Business Days\n` +
    `Recorded At (UTC): ${ticket.submittedAt}\n\n` +
    `Summary:\n${ticket.summary}`;

  const handleCopyReceipt = async () => {
    if (!submittedTicket) return;
    try {
      await navigator.clipboard.writeText(buildReceiptText(submittedTicket));
      setCopiedReceipt(true);
      setTimeout(() => setCopiedReceipt(false), 2000);
    } catch {
      // ignore clipboard restriction
    }
  };

  const mailtoHref = submittedTicket
    ? `mailto:${LEGAL.contactEmail}?subject=${encodeURIComponent(
        `[${submittedTicket.ticketId}] DPDP ${submittedTicket.requestType} Request`,
      )}&body=${encodeURIComponent(buildReceiptText(submittedTicket))}`
    : `mailto:${LEGAL.contactEmail}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="grievance-portal-title"
      className="fixed inset-0 z-[75] flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6"
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex w-full max-w-xl md:max-w-2xl max-h-[92dvh] flex-col overflow-hidden rounded-xl border border-[#C9A227]/40 bg-[#FAF8F5] text-[#18181B] shadow-2xl"
      >
        {/* Matte Onyx Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#262932] bg-[#0D0E11] px-5 py-4 text-[#FAF8F5] sm:px-6">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#C9A227]/50 bg-[#15171C] text-[#C9A227]">
              <Scale className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="grievance-portal-title"
                className="font-display text-base sm:text-lg font-bold text-[#FAF8F5] leading-tight"
              >
                Data Principal Rights &amp; Grievance Redressal Portal
              </h2>
              <p className="font-mono text-[10px] text-[#C9A227] uppercase tracking-wider mt-0.5">
                India DPDP Act 2023 Sec. 13 &amp; Sec. 8(10) · EU GDPR Art. 15–17
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Grievance Portal"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#15171C] text-zinc-300 hover:border-[#C9A227] hover:text-[#FAF8F5] cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Warm Alabaster Body */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-5">
          {/* Designated Officer Banner */}
          <div className="rounded-lg border border-[#E5DEC9] bg-white p-3.5 text-xs font-mono text-[#52525B] grid gap-2 sm:grid-cols-2">
            <div className="space-y-1">
              <span className="text-[10px] uppercase tracking-wider text-[#9A7812] font-bold block">
                Designated Grievance Officer
              </span>
              <span className="font-bold text-[#18181B] block">{LEGAL.grievanceOfficer.name}</span>
              <span className="inline-flex items-center gap-1 text-[11px]">
                <MapPin className="h-3 w-3 text-[#9A7812]" />
                {LEGAL.legalEntity}, Jaipur, India
              </span>
            </div>
            <div className="space-y-1 sm:border-l sm:border-[#E5DEC9] sm:pl-3.5">
              <span className="text-[10px] uppercase tracking-wider text-[#9A7812] font-bold block">
                Direct Statutory Channel &amp; SLA
              </span>
              <a
                href={`mailto:${LEGAL.contactEmail}`}
                className="inline-flex items-center gap-1.5 font-bold text-[#18181B] hover:text-[#9A7812]"
              >
                <Mail className="h-3.5 w-3.5 text-[#9A7812]" />
                {LEGAL.contactEmail}
              </a>
              <span className="flex items-center gap-1 text-[11px] text-[#059669] font-semibold">
                <Clock className="h-3 w-3" />7 Business Days Statutory SLA
              </span>
            </div>
          </div>

          {!submittedTicket ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Request Category Selector */}
              <div>
                <label className="block font-mono text-[11px] font-bold uppercase tracking-wider text-[#18181B] mb-2">
                  Select Statutory Request Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {REQUEST_TYPES.map((item) => {
                    const active = requestType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRequestType(item.id)}
                        className={`rounded-lg border p-2.5 text-left transition-colors cursor-pointer ${
                          active
                            ? "border-[#9A7812] bg-[#0D0E11] text-[#FAF8F5]"
                            : "border-[#E5DEC9] bg-white text-[#18181B] hover:border-[#9A7812]/60"
                        }`}
                      >
                        <span className="block font-sans text-xs font-bold">{item.title}</span>
                        <span
                          className={`block font-mono text-[10px] mt-0.5 ${
                            active ? "text-[#C9A227]" : "text-[#52525B]"
                          }`}
                        >
                          {item.citation}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="grv-name"
                    className="block font-mono text-[11px] font-semibold text-[#18181B] mb-1"
                  >
                    Full Name / Authorized Rep *
                  </label>
                  <input
                    id="grv-name"
                    type="text"
                    required
                    maxLength={120}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g., Ananya Verma"
                    className="w-full rounded-md border border-[#E5DEC9] bg-white px-3 py-2 font-sans text-xs text-[#18181B] placeholder:text-zinc-400 focus:border-[#9A7812] outline-none"
                  />
                </div>
                <div>
                  <label
                    htmlFor="grv-email"
                    className="block font-mono text-[11px] font-semibold text-[#18181B] mb-1"
                  >
                    Correspondence Email *
                  </label>
                  <input
                    id="grv-email"
                    type="email"
                    required
                    maxLength={200}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@organization.com"
                    className="w-full rounded-md border border-[#E5DEC9] bg-white px-3 py-2 font-mono text-xs text-[#18181B] placeholder:text-zinc-400 focus:border-[#9A7812] outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="grv-domain"
                  className="block font-mono text-[11px] font-semibold text-[#18181B] mb-1"
                >
                  Target Domain or Audit Reference (Optional)
                </label>
                <input
                  id="grv-domain"
                  type="text"
                  maxLength={200}
                  value={domainRef}
                  onChange={(e) => setDomainRef(e.target.value)}
                  placeholder="e.g., example.com or Audit Reference ID"
                  className="w-full rounded-md border border-[#E5DEC9] bg-white px-3 py-2 font-mono text-xs text-[#18181B] placeholder:text-zinc-400 focus:border-[#9A7812] outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="grv-summary"
                  className="block font-mono text-[11px] font-semibold text-[#18181B] mb-1"
                >
                  Details of Data Principal Request or Grievance *
                </label>
                <textarea
                  id="grv-summary"
                  required
                  rows={3}
                  maxLength={1500}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Specify the personal data, consent withdrawal, correction, erasure, or compliance concern..."
                  className="w-full rounded-md border border-[#E5DEC9] bg-white px-3 py-2 font-sans text-xs text-[#18181B] placeholder:text-zinc-400 focus:border-[#9A7812] outline-none resize-y"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10 p-2.5 font-mono text-xs text-[#B91C1C]">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#E5DEC9]">
                <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-[#52525B]">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#059669]" />
                  Issues deterministic ticket &amp; 7-day SLA confirmation
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer disabled:opacity-60"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>
                    {isSubmitting ? "Registering Ticket..." : "Generate Grievance Ticket"}
                  </span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg border border-[#10B981]/40 bg-white p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
                  <div className="flex items-center gap-2 text-[#059669]">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-display text-base font-bold text-[#18181B]">
                      Statutory Request Registered
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {persistedCloud && (
                      <span className="rounded border border-[#10B981]/40 bg-[#ECFDF5] px-2 py-0.5 font-mono text-[10px] font-bold text-[#059669] uppercase">
                        Logged to Grievance Desk
                      </span>
                    )}
                    <span className="rounded border border-[#9A7812]/40 bg-[#FAF8F5] px-2.5 py-1 font-mono text-xs font-bold text-[#9A7812]">
                      {submittedTicket.ticketId}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 font-mono text-xs text-[#52525B]">
                  <p>
                    <strong className="text-[#18181B]">Category:</strong>{" "}
                    {submittedTicket.requestType} (DPDP Act 2023 / GDPR)
                  </p>
                  <p>
                    <strong className="text-[#18181B]">Assigned Officer:</strong>{" "}
                    {LEGAL.grievanceOfficer.name}, Jaipur, India ({LEGAL.contactEmail})
                  </p>
                  <p>
                    <strong className="text-[#18181B]">Commitment SLA:</strong> Resolution or
                    substantive statutory response within{" "}
                    <strong className="text-[#059669]">7 Business Days</strong>.
                  </p>
                </div>

                <div className="rounded border border-[#E5DEC9] bg-[#FAF8F5] p-3 font-mono text-[11px] text-[#18181B] whitespace-pre-wrap break-words">
                  {submittedTicket.summary}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReceipt}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E5DEC9] bg-white px-3.5 py-2 font-mono text-xs font-bold text-[#18181B] hover:border-[#9A7812] cursor-pointer"
                  >
                    {copiedReceipt ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#059669]" />
                        <span>Receipt Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-[#9A7812]" />
                        <span>Copy Acknowledgment</span>
                      </>
                    )}
                  </button>

                  <a
                    href={mailtoHref}
                    className="btn-gold inline-flex items-center gap-1.5 rounded-lg px-4 py-2 font-mono text-xs font-bold cursor-pointer"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    <span>Dispatch to Grievance Officer</span>
                  </a>
                </div>

                <button
                  type="button"
                  onClick={handleResetForm}
                  className="font-mono text-xs text-[#52525B] underline hover:text-[#18181B] cursor-pointer"
                >
                  Submit Another Request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
