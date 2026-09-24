const fs = require('fs');
let content = fs.readFileSync('src/lib/firebase.ts', 'utf8');

if (!content.includes('import { initializeAppCheck')) {
    content = content.replace('import { getAuth }', 'import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";\nimport { getAuth }');
    
    const appCheckInit = `
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
`;
    content = content.replace('export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();', appCheckInit);
}

fs.writeFileSync('src/lib/firebase.ts', content);
