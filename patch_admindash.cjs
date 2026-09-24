const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf8');

code = code.replace(
  '      setDedications(list);\n    });',
  '      setDedications(list);\n    }, (error) => {\n      console.warn("Dedications listener error:", error);\n    });'
);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
