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
import aptitudeRouter from "./routes/aptitude.routes.js";
import healthRouter from "./routes/health.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { applyRouteRateLimits } from "./middlewares/routeRateLimits.middleware.js";

const app = express();
await connectDB();

const allowedOrigins = new Set([
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://syntropy-tests.vercel.app",
  "https://syntropytest.in",
  "https://www.syntropytest.in",
  process.env.FRONTEND_URL,
].filter(Boolean));

const isPrivateDevHost = (hostname) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname) ||
  /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(hostname);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  if (allowedOrigins.has(origin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(origin);
    if (process.env.NODE_ENV !== "production" && protocol === "http:" && isPrivateDevHost(hostname)) {
      return true;
    }
    return protocol === "https:" && hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

app.use(cors({
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Client-Platform"]
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
applyRouteRateLimits(app);

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
app.use("/api/aptitude", aptitudeRouter);
app.use("/api/payment", paymentRouter);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
