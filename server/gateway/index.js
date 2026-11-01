// The single entrypoint. On Render every service runs inside this one process.
import "dotenv/config";

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "../common/db.js";
import { errorHandler } from "../common/errorHandler.js";
import { applyRouteRateLimits } from "./rateLimits.js";
import { authenticate } from "./auth.js";
import syllabusRoutes from "../services/syllabus/routes.js";
import billingRoutes from "../services/billing/routes.js";
import generationRoutes from "../services/generation/routes.js";
import assessmentRoutes from "../services/assessment/routes.js";
import userRoutes from "../services/user/routes.js";

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
  if (!origin || allowedOrigins.has(origin)) {
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
  allowedHeaders: ["Content-Type", "Authorization", "X-Client-Platform"],
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
applyRouteRateLimits(app);
app.use(authenticate);

app.get("/", (req, res) => res.send("Server is running"));
app.get("/health/ping", (req, res) => res.status(200).send("ok"));

// Every service adds its own /api routes.
app.use(syllabusRoutes);
app.use(billingRoutes);
app.use(generationRoutes);
app.use(assessmentRoutes);
app.use(userRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});
