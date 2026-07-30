import React, { useState } from "react";
import {
  Linkedin,
  Check,
  Sparkles,
  ExternalLink,
  Copy,
  X,
  Share2,
  FileText,
  Printer,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit.functions";
import { ASJiLetterheadReport } from "@/components/ASJiLetterheadReport";

interface LinkedInShareButtonProps {
  domain: string;
  score: number;
  reportId?: string;
  report?: AuditReport | null;
  className?: string;
  variant?: "default" | "compact";
}

export function LinkedInShareButton({
  domain,
  score,
  reportId,
  report,
  className = "",
}: LinkedInShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const cleanDomain = domain
    ? domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
    : "our-website.com";
  const shareAppUrl = "https://asji-one.vercel.app";

  // Formatted domain-specific LinkedIn post text
  const postText = `We just ran an automated privacy & data compliance audit for ${cleanDomain} using ASJi Web & Legal Solution!

🎯 Target Domain: ${cleanDomain}
📊 Compliance Score: ${score}/100
🛡️ Statutory Frameworks Audited: India's DPDP Act 2023, UAE PDPL, and EU GDPR

Check your own website's liability exposure & generate an official legal summary report instantly at ${shareAppUrl} #DataPrivacy #LegalTech #DPDP2023 #ASJiOne #PrivacyCompliance`;

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopy(text);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      fallbackCopy(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const fallbackCopy = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
    } catch {
      // ignore
    }
    document.body.removeChild(textArea);
  };

  const openLinkedInFeed = () => {
    const feedUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(postText)}`;
    const popupWidth = 600;
    const popupHeight = 650;
    const left = window.screen.width / 2 - popupWidth / 2;
    const top = window.screen.height / 2 - popupHeight / 2;

    try {
      const popup = window.open(
        feedUrl,
        "LinkedInShare",
        `width=${popupWidth},height=${popupHeight},top=${top},left=${left},scrollbars=yes,resizable=yes`,
      );
      if (!popup || popup.closed || typeof popup.closed === "undefined") {
        window.open(feedUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.open(feedUrl, "_blank", "noopener,noreferrer");
    }
  };

  const openLinkedInOffsite = () => {
    const offsiteUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      reportId ? `${shareAppUrl}/report/${reportId}` : shareAppUrl,
    )}`;
    window.open(offsiteUrl, "_blank", "noopener,noreferrer");
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    copyToClipboard(postText);
    openLinkedInFeed();
    setIsModalOpen(true);
  };

  return (
    <>
      <div className={`flex flex-wrap items-center gap-2 ${className}`}>
        {/* PDF Download / Print Action Box */}
        <button
          onClick={() => setIsPdfModalOpen(true)}
          type="button"
          title={`Download or Print Official PDF Report for ${cleanDomain}`}
          className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition-all hover:border-emerald-400 hover:bg-emerald-900/40 hover:text-emerald-200 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] active:scale-95"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-emerald-500/40 bg-black/60 text-emerald-400">
            <FileText className="h-3.5 w-3.5" />
          </div>
          <span>Download PDF Report</span>
          <Printer className="h-3 w-3 opacity-70" />
        </button>

        {/* Share on LinkedIn Action Box */}
        <button
          onClick={handleShareClick}
          type="button"
          title="Share score on LinkedIn"
          className="inline-flex items-center gap-2 rounded-xl border border-primary/40 bg-gradient-to-r from-amber-500/15 via-primary/20 to-amber-600/15 px-3.5 py-2 text-xs font-semibold text-foreground transition-all hover:border-primary hover:bg-primary/25 hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] active:scale-95"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded-md border border-primary/40 bg-black/60 text-amber-400">
            <Linkedin className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          </div>

          <span>{copied ? "Copied & Opening!" : "Share on LinkedIn"}</span>

          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400 animate-in zoom-in" />
          ) : (
            <ExternalLink className="h-3 w-3 opacity-60" />
          )}
        </button>
      </div>

      {/* Bulletproof Interactive Sharing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-primary/50 bg-[#0d0c0b] p-6 text-foreground shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 rounded-lg border border-border bg-black/50 p-1.5 text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-primary/20 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/40 bg-primary/10 text-amber-400">
                <Linkedin className="h-5 w-5 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-gold-gradient">
                  LinkedIn Share &amp; PDF Report Ready
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Target Domain:{" "}
                  <span className="font-semibold text-foreground">{cleanDomain}</span> (Score:{" "}
                  {score}/100)
                </p>
              </div>
            </div>

            {/* Status Alert Banner */}
            <div className="my-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">How to post on LinkedIn:</p>
                  <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-[11px] text-amber-200/90">
                    <li>Sign in to LinkedIn if prompted.</li>
                    <li>
                      Press{" "}
                      <kbd className="rounded bg-black/60 px-1.5 py-0.5 font-sans font-semibold text-white">
                        Ctrl + V
                      </kbd>{" "}
                      (or{" "}
                      <kbd className="rounded bg-black/60 px-1.5 py-0.5 font-sans font-semibold text-white">
                        ⌘ + V
                      </kbd>
                      ) inside the post box to paste your copied text.
                    </li>
                    <li>
                      Save or attach your official PDF summary report certificate for {cleanDomain}.
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Formatted Text Box */}
            <div className="mb-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-sans font-medium text-muted-foreground">
                  Post Text Summary for {cleanDomain}
                </span>
                <button
                  onClick={() => copyToClipboard(postText)}
                  className="flex items-center gap-1 font-bold text-primary hover:underline"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? "Copied!" : "Re-copy Text"}</span>
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto rounded-xl border border-border bg-black/60 p-3 font-sans text-xs leading-relaxed text-muted-foreground select-all">
                {postText}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-500/20 via-emerald-600/25 to-emerald-500/20 py-2.5 text-xs font-bold text-emerald-300 transition-all hover:bg-emerald-500 hover:text-black shadow-lg"
              >
                <FileText className="h-4 w-4" />
                <span>View / Save PDF Summary Report ({cleanDomain})</span>
              </button>

              <button
                onClick={() => {
                  copyToClipboard(postText);
                  openLinkedInFeed();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/60 bg-gradient-to-r from-amber-500/20 via-primary/30 to-amber-600/20 py-2.5 text-xs font-bold text-foreground transition-all hover:bg-primary hover:text-black shadow-lg"
              >
                <Share2 className="h-4 w-4" />
                <span>Open LinkedIn Post Window Again</span>
              </button>

              <button
                onClick={openLinkedInOffsite}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-secondary/40 py-2 text-xs font-semibold text-muted-foreground transition-all hover:bg-secondary hover:text-foreground"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Alternative: Share Direct URL Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable PDF Summary Report Certificate Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 sm:p-6 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative mx-auto max-w-4xl pt-2 pb-12">
            <div className="mb-4 flex items-center justify-between rounded-xl border border-primary/40 bg-black/80 px-4 py-3 text-white shadow-xl">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-display text-xs font-bold text-gold-gradient">
                  Official Audit Certificate &amp; PDF Report Generator ({cleanDomain})
                </span>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-black/60 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-secondary hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Close Preview</span>
              </button>
            </div>

            <ASJiLetterheadReport report={report} domain={cleanDomain} score={score} />
          </div>
        </div>
      )}
    </>
  );
}
