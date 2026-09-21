import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { WORLD_LAWS_DATA, type WorldLaw } from "./world-laws-data";

const LAWS_COLLECTION = "laws";
const CHAT_COLLECTION = "chat_sessions";

export interface ChatMessage {
  id?: string;
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp?: string | number | Date | null;
  sources?: {
    law: string;
    article: string;
    authority: string;
  }[];
  quickActions?: string[];
}

/**
 * Initializes and synchronizes all global laws into Firestore.
 * Ensures the database always contains up-to-date statutory schemas.
 */
export async function seedWorldLawsToFirestore(): Promise<{ count: number; status: string }> {
  try {
    let synced = 0;
    for (const law of WORLD_LAWS_DATA) {
      const docRef = doc(db, LAWS_COLLECTION, law.id);
      await setDoc(
        docRef,
        {
          ...law,
          lastUpdated: serverTimestamp(),
        },
        { merge: true },
      );
      synced++;
    }
    return { count: synced, status: "success" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("Firestore seed note:", msg);
    return { count: WORLD_LAWS_DATA.length, status: "fallback_local" };
  }
}

/**
 * Retrieves all global data protection laws, preferring Firestore with seamless local fallback.
 */
export async function fetchWorldLaws(): Promise<WorldLaw[]> {
  try {
    const colRef = collection(db, LAWS_COLLECTION);
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      const list: WorldLaw[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as WorldLaw);
      });
      return list.sort((a, b) => a.country.localeCompare(b.country));
    }
    // If firestore is empty, seed it now
    seedWorldLawsToFirestore().catch(console.error);
    return WORLD_LAWS_DATA;
  } catch (err) {
    console.warn("Using local world laws registry:", err);
    return WORLD_LAWS_DATA;
  }
}

/**
 * Retrieves a single sovereign law by ID
 */
export async function fetchLawById(lawId: string): Promise<WorldLaw | null> {
  try {
    const docRef = doc(db, LAWS_COLLECTION, lawId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as WorldLaw;
    }
    return WORLD_LAWS_DATA.find((l) => l.id === lawId) || null;
  } catch (err) {
    return WORLD_LAWS_DATA.find((l) => l.id === lawId) || null;
  }
}

export interface UserAuditRecord {
  id: string;
  userId: string;
  domain: string;
  score: number;
  verdict: string;
  criticalFindingsCount: number;
  statutoryExceptionsCount: number;
  reportSummary?: string;
  createdAt: string;
  reportData?: unknown;
}

export interface UserNoticeRecord {
  id: string;
  userId: string;
  domain: string;
  lawId: string;
  title: string;
  content: string;
  createdAt: string;
}

/**
 * Saves an audit report to the authenticated user's private Firestore vault.
 */
export async function saveUserAudit(
  userId: string,
  audit: Omit<UserAuditRecord, "userId" | "createdAt"> & { createdAt?: string },
): Promise<void> {
  if (!userId) return;
  try {
    const auditDocRef = doc(db, "users", userId, "audits", audit.id);
    await setDoc(
      auditDocRef,
      {
        ...audit,
        userId,
        createdAt: audit.createdAt || new Date().toISOString(),
        syncedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Failed to persist user audit to private Firestore:", err);
  }
}

/**
 * Fetches all private audits saved under the user's isolated account.
 */
export async function fetchUserAudits(userId: string): Promise<UserAuditRecord[]> {
  if (!userId) return [];
  try {
    const auditsCol = collection(db, "users", userId, "audits");
    const snapshot = await getDocs(auditsCol);
    const results: UserAuditRecord[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as UserAuditRecord);
    });
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (err) {
    console.warn("Failed to retrieve user audits from Firestore:", err);
    return [];
  }
}

/**
 * Deletes a user audit record from private cloud persistence.
 */
export async function deleteUserAudit(userId: string, auditId: string): Promise<void> {
  if (!userId || !auditId) return;
  try {
    const auditDocRef = doc(db, "users", userId, "audits", auditId);
    await deleteDoc(auditDocRef);
  } catch (err) {
    console.warn("Failed to delete user audit from Firestore:", err);
  }
}

/**
 * Saves a customized statutory notice or policy charter to user's private vault.
 */
export async function saveUserNotice(
  userId: string,
  notice: Omit<UserNoticeRecord, "userId" | "createdAt"> & { createdAt?: string },
): Promise<void> {
  if (!userId) return;
  try {
    const noticeDocRef = doc(db, "users", userId, "notices", notice.id);
    await setDoc(
      noticeDocRef,
      {
        ...notice,
        userId,
        createdAt: notice.createdAt || new Date().toISOString(),
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } catch (err) {
    console.warn("Failed to save notice to user vault:", err);
  }
}

/**
 * Fetches user's saved notices from private vault.
 */
export async function fetchUserNotices(userId: string): Promise<UserNoticeRecord[]> {
  if (!userId) return [];
  try {
    const noticesCol = collection(db, "users", userId, "notices");
    const snapshot = await getDocs(noticesCol);
    const results: UserNoticeRecord[] = [];
    snapshot.forEach((d) => {
      results.push(d.data() as UserNoticeRecord);
    });
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  } catch (err) {
    console.warn("Failed to retrieve user notices from Firestore:", err);
    return [];
  }
}

/**
 * Deletes a notice from user's vault.
 */
export async function deleteUserNotice(userId: string, noticeId: string): Promise<void> {
  if (!userId || !noticeId) return;
  try {
    const noticeDocRef = doc(db, "users", userId, "notices", noticeId);
    await deleteDoc(noticeDocRef);
  } catch (err) {
    console.warn("Failed to delete notice from Firestore:", err);
  }
}

/**
 * Saves a message to a chat session in Firestore for persistent history.
 */
export async function saveChatMessage(
  sessionId: string,
  message: Omit<ChatMessage, "id">,
): Promise<void> {
  try {
    const messagesCol = collection(db, CHAT_COLLECTION, sessionId, "messages");
    await addDoc(messagesCol, {
      ...message,
      timestamp: serverTimestamp(),
    });
  } catch (err) {
    console.warn("Failed to save chat message to Firestore (using transient memory):", err);
  }
}

/**
 * Deletes all messages in a chat session for complete privacy erasure.
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  try {
    const messagesCol = collection(db, CHAT_COLLECTION, sessionId, "messages");
    const snapshot = await getDocs(messagesCol);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, CHAT_COLLECTION, sessionId, "messages", docSnap.id));
    }
  } catch (err) {
    console.warn("Session cleared locally:", err);
  }
}
