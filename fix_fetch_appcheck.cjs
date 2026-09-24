const fs = require('fs');

function patch(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    if (!content.includes('import { getToken } from "firebase/app-check"')) {
        content = content.replace('import { auth }', 'import { auth, app } from "../lib/firebaseAuth";\nimport { getToken } from "firebase/app-check"');
    }
    
    content = content.replace(/"Authorization": "Bearer " \+ \(await auth.currentUser\?.getIdToken\(\) \|\| ""\)/g, '"Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || ""), "X-Firebase-AppCheck": (await getToken(import("firebase/app-check").then(m => m.getAppCheck(app)).catch(() => ({} as any)))).token');
    
    fs.writeFileSync(file, content);
}

patch('src/pages/ScanPage.tsx');
patch('src/pages/AskRavPage.tsx');
patch('src/components/RavDashboard.tsx');

