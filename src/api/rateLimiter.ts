export async function checkRateLimit(req: any, type: "scan" | "question", userId: string | undefined, deviceId: string | undefined) {
  const today = new Date().toISOString().split('T')[0];
  
  if (!deviceId) {
    throw new Error("MISSING_DEVICE_ID");
  }

  const verifiedUid = req.user?.uid;
  if (!verifiedUid && type === "question") {
      throw new Error("UNAUTHORIZED_USER");
  }

  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || "unknown_ip";

  // IN-MEMORY RATE LIMITING FOR AI STUDIO PREVIEW
  // The Admin SDK cannot write to Firestore in this sandbox environment without a service account key.
  const globalKey = `global_${today}`;
  const ipKey = `ip_${ip}_${today}_${type}`;
  const userKey = verifiedUid ? `user_${verifiedUid}_${today}_${type}` : null;

  globalRateLimits.set(globalKey, (globalRateLimits.get(globalKey) || 0) + 1);
  globalRateLimits.set(ipKey, (globalRateLimits.get(ipKey) || 0) + 1);
  if (userKey) {
    globalRateLimits.set(userKey, (globalRateLimits.get(userKey) || 0) + 1);
  }

  const globalTotal = globalRateLimits.get(globalKey) || 0;
  const newIpUsage = globalRateLimits.get(ipKey) || 0;
  const newUserUsage = userKey ? (globalRateLimits.get(userKey) || 0) : 0;

  if (globalTotal > 5000) throw new Error("GLOBAL_BUDGET_EXCEEDED");

  if (type === "scan") {
    if (newIpUsage >= 40) throw new Error("FRAUD_DETECTED");
    if (newIpUsage >= 20) throw new Error("DEVICE_SCAN_LIMIT");
    if (newUserUsage >= 10) throw new Error("USER_SCAN_LIMIT");
  }

  if (type === "question") {
    if (newIpUsage >= 30) throw new Error("FRAUD_DETECTED");
    if (newIpUsage >= 15) throw new Error("DEVICE_QUESTION_LIMIT");
    if (newUserUsage >= 5) throw new Error("USER_QUESTION_LIMIT");
  }
}

// In-memory store
const globalRateLimits = new Map<string, number>();

// Clean up memory every hour to prevent leaks
setInterval(() => {
  const today = new Date().toISOString().split('T')[0];
  for (const key of globalRateLimits.keys()) {
    if (!key.includes(today)) {
      globalRateLimits.delete(key);
    }
  }
}, 60 * 60 * 1000);
