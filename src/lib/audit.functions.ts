import { createServerFn } from "@tanstack/react-start";
import { validateAuditInput } from "./audit-input";
import type { AuditReport, GroundingInfo, GroundingSource } from "./audit-pipeline.server";

export type { AuditReport, GroundingInfo, GroundingSource };

export const auditCompliance = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const input = (data as { input?: unknown })?.input;
    const scanMode = (data as { scanMode?: unknown })?.scanMode;
    if (typeof input !== "string") throw new Error("Invalid input.");
    const result = validateAuditInput(input);
    if (!result.ok) throw new Error(result.error);
    const mode = scanMode === "fast-lite" ? "fast-lite" : "deep-grounded";
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
