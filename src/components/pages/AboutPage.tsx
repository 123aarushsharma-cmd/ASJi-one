import React from "react";
import {
  Scale,
  Building2,
  Mail,
  Phone,
  ExternalLink,
  ShieldCheck,
  Award,
  Linkedin,
  Globe,
  Lock,
  FileCode2,
  Landmark,
  FileText,
} from "lucide-react";
import { SpecularCard } from "@/components/SpecularCard";
import { LEGAL } from "@/lib/legal";

/**
 * Immutable verified founder portrait & profile constants — hardcoded in source with zero runtime mutation or override paths.
 */
const FOUNDER_PORTRAIT = Object.freeze({
  src: "/assets/aistudio/Arush__50c4cc0b.jpeg",
  alt: "Arush Sharma — Founder & Principal Legal-Tech Architect, ASJi Web and Legal Solution",
});

const FOUNDER_CREDENTIALS = Object.freeze([
  "BBA LL.B. (Hons.) — The ICFAI University, Jaipur",
  "International Data Compliance Architect (DPDP Act 2023, GDPR, CCPA/CPRA, UAE/KSA PDPL)",
  "Cisco Certified — Cybersecurity & Junior Cybersecurity Analyst Path",
  "Member — American Bar Association (ABA)",
  "Member — Young International Arbitration Group (YIAG / LCIA)",
] as const);

const FIRM_CORE_PILLARS = Object.freeze([
  Object.freeze({
    number: "01",
    title: "Global Data Privacy & Statutory Audits",
    detail:
      "Automated telemetry inspection & fine-ceiling mapping across 15 sovereign jurisdictions.",
    icon: Globe,
  }),
  Object.freeze({
    number: "02",
    title: "Automated Remediation Engineering",
    detail: "Production server security headers (HSTS, CSP) & zero-cookie consent architecture.",
    icon: FileCode2,
  }),
  Object.freeze({
    number: "03",
    title: "PoliTech & Election Data Compliance Systems",
    detail: "Electoral ad-tracker forensics, paid-for-by disclosures & multilingual voter notices.",
    icon: Landmark,
  }),
  Object.freeze({
    number: "04",
    title: "Cloud-Based Digital Office & Legal Drafting Automation",
    detail: "Statute-locked privacy notices, grievance charters & audit-grade PDF certification.",
    icon: FileText,
  }),
] as const);

