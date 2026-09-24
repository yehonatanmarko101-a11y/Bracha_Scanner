const fs = require('fs');
let code = fs.readFileSync('src/pages/AskRavPage.tsx', 'utf8');

code = code.replace(
  '<div className="p-4 max-w-md mx-auto pt-8 pb-12 relative">',
  '<div className="p-4 max-w-md mx-auto pt-8 pb-12 relative" dir={language === "he" ? "rtl" : "ltr"} className={language === "he" ? "text-right p-4 max-w-md mx-auto pt-8 pb-12 relative" : "p-4 max-w-md mx-auto pt-8 pb-12 relative"}>'
);

code = code.replace(
  '<div className="absolute top-4 right-4">',
  '<div className={`absolute top-4 ${language === "he" ? "left-4" : "right-4"}`}>'
);

const disclaimer = `
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg text-start">
          <p className="text-xs text-blue-800 dark:text-blue-300 font-medium flex items-start gap-2">
            <span className="mt-0.5">ℹ️</span>
            <span>
              {language === 'he' 
                ? 'שימו לב: ניתן לשאול רק שאלות הקשורות לברכות וכשרות המאכלים.'
                : 'Please note: You can only ask questions related to food blessings (Brachot) and Kashrut.'}
            </span>
          </p>
        </div>
      </div>`;

code = code.replace(
  '<p className="text-muted-foreground text-sm">{t(\'ask_sub\')}</p>\n      </div>',
  '<p className="text-muted-foreground text-sm">{t(\'ask_sub\')}</p>' + disclaimer
);

// also fix the text area character count which might be on the right instead of left in RTL
code = code.replace(
  '<div className="text-xs text-right text-muted-foreground font-mono">',
  '<div className={`text-xs text-muted-foreground font-mono ${language === "he" ? "text-left" : "text-right"}`}>'
);

fs.writeFileSync('src/pages/AskRavPage.tsx', code);
