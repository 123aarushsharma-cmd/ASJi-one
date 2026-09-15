import { n as validateAuditInput } from "./audit-input-Cp7XiQrA.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { t as WORLD_LAWS_DATA } from "./world-laws-data-w55Up4ot.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-D6PsMH9i.mjs";
import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import { a as collection, c as initializeFirestore, i as setDoc, l as serverTimestamp, n as deleteDoc, o as doc, r as getDocs, s as getFirestore, t as addDoc, u as setLogLevel } from "../_libs/@firebase/firestore+[...].mjs";
import "../_libs/firebase.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firestore-service-D9mP7sX5.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
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
}).handler(createSsrRpc("984883b0da38813c0cce6bc8c3a62cff28ef58a0c0b9057f4d843e161307ad33"));
createServerFn({ method: "GET" }).handler(createSsrRpc("a43abb497ece153cb49c7f5560e395bd5d0101396c0d0a0231fd889549bc7376"));
createServerFn({ method: "POST" }).validator((data) => {
	const id = data?.id;
	if (typeof id !== "string") throw new Error("Invalid ID.");
	return { id };
}).handler(createSsrRpc("8bbefe4354895ac4cfff4295c4264d4b13ec659886e2274dd08b125fecfb6f92"));
var purgeDatabase = createServerFn({ method: "POST" }).handler(createSsrRpc("2f0f4a833932394ac1c340b876d07f79ca756750c2e02ba9aa6a37113d5fced4"));
var askAiOracle = createServerFn({ method: "POST" }).validator((data) => {
	const question = data?.question;
	const history = data?.history;
	if (typeof question !== "string" || !question.trim()) throw new Error("Question string is required.");
	const safeHistory = Array.isArray(history) ? history : [];
	return {
		question: question.trim(),
		history: safeHistory
	};
}).handler(createSsrRpc("fd3f68f17aff5178769ed2feae9d6bae3db3a505931f6bbcd48fe2018ba3bdc4"));
var firebase_applet_config_default = {
	projectId: "perceptive-bulwark-js7sz",
	appId: "1:367022891462:web:5fa5a280bb662f8b5752c7",
	apiKey: "AIzaSyDnxvnzsEOUHLlj5yvmP33zeyagyCS0B9s",
	authDomain: "perceptive-bulwark-js7sz.firebaseapp.com",
	firestoreDatabaseId: "ai-studio-asjioneasjiweble-94ea65e4-c46e-4b43-b7d9-ef269ec313a5",
	storageBucket: "perceptive-bulwark-js7sz.firebasestorage.app",
	messagingSenderId: "367022891462",
	measurementId: "",
	oAuthClientId: "367022891462-g88u6p77q17qmo3oeo8r79sn313usf16.apps.googleusercontent.com",
	recaptchaSiteKey: ""
};
try {
	setLogLevel("silent");
} catch {}
var app;
if (!getApps().length) app = initializeApp({
	apiKey: firebase_applet_config_default.apiKey,
	authDomain: firebase_applet_config_default.authDomain,
	projectId: firebase_applet_config_default.projectId,
	storageBucket: firebase_applet_config_default.storageBucket,
	messagingSenderId: firebase_applet_config_default.messagingSenderId,
	appId: firebase_applet_config_default.appId
});
else app = getApp();
var dbInstance;
try {
	dbInstance = initializeFirestore(app, {
		experimentalForceLongPolling: true,
		experimentalAutoDetectLongPolling: true
	}, firebase_applet_config_default.firestoreDatabaseId || "(default)");
} catch {
	dbInstance = getFirestore(app, firebase_applet_config_default.firestoreDatabaseId || "(default)");
}
var db = dbInstance;
var LAWS_COLLECTION = "laws";
var CHAT_COLLECTION = "chat_sessions";
/**
* Initializes and synchronizes all global laws into Firestore.
* Ensures the database always contains up-to-date statutory schemas.
*/
async function seedWorldLawsToFirestore() {
	try {
		let synced = 0;
		for (const law of WORLD_LAWS_DATA) {
			await setDoc(doc(db, LAWS_COLLECTION, law.id), {
				...law,
				lastUpdated: serverTimestamp()
			}, { merge: true });
			synced++;
		}
		return {
			count: synced,
			status: "success"
		};
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err);
		console.warn("Firestore seed note:", msg);
		return {
			count: WORLD_LAWS_DATA.length,
			status: "fallback_local"
		};
	}
}
/**
* Retrieves all global data protection laws, preferring Firestore with seamless local fallback.
*/
async function fetchWorldLaws() {
	try {
		const snapshot = await getDocs(collection(db, LAWS_COLLECTION));
		if (!snapshot.empty) {
			const list = [];
			snapshot.forEach((d) => {
				list.push(d.data());
			});
			return list.sort((a, b) => a.country.localeCompare(b.country));
		}
		seedWorldLawsToFirestore().catch(console.error);
		return WORLD_LAWS_DATA;
	} catch (err) {
		console.warn("Using local world laws registry:", err);
		return WORLD_LAWS_DATA;
	}
}
/**
* Saves a message to a chat session in Firestore for persistent history.
*/
async function saveChatMessage(sessionId, message) {
	try {
		await addDoc(collection(db, CHAT_COLLECTION, sessionId, "messages"), {
			...message,
			timestamp: serverTimestamp()
		});
	} catch (err) {
		console.warn("Failed to save chat message to Firestore (using transient memory):", err);
	}
}
/**
* Deletes all messages in a chat session for complete privacy erasure.
*/
async function deleteChatSession(sessionId) {
	try {
		const snapshot = await getDocs(collection(db, CHAT_COLLECTION, sessionId, "messages"));
		for (const docSnap of snapshot.docs) await deleteDoc(doc(db, CHAT_COLLECTION, sessionId, "messages", docSnap.id));
	} catch (err) {
		console.warn("Session cleared locally:", err);
	}
}
//#endregion
export { purgeDatabase as a, fetchWorldLaws as i, auditCompliance as n, saveChatMessage as o, deleteChatSession as r, seedWorldLawsToFirestore as s, askAiOracle as t };
