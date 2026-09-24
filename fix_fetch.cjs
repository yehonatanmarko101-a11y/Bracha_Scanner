const fs = require('fs');

function patch(file) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add auth import if not present and we need it
    if (content.includes('fetch("/api') && !content.includes('auth.currentUser?.getIdToken()')) {
        if (!content.includes('import { auth }')) {
            content = content.replace('import { useAuth }', 'import { auth } from "../lib/firebaseAuth";\nimport { useAuth }');
        }
        
        content = content.replace(/headers:\s*{\s*"Content-Type":\s*"application\/json"\s*}/g, 'headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || "") }');
        content = content.replace(/headers:\s*{\s*"Content-Type":\s*"application\/json",\s*}/g, 'headers: { "Content-Type": "application/json", "Authorization": "Bearer " + (await auth.currentUser?.getIdToken() || "") }');
    }
    fs.writeFileSync(file, content);
}

patch('src/pages/ScanPage.tsx');
patch('src/pages/AskRavPage.tsx');
patch('src/components/RavDashboard.tsx');

