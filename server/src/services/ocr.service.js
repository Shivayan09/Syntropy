import axios from "axios";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const extractTextFromFile = async (fileUrl) => {
    try {
        const response = await axios.get(fileUrl, {
            responseType: "arraybuffer"
        });

        const buffer = Buffer.from(response.data);

        // 🔥 ensure correct function reference
        const pdf = typeof pdfParse === "function"
            ? pdfParse
            : pdfParse.default;

        if (typeof pdf !== "function") {
            throw new Error("pdf-parse not loaded correctly");
        }

        const data = await pdf(buffer);

        return data.text || "";

    } catch (error) {
        console.error("❌ PDF PARSE ERROR:", error.message);
        return "";
    }
};