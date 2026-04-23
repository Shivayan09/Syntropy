import Syllabus from "../models/syllabus.model.js";
import cloudinary from "../config/cloudinary.js";
import { extractTextFromFile } from "../services/ocr.service.js";
import { parseSyllabus } from "../services/syllabusParser.service.js";
import fs from "fs";

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
        const upload = await cloudinary.uploader.upload(file.path, {
            resource_type: "raw",
        });
        await fs.promises.unlink(file.path);
        const syllabus = await Syllabus.create({
            user: userId, title: file.originalname, fileUrl: upload.secure_url, parsed: false
        });
        const rawText = await extractTextFromFile(upload.secure_url);
        let subjects = [];
        try {
            subjects = await parseSyllabus(rawText);
        } catch (err) {
            console.error("PARSER FAILED:", err.message);
        }
        syllabus.rawText = rawText;
        if (subjects && subjects.length > 0) {
            syllabus.subjects = subjects;
            syllabus.parsed = true;
        } else {
            console.log("No subjects parsed, saving raw only");
        }
        await syllabus.save();
        res.status(200).json({
            success: true,
            syllabus
        });
    } catch (error) {
        console.error("UPLOAD ERROR:", error.message);
        res.status(500).json({
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
        const syllabus = await Syllabus.findOne({ _id, user: userId, });
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
