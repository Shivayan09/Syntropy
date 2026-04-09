import express from "express";
import { getAttemptById, getMyAttempts, submitAttempt } from "../controllers/attempt.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const attemptRouter = express.Router();

attemptRouter.post("/submit", protect, submitAttempt);
attemptRouter.get("/my", protect, getMyAttempts);
attemptRouter.get("/:id", protect, getAttemptById);

export default attemptRouter;