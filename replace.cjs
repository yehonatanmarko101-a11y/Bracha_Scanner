const fs = require('fs');
const file = 'src/data/brachotDatabase.ts';
let content = fs.readFileSync(file, 'utf8');

// Replace standard dashes
content = content.replace(/י-הו-ה/g, 'י-הוה');
// Replace with niqqud and special dashes
content = content.replace(/יְ‑הֹוָ‑ה/g, 'יְ-הֹוָה');

fs.writeFileSync(file, content);
console.log('Replaced');
