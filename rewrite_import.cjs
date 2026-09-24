const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

// Replace the require with an import at the top
content = content.replace(
  'const { SYSTEM_PROMPT, buildUserMessage } = require("./src/components/geminiPrompt");',
  ''
);

if (!content.includes('import { SYSTEM_PROMPT, buildUserMessage }')) {
  content = content.replace(
    'import { findFood, orderMap, formatBlessingLink } from "./foodDatabase";',
    'import { findFood, orderMap, formatBlessingLink } from "./foodDatabase";\nimport { SYSTEM_PROMPT, buildUserMessage } from "./src/components/geminiPrompt";'
  );
}

fs.writeFileSync('server.ts', content);
