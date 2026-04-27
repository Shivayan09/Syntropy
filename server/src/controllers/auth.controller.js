import User from "../models/user.model.js"
import RegistrationOtp from "../models/registrationOtp.model.js";
import validator from 'validator'
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from "google-auth-library";
import { normalizePlan } from "../config/plan.js";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;

const normalizeEmail = (email) => email?.trim().toLowerCase();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const setAuthCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });
};

const validateRegistrationInput = ({ name, email, phoneNumber, password }, requirePassword = true) => {
    if (!name) {
        return "Name is required";
    }
    if (!email) {
        return "Email is required";
    }
    if (!validator.isEmail(email)) {
        return "Please enter a valid email!";
    }
    if (requirePassword && !password) {
        return "Password is required";
    }
    if (!validator.isMobilePhone(phoneNumber || "", "any")) {
        return "Please enter a valid phone number!";
    }
    return null;
};

const createEmailTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

const sendRegistrationOtpEmail = async (email, otp) => {
    const transporter = createEmailTransporter();

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: 'Verify your email',
        html: `<p>Your registration OTP is <strong>${otp}</strong>.</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
    });
};

export const sendRegistrationOtp = async (req, res) => {
    try {
        const { name, email, phoneNumber } = req.body;
        const validationError = validateRegistrationInput({ name, email, phoneNumber }, false);
        if (validationError) {
            return res.status(400).json({
                success: false,
                message: validationError
            });
        }
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists!"
            });
        }
        const otp = crypto.randomInt(100000, 1000000).toString();
        const otpHash = await bcrypt.hash(otp, 10);
        await RegistrationOtp.findOneAndUpdate(
            { email: normalizedEmail },
            {
                $set: { otpHash, attempts: 0, expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000) },
                $setOnInsert: { email: normalizedEmail },
                $unset: { verifiedAt: "" },
            },
            { upsert: true, runValidators: true }
        );
        await sendRegistrationOtpEmail(normalizedEmail, otp);
        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const verifyRegistrationOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({ success: false, message: "Please enter a valid email!" });
        }
        if (!otp) {
            return res.status(400).json({
                success: false,
                message: "OTP is required"
            });
        }
        const normalizedEmail = normalizeEmail(email);
        const otpDoc = await RegistrationOtp.findOne({ email: normalizedEmail });
        if (!otpDoc || otpDoc.expiresAt <= new Date()) {
            if (otpDoc) {
                await RegistrationOtp.deleteOne({ _id: otpDoc._id });
            }
            return res.status(400).json({
                success: false,
                message: "Invalid or expired OTP"
            });
        }
        if (otpDoc.attempts >= MAX_OTP_ATTEMPTS) {
            await RegistrationOtp.deleteOne({ _id: otpDoc._id });
            return res.status(429).json({ success: false, message: "Too many OTP attempts. Please request a new OTP." });
        }
        const matched = await bcrypt.compare(otp.toString(), otpDoc.otpHash || "");
        if (!matched) {
            otpDoc.attempts += 1;
            await otpDoc.save({ validateBeforeSave: false });
            return res.status(400).json({
                success: false,
                message: "Invalid OTP"
            });
        }
        otpDoc.verifiedAt = new Date();
        otpDoc.otpHash = undefined;
        await otpDoc.save({ validateBeforeSave: false });
        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const register = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body
    const validationError = validateRegistrationInput({ name, email, phoneNumber, password });
    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        })
    }
    try {
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists!"
            })
        }
        const verifiedOtp = await RegistrationOtp.findOne({
            email: normalizedEmail,
            verifiedAt: { $exists: true },
            expiresAt: { $gt: new Date() },
        });

        if (!verifiedOtp) {
            return res.status(400).json({
                success: false,
                message: "Please verify your email OTP before registering"
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            phoneNumber,
            email: normalizedEmail,
            password: hashedPassword,
            emailVerified: true,
        });
        await RegistrationOtp.deleteOne({ _id: verifiedOtp._id });
        setAuthCookie(res, user._id);
        const savedUser = await User.findById(user._id);
        return res.status(200).json({
            success: true,
            user: savedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Enter your username!"
        })
    }
    if (!password) {
        return res.status(400).json({
            success: false,
            message: "Enter your password!"
        })
    }
    try {
        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail }).select("+password");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found!"
            })
        }
        if (!user.password) {
            return res.status(400).json({
                success: false,
                message: "This account uses Google sign-in. Continue with Google to log in."
            })
        }
        const matched = await bcrypt.compare(password, user.password)
        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Incorrect credentials"
            })
        }
        setAuthCookie(res, user._id);
        return res.status(200).json({
            success: true,
            message: "Logged In successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;
        if (!process.env.GOOGLE_CLIENT_ID) {
            return res.status(500).json({
                success: false,
                message: "Google login is not configured on the server."
            });
        }
        if (!idToken) {
            return res.status(400).json({
                success: false,
                message: "Google ID token is required."
            });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();

        if (!payload?.email || !payload.email_verified || !payload.sub) {
            return res.status(401).json({
                success: false,
                message: "Unable to verify your Google account."
            });
        }

        const normalizedEmail = normalizeEmail(payload.email);
        let user = await User.findOne({ email: normalizedEmail });

        if (user) {
            if (user.googleId && user.googleId !== payload.sub) {
                return res.status(409).json({
                    success: false,
                    message: "This email is already linked to another Google account."
                });
            }

            let shouldSave = false;
            if (!user.googleId) {
                user.googleId = payload.sub;
                shouldSave = true;
            }
            if (!user.emailVerified) {
                user.emailVerified = true;
                shouldSave = true;
            }
            if (!user.avatar && payload.picture) {
                user.avatar = payload.picture;
                shouldSave = true;
            }
            if (!user.name && payload.name) {
                user.name = payload.name;
                shouldSave = true;
            }
            if (shouldSave) {
                await user.save();
            }
        } else {
            user = await User.create({
                name: payload.name || normalizedEmail.split("@")[0],
                email: normalizedEmail,
                emailVerified: true,
                googleId: payload.sub,
                provider: "google",
                avatar: payload.picture || "",
            });
        }

        setAuthCookie(res, user._id);

        return res.status(200).json({
            success: true,
            message: "Logged in with Google successfully",
            user,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Google sign-in failed"
        });
    }
};

export const logout = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        expires: new Date(0),
    });
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
};

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -aiTokens -lastTokenReset');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const normalizedPlan = normalizePlan(user.plan);
        if (normalizedPlan !== user.plan) {
            user.plan = normalizedPlan;
            await user.save();
        }
        return res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.json({ success: false, message: "Please enter your email!" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        user.resetToken = resetToken;
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save({ validateBeforeSave: false });

        await sendResetEmail(user.email, resetToken);

        return res.status(200).json({
            success: true,
            message: "Password reset email sent successfully",
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const sendResetEmail = async (email, token) => {
    const transporter = createEmailTransporter();

    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Password Reset',
        html: `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    await transporter.sendMail(mailOptions);
};

export const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.json({ success: false, message: "Please provide token and new password!" });
        }

        const user = await User.findOne({
            resetToken,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset token!" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successful"
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
