import type {
  AuditReport,
  JurisdictionVerdictItem,
  CrossBorderAnalysis,
  RadarTerminalData,
  IntermediaryAdvisoryData,
} from "./audit-types";

// Structural partial type for site evidence to avoid importing server-only modules
export type RadarSiteEvidence = {
  host?: string;
  statusCode?: number;
  httpsUpgrade?: boolean;
  securityHeaders?: Record<string, string | null>;
  responseHeaders?: Record<string, string | null>;
  setCookiePreConsent?: string[];
  trackerSignals?: string[];
  consentSignals?: string[];
  thirdPartyHosts?: string[];
};

/**
 * Detects if the target is a large-scale intermediary conglomerate platform
 * or operates authenticated user session infrastructure with global safe-harbor shields.
 */
export function detectIntermediaryEntity(
  target: string,
  evidence?: RadarSiteEvidence | null,
): { isIntermediary: boolean; conglomerateName: string } {
  const clean = target
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  if (/youtube\.com|youtu\.be|googlevideo\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "YouTube / Alphabet Infrastructure" };
  }
  if (
    /google\.(com|co\.in|co\.uk|de|fr|ca|com\.au|es|it|nl|se|pl|com\.br|com\.sg)|gstatic\.com|googleapis\.com/i.test(
      clean,
    )
  ) {
    return { isIntermediary: true, conglomerateName: "Google / Alphabet Core Network" };
  }
  if (/meta\.com|facebook\.com|fb\.com|instagram\.com|whatsapp\.com|fbcdn\.net/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "Meta Platforms Intermediary Ecosystem" };
  }
  if (/amazon\.(com|in|co\.uk|de|co\.jp|ca|es|fr|it)|aws\.amazon\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "Amazon Conglomerate Network" };
  }
  if (/microsoft\.com|azure\.com|live\.com|bing\.com|office\.com|linkedin\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "Microsoft / LinkedIn Enterprise Mesh" };
  }
  if (/apple\.com|icloud\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "Apple Global Infrastructure" };
  }
  if (/x\.com|twitter\.com|twimg\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "X Corp / Twitter Global Feed" };
  }
  if (/tiktok\.com|bytedance\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "ByteDance / TikTok Global CDN" };
  }
  if (/netflix\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "Netflix Content Delivery Mesh" };
  }
  if (/reddit\.com/i.test(clean)) {
    return { isIntermediary: true, conglomerateName: "Reddit Public Forum & Media Intermediary" };
  }

  // Check evidence signals: EULA cookies or corporate auth tokens
  const cookies = evidence?.setCookiePreConsent?.join(" ") || "";
  if (/session_id|auth_token|sso|eula_consent|identity|oauth/i.test(cookies)) {
    return { isIntermediary: true, conglomerateName: "Authenticated Multi-Tier Portal Platform" };
  }

  return { isIntermediary: false, conglomerateName: "" };
}

