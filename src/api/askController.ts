import { authenticateToken } from "./authMiddleware";
import { Router } from "express";
import { generateContentWithRotation } from "../lib/geminiKeyManager";
import { checkRateLimit } from "./rateLimiter";
import { db } from "../lib/firebaseAdmin";
import admin from "firebase-admin";

const askRouter = Router();

async function requireAdmin(req: any, res: any, next: any) {
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || userDoc.data()?.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to verify admin status" });
  }
}

async function requireRav(req: any, res: any, next: any) {
  const { userId } = req.body;
  if (!userId) return res.status(401).json({ error: "Unauthorized" });
  try {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists || (userDoc.data()?.role !== "rav" && userDoc.data()?.role !== "admin")) {
      return res.status(403).json({ error: "Forbidden: Rav only" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Failed to verify rav status" });
  }
}

// Admin: Promote user to Rav
askRouter.post("/admin/promote", requireAdmin, async (req, res) => {
  try {
    const { targetEmail } = req.body;
    const usersSnapshot = await db.collection("users").where("email", "==", targetEmail).get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({ role: "rav" });
    res.json({ success: true, message: "User promoted to Rav" });
  } catch (err: any) {
    console.error(err); res.status(500).json({ error: "An internal server error occurred." });
  }
});

askRouter.post("/admin/promoteAdmin", requireAdmin, async (req, res) => {
  try {
    const { userId, targetEmail } = req.body;
    
    // Only yehonatanmarko100@gmail.com can promote to Admin
    const promoterDoc = await db.collection("users").doc(userId).get();
    if (promoterDoc.data()?.email !== "yehonatanmarko100@gmail.com") {
      return res.status(403).json({ error: "Only the super admin can promote other admins." });
    }

    const usersSnapshot = await db.collection("users").where("email", "==", targetEmail).get();
    if (usersSnapshot.empty) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userDoc = usersSnapshot.docs[0];
    await userDoc.ref.update({ role: "admin" });
    res.json({ success: true, message: "User promoted to Admin" });
  } catch (err: any) {
    console.error(err); res.status(500).json({ error: "An internal server error occurred." });
  }
});

// Admin: Lift ban
askRouter.post("/admin/unban", requireAdmin, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    await db.collection("users").doc(targetUserId).update({
      isBannedUntil: null,
      spamWarningCount: 0
    });
    res.json({ success: true });
  } catch (err: any) {
    console.error(err); res.status(500).json({ error: "An internal server error occurred." });
  }
});

// Stateless Spam Filter using Heuristics and optional Gemini
askRouter.post("/filter", authenticateToken, async (req, res) => {
  try {
    const { text, userId, deviceId } = req.body;
    if (!text) return res.status(400).json({ error: "Missing text" });

    try {
      await checkRateLimit(req, "question", userId, deviceId);
    } catch (err: any) {
      if (err.message === "BANNED_DEVICE" || err.message === "BANNED_USER" || err.message === "FRAUD_DETECTED") {
        return res.status(403).json({ error: "Your account or device has been banned due to suspicious activity." });
      }
      if (err.message === "USER_QUESTION_LIMIT") {
        return res.status(429).json({ error: "You have reached your daily limit of 5 questions per account." });
      }
      if (err.message === "DEVICE_QUESTION_LIMIT") {
        return res.status(429).json({ error: "Too many questions from this device today." });
      }
      throw err;
    }

    let isValidQuestion = true;
    let reason = "Valid question";
    let rejectedBy = "none";

    // Local heuristic check for gibberish
    const isGibberish = (str: string) => {
      const cleanStr = str.trim().toLowerCase();
      if (cleanStr.length < 4 && !cleanStr.includes('?')) return true;
      if (/(.)\1{4,}/.test(cleanStr)) return true;
      if (cleanStr.length > 15 && !cleanStr.includes(' ')) return true;
      if (/[bcdfghjklmnpqrstvwxz]{5,}/.test(cleanStr)) return true;
      if (cleanStr.length >= 6 && !cleanStr.includes(' ') && !/[aeiouy]/.test(cleanStr)) return true;
      if (/asdf|qwer|zxcv|hjkl|.?.?1234.?.?/.test(cleanStr)) return true;
      return false;
    };

    if (isGibberish(text) || text.trim().length < 5) {
      return res.json({ success: true, isValidQuestion: false, reason: "Question looks like gibberish or is too short.", rejectedBy: "code" });
    }

    // Only use Gemini if an API key is available
    if (process.env.GEMINI_API_KEY || true) {
      const systemInstruction = `Evaluate the input string. If it is random letters, keyboard smash, gibberish, an obvious typo/test, spam, or completely unrelated to food/brachot, return isValidQuestion: false and provide a short reason. If it is a real halachic inquiry regarding food, ingredients, or blessings, return isValidQuestion: true.
Output ONLY a strict JSON object: { "isValidQuestion": boolean, "reason": "string" }`;

      try {
        const response = await generateContentWithRotation({
          model: "gemini-3.6-flash",
          contents: text,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0,
            seed: 42
          }
        });
        const resText = (response.text || "").replace(/^\`\`\`json\s*/i, "").replace(/\s*\`\`\`$/i, "").trim();
        const parsed = JSON.parse(resText);
        isValidQuestion = parsed.isValidQuestion !== false;
        reason = parsed.reason || "";
        if (!isValidQuestion) {
          rejectedBy = "ai";
        }
      } catch (e) {
        // Fallback
      }
    }
    res.json({ success: true, isValidQuestion, reason, rejectedBy });
  } catch (err: any) {
    console.error(err); res.status(500).json({ error: "An internal server error occurred." });
  }
});

// Rav: Claim Question (Atomic)
askRouter.post("/rav/claim", requireRav, async (req, res) => {
  try {
    const { userId: ravId, questionId } = req.body;
    
    await db.runTransaction(async (t) => {
      const questionRef = db.collection("ask_rav").doc(questionId);
      const doc = await t.get(questionRef);
      if (!doc.exists) throw new Error("Question not found");
      
      const data = doc.data();
      if (data?.status !== "pool") {
        throw new Error("Question is no longer in the pool");
      }

      t.update(questionRef, {
        status: "claimed",
        ravId,
        claimedAt: admin.firestore.Timestamp.now()
      });
    });

    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Rav: Submit Answer
askRouter.post("/rav/submitAnswer", requireRav, async (req, res) => {
  try {
    const { userId: ravId, questionId, text } = req.body;
    
    const answerRef = db.collection("answers").doc();
    await answerRef.set({
      answerId: answerRef.id,
      questionId,
      ravId,
      text,
      createdAt: admin.firestore.Timestamp.now()
    });

    // Also get the rav's email for pre-existing compatibility fields
    const ravDoc = await db.collection("users").doc(ravId).get();
    const ravEmail = ravDoc.exists ? (ravDoc.data()?.email || "") : "";

    await db.collection("ask_rav").doc(questionId).update({
      status: "answered",
      answer: text,
      answeredAt: admin.firestore.Timestamp.now(),
      date_answered: admin.firestore.Timestamp.now(),
      ravId,
      rav_answered: ravEmail.toLowerCase()
    });

    res.json({ success: true, answerId: answerRef.id });
  } catch (err: any) {
    console.error(err); res.status(500).json({ error: "An internal server error occurred." });
  }
});

export { askRouter };
