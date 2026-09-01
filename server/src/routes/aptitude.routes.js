import express from "express";
import {
    generateAptitudeSet,
    getAptitudeCatalog,
    getAptitudePracticeSet,
    getAptitudeStats,
    getAptitudeTests
} from "../controllers/aptitude.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const aptitudeRouter = express.Router();

aptitudeRouter.get("/catalog", protect, getAptitudeCatalog);
aptitudeRouter.get("/tests", protect, getAptitudeTests);
aptitudeRouter.get("/stats", protect, getAptitudeStats);
aptitudeRouter.post("/generate", protect, generateAptitudeSet);
aptitudeRouter.get("/practice/:id", protect, getAptitudePracticeSet);

export default aptitudeRouter;
