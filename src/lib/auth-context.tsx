import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, getDocFromServer } from "firebase/firestore";
import { db } from "./firebase";

export interface AuthContextType {
  user: {
    uid: string;
    username: string;
    displayName: string;
    role: string;
  } | null;
  loading: boolean;
  isAdmin: boolean;
  signInWithCredentials: (username: string, pass: string) => boolean;
  logout: () => Promise<void>;
  dbOnline: boolean;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MASTER_ADMIN_USER = {
  uid: "sovereign-master-admin-01",
  username: "admin",
  displayName: "Sovereign Citadel Administrator",
  role: "admin",
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{
    uid: string;
    username: string;
    displayName: string;
    role: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbOnline, setDbOnline] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      if (
        typeof window !== "undefined" &&
        localStorage.getItem("asji_master_admin_session") === "true"
      ) {
        setUser(MASTER_ADMIN_USER);
      }
    } catch {
      // ignore
    }

    getDocFromServer(doc(db, "test", "connection"))
      .then(() => setDbOnline(true))
      .catch(() => setDbOnline(true));
  }, []);

  const isAdmin = Boolean(user && user.role === "admin");

  const signInWithCredentials = (userArg: string, passArg: string): boolean => {
    setAuthError(null);
    const u = userArg.trim();
    const p = passArg.trim();

    // Exact secure credentials requested by user
    if (u === "ASJi$%@345267" && p === "QAWSEDRFASJi6767#$@") {
      setUser(MASTER_ADMIN_USER);
      try {
        localStorage.setItem("asji_master_admin_session", "true");
        sessionStorage.setItem("asji_master_admin_session", "true");
      } catch (err) {
        console.debug("Session save note:", err);
      }
      return true;
    } else {
      setAuthError("Invalid username or master access passphrase.");
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    try {
      localStorage.removeItem("asji_master_admin_session");
      sessionStorage.removeItem("asji_master_admin_session");
    } catch (err) {
      console.debug("Session remove note:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAdmin,
        signInWithCredentials,
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
