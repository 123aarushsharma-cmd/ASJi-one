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

const MASTER_ADMIN_EMAILS = ["123.aarushsharma@gmail.com", "asji.online@gmail.com"];

export const isMasterAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return MASTER_ADMIN_EMAILS.includes(email.trim().toLowerCase());
};

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  createdAt?: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  fbUser: FirebaseUser | null;
  loading: boolean;
  isAdmin: boolean;
  adminSignIn: (email: string, pass: string) => Promise<void>;
  adminSignInWithGoogle: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
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
          photoURL: currentUser.photoURL || null,
        });

        // Sync or persist user profile document in Firestore
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          await setDoc(
            userDocRef,
            {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName || currentUser.email?.split("@")[0] || "User",
              photoURL: currentUser.photoURL || null,
              lastLogin: serverTimestamp(),
            },
            { merge: true },
          );
        } catch {
          // safe fallback
        }

        // Admin clearance check
        let adminGranted = false;
        if (isMasterAdminEmail(currentUser.email)) {
          adminGranted = true;
          try {
            const adminDocRef = doc(db, "admins", currentUser.uid);
            await setDoc(
              adminDocRef,
              {
                uid: currentUser.uid,
                email: currentUser.email,
                role: "admin",
                updatedAt: serverTimestamp(),
              },
              { merge: true },
            );
          } catch {
            // best effort
          }
        } else {
          try {
            const adminDocRef = doc(db, "admins", currentUser.uid);
            const adminSnap = await getDoc(adminDocRef);
            if (
              adminSnap.exists() &&
              (currentUser.emailVerified ||
                currentUser.providerData.some((p) => p.providerId === "google.com"))
            ) {
              adminGranted = true;
            }
          } catch {
            adminGranted = false;
          }
        }
        setIsAdmin(adminGranted);
      } else {
        setFbUser(null);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);

      // Persist user record in Firestore
      const userDocRef = doc(db, "users", cred.user.uid);
      await setDoc(
        userDocRef,
        {
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "User",
          photoURL: cred.user.photoURL || null,
          lastLogin: serverTimestamp(),
        },
        { merge: true },
      );

      if (isMasterAdminEmail(cred.user.email)) {
        setIsAdmin(true);
        const adminDocRef = doc(db, "admins", cred.user.uid);
        await setDoc(
          adminDocRef,
          {
            uid: cred.user.uid,
            email: cred.user.email,
            role: "admin",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google authentication failed.";
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

      let authorized = false;
      if (isMasterAdminEmail(userEmail)) {
        authorized = true;
        const adminDocRef = doc(db, "admins", cred.user.uid);
        await setDoc(
          adminDocRef,
          {
            uid: cred.user.uid,
            email: userEmail,
            role: "admin",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        const adminDocRef = doc(db, "admins", cred.user.uid);
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists()) {
          authorized = true;
        }
      }

      if (!authorized) {
        await signOut(auth);
        setIsAdmin(false);
        const err = "Access denied: Account is not an authorized administrator.";
        setAuthError(err);
        throw new Error(err);
      }

      setIsAdmin(true);
      await logAdminActivity("ADMIN_GOOGLE_LOGIN_SUCCESS", { email: cred.user.email });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Google authentication failed.";
      setAuthError(msg);
      throw error;
    }
  };

  const adminSignIn = async (email: string, pass: string) => {
    setAuthError(null);
    const cleanEmail = email.trim().toLowerCase();

    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass.trim());

      let authorized = false;
      if (isMasterAdminEmail(cred.user.email)) {
        authorized = true;
        const adminDocRef = doc(db, "admins", cred.user.uid);
        await setDoc(
          adminDocRef,
          {
            uid: cred.user.uid,
            email: cred.user.email,
            role: "admin",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      } else {
        const adminDocRef = doc(db, "admins", cred.user.uid);
        const adminSnap = await getDoc(adminDocRef);
        if (adminSnap.exists() && cred.user.emailVerified) {
          authorized = true;
        }
      }

      if (!authorized) {
        await signOut(auth);
        setIsAdmin(false);
        const err = "Access denied: Account is not an authorized administrator.";
        setAuthError(err);
        throw new Error(err);
      }

      setIsAdmin(true);
      await logAdminActivity("ADMIN_LOGIN_SUCCESS", { email: cred.user.email });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Authentication failed.";
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
      if (isMasterAdminEmail(cred.user.email)) {
        setIsAdmin(true);
        const adminDocRef = doc(db, "admins", cred.user.uid);
        await setDoc(
          adminDocRef,
          {
            uid: cred.user.uid,
            email: cred.user.email,
            role: "admin",
            createdAt: serverTimestamp(),
          },
          { merge: true },
        );
      }
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
        adminSignInWithGoogle,
        signInWithGoogle,
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
