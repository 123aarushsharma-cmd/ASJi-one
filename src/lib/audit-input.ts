export type InputKind = "url" | "text";

export type DetectedInput = {
  kind: InputKind;
  /** Normalized absolute URL when kind === "url" */
  url?: string;
  /** Hostname when kind === "url" */
  host?: string;
  value: string;
};

const URL_LIKE =
  /^(https?:\/\/)?((localhost)|((?!-)[a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,24})(:\d{2,5})?(\/[^\s]*)?$/i;

const IP_LIKE = /^(https?:\/\/)?(\d{1,3}\.){3}\d{1,3}(:\d{2,5})?(\/[^\s]*)?$/;

const DANGEROUS_INPUT_PATTERN =
  /<\s*\/?\s*script\b|<\s*\/?\s*(?:iframe|object|embed|svg|img|style|link|meta|body)\b|\b(?:javascript|vbscript|data)\s*:|\bon[a-z]+\s*=/i;

function stripControlAndBidiChars(value: string): string {
  let clean = "";
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    // Keep printable ASCII / Unicode except control chars (< 32, 127) and directional overrides
    if (
      code === 127 ||
      (code < 32 && code !== 10 && code !== 13 && code !== 9) ||
      (code >= 0x200b && code <= 0x200f) ||
      (code >= 0x202a && code <= 0x202e) ||
      code === 0xfeff
    ) {
      continue;
    }
    clean += value[i];
  }
  return clean;
}

/**
 * Strict pre-processing sanitizer for domain and compliance telemetry inputs.
 * Strips control/zero-width characters, HTML/script tags, and unsafe URI schemes.
 */
export function sanitizeAuditInput(raw: string): string {
  const withoutControls = stripControlAndBidiChars(raw);
  const withoutTags = withoutControls.replace(/<[^>]*>/g, "");
  const withoutSchemes = withoutTags.replace(/\b(?:javascript|vbscript|data)\s*:/gi, "");
  return withoutSchemes.trim();
}

/** Detects whether the submitted value is a single website URL or raw infrastructure text. */
export function detectInput(raw: string): DetectedInput {
  const value = sanitizeAuditInput(raw);
  const singleToken = value.split(/\s+/).length === 1 && !value.includes("\n");

  if (singleToken && (URL_LIKE.test(value) || IP_LIKE.test(value))) {
    const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const parsed = new URL(withScheme);
      if (parsed.username || parsed.password) {
        return { kind: "text", value };
      }
      const host = parsed.hostname
        .toLowerCase()
        .replace(/^\[|\]$/g, "")
        .replace(/\.+$/, "");
      const canonicalUrl = `https://${host}`;
      return { kind: "url", url: canonicalUrl, host, value };
    } catch {
      /* fall through to text */
    }
  }

  return { kind: "text", value };
}

export type ValidationResult = { ok: true; detected: DetectedInput } | { ok: false; error: string };

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

function isPrivateOrMetadataHost(rawHost: string): boolean {
  const host = rawHost
    .toLowerCase()
    .replace(/^\[|\]$/g, "")
    .replace(/\.+$/, "");
  if (
    host === "localhost" ||
    host === "0.0.0.0" ||
    host === "metadata" ||
    host === "metadata.google.internal" ||
    host === "metadata.goog" ||
    host === "instance-data"
  ) {
    return true;
  }
  if (BLOCKED_INTERNAL_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return true;
  }
  // IPv4 private, loopback, CGNAT (100.64/10), link-local/metadata (169.254/16), multicast/reserved
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
    const parts = host.split(".").map((n) => Number.parseInt(n, 10));
    if (parts.some((n) => Number.isNaN(n) || n > 255)) return true;
    const [a, b] = parts;
    if (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    ) {
      return true;
    }
  }
  // IPv6 loopback / link-local / unique local / mapped private IPv4
  if (host.includes(":")) {
    if (
      host === "::" ||
      host === "::1" ||
      /^(fe[89ab]|fc|fd|ff)/i.test(host) ||
      host.startsWith("::ffff:")
    ) {
      return true;
    }
  }
  return false;
}

/** Client + server shared validation for the analyze form. */
export function validateAuditInput(raw: string): ValidationResult {
  const trimmedRaw = stripControlAndBidiChars(raw).trim();
  if (DANGEROUS_INPUT_PATTERN.test(trimmedRaw)) {
    return {
      ok: false,
      error:
        "Security guard blocked unsafe HTML tags, scripts, or URI schemes. Enter a public domain name.",
    };
  }

  const value = sanitizeAuditInput(trimmedRaw);
  if (value.length < 3)
    return { ok: false, error: "Enter a public website domain or infrastructure summary." };
  if (value.length > 8000)
    return { ok: false, error: "Input exceeds the 8,000-character inspection limit." };

  const singleToken = value.split(/\s+/).length === 1 && !value.includes("\n");
  const looksLikeAttemptedUrl =
    singleToken && (/^https?:\/\//i.test(value) || value.includes(".") || value.includes("/"));

  const detected = detectInput(value);

  if (detected.kind === "url") {
    const parsed = new URL(detected.url!);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return { ok: false, error: "Only public http and https domains may be inspected." };
    }
    if (parsed.username || parsed.password) {
      return { ok: false, error: "URLs containing embedded credentials are prohibited." };
    }
    if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
      return { ok: false, error: "Non-standard ports cannot be scanned." };
    }
    if (isPrivateOrMetadataHost(parsed.hostname)) {
      return {
        ok: false,
        error:
          "Private network ranges (192.168.x.x, 127.0.0.1, localhost, or metadata endpoints) are blocked to prevent SSRF.",
      };
    }
    return { ok: true, detected };
  }

  if (looksLikeAttemptedUrl) {
    return {
      ok: false,
      error:
        "Invalid public domain format. Enter a reachable domain such as https://example.com or a technical architecture summary.",
    };
  }

  if (value.length < 40) {
    return {
      ok: false,
      error:
        "Provide a valid domain (e.g., example.com) or at least 40 characters detailing hosting, telemetry, and data flows.",
    };
  }

  return { ok: true, detected };
}
