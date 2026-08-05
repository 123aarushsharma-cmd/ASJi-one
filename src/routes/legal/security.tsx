import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, LegalSection } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";
import { Copy, Check, ExternalLink, ShieldCheck, Mail, Terminal } from "lucide-react";

export const Route = createFileRoute("/legal/security")({
  head: () => ({
    meta: [
      { title: "Vulnerability Disclosure & security.txt — ASJi One" },
      {
        name: "description",
        content:
          "Official Vulnerability Disclosure Policy and RFC 9116 security.txt specification for ASJi One compliance scanning platform.",
      },
      {
        property: "og:title",
        content: "Vulnerability Disclosure Policy & security.txt — ASJi One",
      },
      { property: "og:type", content: "article" },
    ],
  }),
  component: SecurityPolicyPage,
});

function SecurityPolicyPage() {
  const [copied, setCopied] = useState(false);

  const rawSecurityTxt = `Contact: mailto:security@asji.law
Contact: mailto:${LEGAL.contactEmail}
Expires: 2027-12-31T23:59:59.000Z
Preferred-Languages: en, ar, hi
Canonical: https://asji-one.vercel.app/.well-known/security.txt
Policy: https://asji-one.vercel.app/legal/security
Hiring: https://asji-one.vercel.app`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawSecurityTxt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <LegalPage
      title="Security & Vulnerability Disclosure"
      intro="ASJi One is committed to robust cybersecurity practices. We welcome bug reports from independent security researchers, ethical hackers, and security engineers to keep our platform and users safe."
    >
      {/* RFC 9116 security.txt Display Box */}
      <LegalSection title="1. Official security.txt (RFC 9116 Standard)">
        <p className="mb-4 text-[#E5E5E5]/90">
          In accordance with <strong>RFC 9116</strong>, our machine-readable security contact
          information is published at both{" "}
          <code className="rounded bg-black/60 px-1.5 py-0.5 text-[#D4AF37]">
            /.well-known/security.txt
          </code>{" "}
          and{" "}
          <code className="rounded bg-black/60 px-1.5 py-0.5 text-[#D4AF37]">/security.txt</code>.
        </p>

        <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/30 bg-black/80 p-5 font-sans">
          <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37]">
              <Terminal className="h-4 w-4" />
              <span>RFC 9116 Machine-Readable Specification</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-medium text-[#D4AF37] transition-all hover:bg-[#D4AF37] hover:text-black"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copied ? "Copied" : "Copy Raw"}</span>
              </button>
              <a
                href="/.well-known/security.txt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-[#E5E5E5] transition-all hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Endpoint</span>
              </a>
            </div>
          </div>

          <pre className="overflow-x-auto text-xs leading-relaxed text-[#E5E5E5]">
            <code>{rawSecurityTxt}</code>
          </pre>
        </div>
      </LegalSection>

      {/* Coordinated Vulnerability Disclosure (CVD) */}
      <LegalSection title="2. Coordinated Vulnerability Disclosure (CVD)">
        <p>
          We follow Coordinated Vulnerability Disclosure principles. When reporting a potential
          security issue, please adhere to the following guidelines:
        </p>
        <ul className="mt-3 space-y-2 text-[#E5E5E5]/90">
          <li className="flex items-start gap-2">
            <span className="text-[#D4AF37]">•</span>
            <span>
              Send detailed vulnerability details to <strong>security@asji.law</strong> or{" "}
              <strong>{LEGAL.contactEmail}</strong>.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4AF37]">•</span>
            <span>
              Provide step-by-step reproduction instructions or proof-of-concept (PoC) scripts.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4AF37]">•</span>
            <span>
              Allow us a reasonable timeframe (minimum 30 days) to address and remediate the issue
              before public disclosure.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#D4AF37]">•</span>
            <span>
              Do not access or modify user data, perform denial of service (DoS/DDoS) attacks, or
              execute social engineering.
            </span>
          </li>
        </ul>
      </LegalSection>

      {/* Safe Harbor Statement */}
      <LegalSection title="3. Safe Harbor Framework">
        <p>
          If you conduct security research in good faith and in compliance with this policy, we
          consider your research to be authorized. We will not initiate legal action against
          researchers for accidental, good-faith violations of security testing constraints.
        </p>
      </LegalSection>

      {/* Reporting Contact Cards */}
      <LegalSection title="4. Vulnerability Response SLA">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="flex items-center gap-2 font-semibold text-[#D4AF37]">
              <Mail className="h-4 w-4" />
              <span>Response SLA</span>
            </div>
            <p className="mt-2 text-xs text-[#E5E5E5]/80">
              Initial acknowledgment within <strong>24 business hours</strong>. Triage and severity
              assessment within <strong>72 hours</strong>.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/50 p-4">
            <div className="flex items-center gap-2 font-semibold text-[#D4AF37]">
              <ShieldCheck className="h-4 w-4" />
              <span>International Standards</span>
            </div>
            <p className="mt-2 text-xs text-[#E5E5E5]/80">
              Aligned with ISO/IEC 29147 (Vulnerability disclosure) and ISO/IEC 30111 (Vulnerability
              handling).
            </p>
          </div>
        </div>
      </LegalSection>
    </LegalPage>
  );
}
