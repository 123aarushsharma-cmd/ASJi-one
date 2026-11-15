import React from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, Phone, Clock, FileText, Lock, Scale, ArrowRight } from "lucide-react";
import { LEGAL, openGrievancePortalModal } from "@/lib/legal";

export function StatutoryGrievanceNotice() {
  return (
    <section
      id="statutory-notice"
      className="surface-panel mt-12 mb-0 rounded-md border border-[#262932] bg-[#15171C] p-6 sm:p-8"
    >
      <div className="flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#262932] pb-6">
          <div>
            <span className="inline-flex items-center gap-2 font-mono text-[11px] font-semibold tracking-wider text-[#C9A227] uppercase">
              <Scale className="h-3.5 w-3.5" />
              <span>Statutory Self-Compliance &amp; Grievance Architecture</span>
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-[#FAF8F5] sm:text-3xl">
              Transparency Notice &amp; Data Principal Grievance Redressal
            </h2>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Statutory disclosures pursuant to India DPDP Act 2023 Sec. 5, 13 &amp; 8(10) and EU
              GDPR Art. 13
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded border border-[#10B981]/40 bg-[#10B981]/10 px-3.5 py-2 font-mono text-xs font-semibold text-[#10B981] shrink-0">
            <ShieldCheck className="h-4 w-4" />
            <span>DPDP Sec. 13 &amp; GDPR Verified</span>
          </div>
        </div>

        {/* Grid Partition - Warm Alabaster Legal Surface */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Transparency Notice Box */}
          <div className="legal-paper flex flex-col justify-between rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6">
            <div>
              <div className="flex items-center gap-2 font-display text-base font-bold text-[#18181B] border-b border-[#E5DEC9] pb-3">
                <FileText className="h-4 w-4 text-[#9A7812]" />
                <span>Itemized Data Processing &amp; Transparency Notice</span>
              </div>
              <div className="mt-4 space-y-2.5 font-sans text-xs sm:text-sm leading-relaxed text-[#52525B]">
                <p>
                  <strong className="text-[#18181B]">Data Fiduciary:</strong> {LEGAL.legalEntity} (
                  {LEGAL.operator}, Jaipur, India).
                </p>
                <p>
                  <strong className="text-[#18181B]">Signals Processed:</strong> Public DNS records,
                  TLS metadata, public HTTP response headers, and user-initiated target domains.
                </p>
                <p>
                  <strong className="text-[#18181B]">Purpose &amp; Lawful Basis:</strong> Executing
                  user-authorized technical compliance inspections (DPDP Act Sec. 6 &amp; GDPR Art.
                  6(1)(b)).
                </p>
                <p>
                  <strong className="text-[#18181B]">Transient Zero-Retention:</strong> Domain
                  telemetry executes ephemerally in sandboxed memory with zero cross-site behavioral
                  tracking.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 border-t border-[#E5DEC9] pt-4 font-mono text-[11px] text-[#52525B]">
              <Link
                to="/privacy"
                className="text-[#9A7812] font-semibold underline hover:text-[#18181B]"
              >
                Privacy Policy
              </Link>
              <span>·</span>
              <Link
                to="/terms"
                className="text-[#9A7812] font-semibold underline hover:text-[#18181B]"
              >
                Terms of Service
              </Link>
              <span>·</span>
              <a
                href="/.well-known/security.txt"
                className="text-[#9A7812] font-semibold underline hover:text-[#18181B]"
                target="_blank"
                rel="noopener noreferrer"
              >
                security.txt
              </a>
              <span>·</span>
              <a
                href="/.well-known/dnt-policy.txt"
                className="text-[#9A7812] font-semibold underline hover:text-[#18181B]"
                target="_blank"
                rel="noopener noreferrer"
              >
                dnt-policy.txt
              </a>
            </div>
          </div>

          {/* Grievance Officer Mechanism Box */}
          <div className="legal-paper flex flex-col justify-between rounded-md border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-6">
            <div>
              <div className="flex items-center gap-2 font-display text-base font-bold text-[#18181B] border-b border-[#E5DEC9] pb-3">
                <Lock className="h-4 w-4 text-[#9A7812]" />
                <span>DPDP Sec. 13 &amp; Sec. 8(10) Grievance Redressal</span>
              </div>
              <p className="mt-4 font-sans text-xs sm:text-sm leading-relaxed text-[#52525B]">
                Submit Access, Correction, Erasure, or Grievance petitions directly to our
                Designated Grievance Officer in Jaipur, India:
              </p>

              <div className="mt-4 space-y-2.5 rounded border border-[#E5DEC9] bg-white p-4 font-mono text-xs text-[#18181B]">
                <div className="flex items-center gap-2">
                  <span className="text-[#9A7812] font-semibold">Officer:</span>
                  <span>{LEGAL.grievanceOfficer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#9A7812]" />
                  <a
                    href={`mailto:${LEGAL.contactEmail}`}
                    className="text-[#9A7812] font-semibold hover:underline"
                  >
                    {LEGAL.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#9A7812]" />
                  <span>{LEGAL.phoneNumbers.join(" / ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#9A7812]" />
                  <span>Statutory Response SLA: Within 7 Business Days</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#E5DEC9] pt-4">
              <p className="font-mono text-[10px] text-[#52525B]">
                Issues deterministic Ticket ID (ASJI-GRV-2026-XXXX)
              </p>
              <button
                type="button"
                onClick={() => openGrievancePortalModal("Grievance")}
                className="btn-gold inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0"
              >
                <span>Open Grievance Portal</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
