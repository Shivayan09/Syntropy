import fs from "fs";
import Syllabus from "../models/syllabus.model.js";
import { extractTextFromFile } from "../services/ocr.service.js";
import { parseSyllabus } from "../services/syllabusParser.service.js";

export const uploadSyllabus = async (req, res) => {
    const file = req.file;

    try {
        const userId = req.user._id;

        if (!file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded"
            });
        }

        const rawText = await extractTextFromFile(file.path, file.mimetype);
        console.log("RAW OCR TEXT:\n", rawText.slice(0, 1000));

        let subjects = [];
        try {
            subjects = await parseSyllabus(rawText);
        } catch (err) {
            console.error("PARSER FAILED:", err.message);
        }

        const existingSyllabus = await Syllabus.findOne({ user: userId }).sort({ createdAt: -1 });
        if (existingSyllabus) {
            await Syllabus.deleteMany({ user: userId, _id: { $ne: existingSyllabus._id } });
        }

        const syllabus = existingSyllabus || new Syllabus({ user: userId });
        syllabus.title = file.originalname;
        syllabus.fileType = file.mimetype === "application/pdf" ? "pdf" : "image";
        syllabus.fileUrl = undefined;
        syllabus.rawText = rawText;
        syllabus.subjects = subjects && subjects.length > 0 ? subjects : [];
        syllabus.source = "upload";
        syllabus.parsed = syllabus.subjects.length > 0;

        if (!syllabus.parsed) {
            console.log("No subjects parsed, saving raw only");
        }

        await syllabus.save();

        return res.status(200).json({
            success: true,
            syllabus,
            overwritten: Boolean(existingSyllabus)
        });
    } catch (error) {
        console.error("UPLOAD ERROR:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    } finally {
        if (file?.path) {
            await fs.promises.unlink(file.path).catch(() => null);
        }
    }
};

export const getMySyllabus = async (req, res) => {
    try {
        const syllabus = await Syllabus.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({
            success: true,
            syllabus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getSyllabusById = async (req, res) => {
    try {
        const syllabus = await Syllabus.findOne({ _id: req.params.id, user: req.user._id });
        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: "Syllabus not found"
            });
        }
        res.json({
            success: true,
            syllabus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateSyllabus = async (req, res) => {
    try {
        const userId = req.user._id;
        const { _id, subjects } = req.body;
        const syllabus = await Syllabus.findOne({ _id, user: userId });
        if (!syllabus) {
            return res.status(404).json({
                success: false,
                message: "Syllabus not found",
            });
        }
        syllabus.subjects = subjects;
        syllabus.parsed = true;
        await syllabus.save();
        res.json({
            success: true,
            syllabus,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};
