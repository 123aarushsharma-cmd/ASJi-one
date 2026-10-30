export type CheckStatus = "PASS" | "FAIL" | "WARNING" | "NOT_CHECKED";
export type CheckSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";

export type CheckCategory =
  | "HTTPS & Transport Security"
  | "HTTP Security Headers"
  | "Cookies & Storage Flags"
  | "Trackers & Third Parties"
  | "Consent Banner & CMP"
  | "Privacy Notice & Statutory Disclosures"
  | "Email & Domain Security"
  | "Hygiene & Exposure Risks";

export interface CheckResult {
  id: string;
  category: CheckCategory;
  title: string;
  description: string;
  status: CheckStatus;
  severity: CheckSeverity;
  evidence: string;
  lawRefs?: string[];
  remediation?: string;
  reasonIfNotChecked?: string;
  testedAt?: string;
}

export interface ChecksSummary {
  totalChecks: number;
  checksRun: number;
  passedCount: number;
  failedCount: number;
  warningCount: number;
  notCheckedCount: number;
  categoryBreakdown: Record<
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
  results: CheckResult[];
}
