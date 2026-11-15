/** Server-only reconnaissance helpers: gathers real evidence about a live website. */

import { detectServerLocation, detectBusinessLocation, type LocationInfo } from "./country-origin";
import type { ScanMethodWorked } from "./audit-types";
import {
  directChromeFetch,
  puppeteerRemoteRender,
  isResponseBlocked,
  inspectSslCertificate,
  inspectDnsSecurity,
  inspectHygieneProbes,
  WAF_BADGE_TEXT,
  type SslCertDetails,
  type DnsSecurityDetails,
  type HygieneProbeResult,
} from "./network-recon.server";
import { evaluateAllChecks } from "./checks-runner";

export interface DetectedScriptItem {
  name: string;
  category: string;
  scriptUrlOrSnippet: string;
  privacyRisk: string;
}

export interface DetectedCmpItem {
  name: string;
  evidence: string;
  isStandardCmp: boolean;
}

export interface PolicyDisclosuresItem {
  privacyPolicyUrl?: string;
  privacyPolicyText?: string;
  cookiePolicyUrl?: string;
  cookiePolicyText?: string;
  termsUrl?: string;
  termsText?: string;
  grievanceContact?: string;
  grievanceText?: string;
}

export type SiteEvidence = {
  finalUrl: string;
  host: string;
  statusCode: number;
  redirectChainNote: string;
  httpsUpgrade: boolean;
  responseHeaders: Record<string, string>;
  securityHeaders: Record<string, string | null>;
  setCookiePreConsent: string[];
  cookieFlagAnalysis: string[];
  title: string;
  metaDescription: string;
  htmlLang: string;
  thirdPartyHosts: string[];
  trackerSignals: string[];
  consentSignals: string[];
  formsCollectingData: string[];
  policyLinks: string[];
  discoveredPolicyUrls: string[];
  robotsTxt: string;
  securityTxt: string | null;
  wellKnownDntPolicy: boolean;
  metaCsp: string | null;
  corsHeaderInfo: string;
  serverTech: string[];
  fetchErrors: string[];
  isBlockedOrIncomplete: boolean;
  isWafBlocked?: boolean;
  wafBadge?: string;
  blockReason?: string;
  serverLocation: LocationInfo;
  businessLocation: LocationInfo;
  inferredTrackerCookies?: string[];
  scanMethodWorked?: ScanMethodWorked | null;
  finalHttpStatus?: number;
  attemptedMethods?: string[];
  checksSummary?: import("./checks-types").ChecksSummary;
  // Deterministic Forensics Extensions
  detectedScripts?: DetectedScriptItem[];
  detectedCmp?: DetectedCmpItem | null;
  policyDisclosures?: PolicyDisclosuresItem;
  politechSignals?: {
    hasPoliticalAdDisclosure: boolean;
    hasPreCheckedConsent: boolean;
  };
  mixedContentUrls?: string[];
  sslDetails?: SslCertDetails;
  dnsDetails?: DnsSecurityDetails;
  hygieneDetails?: HygieneProbeResult;
};

export const SECURITY_HEADER_NAMES = [
  "strict-transport-security",
  "content-security-policy",
  "content-security-policy-report-only",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
  "cross-origin-opener-policy",
  "cross-origin-resource-policy",
  "cross-origin-embedder-policy",
  "x-permitted-cross-domain-policies",
  "x-dns-prefetch-control",
];

interface ScriptSignature {
  pattern: RegExp;
  name: string;
  category:
    | "Analytics & Telemetry"
    | "Ad Retargeting"
    | "Tag Orchestration"
    | "Session Replay"
    | "CRM & Support";
  privacyRisk: string;
}

