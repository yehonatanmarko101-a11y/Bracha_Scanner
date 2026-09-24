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

    // Global circuit breaker
    if (globalData && globalData.total > 5000) {
       throw new Error("GLOBAL_BUDGET_EXCEEDED");
    }

    if (type === "scan") {
      if (newIpScans >= 40) throw new Error("FRAUD_DETECTED");
      if (newIpScans >= 20) throw new Error("DEVICE_SCAN_LIMIT");
      if (newUserScans >= 10) throw new Error("USER_SCAN_LIMIT");
    }
    if (type === "question") {
      if (newIpQuestions >= 30) throw new Error("FRAUD_DETECTED");
      if (newIpQuestions >= 15) throw new Error("DEVICE_QUESTION_LIMIT");
      if (newUserQuestions >= 5) throw new Error("USER_QUESTION_LIMIT");
    }
`;

content = content.replace(/    \/\/ Global circuit breaker(.*)    \/\/ Apply increments(.*)    \}\n    t.set\(globalDocRef, \{ total: admin.firestore.FieldValue.increment\(1\) \}, \{ merge: true \}\);\n/s, replacement);

fs.writeFileSync('src/api/rateLimiter.ts', content);
