const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

if (!content.includes('import helmet from "helmet"')) {
    content = content.replace('import express from "express";', 'import express from "express";\nimport helmet from "helmet";');
    
    // Add trusted proxy for rate limiters based on IP
    const helmetSetup = `
  app.set("trust proxy", 1);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
        connectSrc: ["'self'", "https://apis.google.com", "https://*.googleapis.com", "https://*.firebaseio.com"],
        frameAncestors: ["'self'", "https://ai.studio", "https://*.aistudio.google.com", "https://*.google.com"],
      }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: false // Disabled to allow frameAncestors
  }));
  
  // Generic error handler to hide details
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Internal Error:", err.stack);
    res.status(500).json({ error: "An internal server error occurred." });
  });
`;
    content = content.replace('app.use(express.json({ limit: "50mb" }));', `app.use(express.json({ limit: "2mb" }));\n${helmetSetup}`);
}

fs.writeFileSync('server.ts', content);
