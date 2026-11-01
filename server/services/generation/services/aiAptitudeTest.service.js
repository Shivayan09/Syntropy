import Groq from "groq-sdk";
import Test from "../models/test.model.js";
import { extractJsonArray, readCompletionText } from "../utils/aiJson.utils.js";
import { getAptitudeSection, getCompanyTarget, getSectionLabel, MAX_APTITUDE_QUESTIONS } from "../config/aptitude.js";
import { getNextTestTitle } from "../utils/testTitle.utils.js";

// This model spends most of its completion budget on hidden reasoning tokens, so
// the 3072-token default leaves nothing for the JSON body at all. The budget is
// also reserved against the account's tokens-per-minute allowance, so it cannot
// simply be set high either: prompt + budget must stay under that ceiling.
// Measured usage at the question cap is ~6.0k completion tokens.
const MAX_COMPLETION_TOKENS = 6800;

const difficultyGuidance = {
    Easy: "Single step questions solvable in under 45 seconds with clean numbers.",
    Medium: "Two step questions solvable in about 60 to 90 seconds, the standard placement level.",
    Hard: "Multi step questions with tricky traps, solvable in about 2 minutes by a strong candidate."
};

const buildDistribution = (sections, topicsBySection, questions) => {
    const perSection = Math.floor(questions / sections.length);
    let remaining = questions % sections.length;

    return sections.map((sectionKey) => {
        const count = perSection + (remaining > 0 ? 1 : 0);
        remaining--;

        const section = getAptitudeSection(sectionKey);
        const chosenTopics = topicsBySection[sectionKey] || [];
        const topics = chosenTopics.length ? chosenTopics : section?.topics || [];

        return {
            sectionKey,
            sectionLabel: section?.label || "Aptitude",
            count,
            topics
        };
    }).filter((entry) => entry.count > 0);
};

const buildDistributionText = (distribution) =>
    distribution
        .map((entry) => `- ${entry.count} question(s) from ${entry.sectionLabel}, restricted to these topics: ${entry.topics.join(", ")}`)
        .join("\n");

export async function generateAptitudeTest(data, userId) {
    const {
        sections,
        topicsBySection = {},
        allTopics = [],
        difficulty = "Medium",
        questions,
        time,
        company = "general",
        targetRole
    } = data;

    if (!sections?.length) {
        throw new Error("Select at least 1 aptitude section");
    }

    if (questions > MAX_APTITUDE_QUESTIONS) {
        throw new Error(`Too many questions requested (max ${MAX_APTITUDE_QUESTIONS})`);
    }

    const companyTarget = getCompanyTarget(company) || getCompanyTarget("general");
    const distribution = buildDistribution(sections, topicsBySection, questions);
    const distributionText = buildDistributionText(distribution);
    const validTopics = new Set(distribution.flatMap((entry) => entry.topics.map((topic) => topic.toLowerCase())));
    const sectionLabelByKey = new Map(distribution.map((entry) => [entry.sectionLabel.toLowerCase(), entry.sectionKey]));

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        temperature: 0.4,
        max_completion_tokens: MAX_COMPLETION_TOKENS,
        reasoning_effort: "medium",
        messages: [
            {
                role: "system",
                content: `
You are an aptitude paper setter for campus placement and job interview rounds.

STRICT RULES:
- Return strictly valid JSON
- Use double quotes for ALL keys and strings
- No trailing commas
- No markdown
- No explanations outside JSON
- Output must be parseable by JSON.parse
- Escape every line break inside a string as \\n and every quote as \\"
- Follow the section and topic distribution exactly
`
            },
            {
                role: "user",
                content: `
Generate exactly ${questions} interview-focused aptitude MCQs. The array must contain ${questions} items, no fewer.

Target pattern: ${companyTarget.label}
Pattern notes: ${companyTarget.hint}
${targetRole ? `Candidate target role: ${targetRole}` : ""}

Difficulty: ${difficulty}
Difficulty guidance: ${difficultyGuidance[difficulty] || difficultyGuidance.Medium}

Distribution (follow exactly):
${distributionText}

Question rules:
- Every question must be fully self contained and solvable from the text alone.
- Never refer to an image, chart picture, passage or table that is not written out inside the question text.
- For Data Interpretation, write the data set out inside the question itself on a single line, values separated by semicolons.
- For Reading Comprehension or Para Jumbles, include the full passage or sentences inside the question text on a single line.
- Keep every question under 60 words.
- Use realistic interview-style numbers that stay solvable without a calculator.
- EXACTLY 4 options per question.
- Exactly one option is correct, and correct_answer must match one option string EXACTLY.
- Options must be distinct and plausible, with wrong options based on common mistakes.
- No repeated or near duplicate questions.
- "topic" must be copied exactly from the topic list given for that section.
- "section" must be copied exactly from the section name given above.

For each question also return:
- "approach": the exam shortcut or formula name, at most 15 words.
- "explanation": the worked solution leading to the correct option, at most 25 words.

Return JSON only, an array of exactly ${questions} objects in this shape:
[{"question":"","section":"","topic":"","options":["","","",""],"correct_answer":"","approach":"","explanation":""}]
`
            }
        ]
    });

    const { text: aiText } = readCompletionText(completion);
    const parsed = extractJsonArray(aiText);

    const seenQuestions = new Set();

    const formattedQuestions = parsed
        .map((q) => {
            if (!q?.question || !Array.isArray(q?.options) || q.options.length !== 4) {
                return null;
            }

            const key = q.question.trim().toLowerCase();
            if (seenQuestions.has(key)) {
                return null;
            }

            const correctIndex = q.options.findIndex(
                (opt) => String(opt ?? "").trim().toLowerCase() === String(q.correct_answer ?? "").trim().toLowerCase()
            );

            if (correctIndex === -1) {
                return null;
            }

            seenQuestions.add(key);

            const sectionKey = sectionLabelByKey.get(String(q.section ?? "").trim().toLowerCase()) || sections[0];
            const topic = String(q.topic ?? "").trim();

            return {
                question: q.question,
                options: q.options.map((opt) => String(opt)),
                correctAnswer: correctIndex,
                approach: q.approach || "",
                explanation: q.explanation || "",
                subject: getSectionLabel(sectionKey),
                topic: validTopics.has(topic.toLowerCase()) ? topic : "",
                difficulty
            };
        })
        .filter(Boolean);

    if (formattedQuestions.length < Math.ceil(questions * 0.7)) {
        throw new Error(
            "The AI could not build a full set this time. Please try again, or ask for fewer questions."
        );
    }

    const finalQuestions = formattedQuestions.slice(0, questions);
    const usedSections = [...new Set(finalQuestions.map((q) => q.subject))];

    const test = await Test.create({
        title: await getNextTestTitle(userId, "aptitude"),
        description: `${companyTarget.label} aptitude practice set`,
        type: "generated",
        category: "aptitude",
        testFormat: "mcq",
        createdBy: userId,
        difficulty,
        subjects: usedSections,
        totalQuestions: finalQuestions.length,
        duration: time,
        questions: finalQuestions,
        isPublished: true,
        aptitude: {
            sections,
            topics: allTopics,
            company: companyTarget.key,
            companyLabel: companyTarget.label
        }
    });

    return test;
}
