import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { initializeFirestore, getFirestore, setLogLevel, type Firestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

// Silence connection warnings in offline/preview sandbox environments
try {
  setLogLevel("silent");
} catch {
  // Ignore in environments where setLogLevel is unavailable
}

let app: FirebaseApp;

if (!getApps().length) {
  app = initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    storageBucket: firebaseConfig.storageBucket,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId,
  });
} else {
  app = getApp();
}

let dbInstance: Firestore;
try {
  dbInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || "(default)",
  );
} catch {
  dbInstance = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");
}

export const db: Firestore = dbInstance;
export { app };
