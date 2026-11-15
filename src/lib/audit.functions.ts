import { createServerFn } from "@tanstack/react-start";
import { validateAuditInput } from "./audit-input";
import type {
  AuditReport,
  GroundingInfo,
  GroundingSource,
  JurisdictionVerdictItem,
  CrossBorderAnalysis,
  RadarTerminalData,
} from "./audit-types";

export type {
  AuditReport,
  GroundingInfo,
  GroundingSource,
  JurisdictionVerdictItem,
  CrossBorderAnalysis,
  RadarTerminalData,
};

const SAFE_ID_REGEX = /^[a-zA-Z0-9_-]{6,64}$/;

export const auditCompliance = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const payload = (data && typeof data === "object" ? data : {}) as {
      input?: unknown;
      scanMode?: unknown;
      politechMode?: unknown;
      adminIdToken?: unknown;
    };
    const input = payload.input;
    const scanMode = payload.scanMode;
    if (typeof input !== "string") throw new Error("Invalid input.");
    const result = validateAuditInput(input);
    if (!result.ok) throw new Error(result.error);
    const mode: "deep-grounded" | "fast-lite" =
      scanMode === "fast-lite" ? "fast-lite" : "deep-grounded";
    const adminIdToken =
      typeof payload.adminIdToken === "string" && payload.adminIdToken.length >= 20
        ? payload.adminIdToken
        : undefined;
    return {
      input: input.trim(),
      scanMode: mode,
      politechMode: Boolean(payload.politechMode),
      adminIdToken,
    };
  })
  .handler(async ({ data }): Promise<AuditReport> => {
    const { checkRateLimit, verifyFirebaseAdminIdToken } = await import("./security.server");
    const isVerifiedAdmin = data.adminIdToken
      ? Boolean(await verifyFirebaseAdminIdToken(data.adminIdToken))
      : false;

    if (!isVerifiedAdmin) {
      let clientKey = "public-live-scan";
      try {
        const { getRequestHeader } = await import("@tanstack/react-start/server");
        const fwd = getRequestHeader("x-forwarded-for") || getRequestHeader("x-real-ip");
        if (fwd) clientKey = `live-scan:${fwd.split(",")[0].trim()}`;
      } catch {
        // ignore header lookup fallback
      }
      const rl = checkRateLimit(clientKey, 6, 60_000);
      if (!rl.allowed) {
        throw new Error(
          `Institutional rate-limit guard active (max 6 live scans per minute). Please retry in ${rl.retryAfterSec}s.`,
        );
      }
    }

    const { runAuditPipeline } = await import("./audit-pipeline.server");
    return runAuditPipeline(data.input, data.scanMode, {
      politechMode: data.politechMode,
    });
  });

export const getSavedAudits = createServerFn({ method: "GET" }).handler(async () => {
  const { listAuditsFromDb } = await import("./db.server");
  return listAuditsFromDb();
});

export const getAuditById = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const id = (data as { id?: unknown })?.id;
    if (typeof id !== "string" || !SAFE_ID_REGEX.test(id)) {
      throw new Error("Invalid audit record identifier.");
    }
    return { id };
  })
  .handler(async ({ data }) => {
    const { getAuditFromDb } = await import("./db.server");
    return getAuditFromDb(data.id);
  });

export const purgeDatabase = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const idToken = (data as { idToken?: unknown })?.idToken;
    if (typeof idToken !== "string" || idToken.trim().length < 20 || idToken.length > 4096) {
      throw new Error("Unauthorized: Master Administrator verification token required.");
    }
    return { idToken: idToken.trim() };
  })
  .handler(async ({ data }) => {
    const { verifyFirebaseAdminIdToken } = await import("./security.server");
    const adminUser = await verifyFirebaseAdminIdToken(data.idToken);
    if (!adminUser) {
      throw new Error(
        "Forbidden: Verified Master Administrator clearance required to purge records.",
      );
    }
    const { purgeAllAuditsFromDb } = await import("./db.server");
    return purgeAllAuditsFromDb();
  });

export const askAiOracle = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const question = (data as { question?: unknown })?.question;
    const history = (data as { history?: unknown })?.history;
    if (typeof question !== "string" || !question.trim()) {
      throw new Error("Question string is required.");
    }
    const cleanQuestion = question.trim().slice(0, 1500);
    const rawHistory = Array.isArray(history) ? history.slice(-10) : [];
    const safeHistory: { role: "user" | "model"; parts: string[] }[] = [];

    for (const item of rawHistory) {
      if (!item || typeof item !== "object") continue;
      const role = (item as { role?: unknown }).role === "model" ? "model" : "user";
      const partsRaw = (item as { parts?: unknown }).parts;
      if (!Array.isArray(partsRaw)) continue;
      const cleanParts = partsRaw
        .filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        .slice(0, 3)
        .map((p) => p.trim().slice(0, 1500));
      if (cleanParts.length > 0) {
        safeHistory.push({ role, parts: cleanParts });
      }
    }

    return { question: cleanQuestion, history: safeHistory };
  })
  .handler(async ({ data }) => {
    const { askComplianceOracle } = await import("./compliance-oracle.server");
    return askComplianceOracle(data.question, data.history);
  });
