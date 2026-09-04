import { Link } from "@tanstack/react-router";
import { Mail, Phone, Instagram, Linkedin, ExternalLink, Globe, Sparkles } from "lucide-react";
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

          {/* Direct Social & Web Connect Block */}
          <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Official Portal &amp; Socials
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Main asji.online Direct Portal Link in Gold Light */}
              <a
                href={LEGAL.website.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 rounded-xl border border-primary/60 bg-gradient-to-r from-amber-500/20 via-primary/30 to-amber-500/10 px-3.5 py-2 text-xs font-bold text-primary shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all hover:border-primary hover:bg-primary/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:scale-[1.02]"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/50 bg-black/80 text-primary">
                  <Globe className="h-3.5 w-3.5 text-primary animate-pulse" />
                </div>
                <span className="text-gold-gradient font-black tracking-wide">asji.online</span>
                <ExternalLink className="h-3 w-3 text-primary opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>

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
                <span>LinkedIn</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>
        </div>

        {/* Featured Direct Gold Light Link Badge */}
        <div className="mb-6 flex justify-center">
          <a
            href={LEGAL.website.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full border border-primary/50 bg-gradient-to-r from-amber-950/40 via-primary/20 to-amber-950/40 px-5 py-2 text-xs font-bold text-foreground shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all hover:border-primary hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] hover:scale-105"
          >
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Visit ASJi Official Legal Portal:</span>
            <span className="text-gold-gradient font-black underline decoration-primary/60 underline-offset-4 group-hover:decoration-primary">
              www.asji.online
            </span>
            <ExternalLink className="h-3.5 w-3.5 text-primary transition-transform group-hover:translate-x-0.5" />
          </a>
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
