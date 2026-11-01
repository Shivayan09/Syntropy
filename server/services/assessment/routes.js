import express from "express";
import { getAttemptById, getMyAttempts, heartbeatAttempt, startAttempt, submitAttempt } from "./controllers/attempt.controller.js";
import { getLeaderboard } from "./controllers/leaderboard.controller.js";
import { getAptitudeStats } from "./controllers/aptitudeStats.controller.js";
import { requireUser } from "../../common/requireUser.js";

const assessmentRoutes = express.Router();

assessmentRoutes.post("/api/attempt/submit", requireUser, submitAttempt);
assessmentRoutes.get("/api/attempt/my", requireUser, getMyAttempts);
assessmentRoutes.get("/api/attempt/:id", requireUser, getAttemptById);
assessmentRoutes.post("/api/attempt/start", requireUser, startAttempt);
assessmentRoutes.post("/api/attempt/heartbeat", requireUser, heartbeatAttempt);

assessmentRoutes.get("/api/leaderboard", requireUser, getLeaderboard);
assessmentRoutes.get("/api/aptitude/stats", requireUser, getAptitudeStats);

export default assessmentRoutes;
