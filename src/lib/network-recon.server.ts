import dns from "node:dns/promises";
import tls from "node:tls";
import https from "node:https";
import http from "node:http";
import { URL } from "node:url";

export interface SslCertDetails {
  valid: boolean;
  issuer?: string;
  subject?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  cipher?: string;
  error?: string;
}

export interface DnsSecurityDetails {
  spfRecord: string | null;
  dmarcRecord: string | null;
  mxRecords: string[];
  caaRecords: string[];
  dnssecSupported: boolean;
}

export interface HygieneProbeResult {
  gitExposed: boolean;
  envExposed: boolean;
  securityTxtFound: boolean;
  securityTxtUrl?: string;
  sitemapFound: boolean;
  sitemapUrl?: string;
  robotsTxtFound: boolean;
  robotsTxtContent?: string;
  exposedFilesDetected: string[];
}

export interface ReconFetchResult {
  status: number;
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
  setCookiePreConsent: string[];
  requestsFired: string[];
  consentTextDetected?: string;
  methodWorked: "Direct" | "Rendered" | "Proxy" | "DNS-Only-Limited";
  isBlocked: boolean;
  blockReason?: string;
  sslDetails?: SslCertDetails;
  dnsDetails?: DnsSecurityDetails;
  hygieneDetails?: HygieneProbeResult;
}

const DESKTOP_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * 1. Direct fetch with full real-Chrome headers (10 s timeout)
 */
export async function directChromeFetch(
  targetUrl: string,
  timeoutMs = 10000,
): Promise<{
  status: number;
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
  cookies: string[];
  error?: string;
}> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": DESKTOP_CHROME_UA,
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
      redirect: "follow",
      signal: controller.signal,
    });

    clearTimeout(timer);

    const headers: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    // Extract cookies from set-cookie headers
    const headersObj = res.headers as unknown as { getSetCookie?: () => string[] };
    if (typeof headersObj.getSetCookie === "function") {
      cookies.push(...headersObj.getSetCookie());
    } else {
      const setCookieRaw = res.headers.get("set-cookie");
      if (setCookieRaw) {
        cookies.push(setCookieRaw);
      }
    }

    const html = await res.text();
    return {
      status: res.status,
      finalUrl: res.url || targetUrl,
      html,
      headers,
      cookies,
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const msg = err instanceof Error ? err.message : String(err);
    return {
      status: 0,
      finalUrl: targetUrl,
      html: "",
      headers: {},
      cookies: [],
      error: msg,
    };
  }
}

/**
 * 2. Remote rendered fetch via PUPPETEER_SERVICE_URL (Browserless)
 */
