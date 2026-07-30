import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { LEGAL, LEGAL_PAGES } from "@/lib/legal";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="surface-panel p-6">
      <h2 className="font-display text-xl text-gold-gradient">{title}</h2>
      <div className="gold-rule my-4" />
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}

export function LegalPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-5 py-6">
        <Link
          to="/"
          className="group flex items-center gap-3.5 transition-opacity hover:opacity-90"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-primary/30 bg-black/80 shadow-md transition-transform group-hover:scale-105">
            <img
              src="/asji-logo.svg"
              alt="ASJi One Logo"
              className="h-full w-full object-contain p-0.5"
            />
          </div>
          <div className="leading-tight">
            <p className="font-display text-2xl tracking-tight text-gold-gradient font-bold">
              ASJi One
            </p>
            <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium">
              Trust Intelligence
            </p>
          </div>
        </Link>
        <Link
          to="/"
          className="rounded-xl border border-primary/40 px-4 py-2 text-[11px] uppercase tracking-[0.2em] text-primary transition-colors hover:bg-primary/10"
        >
          Back to scanner
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-5 pb-20">
        <h1 className="font-display text-3xl text-gold-gradient sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Last updated {LEGAL.lastUpdated} · Maintained by {LEGAL.operator}
        </p>

        <div className="mt-8 space-y-4">{children}</div>

        <nav className="mt-10 flex flex-wrap gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          {LEGAL_PAGES.map((p) => (
            <Link key={p.to} to={p.to} className="transition-colors hover:text-primary">
              {p.label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
