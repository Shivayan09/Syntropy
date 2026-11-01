import express from "express";
import { aiTest, createTest, getAllTests, getTest, getTestForAttempt } from "./controllers/test.controller.js";
import { generateAptitudeSet, getAptitudeCatalog, getAptitudePracticeSet, getAptitudeTests } from "./controllers/aptitude.controller.js";
import Test from "./models/test.model.js";
import { requireUser } from "../../common/requireUser.js";
import { requireInternal } from "../../common/internal.js";

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

// Called by other services through client.js.

// The full test, including answers. Only returned if the user owns it.
generationRoutes.post("/internal/generation/user-test", requireInternal, async (req, res) => {
    const { testId, userId } = req.body;
    const test = await Test.findOne({ _id: testId, createdBy: userId }).lean();
    res.json({ test });
});

generationRoutes.post("/internal/generation/count-user-tests", requireInternal, async (req, res) => {
    const count = await Test.countDocuments({ createdBy: req.body.userId });
    res.json({ count });
});

generationRoutes.post("/internal/generation/user-aptitude-tests", requireInternal, async (req, res) => {
    const tests = await Test.find({ createdBy: req.body.userId, category: "aptitude" }).select("_id questions aptitude").lean();
    res.json({ tests });
});

export default generationRoutes;
