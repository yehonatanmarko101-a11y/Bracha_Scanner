const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

if (!content.includes('if (import.meta.env.PROD) {')) {
    content = content.replace('createRoot', `if (import.meta.env.PROD) {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
  console.trace = () => {};
}
createRoot`);
}

fs.writeFileSync('src/main.tsx', content);
