const fs = require('fs');

function patchFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('import { auth } from ')) {
    if (filePath.includes('ScanPage')) {
        content = content.replace('import { useAuth }', 'import { auth } from "../lib/firebaseAuth";\nimport { useAuth }');
    }
    if (filePath.includes('AskRavPage')) {
        content = content.replace('import { useAuth }', 'import { auth } from "../lib/firebaseAuth";\nimport { useAuth }');
    }
  }

  content = content.replace(/await fetch\("(\/api[^"]+)", {/g, `await fetch("$1", {
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + (auth.currentUser ? await auth.currentUser.getIdToken() : "")
        },`);
        
  // Also we need to clean up duplicate headers if they were already there, 
  // but it's simpler to just do a precise regex replace for each known file.
  fs.writeFileSync(filePath, content);
}

// Just doing precise replacements is safer.
