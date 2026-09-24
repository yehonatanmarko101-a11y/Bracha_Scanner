const fs = require('fs');

let history = fs.readFileSync('src/pages/HistoryPage.tsx', 'utf8');
history = history.replace(
  'className="p-4 max-w-md mx-auto space-y-6 pt-8"',
  'className={`p-4 max-w-md mx-auto space-y-6 pt-8 ${language === "he" ? "text-right" : "text-left"}`} dir={language === "he" ? "rtl" : "ltr"}'
);
fs.writeFileSync('src/pages/HistoryPage.tsx', history);

let profile = fs.readFileSync('src/pages/ProfilePage.tsx', 'utf8');
profile = profile.replace(
  'className="p-4 max-w-md mx-auto space-y-6 pt-8 pb-12"',
  'className={`p-4 max-w-md mx-auto space-y-6 pt-8 pb-12 ${language === "he" ? "text-right" : "text-left"}`} dir={language === "he" ? "rtl" : "ltr"}'
);
fs.writeFileSync('src/pages/ProfilePage.tsx', profile);

