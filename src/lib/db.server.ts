import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type { AuditReport } from "./audit-pipeline.server";

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

export function normalizeTargetKey(target: string): string {
  if (!target) return "";
  let key = target.toLowerCase().trim();
  key = key.replace(/^https?:\/\//i, "");
  key = key.replace(/^www\./i, "");
  key = key.split("/")[0];
  key = key.split("?")[0];
  key = key.split("#")[0];
  key = key.split(":")[0]; // strip port
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
    return JSON.parse(content) as StoredAuditRecord[];
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
  visitorId = "default-visitor",
): Promise<{ id: string; savedAt: string }> {
  const records = ensureDbFile();
  const id = "scan_" + crypto.randomBytes(8).toString("hex");
  const savedAt = new Date().toISOString();
  const targetKey = normalizeTargetKey(report.target);

  const newRecord: StoredAuditRecord = {
    id,
    visitorId,
    savedAt,
    target: report.target,
    targetKey,
    score: report.score,
    report,
  };

  // Replace any older record with identical targetKey to keep audit results 100% consistent
  const filtered = records.filter((r) => {
    const existingKey = r.targetKey || normalizeTargetKey(r.target);
    return existingKey !== targetKey;
  });

  const updated = [newRecord, ...filtered].slice(0, 100);
  writeDbFile(updated);

  return { id, savedAt };
}

export async function findRecentAuditByTarget(
  rawTarget: string,
  maxAgeHours = 168, // Default 7 days persistence
): Promise<AuditReport | null> {
  const records = ensureDbFile();
  const searchKey = normalizeTargetKey(rawTarget);
  if (!searchKey) return null;

  const cutoff = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000).getTime();

  for (const r of records) {
    const recordTime = new Date(r.savedAt).getTime();
    if (recordTime < cutoff) continue;

    const recordKey =
      r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target);
    if (recordKey === searchKey) {
      return r.report;
    }
  }

  return null;
}

export async function listAuditsFromDb(
  visitorId = "default-visitor",
): Promise<{ id: string; target: string; score: number; savedAt: string }[]> {
  const records = ensureDbFile();
  return records
    .filter((r) => r.visitorId === visitorId || visitorId === "all")
    .map((r) => ({
      id: r.id,
      target: r.target,
      score: r.score,
      savedAt: r.savedAt,
    }));
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

  writeDbFile([]);
  return { count };
}
