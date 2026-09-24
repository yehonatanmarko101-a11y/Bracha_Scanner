const fs = require('fs');
let askRav = fs.readFileSync('src/pages/AskRavPage.tsx', 'utf8');

// 1. Add Markdown import
if (!askRav.includes('import Markdown from')) {
  askRav = askRav.replace(
    'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";',
    'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\nimport Markdown from "react-markdown";'
  );
}

// 2. Remove other categories
askRav = askRav.replace(
  '<SelectItem value="shabbat">{language === \'he\' ? \'שבת\' : \'Shabbat\'}</SelectItem>',
  ''
);
askRav = askRav.replace(
  '<SelectItem value="other">{language === \'he\' ? \'כללי\' : \'General\'}</SelectItem>',
  ''
);

// 3. Fix answer rendering to use markdown and correct RTL
const oldAnswer = `<p className={\`text-sm p-3 rounded-xl border whitespace-pre-line \${q.status === 'rejected' ? 'bg-destructive/5 border-destructive/10 text-foreground' : 'bg-primary/5 border-primary/10 text-foreground'}\`}>\n                          {q.answer}\n                        </p>`;

const newAnswer = `<div className={\`text-sm p-3 rounded-xl border \${q.status === 'rejected' ? 'bg-destructive/5 border-destructive/10 text-foreground' : 'bg-primary/5 border-primary/10 text-foreground'} \${language === "he" ? "text-right" : "text-left"}\`} dir={language === "he" ? "rtl" : "ltr"}>\n                          <div className="markdown-body">\n                            <Markdown>{q.answer}</Markdown>\n                          </div>\n                        </div>`;

askRav = askRav.replace(oldAnswer, newAnswer);

fs.writeFileSync('src/pages/AskRavPage.tsx', askRav);
