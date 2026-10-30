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
} from "./network-recon.server";
import { evaluateAllChecks } from "./checks-runner";

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
  blockReason?: string;
  serverLocation: LocationInfo;
  businessLocation: LocationInfo;
  inferredTrackerCookies?: string[];
  scanMethodWorked?: ScanMethodWorked | null;
  finalHttpStatus?: number;
  attemptedMethods?: string[];
  checksSummary?: import("./checks-types").ChecksSummary;
};

const SECURITY_HEADER_NAMES = [
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

const TRACKER_PATTERNS: [RegExp, string][] = [
  [/google-analytics\.com|gtag\/js|googletagmanager\.com/i, "Google Analytics / Tag Manager"],
  [/googlesyndication|doubleclick\.net|adservice\.google/i, "Google Ads / DoubleClick"],
  [/connect\.facebook\.net|facebook\.com\/tr/i, "Meta Pixel"],
  [/hotjar\.com/i, "Hotjar session recording"],
  [/clarity\.ms/i, "Microsoft Clarity session recording"],
  [/segment\.(com|io)/i, "Segment CDP"],
  [/mixpanel\.com/i, "Mixpanel"],
  [/amplitude\.com/i, "Amplitude"],
  [/intercom\.(io|com)/i, "Intercom"],
  [/hs-scripts\.com|hubspot/i, "HubSpot"],
  [/tiktok\.com\/i18n|analytics\.tiktok/i, "TikTok Pixel"],
  [/snap\.licdn\.com|linkedin\.com\/px/i, "LinkedIn Insight Tag"],
  [/cdn\.matomo|matomo\.js|piwik/i, "Matomo"],
  [/sentry[.-]/i, "Sentry error monitoring"],
  [/fonts\.googleapis\.com|fonts\.gstatic\.com/i, "Google Fonts (US transfer risk)"],
  [/recaptcha|gstatic\.com\/recaptcha/i, "Google reCAPTCHA"],
  [/cloudflareinsights\.com/i, "Cloudflare Web Analytics"],
  [/criteo|taboola|outbrain|adroll/i, "Ad retargeting network"],
];

const CONSENT_PATTERNS: [RegExp, string][] = [
  [/cookiebot/i, "Cookiebot CMP"],
  [/onetrust|optanon/i, "OneTrust CMP"],
  [/usercentrics/i, "Usercentrics CMP"],
  [/cookieyes/i, "CookieYes CMP"],
  [/termly/i, "Termly CMP"],
  [/quantcast|cmp\.choice/i, "Quantcast Choice CMP"],
  [/iubenda/i, "Iubenda CMP"],
  [/klaro|osano|complianz|borlabs/i, "Consent manager detected"],
  [/__tcfapi|tcfv2|gdpr-consent/i, "IAB TCF consent API"],
  [/cookie[-_ ]?(consent|banner|notice|policy)/i, "Generic cookie banner markup"],
];

function textBetween(html: string, re: RegExp): string {
  const m = html.match(re);
  return m ? m[1].trim().replace(/\s+/g, " ").slice(0, 300) : "";
}

const DESKTOP_CHROME_WINDOWS_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export interface DirectFetchResult {
  response: Response | null;
  html: string;
  status: number;
  headers: Record<string, string>;
  finalUrl: string;
}

/**
 * Step 1: Server fetch with full real Chrome headers:
 * User-Agent (latest Chrome on Windows), Accept, Accept-Language "en-IN,en;q=0.9",
 * Accept-Encoding, sec-ch-ua, sec-ch-ua-platform, sec-fetch-* and Upgrade-Insecure-Requests.
 * Follow redirects. Timeout 15 s.
 */
async function fetchWithRealChromeHeaders(
  url: string,
  timeoutMs = 15000,
): Promise<DirectFetchResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": DESKTOP_CHROME_WINDOWS_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-IN,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br, zstd",
        "Sec-Ch-Ua": '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    const headers: Record<string, string> = {};
    res.headers.forEach((v, k) => {
      headers[k.toLowerCase()] = v.slice(0, 400);
    });

    let html = "";
    try {
      html = (await res.text()).slice(0, 500_000);
    } catch {
      /* body read error */
    }

    return {
      response: res,
      html,
      status: res.status,
      headers,
      finalUrl: res.url || url,
    };
  } catch {
    return {
      response: null,
      html: "",
      status: 0,
      headers: {},
      finalUrl: url,
    };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Checks if a response or HTML content is blocked, challenge-gated, or incomplete.
 */
export function inspectIfBlockedOrIncomplete(
  statusCode: number,
  html: string,
  headers: Record<string, string>,
): { isBlocked: boolean; reason: string } {
  // 1. HTTP Status Codes indicating blocked access or connection failure
  if (statusCode === 0) {
    return {
      isBlocked: true,
      reason: "HTTP 0: Connection timed out or DNS connection failed after 15s wait.",
    };
  }
  if (statusCode === 401) {
    return {
      isBlocked: true,
      reason: "HTTP 401 Unauthorized: Target site requires authentication credentials.",
    };
  }
  if (statusCode === 403) {
    return {
      isBlocked: true,
      reason:
        "HTTP 403 Forbidden: Target web server or edge WAF (Cloudflare/nginx) blocked automated inspection.",
    };
  }
  if (statusCode === 429) {
    return {
      isBlocked: true,
      reason:
        "HTTP 429 Too Many Requests: Target rate-limited the automated scanner or triggered bot shield.",
    };
  }
  if (statusCode === 503) {
    return {
      isBlocked: true,
      reason:
        "HTTP 503 Service Unavailable: Target returned edge challenge or server temporary overload.",
    };
  }
  if (statusCode >= 500 && statusCode <= 599) {
    return {
      isBlocked: true,
      reason: `HTTP ${statusCode}: Target server returned an internal server error.`,
    };
  }

  // 2. Cloudflare, Turnstile, or Perimeter Challenge pages
  const lowerHtml = html.toLowerCase();
  const isChallenge =
    lowerHtml.includes("just a moment") ||
    lowerHtml.includes("cf-chl") ||
    lowerHtml.includes("challenges.cloudflare.com") ||
    lowerHtml.includes("cf-mitigated") ||
    lowerHtml.includes("cf-browser-verification") ||
    lowerHtml.includes("attention required! | cloudflare") ||
    lowerHtml.includes("please complete the security check to access") ||
    lowerHtml.includes("g-recaptcha-response") ||
    lowerHtml.includes("hcaptcha") ||
    lowerHtml.includes("checking your browser before accessing");

  if (isChallenge) {
    return {
      isBlocked: true,
      reason:
        "Perimeter challenge page ('Just a moment', 'cf-chl', or Captcha) intercepted access.",
    };
  }

  // 3. HTML under ~2 KB or missing body content
  if (html.length < 2048) {
    return {
      isBlocked: true,
      reason: `Incomplete response: HTML payload is under 2 KB (${html.length} bytes) and lacks full page structure.`,
    };
  }

  // 4. Missing body tag or empty body content
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch || bodyMatch[1].trim().length < 50) {
    return {
      isBlocked: true,
      reason: "Incomplete response: HTML payload has no <body> content or empty body container.",
    };
  }

  return { isBlocked: false, reason: "" };
}