export function AboutPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-[#262932] pb-8 space-y-4">
        <div className="inline-flex items-center gap-2 rounded border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-xs font-mono font-bold text-[#C9A227]">
          <Building2 className="h-4 w-4" /> ASJI WEB AND LEGAL SOLUTION
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF8F5] max-w-4xl">
          Where Law Meets Innovation — Sovereign Data Privacy, Cyber Compliance &amp; Legal-Tech
          Infrastructure
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-sans max-w-3xl leading-relaxed">
          Engineered in Jaipur, India to eliminate the divide between statutory privacy
          jurisprudence and production web infrastructure across 15 sovereign global frameworks.
        </p>
      </div>

      {/* Founder Spotlight & Executive Desk Grid */}
      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        {/* Founder Spotlight Card (8 cols on lg) */}
        <SpecularCard className="lg:col-span-8 rounded-2xl border border-[#262932] bg-[#15171C] p-6 sm:p-8">
          <div className="grid gap-6 md:grid-cols-12 items-start">
            {/* Immutable Executive Portrait Frame (aspect-[4/5], double hairline gold border + corner ticks + studio vignette) */}
            <div className="md:col-span-5 flex flex-col items-center">
              <div
                onContextMenu={(e) => e.preventDefault()}
                className="group relative w-full max-w-[290px] aspect-[4/5] rounded-2xl p-1.5 bg-[#0D0E11] overflow-hidden select-none shadow-[0_24px_60px_-18px_rgba(201,162,39,0.24)]"
                style={{ border: "1px solid rgba(201, 162, 39, 0.56)" }}
              >
                {/* Subtle Metallic Frame Sheen */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-2xl opacity-60"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(201, 162, 39, 0.16) 0%, transparent 38%, rgba(201, 162, 39, 0.08) 100%)",
                  }}
                />

                {/* Inner Double Hairline Gold Frame */}
                <div
                  className="relative h-full w-full rounded-xl overflow-hidden bg-[#0D0E11] flex items-center justify-center"
                  style={{ border: "1px solid rgba(201, 162, 39, 0.30)" }}
                >
                  {/* Gold Corner Bracket Ticks */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-2.5 left-2.5 z-30 h-4 w-4 border-t-2 border-l-2 border-[#C9A227]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-2.5 right-2.5 z-30 h-4 w-4 border-t-2 border-r-2 border-[#C9A227]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-2.5 left-2.5 z-30 h-4 w-4 border-b-2 border-l-2 border-[#C9A227]"
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-2.5 right-2.5 z-30 h-4 w-4 border-b-2 border-r-2 border-[#C9A227]"
                  />

                  {/* Top-Right Locked Founder Verification Seal */}
                  <div className="pointer-events-none absolute top-3.5 right-3.5 z-30 inline-flex items-center gap-1 rounded border border-[#C9A227]/50 bg-[#0D0E11]/85 px-2 py-0.5 backdrop-blur-sm">
                    <ShieldCheck className="h-3 w-3 text-[#C9A227]" />
                    <span className="font-mono text-[8.5px] font-bold uppercase tracking-widest text-[#C9A227]">
                      Verified Founder
                    </span>
                  </div>

                  {/* Verified Static Founder Portrait */}
                  <img
                    src={FOUNDER_PORTRAIT.src}
                    alt={FOUNDER_PORTRAIT.alt}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover object-[50%_15%] pointer-events-none select-none transition-transform duration-700 ease-out group-hover:scale-[1.025]"
                    style={{
                      filter: "contrast(1.08) saturate(0.78) brightness(0.92) sepia(0.08)",
                    }}
                  />

                  {/* Layer 1: Radial Dark-Onyx Studio Perimeter Vignette */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                      background:
                        "radial-gradient(ellipse at 50% 40%, transparent 44%, rgba(13, 14, 17, 0.76) 100%)",
                    }}
                  />

                  {/* Layer 2: Warm Antique-Gold Key-Light Rim Glaze */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-10"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(201, 162, 39, 0.14) 0%, transparent 45%, rgba(13, 14, 17, 0.35) 100%)",
                    }}
                  />

                  {/* Layer 3: Bottom OnyxFade Gradient (#0D0E11) */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-32 z-20"
                    style={{
                      background:
                        "linear-gradient(to top, #0D0E11 14%, rgba(13, 14, 17, 0.72) 48%, transparent 100%)",
                    }}
                  />

                  {/* Subtle Portrait Footer Nameplate */}
                  <div className="pointer-events-none absolute inset-x-3.5 bottom-3 z-30 flex items-center justify-between gap-2 border-t border-[#C9A227]/25 pt-2">
                    <span className="font-mono text-[10.5px] font-bold uppercase tracking-wider text-[#C9A227] truncate">
                      Arush Sharma
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-zinc-300 shrink-0">
                      Founder &amp; Architect
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Founder Bio & Legal-Tech / Cyber / Privacy Credentials (7 cols) */}
            <div className="md:col-span-7 min-w-0 space-y-5">
              <div className="border-b border-[#262932] pb-4 space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5]">
                    Arush Sharma
                  </h2>
                  <a
                    href={LEGAL.founderLinkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A227]/45 bg-[#0D0E11] px-3 py-1.5 font-mono text-[11px] font-semibold text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors whitespace-nowrap"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>Founder LinkedIn</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="font-mono text-xs text-[#C9A227] leading-relaxed">
                  Founder &amp; Principal Legal-Tech Architect, ASJi Web and Legal Solution ·
                  International Data Compliance Architect
                </p>
              </div>

              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
                Arush Sharma founded{" "}
                <strong className="text-[#FAF8F5]">ASJi Web and Legal Solution</strong> in Jaipur,
                India, to bridge statutory data protection law and production web engineering.
                Specializing in global privacy architectures, cyber law, and automated compliance
                systems, he leads the engineering of ASJi One—enabling enterprises, digital
                platforms, and political campaigns to audit telemetry, neutralize regulatory
                exposure, and deploy statute-locked compliance infrastructure across 15 sovereign
                jurisdictions.
              </p>

              {/* Strict Legal-Tech, Cyber & Privacy Credentials Only */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-wider text-[#C9A227]">
                  <Award className="h-3.5 w-3.5" />
                  <span>Legal-Tech, Cyber Law &amp; Data Privacy Credentials</span>
                </div>
                <ul className="space-y-2 font-mono text-xs">
                  {FOUNDER_CREDENTIALS.map((credential) => (
                    <li
                      key={credential}
                      className="flex items-start gap-2.5 rounded-lg border border-[#262932] bg-[#0D0E11] px-3 py-2 text-zinc-200"
                    >
                      <ShieldCheck className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
                      <span className="leading-snug">{credential}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </SpecularCard>

        {/* Direct Executive Desk & Verified Channels (4 cols on lg) */}
        <SpecularCard className="lg:col-span-4 rounded-2xl border border-[#262932] bg-[#15171C] p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-[#262932] pb-4">
              <Scale className="h-5 w-5 text-[#C9A227]" />
              <h2 className="font-display text-xl font-bold text-[#FAF8F5]">
                Executive Desk &amp; Direct Contact
              </h2>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed">
              For enterprise privacy retainers, multi-jurisdiction compliance engineering, or
              PoliTech election audits, reach our legal-tech desk directly:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <a
                href={`mailto:${LEGAL.contactEmail}`}
                className="flex items-center gap-3 rounded-lg border border-[#262932] bg-[#0D0E11] p-3.5 text-[#FAF8F5] hover:border-[#C9A227]/50 transition-colors"
              >
                <Mail className="h-4 w-4 text-[#C9A227] shrink-0" />
                <div className="min-w-0">
                  <span className="text-muted-foreground block text-[10px]">
                    Official Compliance Email
                  </span>
                  <span className="font-bold text-xs sm:text-sm truncate block">
                    {LEGAL.contactEmail}
                  </span>
                </div>
              </a>

              <a
                href="tel:+918290841179"
                className="flex items-center gap-3 rounded-lg border border-[#262932] bg-[#0D0E11] p-3.5 text-[#FAF8F5] hover:border-[#C9A227]/50 transition-colors tabular-nums"
              >
                <Phone className="h-4 w-4 text-[#C9A227] shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Executive Helpline 01
                  </span>
                  <span className="font-bold text-sm">+91 8290841179</span>
                </div>
              </a>

              <a
                href="tel:+919461584298"
                className="flex items-center gap-3 rounded-lg border border-[#262932] bg-[#0D0E11] p-3.5 text-[#FAF8F5] hover:border-[#C9A227]/50 transition-colors tabular-nums"
              >
                <Phone className="h-4 w-4 text-[#C9A227] shrink-0" />
                <div>
                  <span className="text-muted-foreground block text-[10px]">
                    Executive Helpline 02
                  </span>
                  <span className="font-bold text-sm">+91 9461584298</span>
                </div>
              </a>

              <a
                href={LEGAL.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-lg border border-[#262932] bg-[#0D0E11] p-3.5 text-[#FAF8F5] hover:border-[#C9A227]/50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Linkedin className="h-4 w-4 text-[#C9A227] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-muted-foreground block text-[10px]">
                      Firm LinkedIn Page
                    </span>
                    <span className="font-bold text-xs truncate block">
                      ASJi Web and Legal Solution
                    </span>
                  </div>
                </div>
                <ExternalLink className="h-3.5 w-3.5 text-[#C9A227] shrink-0" />
              </a>
            </div>
          </div>

          <div className="pt-4 border-t border-[#262932] flex items-center justify-between gap-2 font-mono text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-[#C9A227]" />
              www.asji.online
            </span>
            <a
              href={LEGAL.website.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9A227] hover:underline inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Visit Portal</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </SpecularCard>
      </div>

      {/* Company Profile — Core Legal-Tech & Privacy Pillars */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#262932] pb-4">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#C9A227]">
              Firm Architecture · ASJi Web and Legal Solution
            </span>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#FAF8F5] mt-1">
              Four Pillars of Sovereign Legal-Tech Infrastructure
            </h2>
          </div>
          <span className="font-mono text-xs text-zinc-400">
            Jaipur, India · 15 Jurisdictions Indexed
          </span>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {FIRM_CORE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <SpecularCard
                key={pillar.number}
                className="rounded-xl border border-[#262932] bg-[#15171C] p-6 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#C9A227]/35 bg-[#0D0E11] text-[#C9A227]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-[#C9A227]">
                      {pillar.number}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#FAF8F5] leading-snug">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                    {pillar.detail}
                  </p>
                </div>
              </SpecularCard>
            );
          })}
        </div>
      </section>
    </div>
  );
}
