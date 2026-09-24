import "dotenv/config";
import { authenticateToken } from "./src/api/authMiddleware";
import { verifyAppCheck } from "./src/api/appCheckMiddleware";
import express from "express";
import helmet from "helmet";
import sharp from "sharp";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { findGroundingMatch } from "./src/lib/fuzzyMatch";
import { askRouter } from "./src/api/askController";

import { generateContentWithRotation } from "./src/lib/geminiKeyManager";
import { checkRateLimit } from "./src/api/rateLimiter";

import { findFood, orderMap, formatBlessingLink } from "./foodDatabase";
import { SYSTEM_PROMPT, buildUserMessage } from "./src/components/geminiPrompt";


async function processImageSafe(base64Str: string): Promise<string> {
    const buffer = Buffer.from(base64Str, 'base64');
    // Reject decompression bombs / too large files (> 5MB handled by body parser)
    const processedBuffer = await sharp(buffer)
        .resize({ width: 1024, height: 1024, fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();
    return processedBuffer.toString('base64');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support large base64 image body payloads
  app.use(express.json({ limit: "5mb" }));

  app.set("trust proxy", 1);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com"],
        connectSrc: ["'self'", "https://apis.google.com", "https://*.googleapis.com", "https://*.firebaseio.com"],
        frameAncestors: ["'self'", "https://ai.studio", "https://*.aistudio.google.com", "https://*.google.com"],
      }
    },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
    frameguard: false // Disabled to allow frameAncestors
  }));
  
  // Generic error handler to hide details
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Internal Error:", err.stack);
    res.status(500).json({ error: "An internal server error occurred." });
  });

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err && err.status === 400 && 'body' in err) {
      return res.status(400).json({ error: "Invalid JSON payload" });
    }
    if (err.type === "entity.too.large") {
      return res.status(413).json({ error: "Payload too large. Please use a smaller image." });
    }
    next(err);
  });

  app.use("/api/ask", askRouter);

  // Initialize the Gemini SDK client securely on the server
  if (!process.env.GEMINI_API_KEY) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set!");
  }
  const apiKey = process.env.GEMINI_API_KEY || "";

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  // Hoisted helper functions for translation and grammar correction
  const STANDARD_BLESSINGS_HE: Record<string, string> = {
    shehakol: "שֶׁהַכֹּל",
    mezonot: "מְזוֹנוֹת",
    haetz: "הָעֵץ",
    haadama: "הָאֲדָמָה",
    hagefen: "הַגָּפֶן",
    hamotzi: "הַמּוֹצִיא",
    "al-netilat-yadayim": "עַל נְטִילַת יָדַיִם",
    "netilat-yadayim": "עַל נְטִילַת יָדַיִם",
    "al-hamichya": "עַל הַמִּחְיָה",
    "al hamichya": "עַל הַמִּחְיָה",
    "al-haetz": "עַל הָעֵץ",
    "al haetz": "עַל הָעֵץ",
    "al-hagefen": "עַל הַגֶּפֶן",
    "al hagefen": "עַל הַגֶּפֶן",
    "borei-nefashot": "בּוֹרֵא נְפָשׁוֹת",
    "borei nefashot": "בּוֹרֵא נְפָשׁוֹת",
    "birkat-hamazon": "בִּרְכַּת הַמָּזוֹן",
    "birkat hamazon": "בִּרְכַּת הַמָּזוֹן",
  };

  async function translateText(
    text: string,
    targetLanguage: string,
  ): Promise<string> {
    if (!text || typeof text !== "string" || !targetLanguage || targetLanguage === "en") return text || "";
    try {
      const links: { placeholder: string; label: string; id: string }[] = [];
      const rx = /\[([^\]]+)\]\(#bracha-([a-z-]+)\)/g;
      let i = 0;
      const tempText = text.replace(rx, (_match, label, id) => {
        const placeholder = `[[B_${i}]]`;
        links.push({ placeholder, label, id });
        i++;
        return placeholder;
      });

      let translated = "";

      // 1. Try Google Translate Chrome Extension endpoint
      try {
        const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=auto&tl=${targetLanguage}&q=${encodeURIComponent(tempText)}`;
        const res = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data[0]) {
            translated = Array.isArray(data[0]) ? data[0][0] : String(data[0]);
          }
        }
      } catch (e) {
        // Continue to fallback
      }

      // 2. Try Google Translate 'at' endpoint
      if (!translated) {
        try {
          const url = `https://translate.googleapis.com/translate_a/single?client=at&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(tempText)}`;
          const res = await fetch(url, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data[0]) {
              translated = data[0]
                .map((item: any) => (item && item[0] ? item[0] : ""))
                .join("");
            }
          }
        } catch (e) {
          // Continue to fallback
        }
      }

      if (!translated) return text;

      // Restore Markdown links
      links.forEach((link, idx) => {
        let labelToUse = link.label;
        if (targetLanguage === "he") {
          const key = link.id.toLowerCase();
          labelToUse = STANDARD_BLESSINGS_HE[key] || link.label;
        }
        const placeholderRx = new RegExp(`\\[\\[?\\s*B_${idx}\\s*\\]?\\]`, "gi");
        translated = translated.replace(
          placeholderRx,
          `[${labelToUse}](#bracha-${link.id})`,
        );
      });

      return translated;
    } catch (error) {
      console.error("Translation error:", error);
      return text || "";
    }
  }

  async function translateList(
    items: string[],
    targetLanguage: string,
  ): Promise<string[]> {
    if (!items || !Array.isArray(items) || items.length === 0 || !targetLanguage || targetLanguage === "en") return items || [];
    const validItems = items.filter((x) => x != null && typeof x === "string");
    return Promise.all(validItems.map((item) => translateText(item, targetLanguage)));
  }

  function splitIntoSeparateSteps(raw: any): string[] {
    if (!raw) return [];
    const rawList: string[] = Array.isArray(raw)
      ? raw.map((x) => (typeof x === "string" ? x : typeof x?.text === "string" ? x.text : "")).filter(Boolean)
      : [typeof raw === "string" ? raw : ""];
    const result: string[] = [];

    for (const item of rawList) {
      if (!item || typeof item !== "string") continue;
      const parts = item
        .split(/(?:\r?\n\s*)+(?=(?:\d+[\.\)]|\-|\*|\bStep\s*\d+:?)\s+)/i)
        .flatMap((p: string) => p.split(/\r?\n\r?\n+/))
        .map((p: string) => p.trim())
        .filter(Boolean);

      for (let part of parts) {
        part = part.replace(/^(?:Step\s*\d+[:\-.]?|\d+[\.\)]|\-|\*)\s+/i, "").trim();
        if (part) {
          result.push(part);
        }
      }
    }

    return result.length > 0
      ? result
      : Array.isArray(raw)
        ? raw.map((x) => (typeof x === "string" ? x : typeof x?.text === "string" ? x.text : "")).filter(Boolean)
        : [typeof raw === "string" ? raw : ""];
  }

  app.post("/api/translate-lookup", authenticateToken, verifyAppCheck, async (req, res) => {
    try {
      const { markdown_text, targetLanguage } = req.body;
      if (targetLanguage !== "he" || !markdown_text) {
        return res.json({ markdown_result: markdown_text });
      }

      const translated = await translateText(markdown_text, "he");
      
      res.json({
        markdown_result: translated || markdown_text,
      });
    } catch (error) {
      console.error("Translation logic error", error);
      res.status(500).json({ error: "Failed to translate" });
    }
  });

  app.post("/api/ai/draft", authenticateToken, verifyAppCheck, async (req, res) => {
    try {
      const { questionText, photoData } = req.body;
      if (!questionText) return res.status(400).json({ error: "Missing questionText" });
      
      if (base64Data) { base64Data = await processImageSafe(base64Data); }
      const parts: any[] = [];
      if (photoData) {
        // Strip out any data:image/xxx;base64, prefix if present
        let base64Str = photoData.includes(",") ? photoData.split(",")[1] : photoData;
        base64Str = await processImageSafe(base64Str);
        let resolvedMimeType = "image/jpeg";
      base64Data = await processImageSafe(base64Data);
        if (base64Str.startsWith("iVBOR")) resolvedMimeType = "image/png";
        else if (base64Str.startsWith("/9j/")) resolvedMimeType = "image/jpeg";
        else if (base64Str.startsWith("R0lG")) resolvedMimeType = "image/gif";
        else if (base64Str.startsWith("UklG")) resolvedMimeType = "image/webp";

        parts.push({
          inlineData: {
            data: base64Str,
            mimeType: resolvedMimeType
          }
        });
      }
      
      parts.push({
        text: `Help writing a halachic answer for the following question: "${questionText}". Draft it professionally as an Orthodox rabbi answering a query. Answer concisely, cite sources if obvious, and keep it under 3 paragraphs.`
      });

      const response = await generateContentWithRotation({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts
          }
        ],
        config: {
          temperature: 0,
          seed: 42,
        }
      });
      
      const draftedText = response.text;
      res.json({ draftAnswer: "[AI-Generated Draft - Please Review]\n\n" + draftedText });
    } catch (error: any) {
      console.error("/api/ai/draft error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI draft" });
    }
  });

  app.post("/api/ai/extract-ingredients", authenticateToken, verifyAppCheck, async (req, res) => {
    try {
      const { base64Data } = req.body;
      let resolvedMimeType = "image/jpeg";
      resolvedMimeType = "image/jpeg";

      const response = await generateContentWithRotation({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType: resolvedMimeType } },
              { text: "Analyze this image and list all the raw ingredients present in this food/meal. Return ONLY a JSON object with an 'ingredients' array of strings." }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              ingredients: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["ingredients"]
          },
          temperature: 0.1
        }
      });
      const parsed = JSON.parse(response.text.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim());
      res.json(parsed);
    } catch (e: any) {
      console.error("/api/ai/extract-ingredients error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/ai/resolve-ingredients", authenticateToken, verifyAppCheck, async (req, res) => {
    try {
      const { ingredients } = req.body;
      const response = await generateContentWithRotation({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: `Determine the correct Halachic Bracha Rishona and Acharona for these ingredients: ${JSON.stringify(ingredients)}. 
Return a JSON array of objects with 'name', 'rishona' (e.g. bracha-mezonot, bracha-shehakol, etc.), 'acharona' (e.g. bracha-al-hamichya, bracha-borei-nefashot, etc.).` }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                rishona: { type: Type.STRING },
                acharona: { type: Type.STRING }
              },
              required: ["name", "rishona", "acharona"]
            }
          },
          temperature: 0.1
        }
      });
      const parsed = JSON.parse(response.text.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "").trim());
      res.json({ resolved: parsed });
    } catch (e: any) {
      console.error("/api/ai/resolve-ingredients error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  
  app.post("/api/ai/scan", authenticateToken, verifyAppCheck, async (req, res) => {
    try {
      const { base64Data, notes, minhag, context, language, userId, deviceId } = req.body;
      
      try {
        await checkRateLimit(req, "scan", userId, deviceId);
      } catch (err: any) {
        if (err.message === "BANNED_DEVICE" || err.message === "BANNED_USER" || err.message === "FRAUD_DETECTED") {
          return res.status(403).json({ error: "Your account or device has been banned due to suspicious activity." });
        }
        if (err.message === "USER_SCAN_LIMIT") {
          return res.status(429).json({ error: "You have reached your daily limit of 10 scans per account." });
        }
        if (err.message === "DEVICE_SCAN_LIMIT") {
          return res.status(429).json({ error: "Too many scans from this device today." });
        }
        throw err;
      }

      if (!base64Data) return res.status(400).json({ error: "No image data" });


      let resolvedMimeType = "image/jpeg";
      if (base64Data.startsWith("iVBOR")) resolvedMimeType = "image/png";
      else if (base64Data.startsWith("/9j/")) resolvedMimeType = "image/jpeg";
      else if (base64Data.startsWith("R0lG")) resolvedMimeType = "image/gif";
      else if (base64Data.startsWith("UklG")) resolvedMimeType = "image/webp";

      const userMessage = buildUserMessage({ minhag, meal_context: context, user_notes: notes });

      const response = await generateContentWithRotation({
        model: "gemini-3.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { data: base64Data, mimeType: resolvedMimeType } },
              { text: userMessage }
            ]
          }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              food_name: { type: Type.STRING },
              primary_bracha: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    is_conditional: { type: Type.BOOLEAN },
                    text: { type: Type.STRING },
                    condition_question: { type: Type.STRING },
                    paths: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          label: { type: Type.STRING },
                          text: { type: Type.STRING },
                          steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                          after_blessings: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["label", "steps", "after_blessings"]
                      }
                    }
                  },
                  required: ["is_conditional"]
                }
              },
              after_blessings: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["food_name", "primary_bracha", "steps", "after_blessings"]
          },
          temperature: 0,
          topK: 1,
          topP: 0.1,
          seed: 42
        }
      });

      const rawText = (response?.text || response?.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();
      if (!rawText) {
        throw new Error("No response text returned from AI service");
      }

      let parsed: any;
      try {
        parsed = JSON.parse(rawText.replace(/^\s*```[a-zA-Z]*\s*/, "").replace(/\s*```\s*$/, "").trim());
      } catch (jsonErr) {
        console.error("Failed to parse JSON response from AI service:", rawText);
        throw new Error("Invalid response format from AI service");
      }

      // Format for the UI
      let parsedResult: any = {
          identified_items: [parsed.food_name],
          primary_bracha: parsed.primary_bracha,
          steps: parsed.steps,
          after_blessings: splitIntoSeparateSteps(parsed.after_blessings || []),
          is_extended: true,
      };

      if (parsed.steps && parsed.steps.length > 0) {
        const conditionalStep = parsed.steps.find((s: any) => s.is_conditional);
        if (conditionalStep && conditionalStep.paths && conditionalStep.paths.length > 0) {
            parsedResult.has_branches = true;
            parsedResult.branch_question = conditionalStep.condition_question || "Please clarify:";
            parsedResult.branches = conditionalStep.paths.map((p: any) => ({
                branch_label: p.label || "Option",
                instructions_rishona: splitIntoSeparateSteps(p.steps && p.steps.length > 0 ? p.steps : p.text),
                instructions_acharona: splitIntoSeparateSteps(
                  (p.after_blessings && p.after_blessings.length > 0)
                    ? p.after_blessings
                    : parsed.after_blessings || []
                )
            }));
        } else {
            parsedResult.has_branches = false;
            parsedResult.branches = [{
                branch_label: "Default",
                instructions_rishona: splitIntoSeparateSteps(parsed.steps),
                instructions_acharona: splitIntoSeparateSteps(parsed.after_blessings || [])
            }];
        }
      } else {
         parsedResult.has_branches = false;
         parsedResult.branches = [{
            branch_label: "Default",
            instructions_rishona: [],
            instructions_acharona: splitIntoSeparateSteps(parsed.after_blessings || [])
         }];
      }

      // Translate with Google Translate API if a target language other than English is selected
      const targetLang = (language || "").toLowerCase().trim();
      if (targetLang && targetLang !== "en") {
        if (parsedResult.identified_items && parsedResult.identified_items.length > 0) {
          parsedResult.identified_items = await translateList(parsedResult.identified_items, targetLang);
        }
        if (parsedResult.branch_question) {
          parsedResult.branch_question = await translateText(parsedResult.branch_question, targetLang);
        }
        if (parsedResult.branches && parsedResult.branches.length > 0) {
          for (const branch of parsedResult.branches) {
            if (branch.branch_label && branch.branch_label !== "Default") {
              branch.branch_label = await translateText(branch.branch_label, targetLang);
            }
            if (branch.instructions_rishona && branch.instructions_rishona.length > 0) {
              branch.instructions_rishona = await translateList(branch.instructions_rishona, targetLang);
            }
            if (branch.instructions_acharona && branch.instructions_acharona.length > 0) {
              branch.instructions_acharona = await translateList(branch.instructions_acharona, targetLang);
            }
          }
        }
        if (parsedResult.steps && parsedResult.steps.length > 0) {
          for (const s of parsedResult.steps) {
            if (s.text) {
              s.text = await translateText(s.text, targetLang);
            }
            if (s.condition_question) {
              s.condition_question = await translateText(s.condition_question, targetLang);
            }
            if (s.paths) {
              for (const p of s.paths) {
                if (p.label) p.label = await translateText(p.label, targetLang);
                if (p.text) p.text = await translateText(p.text, targetLang);
                if (p.steps) p.steps = await translateList(p.steps, targetLang);
                if (p.after_blessings) p.after_blessings = await translateList(p.after_blessings, targetLang);
              }
            }
          }
        }
        if (parsedResult.after_blessings && parsedResult.after_blessings.length > 0) {
          parsedResult.after_blessings = await translateList(parsedResult.after_blessings, targetLang);
        }
      }

      res.json({ result: parsedResult });
    } catch (e: any) {
      console.error("/api/ai/scan error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/models", async (req, res) => {
    try {
       
      const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + process.env.GEMINI_API_KEY);
      const data = await response.json();
      res.json(data);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      console.error("Express global error:", err);
      if (!res.headersSent) {
        if (err.type === "entity.too.large") {
          res
            .status(413)
            .json({ error: "Payload too large. Please use a smaller image." });
        } else {
          res
            .status(err.status || 500)
            .json({ error: err.message || "Internal Server Error" });
        }
      }
    },
  );

  app.get("/api/ping", (req, res) => res.json({ pong: true, requireOk: typeof require !== "undefined" })); app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
