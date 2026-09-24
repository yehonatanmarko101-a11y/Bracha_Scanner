const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

content = content.replace(
  /const ai = await generateContentWithRotation\(\);\s*const response = await ai\.models\.generateContent\(\{/g,
  'const response = await generateContentWithRotation({'
);

fs.writeFileSync('server.ts', content);
