const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '<BrowserRouter>',
  '<>\n    <BrowserRouter>'
);

code = code.replace(
  '</BrowserRouter>\n      <InstallNudge />\n  );',
  '</BrowserRouter>\n      <InstallNudge />\n    </>\n  );'
);

fs.writeFileSync('src/App.tsx', code);
