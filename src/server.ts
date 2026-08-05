import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

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

function attachSecurityHeaders(res: Response): Response {
  const newHeaders = new Headers(res.headers);
  if (!newHeaders.has("X-Frame-Options")) {
    newHeaders.set("X-Frame-Options", "SAMEORIGIN");
  }
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
    newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
  }
  if (!newHeaders.has("Content-Security-Policy")) {
    newHeaders.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'self' https:;",
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

    // Direct endpoints for security.txt & dnt-policy.txt (both /.well-known/ and root alias)
    if (url.pathname === "/.well-known/security.txt" || url.pathname === "/security.txt") {
      return attachSecurityHeaders(
        new Response(
          `Contact: mailto:security@asji.law\nContact: mailto:asji.online@gmail.com\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en, ar, hi\nCanonical: https://asji-one.vercel.app/.well-known/security.txt\nPolicy: https://asji-one.vercel.app/privacy\nHiring: https://asji-one.vercel.app\n`,
          { headers: { "content-type": "text/plain; charset=utf-8" } },
        ),
      );
    }
    if (url.pathname === "/.well-known/dnt-policy.txt" || url.pathname === "/dnt-policy.txt") {
      return attachSecurityHeaders(
        new Response(
          `Do Not Track (DNT) Policy Statement\nASJi One respects user privacy and honors Do Not Track signals. We do not use third-party tracking pixels or behavioral cross-site analytics cookies.\n`,
          { headers: { "content-type": "text/plain; charset=utf-8" } },
        ),
      );
    }

    try {
      const handler = await getServerEntry();
      const rawResponse = await handler.fetch(request, env, ctx);
      const normalizedRes = await normalizeCatastrophicSsrResponse(rawResponse);
      return attachSecurityHeaders(normalizedRes);
    } catch (error) {
      console.error(error);
      return attachSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
      );
    }
  },
};
