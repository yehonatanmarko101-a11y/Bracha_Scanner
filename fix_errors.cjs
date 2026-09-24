const fs = require('fs');

// Fix AskRavPage.tsx
let askRav = fs.readFileSync('src/pages/AskRavPage.tsx', 'utf8');
askRav = askRav.replace(
  'className="p-4 max-w-md mx-auto pt-8 pb-12 relative" dir={language === "he" ? "rtl" : "ltr"} className={language === "he" ? "text-right p-4 max-w-md mx-auto pt-8 pb-12 relative" : "p-4 max-w-md mx-auto pt-8 pb-12 relative"}',
  'dir={language === "he" ? "rtl" : "ltr"} className={language === "he" ? "text-right p-4 max-w-md mx-auto pt-8 pb-12 relative" : "p-4 max-w-md mx-auto pt-8 pb-12 relative"}'
);
fs.writeFileSync('src/pages/AskRavPage.tsx', askRav);

// Fix InstallNudge.tsx
let installNudge = fs.readFileSync('src/components/InstallNudge.tsx', 'utf8');
installNudge = installNudge.replace(
  'import { Button } from \'./ui/button\';',
  'import { Button } from \'@/components/ui/button\';'
);
fs.writeFileSync('src/components/InstallNudge.tsx', installNudge);

