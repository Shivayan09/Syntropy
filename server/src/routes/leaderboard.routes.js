import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getLeaderboard } from "../controllers/leaderboard.controller.js";

const leaderboardRouter = express.Router();

leaderboardRouter.get("/", protect, getLeaderboard);

export default leaderboardRouter;