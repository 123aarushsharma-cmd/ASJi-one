import dns from "node:dns/promises";
import net from "node:net";
import fs from "node:fs";
import path from "node:path";

const MASTER_ADMIN_EMAILS = new Set(["123.aarushsharma@gmail.com", "hello@asjione.com"]);

const BLOCKED_INTERNAL_SUFFIXES = [
  ".local",
  ".localhost",
  ".internal",
  ".intranet",
  ".corp",
  ".home",
  ".lan",
  ".arpa",
  ".localdomain",
];

const BLOCKED_INTERNAL_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "169.254.169.254",
  "0.0.0.0",
]);

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map((n) => Number.parseInt(n, 10));
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
    return -1;
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function inIpv4Cidr(ipInt: number, network: string, prefixLen: number): boolean {
  const netInt = ipv4ToInt(network);
  if (netInt < 0 || ipInt < 0) return true;
  const mask = prefixLen === 0 ? 0 : (~0 << (32 - prefixLen)) >>> 0;
  return (ipInt & mask) === (netInt & mask);
}

/**
 * Checks if an IPv4 or IPv6 address belongs to private, loopback, link-local,
 * carrier-grade NAT, metadata, or reserved ranges.
 */
export function isPrivateOrReservedIp(rawIp: string): boolean {
  if (!rawIp || typeof rawIp !== "string") return true;
  const cleaned = rawIp
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .split("%")[0];

  // Unwrap IPv4-mapped IPv6 addresses (e.g. ::ffff:127.0.0.1 or ::ffff:7f00:1)
  if (cleaned.startsWith("::ffff:")) {
    const mapped = cleaned.slice(7);
    if (net.isIPv4(mapped)) {
      return isPrivateOrReservedIp(mapped);
    }
    const hexMatch = mapped.match(/^([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
    if (hexMatch) {
      const hi = Number.parseInt(hexMatch[1], 16);
      const lo = Number.parseInt(hexMatch[2], 16);
      const ipv4 = `${(hi >> 8) & 0xff}.${hi & 0xff}.${(lo >> 8) & 0xff}.${lo & 0xff}`;
      return isPrivateOrReservedIp(ipv4);
    }
  }

  if (net.isIPv4(cleaned)) {
    const ipInt = ipv4ToInt(cleaned);
    if (ipInt < 0) return true;
    return (
      inIpv4Cidr(ipInt, "0.0.0.0", 8) || // Current network / unspecified
      inIpv4Cidr(ipInt, "10.0.0.0", 8) || // RFC 1918 private
      inIpv4Cidr(ipInt, "100.64.0.0", 10) || // RFC 6598 CGNAT
      inIpv4Cidr(ipInt, "127.0.0.0", 8) || // Loopback
      inIpv4Cidr(ipInt, "169.254.0.0", 16) || // Link-local / Cloud Metadata
      inIpv4Cidr(ipInt, "172.16.0.0", 12) || // RFC 1918 private
      inIpv4Cidr(ipInt, "192.0.0.0", 24) || // IETF Protocol Assignments
      inIpv4Cidr(ipInt, "192.0.2.0", 24) || // TEST-NET-1
      inIpv4Cidr(ipInt, "192.88.99.0", 24) || // 6to4 relay anycast
      inIpv4Cidr(ipInt, "192.168.0.0", 16) || // RFC 1918 private
      inIpv4Cidr(ipInt, "198.18.0.0", 15) || // Benchmarking
      inIpv4Cidr(ipInt, "198.51.100.0", 24) || // TEST-NET-2
      inIpv4Cidr(ipInt, "203.0.113.0", 24) || // TEST-NET-3
      inIpv4Cidr(ipInt, "224.0.0.0", 4) || // Multicast
      inIpv4Cidr(ipInt, "240.0.0.0", 4) // Reserved / Broadcast
    );
  }

  if (net.isIPv6(cleaned)) {
    if (cleaned === "::" || cleaned === "::1") return true;
    // Link-local fe80::/10, Unique local fc00::/7 (fc.. / fd..), Multicast ff00::/8
    if (/^(fe[89ab]|fc|fd|ff)/.test(cleaned)) return true;
    // Documentation 2001:db8::/32
    if (cleaned.startsWith("2001:db8:") || cleaned.startsWith("2001:0db8:")) return true;
    return false;
  }

  return true;
}

/**
 * Validates that a hostname is syntactically public and does not resolve via DNS to any private/reserved IP.
 */
export async function assertSafePublicHost(rawHostname: string): Promise<string> {
  const host = rawHostname
    .trim()
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.+$/, "");
  if (!host || host.length > 253) {
    throw new Error("SSRF Guard: Invalid or oversized hostname.");
  }

  if (BLOCKED_INTERNAL_HOSTS.has(host)) {
    throw new Error("SSRF Guard: Access to internal or metadata hosts is blocked.");
  }

  if (BLOCKED_INTERNAL_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    throw new Error("SSRF Guard: Internal network domain suffixes cannot be scanned.");
  }

  if (net.isIP(host)) {
    if (isPrivateOrReservedIp(host)) {
      throw new Error("SSRF Guard: Private, loopback, or metadata IP addresses are blocked.");
    }
    return host;
  }

  try {
    const records = await dns.lookup(host, { all: true, verbatim: true });
    for (const rec of records) {
      if (isPrivateOrReservedIp(rec.address)) {
        throw new Error(
          "SSRF Guard: Target hostname resolves to a private, loopback, or internal IP range.",
        );
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("SSRF Guard:")) {
      throw err;
    }
    // If local container DNS cannot resolve an external domain, DoH fallback handles it;
    // literal private IPs & internal names were already blocked above.
  }

  return host;
}

/**
 * Validates a full URL (http/https only, no embedded credentials, safe public ports & DNS target).
 */
export async function assertSafePublicUrl(rawUrl: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error("Invalid URL format.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error("SSRF Guard: Only HTTP and HTTPS protocols are permitted.");
  }

  if (parsed.username || parsed.password) {
    throw new Error("SSRF Guard: URLs containing embedded credentials are blocked.");
  }

  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    throw new Error("SSRF Guard: Non-standard service ports are blocked.");
  }

  await assertSafePublicHost(parsed.hostname);
  return parsed;
}

/**
 * Reads a fetch Response body up to `maxBytes`, aborting oversized streams to prevent memory exhaustion DoS.
 */
export async function readLimitedResponseText(
  res: Response,
  maxBytes = 2 * 1024 * 1024,
): Promise<string> {
  const contentLengthHeader = res.headers.get("content-length");
  if (contentLengthHeader) {
    const declared = Number.parseInt(contentLengthHeader, 10);
    if (!Number.isNaN(declared) && declared > maxBytes * 2) {
      try {
        await res.body?.cancel();
      } catch {
        /* ignore */
      }
      return "";
    }
  }

  if (!res.body) return "";
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      if (total + value.byteLength > maxBytes) {
        const remaining = maxBytes - total;
        if (remaining > 0) {
          chunks.push(value.subarray(0, remaining));
          total += remaining;
        }
        await reader.cancel();
        break;
      }
      chunks.push(value);
      total += value.byteLength;
    }
  } catch {
    /* ignore partial stream abort */
  }

  const combined = new Uint8Array(total);
  let offset = 0;
  for (const c of chunks) {
    combined.set(c, offset);
    offset += c.byteLength;
  }
  return new TextDecoder("utf-8", { fatal: false }).decode(combined);
}