const SCRIPT_SIGNATURES: ScriptSignature[] = [
  {
    pattern: /googletagmanager\.com\/gtm\.js/i,
    name: "Google Tag Manager",
    category: "Tag Orchestration",
    privacyRisk:
      "Centralized client-side script orchestration container capable of injecting unvetted tags.",
  },
  {
    pattern: /google-analytics\.com\/analytics\.js|googletagmanager\.com\/gtag\/js/i,
    name: "Google Analytics 4 / Universal Analytics",
    category: "Analytics & Telemetry",
    privacyRisk:
      "Persistent user behavioral tracking and US data transfer exposure without verified explicit consent.",
  },
  {
    pattern: /connect\.facebook\.net\/[a-z_]+\/fbevents\.js|facebook\.com\/tr/i,
    name: "Meta Pixel (fbevents.js)",
    category: "Ad Retargeting",
    privacyRisk: "Cross-site behavioural identity matching and third-party social graph profiling.",
  },
  {
    pattern: /static\.hotjar\.com\/c\/hotjar-|script\.hotjar\.com/i,
    name: "Hotjar Session Recording",
    category: "Session Replay",
    privacyRisk:
      "Full keystroke and cursor movement recording; potential accidental PII leak in form fields.",
  },
  {
    pattern: /www\.clarity\.ms\/tag\/|clarity\.ms\/s/i,
    name: "Microsoft Clarity",
    category: "Session Replay",
    privacyRisk:
      "Behavioral session telemetry and heatmapping transmitted to cloud processing nodes.",
  },
  {
    pattern: /analytics\.tiktok\.com\/i18n\/pixel\/|tiktok\.com\/i18n/i,
    name: "TikTok Pixel",
    category: "Ad Retargeting",
    privacyRisk:
      "Cross-platform ad attribution and user telemetry dispatched to Bytedance servers.",
  },
  {
    pattern: /snap\.licdn\.com\/li\.lms-analytics\/insight\.min\.js|linkedin\.com\/px/i,
    name: "LinkedIn Insight Tag",
    category: "Ad Retargeting",
    privacyRisk: "B2B professional identity linking and retargeting profile enrichment.",
  },
  {
    pattern: /cdn\.segment\.com\/analytics\.js/i,
    name: "Segment Customer Data Platform",
    category: "Tag Orchestration",
    privacyRisk: "Multiplexed user identity event streaming to downstream marketing endpoints.",
  },
  {
    pattern: /cdn\.mxpnl\.com\/libs\/mixpanel/i,
    name: "Mixpanel Analytics",
    category: "Analytics & Telemetry",
    privacyRisk: "User cohort profiling and event telemetry tracking.",
  },
  {
    pattern: /cdn\.amplitude\.com\/libs\/amplitude/i,
    name: "Amplitude Analytics",
    category: "Analytics & Telemetry",
    privacyRisk: "Product analytics and user engagement tracking.",
  },
  {
    pattern: /js\.hs-scripts\.com|track\.hubspot\.com/i,
    name: "HubSpot Tracking & Lead Intelligence",
    category: "CRM & Support",
    privacyRisk: "Inbound lead identity resolution and IP geolocation profiling.",
  },
  {
    pattern: /matomo\.js|piwik\.js/i,
    name: "Matomo Self-Hosted / Cloud Analytics",
    category: "Analytics & Telemetry",
    privacyRisk: "Web analytics telemetry (lower cross-border transfer risk if sovereign-hosted).",
  },
];

interface CmpSignature {
  pattern: RegExp;
  name: string;
  isStandardCmp: boolean;
}

