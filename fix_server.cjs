const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

content = content.replace(/resolvedMimeType = "image\/jpeg";\s*if \(false\) \{\s*else if[^\n]+\n\s*else if[^\n]+\n\s*else if[^\n]+\n/g, 'resolvedMimeType = "image/jpeg";\n');

fs.writeFileSync('server.ts', content);
