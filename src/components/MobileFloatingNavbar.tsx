import { Globe, ShieldCheck, Scale, Award, Terminal } from "lucide-react";
import { motion } from "motion/react";

export function MobileFloatingNavbar() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.href = `/#${id}`;
    }
  };

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="fixed bottom-3 left-3 right-3 z-50 flex md:hidden items-center justify-around rounded-full border border-[#D4AF37]/35 px-3 py-2 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      style={{
        background: "rgba(10, 8, 7, 0.40)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
      }}
    >
      <button
        type="button"
        onClick={() => scrollToSection("scan")}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all active:scale-95 cursor-pointer"
        title="Scanner"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/40 text-primary shadow-sm backdrop-blur-md">
          <Globe className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground">
          Scan
        </span>
      </button>

      <button
        type="button"
        onClick={() => scrollToSection("capabilities")}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all active:scale-95 cursor-pointer"
        title="Capabilities"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/15 text-foreground backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground">
          Shield
        </span>
      </button>

      <button
        type="button"
        onClick={() => {
          const reportEl =
            document.getElementById("asji-letterhead-report-paper") ||
            document.getElementById("scan");
          reportEl?.scrollIntoView({ behavior: "smooth" });
        }}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all active:scale-95 cursor-pointer"
        title="Results & Report"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4AF37]/25 border border-[#D4AF37]/60 text-[#E5C158] shadow-md shadow-[#D4AF37]/40 animate-pulse backdrop-blur-md">
          <Award className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-mono font-extrabold uppercase tracking-wider text-[#E5C158]">
          Results
        </span>
      </button>

      <button
        type="button"
        onClick={() =>
          scrollToSection("laws-atlas") || window.scrollTo({ top: 600, behavior: "smooth" })
        }
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all active:scale-95 cursor-pointer"
        title="Sovereign Laws"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/15 text-foreground backdrop-blur-md">
          <Scale className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground">
          Laws
        </span>
      </button>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all active:scale-95 cursor-pointer"
        title="Top"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 border border-primary/30 text-primary backdrop-blur-md">
          <Terminal className="h-4 w-4" />
        </div>
        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-foreground">
          Top
        </span>
      </button>
    </motion.div>
  );
}
