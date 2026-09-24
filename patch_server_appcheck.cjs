const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('import { verifyAppCheck }')) {
    content = content.replace('import { authenticateToken }', 'import { authenticateToken } from "./src/api/authMiddleware";\nimport { verifyAppCheck } from "./src/api/appCheckMiddleware";');
}

// Add verifyAppCheck to routes
content = content.replace('app.post("/api/translate-lookup", authenticateToken', 'app.post("/api/translate-lookup", authenticateToken, verifyAppCheck');
content = content.replace('app.post("/api/ai/draft", authenticateToken', 'app.post("/api/ai/draft", authenticateToken, verifyAppCheck');
content = content.replace('app.post("/api/ai/extract-ingredients", authenticateToken', 'app.post("/api/ai/extract-ingredients", authenticateToken, verifyAppCheck');
content = content.replace('app.post("/api/ai/resolve-ingredients", authenticateToken', 'app.post("/api/ai/resolve-ingredients", authenticateToken, verifyAppCheck');
content = content.replace('app.post("/api/ai/scan", authenticateToken', 'app.post("/api/ai/scan", authenticateToken, verifyAppCheck');

fs.writeFileSync('server.ts', content);
