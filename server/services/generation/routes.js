import express from "express";
import { aiTest, createTest, getAllTests, getTest, getTestForAttempt } from "./controllers/test.controller.js";
import { generateAptitudeSet, getAptitudeCatalog, getAptitudePracticeSet, getAptitudeTests } from "./controllers/aptitude.controller.js";
import { requireUser } from "../../common/requireUser.js";

const generationRoutes = express.Router();

generationRoutes.post("/api/test/create", requireUser, createTest);
generationRoutes.post("/api/test/generate", requireUser, aiTest);
generationRoutes.get("/api/test/all", requireUser, getAllTests);
generationRoutes.get("/api/test/:id", requireUser, getTest);
generationRoutes.get("/api/test/:id/attempt", requireUser, getTestForAttempt);

generationRoutes.get("/api/aptitude/catalog", requireUser, getAptitudeCatalog);
generationRoutes.get("/api/aptitude/tests", requireUser, getAptitudeTests);
generationRoutes.post("/api/aptitude/generate", requireUser, generateAptitudeSet);
generationRoutes.get("/api/aptitude/practice/:id", requireUser, getAptitudePracticeSet);

export default generationRoutes;
