import React from "react";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, Mail, Phone, Clock, FileText, Lock, Scale } from "lucide-react";
import { LEGAL } from "@/lib/legal";

export function StatutoryGrievanceNotice() {
  return (
    <section
      id="statutory-notice"
      className="relative my-16 rounded-3xl border border-[#D4AF37]/20 bg-[#0d0d0d]/90 p-6 sm:p-8 md:p-10 backdrop-blur-2xl shadow-2xl"
    >
      <div className="relative z-10 flex flex-col gap-6">
        {/* Header Title */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#D4AF37]/15 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-[#D4AF37] uppercase">
              <Scale className="h-3.5 w-3.5" />
              <span>Statutory Compliance & Grievance Architecture</span>
            </div>
            <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-[#E5E5E5] sm:text-3xl">
              Transparency Notice & Statutory Grievance Redressal Mechanism
            </h2>
            <p className="mt-1 font-mono text-xs text-[#E5E5E5]/70">
              Mandated compliance disclosures under India DPDP Act 2023 Sec 13 &amp; Sec 8(10) and
              EU GDPR Art. 13
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2 font-mono text-xs text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>DPDP &amp; GDPR Verified</span>
          </div>
        </div>

        {/* Grid Partition */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Transparency Notice Box */}
          <div className="flex flex-col justify-between rounded-2xl border border-white/10 bg-black/50 p-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                <FileText className="h-4 w-4" />
                <span>Section 13 Statutory Transparency Notice</span>
              </div>
              <p className="mt-3 font-mono text-xs leading-relaxed text-[#E5E5E5]/80">
                <strong>Data Controller:</strong> {LEGAL.legalEntity} ({LEGAL.operator}).
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-[#E5E5E5]/80">
                <strong>Categories Processed:</strong> Public domain HTTP response headers, SSL/TLS
                certificate metadata, and user-initiated target endpoint URLs.
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-[#E5E5E5]/80">
                <strong>Purpose &amp; Lawful Basis:</strong> Executing user-requested technical
                compliance evaluations (GDPR Art. 6(1)(b) &amp; India DPDP Act 2023 Sec 6).
              </p>
              <p className="mt-2 font-mono text-xs leading-relaxed text-[#E5E5E5]/80">
                <strong>Data Retention:</strong> Scan results process transiently in sandboxed
                memory with zero persistent tracking or behavioral profiling.
              </p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-4 font-mono text-[11px]">
              <Link to="/privacy" className="text-[#D4AF37] underline hover:text-white">
                Privacy Policy
              </Link>
              <span className="text-[#E5E5E5]/40">•</span>
              <Link to="/terms" className="text-[#D4AF37] underline hover:text-white">
                Terms of Service
              </Link>
              <span className="text-[#E5E5E5]/40">•</span>
              <a
                href="/.well-known/security.txt"
                className="text-[#D4AF37] underline hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                security.txt
              </a>
              <span className="text-[#E5E5E5]/40">•</span>
              <a
                href="/.well-known/dnt-policy.txt"
                className="text-[#D4AF37] underline hover:text-white"
                target="_blank"
                rel="noopener noreferrer"
              >
                dnt-policy.txt
              </a>
            </div>
          </div>

          {/* Grievance Officer Mechanism Box */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#D4AF37]/20 bg-black/60 p-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-[#D4AF37]">
                <Lock className="h-4 w-4" />
                <span>DPDP Sec 8(10) Statutory Grievance Redressal</span>
              </div>
              <p className="mt-3 font-mono text-xs text-[#E5E5E5]/90">
                In compliance with Section 8(10) of the Digital Personal Data Protection Act 2023,
                users may submit data principal requests or grievances directly to our designated
                Grievance Officer:
              </p>

              <div className="mt-4 space-y-2 rounded-xl border border-[#D4AF37]/15 bg-black/80 p-4 font-mono text-xs text-[#E5E5E5]">
                <div className="flex items-center gap-2">
                  <span className="text-[#D4AF37]">Designation:</span>
                  <span>{LEGAL.grievanceOfficer}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <a
                    href={`mailto:${LEGAL.contactEmail}`}
                    className="text-[#D4AF37] hover:underline"
                  >
                    {LEGAL.contactEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>{LEGAL.phoneNumbers.join(" / ")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-[#D4AF37]" />
                  <span>Statutory Response SLA: Within 7 Business Days</span>
                </div>
              </div>
            </div>

            <p className="mt-4 font-mono text-[10px] text-[#E5E5E5]/60">
              Governing Law: Republic of India & Applicable Global Data Protection Standards.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
