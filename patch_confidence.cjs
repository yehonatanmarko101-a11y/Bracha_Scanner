const fs = require('fs');
let content = fs.readFileSync('src/pages/ScanPage.tsx', 'utf8');

content = content.replace(/confidence: 0\.95/g, 'confidence: 0');
content = content.replace(/\|\| 0\.95/g, '|| 0');

fs.writeFileSync('src/pages/ScanPage.tsx', content);
