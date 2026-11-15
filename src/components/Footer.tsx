import React from "react";
import { Mail, Phone, Linkedin, ExternalLink, Globe, Scale, UserCheck } from "lucide-react";
import { LEGAL, LEGAL_PAGES, openGrievancePortalModal } from "@/lib/legal";
import { openCookiePreferencesModal } from "@/components/CookieConsent";
import { ASJiBrandLockup } from "@/components/ASJiBrandLockup";

interface FooterProps {
  onOpenLegalModal?: (title: string, content: string) => void;
}

const LEGAL_CONTENTS: Record<string, { title: string; content: string }> = {
  "/legal/terms": {
    title: "Terms of Service",
    content: `TERMS OF SERVICE — ASJi ONE (TRUST INTELLIGENCE)
Effective Year: 2026 · Operator: ${LEGAL.legalEntity} (Jaipur, Rajasthan, India)

1. ACCEPTANCE & CONTRACTUAL SCOPE
By accessing asjione.com or initiating a technical telemetry audit through ASJi One, you enter into a binding agreement with ${LEGAL.legalEntity} ("ASJi"). If acting on behalf of a body corporate or campaign committee, you warrant authority to bind that entity.

2. AUTHORIZED PASSIVE TELEMETRY ASSESSMENT
ASJi One executes passive, non-intrusive inspection of publicly reachable DNS records, TLS configurations, HTTP response headers, and public HTML script references. You represent and warrant that you own or hold explicit legal authorization from the domain controller prior to running an assessment.

3. SECURITY & ANTI-ABUSE CONSTRAINTS
Users are strictly prohibited from submitting private intranet ranges (127.0.0.1, 192.168.x.x, localhost), non-standard ports, malformed injection payloads, or exceeding automated inspection rate limits.

4. INTELLECTUAL PROPERTY & REMEDIATION LICENSING
Server hardening patches (Nginx, Cloudflare Workers, Express middleware), zero-cookie script blockers, multilingual electoral notices, and statutory drafting packs remain the exclusive intellectual property of ${LEGAL.legalEntity} until verified payment unlocks the domain license.

5. NO LEGAL COUNSEL & LIMITATION OF LIABILITY
Technical compliance observations and statutory templates support internal governance workflows and do not establish an attorney-client relationship or formal regulatory certification. Aggregate liability is strictly capped at fees actually paid during the preceding 12 months.

6. GOVERNING LAW & JURISDICTION
Governed by the laws of the Republic of India, with courts at Jaipur, Rajasthan exercising exclusive jurisdiction.`,
  },
  "/legal/privacy": {
    title: "Privacy Policy (DPDP Act 2023 & EU GDPR)",
    content: `PRIVACY POLICY & DATA PROTECTION NOTICE — ASJi ONE
Data Fiduciary / Controller: ${LEGAL.legalEntity} · Jaipur, Rajasthan, India
Designated Grievance Officer: ${LEGAL.grievanceOfficer.name} (${LEGAL.contactEmail})

1. STATUTORY ALIGNMENT
ASJi Web and Legal Solution processes personal data in strict alignment with the Digital Personal Data Protection Act, 2023 (India), Regulation (EU) 2016/679 (GDPR), and UK GDPR.

2. ITEMIZED CATEGORIES OF DATA PROCESSED
(a) Telemetry Inspection Targets: Public domain names or infrastructure summaries submitted by you for technical evaluation. Executed transiently in sandboxed memory with zero persistent third-party tracking.
(b) Authentication & Licensing Records: Account email, UID, and payment UTR verification metadata (stored encrypted via Google Cloud / Firebase) solely when you authenticate or purchase a domain remediation license.
(c) Consent Ledger: Timestamped granular cookie and telemetry consent decisions stored locally and optionally synced when signed in.

3. LAWFUL BASIS & PURPOSE LIMITATION
Processing is strictly limited to: (i) delivering your requested technical compliance evaluation (DPDP Sec. 6 affirmative consent / GDPR Art. 6(1)(b)); (ii) verifying domain remediation licenses; and (iii) enforcing rate-limit and SSRF security controls (GDPR Art. 6(1)(f)). We never sell personal data or deploy cross-site behavioral advertising trackers.

4. DATA RETENTION & ZERO-RETENTION SCANNING
Transient HTTP header/DNS inspection payloads are discarded immediately after rendering the audit report. Authenticated account audit histories expire after 12 months unless purged earlier via "New Scan" or an Erasure request.

5. DATA PRINCIPAL RIGHTS & 7-DAY GRIEVANCE SLA
Under DPDP Act Sec. 11–13 and GDPR Art. 15–21, you may request Access, Correction, Erasure, Consent Withdrawal, or Grievance Redressal via the interactive Grievance Portal in the footer or by writing to ${LEGAL.contactEmail}. Validated requests are resolved within 7 business days.`,
  },
  "/legal/cookies": {
    title: "Cookie & Script-Gating Notice",
    content: `COOKIE & SCRIPT-GATING NOTICE — ASJi ONE
Operator: ${LEGAL.legalEntity} · Contact: ${LEGAL.contactEmail}

1. ZERO-LEAK DEFAULT POSTURE
ASJi One blocks non-essential analytics, marketing, and preference scripts by default upon first arrival until affirmative, uncoerced consent is recorded (DPDP Act Sec. 6 & GDPR Art. 7).

2. STRICTLY NECESSARY STORAGE
• Consent Ledger ("asji_cookie_consent_decision"): Persists your grant, rejection, or withdrawal state.
• Rate-Limit Counter ("asji_scan_timestamps"): Client-side sliding-window anti-abuse protection enforcing 5 scans per minute.
• Authentication Session Tokens: Maintained exclusively when signing in for enterprise license unlock.

3. GRANULAR CONTROL & ONE-CLICK WITHDRAWAL
You may grant, reject non-essential storage, customize categories, or withdraw previously granted consent at any moment with zero penalty via "Consent Preferences" in the footer.`,
  },
  "/legal/refunds": {
    title: "Refund & Digital Delivery Policy",
    content: `REFUND & DIGITAL DELIVERY POLICY — ASJi ONE
Billing Entity: ${LEGAL.legalEntity} · Jaipur, Rajasthan, India

1. IMMEDIATE DIGITAL FULFILLMENT
Upon verification of your 12-digit UPI/IMPS/NEFT UTR reference or authorized institutional transfer, the unlocked domain license immediately releases downloadable server security patches (Nginx, Cloudflare, Express), zero-cookie blockers, and tailored statutory documentation.

2. NON-REFUNDABLE DIGITAL DELIVERABLES
Due to the irrevocable, instant delivery of proprietary source code and bespoke statutory drafting assets once unlocked, digital suite fees are final and non-refundable after license activation.

3. ENGINEERING ASSISTANCE & BILLING DISPUTES
Should you encounter server integration challenges or duplicate UTR submissions, write to ${LEGAL.contactEmail} with your Transaction Reference and domain name. Our engineering and compliance desk resolves verified billing discrepancies within 24–48 business hours.`,
  },
  "/legal/acceptable-use": {
    title: "Acceptable Use Policy",
    content: `ACCEPTABLE USE POLICY — ASJi ONE
Operator: ${LEGAL.legalEntity} · Security Desk: ${LEGAL.contactEmail}

1. AUTHORIZED TARGETS ONLY
Users may inspect only public web domains they own or hold documented authorization to evaluate. Submitting unauthorized third-party targets for competitive intelligence or exploitation probing is strictly prohibited.

2. PROHIBITED TECHNICAL CONDUCT
You shall not:
• Probe localhost, loopback (127.0.0.1), RFC 1918 private networks (10.x, 172.16.x, 192.168.x), or cloud metadata endpoints (169.254.169.254).
• Inject HTML/script tags, javascript:/data: URIs, or malformed control sequences into scanner inputs.
• Circumvent the 5-scans-per-minute client and server rate limits or paywall license verification vaults.

3. ENFORCEMENT
Attempts to bypass inspection safeguards or payment verification trigger immediate session suspension and security audit logging.`,
  },
  "/legal/security": {
    title: "RFC 9116 Security Policy (security.txt)",
    content: `# RFC 9116 Sovereign Security & Vulnerability Disclosure Policy — ASJi One
Contact: mailto:${LEGAL.contactEmail}
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, hi
Canonical: https://asjione.com/.well-known/security.txt
Policy: https://www.asji.online

1. HARDENED ARCHITECTURE
ASJi One enforces strict input sanitization, SSRF private-IP filtering, referrer policy (strict-origin-when-cross-origin), HTTPS transport security, and Firebase Firestore least-privilege rules.

2. RESPONSIBLE DISCLOSURE COMMITMENT
Security researchers identifying a reproducible vulnerability in asjione.com or associated APIs should email ${LEGAL.contactEmail} with steps to reproduce. We acknowledge disclosures within 24 hours and prioritize remediation patches cleanly.`,
  },
  "/legal/disclaimer": {
    title: "Statutory Safe Harbor & Legal Disclaimer",
    content: `STATUTORY SAFE HARBOR & LEGAL DISCLAIMER — ASJi ONE
Issued by: ${LEGAL.legalEntity} · ${LEGAL.founderName}, Jaipur, India

1. TECHNICAL COMPLIANCE OBSERVATIONS ONLY (NOT LEGAL ADVICE)
ASJi One performs deterministic technical inspections of publicly observable signals (TLS, HTTP security headers, third-party script tags, and published legal links) mapped against statutory texts across 15 sovereign jurisdictions. Outputs assist engineering and governance teams and do not constitute formal legal opinions, attorney-client advice, or regulatory certification.

2. SAFE HARBOR FOR GOOD-FAITH RESEARCH
Independent security researchers acting strictly within our Responsible Disclosure guidelines (RFC 9116), without accessing private user data or degrading service availability, receive safe harbor assurance from legal action under the Information Technology Act, 2000.

3. STATUTORY DISPUTE RESOLUTION
For formal statutory notices or legal process inquiries, contact ${LEGAL.grievanceOfficer.name} at ${LEGAL.contactEmail}.`,
  },
};

