const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /Your account or IP has been banned due to suspicious activity\./g,
  'Your account or device has been banned due to suspicious activity.'
);

fs.writeFileSync('server.ts', code);
