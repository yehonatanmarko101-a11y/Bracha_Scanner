const fs = require('fs');
let code = fs.readFileSync('src/pages/ScanPage.tsx', 'utf8');

code = code.replace(
  'console.log("Scan Single Stage output:", finalParsed);',
  ''
);

fs.writeFileSync('src/pages/ScanPage.tsx', code);
