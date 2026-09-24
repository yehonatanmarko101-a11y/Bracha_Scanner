const fs = require('fs');
let content = fs.readFileSync('src/main.tsx', 'utf8');

content = content.replace('import {if (import.meta.env.PROD) {\n  console.log = () => {};\n  console.info = () => {};\n  console.debug = () => {};\n  console.trace = () => {};\n}\ncreateRoot}from \'react-dom/client\';', 'import {createRoot} from \'react-dom/client\';\n\nif (import.meta.env.PROD) {\n  console.log = () => {};\n  console.info = () => {};\n  console.debug = () => {};\n  console.trace = () => {};\n}\n');

fs.writeFileSync('src/main.tsx', content);