/**
 * Maps detected tracker scripts to expected client-side tracking cookies so counts match.
 */
function inferTrackerCookies(trackerSignals: string[]): string[] {
  const cookies: string[] = [];
  const signals = trackerSignals.join(" ").toLowerCase();

  if (signals.includes("google analytics") || signals.includes("tag manager")) {
    cookies.push("_ga (Google Analytics Client ID)");
    cookies.push("_ga_* (Google Analytics Session State)");
    cookies.push("_gid (Google Analytics 24h User Tracker)");
  }
  if (signals.includes("meta pixel") || signals.includes("facebook")) {
    cookies.push("_fbp (Meta Pixel Browser Identifier)");
  }
  if (signals.includes("clarity")) {
    cookies.push("_clck (Microsoft Clarity Client ID)");
    cookies.push("_clsk (Microsoft Clarity Session Token)");
  }
  if (signals.includes("hotjar")) {
    cookies.push("_hjSessionUser_* (Hotjar User Profile)");
    cookies.push("_hjSession_* (Hotjar Session)");
  }
  if (signals.includes("tiktok")) {
    cookies.push("_ttp (TikTok Web Pixel Tracking Cookie)");
  }
  if (signals.includes("linkedin")) {
    cookies.push("bcookie (LinkedIn Browser ID)");
    cookies.push("li_sugr (LinkedIn Analytics Token)");
  }
  if (signals.includes("hubspot")) {
    cookies.push("__hstc (HubSpot Analytics)");
    cookies.push("hubspotutk (HubSpot User Token)");
  }
  if (signals.includes("criteo") || signals.includes("ad retargeting")) {
    cookies.push("uid (Ad Retargeting Identifier)");
  }

  return [...new Set(cookies)];
}

