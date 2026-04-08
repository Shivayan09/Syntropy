import express from "express";
import { createTest, getAllTests, getTest, getTestForAttempt } from "../controllers/test.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const testRouter = express.Router();

testRouter.post("/create", protect, createTest);
testRouter.get("/all", getAllTests);
testRouter.get("/:id", getTest);
testRouter.get("/:id/attempt", protect, getTestForAttempt);

export default testRouter;