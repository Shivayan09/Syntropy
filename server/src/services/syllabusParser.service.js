import Groq from "groq-sdk";

export async function parseSyllabus(rawText) {

    // 🔥 CLEAN + CONTROL INPUT
    const cleanedText = rawText
        .replace(/\n{2,}/g, "\n")
        .replace(/\s+/g, " ")
        .replace(/Page \d+ of \d+/gi, "")
        .slice(0, 8000); // balanced

    const groq = new Groq({
        apiKey: process.env.GROQ_API_KEY
    });

    try {
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            temperature: 0.2,
            messages: [
                {
                    role: "system",
                    content: `
You are a strict JSON generator.

Extract syllabus into structured format.

Rules:
- detect up to MAX 5 subjects
- include ALL units/modules/chapters under each subject
- LIMIT topics under each unit/module/chapter to max 3 per unit
- clean numbering and symbols
- DO NOT truncate units
- return ONLY valid JSON

STRICT:
- no explanation
- no markdown
- no text outside JSON
`
                },
                {
                    role: "user",
                    content: `
Return format:
{
"subjects":[
{
"name":"Subject name",
"units":[
{
"title":"Unit name",
"topics":[
{"name":"topic"}
]
}
]
}
]
}

IMPORTANT:
- detect up to MAX 5 subjects
- include ALL units/modules/chapters under each subject
- LIMIT topics under each unit/module/chapter to max 3 per unit
- clean numbering and symbols
- DO NOT truncate units
- return ONLY valid JSON

Syllabus:
${cleanedText}
`
                }
            ]
        });

        let aiText = completion.choices[0].message.content;

        // 🔥 CLEAN UNICODE GARBAGE
        aiText = aiText
            .replace(/[\u2010-\u2015]/g, "-")
            .replace(/[\u2018\u2019]/g, "'")
            .replace(/[\u201C\u201D]/g, '"')
            .replace(/\u00A0/g, " ")
            .trim();

        // 🔥 TRUNCATION GUARD
        if (!aiText.trim().endsWith("}")) {
            console.warn("⚠️ Truncated response, retrying with smaller input...");
            return await parseSyllabus(rawText.slice(0, 4000));
        }

        // 🔥 SAFE JSON EXTRACTION
        const start = aiText.indexOf("{");
        const end = aiText.lastIndexOf("}");

        if (start === -1 || end === -1) {
            console.error("❌ NO JSON FOUND:\n", aiText);
            return [];
        }

        const jsonString = aiText.slice(start, end + 1);

        // 🔍 DEBUG
        console.log("🧪 JSON LENGTH:", jsonString.length);

        let parsed;

        try {
            parsed = JSON.parse(jsonString);
        } catch (err) {
            console.error("❌ JSON PARSE FAILED");
            console.error("🔴 ERROR:", err.message);
            console.error("🔴 LAST PART:", jsonString.slice(-500));
            return [];
        }

        // 🔥 ENFORCE LIMITS (AI can disobey)
        parsed.subjects = (parsed.subjects || [])
            .slice(0, 5)
            .map(subject => ({
                ...subject,
                units: (subject.units || []).map(unit => ({
                    ...unit,
                    topics: (unit.topics || []).slice(0, 3)
                }))
            }));

        // 🔥 FALLBACK (if AI gives nothing)
        if (!parsed.subjects || parsed.subjects.length === 0) {
            console.warn("⚠️ Empty subjects from AI");

            return [
                {
                    name: "General",
                    units: [
                        {
                            title: "Topics",
                            topics: rawText
                                .split("\n")
                                .slice(0, 20)
                                .map(t => ({ name: t.trim() }))
                                .filter(t => t.name.length > 5)
                        }
                    ]
                }
            ];
        }

        return parsed.subjects;

    } catch (error) {
        console.error("❌ GROQ ERROR:", error.message);
        return [];
    }
}