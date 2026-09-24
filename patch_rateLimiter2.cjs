const fs = require('fs');
let content = fs.readFileSync('src/api/rateLimiter.ts', 'utf8');

const replacement = `
    const newIpScans = ipData.scans + (type === "scan" ? 1 : 0);
    const newIpQuestions = ipData.questions + (type === "question" ? 1 : 0);
    const newUserScans = userData.scans + (type === "scan" ? 1 : 0);
    const newUserQuestions = userData.questions + (type === "question" ? 1 : 0);
    
    // Apply increments first
    t.set(ipDocRef, { [type + 's']: admin.firestore.FieldValue.increment(1) }, { merge: true });
    if (userDocRef) {
      t.set(userDocRef, { [type + 's']: admin.firestore.FieldValue.increment(1) }, { merge: true });
    }
    t.set(globalDocRef, { total: admin.firestore.FieldValue.increment(1) }, { merge: true });

    return { globalTotal: globalData.total, newIpScans, newIpQuestions, newUserScans, newUserQuestions };
  });

  if (result.globalTotal > 5000) throw new Error("GLOBAL_BUDGET_EXCEEDED");
  if (type === "scan") {
    if (result.newIpScans >= 40) throw new Error("FRAUD_DETECTED");
    if (result.newIpScans >= 20) throw new Error("DEVICE_SCAN_LIMIT");
    if (result.newUserScans >= 10) throw new Error("USER_SCAN_LIMIT");
  }
  if (type === "question") {
    if (result.newIpQuestions >= 30) throw new Error("FRAUD_DETECTED");
    if (result.newIpQuestions >= 15) throw new Error("DEVICE_QUESTION_LIMIT");
    if (result.newUserQuestions >= 5) throw new Error("USER_QUESTION_LIMIT");
  }
}
`;

content = content.replace(/    const newIpScans(.*)USER_QUESTION_LIMIT"\);\n    \}\n  \}\);\n\}/s, replacement);
content = content.replace('await db.runTransaction(async (t) => {', 'const result = await db.runTransaction(async (t) => {');

fs.writeFileSync('src/api/rateLimiter.ts', content);
