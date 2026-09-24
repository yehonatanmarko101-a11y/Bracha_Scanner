const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(/, stack: e\.stack/g, '');

fs.writeFileSync('server.ts', code);
