import React, { useState } from "react";
import {
  Linkedin,
  Check,
  ExternalLink,
  Copy,
  X,
  Share2,
  FileText,
  Printer,
  Info,
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

  // Formatted domain-specific LinkedIn post text (strict zero-emoji institutional copy)
  const postText = `We completed an automated privacy and data compliance audit for ${cleanDomain} using ASJi One Statutory Intelligence.

- Audited Domain: ${cleanDomain}
- Compliance Score: ${score}/100
- Frameworks Evaluated: India DPDP Act 2023, UAE PDPL, and EU GDPR

Assess your domain's statutory exposure and generate a formal legal compliance summary at ${shareAppUrl} #DataPrivacy #LegalTech #DPDP2023 #ASJiOne #PrivacyCompliance`;

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
          className="inline-flex items-center gap-2 rounded-md border border-[#262932] bg-[#15171C] px-3.5 py-2 text-xs font-semibold text-[#F4F4F5] transition-colors hover:border-[#C9A227] hover:text-[#C9A227] cursor-pointer whitespace-nowrap"
        >
          <FileText className="h-3.5 w-3.5 text-[#C9A227]" />
          <span>Download PDF Report</span>
          <Printer className="h-3 w-3 text-[#71717A]" />
        </button>

        {/* Share on LinkedIn Action Box */}
        <button
          onClick={handleShareClick}
          type="button"
          title="Share score on LinkedIn"
          className="btn-gold inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold cursor-pointer whitespace-nowrap"
        >
          <Linkedin className="h-3.5 w-3.5" />
          <span>{copied ? "Copied & Opening" : "Share on LinkedIn"}</span>
          {copied ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <ExternalLink className="h-3 w-3 opacity-80" />
          )}
        </button>
      </div>

      {/* Interactive Sharing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0E11]/90 p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg overflow-hidden rounded-md border border-[#262932] bg-[#15171C] p-6 text-[#F4F4F5]">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Close modal"
              className="absolute right-4 top-4 rounded-md border border-[#262932] bg-[#0D0E11] p-1.5 text-[#A1A1AA] transition-colors hover:text-[#F4F4F5] hover:border-[#C9A227] cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 border-b border-[#262932] pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[#262932] bg-[#0D0E11] text-[#C9A227]">
                <Linkedin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-[#F4F4F5]">
                  LinkedIn Share &amp; PDF Report Ready
                </h3>
                <p className="text-xs font-mono text-[#A1A1AA]">
                  Audited Domain:{" "}
                  <span className="font-semibold text-[#F4F4F5]">{cleanDomain}</span> · Score:{" "}
                  <span className="tabular-nums text-[#C9A227]">{score}/100</span>
                </p>
              </div>
            </div>

            {/* Instructions Box */}
            <div className="my-4 rounded-md border border-[#262932] bg-[#0D0E11] p-3.5 text-xs text-[#A1A1AA]">
              <div className="flex items-start gap-2.5">
                <Info className="h-4 w-4 shrink-0 text-[#C9A227] mt-0.5" />
                <div>
                  <p className="font-semibold text-[#F4F4F5]">Publication Instructions:</p>
                  <ol className="mt-1 list-decimal space-y-1 pl-4 text-xs">
                    <li>Sign in to LinkedIn if prompted.</li>
                    <li>
                      Press{" "}
                      <kbd className="rounded border border-[#262932] bg-[#15171C] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#F4F4F5]">
                        Ctrl + V
                      </kbd>{" "}
                      (or{" "}
                      <kbd className="rounded border border-[#262932] bg-[#15171C] px-1.5 py-0.5 font-mono text-[11px] font-semibold text-[#F4F4F5]">
                        Cmd + V
                      </kbd>
                      ) inside the post composer to paste your summary.
                    </li>
                    <li>Attach your official PDF audit certificate for {cleanDomain}.</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Formatted Text Box */}
            <div className="mb-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] text-[#A1A1AA]">
                  Post Text Summary for {cleanDomain}
                </span>
                <button
                  onClick={() => copyToClipboard(postText)}
                  className="flex items-center gap-1 font-mono text-[11px] font-bold text-[#C9A227] hover:text-[#DFB842] cursor-pointer"
                >
                  <Copy className="h-3 w-3" />
                  <span>{copied ? "Copied" : "Re-copy Text"}</span>
                </button>
              </div>
              <div className="max-h-32 overflow-y-auto rounded-md border border-[#262932] bg-[#0D0E11] p-3 font-sans text-xs leading-relaxed text-[#A1A1AA] select-all">
                {postText}
              </div>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-col gap-2.5 pt-1">
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="btn-gold inline-flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-xs font-bold cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                <span>View / Save PDF Summary Report ({cleanDomain})</span>
              </button>

              <button
                onClick={() => {
                  copyToClipboard(postText);
                  openLinkedInFeed();
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#262932] bg-[#0D0E11] py-2.5 text-xs font-bold text-[#F4F4F5] transition-colors hover:border-[#C9A227] hover:text-[#C9A227] cursor-pointer"
              >
                <Share2 className="h-4 w-4" />
                <span>Open LinkedIn Post Composer</span>
              </button>

              <button
                onClick={openLinkedInOffsite}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#262932] bg-[#15171C] py-2 text-xs font-semibold text-[#A1A1AA] transition-colors hover:text-[#F4F4F5] hover:border-[#C9A227]/60 cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Share Direct URL Card</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Printable PDF Summary Report Certificate Modal */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#0D0E11]/95 p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="relative mx-auto max-w-4xl pt-2 pb-12">
            <div className="mb-4 flex items-center justify-between rounded-md border border-[#262932] bg-[#15171C] px-4 py-3 text-[#F4F4F5]">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#C9A227]" />
                <span className="font-display text-sm font-bold text-[#F4F4F5]">
                  Official Audit Certificate &amp; PDF Report ({cleanDomain})
                </span>
              </div>
              <button
                onClick={() => setIsPdfModalOpen(false)}
                className="inline-flex items-center gap-1.5 rounded-md border border-[#262932] bg-[#0D0E11] px-3 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:border-[#C9A227] hover:text-[#F4F4F5] transition-colors cursor-pointer"
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
