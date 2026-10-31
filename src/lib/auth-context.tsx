import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  deleteUser,
  GoogleAuthProvider,
  signInWithPopup,
  type User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export const AUTHORIZED_ADMIN_EMAILS = ["asji.online@gmail.com", "123.aarushsharma@gmail.com"];

export const isWhitelistedAdminEmail = (email: string | null | undefined): boolean => {
  if (!email) return false;
  return AUTHORIZED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  createdAt?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  fbUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  adminSignIn: (email: string, pass: string) => Promise<void>;
  adminSignUp: (email: string, pass: string) => Promise<void>;
  adminSignInWithGoogle: () => Promise<void>;
  userSignIn: (email: string, pass: string) => Promise<void>;
  userSignUp: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  recordUserConsent: (policyVersion?: string, consentType?: string) => Promise<void>;
  logAdminActivity: (action: string, details?: Record<string, unknown>) => Promise<void>;
  deleteUserAccountAndData: () => Promise<void>;
  exportUserDataJson: () => Promise<string>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [fbUser, setFbUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setFbUser(currentUser);
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
        });

        // Check if user is in Whitelist AND admins/{uid} document exists in Firestore
        if (isWhitelistedAdminEmail(currentUser.email)) {
          try {
            const adminDocRef = doc(db, "admins", currentUser.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (adminSnap.exists()) {
              setIsAdmin(true);
            } else {
              // Auto-provision admin doc if whitelisted email signs in via Google or Auth
              await setDoc(adminDocRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                role: "admin",
                createdAt: serverTimestamp(),
              });
              setIsAdmin(true);
            }
          } catch {
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } else {
        setFbUser(null);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const adminSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!isWhitelistedAdminEmail(cleanEmail)) {
      const err = "Access Denied: Provided email is not an authorized administrator account.";
      setAuthError(err);
      throw new Error(err);
    }

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass.trim());
      const userEmail = cred.user.email;

      if (!isWhitelistedAdminEmail(userEmail)) {
        await signOut(auth);
        setIsAdmin(false);
        const err = "Access Denied: Provided email is not an authorized administrator account.";
        setAuthError(err);
        throw new Error(err);
      }

      const adminDocRef = doc(db, "admins", cred.user.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, {
          uid: cred.user.uid,
          email: userEmail,
          role: "admin",
          createdAt: serverTimestamp(),
        });
      }

      setIsAdmin(true);
      await logAdminActivity("ADMIN_LOGIN_SUCCESS", { email: cred.user.email });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication failed.";
      setAuthError(msg);
      throw error;
    }
  };

  const adminSignUp = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!isWhitelistedAdminEmail(cleanEmail)) {
      const err = "Access Denied: Provided email is not authorized for administrator registration.";
      setAuthError(err);
      throw new Error(err);
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, pass.trim());
      const adminDocRef = doc(db, "admins", cred.user.uid);
      await setDoc(adminDocRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        role: "admin",
        createdAt: serverTimestamp(),
      });
      setIsAdmin(true);
      await logAdminActivity("ADMIN_REGISTER_SUCCESS", { email: cred.user.email });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Admin registration failed.";
      setAuthError(msg);
      throw error;
    }
  };

  const adminSignInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      const userEmail = cred.user.email;

      if (!isWhitelistedAdminEmail(userEmail)) {
        await signOut(auth);
        setIsAdmin(false);
        const err = "Access Denied: Provided Google account is not an authorized administrator.";
        setAuthError(err);
        throw new Error(err);
      }

      const adminDocRef = doc(db, "admins", cred.user.uid);
      const adminSnap = await getDoc(adminDocRef);

      if (!adminSnap.exists()) {
        await setDoc(adminDocRef, {
          uid: cred.user.uid,
          email: userEmail,
          role: "admin",
          provider: "google.com",
          createdAt: serverTimestamp(),
        });
      }

      setIsAdmin(true);
      await logAdminActivity("ADMIN_GOOGLE_LOGIN_SUCCESS", { email: userEmail });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google authentication failed.";
      setAuthError(msg);
      throw error;
    }
  };

  const userSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), pass.trim());
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Sign in failed.";
      setAuthError(msg);
      throw error;
    }
  };

  const userSignUp = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass.trim());
      const userDocRef = doc(db, "users", cred.user.uid);
      await setDoc(userDocRef, {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: name || email.split("@")[0],
        createdAt: serverTimestamp(),
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Sign up failed.";
      setAuthError(msg);
      throw error;
    }
  };

  const logout = async () => {
    setAuthError(null);
    try {
      await signOut(auth);
      setUser(null);
      setFbUser(null);
      setIsAdmin(false);
    } catch {
      // safe logout
    }
  };

  const recordUserConsent = async (
    policyVersion = "2025.1",
    consentType = "website_scan_consent",
  ) => {
    if (!auth.currentUser) return;
    try {
      const consentsRef = collection(db, "users", auth.currentUser.uid, "consents");
      await addDoc(consentsRef, {
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        consentType,
        policyVersion,
        timestamp: serverTimestamp(),
        ipUserAgentRecorded: true,
      });
    } catch {
      // consent recording best effort
    }
  };

  const logAdminActivity = async (action: string, details?: Record<string, unknown>) => {
    if (!auth.currentUser || !isAdmin) return;
    try {
      const logsRef = collection(db, "auditLogs");
      await addDoc(logsRef, {
        adminUid: auth.currentUser.uid,
        action,
        timestamp: serverTimestamp(),
        details: details || {},
      });
    } catch {
      // safe admin log handling
    }
  };

  const deleteUserAccountAndData = async () => {
    const curr = auth.currentUser;
    if (!curr) throw new Error("No authenticated user.");

    const uid = curr.uid;

    try {
      const auditsSnap = await getDocs(collection(db, "users", uid, "audits"));
      for (const d of auditsSnap.docs) {
        await deleteDoc(doc(db, "users", uid, "audits", d.id));
      }

      const noticesSnap = await getDocs(collection(db, "users", uid, "notices"));
      for (const d of noticesSnap.docs) {
        await deleteDoc(doc(db, "users", uid, "notices", d.id));
      }

      const consentsSnap = await getDocs(collection(db, "users", uid, "consents"));
      for (const d of consentsSnap.docs) {
        await deleteDoc(doc(db, "users", uid, "consents", d.id));
      }

      await deleteDoc(doc(db, "users", uid));
    } catch {
      // deletion subcollection error ignored
    }

    await deleteUser(curr);
    setUser(null);
    setFbUser(null);
    setIsAdmin(false);
  };

  const exportUserDataJson = async (): Promise<string> => {
    const curr = auth.currentUser;
    if (!curr) throw new Error("No authenticated user.");

    const uid = curr.uid;
    const userData: Record<string, unknown> = {
      profile: {
        uid: curr.uid,
        email: curr.email,
        displayName: curr.displayName,
      },
      exportedAt: new Date().toISOString(),
      audits: [],
      notices: [],
      consents: [],
    };

    try {
      const auditsSnap = await getDocs(collection(db, "users", uid, "audits"));
      userData.audits = auditsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const noticesSnap = await getDocs(collection(db, "users", uid, "notices"));
      userData.notices = noticesSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

      const consentsSnap = await getDocs(collection(db, "users", uid, "consents"));
      userData.consents = consentsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch {
      // safe fallback export
    }

    return JSON.stringify(userData, null, 2);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        fbUser,
        loading,
        isAdmin,
        adminSignIn,
        adminSignUp,
        adminSignInWithGoogle,
        userSignIn,
        userSignUp,
        logout,
        recordUserConsent,
        logAdminActivity,
        deleteUserAccountAndData,
        exportUserDataJson,
        authError,
        clearAuthError: () => setAuthError(null),
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
