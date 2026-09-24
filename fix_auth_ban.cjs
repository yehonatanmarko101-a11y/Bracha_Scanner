const fs = require('fs');
let code = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

const banCheck = `
            if (data.bannedUntil) {
              if (data.bannedUntil === -1 || data.bannedUntil > Date.now()) {
                alert("This account has been banned by an administrator.");
                auth.signOut();
                return;
              }
            }
`;

code = code.replace(
  'if (docSnap.exists()) {',
  'if (docSnap.exists()) {\n            const data = docSnap.data();' + banCheck
);

code = code.replace(
  'const data = docSnap.data();\n            const data = docSnap.data();',
  'const data = docSnap.data();'
);

// We should also put the ban logic inside the onSnapshot listener so if they get banned while active, they get kicked.
const snapshotBanCheck = `
              if (data.bannedUntil) {
                if (data.bannedUntil === -1 || data.bannedUntil > Date.now()) {
                  alert("This account has been banned by an administrator.");
                  auth.signOut();
                  return;
                }
              }
`;

code = code.replace(
  /if \(data\) \{\s*if \(data\.role\) \{/g,
  'if (data) {' + snapshotBanCheck + '              if (data.role) {'
);

fs.writeFileSync('src/contexts/AuthContext.tsx', code);
