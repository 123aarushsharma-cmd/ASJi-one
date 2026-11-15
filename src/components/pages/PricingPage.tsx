import React from "react";
import { Check, Lock, ArrowRight, Zap } from "lucide-react";
import { SpecularCard } from "@/components/SpecularCard";

interface PricingPageProps {
  onOpenUnlockModal: (tier?: string) => void;
  setActiveTab: (tab: "scanner" | "atlas" | "politech" | "pricing" | "about") => void;
}

export function PricingPage({ onOpenUnlockModal, setActiveTab }: PricingPageProps) {
  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 rounded border border-[#C9A227]/40 bg-[#C9A227]/10 px-3 py-1 text-xs font-mono font-bold text-[#C9A227]">
          <Zap className="h-4 w-4" /> EXECUTIVE PRICING &amp; ENTERPRISE RETAINERS
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF8F5]">
          Transparent Statutory Licensing &amp; Engineering Remediation
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground font-sans leading-relaxed">
          Diagnostic inspections run completely free with transparent risk findings. License
          production server hardening patches, zero-cookie blockers, and bespoke statutory packs by
          ASJi Web and Legal Solution, Jaipur.
        </p>
      </div>

      {/* Responsive Pricing Grid: 1-col mobile, 2-col tablet, 3-col desktop */}
      <div className="grid gap-6 lg:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Tier 1: Free Diagnostic */}
        <SpecularCard className="rounded-2xl border border-[#262932] bg-[#15171C] p-8 flex flex-col justify-between hover:border-[#C9A227]/50 shadow-xl">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs text-muted-foreground">TIER 01</span>
              <h3 className="font-display text-2xl font-bold text-[#FAF8F5] mt-1">
                Free Diagnostic Scan
              </h3>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                For developers and engineering leads auditing public web domains instantly.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-[#FAF8F5]">₹0</span>
              <span className="font-mono text-xs text-muted-foreground">/ unlimited scans</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#262932] font-mono text-xs text-muted-foreground">
              <div className="flex items-center gap-2.5 text-[#FAF8F5]">
                <Check className="h-4 w-4 text-[#10B981]" /> Live HTTP Header &amp; DNS Forensics
              </div>
              <div className="flex items-center gap-2.5 text-[#FAF8F5]">
                <Check className="h-4 w-4 text-[#10B981]" /> Third-Party Tracker Detection
                (GA4/Meta)
              </div>
              <div className="flex items-center gap-2.5 text-[#FAF8F5]">
                <Check className="h-4 w-4 text-[#10B981]" /> Statutory Fine Exposure Calculator
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground/60">
                <Check className="h-4 w-4 text-muted-foreground/40" /> Complete Code Fixes (Locked)
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground/60">
                <Check className="h-4 w-4 text-muted-foreground/40" /> Unredacted Legal Briefs
                (Locked)
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#262932]">
            <button
              type="button"
              onClick={() => setActiveTab("scanner")}
              className="w-full rounded-lg border border-[#262932] bg-[#0D0E11] py-3 text-xs font-mono font-bold uppercase tracking-wider text-[#FAF8F5] hover:border-[#C9A227]/50 transition-colors cursor-pointer"
            >
              Run Free Scan Now
            </button>
          </div>
        </SpecularCard>

        {/* Tier 2: Single-Domain Remediation Unlock (Featured) */}
        <SpecularCard className="rounded-2xl border-2 border-[#C9A227] bg-[#15171C] p-8 flex flex-col justify-between relative shadow-2xl">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#C9A227] px-4 py-1 text-[10px] font-mono font-bold text-[#0D0E11] uppercase tracking-wider shadow-lg">
            Most Popular · One-Time Unlock
          </div>

          <div className="space-y-6 pt-2">
            <div>
              <span className="font-mono text-xs text-[#C9A227]">TIER 02</span>
              <h3 className="font-display text-2xl font-bold text-[#FAF8F5] mt-1">
                Single-Domain Suite
              </h3>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                Full production code patches, zero-cookie consent blocker, and tailored legal pack.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-[#FAF8F5]">₹37,500</span>
              <span className="font-mono text-xs text-muted-foreground">/ single domain</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#262932] font-mono text-xs text-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> All Server Security Patches
                (Nginx/Cloudflare)
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Zero-Cookie Consent Blocker Script
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Tailored Statutory Privacy Notice Draft
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Designated Grievance Officer Charter
                (48h SLA)
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Official Compliance Certificate &amp;
                PDF Export
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#262932]">
            <button
              type="button"
              onClick={() => onOpenUnlockModal("dpdp-india")}
              className="btn-gold w-full rounded-lg py-3 text-xs font-mono font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2 shadow-2xl"
            >
              <Lock className="h-4 w-4" />
              <span>Unlock Full Remediation (₹37,500)</span>
            </button>
          </div>
        </SpecularCard>

        {/* Tier 3: Enterprise / Campaign Retainer */}
        <SpecularCard className="rounded-2xl border border-[#262932] bg-[#15171C] p-8 flex flex-col justify-between hover:border-[#C9A227]/50 shadow-xl md:col-span-2 lg:col-span-1">
          <div className="space-y-6">
            <div>
              <span className="font-mono text-xs text-muted-foreground">TIER 03</span>
              <h3 className="font-display text-2xl font-bold text-[#FAF8F5] mt-1">
                Enterprise &amp; Campaign Retainer
              </h3>
              <p className="text-xs text-muted-foreground mt-2 font-sans">
                For multinational corporations and political campaign committees needing all 15
                laws.
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="font-display text-4xl font-bold text-[#FAF8F5]">₹59,999</span>
              <span className="font-mono text-xs text-muted-foreground">/ full bundle</span>
            </div>

            <div className="space-y-3 pt-4 border-t border-[#262932] font-mono text-xs text-[#FAF8F5]">
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Access to All 15 Sovereign Legal
                Frameworks
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> PoliTech Election Compliance &amp; Ad
                Forensics
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Dedicated DPO &amp; Legal Engineering
                Support
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> 100% Tax Deductible Corporate Legal
                Expense
              </div>
              <div className="flex items-center gap-2.5">
                <Check className="h-4 w-4 text-[#10B981]" /> Priority Direct UPI / Bank Transfer
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#262932]">
            <button
              type="button"
              onClick={() => onOpenUnlockModal("full-bundle")}
              className="rounded-lg border border-[#C9A227]/50 bg-[#0D0E11] py-3 text-xs font-mono font-bold uppercase tracking-wider text-[#C9A227] hover:bg-[#C9A227]/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Unlock Enterprise Bundle</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </SpecularCard>
      </div>
    </div>
  );
}
