const fs = require('fs');

// ScanPage
let scanPage = fs.readFileSync('src/pages/ScanPage.tsx', 'utf8');

if (!scanPage.includes('import { getDeviceId }')) {
  scanPage = scanPage.replace(
    'import { Scan, Sparkles, Upload, Maximize2, History as HistoryIcon, User as UserIcon } from "lucide-react";',
    'import { Scan, Sparkles, Upload, Maximize2, History as HistoryIcon, User as UserIcon } from "lucide-react";\nimport { getDeviceId } from "../lib/deviceId";'
  );
}

scanPage = scanPage.replace(
  'userId: user?.uid,\n        }),',
  'userId: user?.uid,\n          deviceId: getDeviceId(),\n        }),'
);

fs.writeFileSync('src/pages/ScanPage.tsx', scanPage);

// AskRavPage
let askPage = fs.readFileSync('src/pages/AskRavPage.tsx', 'utf8');

if (!askPage.includes('import { getDeviceId }')) {
  askPage = askPage.replace(
    'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";',
    'import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";\nimport { getDeviceId } from "../lib/deviceId";'
  );
}

askPage = askPage.replace(
  'body: JSON.stringify({ text: questionText, userId: user.uid })',
  'body: JSON.stringify({ text: questionText, userId: user.uid, deviceId: getDeviceId() })'
);

askPage = askPage.replace(
  /Your account or IP has been banned/g,
  'Your account or device has been banned'
);

fs.writeFileSync('src/pages/AskRavPage.tsx', askPage);
