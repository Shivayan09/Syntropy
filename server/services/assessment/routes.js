import express from "express";
import { getAttemptById, getMyAttempts, heartbeatAttempt, startAttempt, submitAttempt } from "./controllers/attempt.controller.js";
import { getLeaderboard } from "./controllers/leaderboard.controller.js";
import { getAptitudeStats } from "./controllers/aptitudeStats.controller.js";
import mongoose from "mongoose";
import Attempt from "./models/attempt.model.js";
import { requireUser } from "../../common/requireUser.js";
import { requireInternal } from "../../common/internal.js";

const assessmentRoutes = express.Router();

assessmentRoutes.post("/api/attempt/submit", requireUser, submitAttempt);
assessmentRoutes.get("/api/attempt/my", requireUser, getMyAttempts);
assessmentRoutes.get("/api/attempt/:id", requireUser, getAttemptById);
assessmentRoutes.post("/api/attempt/start", requireUser, startAttempt);
assessmentRoutes.post("/api/attempt/heartbeat", requireUser, heartbeatAttempt);

assessmentRoutes.get("/api/leaderboard", requireUser, getLeaderboard);
assessmentRoutes.get("/api/aptitude/stats", requireUser, getAptitudeStats);

// Called by other services through client.js.

// Totals over the user's first attempt at each test. Null if they have none.
assessmentRoutes.post("/internal/assessment/user-attempt-stats", requireInternal, async (req, res) => {
    // Aggregations don't convert ids, and userId arrives as a string over HTTP.
    const userId = new mongoose.Types.ObjectId(String(req.body.userId));
    const [stats] = await Attempt.aggregate([
        { $match: { user: userId, isFirstAttempt: true } },
        {
            $group: {
                _id: null,
                testsAttempted: { $sum: 1 },
                averageAccuracy: { $avg: "$accuracy" },
                averageScore: { $avg: "$score" },
                bestScore: { $max: "$score" },
                totalQuestionsSolved: { $sum: { $add: ["$correct", "$wrong", "$skipped"] } },
                totalCorrect: { $sum: "$correct" },
                totalWrong: { $sum: "$wrong" },
                totalSkipped: { $sum: "$skipped" }
            }
        }
    ]);
    res.json({ stats: stats || null });
});

export default assessmentRoutes;
