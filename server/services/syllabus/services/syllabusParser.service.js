import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function generateWithFallback(prompt) {
    let lastError;
    for (const modelName of MODELS) {
        try {
            const model = genAI.getGenerativeModel({
                model: modelName,
                generationConfig: { temperature: 0, maxOutputTokens: 2048 },
            });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (!text || text.length < 10) {
                throw new Error("Empty response from AI");
            }
            return text;
        } catch (err) {
            const isRateLimit = err.status === 429 || err.message?.toLowerCase().includes("quota");
            if (isRateLimit) {
                await sleep(1500);
                lastError = err;
                continue;
            }
            lastError = err;
        }
    }
    throw new Error(lastError?.message || "All models failed");
}

export async function parseSyllabus(rawText) {
    try {
        const cleanedText = rawText.replace(/\n{2,}/g, "\n").replace(/\s+/g, " ").replace(/Page \d+ of \d+/gi, "").slice(0, 15000);
        const prompt = `
You are a strict JSON generator.

Extract syllabus into structured format.

Rules:
- detect up to MAX 5 subjects
- include ALL units/modules/chapters
- DO NOT truncate units
- clean numbering and symbols

STRICT:
- ONLY valid JSON
- NO markdown
- NO explanation
- NO extra text

Return format:
{
  "subjects": [
    {
      "name": "Subject name",
      "units": [
        { "title": "Unit name" }
      ]
    }
  ]
}

Syllabus:
${cleanedText}
`;
        let aiText = await generateWithFallback(prompt);
        aiText = aiText.replace(/```json/gi, "").replace(/```/g, "").replace(/[\u2010-\u2015]/g, "-").replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\u00A0/g, " ").trim();
        if (!aiText.endsWith("}")) {
            return await parseSyllabus(rawText.slice(0, 10000));
        }
        const start = aiText.indexOf("{");
        const end = aiText.lastIndexOf("}");
        if (start === -1 || end === -1) {
            console.error("❌ No JSON found in response");
            return [];
        }
        const jsonString = aiText.slice(start, end + 1);
        let parsed;
        try {
            parsed = JSON.parse(jsonString);
        } catch (err) {
            console.error("❌ JSON PARSE FAILED:", err.message);
            console.error("🔴 RAW END:", jsonString.slice(-300));
            return [];
        }
        parsed.subjects = (parsed.subjects || []).slice(0, 5)
            .map((subject) => ({
                name: subject.name || "Unnamed Subject",
                units: (subject.units || []).map((unit) => ({
                    title: unit.title || "Untitled Unit",
                })),
            }));
        if (!parsed.subjects.length) {
            console.warn("⚠️ Empty AI output, using fallback");
            return [
                {
                    name: "General",
                    units: [{ title: "Topics" }],
                },
            ];
        }
        return parsed.subjects;
    } catch (err) {
        console.error("ERROR:", err.message);
        return [
            {
                name: "General",
                units: [{ title: "Topics" }],
            },
        ];
    }
}