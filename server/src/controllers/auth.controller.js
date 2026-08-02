import User from "../models/user.model.js"
import RegistrationOtp from "../models/registrationOtp.model.js";
import validator from 'validator'
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { OAuth2Client } from "google-auth-library";
import { normalizePlan } from "../config/plan.js";
import { clearAuthCookie, createAuthToken, isMobileAuthRequest, setAuthCookie } from "../utils/authToken.js";

const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_ATTEMPTS = 5;
const DEFAULT_FRONTEND_URL = "https://syntropy-tests.vercel.app";
const DEFAULT_SMTP_HOST = "smtp.gmail.com";
const DEFAULT_SMTP_PORT = 465;

const normalizeEmail = (email) => {
    return email?.trim().toLowerCase();
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const hashResetToken = (token) =>
    crypto.createHash("sha256").update(token).digest("hex");

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

const getSmtpConfig = () => {
    const user = process.env.EMAIL;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        throw new Error("Email service is not configured. Missing EMAIL or EMAIL_PASS.");
    }

    const host = process.env.SMTP_HOST || DEFAULT_SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || DEFAULT_SMTP_PORT);
    const secure = process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : port === 465;

    return {
        host, port, secure, auth: { user, pass },
    };
};

const createEmailTransporter = () => nodemailer.createTransport({
    ...getSmtpConfig(),
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
});

const getFrontendUrl = () => process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL;

const createAuthPayload = (user) => ({
    _id: user._id,
    username: user.username,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    provider: user.provider,
    phoneNumber: user.phoneNumber,
    avatar: user.avatar,
    college: user.college,
    semester: user.semester,
    onboardingCompleted: user.onboardingCompleted,
    plan: normalizePlan(user.plan),
    planBillingCycle: user.planBillingCycle,
    planExpiry: user.planExpiry,
    preferences: user.preferences,
});

