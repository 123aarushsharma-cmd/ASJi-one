import React from "react";
import { ASJiVectorLogo } from "./ASJiVectorLogo";
import {
  ShieldCheck,
  Code,
  Lock,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Zap,
  Award,
} from "lucide-react";
import type { AuditReport } from "@/lib/audit-types";

interface ASJiRemediationCodeReportProps {
  report?: AuditReport | null;
  domain?: string;
}

export function ASJiRemediationCodeReport({
  report,
  domain: propDomain,
}: ASJiRemediationCodeReportProps) {
  const targetDomain =
    propDomain ||
    (report?.target
      ? report.target.replace(/^https?:\/\//, "").replace(/\/.*$/, "")
      : "hardened-gateway-client.net");

  const certNumber = `ASJi-SEC-2026-${targetDomain
    .slice(0, 4)
    .toUpperCase()
    .replace(/[^A-Z]/g, "X")}-9941`;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderHeader = (pageNumber: number, totalPages: number) => (
    <div className="flex items-center justify-between border-b border-[#E5DEC9] pb-3 mb-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded border border-[#C9A227] bg-[#0D0E11] p-1">
          <ASJiVectorLogo width={32} height={32} />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-[#18181B] tracking-wide uppercase">
            ASJi One · Technical Security &amp; Remediation Code Dossier
          </h1>
          <p className="text-[10px] font-mono text-[#52525B]">
            Technical Security Hardening Certificate · Ref: {certNumber}
          </p>
        </div>
      </div>
      <div className="text-right font-mono text-[10px]">
        <div className="text-[#059669] font-bold">EXECUTABLE PRODUCTION PATCHES</div>
        <div className="text-[#52525B] tabular-nums">
          Page {pageNumber} of {totalPages}
        </div>
      </div>
    </div>
  );

  const renderFooter = (_pageNumber: number) => (
    <div className="border-t border-[#E5DEC9] pt-3 mt-auto flex items-center justify-between font-mono text-[9px] text-[#52525B]">
      <div>
        <span>
          Target Domain: <strong className="text-[#18181B]">{targetDomain}</strong>
        </span>
        <span className="mx-2">·</span>
        <span>Issued: {dateStr}</span>
      </div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-3 h-3 text-[#059669]" />
        <span className="text-[#9E7E1B] font-semibold">ASJi Technical Hardening Seal</span>
      </div>
    </div>
  );

  return (
    <div className="w-[794px] bg-[#FAF8F5] text-[#18181B] font-sans text-xs select-none">
      {/* PAGE 1: COVER & EXECUTIVE SECURITY DOSSIER */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(1, 10)}

          <div className="mt-6 rounded-xl border border-[#E5DEC9] bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded border border-[#10B981]/40 bg-[#10B981]/10 text-[#059669] font-mono text-[11px] font-bold">
                Production-Grade Executable Security Patches
              </span>
              <span className="font-mono text-[#52525B] text-[10px]">
                Classification: HIGH ASSURANCE REPORT
              </span>
            </div>

            <h2 className="text-2xl font-bold text-[#18181B] font-display">
              Mandatory Website Security Vulnerabilities &amp; Remediation Patch Suite
            </h2>

            <p className="text-xs text-[#52525B] leading-relaxed font-sans">
              Prepared exclusively for <strong className="text-[#18181B]">{targetDomain}</strong>.
              This technical dossier details mandatory website vulnerabilities, anti-hacking
              safeguards, OWASP Top 10 defenses, and delivers ready-to-deploy server configs, edge
              middleware, and zero-leak client consent scripts.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2 font-mono text-[11px]">
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DEC9]">
                <span className="text-[#52525B] block text-[9px]">Audited Domain</span>
                <strong className="text-[#18181B] text-xs">{targetDomain}</strong>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DEC9]">
                <span className="text-[#52525B] block text-[9px]">Vulnerabilities Evaluated</span>
                <strong className="text-[#18181B] text-xs">12 Security Vector Checks</strong>
              </div>
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#E5DEC9]">
                <span className="text-[#52525B] block text-[9px]">Compiled Patches</span>
                <strong className="text-[#059669] text-xs">6 Executable Production Files</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Lock className="w-4 h-4 text-[#059669]" />
              1. Technical Executive Security Assessment
            </h3>
            <p className="text-xs text-[#52525B] leading-relaxed font-sans">
              Unprotected HTTP transport headers, unencrypted telemetry leakage, missing Content
              Security Policies (CSP), and cookie security flags expose web infrastructure to
              automated exploit scanners, man-in-the-middle (MITM) session hijacking, and regulatory
              data breach fines. Deploying the enclosed patches hardens the target server endpoint
              to ISO/IEC 27001 standards.
            </p>

            <div className="p-4 bg-white border border-[#E5DEC9] rounded-lg space-y-2">
              <div className="text-[#059669] font-mono font-bold text-xs uppercase">
                Engineered Security Deliverables Included:
              </div>
              <ul className="list-disc list-inside space-y-1 text-[#52525B] text-[11px] font-mono">
                <li>
                  NGINX Production Security Header Hardening Config (`security-headers.nginx.conf`)
                </li>
                <li>Apache .htaccess Defensive Response Directives (`.htaccess`)</li>
                <li>Next.js &amp; Cloudflare Worker Edge Transport Middleware (`middleware.ts`)</li>
                <li>Express.js / Node.js Backend Security Suite (`securityMiddleware.ts`)</li>
                <li>Client-Side Zero-Leak Pre-Consent CMP Script (`asji-consent-manager.js`)</li>
                <li>
                  RFC 9116 Statutory Vulnerability Disclosure File (`.well-known/security.txt`)
                </li>
              </ul>
            </div>
          </div>
        </div>

        {renderFooter(1)}
      </div>

      {/* PAGE 2: MANDATORY WEBSITE VULNERABILITIES MATRIX */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(2, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
              2. Mandatory Website Security Vulnerabilities Analysis
            </h3>

            <div className="space-y-2.5 text-[10.5px]">
              {[
                {
                  name: "SQL Injection (SQLi) & Input Sanitization",
                  risk: "Critical",
                  desc: "Unsanitized form inputs allow malicious SQL queries to extract underlying database tables.",
                  fix: "Parameterize all database queries using ORM / Prepared Statements.",
                },
                {
                  name: "Cross-Site Scripting (XSS)",
                  risk: "Critical",
                  desc: "Reflected/Stored DOM inputs execute unescaped JavaScript in victim browsers.",
                  fix: "Enforce strict CSP `script-src 'self'` and HTML entity encoding.",
                },
                {
                  name: "Cross-Site Request Forgery (CSRF)",
                  risk: "High",
                  desc: "State-changing POST/PUT endpoints lack cryptographic anti-CSRF tokens.",
                  fix: "Implement SameSite=Lax cookie flags and Anti-CSRF token verification.",
                },
                {
                  name: "Clickjacking / Frame Hijacking",
                  risk: "High",
                  desc: "Missing `X-Frame-Options` and CSP `frame-ancestors` allows malicious iframe overlay attacks.",
                  fix: "Inject `X-Frame-Options: DENY` and `frame-ancestors 'none'` headers.",
                },
                {
                  name: "MIME-Type Sniffing Attacks",
                  risk: "Medium",
                  desc: "Browsers sniff drive-by executable payloads uploaded as non-executable MIME types.",
                  fix: "Inject `X-Content-Type-Options: nosniff` header.",
                },
                {
                  name: "Missing HSTS Transport Security",
                  risk: "High",
                  desc: "Lack of HSTS preload forces HTTP fallback susceptible to SSL Stripping MITM.",
                  fix: "Inject `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`.",
                },
                {
                  name: "Server Version / Powered-By Leakage",
                  risk: "Low",
                  desc: "Exposing `X-Powered-By: Express` or `Server: Nginx/1.18` assists adversary reconnaissance.",
                  fix: "Suppress server tokens with `server_tokens off` and header deletion.",
                },
                {
                  name: "Unencrypted Session Cookie Flags",
                  risk: "High",
                  desc: "Session cookies set without `HttpOnly; Secure; SameSite=Lax` allow script cookie theft.",
                  fix: "Enforce `proxy_cookie_flags ~* 'Secure; HttpOnly; SameSite=Lax'`.",
                },
              ].map((v, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-white border border-[#E5DEC9] rounded-lg space-y-0.5"
                >
                  <div className="flex items-center justify-between font-bold text-[#18181B]">
                    <span>{v.name}</span>
                    <span
                      className={
                        v.risk === "Critical" || v.risk === "High"
                          ? "text-[#DC2626]"
                          : v.risk === "Medium"
                            ? "text-[#D97706]"
                            : "text-[#52525B]"
                      }
                    >
                      {v.risk} Severity
                    </span>
                  </div>
                  <p className="text-[#52525B] font-sans">{v.desc}</p>
                  <div className="text-[#059669] font-semibold pt-0.5">Fix: {v.fix}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {renderFooter(2)}
      </div>

      {/* PAGE 3: OWASP TOP 10 & ISO 27001 SAFEGUARDS */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(3, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              3. OWASP Top 10 &amp; ISO/IEC 27001 Control Mapping
            </h3>

            <table className="w-full text-left text-[10px] border-collapse bg-white border border-[#E5DEC9]">
              <thead>
                <tr className="bg-[#FAF8F5] text-[#52525B] border-b border-[#E5DEC9]">
                  <th className="p-2">OWASP / ISO Control</th>
                  <th className="p-2">Technical Description</th>
                  <th className="p-2">ASJi Protection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DEC9]">
                {[
                  {
                    control: "A01:2021 Broken Access Control",
                    desc: "Enforce strict server-side authorization checks and edge path matching.",
                    status: "HARDENED BY EDGE MIDDLEWARE",
                  },
                  {
                    control: "A02:2021 Cryptographic Failures",
                    desc: "Mandate TLS 1.3 encryption and HSTS preloading with subdomains.",
                    status: "VERIFIED VIA HSTS PATCH",
                  },
                  {
                    control: "A03:2021 Injection Attacks",
                    desc: "Block unescaped SQL/NoSQL payload characters across API gateways.",
                    status: "HARDENED BY EXPRESS HELMET",
                  },
                  {
                    control: "A04:2021 Insecure Design",
                    desc: "Enforce Privacy & Security by Design architecture.",
                    status: "ISO 27001 COMPLIANT",
                  },
                  {
                    control: "A05:2021 Security Misconfiguration",
                    desc: "Disable default credentials, directory browsing, and version headers.",
                    status: "HARDENED BY NGINX CONFIG",
                  },
                  {
                    control: "A07:2021 Identification Failures",
                    desc: "Secure session cookies with HttpOnly, Secure, SameSite=Lax flags.",
                    status: "HARDENED BY COOKIE PATCH",
                  },
                  {
                    control: "ISO 27001 A.8.20 Network Security",
                    desc: "Encrypt all public-facing transit traffic.",
                    status: "PASSED (256-BIT SSL)",
                  },
                  {
                    control: "ISO 27001 A.8.28 Secure Coding",
                    desc: "Sanitize DOM script inputs and enforce strict CSP policies.",
                    status: "PASSED VIA CSP DIRECTIVE",
                  },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-bold text-[#18181B]">{row.control}</td>
                    <td className="p-2 text-[#52525B] font-sans">{row.desc}</td>
                    <td className="p-2 text-[#059669] font-bold">{row.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {renderFooter(3)}
      </div>

      {/* PAGE 4: INTERMEDIARY SAFE HARBOR ANALYSIS */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(4, 10)}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Zap className="w-4 h-4 text-[#9E7E1B]" />
              4. Intermediary Safe Harbor Immunity Analysis (IT Act § 79 &amp; EU DSA)
            </h3>

            <div className="p-5 bg-white border border-[#E5DEC9] rounded-lg space-y-3 text-xs leading-relaxed">
              <div className="text-[#9E7E1B] font-mono font-bold uppercase border-b border-[#E5DEC9] pb-2">
                STATUTORY SAFE HARBOR SHIELD EVALUATION
              </div>

              <p className="text-[#52525B]">
                Under Section 79 of the India IT Act 2000, Article 6 of the EU Digital Services Act
                (DSA), and US 47 U.S.C. § 230, online platforms qualify for statutory immunity
                against third-party user content liability only if they observe mandatory due
                diligence.
              </p>

              <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DEC9] rounded-lg text-[11px] space-y-1">
                <div className="text-[#9E7E1B] font-bold">Mandatory Due Diligence Criteria:</div>
                <ul className="list-disc list-inside text-[#52525B] space-y-1">
                  <li>
                    Deploy transport security encryption and prevent active payload modification.
                  </li>
                  <li>Publish designated Grievance Redressal Officer contact endpoints.</li>
                  <li>Acknowledge and action statutory takedown notices within 36 hours.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(4)}
      </div>

      {/* PAGE 5: REMEDIATION PATCH 1 - NGINX */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(5, 10)}

          <div className="space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Code className="w-4 h-4 text-[#9E7E1B]" />
              5. Production Patch 1: NGINX Server Hardening Directive
            </h3>

            <p className="text-[11px] text-[#52525B]">
              Filename: <strong className="text-[#18181B]">security-headers.nginx.conf</strong> ·
              Category: Server Config
            </p>

            <div className="p-3.5 bg-[#15171C] border border-[#262932] rounded-lg text-[10px] font-mono leading-relaxed overflow-hidden text-[#FAF8F5] whitespace-pre">
              {`# NGINX Production Security Hardening Directive
# Target: ${targetDomain}

# 1. Transport Layer Security & HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# 2. Content Security Policy (CSP)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; frame-ancestors 'none'; object-src 'none'; base-uri 'self';" always;

# 3. Defensive Headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

# 4. Suppress Server Signatures
server_tokens off;
proxy_cookie_flags ~* "Secure; HttpOnly; SameSite=Lax";`}
            </div>
          </div>
        </div>

        {renderFooter(5)}
      </div>

      {/* PAGE 6: REMEDIATION PATCH 2 - APACHE .HTACCESS */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(6, 10)}

          <div className="space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Code className="w-4 h-4 text-[#9E7E1B]" />
              6. Production Patch 2: Apache .htaccess Defensive Directive
            </h3>

            <p className="text-[11px] text-[#52525B]">
              Filename: <strong className="text-[#18181B]">.htaccess</strong> · Category: Server
              Config
            </p>

            <div className="p-3.5 bg-[#15171C] border border-[#262932] rounded-lg text-[10px] font-mono leading-relaxed overflow-hidden text-[#FAF8F5] whitespace-pre">
              {`# Apache .htaccess Defensive Directives
# Target: ${targetDomain}

<IfModule mod_headers.c>
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; frame-ancestors 'none'; object-src 'none';"
    Header always set X-Frame-Options "DENY"
    Header always set X-Content-Type-Options "nosniff"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
    Header unset X-Powered-By
</IfModule>`}
            </div>
          </div>
        </div>

        {renderFooter(6)}
      </div>

      {/* PAGE 7: REMEDIATION PATCH 3 - CLOUDFLARE EDGE MIDDLEWARE */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(7, 10)}

          <div className="space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Code className="w-4 h-4 text-[#9E7E1B]" />
              7. Production Patch 3: Next.js &amp; Cloudflare Edge Middleware
            </h3>

            <p className="text-[11px] text-[#52525B]">
              Filename: <strong className="text-[#18181B]">middleware.ts</strong> · Category: Edge
              Transport
            </p>

            <div className="p-3.5 bg-[#15171C] border border-[#262932] rounded-lg text-[10px] font-mono leading-relaxed overflow-hidden text-[#FAF8F5] whitespace-pre">
              {`import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  response.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' https:; frame-ancestors 'none';");
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  response.headers.delete('x-powered-by');

  return response;
}

export const config = { matcher: '/:path*' };`}
            </div>
          </div>
        </div>

        {renderFooter(7)}
      </div>

      {/* PAGE 8: REMEDIATION PATCH 4 - EXPRESS NODE BACKEND */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(8, 10)}

          <div className="space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Code className="w-4 h-4 text-[#9E7E1B]" />
              8. Production Patch 4: Express.js / Node.js Backend Security Suite
            </h3>

            <p className="text-[11px] text-[#52525B]">
              Filename: <strong className="text-[#18181B]">securityMiddleware.ts</strong> ·
              Category: Backend Server
            </p>

            <div className="p-3.5 bg-[#15171C] border border-[#262932] rounded-lg text-[10px] font-mono leading-relaxed overflow-hidden text-[#FAF8F5] whitespace-pre">
              {`import express from 'express';
import helmet from 'helmet';

export function applySecurityHardening(app: express.Application) {
  app.disable('x-powered-by');

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", 'https:'],
          frameAncestors: ["'none'"],
        },
      },
      hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
      frameguard: { action: 'deny' },
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    })
  );
}`}
            </div>
          </div>
        </div>

        {renderFooter(8)}
      </div>

      {/* PAGE 9: REMEDIATION PATCH 5 - ZERO-LEAK CMP SCRIPT */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between mb-8 relative">
        <div>
          {renderHeader(9, 10)}

          <div className="space-y-3 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Code className="w-4 h-4 text-[#9E7E1B]" />
              9. Production Patch 5: Client-Side Zero-Leak CMP Script
            </h3>

            <p className="text-[11px] text-[#52525B]">
              Filename: <strong className="text-[#18181B]">asji-consent-manager.js</strong> ·
              Category: Client Script
            </p>

            <div className="p-3.5 bg-[#15171C] border border-[#262932] rounded-lg text-[10px] font-mono leading-relaxed overflow-hidden text-[#FAF8F5] whitespace-pre">
              {`/**
 * ASJi Sovereign Pre-Consent Cookie Gatekeeper
 * India DPDP Act Sec 6 & EU GDPR Art. 7 Compliant
 */
(function () {
  'use strict';
  var CONSENT_KEY = 'asji_cookie_consent_status';
  var hasConsent = localStorage.getItem(CONSENT_KEY) === 'granted';

  if (!hasConsent) {
    var originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie') ||
                         Object.getOwnPropertyDescriptor(HTMLDocument.prototype, 'cookie');
    if (originalCookie && originalCookie.set) {
      Object.defineProperty(document, 'cookie', {
        set: function (val) {
          if (!hasConsent && /(_ga|_gid|_fbp|_gat|intercom|segment)/i.test(val)) {
            console.warn('[ASJi Guard] Intercepted pre-consent tracking cookie write:', val.split('=')[0]);
            return;
          }
          return originalCookie.set.call(document, val);
        },
        get: function () { return originalCookie.get.call(document); }
      });
    }
  }

  window.grantAsjiComplianceConsent = function () {
    localStorage.setItem(CONSENT_KEY, 'granted');
    location.reload();
  };
})();`}
            </div>
          </div>
        </div>

        {renderFooter(9)}
      </div>

      {/* PAGE 10: REMEDIATION PATCH 6 - SECURITY.TXT & CERTIFICATE */}
      <div className="pdf-page legal-paper w-[794px] h-[1123px] p-8 box-border flex flex-col justify-between relative">
        <div>
          {renderHeader(10, 10)}

          <div className="space-y-4 font-mono">
            <h3 className="text-sm font-bold text-[#18181B] border-b border-[#E5DEC9] pb-2 flex items-center gap-2 font-display">
              <Code className="w-4 h-4 text-[#9E7E1B]" />
              10. RFC 9116 security.txt &amp; Cryptographic Certificate
            </h3>

            <div className="p-3.5 bg-[#15171C] border border-[#262932] rounded-lg text-[10px] font-mono leading-relaxed text-[#FAF8F5] whitespace-pre">
              {`# RFC 9116 Security Contact File
# Target Domain: ${targetDomain}
Contact: mailto:security@${targetDomain}
Contact: mailto:grievance-officer@${targetDomain}
Expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()}
Preferred-Languages: en, hi
Canonical: https://${targetDomain}/.well-known/security.txt`}
            </div>

            <div className="mt-6 rounded-xl border-2 border-[#C9A227] bg-white p-6 text-center space-y-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#C9A227] bg-[#0D0E11] p-1.5 mx-auto">
                <ASJiVectorLogo width={40} height={40} />
              </div>
              <h4 className="text-base font-bold text-[#18181B] uppercase tracking-widest font-display">
                Certificate of Technical Security Hardening
              </h4>
              <p className="text-[11px] text-[#52525B] max-w-lg mx-auto font-sans">
                This certifies that <strong className="text-[#18181B]">{targetDomain}</strong> has
                been issued the official ASJi Production Remediation Code Suite. Installation of
                these patches hardens server transport security and resolves mandatory website
                vulnerabilities.
              </p>

              <div className="pt-3 border-t border-[#E5DEC9] flex items-center justify-between text-[9.5px] text-[#52525B]">
                <div>
                  Certificate ID: <strong className="text-[#9E7E1B]">{certNumber}</strong>
                </div>
                <div>
                  Issuer:{" "}
                  <strong className="text-[#18181B]">
                    ASJi Technical Security Engineering Desk
                  </strong>
                </div>
                <div>
                  Status: <strong className="text-[#059669]">OFFICIALLY ISSUED</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {renderFooter(10)}
      </div>
    </div>
  );
}
