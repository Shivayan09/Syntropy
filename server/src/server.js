import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes.js";
import connectDB from "./config/mongodb.js";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import testRouter from "./routes/test.routes.js";
import attemptRouter from "./routes/attempt.routes.js";
import leaderboardRouter from "./routes/leaderboard.routes.js";
import syllabusRouter from "./routes/syllabus.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import healthRouter from "./routes/health.routes.js";

const app = express();
await connectDB();

app.use(cors({
  origin: ["http://localhost:3000", "https://syntropy-tests.vercel.app", "https://syntropytest.in", "https://www.syntropytest.in" , process.env.FRONTEND_URL],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/health", healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/test', testRouter);
app.use("/api/attempt", attemptRouter);
app.use("/api/leaderboard", leaderboardRouter);
app.use("/api/syllabus", syllabusRouter);
app.use("/api/payment", paymentRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});