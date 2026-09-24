const fs = require('fs');
let code = fs.readFileSync('src/components/RavDashboard.tsx', 'utf8');

code = code.replace(
  '        };\n      }));\n    });',
  '        };\n      }));\n    }, (error) => {\n      console.warn("Pool questions listener error:", error);\n    });'
);

code = code.replace(
  '        };\n      }).filter((q: any) => q.status === "claimed"));\n    });',
  '        };\n      }).filter((q: any) => q.status === "claimed"));\n    }, (error) => {\n      console.warn("Claimed questions listener error:", error);\n    });'
);

fs.writeFileSync('src/components/RavDashboard.tsx', code);
