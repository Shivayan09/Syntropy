// The only public entrypoint. It checks CORS, rate limits and the login token,
// then forwards each request to the service (a separate process) that owns that route.
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { createProxyMiddleware } from "http-proxy-middleware";
import { applyRouteRateLimits } from "./rateLimits.js";
import { authenticate } from "./auth.js";

for (const required of ["PORT", "JWT_SECRET", "USER_URL", "BILLING_URL", "GENERATION_URL", "ASSESSMENT_URL", "SYLLABUS_URL"]) {
  if (!process.env[required]) {
    throw new Error(`gateway: ${required} is not set in its .env`);
  }
}

const app = express();

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

// No body parsing here: request bodies (JSON and file uploads) are streamed to the services untouched.
app.use(cookieParser());
applyRouteRateLimits(app);
app.use(authenticate);

app.get("/", (req, res) => res.send("Server is running"));
app.get("/health/ping", (req, res) => res.status(200).send("ok"));

// Which service owns which paths. More specific paths come first:
// /api/user/ai-token-status belongs to billing, /api/aptitude/stats to assessment.
// /internal/* is never forwarded, so it can't be reached from outside.
const forward = (serviceEnv, paths) => createProxyMiddleware({
  target: process.env[serviceEnv],
  pathFilter: paths,
  on: {
    error: (error, req, res) => {
      console.error(`gateway: ${serviceEnv} unreachable for ${req.url}: ${error.code || error.message}`);
      if (!res.headersSent) {
        res.writeHead(503, { "Content-Type": "application/json" });
      }
      res.end(JSON.stringify({ success: false, message: "Service temporarily unavailable" }));
    },
  },
});

app.use(forward("BILLING_URL", ["/api/payment", "/api/user/ai-token-status"]));
app.use(forward("ASSESSMENT_URL", ["/api/attempt", "/api/leaderboard", "/api/aptitude/stats"]));
app.use(forward("USER_URL", ["/api/auth", "/api/user"]));
app.use(forward("GENERATION_URL", ["/api/test", "/api/aptitude"]));
app.use(forward("SYLLABUS_URL", ["/api/syllabus"]));

// Errors passed to next(err), e.g. a request from an origin CORS does not allow.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, next) => {
  res.status(400).json({ success: false, message: err.message || "Request could not be processed." });
});

app.listen(process.env.PORT, () => {
  console.log(`Gateway running on port ${process.env.PORT}`);
});
