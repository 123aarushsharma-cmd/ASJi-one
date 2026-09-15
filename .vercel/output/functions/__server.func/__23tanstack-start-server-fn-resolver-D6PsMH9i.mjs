//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-D6PsMH9i.js
var manifest = {
	"2f0f4a833932394ac1c340b876d07f79ca756750c2e02ba9aa6a37113d5fced4": {
		functionName: "purgeDatabase_createServerFn_handler",
		importer: () => import("./_ssr/audit.functions-mD-MmTCO.mjs")
	},
	"8bbefe4354895ac4cfff4295c4264d4b13ec659886e2274dd08b125fecfb6f92": {
		functionName: "getAuditById_createServerFn_handler",
		importer: () => import("./_ssr/audit.functions-mD-MmTCO.mjs")
	},
	"984883b0da38813c0cce6bc8c3a62cff28ef58a0c0b9057f4d843e161307ad33": {
		functionName: "auditCompliance_createServerFn_handler",
		importer: () => import("./_ssr/audit.functions-mD-MmTCO.mjs")
	},
	"a43abb497ece153cb49c7f5560e395bd5d0101396c0d0a0231fd889549bc7376": {
		functionName: "getSavedAudits_createServerFn_handler",
		importer: () => import("./_ssr/audit.functions-mD-MmTCO.mjs")
	},
	"fd3f68f17aff5178769ed2feae9d6bae3db3a505931f6bbcd48fe2018ba3bdc4": {
		functionName: "askAiOracle_createServerFn_handler",
		importer: () => import("./_ssr/audit.functions-mD-MmTCO.mjs")
	}
};
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
