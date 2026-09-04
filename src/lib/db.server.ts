import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { AuditReport } from "./audit-types";

export type StoredAuditRecord = {
  id: string;
  visitorId: string;
  savedAt: string;
  target: string;
  targetKey: string;
  score: number;
  report: AuditReport;
};

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "scans_db.json");

// In-memory cache map for instant lookup and stability across serverless function instances
const memoryAuditCache = new Map<string, AuditReport>();

export function normalizeTargetKey(target: string): string {
  if (!target) return "";
  let key = target.toLowerCase().trim();
  key = key.replace(/^https?:\/\//i, "");
  key = key.replace(/^www\./i, "");
  key = key.split("/")[0];
  key = key.split("?")[0];
  key = key.split("#")[0];
  key = key.split(":")[0]; // strip port
  key = key.split(" ")[0]; // strip trailing descriptions
  return key.trim();
}

function ensureDbFile(): StoredAuditRecord[] {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify([]), "utf-8");
      return [];
    }
    const content = fs.readFileSync(DB_FILE, "utf-8");
    const rawRecords = JSON.parse(content) as StoredAuditRecord[];

    // Strictly deduplicate existing records by normalized targetKey to prevent repeated results
    const seen = new Set<string>();
    const deduplicatedRecords: StoredAuditRecord[] = [];
    let hadDuplicates = false;

    for (const r of rawRecords) {
      const key = normalizeTargetKey(r.targetKey || r.target || r.report?.target);
      if (!key) continue;
      if (seen.has(key)) {
        hadDuplicates = true;
        continue;
      }
      seen.add(key);
      const normalizedRecord: StoredAuditRecord = {
        ...r,
        targetKey: key,
        target: r.target || key,
      };
      deduplicatedRecords.push(normalizedRecord);
      if (r.report) {
        memoryAuditCache.set(key, r.report);
      }
    }

    if (hadDuplicates || deduplicatedRecords.length !== rawRecords.length) {
      writeDbFile(deduplicatedRecords);
    }

    return deduplicatedRecords;
  } catch {
    return [];
  }
}

function writeDbFile(records: StoredAuditRecord[]): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write scans_db.json", err);
  }
}

export async function saveAuditToDb(
  report: AuditReport,
  rawTarget?: string,
  visitorId = "default-visitor",
): Promise<{ id: string; savedAt: string }> {
  const records = ensureDbFile();
  const savedAt = new Date().toISOString();
  const primaryKey = normalizeTargetKey(rawTarget || report.target);
  const secondaryKey = normalizeTargetKey(report.target);
  const targetKey = primaryKey || secondaryKey;

  // Single-record authoritative check: replace any existing record with identical targetKey
  const existingIdx = records.findIndex((r) => {
    const rKey = r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target);
    return rKey === targetKey || rKey === primaryKey || rKey === secondaryKey;
  });

  let id: string;
  let updatedRecords: StoredAuditRecord[];

  if (existingIdx !== -1) {
    id = records[existingIdx].id;
    const existing = records[existingIdx];
    const updatedRecord: StoredAuditRecord = {
      ...existing,
      savedAt,
      target: report.target || existing.target,
      targetKey,
      score: report.score,
      report,
    };
    const withoutExisting = records.filter((_, idx) => idx !== existingIdx);
    updatedRecords = [updatedRecord, ...withoutExisting];
  } else {
    id = "scan_" + crypto.randomBytes(8).toString("hex");
    const newRecord: StoredAuditRecord = {
      id,
      visitorId,
      savedAt,
      target: report.target || targetKey,
      targetKey,
      score: report.score,
      report,
    };
    updatedRecords = [newRecord, ...records];
  }

  if (targetKey) memoryAuditCache.set(targetKey, report);
  if (primaryKey) memoryAuditCache.set(primaryKey, report);
  if (secondaryKey) memoryAuditCache.set(secondaryKey, report);

  writeDbFile(updatedRecords.slice(0, 200));

  return { id, savedAt };
}

export async function findRecentAuditByTarget(
  rawTarget: string,
  maxAgeHours = 0, // 0 means lifetime permanent caching
): Promise<AuditReport | null> {
  const searchKey = normalizeTargetKey(rawTarget);
  if (!searchKey) return null;

  // 1. Check fast in-memory cache first
  if (memoryAuditCache.has(searchKey)) {
    return memoryAuditCache.get(searchKey)!;
  }

  // 2. Check persistent disk file
  const records = ensureDbFile();

  for (const r of records) {
    const recordKey =
      r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target);
    if (recordKey === searchKey) {
      if (maxAgeHours > 0) {
        const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).getTime();
        const recordTime = new Date(r.savedAt).getTime();
        if (recordTime < cutoff) continue;
      }
      memoryAuditCache.set(searchKey, r.report);
      return r.report;
    }
  }

  return null;
}

export async function getAuditFromDb(id: string): Promise<AuditReport | null> {
  const records = ensureDbFile();
  const found = records.find((r) => r.id === id);
  return found ? found.report : null;
}

export async function listAuditsFromDb(
  visitorId = "default-visitor",
): Promise<{ id: string; target: string; score: number; savedAt: string }[]> {
  const records = ensureDbFile();
  const seen = new Set<string>();
  const list: { id: string; target: string; score: number; savedAt: string }[] = [];

  for (const r of records) {
    if (r.visitorId !== visitorId && visitorId !== "all") continue;
    const key = r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    list.push({
      id: r.id,
      target: r.targetKey || r.target,
      score: r.score,
      savedAt: r.savedAt,
    });
  }

  return list;
}

export async function purgeAuditFromDb(id: string): Promise<boolean> {
  const records = ensureDbFile();
  const filtered = records.filter((r) => r.id !== id);
  writeDbFile(filtered);
  return true;
}

export async function purgeAllAuditsFromDb(): Promise<{ count: number }> {
  const records = ensureDbFile();
  const count = records.length;

  // Secure overwrite / zero-fill before removing file
  try {
    if (fs.existsSync(DB_FILE)) {
      const stats = fs.statSync(DB_FILE);
      if (stats.size > 0) {
        const zeroBuffer = Buffer.alloc(stats.size, 0);
        fs.writeFileSync(DB_FILE, zeroBuffer);
      }
    }
  } catch {
    // ignore secure wipe errors
  }

  memoryAuditCache.clear();
  writeDbFile([]);
  return { count };
}
