import express from "express";
import { aiTest, createTest, getAllTests, getTest, getTestForAttempt } from "../controllers/test.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const testRouter = express.Router();

testRouter.post("/create", protect, createTest);
testRouter.post("/generate", protect, aiTest);
testRouter.get("/all", protect, getAllTests);
testRouter.get("/:id", protect, getTest);
testRouter.get("/:id/attempt", protect, getTestForAttempt);

export default testRouter;