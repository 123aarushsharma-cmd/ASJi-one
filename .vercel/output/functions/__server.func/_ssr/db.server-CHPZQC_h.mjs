import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
//#region node_modules/.nitro/vite/services/ssr/assets/db.server-CHPZQC_h.js
var DB_DIR = path.join(process.cwd(), ".data");
var DB_FILE = path.join(DB_DIR, "scans_db.json");
var memoryAuditCache = /* @__PURE__ */ new Map();
function normalizeTargetKey(target) {
	if (!target) return "";
	let key = target.toLowerCase().trim();
	key = key.replace(/^https?:\/\//i, "");
	key = key.replace(/^www\./i, "");
	key = key.split("/")[0];
	key = key.split("?")[0];
	key = key.split("#")[0];
	key = key.split(":")[0];
	key = key.split(" ")[0];
	return key.trim();
}
function ensureDbFile() {
	try {
		if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
		if (!fs.existsSync(DB_FILE)) {
			fs.writeFileSync(DB_FILE, JSON.stringify([]), "utf-8");
			return [];
		}
		const content = fs.readFileSync(DB_FILE, "utf-8");
		const rawRecords = JSON.parse(content);
		const seen = /* @__PURE__ */ new Set();
		const deduplicatedRecords = [];
		let hadDuplicates = false;
		for (const r of rawRecords) {
			const key = normalizeTargetKey(r.targetKey || r.target || r.report?.target);
			if (!key) continue;
			if (seen.has(key)) {
				hadDuplicates = true;
				continue;
			}
			seen.add(key);
			const normalizedRecord = {
				...r,
				targetKey: key,
				target: r.target || key
			};
			deduplicatedRecords.push(normalizedRecord);
			if (r.report) memoryAuditCache.set(key, r.report);
		}
		if (hadDuplicates || deduplicatedRecords.length !== rawRecords.length) writeDbFile(deduplicatedRecords);
		return deduplicatedRecords;
	} catch {
		return [];
	}
}
function writeDbFile(records) {
	try {
		if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });
		fs.writeFileSync(DB_FILE, JSON.stringify(records, null, 2), "utf-8");
	} catch (err) {
		console.error("Failed to write scans_db.json", err);
	}
}
async function saveAuditToDb(report, rawTarget, visitorId = "default-visitor") {
	const records = ensureDbFile();
	const savedAt = (/* @__PURE__ */ new Date()).toISOString();
	const primaryKey = normalizeTargetKey(rawTarget || report.target);
	const secondaryKey = normalizeTargetKey(report.target);
	const targetKey = primaryKey || secondaryKey;
	const existingIdx = records.findIndex((r) => {
		const rKey = r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target);
		return rKey === targetKey || rKey === primaryKey || rKey === secondaryKey;
	});
	let id;
	let updatedRecords;
	if (existingIdx !== -1) {
		id = records[existingIdx].id;
		const existing = records[existingIdx];
		updatedRecords = [{
			...existing,
			savedAt,
			target: report.target || existing.target,
			targetKey,
			score: report.score,
			report
		}, ...records.filter((_, idx) => idx !== existingIdx)];
	} else {
		id = "scan_" + crypto.randomBytes(8).toString("hex");
		updatedRecords = [{
			id,
			visitorId,
			savedAt,
			target: report.target || targetKey,
			targetKey,
			score: report.score,
			report
		}, ...records];
	}
	if (targetKey) memoryAuditCache.set(targetKey, report);
	if (primaryKey) memoryAuditCache.set(primaryKey, report);
	if (secondaryKey) memoryAuditCache.set(secondaryKey, report);
	writeDbFile(updatedRecords.slice(0, 200));
	return {
		id,
		savedAt
	};
}
async function findRecentAuditByTarget(rawTarget, maxAgeHours = 0) {
	const searchKey = normalizeTargetKey(rawTarget);
	if (!searchKey) return null;
	if (memoryAuditCache.has(searchKey)) return memoryAuditCache.get(searchKey);
	const records = ensureDbFile();
	for (const r of records) if ((r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target)) === searchKey) {
		if (maxAgeHours > 0) {
			const cutoff = (/* @__PURE__ */ new Date(Date.now() - maxAgeHours * 60 * 60 * 1e3)).getTime();
			if (new Date(r.savedAt).getTime() < cutoff) continue;
		}
		memoryAuditCache.set(searchKey, r.report);
		return r.report;
	}
	return null;
}
async function getAuditFromDb(id) {
	const found = ensureDbFile().find((r) => r.id === id);
	return found ? found.report : null;
}
async function listAuditsFromDb(visitorId = "default-visitor") {
	const records = ensureDbFile();
	const seen = /* @__PURE__ */ new Set();
	const list = [];
	for (const r of records) {
		if (r.visitorId !== visitorId && visitorId !== "all") continue;
		const key = r.targetKey || normalizeTargetKey(r.target) || normalizeTargetKey(r.report?.target);
		if (!key || seen.has(key)) continue;
		seen.add(key);
		list.push({
			id: r.id,
			target: r.targetKey || r.target,
			score: r.score,
			savedAt: r.savedAt
		});
	}
	return list;
}
async function purgeAllAuditsFromDb() {
	const count = ensureDbFile().length;
	try {
		if (fs.existsSync(DB_FILE)) {
			const stats = fs.statSync(DB_FILE);
			if (stats.size > 0) {
				const zeroBuffer = Buffer.alloc(stats.size, 0);
				fs.writeFileSync(DB_FILE, zeroBuffer);
			}
		}
	} catch {}
	memoryAuditCache.clear();
	writeDbFile([]);
	return { count };
}
//#endregion
export { findRecentAuditByTarget, getAuditFromDb, listAuditsFromDb, purgeAllAuditsFromDb, saveAuditToDb };
