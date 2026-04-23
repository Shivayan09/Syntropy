import fs from "fs";
import { createRequire } from "module";
import Tesseract from "tesseract.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const extractTextFromPdf = async (filePath) => {
    const buffer = await fs.promises.readFile(filePath);

    const pdf = typeof pdfParse === "function"
        ? pdfParse
        : pdfParse.default;

    if (typeof pdf !== "function") {
        throw new Error("pdf-parse not loaded correctly");
    }

    const data = await pdf(buffer);
    return data.text || "";
};

const extractTextFromImage = async (filePath) => {
    const { data } = await Tesseract.recognize(filePath, "eng");
    return data?.text || "";
};

export const extractTextFromFile = async (filePath, mimeType) => {
    try {
        if (mimeType === "application/pdf") {
            return await extractTextFromPdf(filePath);
        }

        if (mimeType?.startsWith("image/")) {
            return await extractTextFromImage(filePath);
        }

        throw new Error("Unsupported syllabus file type");
    } catch (error) {
        console.error("OCR EXTRACT ERROR:", error.message);
        return "";
    }
};
