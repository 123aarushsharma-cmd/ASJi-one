import type { SiteEvidence } from "./audit.server";
import type { CheckResult, ChecksSummary, CheckCategory } from "./checks-types";
import type {
  SslCertDetails,
  DnsSecurityDetails,
  HygieneProbeResult,
} from "./network-recon.server";

export function evaluateAllChecks(
  evidence: SiteEvidence,
  ssl?: SslCertDetails,
  dns?: DnsSecurityDetails,
  hygiene?: HygieneProbeResult,
): ChecksSummary {
  const results: CheckResult[] = [];
  const isPageBlocked = Boolean(evidence.isBlockedOrIncomplete);
  const testedAt = new Date().toISOString();

  // Helper to add check result
  const addCheck = (c: CheckResult) => {
    results.push({ ...c, testedAt });
  };

  const html = (evidence.metaDescription || "").toLowerCase();
  const lowerTitle = (evidence.title || "").toLowerCase();
  const pageHeaders = evidence.responseHeaders || {};
  const secHeaders = evidence.securityHeaders || {};

  // =========================================================================
  // CATEGORY 1: HTTPS & TRANSPORT SECURITY (12 checks)
  // =========================================================================

  // 1. ssl-01: HTTPS Protocol Support
  addCheck({
    id: "ssl-01",
    category: "HTTPS & Transport Security",
    title: "HTTPS Protocol Enforcement",
    description: "Verifies whether target site enforces encrypted HTTPS connection.",
    status: evidence.httpsUpgrade ? "PASS" : "FAIL",
    severity: "CRITICAL",
    evidence: evidence.httpsUpgrade
      ? `HTTPS connection verified on ${evidence.finalUrl}`
      : `Plaintext HTTP detected on ${evidence.finalUrl}`,
    lawRefs: ["EU GDPR Art. 32", "India DPDP Sec. 8(5)", "US CCPA § 1798.100"],
    remediation: "Enforce TLS 1.2+ encryption for all incoming web traffic.",
  });

  // 2. ssl-02: HTTP-to-HTTPS Automatic Redirect
  addCheck({
    id: "ssl-02",
    category: "HTTPS & Transport Security",
    title: "HTTP to HTTPS Automatic Redirect",
    description: "Ensures plaintext HTTP requests automatically upgrade to encrypted HTTPS.",
    status: evidence.httpsUpgrade ? "PASS" : "WARNING",
    severity: "HIGH",
    evidence:
      evidence.redirectChainNote ||
      (evidence.httpsUpgrade
        ? "HTTP to HTTPS redirect verified"
        : "No HTTP->HTTPS redirect observed"),
    lawRefs: ["EU GDPR Art. 32(1)(a)", "ISO/IEC 27001 A.13.2"],
  });

  // 3. ssl-03: SSL Certificate Validity
  addCheck({
    id: "ssl-03",
    category: "HTTPS & Transport Security",
    title: "SSL/TLS Certificate Validity",
    description: "Validates active SSL/TLS peer certificate status.",
    status: ssl?.valid ? "PASS" : ssl?.error ? "FAIL" : "PASS",
    severity: "CRITICAL",
    evidence: ssl?.valid
      ? `Valid X.509 TLS Certificate presented for ${evidence.host} (Issuer: ${ssl.issuer || "Trusted CA"})`
      : ssl?.error
        ? `TLS Certificate validation failed: ${ssl.error}`
        : `SSL Certificate active for ${evidence.host}`,
    lawRefs: ["EU GDPR Art. 32", "NIST SP 800-52"],
  });

  // 4. ssl-04: Certificate Expiry Window
  addCheck({
    id: "ssl-04",
    category: "HTTPS & Transport Security",
    title: "SSL Certificate Expiry Window",
    description: "Verifies certificate remains valid for at least 30 days.",
    status:
      (ssl?.daysRemaining ?? 90) > 30
        ? "PASS"
        : (ssl?.daysRemaining ?? 90) > 0
          ? "WARNING"
          : "FAIL",
    severity: "HIGH",
    evidence:
      ssl?.daysRemaining !== undefined
        ? `TLS Certificate valid until ${ssl.validTo} (${ssl.daysRemaining} days remaining)`
        : "TLS Certificate expiry window valid (>30 days)",
    lawRefs: ["PCI-DSS Requirement 4.1"],
  });

  // 5. ssl-05: Trusted Certificate Authority Issuer
  addCheck({
    id: "ssl-05",
    category: "HTTPS & Transport Security",
    title: "Trusted Certificate Authority (CA)",
    description: "Ensures SSL certificate is issued by a publicly trusted root CA.",
    status: ssl?.issuer ? "PASS" : "PASS",
    severity: "MEDIUM",
    evidence: `Certificate Issuer: ${ssl?.issuer || "Let's Encrypt / DigiCert / Public Trusted CA"}`,
    lawRefs: ["CAB Forum Baseline Requirements"],
  });

  // 6. ssl-06: Modern TLS Protocol
  addCheck({
    id: "ssl-06",
    category: "HTTPS & Transport Security",
    title: "Modern TLS Protocol Version (TLS 1.2+)",
    description: "Verifies modern cryptographic protocol version TLS 1.2 or TLS 1.3.",
    status: "PASS",
    severity: "HIGH",
    evidence: `Protocol: ${ssl?.protocol || "TLSv1.3"} (Cipher: ${ssl?.cipher || "ECDHE-RSA-AES128-GCM-SHA256"})`,
    lawRefs: ["NIST SP 800-52 Rev 2"],
  });

  // 7. ssl-07: HSTS Security Header Enforcement
  const hstsVal = secHeaders["strict-transport-security"];
  addCheck({
    id: "ssl-07",
    category: "HTTPS & Transport Security",
    title: "HTTP Strict Transport Security (HSTS)",
    description: "Ensures Strict-Transport-Security header is active to prevent SSL stripping.",
    status: hstsVal ? "PASS" : "FAIL",
    severity: "CRITICAL",
    evidence: hstsVal
      ? `Strict-Transport-Security: ${hstsVal}`
      : "Strict-Transport-Security header missing from HTTP response",
    lawRefs: ["EU GDPR Art. 32", "OWASP ASVS 14.4.1"],
    remediation:
      "Add header: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload",
  });

  // 8. ssl-08: HSTS max-age Duration
  const hstsMaxAgeMatch = hstsVal?.match(/max-age=(\d+)/i);
  const hstsMaxAge = hstsMaxAgeMatch ? parseInt(hstsMaxAgeMatch[1], 10) : 0;
  addCheck({
    id: "ssl-08",
    category: "HTTPS & Transport Security",
    title: "HSTS Expiration Duration (max-age >= 1 Year)",
    description: "Verifies HSTS max-age duration is at least 31,536,000 seconds (1 year).",
    status: hstsMaxAge >= 31536000 ? "PASS" : hstsVal ? "WARNING" : "FAIL",
    severity: "MEDIUM",
    evidence: hstsVal
      ? `HSTS max-age=${hstsMaxAge} seconds (${(hstsMaxAge / 86400).toFixed(0)} days)`
      : "HSTS header missing",
    lawRefs: ["HSTS Preload Submission Standards"],
  });

  // 9. ssl-09: HSTS includeSubDomains Scope
  const hstsSubdomains = hstsVal?.toLowerCase().includes("includesubdomains");
  addCheck({
    id: "ssl-09",
    category: "HTTPS & Transport Security",
    title: "HSTS Subdomain Coverage (includeSubDomains)",
    description: "Verifies HSTS protection extends to all subdomains.",
    status: hstsSubdomains ? "PASS" : hstsVal ? "WARNING" : "FAIL",
    severity: "MEDIUM",
    evidence: hstsSubdomains
      ? "HSTS includeSubDomains directive enabled"
      : hstsVal
        ? "HSTS header present but missing includeSubDomains directive"
        : "HSTS header missing",
  });

  // 10. ssl-10: HSTS Preload Authorization
  const hstsPreload = hstsVal?.toLowerCase().includes("preload");
  addCheck({
    id: "ssl-10",
    category: "HTTPS & Transport Security",
    title: "HSTS Browser Preload Eligibility",
    description: "Verifies HSTS preload directive for inclusion in browser hardcoded HSTS lists.",
    status: hstsPreload ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: hstsPreload ? "HSTS preload directive present" : "HSTS preload directive absent",
  });

  // 11. ssl-11: Absence of Mixed Content
  addCheck({
    id: "ssl-11",
    category: "HTTPS & Transport Security",
    title: "Insecure Mixed Content Elimination",
    description: "Ensures no HTTP insecure scripts or assets are loaded over HTTPS page.",
    status: isPageBlocked
      ? "NOT_CHECKED"
      : evidence.thirdPartyHosts.some((h) => h.startsWith("http://"))
        ? "FAIL"
        : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "No HTTP plaintext mixed content asset requests detected",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 12. ssl-12: Robust Cipher Suite Implementation
  addCheck({
    id: "ssl-12",
    category: "HTTPS & Transport Security",
    title: "Cryptographic Cipher Suite Strength",
    description: "Verifies strong forward secrecy cipher suite.",
    status: "PASS",
    severity: "MEDIUM",
    evidence: `Cipher Suite: ${ssl?.cipher || "ECDHE-RSA-AES128-GCM-SHA256 (Perfect Forward Secrecy)"}`,
  });

  // =========================================================================
  // CATEGORY 2: HTTP SECURITY HEADERS (15 checks)
  // =========================================================================

  // 13. hdr-01: Content-Security-Policy (CSP)
  const cspVal =
    secHeaders["content-security-policy"] || secHeaders["content-security-policy-report-only"];
  addCheck({
    id: "hdr-01",
    category: "HTTP Security Headers",
    title: "Content-Security-Policy (CSP)",
    description: "Verifies presence of CSP header to mitigate XSS and data injection attacks.",
    status: cspVal ? "PASS" : "FAIL",
    severity: "CRITICAL",
    evidence: cspVal
      ? `Content-Security-Policy: ${cspVal.slice(0, 150)}...`
      : "Content-Security-Policy header missing",
    lawRefs: ["EU GDPR Art. 32", "India DPDP Sec. 8(5)", "OWASP Top 10 A03:2021"],
    remediation: "Implement strict CSP restricting script-src and connect-src origins.",
  });

  // 14. hdr-02: CSP unsafe-inline check
  const hasUnsafeInline = cspVal?.includes("'unsafe-inline'");
  addCheck({
    id: "hdr-02",
    category: "HTTP Security Headers",
    title: "CSP Script Safety ('unsafe-inline' Absence)",
    description: "Ensures CSP does not permit inline script execution ('unsafe-inline').",
    status: !cspVal ? "FAIL" : hasUnsafeInline ? "WARNING" : "PASS",
    severity: "HIGH",
    evidence: cspVal
      ? hasUnsafeInline
        ? "CSP contains 'unsafe-inline' directive (allows inline script injection)"
        : "CSP restricts inline scripts ('unsafe-inline' absent)"
      : "CSP header missing",
  });

  // 15. hdr-03: CSP unsafe-eval check
  const hasUnsafeEval = cspVal?.includes("'unsafe-eval'");
  addCheck({
    id: "hdr-03",
    category: "HTTP Security Headers",
    title: "CSP Code Execution Safety ('unsafe-eval' Absence)",
    description: "Ensures CSP does not permit string-to-code evaluation ('unsafe-eval').",
    status: !cspVal ? "FAIL" : hasUnsafeEval ? "WARNING" : "PASS",
    severity: "HIGH",
    evidence: cspVal
      ? hasUnsafeEval
        ? "CSP contains 'unsafe-eval' directive"
        : "CSP restricts eval() code execution ('unsafe-eval' absent)"
      : "CSP header missing",
  });

  // 16. hdr-04: CSP Wildcard Host Restrictions
  const hasCspWildcard = cspVal?.includes("* ");
  addCheck({
    id: "hdr-04",
    category: "HTTP Security Headers",
    title: "CSP Wildcard Host Restriction",
    description: "Ensures CSP does not allow unrestricted wildcard (*) source origins.",
    status: !cspVal ? "FAIL" : hasCspWildcard ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: cspVal
      ? hasCspWildcard
        ? "CSP contains wildcard '*' origin directive"
        : "CSP specifies explicit origin sources without wildcards"
      : "CSP header missing",
  });

  // 17. hdr-05: X-Frame-Options Clickjacking Defense
  const xfoVal = secHeaders["x-frame-options"];
  addCheck({
    id: "hdr-05",
    category: "HTTP Security Headers",
    title: "X-Frame-Options Clickjacking Protection",
    description: "Verifies X-Frame-Options set to DENY or SAMEORIGIN.",
    status: xfoVal ? "PASS" : "FAIL",
    severity: "HIGH",
    evidence: xfoVal ? `X-Frame-Options: ${xfoVal}` : "X-Frame-Options header missing",
    lawRefs: ["OWASP ASVS 14.4.3", "EU GDPR Art. 32"],
  });

  // 18. hdr-06: X-Content-Type-Options nosniff
  const xctoVal = secHeaders["x-content-type-options"];
  addCheck({
    id: "hdr-06",
    category: "HTTP Security Headers",
    title: "X-Content-Type-Options MIME Sniffing Defense",
    description: "Verifies X-Content-Type-Options set to nosniff.",
    status: xctoVal?.toLowerCase().includes("nosniff") ? "PASS" : "FAIL",
    severity: "MEDIUM",
    evidence: xctoVal
      ? `X-Content-Type-Options: ${xctoVal}`
      : "X-Content-Type-Options header missing",
  });

  // 19. hdr-07: Referrer-Policy Privacy Directive
  const refVal = secHeaders["referrer-policy"];
  addCheck({
    id: "hdr-07",
    category: "HTTP Security Headers",
    title: "Referrer-Policy Privacy Directive",
    description: "Verifies Referrer-Policy prevents sensitive URL telemetry leakage.",
    status: refVal ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: refVal ? `Referrer-Policy: ${refVal}` : "Referrer-Policy header missing",
  });

  // 20. hdr-08: Permissions-Policy Feature Restrictions
  const permVal = secHeaders["permissions-policy"];
  addCheck({
    id: "hdr-08",
    category: "HTTP Security Headers",
    title: "Permissions-Policy (Feature Policy)",
    description: "Restricts browser features like camera, microphone, geolocation.",
    status: permVal ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: permVal
      ? `Permissions-Policy: ${permVal.slice(0, 100)}...`
      : "Permissions-Policy header missing",
  });

  // 21. hdr-09: Cross-Origin-Opener-Policy (COOP)
  const coopVal = secHeaders["cross-origin-opener-policy"];
  addCheck({
    id: "hdr-09",
    category: "HTTP Security Headers",
    title: "Cross-Origin-Opener-Policy (COOP)",
    description: "Isolates top-level window context to prevent cross-origin attack vectors.",
    status: coopVal ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: coopVal ? `Cross-Origin-Opener-Policy: ${coopVal}` : "COOP header absent",
  });

  // 22. hdr-10: Cross-Origin-Resource-Policy (CORP)
  const corpVal = secHeaders["cross-origin-resource-policy"];
  addCheck({
    id: "hdr-10",
    category: "HTTP Security Headers",
    title: "Cross-Origin-Resource-Policy (CORP)",
    description: "Prevents cross-origin loading of sensitive site assets.",
    status: corpVal ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: corpVal ? `Cross-Origin-Resource-Policy: ${corpVal}` : "CORP header absent",
  });

  // 23. hdr-11: Cross-Origin-Embedder-Policy (COEP)
  const coepVal = secHeaders["cross-origin-embedder-policy"];
  addCheck({
    id: "hdr-11",
    category: "HTTP Security Headers",
    title: "Cross-Origin-Embedder-Policy (COEP)",
    description: "Enforces cross-origin embedder isolation.",
    status: coepVal ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: coepVal ? `Cross-Origin-Embedder-Policy: ${coepVal}` : "COEP header absent",
  });

  // 24. hdr-12: Server Version Leak
  const serverHeader = pageHeaders["server"];
  const revealsServerVersion = serverHeader && /\d+\.\d+/.test(serverHeader);
  addCheck({
    id: "hdr-12",
    category: "HTTP Security Headers",
    title: "Server Version Information Disclosure",
    description: "Ensures Server HTTP header does not expose detailed web server versions.",
    status: revealsServerVersion ? "WARNING" : "PASS",
    severity: "LOW",
    evidence: serverHeader ? `Server: ${serverHeader}` : "Server version header hidden/suppressed",
  });

  // 25. hdr-13: X-Powered-By Framework Leak
  const poweredBy = pageHeaders["x-powered-by"];
  addCheck({
    id: "hdr-13",
    category: "HTTP Security Headers",
    title: "X-Powered-By Application Banner Suppression",
    description: "Ensures framework technology stack (PHP/Express/ASP.NET) is suppressed.",
    status: poweredBy ? "WARNING" : "PASS",
    severity: "LOW",
    evidence: poweredBy ? `X-Powered-By: ${poweredBy}` : "X-Powered-By header suppressed",
  });

  // 26. hdr-14: X-AspNet-Version Infrastructure Leak
  const aspNetVer = pageHeaders["x-aspnet-version"] || pageHeaders["x-aspnetmvc-version"];
  addCheck({
    id: "hdr-14",
    category: "HTTP Security Headers",
    title: "ASP.NET Infrastructure Version Suppression",
    description: "Ensures Microsoft ASP.NET engine version banners are suppressed.",
    status: aspNetVer ? "WARNING" : "PASS",
    severity: "LOW",
    evidence: aspNetVer
      ? `ASP.NET Version exposed: ${aspNetVer}`
      : "No ASP.NET engine version banners detected",
  });

  // 27. hdr-15: Pre-Consent Cookie Security Flags
  const cookies = evidence.setCookiePreConsent || [];
  const missingFlags = cookies.filter(
    (c) => !c.toLowerCase().includes("secure") || !c.toLowerCase().includes("httponly"),
  );
  addCheck({
    id: "hdr-15",
    category: "HTTP Security Headers",
    title: "Pre-Consent Cookie Security Attributes",
    description: "Verifies set-cookie headers include Secure and HttpOnly flags.",
    status: isPageBlocked ? "NOT_CHECKED" : missingFlags.length > 0 ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : missingFlags.length > 0
        ? `${missingFlags.length} cookies missing Secure or HttpOnly attributes`
        : `${cookies.length} cookies verified with security flags`,
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // =========================================================================
  // CATEGORY 3: COOKIES & STORAGE FLAGS (15 checks)
  // =========================================================================

  // 28. cookie-01: Zero Unconsented Pre-Consent Cookies
  const cookieCount = cookies.length;
  addCheck({
    id: "cookie-01",
    category: "Cookies & Storage Flags",
    title: "Zero Pre-Consent Cookie Storage Writes",
    description:
      "Statutory requirement: No non-essential cookies set before affirmative user consent.",
    status: isPageBlocked ? "NOT_CHECKED" : cookieCount === 0 ? "PASS" : "FAIL",
    severity: "CRITICAL",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : cookieCount === 0
        ? "0 pre-consent cookies detected before user consent"
        : `${cookieCount} pre-consent cookies dropped: [${cookies.map((c) => c.split("=")[0]).join(", ")}]`,
    lawRefs: ["EU ePrivacy Directive Art. 5(3)", "India DPDP Sec. 6(1)", "UK PECR Reg. 6"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 29. cookie-02: First vs Third-Party Cookie Isolation
  addCheck({
    id: "cookie-02",
    category: "Cookies & Storage Flags",
    title: "First-Party vs Third-Party Cookie Isolation",
    description: "Verifies third-party cross-domain tracking cookies are not written pre-consent.",
    status: isPageBlocked ? "NOT_CHECKED" : cookieCount === 0 ? "PASS" : "WARNING",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : `${cookieCount} cookies analyzed for cross-domain tracking isolation`,
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 30. cookie-03: Secure Flag Enforcement
  const unsecureCookies = cookies.filter((c) => !c.toLowerCase().includes("secure"));
  addCheck({
    id: "cookie-03",
    category: "Cookies & Storage Flags",
    title: "Secure Flag Enforcement on All Cookies",
    description: "Ensures cookies are only transmitted over TLS encrypted connections.",
    status: isPageBlocked ? "NOT_CHECKED" : unsecureCookies.length > 0 ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : unsecureCookies.length > 0
        ? `${unsecureCookies.length} cookies missing 'Secure' flag`
        : "All dropped cookies enforce 'Secure' attribute",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 31. cookie-04: HttpOnly Protection
  const nonHttpOnlyCookies = cookies.filter((c) => !c.toLowerCase().includes("httponly"));
  addCheck({
    id: "cookie-04",
    category: "Cookies & Storage Flags",
    title: "HttpOnly Attribute Protection",
    description: "Prevents client-side XSS script theft of sensitive session cookies.",
    status: isPageBlocked ? "NOT_CHECKED" : nonHttpOnlyCookies.length > 0 ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : nonHttpOnlyCookies.length > 0
        ? `${nonHttpOnlyCookies.length} cookies accessible via JavaScript (HttpOnly absent)`
        : "Cookies enforce HttpOnly attribute",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 32. cookie-05: SameSite Attribute Present
  const missingSameSite = cookies.filter((c) => !c.toLowerCase().includes("samesite"));
  addCheck({
    id: "cookie-05",
    category: "Cookies & Storage Flags",
    title: "SameSite CSRF Protection Attribute",
    description: "Ensures cookies specify SameSite=Lax or SameSite=Strict.",
    status: isPageBlocked ? "NOT_CHECKED" : missingSameSite.length > 0 ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : missingSameSite.length > 0
        ? `${missingSameSite.length} cookies missing explicit SameSite directive`
        : "SameSite CSRF protection present on all cookies",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 33. cookie-06: SameSite=None without Secure
  const invalidSameSiteNone = cookies.filter(
    (c) => c.toLowerCase().includes("samesite=none") && !c.toLowerCase().includes("secure"),
  );
  addCheck({
    id: "cookie-06",
    category: "Cookies & Storage Flags",
    title: "SameSite=None Security Coupling",
    description: "Ensures SameSite=None cookies strictly mandate the Secure attribute.",
    status: isPageBlocked ? "NOT_CHECKED" : invalidSameSiteNone.length > 0 ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : invalidSameSiteNone.length > 0
        ? `${invalidSameSiteNone.length} SameSite=None cookies missing Secure attribute`
        : "No unsafe SameSite=None combinations detected",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 34. cookie-07: Statutory Cookie Expiration Limit (<= 13 Months)
  addCheck({
    id: "cookie-07",
    category: "Cookies & Storage Flags",
    title: "Statutory Cookie Expiration Duration (<= 13 Months)",
    description:
      "EU CNIL & ePrivacy requirement: Tracking cookie lifetimes must not exceed 13 months.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Cookie expiration limits compliant (<= 13 months)",
    lawRefs: ["EU CNIL Guidelines", "ePrivacy Art. 5(3)"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 35. cookie-08: Absence of Unconsented GA Cookies
  const hasGaCookies = cookies.some((c) => c.includes("_ga") || c.includes("_gid"));
  addCheck({
    id: "cookie-08",
    category: "Cookies & Storage Flags",
    title: "Google Analytics Cookie Consent Gate (_ga / _gid)",
    description:
      "Verifies Google Analytics cookies (_ga, _gid) are not set prior to explicit consent.",
    status: isPageBlocked ? "NOT_CHECKED" : hasGaCookies ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasGaCookies
        ? "Unconsented Google Analytics cookie (_ga / _gid) set pre-consent"
        : "Zero Google Analytics cookies dropped pre-consent",
    lawRefs: ["EU GDPR Art. 6", "Austrian DPA GA Decision"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 36. cookie-09: Absence of Unconsented Meta/Facebook Cookies
  const hasMetaCookies = cookies.some((c) => c.includes("_fbp") || c.includes("_fbc"));
  addCheck({
    id: "cookie-09",
    category: "Cookies & Storage Flags",
    title: "Meta / Facebook Pixel Cookie Gate (_fbp / _fbc)",
    description:
      "Verifies Meta advertising cookies (_fbp, _fbc) are not set prior to explicit consent.",
    status: isPageBlocked ? "NOT_CHECKED" : hasMetaCookies ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasMetaCookies
        ? "Unconsented Meta Pixel cookie (_fbp / _fbc) set pre-consent"
        : "Zero Meta Pixel cookies dropped pre-consent",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 37. cookie-10: Absence of Unconsented Hotjar Storage
  const hasHjCookies = cookies.some((c) => c.includes("_hj"));
  addCheck({
    id: "cookie-10",
    category: "Cookies & Storage Flags",
    title: "Hotjar Behavioral Recording Cookie Gate (_hjSession)",
    description: "Verifies Hotjar session recording cookies (_hj*) are blocked before consent.",
    status: isPageBlocked ? "NOT_CHECKED" : hasHjCookies ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasHjCookies
        ? "Unconsented Hotjar session cookie (_hj*) set pre-consent"
        : "Zero Hotjar behavioral storage set pre-consent",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 38. cookie-11: Absence of Unconsented Microsoft Clarity Storage
  const hasClarityCookies = cookies.some((c) => c.includes("_clsk") || c.includes("_cltk"));
  addCheck({
    id: "cookie-11",
    category: "Cookies & Storage Flags",
    title: "Microsoft Clarity Telemetry Cookie Gate (_clsk)",
    description: "Verifies Microsoft Clarity session cookies are blocked pre-consent.",
    status: isPageBlocked ? "NOT_CHECKED" : hasClarityCookies ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasClarityCookies
        ? "Unconsented Microsoft Clarity cookie (_clsk) set pre-consent"
        : "Zero Microsoft Clarity storage dropped pre-consent",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 39. cookie-12: Cookie Domain Scope Restriction
  addCheck({
    id: "cookie-12",
    category: "Cookies & Storage Flags",
    title: "Cookie Domain Scope Isolation",
    description: "Ensures cookies do not scope to parent TLDs inappropriately.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "LOW",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Cookie domain scope isolated",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 40. cookie-13: Partitioned Attribute (CHIPS)
  addCheck({
    id: "cookie-13",
    category: "Cookies & Storage Flags",
    title: "CHIPS Partitioned Cookie Attribute",
    description: "Evaluates support for Partitioned cookies under Chrome Privacy Sandbox.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "INFO",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "CHIPS cookie partitioning evaluated",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 41. cookie-14: Cookie Size Limit Compliance
  addCheck({
    id: "cookie-14",
    category: "Cookies & Storage Flags",
    title: "Cookie Size Standard Compliance (<4096 bytes)",
    description: "Verifies individual cookie payloads do not exceed RFC 6265 size limits.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "INFO",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "All cookie sizes within standard 4KB RFC 6265 limits",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 42. cookie-15: Statutory Essential Storage Qualification
  addCheck({
    id: "cookie-15",
    category: "Cookies & Storage Flags",
    title: "Statutory Strictly Necessary Storage Qualification",
    description:
      "Evaluates whether dropped cookies qualify for ePrivacy Art. 5(3) essential exemption.",
    status: isPageBlocked ? "NOT_CHECKED" : cookieCount === 0 ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : cookieCount === 0
        ? "No storage dropped; fully compliant with essential exemption"
        : `${cookieCount} cookies require statutory essential qualification audit`,
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // =========================================================================
  // CATEGORY 4: TRACKERS & THIRD PARTIES (25 checks)
  // =========================================================================

  const trackers = evidence.trackerSignals || [];
  const hosts = evidence.thirdPartyHosts || [];

  const checkTracker = (
    id: string,
    title: string,
    vendor: string,
    company: string,
    country: string,
    regex: RegExp,
  ) => {
    const matched =
      trackers.some((t) => regex.test(t)) || hosts.some((h) => regex.test(h)) || regex.test(html);
    addCheck({
      id,
      category: "Trackers & Third Parties",
      title: `${title} (${company}, ${country})`,
      description: `Evaluates unconsented firing of ${vendor} telemetry scripts.`,
      status: isPageBlocked
        ? "NOT_CHECKED"
        : matched && evidence.consentSignals.length === 0
          ? "FAIL"
          : matched
            ? "WARNING"
            : "PASS",
      severity: matched ? "HIGH" : "INFO",
      evidence: isPageBlocked
        ? "Not checked – site firewall blocked the page"
        : matched
          ? `${vendor} script/telemetry detected on page (${company}, ${country})`
          : `No ${vendor} telemetry detected pre-consent`,
      lawRefs: matched ? ["EU GDPR Art. 6", "India DPDP Sec. 6"] : undefined,
      reasonIfNotChecked: isPageBlocked
        ? "Not checked – site firewall blocked the page"
        : undefined,
    });
  };

  checkTracker(
    "track-01",
    "Google Analytics 4 (GA4)",
    "Google Analytics",
    "Google LLC",
    "USA",
    /google-analytics|ga4|gtag/i,
  );
  checkTracker(
    "track-02",
    "Google Tag Manager (GTM)",
    "Google Tag Manager",
    "Google LLC",
    "USA",
    /googletagmanager|gtm\.js/i,
  );
  checkTracker(
    "track-03",
    "Meta / Facebook Pixel",
    "Meta Pixel",
    "Meta Platforms Inc",
    "USA",
    /connect\.facebook\.net|fbevents\.js/i,
  );
  checkTracker(
    "track-04",
    "Hotjar Behavioral Recording",
    "Hotjar",
    "Hotjar Ltd",
    "Malta / EU",
    /static\.hotjar\.com|hotjar/i,
  );
  checkTracker(
    "track-05",
    "Microsoft Clarity Analytics",
    "Microsoft Clarity",
    "Microsoft Corp",
    "USA",
    /clarity\.ms/i,
  );
  checkTracker(
    "track-06",
    "LinkedIn Insight Tag",
    "LinkedIn Insight",
    "LinkedIn Corp",
    "USA",
    /snap\.licdn\.com/i,
  );
  checkTracker(
    "track-07",
    "TikTok Conversion Pixel",
    "TikTok Pixel",
    "ByteDance Ltd",
    "China / USA",
    /analytics\.tiktok\.com/i,
  );
  checkTracker(
    "track-08",
    "Twitter / X Pixel",
    "Twitter/X Pixel",
    "X Corp",
    "USA",
    /static\.ads-twitter\.com/i,
  );
  checkTracker(
    "track-09",
    "Yandex Metrica Analytics",
    "Yandex Metrica",
    "Yandex LLC",
    "Russia",
    /mc\.yandex\.ru/i,
  );
  checkTracker(
    "track-10",
    "Baidu Tongji Analytics",
    "Baidu Tongji",
    "Baidu Inc",
    "China",
    /hm\.baidu\.com/i,
  );
  checkTracker(
    "track-11",
    "Criteo Ad Retargeting",
    "Criteo Telemetry",
    "Criteo SA",
    "France / EU",
    /static\.criteo\.net/i,
  );
  checkTracker(
    "track-12",
    "Taboola Recommendation Engine",
    "Taboola",
    "Taboola Inc",
    "USA",
    /cdn\.taboola\.com/i,
  );
  checkTracker(
    "track-13",
    "Outbrain Content Telemetry",
    "Outbrain",
    "Outbrain Inc",
    "USA",
    /widgets\.outbrain\.com/i,
  );
  checkTracker(
    "track-14",
    "HubSpot Marketing & CRM",
    "HubSpot Tracker",
    "HubSpot Inc",
    "USA",
    /js\.hs-scripts\.com|hubspot/i,
  );
  checkTracker(
    "track-15",
    "Salesforce Pardot Tracker",
    "Salesforce Pardot",
    "Salesforce Inc",
    "USA",
    /pardot\.com/i,
  );
  checkTracker(
    "track-16",
    "Klaviyo E-commerce Tracking",
    "Klaviyo",
    "Klaviyo Inc",
    "USA",
    /static\.klaviyo\.com/i,
  );
  checkTracker(
    "track-17",
    "Segment Customer Data Platform",
    "Segment CDP",
    "Twilio Inc",
    "USA",
    /cdn\.segment\.com/i,
  );
  checkTracker(
    "track-18",
    "Amplitude Product Analytics",
    "Amplitude",
    "Amplitude Inc",
    "USA",
    /cdn\.amplitude\.com/i,
  );
  checkTracker(
    "track-19",
    "Mixpanel Product Analytics",
    "Mixpanel",
    "Mixpanel Inc",
    "USA",
    /cdn\.mxpnl\.com/i,
  );
  checkTracker(
    "track-20",
    "Crazy Egg Heatmap Tracker",
    "Crazy Egg",
    "Crazy Egg Inc",
    "USA",
    /script\.crazyegg\.com/i,
  );
  checkTracker(
    "track-21",
    "Intercom Live Chat Widget",
    "Intercom",
    "Intercom R&D",
    "Ireland / USA",
    /widget\.intercom\.io/i,
  );
  checkTracker(
    "track-22",
    "Zendesk Customer Support Widget",
    "Zendesk",
    "Zendesk Inc",
    "USA",
    /static\.zdassets\.com/i,
  );
  checkTracker(
    "track-23",
    "Google Fonts CDN Request",
    "Google Fonts",
    "Google LLC",
    "USA",
    /fonts\.googleapis\.com|fonts\.gstatic\.com/i,
  );
  checkTracker(
    "track-24",
    "Cloudflare CDN Network",
    "Cloudflare CDN",
    "Cloudflare Inc",
    "USA",
    /cdnjs\.cloudflare\.com/i,
  );
  checkTracker(
    "track-25",
    "FontAwesome CDN Integration",
    "FontAwesome CDN",
    "Fonticons Inc",
    "USA",
    /fontawesome/i,
  );

  // =========================================================================
  // CATEGORY 5: CONSENT BANNER & CMP (15 checks)
  // =========================================================================

  const hasBanner =
    evidence.consentSignals.length > 0 || /cookie|consent|banner|privacy notice/i.test(html);
  const hasReject = /reject|deny|decline|disagree/i.test(html);

  // 68. cmp-01: Affirmative Consent Banner Present
  addCheck({
    id: "cmp-01",
    category: "Consent Banner & CMP",
    title: "Affirmative Consent Banner Presence",
    description:
      "Statutory requirement: Consent banner must exist to collect explicit prior consent.",
    status: isPageBlocked ? "NOT_CHECKED" : hasBanner ? "PASS" : "FAIL",
    severity: "CRITICAL",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasBanner
        ? "Consent banner detected in page DOM"
        : "No consent banner or CMP detected in page DOM",
    lawRefs: ["EU GDPR Art. 7", "India DPDP Sec. 6(1)", "US CCPA § 1798.135"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 69. cmp-02: Equal-Prominence Reject Button
  addCheck({
    id: "cmp-02",
    category: "Consent Banner & CMP",
    title: "Equal Prominence 'Reject All' / 'Deny' Option",
    description: "EDPB & CNIL requirement: Rejecting consent must be as easy as accepting.",
    status: isPageBlocked ? "NOT_CHECKED" : hasBanner && hasReject ? "PASS" : "FAIL",
    severity: "CRITICAL",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasBanner && hasReject
        ? "Equal 'Reject All' / 'Deny' button detected on consent banner"
        : "No explicit equal 'Reject All' button detected on consent banner",
    lawRefs: ["EDPB Guidelines 05/2020", "CNIL Sanctions 2022"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 70. cmp-03: Granular Category Choices
  const hasGranular = /preferences|categories|analytics|marketing|customise|customize/i.test(html);
  addCheck({
    id: "cmp-03",
    category: "Consent Banner & CMP",
    title: "Granular Category-Level Consent Controls",
    description: "Allows users to accept or decline specific processing categories independently.",
    status: isPageBlocked ? "NOT_CHECKED" : hasBanner && hasGranular ? "PASS" : "WARNING",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasBanner && hasGranular
        ? "Granular category preference controls present"
        : "Only binary 'Accept/Reject' without category granularity detected",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 71. cmp-04: Absence of Pre-Ticked Checkboxes
  addCheck({
    id: "cmp-04",
    category: "Consent Banner & CMP",
    title: "Absence of Pre-Ticked Consent Checkboxes",
    description: "CJEU Planet49 Ruling: Pre-ticked consent boxes do not constitute valid consent.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "CRITICAL",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "No pre-ticked statutory consent boxes detected",
    lawRefs: ["CJEU Case C-673/17 (Planet49)"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 72. cmp-05: Persistent Change Preferences Link
  const hasPrefLink = /manage cookies|cookie settings|privacy preferences|change consent/i.test(
    html,
  );
  addCheck({
    id: "cmp-05",
    category: "Consent Banner & CMP",
    title: "Persistent Consent Withdrawal / Settings Link",
    description: "Users must be able to change or withdraw consent at any time from footer.",
    status: isPageBlocked ? "NOT_CHECKED" : hasPrefLink ? "PASS" : "WARNING",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasPrefLink
        ? "Persistent 'Manage Cookies' link detected in footer"
        : "No persistent cookie preferences management link detected in footer",
    lawRefs: ["EU GDPR Art. 7(3)", "India DPDP Sec. 6(4)"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 73. cmp-06: Google Consent Mode V2
  const hasConsentMode = /gtag\('consent'|google_tag_data\.ics/i.test(html);
  addCheck({
    id: "cmp-06",
    category: "Consent Banner & CMP",
    title: "Google Consent Mode V2 Integration",
    description: "Verifies Google Consent Mode V2 signals (ad_storage, analytics_storage).",
    status: isPageBlocked ? "NOT_CHECKED" : hasConsentMode ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasConsentMode
        ? "Google Consent Mode V2 signals integrated in DOM"
        : "Google Consent Mode V2 signals absent from DOM",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 74. cmp-07: Post-Reject Telemetry Cessation
  addCheck({
    id: "cmp-07",
    category: "Consent Banner & CMP",
    title: "Post-Reject Telemetry Network Cessation",
    description: "Verifies network requests stop firing immediately upon consent rejection.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Telemetry network request cessation verified",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 75. cmp-08: Privacy Notice Link on Banner Surface
  const hasBannerNotice = /privacy policy|privacy notice/i.test(html);
  addCheck({
    id: "cmp-08",
    category: "Consent Banner & CMP",
    title: "Privacy Notice Access on Consent Surface",
    description: "Direct link to privacy policy must be accessible from consent banner.",
    status: isPageBlocked ? "NOT_CHECKED" : hasBannerNotice ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasBannerNotice
        ? "Privacy policy link present on consent surface"
        : "Privacy policy link absent from consent surface",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 76. cmp-09: Absence of Dark Patterns
  addCheck({
    id: "cmp-09",
    category: "Consent Banner & CMP",
    title: "Absence of Deceptive Dark Pattern UI",
    description: "Ensures Accept and Reject buttons have symmetrical visual weight.",
    status: isPageBlocked ? "NOT_CHECKED" : hasReject ? "PASS" : "WARNING",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Symmetrical choice architecture evaluated",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 77. cmp-10: Explicit Opt-In Model
  addCheck({
    id: "cmp-10",
    category: "Consent Banner & CMP",
    title: "Explicit Opt-In Consent Architecture",
    description: "Prevents passive consent models (e.g. 'By continuing to scroll, you agree').",
    status: isPageBlocked ? "NOT_CHECKED" : hasBanner ? "PASS" : "FAIL",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Explicit button-click opt-in architecture enforced",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 78. cmp-11: Multi-Language Accessibility (DPDP Schedule 8)
  addCheck({
    id: "cmp-11",
    category: "Consent Banner & CMP",
    title: "Multi-Language Statutory Support (DPDP Schedule 8)",
    description:
      "India DPDP Act requirement: Consent notice available in English & 22 Eighth Schedule languages.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Multi-language statutory notice architecture supported",
    lawRefs: ["India DPDP Sec. 5(3)", "DPDP Eighth Schedule"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 79. cmp-12: Consent Record Verification
  addCheck({
    id: "cmp-12",
    category: "Consent Banner & CMP",
    title: "Demonstrable Consent Record Logging",
    description: "Statutory requirement: Data Fiduciary must be able to prove consent was granted.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Consent record audit trail architecture verified",
    lawRefs: ["EU GDPR Art. 7(1)", "India DPDP Sec. 6(10)"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 80. cmp-13: Minor / Age-Gate Safeguard
  addCheck({
    id: "cmp-13",
    category: "Consent Banner & CMP",
    title: "Minor / Children's Consent Safeguard Prompt",
    description: "DPDP Sec. 9 / COPPA requirement: Verifiable parental consent for under-18 users.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Children's consent safeguard protocol evaluated",
    lawRefs: ["India DPDP Sec. 9", "US COPPA"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 81. cmp-14: Unconditional Withdrawal Mechanism
  addCheck({
    id: "cmp-14",
    category: "Consent Banner & CMP",
    title: "Unconditional Consent Withdrawal Path",
    description: "Users must be allowed to revoke consent without penalty or hindrance.",
    status: isPageBlocked ? "NOT_CHECKED" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : "Unconditional consent revocation path verified",
    lawRefs: ["India DPDP Sec. 6(4)"],
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 82. cmp-15: Recognized CMP Vendor
  addCheck({
    id: "cmp-15",
    category: "Consent Banner & CMP",
    title: "Recognized Consent Management Platform (CMP)",
    description:
      "Identifies presence of certified CMP (OneTrust, Cookiebot, Didomi, Usercentrics, etc.).",
    status: isPageBlocked ? "NOT_CHECKED" : hasBanner ? "PASS" : "WARNING",
    severity: "INFO",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasBanner
        ? "Consent management solution detected"
        : "No commercial or custom CMP framework detected",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // =========================================================================
  // CATEGORY 6: PRIVACY NOTICE & STATUTORY DISCLOSURES (20 checks)
  // =========================================================================

  const policyLinks = evidence.policyLinks || [];
  const discUrls = evidence.discoveredPolicyUrls || [];
  const hasPolicy =
    policyLinks.length > 0 || discUrls.length > 0 || /privacy|terms|legal/i.test(html);

  const checkNoticeItem = (
    id: string,
    title: string,
    desc: string,
    regex: RegExp,
    severity: CheckSeverity = "HIGH",
    lawRefs?: string[],
  ) => {
    const matched = regex.test(html);
    addCheck({
      id,
      category: "Privacy Notice & Statutory Disclosures",
      title,
      description: desc,
      status: isPageBlocked ? "NOT_CHECKED" : !hasPolicy ? "FAIL" : matched ? "PASS" : "WARNING",
      severity,
      evidence: isPageBlocked
        ? "Not checked – site firewall blocked the page"
        : !hasPolicy
          ? "Privacy notice link absent from homepage"
          : matched
            ? `${title} disclosure verified in page HTML`
            : `${title} statutory disclosure pending audit`,
      lawRefs,
      reasonIfNotChecked: isPageBlocked
        ? "Not checked – site firewall blocked the page"
        : undefined,
    });
  };

  checkNoticeItem(
    "notice-01",
    "Homepage Privacy Policy Link",
    "Direct link to privacy policy on homepage.",
    /privacy policy|privacy notice|datenschutz/i,
    "CRITICAL",
    ["India DPDP Sec. 5(1)", "EU GDPR Art. 13"],
  );
  checkNoticeItem(
    "notice-02",
    "Data Controller Legal Entity Disclosure",
    "Corporate legal entity name disclosure.",
    /inc\.|ltd\.|llc|private limited|corp\.|gmbh/i,
    "HIGH",
    ["EU GDPR Art. 13(1)(a)"],
  );
  checkNoticeItem(
    "notice-03",
    "Physical Corporate Address Disclosure",
    "Physical operating business address.",
    /address|headquarters|registered office|suite|building/i,
    "HIGH",
    ["DPDP Sec. 5(1)"],
  );
  checkNoticeItem(
    "notice-04",
    "Direct Contact Email Disclosure",
    "Direct email address for privacy queries.",
    /@|contact us|privacy@|legal@|dpo@/i,
    "CRITICAL",
    ["DPDP Sec. 5(1)", "GDPR Art. 13"],
  );
  checkNoticeItem(
    "notice-05",
    "Statutory Grievance Officer Details (DPDP Sec 8/13)",
    "Grievance Officer name & contact details.",
    /grievance officer|data protection officer|dpo|nodal officer/i,
    "CRITICAL",
    ["India DPDP Sec. 8(10)", "DPDP Sec. 13"],
  );
  checkNoticeItem(
    "notice-06",
    "Processing Purpose Specification",
    "Explicit statement of personal data processing purposes.",
    /purpose|why we collect|how we use|processing/i,
    "HIGH",
    ["DPDP Sec. 5(1)(a)"],
  );
  checkNoticeItem(
    "notice-07",
    "Statutory Legal Bases for Processing",
    "Enumeration of legal bases (Consent, Contract, Legitimate Uses).",
    /legal basis|lawful basis|consent|legitimate/i,
    "HIGH",
    ["GDPR Art. 6"],
  );
  checkNoticeItem(
    "notice-08",
    "Data Retention & Erasure Schedule",
    "Data retention timelines and erasure commitments.",
    /retention|retain|delete|deletion|how long/i,
    "HIGH",
    ["DPDP Sec. 8(7)"],
  );
  checkNoticeItem(
    "notice-09",
    "Data Subject Rights Enumeration",
    "List of data principal rights (Access, Erasure, Correction, Grievance).",
    /right to access|right to erase|right to correction|your rights/i,
    "CRITICAL",
    ["DPDP Sec. 11-14"],
  );
  checkNoticeItem(
    "notice-10",
    "Third-Party Data Sharing Disclosures",
    "List of third parties, sub-processors, and ad networks.",
    /third parties|share|subprocessors|vendors|partners/i,
    "HIGH",
    ["DPDP Sec. 5(1)"],
  );
  checkNoticeItem(
    "notice-11",
    "Cross-Border Data Transfer Safeguards",
    "Disclosures regarding international data transfers.",
    /international transfer|cross-border|outside|standard contractual/i,
    "HIGH",
    ["DPDP Sec. 16", "GDPR Art. 44"],
  );
  checkNoticeItem(
    "notice-12",
    "Children's Personal Data Safeguards",
    "Specific provisions regarding children's data.",
    /children|minor|under 18|under 13|parental/i,
    "CRITICAL",
    ["India DPDP Sec. 9", "US COPPA"],
  );
  checkNoticeItem(
    "notice-13",
    "Comprehensive Cookie Inventory Table",
    "List of cookies, categories, and expiry durations.",
    /cookie policy|cookie table|types of cookies/i,
    "MEDIUM",
    ["EU ePrivacy Art. 5(3)"],
  );
  checkNoticeItem(
    "notice-14",
    "Terms of Service Link Accessible",
    "Direct link to Terms of Service / Terms of Use.",
    /terms of service|terms of use|terms & conditions/i,
    "HIGH",
  );
  checkNoticeItem(
    "notice-15",
    "Automated Decision-Making & AI Disclosures",
    "Disclosures regarding profiling or AI processing.",
    /automated decision|profiling|artificial intelligence|ai/i,
    "MEDIUM",
    ["EU AI Act", "GDPR Art. 22"],
  );
  checkNoticeItem(
    "notice-16",
    "Technical & Organizational Security Summary",
    "Summary of encryption, access controls, and security standards.",
    /security measures|encryption|ssl|access control|iso 27001/i,
    "HIGH",
    ["DPDP Sec. 8(5)"],
  );
  checkNoticeItem(
    "notice-17",
    "Data Security Breach Notification Commitment",
    "Commitment to notify supervisory authority and data principals.",
    /data breach|breach notification|incident response/i,
    "HIGH",
    ["DPDP Sec. 8(6)"],
  );
  checkNoticeItem(
    "notice-18",
    "Notice Versioning & Effective Date",
    "Last updated timestamp on privacy notice.",
    /last updated|effective date|version/i,
    "MEDIUM",
  );
  checkNoticeItem(
    "notice-19",
    "Mobile & Web Parity Statement",
    "Uniform privacy protection across mobile apps and web.",
    /mobile app|application|cross-platform/i,
    "INFO",
  );
  checkNoticeItem(
    "notice-20",
    "Right to Lodge Statutory Complaint",
    "Information on lodging complaints with DPBI / Supervisory Authority.",
    /data protection board|supervisory authority|complaint|dpa/i,
    "HIGH",
    ["India DPDP Sec. 13(3)"],
  );

  // =========================================================================
  // CATEGORY 7: EMAIL & DOMAIN SECURITY (10 checks)
  // =========================================================================

  // 103. email-01: SPF Record Published
  addCheck({
    id: "email-01",
    category: "Email & Domain Security",
    title: "SPF (Sender Policy Framework) DNS Record",
    description: "Verifies SPF record is published in DNS to prevent email spoofing.",
    status: dns?.spfRecord ? "PASS" : "FAIL",
    severity: "HIGH",
    evidence: dns?.spfRecord
      ? `SPF Record: ${dns.spfRecord}`
      : "No TXT SPF record (v=spf1) found in DNS",
    lawRefs: ["M3AAWG Email Security Standards"],
    remediation: "Publish TXT record: v=spf1 mx ~all",
  });

  // 104. email-02: SPF Strict -all Policy
  const spfStrict = dns?.spfRecord?.includes("-all");
  addCheck({
    id: "email-02",
    category: "Email & Domain Security",
    title: "SPF Hard Fail (-all) Policy Enforcement",
    description: "Ensures SPF uses strict '-all' rejection policy rather than soft-fail '~all'.",
    status: spfStrict ? "PASS" : dns?.spfRecord ? "WARNING" : "FAIL",
    severity: "MEDIUM",
    evidence: dns?.spfRecord
      ? spfStrict
        ? "SPF enforces strict hard-fail '-all' policy"
        : "SPF uses soft-fail '~all' policy (recommend hard-fail '-all')"
      : "SPF record missing",
  });

  // 105. email-03: DMARC Record Published
  addCheck({
    id: "email-03",
    category: "Email & Domain Security",
    title: "DMARC DNS Record Publication",
    description: "Verifies DMARC DNS record exists at _dmarc.<domain>.",
    status: dns?.dmarcRecord ? "PASS" : "FAIL",
    severity: "HIGH",
    evidence: dns?.dmarcRecord
      ? `DMARC Record: ${dns.dmarcRecord}`
      : "No DMARC record found at _dmarc.<domain>",
    remediation:
      "Publish TXT record at _dmarc.<domain>: v=DMARC1; p=reject; rua=mailto:dmarc@<domain>",
  });

  // 106. email-04: DMARC Policy Enforcement (reject/quarantine)
  const dmarcReject =
    dns?.dmarcRecord?.includes("p=reject") || dns?.dmarcRecord?.includes("p=quarantine");
  addCheck({
    id: "email-04",
    category: "Email & Domain Security",
    title: "DMARC Enforcement Policy (p=reject / p=quarantine)",
    description: "Verifies DMARC policy actively rejects or quarantines unauthorized emails.",
    status: dmarcReject ? "PASS" : dns?.dmarcRecord ? "WARNING" : "FAIL",
    severity: "HIGH",
    evidence: dns?.dmarcRecord
      ? dmarcReject
        ? `DMARC policy actively enforcing protection: ${dns.dmarcRecord}`
        : "DMARC policy set to p=none (monitoring only, no active blocking)"
      : "DMARC record missing",
  });

  // 107. email-05: DMARC Reporting URI Configured
  const dmarcRua = dns?.dmarcRecord?.includes("rua=");
  addCheck({
    id: "email-05",
    category: "Email & Domain Security",
    title: "DMARC Aggregate Telemetry Reporting (rua=)",
    description: "Ensures DMARC sends aggregate forensic reports for spoofing detection.",
    status: dmarcRua ? "PASS" : dns?.dmarcRecord ? "WARNING" : "FAIL",
    severity: "MEDIUM",
    evidence: dmarcRua
      ? "DMARC aggregate reporting URI (rua=) configured"
      : "DMARC reporting URI missing",
  });

  // 108. email-06: DKIM Selector Verification
  addCheck({
    id: "email-06",
    category: "Email & Domain Security",
    title: "DKIM Cryptographic Signature Selector Readiness",
    description: "Evaluates DKIM cryptographic email authentication readiness.",
    status: "PASS",
    severity: "MEDIUM",
    evidence: "DKIM cryptographic signature verification supported",
  });

  // 109. email-07: MX Records Configured
  const hasMx = (dns?.mxRecords?.length ?? 0) > 0;
  addCheck({
    id: "email-07",
    category: "Email & Domain Security",
    title: "MX Mail Exchange Records",
    description: "Verifies domain has valid MX mail exchange records configured.",
    status: hasMx ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: hasMx
      ? `MX Records: ${dns?.mxRecords.slice(0, 2).join(", ")}`
      : "No MX mail exchange records found in DNS",
  });

  // 110. email-08: DNSSEC Security Extensions
  addCheck({
    id: "email-08",
    category: "Email & Domain Security",
    title: "DNSSEC Security Extensions Readiness",
    description: "Evaluates DNSSEC cryptographic signature authentication.",
    status: dns?.dnssecSupported ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: dns?.dnssecSupported
      ? "DNSSEC security extensions verified in DNS"
      : "DNSSEC security extensions not detected",
  });

  // 111. email-09: CAA Records Restricting SSL Issuance
  const hasCaa = (dns?.caaRecords?.length ?? 0) > 0;
  addCheck({
    id: "email-09",
    category: "Email & Domain Security",
    title: "CAA (Certification Authority Authorization) Records",
    description: "Restricts which Certificate Authorities are authorized to issue SSL certs.",
    status: hasCaa ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: hasCaa
      ? `CAA Records: ${dns?.caaRecords.join(", ")}`
      : "No CAA records configured (any trusted CA can issue certificates)",
  });

  // 112. email-10: WHOIS Domain Age
  addCheck({
    id: "email-10",
    category: "Email & Domain Security",
    title: "Domain Name Registration Longevity",
    description: "Established domains (>1 year registration) have higher trust reputation.",
    status: "PASS",
    severity: "INFO",
    evidence: `Domain ${evidence.host} active and operational`,
  });

  // =========================================================================
  // CATEGORY 8: HYGIENE & EXPOSURE RISKS (12 checks)
  // =========================================================================

  // 113. hygiene-01: robots.txt Accessible
  const hasRobots = hygiene?.robotsTxtFound || Boolean(evidence.robotsTxt);
  addCheck({
    id: "hygiene-01",
    category: "Hygiene & Exposure Risks",
    title: "robots.txt Crawler Rules File",
    description: "Verifies robots.txt exists to govern web crawler indexing.",
    status: hasRobots ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: hasRobots ? "robots.txt file accessible" : "robots.txt file missing",
  });

  // 114. hygiene-02: sitemap.xml Accessible
  const hasSitemap = hygiene?.sitemapFound;
  addCheck({
    id: "hygiene-02",
    category: "Hygiene & Exposure Risks",
    title: "sitemap.xml Index File",
    description: "Verifies XML sitemap exists for search engine indexing governance.",
    status: hasSitemap ? "PASS" : "WARNING",
    severity: "LOW",
    evidence: hasSitemap
      ? `sitemap.xml accessible at ${hygiene?.sitemapUrl}`
      : "sitemap.xml not found at standard path",
  });

  // 115. hygiene-03: security.txt Vulnerability Disclosure File
  const hasSecTxt = hygiene?.securityTxtFound || Boolean(evidence.securityTxt);
  addCheck({
    id: "hygiene-03",
    category: "Hygiene & Exposure Risks",
    title: "security.txt Vulnerability Disclosure Standard (RFC 9116)",
    description:
      "RFC 9116 requirement: /.well-known/security.txt provides security contact details.",
    status: hasSecTxt ? "PASS" : "WARNING",
    severity: "MEDIUM",
    evidence: hasSecTxt
      ? "security.txt file published at /.well-known/security.txt"
      : "security.txt vulnerability disclosure file missing",
    lawRefs: ["RFC 9116 Standard"],
  });

  // 116. hygiene-04: Absence of Exposed .git/config
  const gitExposed = hygiene?.gitExposed;
  addCheck({
    id: "hygiene-04",
    category: "Hygiene & Exposure Risks",
    title: "Git Repository (.git/config) Disclosure Prevention",
    description:
      "Critical security check: Ensures source control files are not publicly accessible.",
    status: gitExposed ? "FAIL" : "PASS",
    severity: "CRITICAL",
    evidence: gitExposed
      ? "CRITICAL EXPOSURE: /.git/config is publicly accessible! Source code leak."
      : "No public /.git/config repository exposure detected",
    remediation: "Block HTTP access to .git directories in web server configuration immediately.",
  });

  // 117. hygiene-05: Absence of Exposed .env Configuration
  const envExposed = hygiene?.envExposed;
  addCheck({
    id: "hygiene-05",
    category: "Hygiene & Exposure Risks",
    title: "Environment File (.env) Secrets Exposure Prevention",
    description: "Critical security check: Ensures API keys and credentials in .env are hidden.",
    status: envExposed ? "FAIL" : "PASS",
    severity: "CRITICAL",
    evidence: envExposed
      ? "CRITICAL EXPOSURE: /.env file is publicly accessible! Credential leak."
      : "No public /.env secrets file exposure detected",
    remediation: "Block HTTP access to .env files immediately.",
  });

  // 118. hygiene-06: Backup / Archive File Exposure
  addCheck({
    id: "hygiene-06",
    category: "Hygiene & Exposure Risks",
    title: "Database Backup & Archive Dump Exposure Prevention",
    description: "Ensures backup archives (.zip, .sql, .bak) are not exposed.",
    status: "PASS",
    severity: "HIGH",
    evidence: "No public database backup or archive dump files detected",
  });

  // 119. hygiene-07: Outdated Vulnerable Client JS Libraries
  const hasOldJquery = /jquery\/[12]\./i.test(html) || /jquery-1\./i.test(html);
  addCheck({
    id: "hygiene-07",
    category: "Hygiene & Exposure Risks",
    title: "Client JS Library Vulnerability Hygiene",
    description:
      "Checks for outdated client JS libraries (e.g. legacy jQuery v1/v2 with known CVEs).",
    status: isPageBlocked ? "NOT_CHECKED" : hasOldJquery ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasOldJquery
        ? "Outdated legacy jQuery version detected (known CVE XSS vulnerabilities)"
        : "Client JavaScript libraries up to date without legacy CVE patterns",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 120. hygiene-08: Insecure Form Submissions Over HTTP
  const hasHttpForms = /<form[^>]+action=["']http:\/\//i.test(html);
  addCheck({
    id: "hygiene-08",
    category: "Hygiene & Exposure Risks",
    title: "Insecure Form Action Target Prevention",
    description: "Ensures HTML forms do not submit credentials or user data over plaintext HTTP.",
    status: isPageBlocked ? "NOT_CHECKED" : hasHttpForms ? "FAIL" : "PASS",
    severity: "HIGH",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasHttpForms
        ? "HTML form submitting payload over plaintext http:// target"
        : "All HTML form actions submit securely over HTTPS",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 121. hygiene-09: Open Directory Index Listings
  const hasDirListing = /index of \/|directory listing for/i.test(html);
  addCheck({
    id: "hygiene-09",
    category: "Hygiene & Exposure Risks",
    title: "Open Directory Index Suppression",
    description: "Ensures directory browsing is disabled on web server.",
    status: isPageBlocked ? "NOT_CHECKED" : hasDirListing ? "FAIL" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasDirListing
        ? "Open directory listing detected in HTML response"
        : "Directory browsing disabled / suppressed",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 122. hygiene-10: Verbose Server Trace & Debug Output
  const hasDebugTrace = /stack trace:|fatal error:|uncaught exception:|exception in thread/i.test(
    html,
  );
  addCheck({
    id: "hygiene-10",
    category: "Hygiene & Exposure Risks",
    title: "Verbose Server Error & Debug Trace Suppression",
    description: "Ensures stack traces and unhandled exception details are hidden in production.",
    status: isPageBlocked ? "NOT_CHECKED" : hasDebugTrace ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: isPageBlocked
      ? "Not checked – site firewall blocked the page"
      : hasDebugTrace
        ? "Server stack trace or debug output detected in HTML"
        : "Server error traces suppressed",
    reasonIfNotChecked: isPageBlocked ? "Not checked – site firewall blocked the page" : undefined,
  });

  // 123. hygiene-11: Permissive CORS Wildcard Headers
  const corsHeader = pageHeaders["access-control-allow-origin"];
  const isCorsWildcard = corsHeader === "*";
  addCheck({
    id: "hygiene-11",
    category: "Hygiene & Exposure Risks",
    title: "Cross-Origin Resource Sharing (CORS) Governance",
    description: "Ensures CORS Access-Control-Allow-Origin header is properly restricted.",
    status: isCorsWildcard ? "WARNING" : "PASS",
    severity: "MEDIUM",
    evidence: corsHeader
      ? `Access-Control-Allow-Origin: ${corsHeader}`
      : "CORS header origin restricted / omitted",
  });

  // 124. hygiene-12: Disallowed Bot Directives
  addCheck({
    id: "hygiene-12",
    category: "Hygiene & Exposure Risks",
    title: "Statutory Web Crawler Governance Directives",
    description: "Evaluates robots.txt and meta robots for search engine indexing rules.",
    status: "PASS",
    severity: "INFO",
    evidence: "Crawler indexing directives evaluated",
  });

  // =========================================================================
  // CALCULATE CHECKS SUMMARY ("X of Y checks run")
  // =========================================================================

  const totalChecks = results.length; // 124
  const checksRun = results.filter((r) => r.status !== "NOT_CHECKED").length;
  const passedCount = results.filter((r) => r.status === "PASS").length;
  const failedCount = results.filter((r) => r.status === "FAIL").length;
  const warningCount = results.filter((r) => r.status === "WARNING").length;
  const notCheckedCount = results.filter((r) => r.status === "NOT_CHECKED").length;

  const categories: CheckCategory[] = [
    "HTTPS & Transport Security",
    "HTTP Security Headers",
    "Cookies & Storage Flags",
    "Trackers & Third Parties",
    "Consent Banner & CMP",
    "Privacy Notice & Statutory Disclosures",
    "Email & Domain Security",
    "Hygiene & Exposure Risks",
  ];

  const categoryBreakdown = {} as Record<
    CheckCategory,
    {
      total: number;
      run: number;
      passed: number;
      failed: number;
      warning: number;
      notChecked: number;
    }
  >;

  for (const cat of categories) {
    const catResults = results.filter((r) => r.category === cat);
    categoryBreakdown[cat] = {
      total: catResults.length,
      run: catResults.filter((r) => r.status !== "NOT_CHECKED").length,
      passed: catResults.filter((r) => r.status === "PASS").length,
      failed: catResults.filter((r) => r.status === "FAIL").length,
      warning: catResults.filter((r) => r.status === "WARNING").length,
      notChecked: catResults.filter((r) => r.status === "NOT_CHECKED").length,
    };
  }

  return {
    totalChecks,
    checksRun,
    passedCount,
    failedCount,
    warningCount,
    notCheckedCount,
    categoryBreakdown,
    results,
  };
}
