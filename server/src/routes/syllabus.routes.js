import express from "express";
import multer from "multer";
import { uploadSyllabus, getMySyllabus, getSyllabusById, updateSyllabus } from "../controllers/syllabus.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { syllabusFileFilter } from "../middlewares/fileUpload.middleware.js";

const syllabusRouter = express.Router();

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 8 * 1024 * 1024,
    },
    fileFilter: syllabusFileFilter,
});

syllabusRouter.post("/upload", protect, upload.single("file"), uploadSyllabus);
syllabusRouter.get("/my", protect, getMySyllabus);
syllabusRouter.get("/:id", protect, getSyllabusById);
syllabusRouter.put("/update", protect, updateSyllabus);

export default syllabusRouter;
