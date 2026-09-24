const fs = require('fs');
let code = fs.readFileSync('src/api/askController.ts', 'utf8');

code = code.replace(
  '        }, true);',
  '        });'
);

fs.writeFileSync('src/api/askController.ts', code);
