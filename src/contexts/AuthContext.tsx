import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../lib/firebaseAuth";
import { User, signInAnonymously } from "firebase/auth";
import { doc, getDoc, setDoc, deleteDoc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebaseAuth";

interface AuthContextType {
  user: User | null;
  role: "user" | "rav" | "admin";
  loading: boolean;
  signInAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: "user",
  loading: true,
  signInAsGuest: async () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"user" | "rav" | "admin">("user");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | null = null;

    const authUnsubscribe = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        try {
          const userRef = doc(db, "users", u.uid);
          const email = u.email ? u.email.toLowerCase().trim() : "";
          
          // Hardcoded role lists
          const HARDCODED_ADMINS = ["yehonatanmarko100@gmail.com"];
          const HARDCODED_RAVS: string[] = [];

          const getHardcodedRole = () => {
             if (HARDCODED_ADMINS.includes(email)) return "admin";
             if (HARDCODED_RAVS.includes(email)) return "rav";
             return null;
          };

          // Subscribe to changes in the user document
          unsubscribeUserDoc = onSnapshot(userRef, async (docSnap) => {
            let currentRole = "user";
            const hcRole = getHardcodedRole();

            if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.bannedUntil) {
              if (data.bannedUntil === -1 || data.bannedUntil > Date.now()) {
                alert("This account has been banned by an administrator.");
                auth.signOut();
                return;
              }
            }

              currentRole = docSnap.data().role || "user";
              // Enforce hardcoded role if it exists and is higher
              if (hcRole === "admin" && currentRole !== "admin") {
                await setDoc(userRef, { role: "admin" }, { merge: true });
                currentRole = "admin";
              } else if (hcRole === "rav" && currentRole !== "rav" && currentRole !== "admin") {
                await setDoc(userRef, { role: "rav" }, { merge: true });
                currentRole = "rav";
              }
            } else {
              // Document doesn't exist, create it
              currentRole = hcRole || "user";
              
              if (email && !hcRole) {
                try {
                  const preApprovedRef = doc(db, "users", `preApproved_${email}`);
                  const preApprovedSnap = await getDoc(preApprovedRef);
                  if (preApprovedSnap.exists()) {
                    currentRole = preApprovedSnap.data().role || "rav";
                    await deleteDoc(preApprovedRef).catch(e => console.error("Could not delete preapproved", e));
                  }
                } catch (e) {
                  console.error("Failed to check pre-approvals:", e);
                }
              }

              try {
                await setDoc(userRef, {
                  userId: u.uid,
                  userID: u.uid,
                  name: u.displayName || "Anonymous",
                  email: email,
                  role: currentRole,
                  spamWarningCount: 0,
                  isBannedUntil: null,
                }, { merge: true });
              } catch (e) {
                console.error("Failed to create user document:", e);
                currentRole = "user";
              }
            }
            
            setRole(currentRole as any);
            setLoading(false);
          }, (error) => {
            console.warn("User document listener error:", error);
            // If permission denied during signout, ignore
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          const email = u.email ? u.email.toLowerCase() : "";
          if (email === "yehonatanmarko100@gmail.com") setRole("admin");
          else setRole("user");
          setLoading(false);
        }
      } else {
        setRole("user");
        if (unsubscribeUserDoc) {
          unsubscribeUserDoc();
          unsubscribeUserDoc = null;
        }
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      await signInAnonymously(auth);
    } catch (e: any) {
      console.error(e);
      alert("Guest Sign In is disabled in the system configuration.");
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signInAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
