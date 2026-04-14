import express from "express";
import multer from "multer";
import { uploadSyllabus, getMySyllabus, getSyllabusById } from "../controllers/syllabus.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const syllabusRouter = express.Router();

const upload = multer({ dest: "uploads/" });

syllabusRouter.post("/upload", protect, upload.single("file"), uploadSyllabus);

syllabusRouter.get("/my", protect, getMySyllabus);

syllabusRouter.get("/:id", protect, getSyllabusById);

export default syllabusRouter;