import { createRateLimiter } from "./rateLimit.js";

const minutes = (value) => value * 60 * 1000;

const apiLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 300,
    message: "Too many requests. Please try again later.",
});

const authLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 60,
    message: "Too many authentication requests. Please try again later.",
});

const otpSendLimiter = createRateLimiter({
    windowMs: minutes(10),
    maxRequests: 5,
    message: "Too many OTP requests. Please try again later.",
});

const otpVerifyLimiter = createRateLimiter({
    windowMs: minutes(10),
    maxRequests: 10,
    message: "Too many verification attempts. Please try again later.",
});

const loginLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 8,
    message: "Too many login attempts. Please try again later.",
});

const passwordResetLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 5,
    message: "Too many password reset requests. Please try again later.",
});

const uploadLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 30,
    message: "Too many upload requests. Please try again later.",
});

const aiGenerationLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 20,
    message: "Too many test generation requests. Please try again later.",
});

const paymentLimiter = createRateLimiter({
    windowMs: minutes(15),
    maxRequests: 30,
    message: "Too many payment requests. Please try again later.",
});

export const applyRouteRateLimits = (app) => {
    app.use("/api", apiLimiter);
    app.use("/api/auth", authLimiter);
    app.use("/api/auth/register/send-otp", otpSendLimiter);
    app.use("/api/auth/register/verify-otp", otpVerifyLimiter);
    app.use("/api/auth/login", loginLimiter);
    app.use("/api/auth/google", loginLimiter);
    app.use("/api/auth/forgot-password", passwordResetLimiter);
    app.use("/api/auth/reset-password", passwordResetLimiter);
    app.use("/api/test/generate", aiGenerationLimiter);
    app.use("/api/aptitude/generate", aiGenerationLimiter);
    app.use("/api/syllabus/upload", uploadLimiter);
    app.use("/api/payment", paymentLimiter);
};
