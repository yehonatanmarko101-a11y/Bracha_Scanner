const fs = require('fs');
let code = fs.readFileSync('src/lib/firebase.ts', 'utf8');

code = code.replace(
  'console.error("Database Safety Error: ", JSON.stringify(errInfo));',
  'console.error("Database Safety Error: ", errInfo.error);'
);

code = code.replace(
  'throw new Error(JSON.stringify(errInfo));',
  'throw new Error(errInfo.error);'
);

fs.writeFileSync('src/lib/firebase.ts', code);
