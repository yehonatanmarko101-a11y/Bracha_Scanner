const fs = require('fs');
let authPage = fs.readFileSync('src/pages/AuthPage.tsx', 'utf8');

authPage = authPage.replace(
  'import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";',
  'import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";'
);

const signUpReplacement = `
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (cred.user) {
          await updateProfile(cred.user, { displayName: name });
          await sendEmailVerification(cred.user);
          const { doc, getDoc, setDoc } = await import("firebase/firestore");
          const { db } = await import("../lib/firebaseAuth");
          const userRef = doc(db, "users", cred.user.uid);
          await setDoc(userRef, {
            name: name,
            userID: cred.user.uid,
            userId: cred.user.uid,
            role: "user",
            email: email.toLowerCase()
          });
          setError("Account created! Please check your email to verify your account before logging in.");
          setIsSignUp(false);
          setLoading(false);
          return;
        }
`;

authPage = authPage.replace(
  /const cred = await createUserWithEmailAndPassword\(auth, email, password\);\s*if \(cred\.user\) \{\s*await updateProfile\(cred\.user, \{ displayName: name \}\);\s*const \{ doc, getDoc, setDoc \} = await import\("firebase\/firestore"\);\s*const \{ db \} = await import\("\.\.\/lib\/firebase(Auth)?"\);\s*const userRef = doc\(db, "users", cred\.user\.uid\);\s*const userSnap = await getDoc\(userRef\);\s*if \(!userSnap\.exists\(\)\) \{\s*await setDoc\(userRef, \{\s*name: name,\s*userID: cred\.user\.uid,\s*userId: cred\.user\.uid,\s*role: "user",\s*email: email\.toLowerCase\(\)\s*\}\);\s*\}\s*\}/g,
  signUpReplacement
);

const signInReplacement = `
        const cred = await signInWithEmailAndPassword(auth, email, password);
        if (!cred.user.emailVerified) {
           setError("Please verify your email address before logging in. Check your inbox.");
           setLoading(false);
           auth.signOut();
           return;
        }
`;

authPage = authPage.replace(
  /await signInWithEmailAndPassword\(auth, email, password\);/g,
  signInReplacement
);

fs.writeFileSync('src/pages/AuthPage.tsx', authPage);
