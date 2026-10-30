export type GroundingSource = {
  title: string;
  uri: string;
};

export type GroundingInfo = {
  searchQueries: string[];
  sources: GroundingSource[];
  isGrounded: boolean;
};

export type AuditProvenance = {
  scannedAt: string;
  durationMs: number;
  model: string;
  method: "live-http-scan" | "operator-supplied-text";
  confidence: "high" | "medium" | "low";
  confidenceReason: string;
  checks: { label: string; value: string }[];
  sources: string[];
  limitations: string[];
};

export type JurisdictionVerdictItem = {
  jurisdiction: string;
  statute: string;
  status: "[🟩 PASS]" | "[🟥 FAIL]";
  pass: boolean;
  triggerRules: string[];
  findings: string[];
};

export type CrossBorderAnalysis = {
  routingLedgerStatus: "COMPLIANT" | "NON-COMPLIANT";
  routingLedgerDisplay: "[COMPLIANT]" | "[🟥 NON-COMPLIANT]";
  anomalyCaptureLog: string;
  isCompliant: boolean;
  packetDestinationNote: string;
};

export type IntermediaryAdvisoryData = {
  isIntermediary: boolean;
  conglomerateName: string;
  immunityTag: string;
  verdictStatus: string;
  legalExplanation: string;
  advisoryLogRaw: string;
  treatyExemptionShieldActive: boolean;
};

export type RadarTerminalData = {
  targetDomain: string;
  verdictMatrix: {
    indiaDpdp2023: JurisdictionVerdictItem;
    euGdprReforms: JurisdictionVerdictItem;
    ukDuaa2026: JurisdictionVerdictItem;
    uaeDecreeLaw45: JurisdictionVerdictItem;
    saudiArabiaPdpl: JurisdictionVerdictItem;
    singaporePdpa: JurisdictionVerdictItem;
  };
  crossBorder: CrossBorderAnalysis;
  terminalLogRaw: string;
  intermediaryAdvisory?: IntermediaryAdvisoryData;
  remediationLock: {
    isLocked: boolean;
    penaltyAccrual: string;
    deploymentFeeInr: string;
    deploymentFeeUsd: string;
  };
};

export type ScanMethodWorked =
  "Direct" | "Rendered" | "Proxy" | "Limited (blocked by site firewall)";

export type LimitedScanDetails = {
  httpsWorks: boolean;
  sslCert?: {
    issuer: string;
    validTo: string;
    daysRemaining: number;
  } | null;
  securityHeaders: Record<string, string | null>;
  dnsRecords?: {
    spf: string | null;
    dmarc: string | null;
  };
  serverLocation?: {
    countryName: string;
    flag: string;
    jurisdictionCode: string;
    provider?: string;
  };
};

export type AuditReport = {
  target: string;
  originCountry: string;
  serverLocation?: {
    countryName: string;
    flag: string;
    jurisdictionCode: string;
    provider?: string;
  };
  businessLocation?: {
    countryName: string;
    flag: string;
    jurisdictionCode: string;
    source?: string;
  };
  scanStatus?: "completed" | "incomplete";
  scanMethodWorked?: ScanMethodWorked | null;
  finalHttpStatus?: number;
  isBlockedOrIncomplete?: boolean;
  isLimitedScan?: boolean;
  limitedScanDetails?: LimitedScanDetails;
  incompleteReason?: string;
  incompleteDetails?: {
    statusCode: number;
    reason: string;
    challengeType?: string;
    attemptedMethods?: string[];
  };
  score: number;
  summary: string;
  inputKind: "url" | "text";
  evidence: string[];
  evidenceFingerprint?: string;
  hasModifiedSinceLastScan?: boolean;
  previousScore?: number;
  provenance: AuditProvenance;
  grounding?: GroundingInfo;
  dbRecordId?: string;
  dbSavedAt?: string;
  frameworks: { name: string; score: number; note: string }[];
  criticalLeaks: {
    title: string;
    severity: "low" | "medium" | "high" | "critical";
    detail: string;
  }[];
  fineRisk: { estimate: string; currency: string; rationale: string };
  remediation: { step: string; impact: string; effort: string }[];
  radarTerminal?: RadarTerminalData;
};
