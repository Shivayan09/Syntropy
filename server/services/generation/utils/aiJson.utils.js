import { jsonrepair } from "jsonrepair";

const stripFences = (text = "") => text.replace(/```json/gi, "").replace(/```/g, "").trim();

const parseLoose = (text) => JSON.parse(jsonrepair(text));

/**
 * Pulls every complete top-level object out of an array body, so a response that
 * was cut off mid-question still yields the questions that did arrive.
 */
const salvageObjects = (arrayBody) => {
    const objects = [];
    let depth = 0;
    let start = -1;
    let inString = false;
    let escaped = false;

    for (let i = 0; i < arrayBody.length; i++) {
        const char = arrayBody[i];

        if (inString) {
            if (escaped) {
                escaped = false;
            } else if (char === "\\") {
                escaped = true;
            } else if (char === '"') {
                inString = false;
            }
            continue;
        }

        if (char === '"') {
            inString = true;
            continue;
        }

        if (char === "{") {
            if (depth === 0) start = i;
            depth++;
            continue;
        }

        if (char === "}") {
            depth--;
            if (depth === 0 && start !== -1) {
                objects.push(arrayBody.slice(start, i + 1));
                start = -1;
            }
        }
    }

    return objects
        .map((candidate) => {
            try {
                return parseLoose(candidate);
            } catch {
                return null;
            }
        })
        .filter(Boolean);
};

/**
 * Extracts an array of objects from a model response.
 * Accepts a bare array, an object wrapping the array, or a truncated array.
 */
export const extractJsonArray = (rawText = "", wrapperKey = "questions") => {
    const cleaned = stripFences(rawText);

    if (!cleaned) {
        throw new Error("AI returned an empty response");
    }

    const arrayStart = cleaned.indexOf("[");
    const objectStart = cleaned.indexOf("{");

    if (arrayStart === -1 && objectStart === -1) {
        throw new Error("No JSON found in AI response");
    }

    const candidates = [];

    if (arrayStart !== -1) {
        const arrayEnd = cleaned.lastIndexOf("]");
        if (arrayEnd > arrayStart) {
            candidates.push(cleaned.slice(arrayStart, arrayEnd + 1));
        }
    }

    if (objectStart !== -1) {
        const objectEnd = cleaned.lastIndexOf("}");
        if (objectEnd > objectStart) {
            candidates.push(cleaned.slice(objectStart, objectEnd + 1));
        }
    }

    for (const candidate of candidates) {
        try {
            const parsed = parseLoose(candidate);

            if (Array.isArray(parsed)) {
                return parsed;
            }

            if (Array.isArray(parsed?.[wrapperKey])) {
                return parsed[wrapperKey];
            }
        } catch {
            // fall through to salvage
        }
    }

    const salvaged = salvageObjects(arrayStart === -1 ? cleaned : cleaned.slice(arrayStart));

    if (salvaged.length) {
        return salvaged;
    }

    throw new Error("AI returned invalid JSON");
};

/**
 * Groq reasoning models spend part of the completion budget on hidden reasoning.
 * When the budget runs out the JSON body is cut off, so surface that clearly.
 */
export const readCompletionText = (completion) => {
    const choice = completion?.choices?.[0];
    const text = choice?.message?.content ?? "";

    if (!text.trim()) {
        if (choice?.finish_reason === "length") {
            throw new Error("AI ran out of room before writing the test. Try fewer questions.");
        }

        throw new Error("AI returned an empty response");
    }

    return { text, truncated: choice?.finish_reason === "length" };
};