const respondWithAuth = async (req, res, user, message) => {
    const token = createAuthToken(user._id);

    if (isMobileAuthRequest(req)) {
        const freshUser = await User.findById(user._id).select('-password -aiTokens -lastTokenReset');
        if (!freshUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        return res.status(200).json({
            success: true,
            message,
            token,
            user: createAuthPayload(freshUser),
        });
    }

    setAuthCookie(res, token);
    return res.status(200).json({
        success: true,
        message,
    });
};

const escapeHtml = (value = "") => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

const getFirstName = (name = "") => {
    const trimmed = name.trim();
    if (!trimmed) {
        return "there";
    }
    return trimmed.split(/\s+/)[0];
};

const buildWelcomeEmailHtml = (name) => {
    const firstName = escapeHtml(getFirstName(name));
    const frontendUrl = getFrontendUrl();

    return `
        <div style="margin:0;padding:0;background-color:#ffffff;font-family:Inter,system-ui,-apple-system,sans-serif;color:#111111;">
            <div style="max-width:680px;margin:0 auto;">
                <div style="background-color:#00a85a;padding:22px 24px;text-align:center;">
                    <p style="margin:0;font-size:28px;line-height:1.2;font-weight:800;color:#ffffff;text-transform:uppercase;letter-spacing:0.05em;">
                        Welcome to Syntropy
                    </p>
                </div>

                <div style="padding:28px 24px 36px;background-color:#ffffff;">
                    <div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">
                        <h1 style="margin:0;font-size:30px;line-height:1.1;font-weight:800;color:#111111;">Hi ${firstName},</h1>
                    </div>

                    <p style="margin:0 0 16px;font-size:16px;line-height:1.7;">
                        You&rsquo;ve just stepped into a smarter way to prepare for exams, placements, and timed assessments.
                        No fluff, no guesswork, just focused practice and real insights.
                    </p>

                    <p style="margin:0 0 18px;font-size:16px;font-weight:700;">Here&rsquo;s what you can start doing right away:</p>

                    <div style="margin:0 0 14px;">
                        <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#00a85a;">1. Set up your profile</p>
                        <p style="margin:0;font-size:15px;line-height:1.7;">Add your academic details so your tests and recommendations actually make sense.</p>
                    </div>

                    <div style="margin:0 0 14px;">
                        <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#00a85a;">2. Upload your syllabus</p>
                        <p style="margin:0;font-size:15px;line-height:1.7;">We&rsquo;ll break it down into subjects, units, and topics, so you don&rsquo;t have to.</p>
                    </div>

                    <div style="margin:0 0 14px;">
                        <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#00a85a;">3. Create or generate tests</p>
                        <ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.7;">
                            <li>Build manual tests your way</li>
                            <li>Or let AI generate them based on your subjects, difficulty, and goals</li>
                        </ul>
                    </div>

                    <div style="margin:0 0 14px;">
                        <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#00a85a;">4. Attempt tests in a real exam environment</p>
                        <p style="margin:0;font-size:15px;line-height:1.7;">Timed interface, question navigation, review flags, the whole deal.</p>
                    </div>

                    <div style="margin:0 0 20px;">
                        <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#00a85a;">5. Track your performance</p>
                        <p style="margin:0;font-size:15px;line-height:1.7;">Get insights on accuracy, weak areas, and improvement trends so you know exactly what to fix.</p>
                    </div>

                    <p style="margin:0 0 8px;font-size:16px;font-weight:800;">Your starting credits are already active.</p>
                    <p style="margin:0 0 20px;font-size:15px;line-height:1.7;">Use them to generate your first AI-powered tests and see how far you can push yourself.</p>

                    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">Syntropy isn&rsquo;t about doing more tests.</p>
                    <p style="margin:0 0 14px;font-size:15px;line-height:1.7;">It&rsquo;s about doing the <strong>right</strong> ones and actually improving.</p>

                    <div style="margin:24px 0 18px;">
                        <a
                            href="${frontendUrl}"
                            style="display:inline-block;background-color:#00a85a;color:#ffffff;text-decoration:none;border:1px solid #000000;border-radius:999px;padding:12px 22px;font-size:15px;font-weight:700;box-shadow:4px 4px 0px #000000;"
                        >
                            Get started
                        </a>
                    </div>

                    <p style="margin:0;font-size:15px;line-height:1.7;">Let&rsquo;s make your preparation count.</p>
                    <p style="margin:16px 0 0;font-size:15px;font-weight:700;">- Team Syntropy</p>
                </div>
            </div>
        </div>
    `;
};

const sendWelcomeEmail = async (email, name) => {
    const transporter = createEmailTransporter();
    const frontendUrl = getFrontendUrl();

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: "Welcome to Syntropy",
        html: buildWelcomeEmailHtml(name),
        text: `Hi ${getFirstName(name)},

Welcome to Syntropy.

You’ve just stepped into a smarter way to prepare for exams, placements, and timed assessments. No fluff, no guesswork, just focused practice and real insights.

1. Set up your profile
Add your academic details so your tests and recommendations actually make sense.

2. Upload your syllabus
We’ll break it down into subjects, units, and topics, so you don’t have to.

3. Create or generate tests
- Build manual tests your way
- Or let AI generate them based on your subjects, difficulty, and goals

4. Attempt tests in a real exam environment
Timed interface, question navigation, review flags, the whole deal.

5. Track your performance
Get insights on accuracy, weak areas, and improvement trends so you know exactly what to fix.

Your starting credits are already active.
Use them to generate your first AI-powered tests and see how far you can push yourself.

Syntropy isn’t about doing more tests.
It’s about doing the right ones and actually improving.

Get started here:
${frontendUrl}

Let’s make your preparation count.

- Team Syntropy`,
    });
};

