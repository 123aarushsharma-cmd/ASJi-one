import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { checkRateLimit, getClientIpFromRequest } from "./lib/security.server";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST", "OPTIONS"]);
const MAX_POST_BYTES = 128 * 1024; // 128 KB ceiling for server functions / API posts
const BLOCKED_PATH_SEGMENTS = [
  "/.env",
  "/.git",
  "/.data",
  "/package.json",
  "/package-lock.json",
  "/firebase-applet-config.json",
  "/firestore.rules",
  "/storage.rules",
  "/tsconfig.json",
];

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function isSensitiveOrTraversalPath(pathname: string): boolean {
  let decoded = pathname;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return true; // malformed percent encoding
  }
  const lower = decoded.toLowerCase();
  if (lower.includes("..") || lower.includes("\\") || lower.includes("\0")) {
    return true;
  }
  return BLOCKED_PATH_SEGMENTS.some((seg) => lower === seg || lower.startsWith(`${seg}/`));
}

function isValidPostOrigin(request: Request, requestUrl: URL): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients / curl / SSR internal
  try {
    const originUrl = new URL(origin);
    const reqHost = (request.headers.get("x-forwarded-host") || requestUrl.host).toLowerCase();
    return originUrl.host.toLowerCase() === reqHost;
  } catch {
    return false;
  }
}

function attachSecurityHeaders(res: Response, pathname = "/"): Response {
  const newHeaders = new Headers(res.headers);
  // Strip framework/server fingerprinting headers
  newHeaders.delete("X-Powered-By");
  newHeaders.delete("Server");

  if (!newHeaders.has("X-Content-Type-Options")) {
    newHeaders.set("X-Content-Type-Options", "nosniff");
  }
  if (!newHeaders.has("Referrer-Policy")) {
    newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
  }
  if (!newHeaders.has("Strict-Transport-Security")) {
    newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  }
  if (!newHeaders.has("Permissions-Policy")) {
    newHeaders.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    );
  }
  if (!newHeaders.has("X-Permitted-Cross-Domain-Policies")) {
    newHeaders.set("X-Permitted-Cross-Domain-Policies", "none");
  }
  if (!newHeaders.has("Cross-Origin-Opener-Policy")) {
    // Allow Firebase Auth Google Sign-In popup communication while isolating opener context
    newHeaders.set("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  }
  if (!newHeaders.has("Cross-Origin-Resource-Policy")) {
    newHeaders.set("Cross-Origin-Resource-Policy", "same-origin");
  }
  if (!newHeaders.has("X-XSS-Protection")) {
    newHeaders.set("X-XSS-Protection", "0");
  }
  if (
    (pathname.startsWith("/_serverFn") || pathname.startsWith("/api")) &&
    !newHeaders.has("Cache-Control")
  ) {
    newHeaders.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  }
  if (!newHeaders.has("Content-Security-Policy")) {
    newHeaders.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https: wss:; frame-src 'self' https://*.firebaseapp.com https://accounts.google.com https://*.google.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https:;",
    );
  }
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: newHeaders,
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();

    // 1. Strict HTTP method whitelist
    if (!ALLOWED_METHODS.has(method)) {
      return attachSecurityHeaders(
        new Response("Method Not Allowed", { status: 405 }),
        url.pathname,
      );
    }

    // 2. Path traversal & sensitive config/repo file guard
    if (isSensitiveOrTraversalPath(url.pathname)) {
      return attachSecurityHeaders(new Response("Forbidden", { status: 403 }), url.pathname);
    }

    // 3. CSRF Origin check + Payload Size Cap on state-mutating POST requests
    if (method === "POST") {
      if (!isValidPostOrigin(request, url)) {
        return attachSecurityHeaders(
          new Response(JSON.stringify({ error: "Cross-origin POST rejected." }), {
            status: 403,
            headers: { "content-type": "application/json; charset=utf-8" },
          }),
          url.pathname,
        );
      }

      const contentLength = request.headers.get("content-length");
      if (contentLength) {
        const bytes = Number.parseInt(contentLength, 10);
        if (!Number.isNaN(bytes) && bytes > MAX_POST_BYTES) {
          return attachSecurityHeaders(
            new Response(JSON.stringify({ error: "Request payload exceeds 128 KB limit." }), {
              status: 413,
              headers: { "content-type": "application/json; charset=utf-8" },
            }),
            url.pathname,
          );
        }
      }
    }

    // 4. Sliding-window per-IP rate limiting
    const clientIp = getClientIpFromRequest(request);
    const isSensitiveEndpoint =
      method === "POST" || url.pathname.startsWith("/_serverFn") || url.pathname.startsWith("/api");
    const rl = isSensitiveEndpoint
      ? checkRateLimit(`api:${clientIp}`, 40, 60_000)
      : checkRateLimit(`web:${clientIp}`, 240, 60_000);

    if (!rl.allowed) {
      return attachSecurityHeaders(
        new Response(
          JSON.stringify({
            error: "Too many requests. Please slow down and retry shortly.",
            retryAfterSec: rl.retryAfterSec,
          }),
          {
            status: 429,
            headers: {
              "content-type": "application/json; charset=utf-8",
              "Retry-After": String(rl.retryAfterSec),
            },
          },
        ),
        url.pathname,
      );
    }

    // Direct endpoints for security.txt & dnt-policy.txt (both /.well-known/ and root alias)
    if (url.pathname === "/.well-known/security.txt" || url.pathname === "/security.txt") {
      return attachSecurityHeaders(
        new Response(
          `Contact: mailto:hello@asjione.com\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en, hi\nCanonical: https://www.asji.online/.well-known/security.txt\nPolicy: https://www.asji.online/legal/security\n`,
          { headers: { "content-type": "text/plain; charset=utf-8" } },
        ),
        url.pathname,
      );
    }
    if (url.pathname === "/.well-known/dnt-policy.txt" || url.pathname === "/dnt-policy.txt") {
      return attachSecurityHeaders(
        new Response(
          `Do Not Track (DNT) Policy Statement\nASJi One respects user privacy and honors Do Not Track signals. We do not use third-party tracking pixels or behavioral cross-site analytics cookies.\n`,
          { headers: { "content-type": "text/plain; charset=utf-8" } },
        ),
        url.pathname,
      );
    }

    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const normalizedRes = await normalizeCatastrophicSsrResponse(rawResponse);
      return attachSecurityHeaders(normalizedRes, url.pathname);
    } catch (error) {
      console.error(error);
      return attachSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        url.pathname,
      );
    }
  },
};
