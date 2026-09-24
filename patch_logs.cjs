const fs = require('fs');

// Remove from index.html
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/console\.log\('SW registered: ', registration\);/g, '');
index = index.replace(/console\.log\('SW registration failed: ', registrationError\);/g, '');
fs.writeFileSync('index.html', index);

// Remove from firebaseAuth.ts
let firebaseAuth = fs.readFileSync('src/lib/firebaseAuth.ts', 'utf8');
firebaseAuth = firebaseAuth.replace(/console\.log\("System config loaded::", \{[\s\S]*?\}\);/g, '');
fs.writeFileSync('src/lib/firebaseAuth.ts', firebaseAuth);

