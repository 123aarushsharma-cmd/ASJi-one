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

export const auditCompliance = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = (data as { input?: unknown })?.input;
    const scanMode = (data as { scanMode?: unknown })?.scanMode;
    if (typeof input !== "string") throw new Error("Invalid input.");
    const result = validateAuditInput(input);
    if (!result.ok) throw new Error(result.error);
    const mode: "deep-grounded" | "fast-lite" =
      scanMode === "fast-lite" ? "fast-lite" : "deep-grounded";
    return { input: input.trim(), scanMode: mode };
  })
  .handler(async ({ data }): Promise<AuditReport> => {
    const { runAuditPipeline } = await import("./audit-pipeline.server");
    return runAuditPipeline(data.input, data.scanMode);
  });

export const getSavedAudits = createServerFn({ method: "GET" }).handler(async () => {
  const { listAuditsFromDb } = await import("./db.server");
  return listAuditsFromDb();
});

export const getAuditById = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const id = (data as { id?: unknown })?.id;
    if (typeof id !== "string") throw new Error("Invalid ID.");
    return { id };
  })
  .handler(async ({ data }) => {
    const { getAuditFromDb } = await import("./db.server");
    return getAuditFromDb(data.id);
  });

export const purgeDatabase = createServerFn({ method: "POST" }).handler(async () => {
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
    const safeHistory = Array.isArray(history) ? history : [];
    return { question: question.trim(), history: safeHistory };
  })
  .handler(async ({ data }) => {
    const { askComplianceOracle } = await import("./compliance-oracle.server");
    return askComplianceOracle(data.question, data.history);
  });
