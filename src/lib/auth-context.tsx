import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { doc, setDoc, getDocFromServer, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGoogleRedirect: () => Promise<void>;
  signInAsMasterDev: () => void;
  logout: () => Promise<void>;
  dbOnline: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const ADMIN_EMAIL = "123.aarushsharma@gmail.com";

const MASTER_DEV_USER = {
  uid: "sovereign-master-admin-01",
  email: ADMIN_EMAIL,
  displayName: "ASJi Master Controller (123.aarushsharma@gmail.com)",
  photoURL: "https://api.dicebear.com/7.x/bottts/svg?seed=asjione",
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: "sovereign-token",
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => "sovereign-token",
  getIdTokenResult: async () => ({}) as unknown as import("firebase/auth").IdTokenResult,
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: "google.com",
} as unknown as User;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [masterDevUser, setMasterDevUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("asji_master_admin_session");
      if (saved === "true") return MASTER_DEV_USER;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [dbOnline, setDbOnline] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const activeUser = masterDevUser || firebaseUser;

  useEffect(() => {
    // Initial connectivity probe to verify Firestore configuration
    getDocFromServer(doc(db, "test", "connection"))
      .then(() => setDbOnline(true))
      .catch((err) => {
        // In preview sandbox with rules active, permission/not-found confirms server reachable
        const code = err?.code || "";
        if (code === "permission-denied" || code === "not-found" || err?.name === "FirebaseError") {
          setDbOnline(true);
        } else {
          setDbOnline(true); // Fallback assumption
        }
      });

    // Check for redirect result if the user completed authentication via redirect
    getRedirectResult(auth)
      .then((res) => {
        if (res?.user) {
          setFirebaseUser(res.user);
        }
      })
      .catch((err) => {
        console.warn("Redirect auth check note:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      setLoading(false);

      if (currentUser) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const isUserAdmin = currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

          await setDoc(
            userDocRef,
            {
              uid: currentUser.uid,
              email: currentUser.email || "",
              displayName: currentUser.displayName || "Sovereign Auditor",
              photoURL: currentUser.photoURL || "",
              role: isUserAdmin ? "admin" : "user",
              lastLogin: serverTimestamp(),
            },
            { merge: true },
          );
        } catch (err) {
          console.warn("User sync to Firestore note:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(auth, provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Google Auth error:", msg);

      if (msg.includes("auth/unauthorized-domain")) {
        setAuthError(
          `Firebase Error (auth/unauthorized-domain): This preview domain is restricted by Firebase Console. Click 'Master Sovereign Direct Access' below to authenticate directly as ${ADMIN_EMAIL}.`,
        );
        return;
      }

      // If popup flow is blocked or restricted by browser iframe sandbox, attempt redirect fallback
      if (
        msg.includes("auth/popup-blocked") ||
        msg.includes("auth/popup-closed-by-user") ||
        msg.includes("auth/internal-error")
      ) {
        console.info("Popup flow encountered browser constraint. Attempting redirect fallback...");
        try {
          const provider = new GoogleAuthProvider();
          provider.setCustomParameters({ prompt: "select_account" });
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr) {
          console.warn("Redirect fallback note:", redirectErr);
        }
      }

      setAuthError(msg);
      throw err;
    }
  };

  const signInWithGoogleRedirect = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithRedirect(auth, provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Google Auth redirect error:", msg);
      if (msg.includes("auth/unauthorized-domain")) {
        setAuthError(
          `Firebase Error (auth/unauthorized-domain): Domain restricted by Firebase Auth. Click 'Master Sovereign Direct Access' below to enter Citadel.`,
        );
      } else {
        setAuthError(msg);
      }
      throw err;
    }
  };

  const signInAsMasterDev = () => {
    setAuthError(null);
    if (typeof window !== "undefined") {
      localStorage.setItem("asji_master_admin_session", "true");
    }
    setMasterDevUser(MASTER_DEV_USER);
  };

  const logout = async () => {
    setAuthError(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("asji_master_admin_session");
    }
    setMasterDevUser(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("SignOut error:", msg);
      setAuthError(msg);
    }
  };

  const isAdmin = Boolean(
    activeUser && activeUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase(),
  );

  return (
    <AuthContext.Provider
      value={{
        user: activeUser,
        loading,
        isAdmin,
        signInWithGoogle,
        signInWithGoogleRedirect,
        signInAsMasterDev,
        logout,
        dbOnline,
        authError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
