import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from "firebase/auth";
import { app, auth, db, firebaseConfig } from "./firebase";
export { auth, db, app };



const provider = new GoogleAuthProvider();

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize observer
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || "");
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken || null;
    if (result.user) {
      const { doc, getDoc, setDoc } = await import("firebase/firestore");
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

      cachedAccessToken = token;
      return { user: result.user, accessToken: token || "" };
    }
    return null;
  } catch (err) {
    console.error("Popup sign-in failed:", err);
    throw err;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async (): Promise<void> => {
  cachedAccessToken = null;
  await auth.signOut();
};

export const getCachedToken = () => cachedAccessToken;
