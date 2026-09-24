const fs = require('fs');

function clean(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // ensure imports
    if (!content.includes('import { auth, app }')) {
        content = content.replace('import { useAuth }', 'import { auth, app } from "../lib/firebaseAuth";\nimport { getToken } from "firebase/app-check";\nimport { useAuth }');
    }

    // Replace the exact fetch headers
    const newHeaders = 'headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || ""), "X-Firebase-AppCheck": (await getToken(import("firebase/app-check").then(m => m.getAppCheck(app)).catch(() => ({} as any)))).token }';
    content = content.replace(/headers:\s*{\s*"Content-Type":\s*"application\/json"\s*}/g, newHeaders);
    content = content.replace(/headers:\s*{\s*"Content-Type":\s*"application\/json",\s*}/g, newHeaders);
    
    fs.writeFileSync(file, content);
}

clean('src/pages/AskRavPage.tsx');
clean('src/components/RavDashboard.tsx');
clean('src/pages/ScanPage.tsx');
