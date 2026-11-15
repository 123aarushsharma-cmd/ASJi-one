import React from "react";
import { motion } from "motion/react";
import { Shield, Globe, Scale, CreditCard, Building2, Lock } from "lucide-react";
import { ASJiBrandLockup } from "./ASJiBrandLockup";

interface TopNavbarProps {
  activeTab: "scanner" | "atlas" | "politech" | "pricing" | "about";
  setActiveTab: (tab: "scanner" | "atlas" | "politech" | "pricing" | "about") => void;
  onOpenUnlockModal: () => void;
}

const NAV_ITEMS = [
  { id: "scanner", label: "Scan", icon: Shield },
  { id: "atlas", label: "Atlas", icon: Globe },
  { id: "politech", label: "PoliTech", icon: Scale },
  { id: "pricing", label: "Pricing", icon: CreditCard },
  { id: "about", label: "About", icon: Building2 },
] as const;

export function TopNavbar({ activeTab, setActiveTab, onOpenUnlockModal }: TopNavbarProps) {
  const handleNavClick = (id: "scanner" | "atlas" | "politech" | "pricing" | "about") => {
    setActiveTab(id);
    if (typeof window !== "undefined") {
      window.location.hash = `#${id}`;
      window.dispatchEvent(new CustomEvent("asji:tab-change", { detail: id }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#C9A227]/25 bg-[#0D0E11]/88 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex h-16 items-center justify-between gap-3 lg:gap-8 flex-nowrap">
        {/* Zone 1: Brand Logo & Two-Line Executive Lockup (Left on All Viewports) */}
        <motion.button
          type="button"
          onClick={() => handleNavClick("scanner")}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center cursor-pointer group shrink-0 text-left whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227] rounded-lg"
          aria-label="ASJi One — Trust Intelligence Home"
        >
          <ASJiBrandLockup size="navbar" idSuffix="navbar_logo" />
        </motion.button>

        {/* Zone 2: Desktop Navigation Links (1024px+ / lg+ Only) */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2 min-w-0 flex-nowrap"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id)}
                whileTap={{ scale: 0.96 }}
                transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                className={`relative flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-mono font-medium transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227] ${
                  isActive ? "text-[#FAF8F5]" : "text-muted-foreground hover:text-[#FAF8F5]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="topNavActivePill"
                    transition={{
                      type: "spring",
                      stiffness: 420,
                      damping: 32,
                      mass: 0.7,
                    }}
                    className="absolute inset-0 rounded-lg border border-[#C9A227]/55 bg-[#C9A227]/15 shadow-[0_0_16px_-4px_rgba(201,162,39,0.28)]"
                  />
                )}
                <Icon
                  className={`relative z-10 h-3.5 w-3.5 shrink-0 transition-colors duration-200 ${
                    isActive ? "text-[#C9A227]" : "text-muted-foreground"
                  }`}
                />
                <span className="relative z-10">{item.label}</span>
              </motion.button>
            );
          })}
        </nav>

        {/* Zone 3: Payment Unlock CTA Button (Always visible on Right across Mobile, Tablet & Desktop) */}
        <div className="flex items-center shrink-0">
          <motion.button
            type="button"
            onClick={onOpenUnlockModal}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="btn-gold rounded-lg px-3.5 sm:px-4 py-2 text-[11px] font-mono font-semibold cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_6px_20px_-6px_rgba(201,162,39,0.5)]"
            aria-label="Unlock Remediation & Compliance Suite"
          >
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span>Unlock</span>
          </motion.button>
        </div>
      </div>
    </header>
  );
}
