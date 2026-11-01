import express from "express";
import multer from "multer";
import { forgotPassword, getMe, googleLogin, login, logout, register, resetPassword, sendRegistrationOtp, verifyRegistrationOtp } from "./controllers/auth.controller.js";
import { contactSupport, getPublicProfile, updateAvatar, updateProfile } from "./controllers/user.controller.js";
import { requireUser } from "../../common/requireUser.js";

const avatarMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

// Avatars stay in memory and are uploaded straight to Cloudinary.
const avatarUpload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!avatarMimeTypes.has(file.mimetype)) {
            return cb(new Error("Only JPG, PNG, and WEBP avatar files are allowed."));
        }
        return cb(null, true);
    },
});

const userRoutes = express.Router();

// Public: the gateway lets every /api/auth route through without a token, except getMe.
userRoutes.post("/api/auth/register", register);
userRoutes.post("/api/auth/register/send-otp", sendRegistrationOtp);
userRoutes.post("/api/auth/register/verify-otp", verifyRegistrationOtp);
userRoutes.post("/api/auth/login", login);
userRoutes.post("/api/auth/google", googleLogin);
userRoutes.post("/api/auth/logout", logout);
userRoutes.post("/api/auth/forgot-password", forgotPassword);
userRoutes.post("/api/auth/reset-password", resetPassword);
userRoutes.get("/api/auth/getMe", requireUser, getMe);

userRoutes.get("/api/user/public/:id", requireUser, getPublicProfile);
userRoutes.post("/api/user/contact-support", requireUser, contactSupport);
userRoutes.put("/api/user/update-profile", requireUser, updateProfile);
userRoutes.put("/api/user/update-avatar", requireUser, avatarUpload.single("avatar"), updateAvatar);

export default userRoutes;
