import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { ASJiVectorLogo } from "./ASJiVectorLogo";
import { LEGAL } from "@/lib/legal";
import { Footer } from "@/components/Footer";

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="legal-paper rounded-md border border-[#E5DEC9] bg-[#FAF8F5] p-6 sm:p-8 text-[#18181B]">
      <h2 className="font-display text-xl sm:text-2xl font-bold text-[#18181B]">{title}</h2>
      <div className="my-4 h-px bg-[#E5DEC9]" />
      <div className="space-y-3 text-sm leading-relaxed text-[#52525B] [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-[#18181B]">
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
    <div className="min-h-screen bg-[#0D0E11] text-[#F4F4F5]">
      <header className="mobile-floating-header mx-auto flex max-w-4xl items-center justify-between px-5 py-6 border-b border-[#262932]">
        <Link
          to="/"
          className="group flex items-center gap-3.5 transition-opacity hover:opacity-90"
        >
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[#C9A227]/50 bg-[#0D0E11] p-0.5">
            <ASJiVectorLogo className="h-full w-full" idSuffix="legal_page" />
          </div>
          <div className="leading-tight">
            <p className="font-display text-2xl tracking-tight text-[#F4F4F5] font-bold">
              ASJi One
            </p>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#C9A227] font-mono font-medium">
              Statutory Counsel
            </p>
          </div>
        </Link>
        <Link
          to="/"
          className="rounded-md border border-[#262932] bg-[#15171C] px-4 py-2 text-[11px] font-mono uppercase tracking-[0.16em] text-[#C9A227] transition-colors hover:border-[#C9A227]"
        >
          Back to Scanner
        </Link>
      </header>

      <main className="mobile-header-spacing mx-auto max-w-4xl px-5 pt-10 pb-20">
        <h1 className="font-display text-3xl font-bold text-[#F4F4F5] sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#A1A1AA]">{intro}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#71717A]">
          Last updated {LEGAL.lastUpdated} · Maintained by {LEGAL.operator}
        </p>

        <div className="mt-8 space-y-5">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
