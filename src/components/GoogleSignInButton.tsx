import React, { useState } from "react";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { initializeApp, getApps, getApp } from "firebase/app";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import firebaseConfig from "../../firebase-applet-config.json";

// -----------------------------------------------------------------------------
// FIREBASE CONSOLE CONFIGURATION CHECKLIST FOR PRODUCTION DEPLOYMENT
// -----------------------------------------------------------------------------
// Ensure any public user with a Gmail account can sign up and login seamlessly:
//
// 1. Enable Google Sign-In Provider:
//    - Go to https://console.firebase.google.com/
//    - Navigate to Build > Authentication > Sign-in method.
//    - Click "Add new provider" or select "Google".
//    - Toggle "Enable" to set it active.
//    - Fill in your Support Email and project public name, then click Save.
//
// 2. Configure OAuth Consent Screen:
//    - Go to https://console.cloud.google.com/apis/credentials/consent
//    - Set User Type to "External" so anyone with a public Gmail address can sign in.
//    - Fill in developer contact details and publish the App (change status from "Testing" to "In Production").
//    - Ensure you add the scopes: 'openid', 'email', 'profile'.
//
// 3. Register Authorized Redirect/Authentication Domains:
//    - In the Firebase Console, go to Authentication > Settings > Authorized Domains.
//    - Click "Add domain" and enter your application's domain name (e.g., your custom domain or the Cloud Run URL).
//    - Also make sure "localhost" and "127.0.0.1" are listed for local development.
// -----------------------------------------------------------------------------

interface GoogleSignInButtonProps {
  onSuccess: () => void;
  language?: "en" | "he";
  disabled?: boolean;
}

export default function GoogleSignInButton({ onSuccess, language = "en", disabled = false }: GoogleSignInButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const texts = {
    en: {
      btn_label: "Continue with Google",
      signing_in: "Connecting to Google...",
      success_msg: "Successfully signed in!",
      err_missing_key: "System configuration is incomplete.",
      err_blocked: "Google Sign-In popup was blocked by your browser layout settings or third-party cookies. Please allow popups for this site and try again.",
      err_unauthorized_domain: "This domain is not authorized in the authentication redirect list. Please contact support.",
      err_generic: "Could not complete registration. Check your connection or retry.",
    },
    he: {
      btn_label: "המשך עם Google",
      signing_in: "מתחבר ל-Google...",
      success_msg: "התחברת בהצלחה!",
      err_missing_key: "הגדרות המערכת אינן מלאות.",
      err_blocked: "חלון ההתחברות של Google נחסם על ידי הדפדפן או חסימת עוגיות. אנא אפשר פופ-אפים לאתר זה ונסה שוב.",
      err_unauthorized_domain: "דומיין זה אינו מורשה ברשימת ההפניות של מערכת האימות. פנה לתמיכה.",
      err_generic: "לא ניתן להשלים את ההרשמה. בדוק את החיבור ונסה שוב.",
    }
  };

  const currentStrings = language === "he" ? texts.he : texts.en;

  const handleSignIn = async () => {
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      // 1. Prioritize Environment Variables for production key safety
      const apiKey = firebaseConfig.apiKey;
      const authDomain = firebaseConfig.authDomain;
      const projectId = firebaseConfig.projectId;
      const appId = firebaseConfig.appId;

      if (!apiKey) {
        throw new Error("MISSING_API_KEY");
      }

      // 2. Safely retrieve or instantiate the Firebase App
      let firebaseApp;
      if (getApps().length === 0) {
        firebaseApp = initializeApp({
          apiKey,
          authDomain,
          projectId,
          appId,
          messagingSenderId: firebaseConfig.messagingSenderId,
          measurementId: firebaseConfig.measurementId
        });
      } else {
        firebaseApp = getApp();
      }

      const authInstance = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      provider.addScope("profile");
      provider.addScope("email");

      // Set custom parameters to force user account selection screen
      provider.setCustomParameters({
        prompt: "select_account"
      });

      // 3. Initiate popup flow
      const result = await signInWithPopup(authInstance, provider);
      
      if (result.user) {
        const { doc, getDoc, setDoc } = await import("firebase/firestore");
        const { db } = await import("../lib/firebase");
        
        const userRef = doc(db, "users", result.user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
          await setDoc(userRef, {
             userId: result.user.uid,
             userID: result.user.uid,
             name: result.user.displayName || "Anonymous",
             email: result.user.email ? result.user.email.toLowerCase() : "",
             role: "user"
          });
        }

        setSuccess(true);
        // Persist local flag that authorization succeeded
        localStorage.setItem("device_logged_in", "true");
        onSuccess();
      } else {
        throw new Error("EMPTY_USER");
      }
    } catch (err: any) {
      console.error("[Google Sign-In Error]:", err);
      
      const errorCode = err.code || err.message || "";
      
      if (errorCode === "MISSING_API_KEY") {
        setError(currentStrings.err_missing_key);
      } else if (
        errorCode.includes("auth/popup-blocked") || 
        errorCode.includes("popup_closed_by_user") ||
        errorCode.includes("auth/cancelled-popup-request")
      ) {
        setError(currentStrings.err_blocked);
      } else if (errorCode.includes("auth/unauthorized-domain") || errorCode.includes("auth/invalid-auth-event")) {
        setError(currentStrings.err_unauthorized_domain);
      } else {
        setError(`${currentStrings.err_generic} (${errorCode})`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-3" id="google-signin-wrapper">
      {/* Dynamic Notification Message box for user context safety (Zero Blank Screens) */}
      {error && (
        <div 
          id="google-signin-error" 
          className="flex items-start gap-2 bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3.5 rounded-xl font-medium"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="leading-normal">{error}</span>
        </div>
      )}

      {success && (
        <div 
          id="google-signin-success"
          className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs p-3.5 rounded-xl font-medium"
        >
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{currentStrings.success_msg}</span>
        </div>
      )}

      <button
        id="btn-google-auth"
        type="button"
        disabled={loading || disabled}
        onClick={handleSignIn}
        className="w-full rounded-xl py-4 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm font-medium flex items-center justify-center gap-3 transition-all cursor-pointer hover:border-slate-300 active:scale-[0.98] disabled:opacity-75 disabled:pointer-events-none"
      >
        {loading ? (
          <RefreshCw className="animate-spin text-slate-500" size={18} />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
        )}
        <span className="font-semibold text-[15px]">{loading ? currentStrings.signing_in : currentStrings.btn_label}</span>
      </button>
    </div>
  );
}