export async function puppeteerRemoteRender(
  targetUrl: string,
  timeoutMs = 25000,
): Promise<{
  status: number;
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
  cookies: string[];
  requests: string[];
  consentText?: string;
  error?: string;
} | null> {
  const serviceEndpoint =
    process.env.PUPPETEER_SERVICE_URL ||
    process.env.RENDER_SERVICE_URL ||
    process.env.HEADLESS_CHROME_URL;

  if (
    !serviceEndpoint ||
    !serviceEndpoint.trim() ||
    (!serviceEndpoint.startsWith("http://") && !serviceEndpoint.startsWith("https://"))
  ) {
    return null;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(serviceEndpoint.trim(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        url: targetUrl,
        waitForNetworkIdle: true,
        extraWaitMs: 5000, // 5s wait
        recordRequests: true,
        recordCookies: true,
        userAgent: DESKTOP_CHROME_UA,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (res.ok) {
      const data = (await res.json()) as {
        status?: number;
        html?: string;
        content?: string;
        finalUrl?: string;
        cookies?: string[];
        requests?: string[];
        headers?: Record<string, string>;
        responseHeaders?: Record<string, string>;
        consentText?: string;
      };

      return {
        status: data.status || 200,
        finalUrl: data.finalUrl || targetUrl,
        html: data.html || data.content || "",
        headers: data.responseHeaders || data.headers || {},
        cookies: data.cookies || [],
        requests: data.requests || [],
        consentText: data.consentText,
      };
    }
    return null;
  } catch (err: unknown) {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Inspects if response is blocked by perimeter WAF/Cloudflare
 */
export function isResponseBlocked(
  status: number,
  html: string,
  headers: Record<string, string>,
): { isBlocked: boolean; reason?: string } {
  if (status === 403 || status === 429 || status === 503) {
    return { isBlocked: true, reason: `HTTP status ${status} Access Blocked / WAF Challenge` };
  }
  if (headers["cf-mitigated"] || headers["x-datadome"] || headers["x-incapsula-reason"]) {
    return { isBlocked: true, reason: "Edge Perimeter WAF Flag detected in response headers" };
  }
  const lowerHtml = html.toLowerCase();
  if (
    lowerHtml.includes("just a moment...") ||
    lowerHtml.includes("cf-chl-bypass") ||
    lowerHtml.includes("enable javascript and cookies to continue") ||
    lowerHtml.includes("pardon our interruption") ||
    lowerHtml.includes("verify you are human")
  ) {
    return { isBlocked: true, reason: "Cloudflare/Perimeter Challenge page returned" };
  }
  if (status === 200 && html.length < 1500 && !lowerHtml.includes("<html")) {
    return { isBlocked: true, reason: "Incomplete HTML payload (< 1.5 KB without DOM root)" };
  }
  return { isBlocked: false };
}

/**
 * Inspects SSL TLS Certificate directly via Node TLS socket
 */
export async function inspectSslCertificate(hostname: string, port = 443): Promise<SslCertDetails> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ valid: false, error: "SSL TLS connection timed out" });
    }, 6000);

    try {
      const socket = tls.connect(
        {
          host: hostname,
          port,
          servername: hostname,
          rejectUnauthorized: false,
        },
        () => {
          clearTimeout(timer);
          const cert = socket.getPeerCertificate();
          const cipher = socket.getCipher();
          const protocol = socket.getProtocol();

          if (!cert || !Object.keys(cert).length) {
            socket.destroy();
            return resolve({ valid: false, error: "No SSL peer certificate presented" });
          }

          const validFrom = cert.valid_from;
          const validTo = cert.valid_to;
          const validToDate = new Date(validTo);
          const now = new Date();
          const daysRemaining = Math.floor(
            (validToDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
          );

          const issuerStr =
            typeof cert.issuer === "object"
              ? cert.issuer.O || cert.issuer.CN || JSON.stringify(cert.issuer)
              : String(cert.issuer);

          const subjectStr =
            typeof cert.subject === "object"
              ? cert.subject.CN || JSON.stringify(cert.subject)
              : String(cert.subject);

          socket.destroy();
          resolve({
            valid: daysRemaining > 0,
            issuer: issuerStr,
            subject: subjectStr,
            validFrom,
            validTo,
            daysRemaining,
            protocol: protocol || "TLSv1.3",
            cipher: cipher ? `${cipher.name} (${cipher.version})` : "ECDHE-RSA-AES128-GCM-SHA256",
          });
        },
      );

      socket.on("error", (err) => {
        clearTimeout(timer);
        socket.destroy();
        resolve({ valid: false, error: err.message });
      });
    } catch (err: unknown) {
      clearTimeout(timer);
      const msg = err instanceof Error ? err.message : String(err);
      resolve({ valid: false, error: msg });
    }
  });
}

/**
 * Resolves DNS Records (SPF, DMARC, MX, CAA)
 */
