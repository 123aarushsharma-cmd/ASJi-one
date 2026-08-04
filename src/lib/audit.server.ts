/** Server-only reconnaissance helpers: gathers real evidence about a live website. */

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

async function safeFetch(url: string, timeoutMs = 6000): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; ASJiOneComplianceBot/1.0; +https://asji.one/bot)",
        Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function gatherSiteEvidence(rawUrl: string): Promise<SiteEvidence> {
  const target = new URL(rawUrl);
  const fetchErrors: string[] = [];

  let response = await safeFetch(target.toString());
  let httpsUpgrade = false;

  if (!response && target.protocol === "https:") {
    const httpUrl = new URL(target.toString());
    httpUrl.protocol = "http:";
    response = await safeFetch(httpUrl.toString());
    if (response) fetchErrors.push("HTTPS request failed; site only answered over plain HTTP.");
  }

  if (!response) {
    throw new Error(
      `Could not reach ${target.hostname}. Check the URL is public and online, or paste infrastructure details instead.`,
    );
  }

  const finalUrl = response.url || target.toString();
  httpsUpgrade = new URL(finalUrl).protocol === "https:";

  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((v, k) => {
    responseHeaders[k.toLowerCase()] = v.slice(0, 400);
  });

  const securityHeaders: Record<string, string | null> = {};
  for (const name of SECURITY_HEADER_NAMES) {
    securityHeaders[name] = responseHeaders[name] ?? null;
  }

  const setCookiePreConsent: string[] = [];
  const rawCookies = (
    response.headers as unknown as { getSetCookie?: () => string[] }
  ).getSetCookie?.();
  if (rawCookies?.length) setCookiePreConsent.push(...rawCookies.map((c) => c.slice(0, 200)));
  else if (responseHeaders["set-cookie"]) setCookiePreConsent.push(responseHeaders["set-cookie"]);

  const cookieFlagAnalysis: string[] = setCookiePreConsent.map((c) => {
    const name = c.split("=")[0] || "cookie";
    const isSecure = /;\s*secure/i.test(c);
    const isHttpOnly = /;\s*httponly/i.test(c);
    const sameSiteMatch = c.match(/;\s*samesite=([a-z]+)/i);
    const sameSite = sameSiteMatch ? sameSiteMatch[1] : "Unset (Default Lax/None)";
    const issues: string[] = [];
    if (!isSecure) issues.push("Missing Secure flag (plaintext vulnerability)");
    if (!isHttpOnly) issues.push("Missing HttpOnly flag (XSS theft exposure)");
    if (!sameSiteMatch) issues.push("SameSite attribute omitted");
    return `${name}: Secure=${isSecure}, HttpOnly=${isHttpOnly}, SameSite=${sameSite}${issues.length ? ` [RISKS: ${issues.join("; ")}]` : " [SECURE]"}`;
  });

  let html = "";
  try {
    html = (await response.text()).slice(0, 400_000);
  } catch {
    fetchErrors.push("Response body could not be read.");
  }

  const hosts = new Set<string>();
  for (const m of html.matchAll(/(?:src|href)=["'](https?:\/\/[^"']+)["']/gi)) {
    try {
      const h = new URL(m[1]).hostname;
      if (h && h !== target.hostname) hosts.add(h);
    } catch {
      /* ignore */
    }
  }

  const trackerSignals = TRACKER_PATTERNS.filter(([re]) => re.test(html)).map(([, label]) => label);
  const consentSignals = CONSENT_PATTERNS.filter(([re]) => re.test(html)).map(([, label]) => label);

  const formsCollectingData: string[] = [];
  for (const m of html.matchAll(
    /<input[^>]+type=["'](email|password|tel|text|number)["'][^>]*>/gi,
  )) {
    const tag = m[0].slice(0, 160);
    const nameMatch = tag.match(/name=["']([^"']+)["']/i);
    formsCollectingData.push(`${m[1]}${nameMatch ? ` (${nameMatch[1]})` : ""}`);
  }

  const policyLinks: string[] = [];
  for (const m of html.matchAll(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]{0,120}?)<\/a>/gi)) {
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

  // Probe common privacy document endpoints if non-obvious
  const origin = new URL(finalUrl).origin;
  const discoveredPolicyUrls: string[] = [];
  const [robotsRes, securityRes, dntRes, privacyProbe, termsProbe] = await Promise.all([
    safeFetch(`${origin}/robots.txt`, 3000),
    safeFetch(`${origin}/.well-known/security.txt`, 3000),
    safeFetch(`${origin}/.well-known/dnt-policy.txt`, 3000),
    safeFetch(`${origin}/privacy`, 3000),
    safeFetch(`${origin}/terms`, 3000),
  ]);

  if (privacyProbe && privacyProbe.ok) discoveredPolicyUrls.push(`${origin}/privacy (HTTP 200 OK)`);
  if (termsProbe && termsProbe.ok) discoveredPolicyUrls.push(`${origin}/terms (HTTP 200 OK)`);

  const metaCspMatch = html.match(
    /<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]+content=["']([^"']*)["']/i,
  );
  const metaCsp = metaCspMatch ? metaCspMatch[1] : null;

  const allowOrigin = responseHeaders["access-control-allow-origin"] || "Not set";
  const allowCredentials = responseHeaders["access-control-allow-credentials"] || "Not set";
  const corsHeaderInfo = `Access-Control-Allow-Origin: ${allowOrigin} | Credentials: ${allowCredentials}`;

  const robotsTxt = robotsRes && robotsRes.ok ? (await robotsRes.text()).slice(0, 1500) : "";
  const securityTxt =
    securityRes && securityRes.ok ? (await securityRes.text()).slice(0, 800) : null;

  const techList: string[] = [];
  if (responseHeaders["server"]) techList.push(`Server: ${responseHeaders["server"]}`);
  if (responseHeaders["x-powered-by"])
    techList.push(`Powered-By: ${responseHeaders["x-powered-by"]}`);
  if (responseHeaders["via"]) techList.push(`Via Proxy: ${responseHeaders["via"]}`);
  if (
    responseHeaders["cf-ray"] ||
    responseHeaders["server"]?.toLowerCase().includes("cloudflare")
  ) {
    techList.push("Infrastructure: Cloudflare CDN / WAF");
  }
  if (responseHeaders["x-vercel-id"] || responseHeaders["x-vercel-cache"]) {
    techList.push("Infrastructure: Vercel Edge Network");
  }
  if (
    responseHeaders["x-amz-cf-id"] ||
    responseHeaders["x-amz-id-2"] ||
    responseHeaders["server"]?.includes("AmazonS3")
  ) {
    techList.push("Infrastructure: Amazon Web Services (AWS)");
  }
  if (responseHeaders["x-nf-request-id"] || responseHeaders["server"]?.includes("Netlify")) {
    techList.push("Infrastructure: Netlify Hosting");
  }
  if (
    responseHeaders["server"]?.includes("gws") ||
    responseHeaders["server"]?.includes("Google") ||
    responseHeaders["x-cloud-trace-context"]
  ) {
    techList.push("Infrastructure: Google Cloud Platform (GCP)");
  }
  if (
    responseHeaders["server"]?.toLowerCase().includes("litespeed") ||
    responseHeaders["x-turbo-charged-by"]?.includes("LiteSpeed") ||
    responseHeaders["hostinger"]
  ) {
    techList.push("Infrastructure: Hostinger / LiteSpeed Server");
  }
  if (responseHeaders["x-shopify-stage"] || responseHeaders["server"]?.includes("shopify")) {
    techList.push("Platform: Shopify E-commerce Engine");
  }
  if (html.includes("wp-content") || html.includes("wp-includes")) {
    techList.push("CMS: WordPress Core");
  }
  if (responseHeaders["x-wix-request-id"]) {
    techList.push("Platform: Wix Web Infrastructure");
  }
  if (responseHeaders["x-served-by"]) {
    techList.push(`Edge Node: ${responseHeaders["x-served-by"]}`);
  }

  const serverTech = techList.length ? techList : ["Standard HTTP Web Infrastructure"];

  return {
    finalUrl,
    host: new URL(finalUrl).hostname,
    statusCode: response.status,
    redirectChainNote:
      finalUrl !== target.toString()
        ? `Redirected ${target.toString()} → ${finalUrl}`
        : "No redirect",
    httpsUpgrade,
    responseHeaders,
    securityHeaders,
    setCookiePreConsent: setCookiePreConsent.slice(0, 20),
    cookieFlagAnalysis: cookieFlagAnalysis.slice(0, 20),
    title: textBetween(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
    metaDescription: textBetween(
      html,
      /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i,
    ),
    htmlLang: textBetween(html, /<html[^>]+lang=["']([^"']+)["']/i),
    thirdPartyHosts: [...hosts].slice(0, 60),
    trackerSignals,
    consentSignals,
    formsCollectingData: [...new Set(formsCollectingData)].slice(0, 20),
    policyLinks: [...new Set(policyLinks)].slice(0, 20),
    discoveredPolicyUrls,
    robotsTxt,
    securityTxt,
    wellKnownDntPolicy: Boolean(dntRes && dntRes.ok),
    metaCsp,
    corsHeaderInfo,
    serverTech: [...new Set(serverTech)],
    fetchErrors,
  };
}

/** Renders evidence into a compact, model-readable dossier. */
export function formatEvidence(e: SiteEvidence): string {
  const missing = Object.entries(e.securityHeaders)
    .filter(([, v]) => v === null)
    .map(([k]) => k);
  const present = Object.entries(e.securityHeaders)
    .filter(([, v]) => v !== null)
    .map(([k, v]) => `${k}: ${v}`);

  return [
    `LIVE SCAN EVIDENCE (fetched just now)`,
    `Final URL: ${e.finalUrl}  |  HTTP ${e.statusCode}  |  ${e.redirectChainNote}`,
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
    `Tracker/third-party SDK signals: ${e.trackerSignals.join(", ") || "none detected"}`,
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
