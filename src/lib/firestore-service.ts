import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { WORLD_LAWS_DATA, type WorldLaw } from "./world-laws-data";
import type { AuditReport } from "./audit-types";
import { OperationType, handleFirestoreError } from "./firestore-errors";

const LAWS_COLLECTION = "laws";
const STATUTORY_RULES_COLLECTION = "statutory_rules";
const CHAT_COLLECTION = "chat_sessions";
const AUDIT_SCANS_COLLECTION = "audit_scans";
const PAYMENT_UNLOCKS_COLLECTION = "payment_unlocks";
const GRIEVANCE_TICKETS_COLLECTION = "grievance_tickets";
const CONSENT_RECORDS_COLLECTION = "consent_records";

export function normalizeDomainName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .split("?")[0]
    .split("#")[0]
    .split(":")[0]
    .trim();
}

export interface ChatMessage {
  id?: string;
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | number | Date | null;
  sources?: {
    law: string;
    article: string;
    authority: string;
  }[];
  quickActions?: string[];
}

export interface StatutoryRuleDoc extends WorldLaw {
  legalTemplateText?: string;
  lastUpdatedIso?: string;
  lastUpdatedBy?: string;
}

export interface AuditScanFindingSummary {
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  detail: string;
}

export interface AuditScanRecord {
  audit_ref_id: string;
  domain: string;
  target: string;
  framework: string;
  politech_mode: boolean;
  compliance_score: number;
  verdict: "COMPLIANT" | "MODERATE RISK" | "CRITICAL NON-COMPLIANT";
  findings: AuditScanFindingSummary[];
  score_breakdown?: {
    rule: string;
    delta: number;
    passed: boolean;
    detail: string;
  }[];
  created_at: string;
}

export interface PaymentUnlockRecord {
  id: string;
  userId?: string | null;
  domain: string;
  referenceId: string;
  tier: "patch-code" | "dpdp-india" | "gdpr-global" | "full-bundle";
  tierName?: string;
  priceInr?: string;
  orgName?: string;
  email?: string;
  taxId?: string | null;
  status: "pending" | "verified" | "rejected";
  created_at: string;
  verifiedAt?: string;
  verifiedBy?: string;
  rejectedAt?: string;
  rejectedBy?: string;
}

export interface GrievanceTicketRecord {
  ticketId: string;
  requestType: "Access" | "Correction" | "Erasure" | "Grievance";
  fullName: string;
  email: string;
  domainRef?: string;
  summary: string;
  status: "OPEN" | "RESOLVED";
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
}

export interface ConsentRecordDoc {
  id: string;
  choice: "Accepted" | "Rejected" | "Managed" | "ScanAuthorized";
  categories?: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  policyVersion: string;
  domainContext?: string;
  createdAt: string;
}

/**
 * Initializes and synchronizes all global laws into Firestore.
 * Keeps `laws` and `statutory_rules` aligned so admin updates apply everywhere.
 */