const sendRegistrationOtpEmail = async (email, otp) => {
    const transporter = createEmailTransporter();
    const startedAt = Date.now();

    try {
        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'Verify your email',
            html: `<p>Your registration OTP is <strong>${otp}</strong>.</p><p>This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>`,
        });
        console.log("Registration OTP email sent", {
            email,
            durationMs: Date.now() - startedAt,
        });
    } catch (error) {
        console.error("Registration OTP email send failed", {
            email,
            message: error?.message,
            code: error?.code,
            command: error?.command,
            durationMs: Date.now() - startedAt,
        });
        throw error;
    }
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
            return res.status(200).json({
                success: false,
                message: "If this email is eligible, an OTP will be sent."
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
            message: "If this email is eligible, an OTP will be sent.",
        });
    } catch (error) {
        console.error("sendRegistrationOtp failed", {
            message: error?.message,
            stack: error?.stack,
            email: req.body?.email,
        });
        return res.status(503).json({
            success: false,
            message: "OTP email is currently unavailable. Please continue using Google to register."
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
        console.error("verifyRegistrationOtp failed", {
            message: error?.message,
            stack: error?.stack,
            email: req.body?.email,
        });
        return res.status(500).json({
            success: false,
            message: "Unable to verify OTP"
        });
    }
};

export const register = async (req, res) => {
    const { name, email, phoneNumber, password, acceptedTerms } = req.body
    const validationError = validateRegistrationInput({ name, email, phoneNumber, password });
    if (validationError) {
        return res.status(400).json({
            success: false,
            message: validationError
        })
    }
    if (acceptedTerms !== true) {
        return res.status(400).json({
            success: false,
            message: "Please accept the Terms and Conditions to create an account"
        });
    }
    try {
        const normalizedEmail = normalizeEmail(email);
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "Unable to complete registration"
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
            termsAcceptedAt: new Date(),
        });
        await RegistrationOtp.deleteOne({ _id: verifiedOtp._id });

        sendWelcomeEmail(normalizedEmail, name).catch((emailError) => {
            console.error("Welcome email failed", emailError);
        });

        return respondWithAuth(req, res, user, "Account created successfully");
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to complete registration"
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
        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const matched = await bcrypt.compare(password, user.password)
        if (!matched) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            })
        }
        return respondWithAuth(req, res, user, "Logged In successfully");
    } catch {
        return res.status(500).json({
            success: false,
            message: "Unable to log in"
        })
    }
}

export const googleLogin = async (req, res) => {
    try {
        const { idToken, acceptedTerms } = req.body;
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
        let isNewUser = false;

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
            if (acceptedTerms !== true) {
                return res.status(428).json({
                    success: false,
                    requiresTermsAcceptance: true,
                    message: "Please accept the Terms and Conditions to continue with Google"
                });
            }
            user = await User.create({
                name: payload.name || normalizedEmail.split("@")[0],
                email: normalizedEmail,
                emailVerified: true,
                googleId: payload.sub,
                provider: "google",
                avatar: payload.picture || "",
                termsAcceptedAt: new Date(),
            });
            isNewUser = true;
        }

        if (isNewUser) {
            sendWelcomeEmail(normalizedEmail, user.name).catch((emailError) => {
                console.error("Welcome email failed", emailError);
            });
        }

        return respondWithAuth(req, res, user, "Logged in with Google successfully");
    } catch {
        return res.status(500).json({
            success: false,
            message: "Google sign-in failed"
        });
    }
};

export const logout = (req, res) => {
    clearAuthCookie(res);
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
        return res.status(200).json(createAuthPayload(user));
    } catch {
        res.status(500).json({ message: "Unable to load profile" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(200).json({ success: true, message: "If the account exists, a password reset link will be sent." });
        }

        const normalizedEmail = normalizeEmail(email);
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(200).json({ success: true, message: "If the account exists, a password reset link will be sent." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes

        user.resetToken = hashResetToken(resetToken);
        user.resetTokenExpiry = resetTokenExpiry;
        await user.save({ validateBeforeSave: false });

        await sendResetEmail(user.email, resetToken);

        return res.status(200).json({
            success: true,
            message: "If the account exists, a password reset link will be sent.",
        });
    } catch {
        return res.status(500).json({ success: false, message: "Unable to process password reset request" });
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

        if (typeof newPassword !== "string" || newPassword.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters long." });
        }

        const resetTokenHash = hashResetToken(resetToken);
        const user = await User.findOne({
            resetToken: resetTokenHash,
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
    } catch {
        return res.status(500).json({ success: false, message: "Unable to reset password" });
    }
};
