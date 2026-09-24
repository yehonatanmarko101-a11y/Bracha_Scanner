const fs = require('fs');
let content = fs.readFileSync('src/api/askController.ts', 'utf8');

if (!content.includes('import { authenticateToken }')) {
    content = content.replace('import { Router }', 'import { authenticateToken } from "./authMiddleware";\nimport { Router }');
}

content = content.replace('askRouter.post("/filter", async', 'askRouter.post("/filter", authenticateToken, async');

fs.writeFileSync('src/api/askController.ts', content);
