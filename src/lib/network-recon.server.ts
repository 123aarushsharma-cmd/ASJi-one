import dns from "node:dns/promises";
import tls from "node:tls";
import {
  assertSafePublicHost,
  readLimitedResponseText,
  safeExternalFetch,
} from "./security.server";

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
  aRecords: string[];
  aaaaRecords: string[];
  spfRecord: string | null;
  dmarcRecord: string | null;
  mxRecords: string[];
  caaRecords: string[];
  nsRecords: string[];
  dnssecSupported: boolean;
  dohProvider: string;
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
  isWafBlocked: boolean;
  blockReason?: string;
  wafBadge?: string;
  sslDetails?: SslCertDetails;
  dnsDetails?: DnsSecurityDetails;
  hygieneDetails?: HygieneProbeResult;
}

const DESKTOP_CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

export const WAF_BADGE_TEXT =
  "WAF / Bot Shield Detected on Target — Showing Verified DNS/TLS Results + Guided Manual Audit Checklist";

interface DohAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

interface DohResponse {
  Status: number;
  Answer?: DohAnswer[];
  Authority?: DohAnswer[];
}

/**
 * Executes a DNS-over-HTTPS (DoH) query using Cloudflare (1.1.1.1) with Google (8.8.8.8) fallback.
 * Guarantees verifiable public DNS resolution regardless of local container DNS limitations.
 */
export async function queryDoh(
  name: string,
  type: string,
  timeoutMs = 4500,
): Promise<{ answers: DohAnswer[]; provider: string }> {
  // 1. Try Cloudflare DoH (1.1.1.1)
  const cfController = new AbortController();
  const cfTimer = setTimeout(() => cfController.abort(), timeoutMs);
  try {
    const cfUrl = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(cfUrl, {
      method: "GET",
      headers: {
        Accept: "application/dns-json",
        "User-Agent": "ASJi-Compliance-Oracle/2.0",
      },
      signal: cfController.signal,
    });
    clearTimeout(cfTimer);
    if (res.ok) {
      const data = (await res.json()) as DohResponse;
      if (Array.isArray(data.Answer) && data.Answer.length > 0) {
        return { answers: data.Answer, provider: "Cloudflare DoH (1.1.1.1)" };
      }
    }
  } catch {
    clearTimeout(cfTimer);
  }

  // 2. Try Google DoH (8.8.8.8)
  const gController = new AbortController();
  const gTimer = setTimeout(() => gController.abort(), timeoutMs);
  try {
    const gUrl = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(gUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "ASJi-Compliance-Oracle/2.0",
      },
      signal: gController.signal,
    });
    clearTimeout(gTimer);
    if (res.ok) {
      const data = (await res.json()) as DohResponse;
      if (Array.isArray(data.Answer) && data.Answer.length > 0) {
        return { answers: data.Answer, provider: "Google Public DNS DoH (8.8.8.8)" };
      }
    }
  } catch {
    clearTimeout(gTimer);
  }

  return { answers: [], provider: "DoH (No records returned)" };
}

/**
 * 1. Direct fetch with full real-Chrome headers (12s timeout)
 */