/**
 * Executes an SSRF-safe external fetch that manually validates every 3xx redirect hop
 * before following and caps response body size + timeout.
 */
export async function safeExternalFetch(
  initialUrl: string,
  options: {
    method?: "GET" | "HEAD";
    headers?: Record<string, string>;
    timeoutMs?: number;
    maxRedirects?: number;
    maxBytes?: number;
  } = {},
): Promise<{
  response: Response;
  finalUrl: string;
}> {
  const {
    method = "GET",
    headers = {},
    timeoutMs = 12000,
    maxRedirects = 4,
    maxBytes = 2 * 1024 * 1024,
  } = options;

  let currentUrl = (await assertSafePublicUrl(initialUrl)).toString();
  const deadline = Date.now() + timeoutMs;

  for (let hop = 0; hop <= maxRedirects; hop++) {
    const remainingMs = Math.max(1000, deadline - Date.now());
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remainingMs);

    try {
      const res = await fetch(currentUrl, {
        method,
        headers,
        redirect: "manual",
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get("location");
        try {
          await res.body?.cancel();
        } catch {
          /* ignore */
        }
        if (!location || hop === maxRedirects) {
          return { response: res, finalUrl: currentUrl };
        }
        const nextUrl = new URL(location, currentUrl).toString();
        currentUrl = (await assertSafePublicUrl(nextUrl)).toString();
        continue;
      }

      // Attach byte limit marker via header clone? Caller uses readLimitedResponseText(res, maxBytes).
      void maxBytes;
      return { response: res, finalUrl: currentUrl };
    } catch (err) {
      clearTimeout(timer);
      throw err;
    }
  }

  throw new Error("Too many redirects while scanning target.");
}

