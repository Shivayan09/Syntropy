import express from "express";
import { uploadSyllabus, getMySyllabus, getSyllabusById, updateSyllabus } from "../controllers/syllabus.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { handleSingleUpload, syllabusUpload } from "../middlewares/upload.middleware.js";

const syllabusRouter = express.Router();

syllabusRouter.post("/upload", protect, handleSingleUpload(syllabusUpload, "file"), uploadSyllabus);
syllabusRouter.get("/my", protect, getMySyllabus);
syllabusRouter.get("/:id", protect, getSyllabusById);
syllabusRouter.put("/update", protect, updateSyllabus);

export default syllabusRouter;