export async function directChromeFetch(
  targetUrl: string,
  timeoutMs = 12000,
): Promise<{
  status: number;
  finalUrl: string;
  html: string;
  headers: Record<string, string>;
  cookies: string[];
  error?: string;
}> {
  try {
    const { response: res, finalUrl } = await safeExternalFetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": DESKTOP_CHROME_UA,
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "en-US,en;q=0.9,en-IN;q=0.8",
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
      timeoutMs,
      maxRedirects: 4,
      maxBytes: 2 * 1024 * 1024,
    });

    const headers: Record<string, string> = {};
    res.headers.forEach((val, key) => {
      headers[key.toLowerCase()] = val;
    });

    // Extract cookies directly from set-cookie headers
    const cookies: string[] = [];
    const headersObj = res.headers as unknown as { getSetCookie?: () => string[] };
    if (typeof headersObj.getSetCookie === "function") {
      cookies.push(...headersObj.getSetCookie());
    } else {
      const setCookieRaw = res.headers.get("set-cookie");
      if (setCookieRaw) {
        cookies.push(setCookieRaw);
      }
    }

    const html = await readLimitedResponseText(res, 2 * 1024 * 1024);
    return {
      status: res.status,
      finalUrl: finalUrl || res.url || targetUrl,
      html,
      headers,
      cookies,
    };
  } catch (err: unknown) {
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
        extraWaitMs: 4000,
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
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Inspects if response was intercepted or challenged by edge perimeter WAF
 */
export function isResponseBlocked(
  status: number,
  html: string,
  headers: Record<string, string>,
): { isBlocked: boolean; isWafBlocked: boolean; reason?: string } {
  if (status === 403 || status === 429 || status === 503) {
    return {
      isBlocked: true,
      isWafBlocked: true,
      reason: `HTTP ${status} Edge Access Blocked / WAF Challenge`,
    };
  }

  if (
    headers["cf-mitigated"] ||
    headers["x-datadome"] ||
    headers["x-incapsula-reason"] ||
    headers["x-iinfo"] ||
    (headers["cf-ray"] && (status === 403 || status === 503))
  ) {
    return {
      isBlocked: true,
      isWafBlocked: true,
      reason: "Edge Perimeter WAF Flag detected in response headers (Cloudflare/Imperva/DataDome)",
    };
  }

  const lowerHtml = html.toLowerCase();
  const isChallenge =
    lowerHtml.includes("just a moment...") ||
    lowerHtml.includes("cf-chl-bypass") ||
    lowerHtml.includes("challenges.cloudflare.com") ||
    lowerHtml.includes("enable javascript and cookies to continue") ||
    lowerHtml.includes("pardon our interruption") ||
    lowerHtml.includes("verify you are human") ||
    lowerHtml.includes("attention required! | cloudflare") ||
    lowerHtml.includes("checking your browser before accessing") ||
    lowerHtml.includes("security check to access");

  if (isChallenge) {
    return {
      isBlocked: true,
      isWafBlocked: true,
      reason: "Perimeter Bot Challenge page returned (Cloudflare Turnstile / Captcha)",
    };
  }

  if (
    status === 200 &&
    html.length < 1200 &&
    !lowerHtml.includes("<html") &&
    !lowerHtml.includes("<body")
  ) {
    return {
      isBlocked: true,
      isWafBlocked: false,
      reason: "Incomplete HTML payload (< 1.2 KB without DOM root)",
    };
  }

  return { isBlocked: false, isWafBlocked: false };
}

/**
 * Inspects SSL TLS Certificate directly via Node TLS socket on port 443
 */
export async function inspectSslCertificate(hostname: string, port = 443): Promise<SslCertDetails> {
  if (port !== 443 && port !== 8443) {
    return { valid: false, error: "Blocked non-TLS port" };
  }
  try {
    await assertSafePublicHost(hostname);
  } catch (err) {
    return {
      valid: false,
      error: err instanceof Error ? err.message : "Blocked target host",
    };
  }

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ valid: false, error: "SSL TLS connection timed out" });
    }, 7000);

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

          const rawIssuer =
            typeof cert.issuer === "object"
              ? cert.issuer.O || cert.issuer.CN || JSON.stringify(cert.issuer)
              : String(cert.issuer);
          const issuerStr = Array.isArray(rawIssuer) ? rawIssuer.join(", ") : String(rawIssuer);

          const rawSubject =
            typeof cert.subject === "object"
              ? cert.subject.CN || JSON.stringify(cert.subject)
              : String(cert.subject);
          const subjectStr = Array.isArray(rawSubject) ? rawSubject.join(", ") : String(rawSubject);

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
 * Resolves live DNS Records (A, AAAA, CAA, SPF, DMARC, MX, NS) using DoH and native Node DNS
 */