export async function seedWorldLawsToFirestore(): Promise<{ count: number; status: string }> {
  try {
    let synced = 0;
    for (const law of WORLD_LAWS_DATA) {
      const lawRef = doc(db, LAWS_COLLECTION, law.id);
      const ruleRef = doc(db, STATUTORY_RULES_COLLECTION, law.id);
      await setDoc(
        lawRef,
        {
          ...law,
          lastUpdated: serverTimestamp(),
        },
        { merge: true },
      );
      await setDoc(
        ruleRef,
        {
          ...law,
          legalTemplateText: law.standardDraftTemplate,
          lastUpdated: serverTimestamp(),
          lastUpdatedIso: new Date().toISOString(),
        },
        { merge: true },
      );
      synced++;
    }
    return { count: synced, status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("Firestore seed note:", msg);
    return { count: WORLD_LAWS_DATA.length, status: "fallback_local" };
  }
}

export const seedStatutoryRules = seedWorldLawsToFirestore;

/**
 * Retrieves all global data protection laws, preferring live `statutory_rules` + `laws`
 * with seamless local fallback.
 */
export async function fetchWorldLaws(): Promise<StatutoryRuleDoc[]> {
  try {
    const [rulesSnap, lawsSnap] = await Promise.all([
      getDocs(collection(db, STATUTORY_RULES_COLLECTION)),
      getDocs(collection(db, LAWS_COLLECTION)),
    ]);

    const merged = new Map<string, StatutoryRuleDoc>();
    for (const base of WORLD_LAWS_DATA) {
      merged.set(base.id, {
        ...base,
        legalTemplateText: base.standardDraftTemplate,
      });
    }

    if (!lawsSnap.empty) {
      lawsSnap.forEach((d) => {
        const data = d.data() as StatutoryRuleDoc;
        const existing = merged.get(d.id);
        merged.set(d.id, {
          ...(existing || data),
          ...data,
          id: data.id || d.id,
        });
      });
    }

    if (!rulesSnap.empty) {
      rulesSnap.forEach((d) => {
        const data = d.data() as StatutoryRuleDoc;
        const existing = merged.get(d.id);
        merged.set(d.id, {
          ...(existing || data),
          ...data,
          id: data.id || d.id,
          standardDraftTemplate:
            data.legalTemplateText ||
            data.standardDraftTemplate ||
            existing?.standardDraftTemplate ||
            "",
        });
      });
    }

    return Array.from(merged.values()).sort((a, b) => a.country.localeCompare(b.country));
  } catch (err) {
    console.warn("Using local world laws registry:", err);
    return WORLD_LAWS_DATA.map((l) => ({ ...l, legalTemplateText: l.standardDraftTemplate }));
  }
}

export async function fetchStatutoryRules(): Promise<StatutoryRuleDoc[]> {
  return fetchWorldLaws();
}

/**
 * Publishes an admin edit to `statutory_rules` and `laws` so future scans
 * and the World Laws Atlas immediately pick up the updated statute metadata & template text.
 */
export async function publishStatutoryRuleUpdate(
  rule: StatutoryRuleDoc,
  updatedBy: string,
): Promise<void> {
  const isoNow = new Date().toISOString();
  const payload = {
    ...rule,
    standardDraftTemplate: rule.legalTemplateText ?? rule.standardDraftTemplate ?? "",
    legalTemplateText: rule.legalTemplateText ?? rule.standardDraftTemplate ?? "",
    lastUpdated: serverTimestamp(),
    lastUpdatedIso: isoNow,
    lastUpdatedBy: updatedBy,
  };

  try {
    await Promise.all([
      setDoc(doc(db, STATUTORY_RULES_COLLECTION, rule.id), payload, { merge: true }),
      setDoc(doc(db, LAWS_COLLECTION, rule.id), payload, { merge: true }),
    ]);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${STATUTORY_RULES_COLLECTION}/${rule.id}`);
  }
}

/**
 * Retrieves a single sovereign law by ID
 */
export async function fetchLawById(lawId: string): Promise<StatutoryRuleDoc | null> {
  try {
    const ruleSnap = await getDoc(doc(db, STATUTORY_RULES_COLLECTION, lawId));
    if (ruleSnap.exists()) {
      return ruleSnap.data() as StatutoryRuleDoc;
    }
    const snap = await getDoc(doc(db, LAWS_COLLECTION, lawId));
    if (snap.exists()) {
      return snap.data() as StatutoryRuleDoc;
    }
    return WORLD_LAWS_DATA.find((l) => l.id === lawId) || null;
  } catch {
    return WORLD_LAWS_DATA.find((l) => l.id === lawId) || null;
  }
}

// =========================================================================
// LIVE AUDIT SCANS LEDGER (`audit_scans`)
// =========================================================================

export async function saveAuditScan(
  report: AuditReport,
  frameworkId: string,
  politechMode: boolean,
): Promise<AuditScanRecord | null> {
  const domain = normalizeDomainName(report.target || "");
  if (!domain || domain.length < 3) return null;

  const refId =
    report.auditRefId && /^ASJI-2026-[A-Z0-9]{4,12}$/.test(report.auditRefId)
      ? report.auditRefId
      : `ASJI-2026-${Date.now().toString(36).slice(-6).toUpperCase()}`;

  const verdict: AuditScanRecord["verdict"] =
    report.score >= 80
      ? "COMPLIANT"
      : report.score >= 50
        ? "MODERATE RISK"
        : "CRITICAL NON-COMPLIANT";

  const findings: AuditScanFindingSummary[] = (report.criticalLeaks || [])
    .slice(0, 25)
    .map((l) => ({
      title: String(l.title || "").slice(0, 200),
      severity: l.severity || "medium",
      detail: String(l.detail || "").slice(0, 600),
    }));

  const createdAt = report.scannedAtUtc || new Date().toISOString();

  const record: AuditScanRecord = {
    audit_ref_id: refId,
    domain,
    target: report.target,
    framework: frameworkId,
    politech_mode: politechMode,
    compliance_score: Math.max(0, Math.min(100, Math.round(report.score))),
    verdict,
    findings,
    score_breakdown: report.scoreBreakdown || [],
    created_at: createdAt,
  };

  try {
    await setDoc(doc(db, AUDIT_SCANS_COLLECTION, refId), {
      ...record,
      timestamp: serverTimestamp(),
    });
    return record;
  } catch (err) {
    console.warn("Audit scan telemetry write note:", err);
    return null;
  }
}

export async function lookupAuditScanByRefId(refId: string): Promise<AuditScanRecord | null> {
  const clean = refId.trim().toUpperCase();
  if (!/^ASJI-2026-[A-Z0-9]{4,12}$/.test(clean)) return null;
  try {
    const snap = await getDoc(doc(db, AUDIT_SCANS_COLLECTION, clean));
    if (!snap.exists()) return null;
    return snap.data() as AuditScanRecord;
  } catch (err) {
    console.warn("Certificate lookup error:", err);
    return null;
  }
}

export async function fetchAuditScans(maxCount = 50): Promise<AuditScanRecord[]> {
  try {
    const q = query(
      collection(db, AUDIT_SCANS_COLLECTION),
      orderBy("created_at", "desc"),
      limit(maxCount),
    );
    const snap = await getDocs(q);
    const list: AuditScanRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as AuditScanRecord);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, AUDIT_SCANS_COLLECTION);
  }
}

// =========================================================================
// PERSISTENT PAYMENT UNLOCKS (`payment_unlocks` + `licenses` sync)
// =========================================================================

export async function submitPaymentUnlockRequest(params: {
  userId?: string | null;
  domain: string;
  referenceId: string;
  tier: PaymentUnlockRecord["tier"];
  tierName: string;
  priceInr: string;
  orgName: string;
  email: string;
  taxId?: string | null;
}): Promise<PaymentUnlockRecord> {
  const normalizedDomain = normalizeDomainName(params.domain);
  const randSuffix = Math.random()
    .toString(36)
    .slice(2, 8)
    .replace(/[^a-z0-9]/g, "0");
  const reqId = `req_${Date.now()}_${randSuffix || "unlock"}`;
  const createdAt = new Date().toISOString();

  const record: PaymentUnlockRecord = {
    id: reqId,
    userId: params.userId || null,
    domain: normalizedDomain,
    referenceId: params.referenceId.trim(),
    tier: params.tier,
    tierName: params.tierName,
    priceInr: params.priceInr,
    orgName: params.orgName.trim() || normalizedDomain,
    email: params.email.trim() || `compliance@${normalizedDomain}`,
    taxId: params.taxId?.trim() || null,
    status: "pending",
    created_at: createdAt,
  };

  await setDoc(doc(db, PAYMENT_UNLOCKS_COLLECTION, reqId), {
    ...record,
    createdAt: serverTimestamp(),
  });

  return record;
}

export async function checkDomainPaymentUnlock(rawDomain: string): Promise<{
  unlocked: boolean;
  tiers: string[];
  tier?: string;
  tierName?: string;
  verifiedAt?: string;
}> {
  const normalized = normalizeDomainName(rawDomain);
  if (!normalized || normalized.length < 3) {
    return { unlocked: false, tiers: [] };
  }

  try {
    const [unlockSnap, licenseSnap] = await Promise.all([
      getDoc(doc(db, PAYMENT_UNLOCKS_COLLECTION, normalized)).catch(() => null),
      getDoc(doc(db, "licenses", normalized)).catch(() => null),
    ]);

    if (unlockSnap?.exists()) {
      const data = unlockSnap.data() as PaymentUnlockRecord;
      if (data.status === "verified") {
        const tier = data.tier || "full-bundle";
        return {
          unlocked: true,
          tiers: Array.from(new Set([tier, ...(tier === "full-bundle" ? ["full-bundle"] : [])])),
          tier,
          tierName: data.tierName,
          verifiedAt: data.verifiedAt,
        };
      }
    }

    if (licenseSnap?.exists()) {
      const lic = licenseSnap.data() as { active?: boolean; tier?: string; tierName?: string };
      if (lic.active) {
        const tier = lic.tier || "full-bundle";
        return {
          unlocked: true,
          tiers: Array.from(new Set([tier, "full-bundle"])),
          tier,
          tierName: lic.tierName,
        };
      }
    }
  } catch (err) {
    console.warn("Payment unlock check note:", err);
  }

  return { unlocked: false, tiers: [] };
}

export async function fetchPaymentUnlocks(): Promise<PaymentUnlockRecord[]> {
  try {
    const snap = await getDocs(collection(db, PAYMENT_UNLOCKS_COLLECTION));
    const list: PaymentUnlockRecord[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...(d.data() as Omit<PaymentUnlockRecord, "id">) });
    });
    return list.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, PAYMENT_UNLOCKS_COLLECTION);
  }
}

export async function verifyAndUnlockDomain(
  unlockOrDomain: PaymentUnlockRecord | string,
  adminEmail: string,
  overrides?: {
    tier?: PaymentUnlockRecord["tier"];
    tierName?: string;
    priceInr?: string;
    orgName?: string;
    referenceId?: string;
  },
): Promise<void> {
  const isString = typeof unlockOrDomain === "string";
  const normalizedDomain = normalizeDomainName(isString ? unlockOrDomain : unlockOrDomain.domain);
  if (!normalizedDomain || normalizedDomain.length < 3) {
    throw new Error("Valid domain name required to verify and unlock.");
  }

  const verifiedAt = new Date().toISOString();
  const tier = overrides?.tier || (isString ? "full-bundle" : unlockOrDomain.tier) || "full-bundle";
  const tierName =
    overrides?.tierName ||
    (isString ? "Full-Spectrum Sovereign Enterprise Suite" : unlockOrDomain.tierName) ||
    "Full-Spectrum Sovereign Enterprise Suite";
  const priceInr =
    overrides?.priceInr || (isString ? "₹59,999" : unlockOrDomain.priceInr) || "₹59,999";
  const referenceId =
    overrides?.referenceId || (isString ? "ADMIN_MANUAL_GRANT" : unlockOrDomain.referenceId);
  const orgName =
    overrides?.orgName ||
    (isString ? normalizedDomain : unlockOrDomain.orgName) ||
    normalizedDomain;

  try {
    // 1. If verifying a submitted request (`req_...`), mark that request verified
    if (!isString && unlockOrDomain.id && unlockOrDomain.id !== normalizedDomain) {
      await setDoc(
        doc(db, PAYMENT_UNLOCKS_COLLECTION, unlockOrDomain.id),
        {
          status: "verified",
          verifiedAt,
          verifiedBy: adminEmail,
        },
        { merge: true },
      );
    }

    // 2. Write canonical zero-PII verified domain unlock doc keyed by normalized domain
    await setDoc(
      doc(db, PAYMENT_UNLOCKS_COLLECTION, normalizedDomain),
      {
        id: normalizedDomain,
        domain: normalizedDomain,
        referenceId,
        tier,
        tierName,
        priceInr,
        status: "verified",
        created_at: isString ? verifiedAt : unlockOrDomain.created_at || verifiedAt,
        verifiedAt,
        verifiedBy: adminEmail,
      },
      { merge: true },
    );

    // 3. Synchronize `licenses` collection for backward compatibility
    await setDoc(
      doc(db, "licenses", normalizedDomain),
      {
        domain: normalizedDomain,
        active: true,
        tier,
        tierName,
        priceInr,
        orgName,
        approvedAt: serverTimestamp(),
        issuedBy: adminEmail,
      },
      { merge: true },
    );
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.WRITE,
      `${PAYMENT_UNLOCKS_COLLECTION}/${normalizedDomain}`,
    );
  }
}

export async function rejectPaymentUnlock(unlockId: string, adminEmail: string): Promise<void> {
  try {
    await updateDoc(doc(db, PAYMENT_UNLOCKS_COLLECTION, unlockId), {
      status: "rejected",
      rejectedAt: new Date().toISOString(),
      rejectedBy: adminEmail,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${PAYMENT_UNLOCKS_COLLECTION}/${unlockId}`);
  }
}

