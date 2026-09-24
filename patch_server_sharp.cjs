const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('import sharp from "sharp"')) {
    content = content.replace('import helmet', 'import helmet from "helmet";\nimport sharp from "sharp";');
}

fs.writeFileSync('server.ts', content);
