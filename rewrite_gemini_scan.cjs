const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf-8');

const scanRouteRegex = /app\.post\("\/api\/gemini\/scan"[\s\S]*?(?=app\.get\("\/api\/models")/;
const newScanRoute = `app.post("/api/gemini/scan", async (req, res) => {
    try {
      const { base64Data, notes, minhag, context, language } = req.body;
      if (!base64Data) return res.status(400).json({ error: "No image data" });

      let resolvedMimeType = "image/jpeg";
      if (base64Data.startsWith("iVBOR")) resolvedMimeType = "image/png";
      else if (base64Data.startsWith("/9j/")) resolvedMimeType = "image/jpeg";
      else if (base64Data.startsWith("R0lG")) resolvedMimeType = "image/gif";
      else if (base64Data.startsWith("UklG")) resolvedMimeType = "image/webp";

      const { SYSTEM_PROMPT, buildUserMessage } = require("./src/components/geminiPrompt");
      const userMessage = buildUserMessage({ minhag, meal_context: context, user_notes: notes });

      const ai = await generateContentWithRotation();
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
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
                          after_blessings: { type: Type.ARRAY, items: { type: Type.STRING } }
                        },
                        required: ["label", "text"]
                      }
                    }
                  },
                  required: ["is_conditional"]
                }
              },
              after_blessings: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["food_name", "primary_bracha", "steps"]
          },
          temperature: 0.1
        }
      });

      const parsed = JSON.parse(response.text.replace(/^\\s*\\\`\\\`\\\`[a-zA-Z]*\\s*/, "").replace(/\\s*\\\`\\\`\\\`\\s*$/, "").trim());

      // Format for the UI
      let parsedResult: any = {
          identified_items: [parsed.food_name],
          primary_bracha: parsed.primary_bracha,
          steps: parsed.steps,
          after_blessings: parsed.after_blessings,
          is_extended: true,
      };

      if (parsed.steps && parsed.steps.length > 0) {
        const conditionalStep = parsed.steps.find((s: any) => s.is_conditional);
        if (conditionalStep) {
            parsedResult.has_branches = true;
            parsedResult.branch_question = conditionalStep.condition_question;
            parsedResult.branches = conditionalStep.paths.map((p: any) => ({
                branch_label: p.label,
                instructions_rishona: [p.text],
                instructions_acharona: p.after_blessings || []
            }));
        } else {
            parsedResult.has_branches = false;
            parsedResult.branches = [{
                branch_label: "Default",
                instructions_rishona: parsed.steps.map((s: any) => s.text).filter(Boolean),
                instructions_acharona: parsed.after_blessings || []
            }];
        }
      } else {
         parsedResult.has_branches = false;
         parsedResult.branches = [{
            branch_label: "Default",
            instructions_rishona: [],
            instructions_acharona: parsed.after_blessings || []
         }];
      }

      res.json({ result: parsedResult });
    } catch (e: any) {
      console.error("/api/gemini/scan error:", e);
      res.status(500).json({ error: e.message });
    }
  });

  `;
content = content.replace(scanRouteRegex, newScanRoute);
fs.writeFileSync('server.ts', content);
