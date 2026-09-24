const fs = require('fs');

function addDeviceIdImport(filePath) {
  let code = fs.readFileSync(filePath, 'utf8');
  if (!code.includes('import { getDeviceId }')) {
    // find the last import and add it after
    const lastImportIndex = code.lastIndexOf('import ');
    const endOfLastImport = code.indexOf('\n', lastImportIndex);
    code = code.slice(0, endOfLastImport) + '\nimport { getDeviceId } from "../lib/deviceId";' + code.slice(endOfLastImport);
    fs.writeFileSync(filePath, code);
  }
}

addDeviceIdImport('src/pages/ScanPage.tsx');
addDeviceIdImport('src/pages/AskRavPage.tsx');
