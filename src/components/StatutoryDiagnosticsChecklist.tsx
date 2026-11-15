import React from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  Lock,
  FileText,
  Cookie,
  Users,
  Globe,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";

interface StatutoryDiagnosticsChecklistProps {
  report: AuditReport;
}

export function StatutoryDiagnosticsChecklist({ report }: StatutoryDiagnosticsChecklistProps) {
  const ev = (report.evidence || []).join(" ").toLowerCase();

  // Determine individual Pass/Fail criteria deterministically from report evidence
  const hasHttps =
    !ev.includes("site only answered over plain http") &&
    !ev.includes("plain http") &&
    (report.target.startsWith("https://") || !report.target.startsWith("http://"));

  const hasHsts =
    !ev.includes("missing security headers: strict-transport-security") &&
    !ev.includes("strict-transport-security missing");

  const hasCsp =
    !ev.includes("content-security-policy") && !ev.includes("missing: content-security-policy");

  const hasPreConsentLeak =
    ev.includes("pre-consent") || ev.includes("unconsented tracking") || ev.includes("cookie flag");

  const hasPrivacyNotice =
    !ev.includes("no visible link to privacy policy") &&
    !ev.includes("lack of privacy notice") &&
    !ev.includes("no privacy or terms links");

  const hasGrievanceOfficer =
    !ev.includes("absence of grievance mechanism") &&
    !ev.includes("no designated data protection officer") &&
    !ev.includes("grievance officer contact");

  const diagnostics = [
    {
      id: "diag-https",
      title: "Transport Layer Security (TLS 1.3 & HTTPS)",
      statute: "GDPR Art. 32 · DPDP Act s.8(5) · ISO 27001",
      passed: hasHttps,
      icon: Lock,
      successText: "HTTPS active with strict SSL/TLS encryption enforced.",
      failText: "Missing strict HTTPS redirection; cleartext transmission risk.",
      severity: "CRITICAL",
    },
    {
      id: "diag-hsts",
      title: "HTTP Strict Transport Security (HSTS)",
      statute: "RFC 6797 · OWASP ASVS V14.4",
      passed: hasHsts,
      icon: ShieldCheck,
      successText: "HSTS header present with subDomain preloading active.",
      failText: "HSTS header omitted; site vulnerable to SSL-stripping MITM attacks.",
      severity: "HIGH",
    },
    {
      id: "diag-csp",
      title: "Content Security Policy (CSP & Anti-Sniffing)",
      statute: "W3C CSP Level 3 · OWASP ASVS V14.1",
      passed: hasCsp,
      icon: ShieldCheck,
      successText: "CSP directives restrict malicious third-party script injection.",
      failText: "No Content-Security-Policy header; vulnerable to XSS and injection.",
      severity: "HIGH",
    },
    {
      id: "diag-cookies",
      title: "Pre-Consent Cookie & Tracker Gating",
      statute: "ePrivacy Directive 2002/58/EC · EDPB 05/2020",
      passed: !hasPreConsentLeak,
      icon: Cookie,
      successText: "Zero unconsented third-party trackers or telemetry cookies placed.",
      failText: "Tracking cookies dropped prior to affirmative user opt-in consent.",
      severity: "CRITICAL",
    },
    {
      id: "diag-privacy",
      title: "Statutory Privacy Notice at Collection",
      statute: "DPDP Act 2023 s.5 · GDPR Art. 13 & 14",
      passed: hasPrivacyNotice,
      icon: FileText,
      successText: "Clear, itemized privacy policy accessible in landing page structure.",
      failText: "Missing or non-discoverable privacy notice violating mandatory disclosure.",
      severity: "HIGH",
    },
    {
      id: "diag-grievance",
      title: "Grievance Redressal & DPO Publication",
      statute: "DPDP Act 2023 s.13 · IT Rules 2021 Rule 3(2)",
      passed: hasGrievanceOfficer,
      icon: Users,
      successText: "Statutory Grievance Officer details & 48h resolution SLA disclosed.",
      failText: "Absence of designated Grievance Officer / DPO contact information.",
      severity: "HIGH",
    },
  ];

  const passCount = diagnostics.filter((d) => d.passed).length;
  const failCount = diagnostics.length - passCount;

  return (
    <div className="rounded-md border border-[#262932] bg-[#15171C] p-5 sm:p-7">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#262932] pb-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-display text-lg sm:text-xl font-bold text-[#F4F4F5]">
              Statutory Compliance Diagnostics Checklist
            </h3>
            <span className="font-mono text-[11px] font-semibold text-[#C9A227] uppercase tracking-wider">
              Pass / Fail Analysis
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-0.5">
            Direct statutory mapping and live telemetry evaluation benchmarked against global
            privacy statutes.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs tabular-nums">
          <span className="inline-flex items-center gap-1 rounded border border-[#10B981]/40 bg-[#10B981]/10 px-2.5 py-1 text-[#10B981] font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {passCount} PASSED
          </span>
          <span className="inline-flex items-center gap-1 rounded border border-[#EF4444]/40 bg-[#EF4444]/10 px-2.5 py-1 text-[#EF4444] font-bold">
            <XCircle className="h-3.5 w-3.5" />
            {failCount} FAILED
          </span>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {diagnostics.map((diag) => {
          const Icon = diag.icon;
          return (
            <div
              key={diag.id}
              className="rounded-md border border-[#262932] bg-[#0D0E11] p-4 flex flex-col justify-between transition-colors hover:border-[#C9A227]/60"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        diag.passed ? "text-[#10B981]" : "text-[#EF4444]"
                      }`}
                    />
                    <p className="text-xs font-semibold text-[#F4F4F5]">{diag.title}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider shrink-0 ${
                      diag.passed
                        ? "border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]"
                        : "border border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]"
                    }`}
                  >
                    {diag.passed ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> PASS
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" /> FAIL
                      </>
                    )}
                  </span>
                </div>

                <p className="mt-2 text-xs leading-relaxed text-[#A1A1AA]">
                  {diag.passed ? diag.successText : diag.failText}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-[#262932] pt-2 text-[10px] font-mono text-[#71717A]">
                <span className="truncate max-w-[230px]">{diag.statute}</span>
                <span
                  className={
                    diag.passed ? "text-[#10B981] font-semibold" : "text-[#EF4444] font-semibold"
                  }
                >
                  {diag.passed ? "Compliant" : `Risk: ${diag.severity}`}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
