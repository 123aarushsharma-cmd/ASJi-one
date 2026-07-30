import { Link } from "@tanstack/react-router";
import { Mail, Phone, Instagram, Linkedin, ExternalLink } from "lucide-react";
import { LEGAL, LEGAL_PAGES } from "@/lib/legal";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border/60 bg-black/40 pt-12 pb-10 text-center text-xs text-muted-foreground">
      <div className="mx-auto max-w-5xl px-5">
        {/* Contact & Social Direct Connect Grid */}
        <div className="mb-10 grid gap-6 rounded-2xl border border-primary/20 bg-secondary/30 p-6 sm:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Email Block */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Official Email
              </p>
              <a
                href={`mailto:${LEGAL.contactEmail}`}
                className="mt-0.5 inline-flex items-center gap-1.5 font-sans text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                {LEGAL.contactEmail}
              </a>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Inquiries, compliance reviews &amp; legal support
              </p>
            </div>
          </div>

          {/* Contact Numbers Block */}
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Direct Phone / WhatsApp
              </p>
              <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 font-sans text-sm font-semibold text-foreground">
                {LEGAL.phoneNumbers.map((phone, idx) => (
                  <a
                    key={idx}
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="transition-colors hover:text-primary"
                  >
                    {phone}
                  </a>
                ))}
              </div>
              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Mon - Sat · 9:00 AM - 7:00 PM IST
              </p>
            </div>
          </div>

          {/* Direct Social Connect Block */}
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Direct Connect Socials
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Instagram Button */}
              <a
                href={LEGAL.instagram.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/20 hover:shadow-sm"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/40 bg-black/60 p-0.5 text-primary">
                  <Instagram className="h-3.5 w-3.5 text-primary" />
                </div>
                <span>{LEGAL.instagram.handle}</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>

              {/* LinkedIn Button */}
              <a
                href={LEGAL.linkedin.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary/60 hover:bg-primary/20 hover:shadow-sm"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/40 bg-black/60 p-0.5 text-amber-400">
                  <Linkedin className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                </div>
                <span>LinkedIn Profile</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Legal Pages Navigation */}
        <nav className="mx-auto flex max-w-3xl flex-wrap justify-center gap-x-6 gap-y-2">
          {LEGAL_PAGES.map((p) => (
            <Link key={p.to} to={p.to} className="transition-colors hover:text-primary">
              {p.label}
            </Link>
          ))}
        </nav>

        {/* Legal Disclaimer */}
        <p className="mx-auto mt-5 max-w-2xl px-5 text-[11px] leading-relaxed text-muted-foreground/80">
          ASJi One reports provide automated technical compliance assessments of publicly observable
          web signals under GDPR &amp; India DPDP Act 2023 standards. Privacy inquiries:{" "}
          <a href={`mailto:${LEGAL.contactEmail}`} className="underline hover:text-primary">
            {LEGAL.contactEmail}
          </a>
        </p>

        {/* Copyright */}
        <p className="mt-4 text-xs font-medium text-muted-foreground">
          © {new Date().getFullYear()} {LEGAL.legalEntity} · {LEGAL.operator} Trust Intelligence
        </p>
      </div>
    </footer>
  );
}
