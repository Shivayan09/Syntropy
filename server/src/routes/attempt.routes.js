import express from "express";
import { getAttemptById, getMyAttempts, heartbeatAttempt, startAttempt, submitAttempt } from "../controllers/attempt.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const attemptRouter = express.Router();

attemptRouter.post("/submit", protect, submitAttempt);
attemptRouter.get("/my", protect, getMyAttempts);
attemptRouter.get("/:id", protect, getAttemptById);
attemptRouter.post("/start", protect, startAttempt);
attemptRouter.post("/heartbeat", protect, heartbeatAttempt);

export default attemptRouter;