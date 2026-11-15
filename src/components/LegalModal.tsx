import React from "react";
import { X, Scale, ShieldCheck } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
}

export function LegalModal({ isOpen, onClose, title, content }: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 sm:p-6">
      <div className="relative w-full max-w-2xl md:max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden rounded-xl border border-[#E5DEC9] bg-[#FAF8F5] text-[#18181B] p-5 sm:p-8 shadow-2xl">
        <div className="flex items-start sm:items-center justify-between gap-3 border-b border-[#E5DEC9] pb-4 mb-6">
          <div className="flex items-center gap-2.5 min-w-0">
            <Scale className="h-6 w-6 text-[#9A7812] shrink-0" />
            <div className="min-w-0">
              <h3 className="font-display text-lg sm:text-xl font-bold text-[#18181B] break-words">
                {title}
              </h3>
              <span className="font-mono text-xs text-[#52525B] block">
                ASJi Web and Legal Solution · Official Statutory Instrument
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#E5DEC9] bg-white p-2 text-[#18181B] hover:bg-zinc-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="font-mono text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words text-[#18181B] space-y-4 overflow-x-auto">
          {content}
        </div>

        <div className="mt-8 pt-6 border-t border-[#E5DEC9] flex items-center justify-between font-mono text-xs text-[#52525B]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#10B981]" /> Verified Legal Instrument
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md bg-[#18181B] px-4 py-2 text-[#FAF8F5] font-bold hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Close Reader
          </button>
        </div>
      </div>
    </div>
  );
}
