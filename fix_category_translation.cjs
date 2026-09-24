const fs = require('fs');
let askRav = fs.readFileSync('src/pages/AskRavPage.tsx', 'utf8');

const oldCategorySpan = '<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{q.scannedProductInfo?.category || "General"}</span>';

const newCategorySpan = '<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{language === "he" ? (q.scannedProductInfo?.category === "brachot" ? "ברכות" : q.scannedProductInfo?.category === "kashrut" ? "כשרות" : (q.scannedProductInfo?.category === "shabbat" ? "שבת" : (q.scannedProductInfo?.category === "other" ? "כללי" : q.scannedProductInfo?.category || "כללי"))) : (q.scannedProductInfo?.category || "General")}</span>';

askRav = askRav.replace(oldCategorySpan, newCategorySpan);
fs.writeFileSync('src/pages/AskRavPage.tsx', askRav);