export async function revokeDomainUnlock(rawDomain: string): Promise<void> {
  const normalizedDomain = normalizeDomainName(rawDomain);
  try {
    await Promise.all([
      deleteDoc(doc(db, PAYMENT_UNLOCKS_COLLECTION, normalizedDomain)).catch(() => {}),
      deleteDoc(doc(db, "licenses", normalizedDomain)).catch(() => {}),
    ]);
  } catch (err) {
    handleFirestoreError(
      err,
      OperationType.DELETE,
      `${PAYMENT_UNLOCKS_COLLECTION}/${normalizedDomain}`,
    );
  }
}

// =========================================================================
// DPDP GRIEVANCE & DATA PRINCIPAL DESK (`grievance_tickets`)
// =========================================================================

export async function submitGrievanceTicket(
  ticket: Omit<GrievanceTicketRecord, "status">,
): Promise<GrievanceTicketRecord> {
  const fullRecord: GrievanceTicketRecord = {
    ...ticket,
    status: "OPEN",
  };

  await setDoc(doc(db, GRIEVANCE_TICKETS_COLLECTION, ticket.ticketId), {
    ...fullRecord,
    timestamp: serverTimestamp(),
  });

  return fullRecord;
}

export async function fetchGrievanceTickets(): Promise<GrievanceTicketRecord[]> {
  try {
    const snap = await getDocs(collection(db, GRIEVANCE_TICKETS_COLLECTION));
    const list: GrievanceTicketRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as GrievanceTicketRecord);
    });
    return list.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, GRIEVANCE_TICKETS_COLLECTION);
  }
}

