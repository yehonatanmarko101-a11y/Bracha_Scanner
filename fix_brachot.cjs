const fs = require('fs');
const content = fs.readFileSync('src/data/brachotDatabase.ts', 'utf8');
const lines = content.split('\\n');
// Assuming 104 is the `      }`
// 105 to 110 are the bad lines
// wait, line 104 in file is actually index 103...
lines.splice(104, 6);
fs.writeFileSync('src/data/brachotDatabase.ts', lines.join('\\n'));
console.log('Spliced bad lines');
