const fs = require('fs');
let scanPage = fs.readFileSync('src/pages/ScanPage.tsx', 'utf8');

scanPage = scanPage.replace(
  'language,\n        }),',
  'language,\n          userId: user?.uid,\n        }),'
);

fs.writeFileSync('src/pages/ScanPage.tsx', scanPage);