export async function resolveGrievanceTicket(
  ticketId: string,
  adminEmail: string,
  resolutionNote?: string,
): Promise<void> {
  try {
    await updateDoc(doc(db, GRIEVANCE_TICKETS_COLLECTION, ticketId), {
      status: "RESOLVED",
      resolvedAt: new Date().toISOString(),
      resolvedBy: adminEmail,
      ...(resolutionNote ? { resolutionNote: resolutionNote.trim() } : {}),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${GRIEVANCE_TICKETS_COLLECTION}/${ticketId}`);
  }
}

// =========================================================================
// COOKIE & TELEMETRY CONSENT LEDGER (`consent_records`)
// =========================================================================

export async function saveConsentRecord(
  choice: ConsentRecordDoc["choice"],
  categories: ConsentRecordDoc["categories"] | undefined,
  policyVersion: string,
  domainContext?: string,
): Promise<void> {
  const rand = Math.random()
    .toString(36)
    .slice(2, 8)
    .replace(/[^a-z0-9]/g, "0");
  const id = `consent_${Date.now()}_${rand || "rec"}`;
  const createdAt = new Date().toISOString();

  const payload: ConsentRecordDoc = {
    id,
    choice,
    ...(categories ? { categories } : {}),
    policyVersion,
    ...(domainContext
      ? { domainContext: normalizeDomainName(domainContext) || domainContext }
      : {}),
    createdAt,
  };

  try {
    await setDoc(doc(db, CONSENT_RECORDS_COLLECTION, id), {
      ...payload,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Consent ledger persistence note:", err);
  }
}

export async function fetchConsentRecords(maxCount = 50): Promise<ConsentRecordDoc[]> {
  try {
    const q = query(
      collection(db, CONSENT_RECORDS_COLLECTION),
      orderBy("createdAt", "desc"),
      limit(maxCount),
    );
    const snap = await getDocs(q);
    const list: ConsentRecordDoc[] = [];
    snap.forEach((d) => {
      list.push(d.data() as ConsentRecordDoc);
    });
    return list;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, CONSENT_RECORDS_COLLECTION);
  }
}

// =========================================================================
// PRIVATE USER VAULT, CHAT, BULK SCANS & LEGACY WORLD LAWS HELPERS
// =========================================================================

export interface UserAuditRecord {
  id: string;
  userId: string;
  domain: string;
  score: number;
  verdict: string;
  criticalFindingsCount: number;
  statutoryExceptionsCount: number;
  reportSummary?: string;
  createdAt: string;
  reportData?: unknown;
}

export interface UserNoticeRecord {
  id: string;
  userId: string;
  domain: string;
  lawId: string;
  title: string;
  content: string;
  createdAt: string;
}

export async function saveUserAudit(
  userId: string,
  audit: Omit<UserAuditRecord, "userId" | "createdAt"> & { createdAt?: string },
): Promise<void> {
  if (!userId) return;
  try {
    const auditDocRef = doc(db, "users", userId, "audits", audit.id);
    await setDoc(
      auditDocRef,
      {
        ...audit,
        userId,
        createdAt: audit.createdAt || new Date().toISOString(),
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Failed to persist user audit to private Firestore:", err);
  }
}

export async function fetchUserAudits(userId: string): Promise<UserAuditRecord[]> {
  if (!userId) return [];
  try {
    const auditsCol = collection(db, "users", userId, "audits");
    const snapshot = await getDocs(auditsCol);
    const results: UserAuditRecord[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as UserAuditRecord);
    });
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (err) {
    console.warn("Failed to retrieve user audits from Firestore:", err);
    return [];
  }
}

export async function deleteUserAudit(userId: string, auditId: string): Promise<void> {
  if (!userId || !auditId) return;
  try {
    const auditDocRef = doc(db, "users", userId, "audits", auditId);
    await deleteDoc(auditDocRef);
  } catch (err) {
    console.warn("Failed to delete user audit from Firestore:", err);
  }
}

export async function saveUserNotice(
  userId: string,
  notice: Omit<UserNoticeRecord, "userId" | "createdAt"> & { createdAt?: string },
): Promise<void> {
  if (!userId) return;
  try {
    const noticeDocRef = doc(db, "users", userId, "notices", notice.id);
    await setDoc(
      noticeDocRef,
      {
        ...notice,
        userId,
        createdAt: notice.createdAt || new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Failed to save notice to user vault:", err);
  }
}

export async function fetchUserNotices(userId: string): Promise<UserNoticeRecord[]> {
  if (!userId) return [];
  try {
    const noticesCol = collection(db, "users", userId, "notices");
    const snapshot = await getDocs(noticesCol);
    const results: UserNoticeRecord[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as UserNoticeRecord);
    });
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (err) {
    console.warn("Failed to retrieve user notices from Firestore:", err);
    return [];
  }
}

export async function deleteUserNotice(userId: string, noticeId: string): Promise<void> {
  if (!userId || !noticeId) return;
  try {
    const noticeDocRef = doc(db, "users", userId, "notices", noticeId);
    await deleteDoc(noticeDocRef);
  } catch (err) {
    console.warn("Failed to delete notice from Firestore:", err);
  }
}

export async function saveChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, "id">,
): Promise<void> {
  try {
    const messagesCol = collection(db, CHAT_COLLECTION, sessionId, "messages");
    await addDoc(messagesCol, {
      ...message,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Failed to save chat message to Firestore (using transient memory):", err);
  }
}

export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    const messagesCol = collection(db, CHAT_COLLECTION, sessionId, "messages");
    const snapshot = await getDocs(messagesCol);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, CHAT_COLLECTION, sessionId, "messages", docSnap.id));
    }
  } catch (err) {
    console.warn("Session cleared locally:", err);
  }
}

export interface BulkScanItem {
  domain: string;
  score: number;
  verdict: "COMPLIANT" | "MODERATE RISK" | "CRITICAL NON-COMPLIANT" | "SCAN FAILED";
  criticalLeaksCount: number;
  fineExposure: string;
  serverLocation?: string;
  summary: string;
  scannedAt: string;
  reportData?: unknown;
  error?: string;
}

export interface BulkScanBatch {
  id: string;
  title: string;
  scannedBy: string;
  createdAt: string;
  totalDomains: number;
  completedDomains: number;
  avgScore: number;
  highRiskCount: number;
  items: BulkScanItem[];
}

const BULK_SCANS_COLLECTION = "bulk_scans";
const STATUTORY_UPDATES_COLLECTION = "daily_statutory_updates";

export async function saveBulkScanBatch(batch: BulkScanBatch): Promise<void> {
  try {
    const docRef = doc(db, BULK_SCANS_COLLECTION, batch.id);
    await setDoc(
      docRef,
      {
        ...batch,
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.error("Failed to save bulk scan batch to Firestore:", err);
    throw err;
  }
}

export async function fetchBulkScanBatches(): Promise<BulkScanBatch[]> {
  try {
    const colRef = collection(db, BULK_SCANS_COLLECTION);
    const snap = await getDocs(colRef);
    const list: BulkScanBatch[] = [];
    snap.forEach((d) => {
      list.push(d.data() as BulkScanBatch);
    });
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    console.warn("Failed to fetch bulk scan batches:", err);
    return [];
  }
}

export async function deleteBulkScanBatch(batchId: string): Promise<void> {
  try {
    const docRef = doc(db, BULK_SCANS_COLLECTION, batchId);
    await deleteDoc(docRef);
  } catch (err) {
    console.error("Failed to delete bulk scan batch:", err);
    throw err;
  }
}

export async function updateWorldLaw(law: StatutoryRuleDoc, updatedBy: string): Promise<void> {
  return publishStatutoryRuleUpdate(law, updatedBy);
}

export async function createWorldLaw(law: StatutoryRuleDoc, createdBy: string): Promise<void> {
  const isoNow = new Date().toISOString();
  const payload = {
    ...law,
    legalTemplateText: law.legalTemplateText ?? law.standardDraftTemplate ?? "",
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
    lastUpdatedIso: isoNow,
    createdBy,
  };
  try {
    await Promise.all([
      setDoc(doc(db, LAWS_COLLECTION, law.id), payload, { merge: true }),
      setDoc(doc(db, STATUTORY_RULES_COLLECTION, law.id), payload, { merge: true }),
    ]);
  } catch (err) {
    console.error("Failed to create law in Firestore:", err);
    throw err;
  }
}

export async function deleteWorldLaw(lawId: string): Promise<void> {
  try {
    await Promise.all([
      deleteDoc(doc(db, LAWS_COLLECTION, lawId)),
      deleteDoc(doc(db, STATUTORY_RULES_COLLECTION, lawId)).catch(() => {}),
    ]);
  } catch (err) {
    console.error("Failed to delete law from Firestore:", err);
    throw err;
  }
}

export interface DailyStatutoryUpdate {
  id: string;
  verifiedAt: string;
  verifiedBy: string;
  statutesCount: number;
  notes: string;
  status: "verified_current" | "amendment_applied" | "review_completed";
  lawsReviewed?: string[];
}

export async function recordDailyStatutoryCheck(
  verifiedBy: string,
  notes: string,
  statutesCount: number,
): Promise<DailyStatutoryUpdate> {
  const updateRecord: DailyStatutoryUpdate = {
    id: `statutory-verif-${Date.now()}`,
    verifiedAt: new Date().toISOString(),
    verifiedBy,
    statutesCount,
    notes: notes || "Daily statutory verification completed across all global jurisdictions.",
    status: "verified_current",
  };

  try {
    const docRef = doc(db, STATUTORY_UPDATES_COLLECTION, updateRecord.id);
    await setDoc(
      docRef,
      {
        ...updateRecord,
        timestamp: serverTimestamp(),
      },
      { merge: true },
    );
    return updateRecord;
  } catch (err) {
    console.warn("Failed to record daily statutory check in Firestore:", err);
    return updateRecord;
  }
}

export async function fetchDailyStatutoryUpdates(): Promise<DailyStatutoryUpdate[]> {
  try {
    const colRef = collection(db, STATUTORY_UPDATES_COLLECTION);
    const snap = await getDocs(colRef);
    const list: DailyStatutoryUpdate[] = [];
    snap.forEach((d) => {
      list.push(d.data() as DailyStatutoryUpdate);
    });
    return list.sort((a, b) => new Date(b.verifiedAt).getTime() - new Date(a.verifiedAt).getTime());
  } catch (err) {
    console.warn("Failed to fetch statutory updates log:", err);
    return [];
  }
}