export function Footer({ onOpenLegalModal }: FooterProps) {
  const handleLegalClick = (e: React.MouseEvent, to: string) => {
    if (onOpenLegalModal && LEGAL_CONTENTS[to]) {
      e.preventDefault();
      onOpenLegalModal(LEGAL_CONTENTS[to].title, LEGAL_CONTENTS[to].content);
    }
  };

  return (
    <footer className="mt-8 border-t border-[#262932] bg-[#0D0E11] pt-10 pb-24 lg:pb-10 text-center text-xs text-zinc-400">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Global Footer Brand Column & Firm Positioning Header */}
        <div className="mb-8 flex flex-col items-center text-center gap-3">
          <ASJiBrandLockup size="footer" idSuffix="footer_lockup" />
          <div className="space-y-1">
            <p className="font-display text-sm sm:text-base font-bold text-[#FAF8F5]">
              {LEGAL.legalEntity}
            </p>
            <p className="font-mono text-[11px] text-[#C9A227]">{LEGAL.positioning}</p>
          </div>
        </div>

        {/* Contact & Verified Legal-Tech Channels Grid */}
        <div className="mb-10 grid gap-6 rounded-xl border border-[#262932] bg-[#15171C] p-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Official Email Block */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#262932] bg-[#0D0E11] text-[#C9A227]">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                Official Compliance Desk
              </p>
              <a
                href={`mailto:${LEGAL.contactEmail}`}
                className="mt-0.5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-[#FAF8F5] transition-colors hover:text-[#C9A227]"
              >
                {LEGAL.contactEmail}
              </a>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                Data privacy audits, cyber law &amp; remediation support
              </p>
            </div>
          </div>

          {/* Direct Telephone Block */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#262932] bg-[#0D0E11] text-[#C9A227]">
              <Phone className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
                Direct Telephone · Jaipur, India
              </p>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-sm font-semibold text-[#FAF8F5] tabular-nums">
                {LEGAL.phoneNumbers.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-[#C9A227]"
                  >
                    {phone}
                  </a>
                ))}
              </div>
              <p className="mt-0.5 text-[11px] text-zinc-500">Mon - Sat · 9:00 AM - 7:00 PM IST</p>
            </div>
          </div>

          {/* Verified Portal & LinkedIn Profiles Block */}
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <p className="mb-2 text-[11px] font-mono font-semibold uppercase tracking-wider text-zinc-400">
              Verified Portal &amp; LinkedIn
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={LEGAL.website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-mono font-bold whitespace-nowrap"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>www.asji.online</span>
                <ExternalLink className="h-3 w-3" />
              </a>

              <a
                href={LEGAL.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#262932] bg-[#0D0E11] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-[#C9A227] hover:text-[#C9A227] whitespace-nowrap"
              >
                <Linkedin className="h-3.5 w-3.5 text-[#C9A227]" />
                <span>ASJi Firm</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>

              <a
                href={LEGAL.founderLinkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#262932] bg-[#0D0E11] px-3 py-2 text-xs font-medium text-zinc-200 transition-colors hover:border-[#C9A227] hover:text-[#C9A227] whitespace-nowrap"
              >
                <UserCheck className="h-3.5 w-3.5 text-[#C9A227]" />
                <span>Arush Sharma</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Institutional Legal Portal & Interactive Self-Compliance Actions */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <a
            href={LEGAL.website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 rounded-lg border border-[#262932] bg-[#15171C] px-4 py-2.5 text-xs font-mono text-zinc-200 transition-colors hover:border-[#C9A227]"
          >
            <Scale className="h-3.5 w-3.5 text-[#C9A227]" />
            <span>ASJi Official Legal Portal:</span>
            <span className="font-semibold text-[#C9A227] underline underline-offset-4">
              www.asji.online
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-[#C9A227]" />
          </a>

          <button
            type="button"
            onClick={() => openGrievancePortalModal("Grievance")}
            className="inline-flex items-center gap-2 rounded-lg border border-[#C9A227]/45 bg-[#15171C] px-4 py-2.5 text-xs font-mono font-semibold text-[#C9A227] transition-colors hover:border-[#C9A227] hover:bg-[#C9A227]/10 cursor-pointer"
          >
            <UserCheck className="h-3.5 w-3.5" />
            <span>Data Principal &amp; Grievance Portal (DPDP Sec. 13)</span>
          </button>
        </div>

        {/* Legal Pages Navigation */}
        <nav
          aria-label="Legal documentation navigation"
          className="mx-auto flex max-w-5xl flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-zinc-400"
        >
          {LEGAL_PAGES.map((p) => (
            <a
              key={p.to}
              href={p.to}
              onClick={(e) => handleLegalClick(e, p.to)}
              className="transition-colors hover:text-[#C9A227] cursor-pointer"
            >
              {p.label}
            </a>
          ))}
          <button
            type="button"
            onClick={() => openCookiePreferencesModal()}
            className="font-semibold text-[#C9A227] transition-colors hover:text-[#FAF8F5] underline underline-offset-2 cursor-pointer"
          >
            Consent Preferences
          </button>
        </nav>

        {/* Legal Disclaimer */}
        <p className="mx-auto mt-5 max-w-2xl px-5 text-[11px] leading-relaxed text-zinc-500">
          ASJi One reports provide deterministic technical assessments of publicly observable web
          signals across 15 sovereign privacy mandates. Grievance &amp; privacy inquiries:{" "}
          <a
            href={`mailto:${LEGAL.contactEmail}`}
            className="underline text-zinc-300 hover:text-[#C9A227]"
          >
            {LEGAL.contactEmail}
          </a>
        </p>

        {/* Copyright */}
        <p suppressHydrationWarning className="mt-4 text-xs font-medium text-zinc-400">
          © {new Date().getFullYear()} {LEGAL.legalEntity} · Built in Jaipur, India ·{" "}
          {LEGAL.operator} Trust Intelligence
        </p>
      </div>
    </footer>
  );
}
