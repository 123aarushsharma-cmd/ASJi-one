//#region node_modules/.nitro/vite/services/ssr/index.js
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
var CAUSE_DEPTH_LIMIT = 5;
var DESCRIPTION_LENGTH_LIMIT = 8e3;
function describeError(error) {
	const parts = [];
	let current = error;
	for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
		if (!(current instanceof Error)) {
			parts.push(typeof current === "string" ? current : safeStringify(current));
			break;
		}
		const label = depth === 0 ? "" : "caused by: ";
		const status = describeStatus(current);
		parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${status}`);
		current = current.cause;
	}
	return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}
function describeStatus(error) {
	const { status, statusCode } = error;
	const value = status ?? statusCode;
	return typeof value === "number" ? ` (status ${value})` : "";
}
function safeStringify(value) {
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
function isErrorLike(value) {
	return value instanceof Error;
}
var originalConsoleError = console.error.bind(console);
console.error = (...args) => {
	originalConsoleError(...args.map((arg) => {
		if (!isErrorLike(arg)) return arg;
		record(arg);
		return describeError(arg);
	}));
};
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-BXcX7tta.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;
	console.error(consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`));
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function isH3SwallowedErrorBody(body) {
	try {
		const payload = JSON.parse(body);
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}
function attachSecurityHeaders(res) {
	const newHeaders = new Headers(res.headers);
	if (!newHeaders.has("X-Frame-Options")) newHeaders.set("X-Frame-Options", "SAMEORIGIN");
	if (!newHeaders.has("X-Content-Type-Options")) newHeaders.set("X-Content-Type-Options", "nosniff");
	if (!newHeaders.has("Referrer-Policy")) newHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin");
	if (!newHeaders.has("Strict-Transport-Security")) newHeaders.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
	if (!newHeaders.has("Permissions-Policy")) newHeaders.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");
	if (!newHeaders.has("Content-Security-Policy")) newHeaders.set("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: https: blob:; connect-src 'self' https:; frame-ancestors 'self' https:;");
	return new Response(res.body, {
		status: res.status,
		statusText: res.statusText,
		headers: newHeaders
	});
}
var server_default = { async fetch(request, env, ctx) {
	const url = new URL(request.url);
	if (url.pathname === "/.well-known/security.txt" || url.pathname === "/security.txt") return attachSecurityHeaders(new Response(`Contact: mailto:security@asji.law\nContact: mailto:asji.online@gmail.com\nExpires: 2027-12-31T23:59:59.000Z\nPreferred-Languages: en, ar, hi\nCanonical: https://asji-one.vercel.app/.well-known/security.txt\nPolicy: https://asji-one.vercel.app/privacy\nHiring: https://asji-one.vercel.app\n`, { headers: { "content-type": "text/plain; charset=utf-8" } }));
	if (url.pathname === "/.well-known/dnt-policy.txt" || url.pathname === "/dnt-policy.txt") return attachSecurityHeaders(new Response(`Do Not Track (DNT) Policy Statement\nASJi One respects user privacy and honors Do Not Track signals. We do not use third-party tracking pixels or behavioral cross-site analytics cookies.\n`, { headers: { "content-type": "text/plain; charset=utf-8" } }));
	try {
		return attachSecurityHeaders(await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx)));
	} catch (error) {
		console.error(error);
		return attachSecurityHeaders(new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		}));
	}
} };
//#endregion
export { server_default as default, renderErrorPage as t };
