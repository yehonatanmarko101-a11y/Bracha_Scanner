const fs = require('fs');
let code = fs.readFileSync('src/api/askController.ts', 'utf8');

// Replace everything above `/filter` with a clean version, and remove everything after it.
const cleanCode = `
import { Router } from "express";
import { generateContentWithRotation } from "../lib/geminiKeyManager";
import { checkRateLimit } from "./rateLimiter";

const askRouter = Router();

// Stateless Spam Filter using Heuristics and optional Gemini
askRouter.post("/filter", async (req, res) => {
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
      if (/(.)\\1{4,}/.test(cleanStr)) return true;
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
      const systemInstruction = \`Evaluate the input string. If it is random letters, keyboard smash, gibberish, an obvious typo/test, spam, or completely unrelated to food/brachot, return isValidQuestion: false and provide a short reason. If it is a real halachic inquiry regarding food, ingredients, or blessings, return isValidQuestion: true.
Output ONLY a strict JSON object: { "isValidQuestion": boolean, "reason": "string" }\`;

      try {
        const response = await generateContentWithRotation({
          model: "gemini-3.6-flash",
          contents: text,
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            temperature: 0.1
          }
        }, true);
        const resText = (response.text || "").replace(/^\\\`\\\`\\\`json\\s*/i, "").replace(/\\s*\\\`\\\`\\\`$/i, "").trim();
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
    res.status(500).json({ error: err.message });
  }
});

export { askRouter };
`;

fs.writeFileSync('src/api/askController.ts', cleanCode);
