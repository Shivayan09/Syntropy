import express from 'express'
import { forgotPassword, getMe, googleLogin, login, logout, register, resetPassword, sendRegistrationOtp, verifyRegistrationOtp } from '../controllers/auth.controller.js';
import { protect } from '../middlewares/auth.middleware.js';
import { createRateLimiter } from '../middlewares/rateLimit.middleware.js';

const authRouter = express.Router();
const otpSendLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 5, message: "Too many OTP requests. Please try again later." });
const otpVerifyLimiter = createRateLimiter({ windowMs: 10 * 60 * 1000, maxRequests: 10, message: "Too many verification attempts. Please try again later." });
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 8, message: "Too many login attempts. Please try again later." });
const passwordResetLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, maxRequests: 5, message: "Too many password reset requests. Please try again later." });

authRouter.post('/register', register);
authRouter.post('/register/send-otp', otpSendLimiter, sendRegistrationOtp);
authRouter.post('/register/verify-otp', otpVerifyLimiter, verifyRegistrationOtp);
authRouter.post('/login', loginLimiter, login);
authRouter.post('/google', loginLimiter, googleLogin);
authRouter.post('/logout', logout);
authRouter.get('/getMe', protect, getMe);
authRouter.post('/forgot-password', passwordResetLimiter, forgotPassword)
authRouter.post('/reset-password', passwordResetLimiter, resetPassword)

export default authRouter;
