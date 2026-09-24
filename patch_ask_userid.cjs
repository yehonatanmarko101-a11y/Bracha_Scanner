const fs = require('fs');
let askPage = fs.readFileSync('src/pages/AskRavPage.tsx', 'utf8');

askPage = askPage.replace(
  'body: JSON.stringify({ text: questionText })',
  'body: JSON.stringify({ text: questionText, userId: user.uid })'
);

const filterCheck = `
      if (filterRes) {
        const filterData = await filterRes.json();
        if (filterRes.status === 429 || filterRes.status === 403) {
           alert(filterData.error || "Rate limit exceeded.");
           setIsSubmitting(false);
           return;
        }
        
        if (filterData.success && !filterData.isValidQuestion) {
`;

askPage = askPage.replace(
  /if \(filterRes && filterRes\.ok\) \{\s*const filterData = await filterRes\.json\(\);\s*if \(filterData\.success && !filterData\.isValidQuestion\) \{/g,
  filterCheck
);

fs.writeFileSync('src/pages/AskRavPage.tsx', askPage);
