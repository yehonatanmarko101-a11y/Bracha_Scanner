import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseAppletConfig from "../../firebase-applet-config.json";

// Core Firebase Web configuration
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  firestoreDatabaseId: firebaseAppletConfig.firestoreDatabaseId
};

// Initialize Firebase Client App, recycling if already present to prevent duplicate init warnings

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

if (typeof window !== "undefined") {
  // Use a dummy site key for preview environment, in production replace with a real reCAPTCHA Enterprise site key
  // App Check enforcement must be enabled in the Firebase console.
  (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.DEV;
  initializeAppCheck(app, {
    provider: new ReCaptchaEnterpriseProvider(import.meta.env.VITE_RECAPTCHA_SITE_KEY || "dummy-key-for-preview"),
    isTokenAutoRefreshEnabled: true
  });
}

export const db = getFirestore(app, firebaseAppletConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Test Firestore database connection as mandated by skill guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("offline")) {
      console.warn("Database appears offline. Please verify network access or configuration.");
    }
  }
}
testConnection();

// ==========================================
// 1. Primary Database Collection Schema Types
// ==========================================

/**
 * Representation of a registered User in the database.
 * Paths: /users/{userId}
 */
export interface UserProfileSchema {
  userId: string;
  userID?: string;
  name: string;
  email: string;
  role: "user" | "rav" | "admin";
  spamWarningCount: number;
  isBannedUntil: string | null;
  createdAt?: number;
}

/**
 * Representation of a detected scan/history item in the database.
 * Paths: /users/{userId}/scans/{scanId} or /scans/{scanId}
 */
export interface FoodScanSchema {
  id?: string;
  userId: string;
  imageUrl: string;
  foodName: string;
  brachaCategory: string;
  confidence: number;
  requires_multiple_blessings?: boolean;
  how_to_eat_instructions_en?: string;
  how_to_eat_instructions_he?: string;
  isExtended?: boolean;
  items?: Array<{ name: string; bracha: string; reasoning?: string }>;
  meal_summary?: Record<string, any>;
  createdAt: number;
  scan_code?: string;
}

/**
 * Representation of a Q&A interaction with the Rav (Rabbi).
 * Paths: /users/{userId}/questions/{questionId} or /questions/{questionId}
 */
export interface RavQuestionSchema {
  id?: string;
  text: string;
  category: string;
  status: "pool" | "claimed" | "answered";
  photo?: string;
  createdAt: number;
  userId: string;
  ravId?: string;
  answerText?: string;
  answeredAt?: number;
}

/**
 * Representation of a feedback submitted on a scan outcome.
 * Path: /feedbacks/{feedbackId}
 */
export interface FeedbackSchema {
  id?: string;
  userId: string;
  scanId: string;
  feedback_type: "good" | "bad";
  feedback_text: string;
  timestamp: number;
  foodDetected?: string;
  confidence?: number;
  language?: string;
  tradition?: string;
  type?: string;
  imageUrl?: string;
  explanation?: string;
}

// ==========================================
// 2. Cohesive Standard Firestore Error Handlers
// ==========================================

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

/**
 * Mandated error wrapper that parses permissions and logs rich diagnostic JSON.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error("Database Safety Error: ", errInfo.error);
  throw new Error(errInfo.error);
}

export async function getSafeAppCheckToken() {
  try {
    const { getToken, getAppCheck } = await import("firebase/app-check");
    const ac = getAppCheck(app);
    const tokenResult = await getToken(ac);
    return tokenResult.token;
  } catch (e) {
    console.warn("AppCheck token fetch failed", e);
    return "";
  }
}