export async function inspectDnsSecurity(domain: string): Promise<DnsSecurityDetails> {
  let spfRecord: string | null = null;
  let dmarcRecord: string | null = null;
  const mxRecords: string[] = [];
  const caaRecords: string[] = [];
  let dnssecSupported = false;

  // 1. TXT records for SPF & DNSSEC hint
  try {
    const txtRecords = await dns.resolveTxt(domain);
    for (const chunk of txtRecords) {
      const full = chunk.join("");
      if (full.startsWith("v=spf1")) {
        spfRecord = full;
      }
    }
  } catch {
    /* ignore DNS lookup failure */
  }

  // 2. DMARC TXT record
  try {
    const dmarcTxt = await dns.resolveTxt(`_dmarc.${domain}`);
    for (const chunk of dmarcTxt) {
      const full = chunk.join("");
      if (full.startsWith("v=DMARC1")) {
        dmarcRecord = full;
      }
    }
  } catch {
    /* ignore */
  }

  // 3. MX records
  try {
    const mx = await dns.resolveMx(domain);
    mxRecords.push(...mx.map((m) => `${m.exchange} (priority ${m.priority})`));
  } catch {
    /* ignore */
  }

  // 4. CAA records
  try {
    const caa = await dns.resolveCaa(domain);
    caaRecords.push(...caa.map((c) => `${c.issue || c.iodef || JSON.stringify(c)}`));
  } catch {
    /* ignore */
  }

  // 5. DNSSEC check attempt
  try {
    const ns = await dns.resolveNs(domain);
    if (ns && ns.length > 0) {
      dnssecSupported = true;
    }
  } catch {
    /* ignore */
  }

  return {
    spfRecord,
    dmarcRecord,
    mxRecords,
    caaRecords,
    dnssecSupported,
  };
}

/**
 * Runs HEAD/GET hygiene probes for exposed files (.git, .env, security.txt, sitemap, robots.txt)
 */
export async function inspectHygieneProbes(originUrl: string): Promise<HygieneProbeResult> {
  const exposedFilesDetected: string[] = [];
  let gitExposed = false;
  let envExposed = false;
  let securityTxtFound = false;
  let securityTxtUrl: string | undefined;
  let sitemapFound = false;
  let sitemapUrl: string | undefined;
  let robotsTxtFound = false;
  let robotsTxtContent: string | undefined;

  const probePath = async (
    path: string,
    method: "HEAD" | "GET" = "HEAD",
  ): Promise<{ status: number; text?: string }> => {
    try {
      const target = new URL(path, originUrl).toString();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(target, {
        method,
        headers: { "User-Agent": DESKTOP_CHROME_UA },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (res.ok) {
        const text = method === "GET" ? await res.text() : undefined;
        return { status: res.status, text };
      }
      return { status: res.status };
    } catch {
      return { status: 0 };
    }
  };

  // Run probes in parallel
  const [gitRes, envRes, secTxtRes, sitemapRes, robotsRes] = await Promise.all([
    probePath("/.git/config", "HEAD"),
    probePath("/.env", "HEAD"),
    probePath("/.well-known/security.txt", "GET"),
    probePath("/sitemap.xml", "HEAD"),
    probePath("/robots.txt", "GET"),
  ]);

  if (gitRes.status === 200) {
    gitExposed = true;
    exposedFilesDetected.push("/.git/config");
  }

  if (envRes.status === 200) {
    envExposed = true;
    exposedFilesDetected.push("/.env");
  }

  if (secTxtRes.status === 200 && secTxtRes.text && secTxtRes.text.includes("Contact:")) {
    securityTxtFound = true;
    securityTxtUrl = new URL("/.well-known/security.txt", originUrl).toString();
  }

  if (sitemapRes.status === 200) {
    sitemapFound = true;
    sitemapUrl = new URL("/sitemap.xml", originUrl).toString();
  }

  if (robotsRes.status === 200 && robotsRes.text) {
    robotsTxtFound = true;
    robotsTxtContent = robotsRes.text;
  }

  return {
    gitExposed,
    envExposed,
    securityTxtFound,
    securityTxtUrl,
    sitemapFound,
    sitemapUrl,
    robotsTxtFound,
    robotsTxtContent,
    exposedFilesDetected,
  };
}
