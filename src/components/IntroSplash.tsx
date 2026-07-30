import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShieldCheck } from "lucide-react";

export function IntroSplash({ onComplete }: { onComplete?: () => void }) {
  const [isVisible, setIsVisible] = useState(true);

  const handleFinish = useCallback(() => {
    setIsVisible(false);
    if (onComplete) onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFinish();
    }, 700);
    return () => clearTimeout(timer);
  }, [handleFinish]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="intro-splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0B0F19] text-foreground select-none overflow-hidden"
        >
          {/* Subtle background ambient radial light */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(212,175,55,0.12),transparent_60%)] pointer-events-none" />

          {/* Animated Logo Container */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex flex-col items-center"
          >
            {/* Pulsing ring around logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: [0.4, 0.8, 0.5], scale: [0.95, 1.1, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/30 via-yellow-500/20 to-primary/30 blur-md"
            />

            {/* Logo frame */}
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl border-2 border-primary/40 bg-black/90 p-2 shadow-2xl shadow-primary/20">
              <img
                src="/asji-logo.svg"
                alt="ASJi One Logo"
                className="h-full w-full object-contain"
              />
            </div>

            {/* Brand Title */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="mt-5 text-center"
            >
              <h1 className="font-display text-3xl font-bold tracking-tight text-gold-gradient">
                ASJi One
              </h1>
              <div className="mt-1 flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary inline" />
                <span>Trust Intelligence</span>
              </div>
            </motion.div>

            {/* Subtle progress indicator line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "120px" }}
              transition={{ delay: 0.15, duration: 0.5, ease: "easeInOut" }}
              className="mt-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-80"
            />
          </motion.div>

          <button
            type="button"
            onClick={handleFinish}
            className="absolute bottom-6 text-[11px] text-muted-foreground/60 transition-colors hover:text-muted-foreground cursor-pointer"
          >
            Skip Intro →
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
