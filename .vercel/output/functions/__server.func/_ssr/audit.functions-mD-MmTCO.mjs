import { n as validateAuditInput } from "./audit-input-Cp7XiQrA.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit.functions-mD-MmTCO.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var auditCompliance_createServerFn_handler = createServerRpc({
	id: "984883b0da38813c0cce6bc8c3a62cff28ef58a0c0b9057f4d843e161307ad33",
	name: "auditCompliance",
	filename: "src/lib/audit.functions.ts"
}, (opts) => auditCompliance.__executeServer(opts));
var auditCompliance = createServerFn({ method: "POST" }).validator((data) => {
	const input = data?.input;
	const scanMode = data?.scanMode;
	if (typeof input !== "string") throw new Error("Invalid input.");
	const result = validateAuditInput(input);
	if (!result.ok) throw new Error(result.error);
	const mode = scanMode === "fast-lite" ? "fast-lite" : "deep-grounded";
	return {
		input: input.trim(),
		scanMode: mode
	};
}).handler(auditCompliance_createServerFn_handler, async ({ data }) => {
	const { runAuditPipeline } = await import("./audit-pipeline.server-Dtn9R2jp.mjs");
	return runAuditPipeline(data.input, data.scanMode);
});
var getSavedAudits_createServerFn_handler = createServerRpc({
	id: "a43abb497ece153cb49c7f5560e395bd5d0101396c0d0a0231fd889549bc7376",
	name: "getSavedAudits",
	filename: "src/lib/audit.functions.ts"
}, (opts) => getSavedAudits.__executeServer(opts));
var getSavedAudits = createServerFn({ method: "GET" }).handler(getSavedAudits_createServerFn_handler, async () => {
	const { listAuditsFromDb } = await import("./db.server-CHPZQC_h.mjs");
	return listAuditsFromDb();
});
var getAuditById_createServerFn_handler = createServerRpc({
	id: "8bbefe4354895ac4cfff4295c4264d4b13ec659886e2274dd08b125fecfb6f92",
	name: "getAuditById",
	filename: "src/lib/audit.functions.ts"
}, (opts) => getAuditById.__executeServer(opts));
var getAuditById = createServerFn({ method: "POST" }).validator((data) => {
	const id = data?.id;
	if (typeof id !== "string") throw new Error("Invalid ID.");
	return { id };
}).handler(getAuditById_createServerFn_handler, async ({ data }) => {
	const { getAuditFromDb } = await import("./db.server-CHPZQC_h.mjs");
	return getAuditFromDb(data.id);
});
var purgeDatabase_createServerFn_handler = createServerRpc({
	id: "2f0f4a833932394ac1c340b876d07f79ca756750c2e02ba9aa6a37113d5fced4",
	name: "purgeDatabase",
	filename: "src/lib/audit.functions.ts"
}, (opts) => purgeDatabase.__executeServer(opts));
var purgeDatabase = createServerFn({ method: "POST" }).handler(purgeDatabase_createServerFn_handler, async () => {
	const { purgeAllAuditsFromDb } = await import("./db.server-CHPZQC_h.mjs");
	return purgeAllAuditsFromDb();
});
var askAiOracle_createServerFn_handler = createServerRpc({
	id: "fd3f68f17aff5178769ed2feae9d6bae3db3a505931f6bbcd48fe2018ba3bdc4",
	name: "askAiOracle",
	filename: "src/lib/audit.functions.ts"
}, (opts) => askAiOracle.__executeServer(opts));
var askAiOracle = createServerFn({ method: "POST" }).validator((data) => {
	const question = data?.question;
	const history = data?.history;
	if (typeof question !== "string" || !question.trim()) throw new Error("Question string is required.");
	const safeHistory = Array.isArray(history) ? history : [];
	return {
		question: question.trim(),
		history: safeHistory
	};
}).handler(askAiOracle_createServerFn_handler, async ({ data }) => {
	const { askComplianceOracle } = await import("./compliance-oracle.server-DNsSDuCa.mjs");
	return askComplianceOracle(data.question, data.history);
});
//#endregion
export { askAiOracle_createServerFn_handler, auditCompliance_createServerFn_handler, getAuditById_createServerFn_handler, getSavedAudits_createServerFn_handler, purgeDatabase_createServerFn_handler };
