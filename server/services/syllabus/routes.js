import express from "express";
import multer from "multer";
import { uploadSyllabus, getMySyllabus, getSyllabusById, updateSyllabus } from "./controllers/syllabus.controller.js";
import { requireUser } from "../../common/requireUser.js";

const allowedMimeTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);

// Files are written to uploads/ only while being parsed, then deleted by the controller.
const upload = multer({
    dest: "uploads/",
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!allowedMimeTypes.has(file.mimetype)) {
            return cb(new Error("Only PDF, JPG, PNG, and WEBP files are allowed."));
        }
        return cb(null, true);
    },
});

const syllabusRoutes = express.Router();

syllabusRoutes.post("/api/syllabus/upload", requireUser, upload.single("file"), uploadSyllabus);
syllabusRoutes.get("/api/syllabus/my", requireUser, getMySyllabus);
syllabusRoutes.get("/api/syllabus/:id", requireUser, getSyllabusById);
syllabusRoutes.put("/api/syllabus/update", requireUser, updateSyllabus);

export default syllabusRoutes;
