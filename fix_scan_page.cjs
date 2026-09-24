const fs = require('fs');
let content = fs.readFileSync('src/pages/ScanPage.tsx', 'utf-8');

content = content.replace(
  /steps: \[\],(\s*)after_blessings: \[\],/g,
  'steps: finalParsed.steps || [],$1after_blessings: finalParsed.after_blessings || [],'
);

fs.writeFileSync('src/pages/ScanPage.tsx', content);
