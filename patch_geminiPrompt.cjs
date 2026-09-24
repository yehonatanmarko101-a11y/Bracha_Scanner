const fs = require('fs');
let content = fs.readFileSync('src/components/geminiPrompt.ts', 'utf8');

const additionalRules = `
9. If the image or ingredients are completely insufficient to identify the food, you must abstain by using the Conditional Schema to ask a material follow-up question instead of guessing.
10. Do not generate or include specific citations, page numbers, or references to sources in your output.
11. Never present yourself as a real rabbi or human authority. Use wording like "AI-generated suggestion" where appropriate.
`;

content = content.replace('8. Always incorporate the user\'s additional details, notes, minhag profile, and meal context when provided.', 
'8. Always incorporate the user\'s additional details, notes, minhag profile, and meal context when provided.\n' + additionalRules);

fs.writeFileSync('src/components/geminiPrompt.ts', content);
