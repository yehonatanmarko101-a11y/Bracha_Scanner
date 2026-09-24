import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateContentWithRotation(options: any) {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const ai = new GoogleGenAI({
    apiKey: API_KEY,
    httpOptions: { headers: { "User-Agent": "aistudio-build" } },
  });

  const MAX_RETRIES = 3;
  let attempt = 0;

  while (attempt <= MAX_RETRIES) {
    try {
      const response = await ai.models.generateContent(options);
      return response;
    } catch (err: any) {
      const status = err?.status || err?.response?.status;
      const errMsg = String(err.message || err).toLowerCase();
      
      const isTransient = status === 429 || status === 503 || errMsg.includes('429') || errMsg.includes('503') || errMsg.includes('quota') || errMsg.includes('unavailable') || errMsg.includes('fetch failed');
      
      if (isTransient && attempt < MAX_RETRIES) {
        attempt++;
        const backoff = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
        console.warn(`Transient error on AI provider. Retrying in ${backoff}ms (attempt ${attempt})`);
        await new Promise(r => setTimeout(r, backoff));
        continue;
      } else {
        console.error("AI Provider error:", err);
        throw new Error('AI processing failed due to high traffic or quota exhaustion. Please try again later.');
      }
    }
  }
  throw new Error('AI processing failed due to high traffic or quota exhaustion. Please try again later.');
}