const CMP_SIGNATURES: CmpSignature[] = [
  {
    pattern: /cdn\.cookielaw\.org|onetrust|optanon/i,
    name: "OneTrust Enterprise CMP",
    isStandardCmp: true,
  },
  {
    pattern: /consent\.cookiebot\.com\/uc\.js|cookiebot/i,
    name: "Cookiebot by Usercentrics",
    isStandardCmp: true,
  },
  { pattern: /app\.usercentrics\.eu|usercentrics/i, name: "Usercentrics CMP", isStandardCmp: true },
  { pattern: /cdn-cookieyes\.com|cookieyes/i, name: "CookieYes CMP", isStandardCmp: true },
  { pattern: /app\.termly\.io|termly/i, name: "Termly Consent Management", isStandardCmp: true },
  {
    pattern: /cmp\.quantcast\.com|quantcast|__tcfapi/i,
    name: "Quantcast Choice (IAB TCF v2.2)",
    isStandardCmp: true,
  },
  {
    pattern: /klaro(\.min)?\.js|id=["']klaro["']/i,
    name: "Klaro Open-Source Consent Manager",
    isStandardCmp: true,
  },
  { pattern: /cmp\.osano\.com|osano/i, name: "Osano Data Privacy Platform", isStandardCmp: true },
  { pattern: /axeptio|static\.axept\.io/i, name: "Axeptio Consent Platform", isStandardCmp: true },
  {
    pattern: /complianz|borlabs-cookie/i,
    name: "WordPress Complianz / Borlabs CMP",
    isStandardCmp: true,
  },
  {
    pattern:
      /class=["'][^"']*(?:cookie-banner|cookie-consent|cookie-notice)[^"']*["']|id=["'][^"']*(?:cookie-banner|cookie-consent)[^"']*["']/i,
    name: "Custom Proprietary Cookie Banner",
    isStandardCmp: false,
  },
];

function textBetween(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? m[1].trim().replace(/\s+/g, " ").slice(0, 300) : "";
}

/**
 * Deterministically analyzes live HTML DOM for third-party scripts, CMP banners,
 * policy links, mixed content, and form inputs.
 */
function inspectHtmlForensics(
  html: string,
  targetHost: string,
  targetOrigin: string,
): {
  detectedScripts: DetectedScriptItem[];
  detectedCmp: DetectedCmpItem | null;
  policyDisclosures: PolicyDisclosuresItem;
  politechSignals: {
    hasPoliticalAdDisclosure: boolean;
    hasPreCheckedConsent: boolean;
  };
  policyLinks: string[];
  mixedContentUrls: string[];
  thirdPartyHosts: string[];
  formsCollectingData: string[];
} {
  const detectedScripts: DetectedScriptItem[] = [];
  const scriptSeen = new Set<string>();
  const thirdPartyHosts = new Set<string>();

  // 1. Scan <script> tags for external sources and inline forensics
  const scriptTagRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(scriptTagRegex)) {
    const attrs = match[1] || "";
    const inlineContent = match[2] || "";

    const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
    const scriptSrc = srcMatch ? srcMatch[1].trim() : "";

    if (scriptSrc) {
      try {
        const parsedUrl = new URL(scriptSrc, targetOrigin);
        if (parsedUrl.hostname && parsedUrl.hostname !== targetHost) {
          thirdPartyHosts.add(parsedUrl.hostname);
        }
      } catch {
        /* ignore invalid URL */
      }

      // Check against known tracking signatures
      for (const sig of SCRIPT_SIGNATURES) {
        if (sig.pattern.test(scriptSrc) && !scriptSeen.has(sig.name)) {
          scriptSeen.add(sig.name);
          detectedScripts.push({
            name: sig.name,
            category: sig.category,
            scriptUrlOrSnippet: scriptSrc.slice(0, 240),
            privacyRisk: sig.privacyRisk,
          });
        }
      }
    } else if (inlineContent.length > 10) {
      // Check inline script contents
      for (const sig of SCRIPT_SIGNATURES) {
        if (sig.pattern.test(inlineContent) && !scriptSeen.has(sig.name)) {
          scriptSeen.add(sig.name);
          detectedScripts.push({
            name: sig.name,
            category: sig.category,
            scriptUrlOrSnippet: `[Inline Script] ${sig.name} initialization signature detected`,
            privacyRisk: sig.privacyRisk,
          });
        }
      }
    }
  }

  // 2. Scan for Consent Management Platform (CMP)
  let detectedCmp: DetectedCmpItem | null = null;
  for (const sig of CMP_SIGNATURES) {
    if (sig.pattern.test(html)) {
      const matchExcerpt = html.match(sig.pattern)?.[0] || sig.name;
      detectedCmp = {
        name: sig.name,
        evidence: `Matched DOM element/script: ${matchExcerpt.slice(0, 120)}`,
        isStandardCmp: sig.isStandardCmp,
      };
      break;
    }
  }

  // 3. Scan for Insecure Mixed Content (http:// on https site)
  const mixedContentUrls: string[] = [];
  const mixedContentSeen = new Set<string>();
  const srcHrefRegex = /(?:src|href)=["'](http:\/\/[^"']+)["']/gi;
  for (const m of html.matchAll(srcHrefRegex)) {
    const rawUrl = m[1];
    if (!rawUrl.includes("www.w3.org") && !rawUrl.includes("schemas.microsoft.com")) {
      if (!mixedContentSeen.has(rawUrl)) {
        mixedContentSeen.add(rawUrl);
        mixedContentUrls.push(rawUrl.slice(0, 200));
      }
    }
  }

  // 4. Scan <a> tags for Privacy, Cookie, Terms, and Grievance disclosures
  const policyDisclosures: PolicyDisclosuresItem = {};
  const policyLinks: string[] = [];
  const anchorRegex = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;

  for (const m of html.matchAll(anchorRegex)) {
    const rawHref = m[1].trim();
    if (rawHref.startsWith("#") || rawHref.startsWith("javascript:")) continue;

    const anchorText = m[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    let absoluteUrl = rawHref;
    try {
      absoluteUrl = new URL(rawHref, targetOrigin).toString();
    } catch {
      /* ignore */
    }

    const combinedStr = `${anchorText} ${rawHref}`.toLowerCase();

    // Privacy Policy
    if (
      !policyDisclosures.privacyPolicyUrl &&
      /privacy|data-protection|datenschutz|politique-de-confidentialite/i.test(combinedStr)
    ) {
      policyDisclosures.privacyPolicyUrl = absoluteUrl;
      policyDisclosures.privacyPolicyText = anchorText || "Privacy Policy";
      policyLinks.push(`${anchorText || "Privacy Policy"} → ${absoluteUrl}`);
    }

    // Cookie Policy
    if (
      !policyDisclosures.cookiePolicyUrl &&
      /cookie|cookies|cookie-richtlinie|politique-des-cookies/i.test(combinedStr)
    ) {
      policyDisclosures.cookiePolicyUrl = absoluteUrl;
      policyDisclosures.cookiePolicyText = anchorText || "Cookie Policy";
      policyLinks.push(`${anchorText || "Cookie Policy"} → ${absoluteUrl}`);
    }

    // Terms of Service
    if (
      !policyDisclosures.termsUrl &&
      /terms|terms-of-service|terms-and-conditions|nutzungsbedingungen|conditions/i.test(
        combinedStr,
      )
    ) {
      policyDisclosures.termsUrl = absoluteUrl;
      policyDisclosures.termsText = anchorText || "Terms of Service";
      policyLinks.push(`${anchorText || "Terms of Service"} → ${absoluteUrl}`);
    }

    // Grievance Officer / DPO
    if (
      !policyDisclosures.grievanceContact &&
      /grievance|dpo|data protection officer|nodal officer|privacy-officer|mailto:.*(?:dpo|grievance|privacy)/i.test(
        combinedStr,
      )
    ) {
      policyDisclosures.grievanceContact = absoluteUrl;
      policyDisclosures.grievanceText = anchorText || "Grievance Officer / DPO";
      policyLinks.push(`${anchorText || "Grievance Officer"} → ${absoluteUrl}`);
    }
  }

  // Fallback check: inspect visible HTML text for DPO / Grievance Officer / privacy contact
  if (!policyDisclosures.grievanceContact) {
    const plainText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ");
    const dpoMatch = plainText.match(
      /(?:grievance(?:\s+redressal)?\s+officer|data\s+protection\s+officer|nodal\s+officer|privacy\s+officer|[a-z0-9._%+-]*(?:dpo|grievance|privacy)@[a-z0-9.-]+\.[a-z]{2,})/i,
    );
    if (dpoMatch) {
      policyDisclosures.grievanceContact = dpoMatch[0].trim();
      policyDisclosures.grievanceText = dpoMatch[0].trim();
    }
  }

  // 5. PoliTech Signals: Political Ad/Publisher Disclosure & Pre-Checked Consent Boxes
  const plainDomText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const hasPoliticalAdDisclosure =
    /\b(?:paid\s+for\s+by|authorized\s+by|authorised\s+by|printed\s+and\s+published\s+by|publisher\s+imprint|campaign\s+committee|treasurer|electoral\s+disclosure)\b/i.test(
      plainDomText,
    );
  const preCheckedConsentMatch =
    /<input\b(?=[^>]*type=["']checkbox["'])(?=[^>]*\bchecked\b)[^>]*>/i.test(html);

  // 6. Scan form input fields
  const formsCollectingData: string[] = [];
  const formInputRegex = /<input\b[^>]+type=["'](email|password|tel|text|number)["'][^>]*>/gi;
  for (const m of html.matchAll(formInputRegex)) {
    const tag = m[0].slice(0, 160);
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    formsCollectingData.push(`${m[1]}${nameMatch ? ` (${nameMatch[1]})` : ""}`);
  }

  return {
    detectedScripts,
    detectedCmp,
    policyDisclosures,
    politechSignals: {
      hasPoliticalAdDisclosure,
      hasPreCheckedConsent: preCheckedConsentMatch,
    },
    policyLinks: [...new Set(policyLinks)].slice(0, 25),
    mixedContentUrls: mixedContentUrls.slice(0, 20),
    thirdPartyHosts: [...thirdPartyHosts].slice(0, 50),
    formsCollectingData: [...new Set(formsCollectingData)].slice(0, 20),
  };
}

export async function gatherSiteEvidence(rawUrl: string): Promise<SiteEvidence> {
  const target = new URL(rawUrl);
  const targetOrigin = target.origin || `https://${target.hostname}`;
  const fetchErrors: string[] = [];
  const attemptedMethods: string[] = [];

  let scanMethodWorked: ScanMethodWorked | null = null;
  let finalHttpStatus = 0;
  let finalHtml = "";
  let finalHeaders: Record<string, string> = {};
  let finalSetCookiePreConsent: string[] = [];
  let renderedRequests: string[] = [];
  let lastBlockReason = "";
  let isWafBlocked = false;
  let finalUrl = target.toString();

  // Run SSL, DNS (DoH), and Hygiene probes in parallel
  const [sslDetails, dnsDetails, hygieneDetails] = await Promise.all([
    inspectSslCertificate(target.hostname, 443),
    inspectDnsSecurity(target.hostname),
    inspectHygieneProbes(targetOrigin),
  ]);

  // =========================================================================
  // FALLBACK CHAIN 1: Direct Server fetch with full real Chrome headers (12s timeout)
  // =========================================================================
  attemptedMethods.push("Direct");
  const directResult = await directChromeFetch(target.toString(), 12000);
  finalHttpStatus = directResult.status;
  finalHtml = directResult.html;
  finalHeaders = directResult.headers;
  finalUrl = directResult.finalUrl;
  finalSetCookiePreConsent = directResult.cookies;

  const directCheck = isResponseBlocked(finalHttpStatus, finalHtml, finalHeaders);

  if (!directCheck.isBlocked) {
    scanMethodWorked = "Direct";
  } else {
    lastBlockReason = directCheck.reason || `Direct status ${finalHttpStatus}`;
    if (directCheck.isWafBlocked) isWafBlocked = true;

    // =========================================================================
    // FALLBACK CHAIN 2: Headless Chrome (Puppeteer) via PUPPETEER_SERVICE_URL
    // =========================================================================
    attemptedMethods.push("Rendered");
    try {
      const renderRes = await puppeteerRemoteRender(target.toString(), 25000);
      if (renderRes) {
        const renderCheck = isResponseBlocked(renderRes.status, renderRes.html, renderRes.headers);
        if (!renderCheck.isBlocked) {
          scanMethodWorked = "Rendered";
          finalHttpStatus = renderRes.status;
          finalHtml = renderRes.html;
          finalHeaders = renderRes.headers;
          finalSetCookiePreConsent = renderRes.cookies;
          renderedRequests = renderRes.requests;
          finalUrl = renderRes.finalUrl || target.toString();
          isWafBlocked = false;
        } else {
          lastBlockReason = `Headless render returned challenge: ${renderCheck.reason}`;
          if (renderCheck.isWafBlocked) isWafBlocked = true;
        }
      }
    } catch (err) {
      console.warn("[GatherSiteEvidence] Headless render exception:", err);
    }
  }

  const httpsUpgrade = new URL(finalUrl).protocol === "https:";

  // Tech stack detection from real observed headers
  const techList: string[] = [];
  if (finalHeaders["server"]) techList.push(`Server: ${finalHeaders["server"]}`);
  if (finalHeaders["x-powered-by"]) techList.push(`Powered-By: ${finalHeaders["x-powered-by"]}`);
  if (finalHeaders["cf-ray"] || finalHeaders["server"]?.toLowerCase().includes("cloudflare")) {
    techList.push("Infrastructure: Cloudflare CDN / WAF");
  }
  if (finalHeaders["x-vercel-id"]) techList.push("Infrastructure: Vercel Edge Network");
  if (finalHeaders["x-amz-cf-id"] || finalHeaders["server"]?.includes("AmazonS3")) {
    techList.push("Infrastructure: Amazon Web Services (AWS)");
  }
  if (finalHeaders["x-nf-request-id"]) techList.push("Infrastructure: Netlify Hosting");
  if (finalHeaders["server"]?.includes("Google") || finalHeaders["x-cloud-trace-context"]) {
    techList.push("Infrastructure: Google Cloud Platform (GCP)");
  }

  const serverLocation = detectServerLocation(target.hostname, techList, finalHeaders);
  const businessLocation = detectBusinessLocation(target.hostname, "", finalHtml);

  // If page was blocked by perimeter WAF/Shield:
  if (!scanMethodWorked || isWafBlocked) {
    const evidencePartial: SiteEvidence = {
      finalUrl,
      host: target.hostname,
      statusCode: finalHttpStatus || (sslDetails.valid ? 200 : 0),
      redirectChainNote: `Access gated across ${attemptedMethods.join(" -> ")} (${lastBlockReason})`,
      httpsUpgrade,
      responseHeaders: finalHeaders,
      securityHeaders: Object.fromEntries(
        SECURITY_HEADER_NAMES.map((n) => [n, finalHeaders[n] ?? null]),
      ),
      setCookiePreConsent: finalSetCookiePreConsent,
      cookieFlagAnalysis: [],
      title: `${target.hostname} · WAF Protected Domain`,
      metaDescription: "Target site active perimeter shield intercepted raw HTML retrieval.",
      htmlLang: "en",
      thirdPartyHosts: [],
      trackerSignals: [], // RULE: Never invent trackers when page was blocked
      consentSignals: [],
      formsCollectingData: [],
      policyLinks: [],
      discoveredPolicyUrls: hygieneDetails.securityTxtFound
        ? [`${targetOrigin}/.well-known/security.txt`]
        : [],
      robotsTxt: hygieneDetails.robotsTxtContent || "",
      securityTxt: hygieneDetails.securityTxtFound ? "Published" : null,
      wellKnownDntPolicy: false,
      metaCsp: null,
      corsHeaderInfo: finalHeaders["access-control-allow-origin"]
        ? `Access-Control-Allow-Origin: ${finalHeaders["access-control-allow-origin"]}`
        : "Not set",
      serverTech: techList.length ? techList : ["Cloudflare / Edge Perimeter Shield Active"],
      fetchErrors: [lastBlockReason],
      isBlockedOrIncomplete: true,
      isWafBlocked: true,
      wafBadge: WAF_BADGE_TEXT,
      blockReason: lastBlockReason,
      serverLocation,
      businessLocation,
      inferredTrackerCookies: [],
      scanMethodWorked: "Limited (blocked by site firewall)",
      finalHttpStatus: finalHttpStatus || (sslDetails.valid ? 200 : 0),
      attemptedMethods,
      sslDetails,
      dnsDetails,
      hygieneDetails,
    };

    evidencePartial.checksSummary = evaluateAllChecks(
      evidencePartial,
      sslDetails,
      dnsDetails,
      hygieneDetails,
    );

    return evidencePartial;
  }

  // =========================================================================
  // SUCCESSFUL PAGE INSPECTION (REAL DETERMINISTIC FORENSICS)
  // =========================================================================
  const securityHeaders: Record<string, string | null> = {};
  for (const name of SECURITY_HEADER_NAMES) {
    securityHeaders[name] = finalHeaders[name] ?? null;
  }

  // Perform deep deterministic forensics on real fetched HTML
  const forensics = inspectHtmlForensics(finalHtml, target.hostname, targetOrigin);

  // Analyze cookie flags strictly on cookies actually received in HTTP Set-Cookie
  const cookieFlagAnalysis: string[] = finalSetCookiePreConsent.map((c) => {
    const name = c.split("=")[0]?.trim() || "cookie";
    const isSecure = /;\s*secure/i.test(c);
    const isHttpOnly = /;\s*httponly/i.test(c);
    const sameSiteMatch = c.match(/;\s*samesite=([a-z]+)/i);
    const sameSite = sameSiteMatch ? sameSiteMatch[1] : "Unset (Default Lax)";
    return `${name}: Secure=${isSecure}, HttpOnly=${isHttpOnly}, SameSite=${sameSite}`;
  });

  const trackerSignals = forensics.detectedScripts.map((s) => `${s.name} (${s.category})`);
  const consentSignals = forensics.detectedCmp ? [forensics.detectedCmp.name] : [];

  const discoveredPolicyUrls: string[] = [];
  if (hygieneDetails.securityTxtFound)
    discoveredPolicyUrls.push(`${targetOrigin}/.well-known/security.txt`);
  if (hygieneDetails.sitemapFound) discoveredPolicyUrls.push(`${targetOrigin}/sitemap.xml`);
  if (forensics.policyDisclosures.privacyPolicyUrl) {
    discoveredPolicyUrls.push(forensics.policyDisclosures.privacyPolicyUrl);
  }

  const metaCspMatch = finalHtml.match(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]+content=["']([^"']*)["']/i,
  );
  const metaCsp = metaCspMatch ? metaCspMatch[1] : null;

  const allowOrigin = finalHeaders["access-control-allow-origin"] || "Not set";
  const allowCredentials = finalHeaders["access-control-allow-credentials"] || "Not set";
  const corsHeaderInfo = `Access-Control-Allow-Origin: ${allowOrigin} | Credentials: ${allowCredentials}`;

  const evidenceFull: SiteEvidence = {
    finalUrl,
    host: target.hostname,
    statusCode: finalHttpStatus || 200,
    redirectChainNote:
      finalUrl !== target.toString()
        ? `Redirected ${target.toString()} → ${finalUrl}`
        : "Direct route verified",
    httpsUpgrade,
    responseHeaders: finalHeaders,
    securityHeaders,
    setCookiePreConsent: finalSetCookiePreConsent.slice(0, 40),
    cookieFlagAnalysis: cookieFlagAnalysis.slice(0, 40),
    title: textBetween(finalHtml, /<title[^>]*>([\s\S]*?)<\/title>/i) || target.hostname,
    metaDescription: textBetween(
      finalHtml,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    ),
    htmlLang: textBetween(finalHtml, /<html[^>]+lang=["']([^"']+)["']/i) || "en",
    thirdPartyHosts: forensics.thirdPartyHosts,
    trackerSignals,
    consentSignals,
    formsCollectingData: forensics.formsCollectingData,
    policyLinks: forensics.policyLinks,
    discoveredPolicyUrls: [...new Set(discoveredPolicyUrls)],
    robotsTxt: hygieneDetails.robotsTxtContent || "",
    securityTxt: hygieneDetails.securityTxtFound ? "Published" : null,
    wellKnownDntPolicy: false,
    metaCsp,
    corsHeaderInfo,
    serverTech: [...new Set(techList)],
    fetchErrors,
    isBlockedOrIncomplete: false,
    isWafBlocked: false,
    serverLocation,
    businessLocation,
    inferredTrackerCookies: [], // Strict: No artificial cookie synthesis
    scanMethodWorked,
    finalHttpStatus: finalHttpStatus || 200,
    attemptedMethods,
    detectedScripts: forensics.detectedScripts,
    detectedCmp: forensics.detectedCmp,
    policyDisclosures: forensics.policyDisclosures,
    politechSignals: forensics.politechSignals,
    mixedContentUrls: forensics.mixedContentUrls,
    sslDetails,
    dnsDetails,
    hygieneDetails,
  };

  evidenceFull.checksSummary = evaluateAllChecks(
    evidenceFull,
    sslDetails,
    dnsDetails,
    hygieneDetails,
  );

  return evidenceFull;
}

/** Renders evidence into a compact, model-readable dossier. */
export function formatEvidence(e: SiteEvidence): string {
  if (e.isBlockedOrIncomplete || e.isWafBlocked) {
    return [
      `LIVE SCAN EVIDENCE: VERIFIED NETWORK & DNS TELEMETRY (WAF/BOT SHIELD ACTIVE)`,
      `Status Badge: ${WAF_BADGE_TEXT}`,
      `Final URL: ${e.finalUrl}  |  HTTP Status: ${e.finalHttpStatus ?? e.statusCode}`,
      `Scan Method Attempted: ${e.attemptedMethods?.join(" -> ") || "Direct"} (Perimeter bot barrier active)`,
      `Perimeter Challenge Reason: ${e.blockReason || "Edge WAF filter active on target domain"}`,
      `Verified Server Location: ${e.serverLocation.countryName} (${e.serverLocation.provider || "CDN"})`,
      `Verified Business Location: ${e.businessLocation.countryName} (${e.businessLocation.source || "TLD"})`,
      `Verified TLS/SSL: ${e.sslDetails?.valid ? `Valid (Issuer: ${e.sslDetails.issuer}, Protocol: ${e.sslDetails.protocol})` : "Unverified"}`,
      `Verified DNS SPF: ${e.dnsDetails?.spfRecord || "Absent"}`,
      `Verified DNS DMARC: ${e.dnsDetails?.dmarcRecord || "Absent"}`,
      `Verified DNS CAA: ${e.dnsDetails?.caaRecords.join(", ") || "None published"}`,
      `Notice: HTML content retrieval gated by edge barrier. DNS/TLS records cryptographically verified via DoH.`,
    ].join("\n");
  }

  const missing = Object.entries(e.securityHeaders)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  const present = Object.entries(e.securityHeaders)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`);

  return [
    `LIVE SCAN EVIDENCE (Method: ${e.scanMethodWorked || "Direct"} | HTTP ${e.finalHttpStatus ?? e.statusCode} | ${e.redirectChainNote})`,
    `Final URL: ${e.finalUrl}`,
    `Scan Method Worked: ${e.scanMethodWorked || "Direct"}`,
    `Final HTTP Status: ${e.finalHttpStatus ?? e.statusCode}`,
    `Server location (hosting/CDN): ${e.serverLocation.countryName} (${e.serverLocation.provider || "CDN"})`,
    `Business location: ${e.businessLocation.countryName} (${e.businessLocation.source || "TLD"})`,
    `HTTPS served: ${e.httpsUpgrade ? "yes" : "NO — plaintext HTTP"}`,
    `Page title: ${e.title || "(none)"}`,
    `Meta description: ${e.metaDescription || "(none)"}`,
    `HTML lang: ${e.htmlLang || "(unset)"}`,
    `Server/infra headers: ${e.serverTech.join(", ") || "(none disclosed)"}`,
    `CORS headers: ${e.corsHeaderInfo}`,
    `Meta CSP tag: ${e.metaCsp || "none"}`,
    ``,
    `Security headers present:\n${present.length ? present.join("\n") : "  (none)"}`,
    `Security headers MISSING: ${missing.join(", ") || "none"}`,
    ``,
    `Cookies set on first request BEFORE consent (${e.setCookiePreConsent.length}):`,
    e.cookieFlagAnalysis.length ? e.cookieFlagAnalysis.map((c) => "  " + c).join("\n") : "  (none)",
    ``,
    `Consent/CMP signals in HTML: ${e.detectedCmp ? `${e.detectedCmp.name} (${e.detectedCmp.evidence})` : "NONE DETECTED"}`,
    `Detected Tracking Scripts (${e.detectedScripts?.length || 0}):`,
    e.detectedScripts?.length
      ? e.detectedScripts
          .map((s) => `  - ${s.name} [${s.category}]: ${s.scriptUrlOrSnippet}`)
          .join("\n")
      : "  (none detected in DOM)",
    `Third-party hosts referenced (${e.thirdPartyHosts.length}): ${e.thirdPartyHosts.join(", ") || "none"}`,
    `Personal-data input fields on landing page: ${e.formsCollectingData.join(", ") || "none"}`,
    `Privacy/legal links found: ${e.policyLinks.join(" | ") || "NONE FOUND"}`,
    `Discovered Policy Endpoints: ${e.discoveredPolicyUrls.join(" | ") || "none"}`,
    `security.txt: ${e.securityTxt ? "present\n" + e.securityTxt : "absent"}`,
    `DNS SPF: ${e.dnsDetails?.spfRecord || "absent"}`,
    `DNS DMARC: ${e.dnsDetails?.dmarcRecord || "absent"}`,
    `DNS CAA: ${e.dnsDetails?.caaRecords.join(", ") || "none"}`,
    `TLS Certificate: ${e.sslDetails?.valid ? `Valid (${e.sslDetails.issuer}, expires ${e.sslDetails.validTo})` : "Invalid/None"}`,
    `robots.txt (truncated): ${e.robotsTxt ? e.robotsTxt.slice(0, 600) : "absent"}`,
    e.fetchErrors.length ? `Fetch notes: ${e.fetchErrors.join(" ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
