const fs = require('fs');
let rules = fs.readFileSync('firestore.rules', 'utf8');
rules = rules.replace(
  "allow create: if isUserDoc(userId) \n        && incoming().role == 'user'\n        && incoming().get('spamWarningCount', 0) == 0\n        && (!('bannedUntil' in incoming()) || incoming().bannedUntil == null)\n        && (!('isBannedUntil' in incoming()) || incoming().isBannedUntil == null);",
  "allow create: if isUserDoc(userId) && (\n          isSuperAdmin() || (\n            incoming().role == 'user'\n            && incoming().get('spamWarningCount', 0) == 0\n            && (!('bannedUntil' in incoming()) || incoming().bannedUntil == null)\n            && (!('isBannedUntil' in incoming()) || incoming().isBannedUntil == null)\n          )\n        );"
);
fs.writeFileSync('firestore.rules', rules);