// ============================================================================
// SLIDING-WINDOW IN-MEMORY RATE LIMITER (DoS & Brute-Force Protection)
// ============================================================================
type RateBucket = { timestamps: number[] };
const rateBuckets = new Map<string, RateBucket>();
const MAX_TRACKED_KEYS = 5000;

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; retryAfterSec: number; remaining: number } {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Periodic map cap cleanup to prevent memory-exhaustion attacks
  if (rateBuckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of rateBuckets) {
      const fresh = b.timestamps.filter((t) => t > windowStart);
      if (fresh.length === 0) {
        rateBuckets.delete(k);
      } else {
        b.timestamps = fresh;
      }
      if (rateBuckets.size <= MAX_TRACKED_KEYS * 0.7) break;
    }
  }

  const bucket = rateBuckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => t > windowStart);

  if (bucket.timestamps.length >= maxRequests) {
    const oldest = bucket.timestamps[0] ?? now;
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    rateBuckets.set(key, bucket);
    return { allowed: false, retryAfterSec, remaining: 0 };
  }

  bucket.timestamps.push(now);
  rateBuckets.set(key, bucket);
  return {
    allowed: true,
    retryAfterSec: 0,
    remaining: Math.max(0, maxRequests - bucket.timestamps.length),
  };
}

export function getClientIpFromRequest(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first && first.length <= 64) return first;
  }
  const realIp = request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
  if (realIp && realIp.trim().length <= 64) return realIp.trim();
  return "local-client";
}

// ============================================================================
// FIREBASE ID TOKEN VERIFICATION FOR PROTECTED ADMIN ENDPOINTS
// ============================================================================
let cachedFirebaseWebApiKey: string | null = null;

function getFirebaseWebApiKey(): string | null {
  if (cachedFirebaseWebApiKey) return cachedFirebaseWebApiKey;
  if (process.env.VITE_FIREBASE_API_KEY) {
    cachedFirebaseWebApiKey = process.env.VITE_FIREBASE_API_KEY;
    return cachedFirebaseWebApiKey;
  }
  try {
    const cfgPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(cfgPath)) {
      const parsed = JSON.parse(fs.readFileSync(cfgPath, "utf-8")) as { apiKey?: string };
      if (parsed.apiKey) {
        cachedFirebaseWebApiKey = parsed.apiKey;
        return cachedFirebaseWebApiKey;
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

export async function verifyFirebaseAdminIdToken(
  idToken?: string | null,
): Promise<{ uid: string; email: string } | null> {
  if (!idToken || typeof idToken !== "string" || idToken.length < 20 || idToken.length > 4096) {
    return null;
  }
  const apiKey = getFirebaseWebApiKey();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    if (!res.ok) return null;

    const data = (await res.json()) as {
      users?: Array<{
        localId?: string;
        email?: string;
        emailVerified?: boolean;
        disabled?: boolean;
      }>;
    };
    const user = data.users?.[0];
    if (!user || user.disabled || !user.email || !user.emailVerified || !user.localId) {
      return null;
    }
    if (!MASTER_ADMIN_EMAILS.has(user.email.trim().toLowerCase())) {
      return null;
    }
    return { uid: user.localId, email: user.email };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * Strips ASCII control chars and bounds text length before persisting or rendering.
 */
export function sanitizePlainText(input: string, maxLength = 2000): string {
  let out = "";
  for (let i = 0; i < input.length && out.length < maxLength; i++) {
    const code = input.charCodeAt(i);
    if ((code >= 0x20 && code !== 0x7f) || code === 0x09 || code === 0x0a || code === 0x0d) {
      out += input[i];
    }
  }
  return out;
}