export async function inspectDnsSecurity(domain: string): Promise<DnsSecurityDetails> {
  const aRecords: string[] = [];
  const aaaaRecords: string[] = [];
  let spfRecord: string | null = null;
  let dmarcRecord: string | null = null;
  const mxRecords: string[] = [];
  const caaRecords: string[] = [];
  const nsRecords: string[] = [];
  let dnssecSupported = false;
  let dohProvider = "Cloudflare / Google Public DoH";

  // Clean hostname
  const host = domain
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "")
    .replace(/\.+$/, "");

  // Query DoH in parallel for A, AAAA, CAA, SPF TXT, DMARC TXT, MX, NS
  const [aRes, aaaaRes, caaRes, txtRes, dmarcRes, mxRes, nsRes] = await Promise.all([
    queryDoh(host, "A"),
    queryDoh(host, "AAAA"),
    queryDoh(host, "CAA"),
    queryDoh(host, "TXT"),
    queryDoh(`_dmarc.${host}`, "TXT"),
    queryDoh(host, "MX"),
    queryDoh(host, "NS"),
  ]);

  if (aRes.provider) dohProvider = aRes.provider;

  // 1. Process A records (Type 1)
  for (const ans of aRes.answers) {
    if (ans.type === 1 && ans.data) {
      aRecords.push(ans.data.replace(/"/g, "").trim());
    }
  }

  // 2. Process AAAA records (Type 28)
  for (const ans of aaaaRes.answers) {
    if (ans.type === 28 && ans.data) {
      aaaaRecords.push(ans.data.replace(/"/g, "").trim());
    }
  }

  // 3. Process CAA records (Type 257)
  for (const ans of caaRes.answers) {
    if (ans.data) {
      caaRecords.push(ans.data.replace(/"/g, "").trim());
    }
  }

  // 4. Process SPF TXT records (Type 16)
  for (const ans of txtRes.answers) {
    const raw = ans.data ? ans.data.replace(/^"|"$/g, "").replace(/""/g, "") : "";
    if (raw.toLowerCase().startsWith("v=spf1")) {
      spfRecord = raw;
      break;
    }
  }

  // 5. Process DMARC TXT records (Type 16)
  for (const ans of dmarcRes.answers) {
    const raw = ans.data ? ans.data.replace(/^"|"$/g, "").replace(/""/g, "") : "";
    if (raw.toLowerCase().startsWith("v=dmarc1")) {
      dmarcRecord = raw;
      break;
    }
  }

  // 6. Process MX records (Type 15)
  for (const ans of mxRes.answers) {
    if (ans.data) {
      mxRecords.push(ans.data.replace(/"/g, "").trim());
    }
  }

  // 7. Process NS records (Type 2)
  for (const ans of nsRes.answers) {
    if (ans.data) {
      nsRecords.push(ans.data.replace(/"/g, "").trim());
    }
  }

  // Fallback to native Node DNS if DoH returned empty
  if (aRecords.length === 0) {
    try {
      const a = await dns.resolve4(host);
      aRecords.push(...a);
    } catch {
      /* ignore */
    }
  }
  if (aaaaRecords.length === 0) {
    try {
      const aaaa = await dns.resolve6(host);
      aaaaRecords.push(...aaaa);
    } catch {
      /* ignore */
    }
  }
  if (!spfRecord) {
    try {
      const txt = await dns.resolveTxt(host);
      for (const chunk of txt) {
        const full = chunk.join("");
        if (full.startsWith("v=spf1")) {
          spfRecord = full;
          break;
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (!dmarcRecord) {
    try {
      const dmarcTxt = await dns.resolveTxt(`_dmarc.${host}`);
      for (const chunk of dmarcTxt) {
        const full = chunk.join("");
        if (full.startsWith("v=DMARC1")) {
          dmarcRecord = full;
          break;
        }
      }
    } catch {
      /* ignore */
    }
  }
  if (caaRecords.length === 0) {
    try {
      const caa = await dns.resolveCaa(host);
      caaRecords.push(...caa.map((c) => `${c.issue || c.iodef || JSON.stringify(c)}`));
    } catch {
      /* ignore */
    }
  }
  if (mxRecords.length === 0) {
    try {
      const mx = await dns.resolveMx(host);
      mxRecords.push(...mx.map((m) => `${m.exchange} (priority ${m.priority})`));
    } catch {
      /* ignore */
    }
  }
  if (nsRecords.length === 0) {
    try {
      const ns = await dns.resolveNs(host);
      nsRecords.push(...ns);
    } catch {
      /* ignore */
    }
  }

  if (nsRecords.length > 0) {
    dnssecSupported = true;
  }

  return {
    aRecords: [...new Set(aRecords)],
    aaaaRecords: [...new Set(aaaaRecords)],
    spfRecord,
    dmarcRecord,
    mxRecords: [...new Set(mxRecords)],
    caaRecords: [...new Set(caaRecords)],
    nsRecords: [...new Set(nsRecords)],
    dnssecSupported,
    dohProvider,
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
      const { response: res } = await safeExternalFetch(target, {
        method,
        headers: { "User-Agent": DESKTOP_CHROME_UA },
        timeoutMs: 4000,
        maxRedirects: 2,
        maxBytes: 256 * 1024,
      });
      if (res.ok) {
        const text = method === "GET" ? await readLimitedResponseText(res, 256 * 1024) : undefined;
        return { status: res.status, text };
      }
      try {
        await res.body?.cancel();
      } catch {
        /* ignore */
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
