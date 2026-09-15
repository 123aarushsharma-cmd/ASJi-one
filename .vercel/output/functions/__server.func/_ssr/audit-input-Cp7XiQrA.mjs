//#region node_modules/.nitro/vite/services/ssr/assets/audit-input-Cp7XiQrA.js
var URL_LIKE = /^(https?:\/\/)?((localhost)|((?!-)[a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,24})(:\d{2,5})?(\/[^\s]*)?$/i;
var IP_LIKE = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d{2,5})?(\/[^\s]*)?$/;
/** Detects whether the submitted value is a single website URL or raw infrastructure text. */
function detectInput(raw) {
	const value = raw.trim();
	if (value.split(/\s+/).length === 1 && !value.includes("\n") && (URL_LIKE.test(value) || IP_LIKE.test(value))) {
		const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
		try {
			const parsed = new URL(withScheme);
			return {
				kind: "url",
				url: parsed.toString(),
				host: parsed.hostname,
				value
			};
		} catch {}
	}
	return {
		kind: "text",
		value
	};
}
/** Client + server shared validation for the analyze form. */
function validateAuditInput(raw) {
	const value = raw.trim();
	if (value.length < 3) return {
		ok: false,
		error: "Enter a website URL or describe your infrastructure."
	};
	if (value.length > 8e3) return {
		ok: false,
		error: "Input is too long — keep it under 8000 characters."
	};
	const looksLikeAttemptedUrl = value.split(/\s+/).length === 1 && !value.includes("\n") && (/^https?:\/\//i.test(value) || value.includes(".") || value.includes("/"));
	const detected = detectInput(value);
	if (detected.kind === "url") {
		const parsed = new URL(detected.url);
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return {
			ok: false,
			error: "Only http and https URLs can be scanned."
		};
		const host = parsed.hostname.toLowerCase();
		if (host === "localhost" || host.endsWith(".local") || /^127\./.test(host) || /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host)) return {
			ok: false,
			error: "Private or local addresses can't be scanned. Use a public website URL."
		};
		return {
			ok: true,
			detected
		};
	}
	if (looksLikeAttemptedUrl) return {
		ok: false,
		error: "That doesn't look like a valid URL. Try something like https://example.com — or paste full infrastructure details instead."
	};
	if (value.length < 40) return {
		ok: false,
		error: "Add more detail — paste a full URL, or describe hosting, databases, analytics and data flows."
	};
	return {
		ok: true,
		detected
	};
}
//#endregion
export { validateAuditInput as n, detectInput as t };
