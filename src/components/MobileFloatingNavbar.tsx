import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Radar, Globe, Landmark, Crown, UserCheck } from "lucide-react";

type TabId = "scanner" | "atlas" | "politech" | "pricing" | "about";

const DOCK_TABS: readonly {
  id: TabId;
  label: string;
  icon: typeof Radar;
}[] = [
  { id: "scanner", label: "Scan", icon: Radar },
  { id: "atlas", label: "Atlas", icon: Globe },
  { id: "politech", label: "PoliTech", icon: Landmark },
  { id: "pricing", label: "Pricing", icon: Crown },
  { id: "about", label: "Founder", icon: UserCheck },
];

export function MobileFloatingNavbar() {
  const [activeTab, setActiveTab] = useState<TabId>("scanner");

  useEffect(() => {
    const syncFromHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace("#", "") as TabId;
      if (["scanner", "atlas", "politech", "pricing", "about"].includes(hash)) {
        setActiveTab(hash);
      }
    };

    const handleCustomTabEvent = (e: Event) => {
      const custom = e as CustomEvent<TabId>;
      if (
        custom.detail &&
        ["scanner", "atlas", "politech", "pricing", "about"].includes(custom.detail)
      ) {
        setActiveTab(custom.detail);
      }
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    window.addEventListener("asji:tab-change", handleCustomTabEvent);
    return () => {
      window.removeEventListener("hashchange", syncFromHash);
      window.removeEventListener("asji:tab-change", handleCustomTabEvent);
    };
  }, []);

  const handleSelectTab = (id: TabId) => {
    setActiveTab(id);
    if (typeof window === "undefined") return;

    if (window.location.pathname !== "/") {
      window.location.href = `/#${id}`;
      return;
    }

    window.location.hash = `#${id}`;
    window.dispatchEvent(new CustomEvent("asji:tab-change", { detail: id }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.nav
      aria-label="Mobile and tablet navigation dock"
      initial={false}
      style={{
        background:
          "linear-gradient(135deg, rgba(28, 31, 39, 0.65) 0%, rgba(13, 14, 17, 0.54) 100%)",
        backdropFilter: "blur(28px) saturate(190%)",
        WebkitBackdropFilter: "blur(28px) saturate(190%)",
        borderColor: "rgba(201, 162, 39, 0.38)",
        boxShadow:
          "inset 0 1px 0 0 rgba(255, 255, 255, 0.16), inset 0 -1px 0 0 rgba(201, 162, 39, 0.14), 0 18px 44px -8px rgba(0, 0, 0, 0.8), 0 0 28px -8px rgba(201, 162, 39, 0.22)",
      }}
      className="fixed bottom-4 left-3.5 right-3.5 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[calc(100%-3rem)] md:max-w-lg z-50 flex lg:hidden items-center justify-between gap-1 rounded-2xl border px-2 py-2 overflow-hidden will-change-transform"
    >
      {/* Top Glass Specular Rim Highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
      />
      {/* Subtle Internal Glass Reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] via-transparent to-[#C9A227]/[0.04]"
      />

      {DOCK_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <motion.button
            key={tab.id}
            type="button"
            onClick={() => handleSelectTab(tab.id)}
            aria-current={isActive ? "page" : undefined}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-1 flex-col items-center justify-center gap-1 rounded-xl py-1.5 px-1 cursor-pointer select-none active:scale-95 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#C9A227]"
          >
            {/* Sliding Frosted Glass Active Pill */}
            {isActive && (
              <motion.span
                layoutId="mobileDockActivePill"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  mass: 0.7,
                }}
                style={{
                  background:
                    "linear-gradient(180deg, rgba(201, 162, 39, 0.24) 0%, rgba(201, 162, 39, 0.08) 100%)",
                  boxShadow:
                    "inset 0 1px 0 0 rgba(255, 255, 255, 0.22), 0 4px 14px -4px rgba(201, 162, 39, 0.35)",
                }}
                className="absolute inset-0 rounded-xl border border-[#C9A227]/50"
              />
            )}

            <motion.span
              initial={false}
              animate={{
                y: isActive ? -1 : 0,
                scale: isActive ? 1.1 : 1,
              }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex items-center justify-center"
            >
              <Icon
                className={`h-4 w-4 transition-colors duration-200 ${
                  isActive ? "text-[#DFB842]" : "text-zinc-400"
                }`}
              />
            </motion.span>

            <span
              className={`relative z-10 text-[10px] font-mono font-semibold tracking-tight transition-colors duration-200 whitespace-nowrap ${
                isActive ? "text-[#FAF8F5]" : "text-zinc-400"
              }`}
            >
              {tab.label}
            </span>

            {/* Active Gold Indicator Dot */}
            {isActive && (
              <motion.span
                layoutId="mobileDockActiveDot"
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 32,
                  mass: 0.7,
                }}
                className="relative z-10 h-1.5 w-1.5 rounded-full bg-[#C9A227] shadow-[0_0_8px_rgba(201,162,39,0.85)]"
              />
            )}
          </motion.button>
        );
      })}
    </motion.nav>
  );
}