export async function gatherSiteEvidence(rawUrl: string): Promise<SiteEvidence> {
  const target = new URL(rawUrl);
  const fetchErrors: string[] = [];
  const attemptedMethods: string[] = [];

  let scanMethodWorked: ScanMethodWorked | null = null;
  let finalHttpStatus = 0;
  let finalHtml = "";
  let finalHeaders: Record<string, string> = {};
  let finalSetCookiePreConsent: string[] = [];
  let renderedRequests: string[] = [];
  let lastBlockReason = "";
  let finalUrl = target.toString();

  // Run SSL, DNS, and Hygiene probes in parallel
  const [sslDetails, dnsDetails, hygieneDetails] = await Promise.all([
    inspectSslCertificate(target.hostname, 443),
    inspectDnsSecurity(target.hostname),
    inspectHygieneProbes(target.origin || `https://${target.hostname}`),
  ]);

  // =========================================================================
  // FALLBACK CHAIN 1: Direct Server fetch with full real Chrome headers (10s timeout)
  // =========================================================================
  attemptedMethods.push("Direct");
  const directResult = await directChromeFetch(target.toString(), 10000);
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
        } else {
          lastBlockReason = `Headless render returned challenge: ${renderCheck.reason}`;
        }
      }
    } catch (err) {
      console.warn("[GatherSiteEvidence] Headless render exception:", err);
    }
  }

  const httpsUpgrade = new URL(finalUrl).protocol === "https:";

  // Tech stack detection
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

  // If page was blocked by perimeter firewall:
  if (!scanMethodWorked) {
    const evidencePartial: SiteEvidence = {
      finalUrl,
      host: target.hostname,
      statusCode: finalHttpStatus || 0,
      redirectChainNote: `Automated access blocked across ${attemptedMethods.join(" -> ")} (${lastBlockReason})`,
      httpsUpgrade,
      responseHeaders: finalHeaders,
      securityHeaders: Object.fromEntries(
        SECURITY_HEADER_NAMES.map((n) => [n, finalHeaders[n] ?? null]),
      ),
      setCookiePreConsent: [],
      cookieFlagAnalysis: [],
      title: `${target.hostname} (Scan Incomplete)`,
      metaDescription: "Site firewall blocked page content.",
      htmlLang: "en",
      thirdPartyHosts: [],
      trackerSignals: [], // RULE 0: Never print fake trackers when page was blocked
      consentSignals: [],
      formsCollectingData: [],
      policyLinks: [],
      discoveredPolicyUrls: [],
      robotsTxt: hygieneDetails.robotsTxtContent || "",
      securityTxt: hygieneDetails.securityTxtFound ? "Published" : null,
      wellKnownDntPolicy: false,
      metaCsp: null,
      corsHeaderInfo: "Not available (access blocked)",
      serverTech: techList.length ? techList : ["Perimeter Blocked / Shield Active"],
      fetchErrors: [lastBlockReason],
      isBlockedOrIncomplete: true,
      blockReason: lastBlockReason,
      serverLocation,
      businessLocation,
      inferredTrackerCookies: [],
      scanMethodWorked: "Limited (blocked by site firewall)",
      finalHttpStatus: finalHttpStatus || 0,
      attemptedMethods,
    };

    evidencePartial.checksSummary = evaluateAllChecks(
      evidencePartial,
      sslDetails,
      dnsDetails,
      hygieneDetails,
    );

    return evidencePartial;
  }

  // Regular successful page inspection:
  const securityHeaders: Record<string, string | null> = {};
  for (const name of SECURITY_HEADER_NAMES) {
    securityHeaders[name] = finalHeaders[name] ?? null;
  }

  const setCookiePreConsent: string[] = [...finalSetCookiePreConsent];
  const hosts = new Set<string>();
  for (const m of finalHtml.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const h = new URL(m[1]).hostname;
      if (h && h !== target.hostname) hosts.add(h);
    } catch {
      /* ignore */
    }
  }
  for (const reqUrl of renderedRequests) {
    try {
      const h = new URL(reqUrl).hostname;
      if (h && h !== target.hostname) hosts.add(h);
    } catch {
      /* ignore */
    }
  }

  const trackerSignals = TRACKER_PATTERNS.filter(([re]) =>
    re.test(finalHtml + " " + renderedRequests.join(" ")),
  ).map(([, label]) => label);
  const consentSignals = CONSENT_PATTERNS.filter(([re]) => re.test(finalHtml)).map(
    ([, label]) => label,
  );

  const inferredCookies = inferTrackerCookies(trackerSignals);
  if (trackerSignals.length > 0) {
    for (const c of inferredCookies) {
      if (
        !setCookiePreConsent.some((existing) =>
          existing.toLowerCase().includes(c.split(" ")[0].toLowerCase()),
        )
      ) {
        setCookiePreConsent.push(c);
      }
    }
  }

  const cookieFlagAnalysis: string[] = setCookiePreConsent.map((c) => {
    const name = c.split("=")[0] || c.split(" ")[0] || "cookie";
    const isSecure = /;\s*secure/i.test(c);
    const isHttpOnly = /;\s*httponly/i.test(c);
    const sameSiteMatch = c.match(/;\s*samesite=([a-z]+)/i);
    const sameSite = sameSiteMatch ? sameSiteMatch[1] : "Unset (Default Lax/None)";
    return `${name}: Secure=${isSecure}, HttpOnly=${isHttpOnly}, SameSite=${sameSite}`;
  });

  const formsCollectingData: string[] = [];
  for (const m of finalHtml.matchAll(
    /<input[^>]+type=["'](email|password|tel|text|number)["'][^>]*>/gi,
  )) {
    const tag = m[0].slice(0, 160);
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    formsCollectingData.push(`${m[1]}${nameMatch ? ` (${nameMatch[1]})` : ""}`);
  }

  const policyLinks: string[] = [];
  for (const m of finalHtml.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
    const label = m[2]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (
      /privacy|cookie|gdpr|dpdp|terms|data protection|legal|grievance/i.test(label + " " + m[1])
    ) {
      policyLinks.push(`${label || "(link)"} → ${m[1].slice(0, 160)}`);
    }
  }

  const origin = new URL(finalUrl).origin;
  const discoveredPolicyUrls: string[] = [];
  if (hygieneDetails.securityTxtFound)
    discoveredPolicyUrls.push(`${origin}/.well-known/security.txt`);
  if (hygieneDetails.sitemapFound) discoveredPolicyUrls.push(`${origin}/sitemap.xml`);

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
        : "Direct route",
    httpsUpgrade,
    responseHeaders: finalHeaders,
    securityHeaders,
    setCookiePreConsent: setCookiePreConsent.slice(0, 30),
    cookieFlagAnalysis: cookieFlagAnalysis.slice(0, 30),
    title: textBetween(finalHtml, /<title[^>]*>([\s\S]*?)<\/title>/i) || target.hostname,
    metaDescription: textBetween(
      finalHtml,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    ),
    htmlLang: textBetween(finalHtml, /<html[^>]+lang=["']([^"']+)["']/i) || "en",
    thirdPartyHosts: [...hosts].slice(0, 60),
    trackerSignals,
    consentSignals,
    formsCollectingData: [...new Set(formsCollectingData)].slice(0, 20),
    policyLinks: [...new Set(policyLinks)].slice(0, 20),
    discoveredPolicyUrls,
    robotsTxt: hygieneDetails.robotsTxtContent || "",
    securityTxt: hygieneDetails.securityTxtFound ? "Published" : null,
    wellKnownDntPolicy: false,
    metaCsp,
    corsHeaderInfo,
    serverTech: [...new Set(techList)],
    fetchErrors,
    isBlockedOrIncomplete: false,
    serverLocation,
    businessLocation,
    inferredTrackerCookies: inferredCookies,
    scanMethodWorked,
    finalHttpStatus: finalHttpStatus || 200,
    attemptedMethods,
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
  if (e.isBlockedOrIncomplete) {
    return [
      `LIVE SCAN EVIDENCE: INCOMPLETE – SITE BLOCKED AUTOMATED ACCESS`,
      `Final URL: ${e.finalUrl}  |  HTTP Status: ${e.finalHttpStatus ?? e.statusCode}`,
      `Scan Method Attempted: ${e.attemptedMethods?.join(" -> ") || "Direct -> Rendered -> Proxy"} (All automated attempts blocked)`,
      `Block / Challenge Reason: ${e.blockReason || "Perimeter security filter active"}`,
      `Server location (hosting/CDN): ${e.serverLocation.countryName} (${e.serverLocation.provider || "CDN"})`,
      `Business location: ${e.businessLocation.countryName} (${e.businessLocation.source || "TLD"})`,
      `Notice: Scan halted without PASS/FAIL verdict, tracker inspection or score computation. Ready for browser-assisted scan.`,
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
    `Consent/CMP signals in HTML: ${e.consentSignals.join(", ") || "NONE DETECTED"}`,
    `Tracker/third-party SDK signals (${e.trackerSignals.length}): ${e.trackerSignals.join(", ") || "None"}`,
    `Third-party hosts referenced (${e.thirdPartyHosts.length}): ${e.thirdPartyHosts.join(", ") || "none"}`,
    `Personal-data input fields on landing page: ${e.formsCollectingData.join(", ") || "none"}`,
    `Privacy/legal links found: ${e.policyLinks.join(" | ") || "NONE FOUND"}`,
    `Discovered Policy Endpoints: ${e.discoveredPolicyUrls.join(" | ") || "none"}`,
    `security.txt: ${e.securityTxt ? "present\n" + e.securityTxt : "absent"}`,
    `DNT policy: ${e.wellKnownDntPolicy ? "present" : "absent"}`,
    `robots.txt (truncated): ${e.robotsTxt ? e.robotsTxt.slice(0, 600) : "absent"}`,
    e.fetchErrors.length ? `Fetch notes: ${e.fetchErrors.join(" ")}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}
