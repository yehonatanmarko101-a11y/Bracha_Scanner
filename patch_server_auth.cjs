const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('import { authenticateToken }')) {
    content = content.replace('import express', 'import { authenticateToken } from "./src/api/authMiddleware";\nimport express');
}

// Add authenticateToken to routes
content = content.replace('app.post("/api/translate-lookup", async', 'app.post("/api/translate-lookup", authenticateToken, async');
content = content.replace('app.post("/api/ai/draft", async', 'app.post("/api/ai/draft", authenticateToken, async');
content = content.replace('app.post("/api/ai/extract-ingredients", async', 'app.post("/api/ai/extract-ingredients", authenticateToken, async');
content = content.replace('app.post("/api/ai/resolve-ingredients", async', 'app.post("/api/ai/resolve-ingredients", authenticateToken, async');
content = content.replace('app.post("/api/ai/scan", async', 'app.post("/api/ai/scan", authenticateToken, async');

fs.writeFileSync('server.ts', content);
