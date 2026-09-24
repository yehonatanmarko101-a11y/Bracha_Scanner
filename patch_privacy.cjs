const fs = require('fs');
let privacy = fs.readFileSync('src/pages/PrivacyPolicyPage.tsx', 'utf8');

const englishTerms = `
              <h3>Intellectual Property & Terms of Use</h3>
              <p>
                All rights are protected and reserved. The application, its source code, design, features, and functionality are the exclusive property of BrachaScanner and its creators. You may not copy, reproduce, distribute, modify, or create derivative works of this application without explicit written permission. By using the app, you agree to these terms.
              </p>
`;

const hebrewTerms = `
              <h3>זכויות יוצרים ותנאי שימוש</h3>
              <p>
                כל הזכויות שמורות ומוגנות. האפליקציה, קוד המקור, העיצוב, והפונקציונליות הם קניינה הבלעדי של BrachaScanner ויוצריה. אין להעתיק, לשכפל, להפיץ, לשנות, או ליצור יצירות נגזרות של אפליקציה זו ללא אישור מפורש בכתב. בעצם השימוש באפליקציה, אתה מסכים לתנאים אלו.
              </p>
`;

privacy = privacy.replace(
  '<h3>איסוף נתונים</h3>',
  hebrewTerms + '\n              <h3>איסוף נתונים</h3>'
);

privacy = privacy.replace(
  '<h3>Data Collection</h3>',
  englishTerms + '\n              <h3>Data Collection</h3>'
);

fs.writeFileSync('src/pages/PrivacyPolicyPage.tsx', privacy);