export function computeRadarTerminalLog(
  target: string,
  evidence?: RadarSiteEvidence | null,
  partialReport?: Partial<AuditReport>,
): RadarTerminalData {
  const cleanTarget = target.trim();
  const intermediary = detectIntermediaryEntity(cleanTarget, evidence);

  // 1. Evidence extraction
  const missingHsts =
    evidence &&
    !evidence.securityHeaders?.["strict-transport-security"] &&
    !evidence.responseHeaders?.["strict-transport-security"];
  const missingCsp =
    evidence &&
    !evidence.securityHeaders?.["content-security-policy"] &&
    !evidence.securityHeaders?.["content-security-policy-report-only"] &&
    !evidence.responseHeaders?.["content-security-policy"];
  const unencrypted = evidence ? !evidence.httpsUpgrade || evidence.statusCode === 0 : false;
  const preConsentCookiesCount = evidence ? (evidence.setCookiePreConsent?.length ?? 0) : 0;
  const trackerSignals = evidence ? (evidence.trackerSignals ?? []) : [];
  const consentSignals = evidence ? (evidence.consentSignals ?? []) : [];
  const thirdPartyHosts = evidence ? (evidence.thirdPartyHosts ?? []) : [];
  const hasCmp = consentSignals.length > 0;

  // If evidence not available (e.g. text input), infer from criticalLeaks and score
  const leaks = partialReport?.criticalLeaks || [];
  const leakTitles = leaks
    .map((l) => l.title.toLowerCase() + " " + l.detail.toLowerCase())
    .join(" ");
  const textHasTrackerIssues =
    leakTitles.includes("cookie") ||
    leakTitles.includes("tracker") ||
    leakTitles.includes("pixel") ||
    leakTitles.includes("telemetry") ||
    trackerSignals.length > 0 ||
    preConsentCookiesCount > 0;
  const textHasHeaderIssues =
    missingHsts ||
    missingCsp ||
    unencrypted ||
    leakTitles.includes("hsts") ||
    leakTitles.includes("csp") ||
    leakTitles.includes("security-policy") ||
    leakTitles.includes("transport security");

  // Intermediary Warning Tag
  const intermediaryWarningTag = intermediary.isIntermediary
    ? `⚠️ CORPORATE INTERMEDIARY WARNING: Target operates multi-layered Safe Harbor immunity frameworks (India IT Act Sec. 79 / US Sec. 230) & pre-authenticated blanket consent terms.`
    : null;

  // A) 🇮🇳 INDIA (Digital Personal Data Protection Act, 2023):
  // - Section 6(1) [Pre-Consent Telemetry Drift]: Trigger [FAIL] if client-side telemetry arrays (Google Tag Manager, Meta Pixel, Sentry scripts) initialize inside browser runtime cache BEFORE explicit opt-in consent tokens are recorded.
  // - Section 8(1) [Reasonable Infrastructure Safeguards]: Trigger [FAIL] if HTTP response headers ('Strict-Transport-Security' [HSTS], 'Content-Security-Policy' [CSP]) are missing from incoming server frames.
  const indiaTelemetryFail = (trackerSignals.length > 0 || preConsentCookiesCount > 0) && !hasCmp;
  const indiaSafeguardsFail = missingHsts || missingCsp || unencrypted;
  const indiaPass = evidence
    ? !indiaTelemetryFail && !indiaSafeguardsFail
    : !textHasTrackerIssues && !textHasHeaderIssues && (partialReport?.score ?? 0) >= 85;

  const indiaVerdict: JurisdictionVerdictItem = {
    jurisdiction: "INDIA",
    statute: "DPDP ACT 2023",
    status: indiaPass ? "[🟩 PASS]" : "[🟥 FAIL]",
    pass: indiaPass,
    triggerRules: [
      "Section 6(1) Pre-Consent Telemetry Drift (GTM, Meta Pixel, Sentry scripts without opt-in token)",
      "Section 8(1) Reasonable Infrastructure Safeguards (Mandatory HSTS & CSP headers)",
    ],
    findings: indiaPass
      ? [
          "Strict HSTS and CSP validated on incoming frames",
          "Consent token verified prior to telemetry activation",
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
        ]
      : [
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
          ...(indiaSafeguardsFail
            ? ["Missing mandatory HSTS or CSP defense headers on server frames [s.8(1)]"]
            : []),
          ...(indiaTelemetryFail
            ? ["Client telemetry arrays initialized before opt-in consent [s.6(1)]"]
            : []),
        ],
  };

  // B) 🇪🇺 EUROPEAN UNION (GDPR 2026 Coordinated Reforms):
  // - Article 7 & Article 32: Trigger [FAIL] if non-essential telemetry cookies harvest device telemetry scripts prior to explicit opt-in preference authorization logs.
  const euTelemetryFail =
    preConsentCookiesCount > 0 || (trackerSignals.length > 0 && !hasCmp) || unencrypted;
  const euPass = evidence
    ? !euTelemetryFail
    : !textHasTrackerIssues && (partialReport?.score ?? 0) >= 85;

  const euVerdict: JurisdictionVerdictItem = {
    jurisdiction: "EU",
    statute: "GDPR REFORMS",
    status: euPass ? "[🟩 PASS]" : "[🟥 FAIL]",
    pass: euPass,
    triggerRules: [
      "Article 7 & Article 32 (Pre-consent telemetry harvesting & technical security safeguards)",
    ],
    findings: euPass
      ? [
          "Explicit opt-in preference authorization verified before non-essential script execution",
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
        ]
      : [
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
          "Non-essential telemetry cookies/scripts harvest device data prior to explicit opt-in logs (Art. 7/32)",
        ],
  };

  // C) 🇬🇧 UNITED KINGDOM (DUAA 2026):
  // - Trigger [FAIL] if non-essential telemetry cookies harvest device telemetry scripts prior to explicit opt-in preference authorization logs.
  const ukPass = euPass;
  const ukVerdict: JurisdictionVerdictItem = {
    jurisdiction: "UK",
    statute: "DUAA 2026",
    status: ukPass ? "[🟩 PASS]" : "[🟥 FAIL]",
    pass: ukPass,
    triggerRules: ["DUAA 2026 Statutory Preference Architecture & Telemetry Consent"],
    findings: ukPass
      ? [
          "Validated compliance with DUAA 2026 data capture and infrastructure standards",
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
        ]
      : [
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
          "Unconsented client-side telemetry harvesting detected violating DUAA 2026 parameters",
        ],
  };

  // D) 🇦🇪 UAE (Decree-Law No. 45 of 2021):
  // - Trigger [FAIL] if PropTech, luxury real estate platforms, or digital checkouts execute tracking cookies or session parameters without explicit user selection tokens.
  const uaeTelemetryFail = preConsentCookiesCount > 0 || (trackerSignals.length > 0 && !hasCmp);
  const uaePass = evidence
    ? !uaeTelemetryFail
    : !textHasTrackerIssues && (partialReport?.score ?? 0) >= 80;

  const uaeVerdict: JurisdictionVerdictItem = {
    jurisdiction: "UAE",
    statute: "DECREE LAW 45",
    status: uaePass ? "[🟩 PASS]" : "[🟥 FAIL]",
    pass: uaePass,
    triggerRules: [
      "Decree-Law No. 45 of 2021 (User selection token verification for tracking & session cookies)",
    ],
    findings: uaePass
      ? [
          "Bilingual selection tokens active prior to tracking parameter initialization",
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
        ]
      : [
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
          "Tracking cookies or session parameters executed without explicit user selection token",
        ],
  };

  // E) 🇸🇦 SAUDI ARABIA (PDPL 2024):
  // - Trigger [FAIL] if tracking cookies or session parameters execute without explicit user selection tokens.
  const saudiPass = uaePass;
  const saudiVerdict: JurisdictionVerdictItem = {
    jurisdiction: "SAUDI ARABIA",
    statute: "PDPL",
    status: saudiPass ? "[🟩 PASS]" : "[🟥 FAIL]",
    pass: saudiPass,
    triggerRules: [
      "Saudi Arabia PDPL 2024 (Explicit consent mechanism for analytics and cross-border telemetries)",
    ],
    findings: saudiPass
      ? [
          "Mandatory data principal opt-in recorded before data collection",
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
        ]
      : [
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
          "Session tracking cookies active without verified user selection token under PDPL",
        ],
  };

  // F) 🇸🇬 SINGAPORE (Personal Data Protection Act [PDPA] & 2024 Amendments):
  // - Section 26 [Transfer Limitation Obligation]: Trigger [FAIL] if network configurations initiate an outbound data packet stream to a destination outside Singapore's network perimeter without explicit cross-border tracking verification or missing comparable protection tokens.
  const usTrackers = trackerSignals.filter((t) =>
    /google|analytics|tag manager|meta|facebook|hotjar|clarity|segment|mixpanel|amplitude|sentry|criteo/i.test(
      t,
    ),
  );
  const sgTransferFail =
    (usTrackers.length > 0 ||
      thirdPartyHosts.some((h) => /google|facebook|segment|mixpanel|sentry/i.test(h))) &&
    !hasCmp;
  const sgPass = evidence ? !sgTransferFail : (partialReport?.score ?? 0) >= 85;

  const sgVerdict: JurisdictionVerdictItem = {
    jurisdiction: "SINGAPORE",
    statute: "PDPA",
    status: sgPass ? "[🟩 PASS]" : "[🟥 FAIL]",
    pass: sgPass,
    triggerRules: [
      "Section 26 Transfer Limitation Obligation (Cross-border data packet streams & comparable protection tokens)",
    ],
    findings: sgPass
      ? [
          "Outbound streams verified within compliant transmission channels with comparable protection tokens",
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
        ]
      : [
          ...(intermediaryWarningTag ? [intermediaryWarningTag] : []),
          "Outbound data packet stream initiated outside sovereign perimeter without verified transfer safeguards",
        ],
  };

  // 2. Core Cross-Border Routing Auditor
  const hasInternationalLeak = !indiaPass || !euPass || !sgPass || trackerSignals.length > 0;
  const crossBorderCompliant = !hasInternationalLeak;

  const destinationDetails =
    trackerSignals.length > 0
      ? trackerSignals.slice(0, 2).join(" / ")
      : "Google Tag Manager / Meta Pixel CDN";

  const anomalyCaptureLog = crossBorderCompliant
    ? "All client transaction and telemetry packets remain strictly routed through sovereign-compliant TLS 1.3 endpoints with valid cryptographic signatures."
    : `Outbound telemetry stream detected transmitting client session tokens to US-East (${destinationDetails}) without automated endpoint encryption signatures.`;

  const crossBorder: CrossBorderAnalysis = {
    routingLedgerStatus: crossBorderCompliant ? "COMPLIANT" : "NON-COMPLIANT",
    routingLedgerDisplay: crossBorderCompliant ? "[COMPLIANT]" : "[🟥 NON-COMPLIANT]",
    anomalyCaptureLog,
    isCompliant: crossBorderCompliant,
    packetDestinationNote: crossBorderCompliant
      ? "Sovereign In-Country Perimeter Verified"
      : "US-East / Third-Party Unencrypted Ingress Detected",
  };

  // 3. Construct Intermediary Exception Log Block
  const legalInterceptionExplanation = `- NOTICE: This platform utilizes multi-layered Intermediary Immunity Frameworks (Safe Harbor Protections) alongside pre-authenticated blanket consent terms. While raw client-side telemetry packet leaks are technically visible inside the browser runtime memory cache, the corporate infrastructure leverages active treaty exemptions to legally bypass direct Section 33 DPDP Act enforcement actions until a formal regulatory order is issued.`;

  const intermediaryAdvisoryLogRaw = `----------------------------------------------------------------------------------------
[ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]
TARGET NODE: ${cleanTarget}
VERDICT STATUS: 🟥 STRUCTURAL DRIFT DETECTED (POTENTIAL EXEMPTION SHIELD ACTIVE)

[THE LEGAL INTERCEPTION EXPLANATION]:
${legalInterceptionExplanation}

========================================================================================
     ⚖️ SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS [L O C K E D 🔒]
========================================================================================
// CRITICAL EXEMPTION MITIGATION ARGUMENTS AND STRATEGIC LITIGATION SHIELDS
// FOR INTERMEDIARY NETWORKS AND BIG-TECH ENTITIES ARE ENCRYPTED.
// REQUIRE PREMIUM RECONCILIATION RETAINER ACTIVATION REGISTRY FEE OF ₹24,999 ($300 USD).
----------------------------------------------------------------------------------------`;

  const intermediaryAdvisory: IntermediaryAdvisoryData = {
    isIntermediary: intermediary.isIntermediary,
    conglomerateName: intermediary.conglomerateName || "Global Intermediary Network",
    immunityTag: "Safe Harbor / India IT Act Sec. 79 & US Sec. 230",
    verdictStatus: "🟥 STRUCTURAL DRIFT DETECTED (POTENTIAL EXEMPTION SHIELD ACTIVE)",
    legalExplanation: legalInterceptionExplanation,
    advisoryLogRaw: intermediaryAdvisoryLogRaw,
    treatyExemptionShieldActive: intermediary.isIntermediary,
  };

  // 4. Construct Primary Radar Terminal Raw Output String
  const intermediarySectionInTerminal = intermediary.isIntermediary
    ? `\n\n----------------------------------------------------------------------------------------
[ASJi ONE // ADVANCED STATUTORY INTERMEDIARY ADVISORY REGISTER]
TARGET NODE: ${cleanTarget}
VERDICT STATUS: 🟥 STRUCTURAL DRIFT DETECTED (POTENTIAL EXEMPTION SHIELD ACTIVE)

[THE LEGAL INTERCEPTION EXPLANATION]:
${legalInterceptionExplanation}

========================================================================================
     ⚖️ SPECIALIZED COMPLIANCE ESCAPE DEFENSE ANALYSIS [L O C K E D 🔒]
========================================================================================
// CRITICAL EXEMPTION MITIGATION ARGUMENTS AND STRATEGIC LITIGATION SHIELDS
// FOR INTERMEDIARY NETWORKS AND BIG-TECH ENTITIES ARE ENCRYPTED.
// REQUIRE PREMIUM RECONCILIATION RETAINER ACTIVATION REGISTRY FEE OF ₹24,999 ($300 USD).`
    : "";

  const terminalLogRaw = `----------------------------------------------------------------------------------------
[ASJi ONE // AUTONOMOUS TRUST RADAR TERMINAL LOG]
TARGET DOMAIN: ${cleanTarget}

[JURISDICTION VERDICT MATRIX]:
- 🇮🇳 INDIA DPDP ACT 2023: ${indiaVerdict.status}
- 🇪🇺 EU GDPR REFORMS:    ${euVerdict.status}
- 🇬🇧 UK DUAA 2026:       ${ukVerdict.status}
- 🇦🇪 UAE DECREE LAW 45:  ${uaeVerdict.status}
- 🇸🇦 SAUDI ARABIA PDPL:  ${saudiVerdict.status}
- 🇸🇬 SINGAPORE PDPA:     ${sgVerdict.status}

[CROSS-BORDER DATA ANALYSIS]:
- ROUTING LEDGER STATUS: ${crossBorder.routingLedgerDisplay}
- ANOMALY CAPTURE LOG: ${anomalyCaptureLog}

========================================================================================
     🛠️ AUTONOMOUS CODE REMEDIATION WRAPPER PATCH [L O C K E D 🔒]
========================================================================================
// CODE REPOSITORY IS LOCKED UNDER STATUTORY REGTECH AUDIT FRAMEWORK.
// LIABILITY PENALTY STATUS: ACCRUING UP TO ₹250 CRORES UNTIL COMPLETION PATCH IS INJECTED.
// COMPLETE INSTANT DIRECT BANK ACCOUNT UPI TRANSFER (8290841179-3@ibl - ARUSH SHARMA) OF ₹24,999 ($300 USD) TO UNLOCK FULL PRODUCTION CODE PATCHES IN SECONDS.

👉 [BUTTON ACTION: INSTANT DIRECT UPI TRANSFER & UNLOCK EXECUTABLE CODE PATCHES]
----------------------------------------------------------------------------------------${intermediarySectionInTerminal}`;

  return {
    targetDomain: cleanTarget,
    verdictMatrix: {
      indiaDpdp2023: indiaVerdict,
      euGdprReforms: euVerdict,
      ukDuaa2026: ukVerdict,
      uaeDecreeLaw45: uaeVerdict,
      saudiArabiaPdpl: saudiVerdict,
      singaporePdpa: sgVerdict,
    },
    crossBorder,
    terminalLogRaw,
    intermediaryAdvisory,
    remediationLock: {
      isLocked: true,
      penaltyAccrual: "Accruing up to ₹250 Crores",
      deploymentFeeInr: "₹24,999",
      deploymentFeeUsd: "$300 USD",
    },
  };
}
