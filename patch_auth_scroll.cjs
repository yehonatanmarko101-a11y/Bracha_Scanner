const fs = require('fs');
let authPage = fs.readFileSync('src/pages/AuthPage.tsx', 'utf8');

authPage = authPage.replace(
  '<div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex flex-col justify-between p-4 max-w-md mx-auto relative select-none">',
  '<div className="min-h-[100dvh] overflow-y-auto bg-gradient-to-br from-background via-muted/30 to-background flex flex-col p-4 max-w-md mx-auto relative select-none">'
);

authPage = authPage.replace(
  '<div className="my-auto py-8">',
  '<div className="flex-1 flex flex-col justify-center py-8">'
);

fs.writeFileSync('src/pages/AuthPage.tsx', authPage);
