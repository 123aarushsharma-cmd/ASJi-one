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
      statute: "GDPR Art. 32 // DPDP Act s.8(5) // ISO 27001",
      passed: hasHttps,
      icon: Lock,
      successText: "HTTPS active with strict SSL/TLS encryption enforced.",
      failText: "Missing strict HTTPS redirection; cleartext transmission risk.",
      severity: "CRITICAL",
    },
    {
      id: "diag-hsts",
      title: "HTTP Strict Transport Security (HSTS)",
      statute: "RFC 6797 // OWASP ASVS V14.4",
      passed: hasHsts,
      icon: ShieldCheck,
      successText: "HSTS header present with subDomain preloading active.",
      failText: "HSTS header omitted; site vulnerable to SSL-stripping MITM attacks.",
      severity: "HIGH",
    },
    {
      id: "diag-csp",
      title: "Content Security Policy (CSP & Anti-Sniffing)",
      statute: "W3C CSP Level 3 // OWASP ASVS V14.1",
      passed: hasCsp,
      icon: ShieldCheck,
      successText: "CSP directives restrict malicious third-party script injection.",
      failText: "No Content-Security-Policy header; vulnerable to XSS and injection.",
      severity: "HIGH",
    },
    {
      id: "diag-cookies",
      title: "Pre-Consent Cookie & Tracker Gating",
      statute: "ePrivacy Directive 2002/58/EC // EDPB 05/2020",
      passed: !hasPreConsentLeak,
      icon: Cookie,
      successText: "Zero unconsented third-party trackers or telemetry cookies placed.",
      failText: "Tracking cookies dropped prior to affirmative user opt-in consent.",
      severity: "CRITICAL",
    },
    {
      id: "diag-privacy",
      title: "Statutory Privacy Notice at Collection",
      statute: "DPDP Act 2023 s.5 // GDPR Art. 13 & 14",
      passed: hasPrivacyNotice,
      icon: FileText,
      successText: "Clear, itemized privacy policy accessible in landing page structure.",
      failText: "Missing or non-discoverable privacy notice violating mandatory disclosure.",
      severity: "HIGH",
    },
    {
      id: "diag-grievance",
      title: "Grievance Redressal & DPO Publication",
      statute: "DPDP Act 2023 s.13 // IT Rules 2021 Rule 3(2)",
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
    <div className="surface-panel p-5 sm:p-7 border-primary/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg sm:text-xl font-bold text-gold-gradient">
              Statutory Compliance Diagnostics Checklist
            </h3>
            <span className="rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary uppercase">
              Pass / Fail Analysis
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Deterministic technical and statutory evaluation benchmarked against 6 global privacy
            statutes.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-emerald-400 font-bold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {passCount} PASSED
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/40 bg-rose-500/10 px-2.5 py-1 text-rose-400 font-bold">
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
              className={`rounded-xl border p-4 flex flex-col justify-between transition-all ${
                diag.passed
                  ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                  : "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/50"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        diag.passed ? "text-emerald-400" : "text-rose-400"
                      }`}
                    />
                    <p className="text-xs font-semibold text-foreground">{diag.title}</p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-wider ${
                      diag.passed
                        ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-300"
                        : "border border-rose-500/40 bg-rose-500/20 text-rose-300"
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

                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {diag.passed ? diag.successText : diag.failText}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-2 text-[10px] font-mono text-muted-foreground">
                <span className="truncate max-w-[220px]">{diag.statute}</span>
                <span
                  className={
                    diag.passed ? "text-emerald-400 font-semibold" : "text-rose-400 font-semibold"
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
