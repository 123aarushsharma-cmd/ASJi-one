import React from "react";

interface TickerItem {
  id: string;
  tag: string;
  label: string;
  actionType: "framework" | "politech";
  targetId: string;
}

const STATUTORY_TICKER_ITEMS: readonly TickerItem[] = [
  {
    id: "in-dpdp",
    tag: "[IN]",
    label: "DPDP Act 2023 · ₹250 Cr Ceiling",
    actionType: "framework",
    targetId: "ind-dpdp",
  },
  {
    id: "eu-gdpr",
    tag: "[EU]",
    label: "GDPR 2026 · €20M Ceiling",
    actionType: "framework",
    targetId: "eu-gdpr",
  },
  {
    id: "uk-duaa",
    tag: "[UK]",
    label: "DUAA 2026 · £17.5M Ceiling",
    actionType: "framework",
    targetId: "uk-duaa",
  },
  {
    id: "us-cpra",
    tag: "[US]",
    label: "CPRA · $7,500 Per Violation",
    actionType: "framework",
    targetId: "us-cpra",
  },
  {
    id: "politech",
    tag: "[POLITECH]",
    label: "ECI & Campaign Ad Transparency",
    actionType: "politech",
    targetId: "politech",
  },
  {
    id: "ae-pdpl",
    tag: "[AE]",
    label: "UAE PDPL · Federal Decree 45",
    actionType: "framework",
    targetId: "uae-pdpl",
  },
  {
    id: "sg-pdpa",
    tag: "[SG]",
    label: "Singapore PDPA · 10% Turnover",
    actionType: "framework",
    targetId: "sg-pdpa",
  },
  {
    id: "br-lgpd",
    tag: "[BR]",
    label: "Brazil LGPD · R$ 50M Ceiling",
    actionType: "framework",
    targetId: "brazil-lgpd",
  },
];

interface StatutoryTickerProps {
  selectedFramework?: string;
  onSelectFramework: (frameworkId: string) => void;
  onOpenPoliTech: () => void;
}

export function StatutoryTicker({
  selectedFramework,
  onSelectFramework,
  onOpenPoliTech,
}: StatutoryTickerProps) {
  const handleItemClick = (item: TickerItem) => {
    if (item.actionType === "politech") {
      onOpenPoliTech();
    } else {
      onSelectFramework(item.targetId);
    }
  };

  return (
    <div
      aria-label="Live statutory coverage ticker"
      className="marquee-container relative w-full overflow-hidden rounded-xl border border-[#262932] bg-[#0D0E11]/90 py-2.5"
    >
      {/* Left & Right Matte Onyx Edge Fades */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 sm:w-16 bg-gradient-to-r from-[#0D0E11] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 sm:w-16 bg-gradient-to-l from-[#0D0E11] to-transparent"
      />

      <div className="marquee-track items-center gap-3 px-2">
        {[0, 1].map((loopIdx) => (
          <div key={loopIdx} className="flex items-center gap-3 shrink-0">
            {STATUTORY_TICKER_ITEMS.map((item) => {
              const isSelected =
                item.actionType === "framework" && selectedFramework === item.targetId;
              return (
                <button
                  key={`${loopIdx}-${item.id}`}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 font-mono text-[11px] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? "border-[#C9A227] bg-[#C9A227]/15 text-[#FAF8F5]"
                      : "border-[#262932] bg-[#15171C] text-zinc-300 hover:border-[#C9A227]/60 hover:text-[#FAF8F5]"
                  }`}
                >
                  <span className="font-bold text-[#C9A227]">{item.tag}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
