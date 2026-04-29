import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import validator from "validator";
import nodemailer from "nodemailer";
import { buildAiTokenStatus, syncAiTokens } from "../utils/aiToken.utils.js";

const normalizeEmail = (email) => email?.trim().toLowerCase();
const createEmailTransporter = () => nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
    },
});

export const getAiTokenStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await syncAiTokens(user);

        return res.status(200).json({
            success: true,
            aiTokenStatus: buildAiTokenStatus(user)
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load AI token status"
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, username, phoneNumber, email, college, semester, preferences, onboardingCompleted } = req.body;
        const currentUser = await User.findById(userId).select("email");
        if (!currentUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        if (username !== undefined) {
            const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: "Username is already taken"
                });
            }
        }
        if (email !== undefined) {
            const normalizedEmail = normalizeEmail(email);
            const existingEmail = await User.findOne({ email: normalizedEmail, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use"
                });
            }
        }
        const updateData = {};
        if (name !== undefined) {
            if (name.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "Name is too short (2 chars min)"
                });
            }
            if (name.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: "Name is too long (50 chars max)"
                });
            }
            updateData.name = name;
        }
        if (username !== undefined) {
            if (username.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "Username is too short (3 chars min)"
                });
            }
            if (username.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Username is too long (30 chars max)"
                });
            }
            updateData.username = username;
        }
        if (phoneNumber !== undefined) {
            if (!validator.isMobilePhone(phoneNumber, "any")) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid phone number!"
                });
            }
            updateData.phoneNumber = phoneNumber;
        }
        if (email !== undefined) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email!"
                });
            }
            const normalizedEmail = normalizeEmail(email);
            updateData.email = normalizedEmail;
            if (normalizedEmail !== currentUser.email) {
                updateData.emailVerified = false;
            }
        }
        if (college !== undefined) {
            if (college.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "College name is too short (2 chars min)"
                });
            }
            updateData.college = college;
        }
        if (semester !== undefined) {
            updateData.semester = semester;
        }
        if (onboardingCompleted !== undefined) {
            updateData.onboardingCompleted = onboardingCompleted;
        }
        if (preferences) {
            if (preferences.subjects) {
                updateData["preferences.subjects"] = preferences.subjects;
            }
            if (preferences.difficulty) {
                updateData["preferences.difficulty"] = preferences.difficulty;
            }
            if (preferences.questionsPerTest) {
                updateData["preferences.questionsPerTest"] = preferences.questionsPerTest;
            }
            if (preferences.targetRole) {
                updateData["preferences.targetRole"] = preferences.targetRole;
            }
        }
        const updatedUser = await User.findByIdAndUpdate(userId, { $set: updateData }, { returnDocument: "after", runValidators: true }).select("-password");
        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: updatedUser
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update profile"
        });
    }
};

export const updateAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file uploaded",
            });
        }
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        if (user.avatarPublicId) {
            await cloudinary.uploader.destroy(user.avatarPublicId);
        }
        const uploadResult = await cloudinary.uploader.upload(`data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`,
            {
                folder: "syntropy/avatars",
                transformation: [{ width: 300, height: 300, crop: "fill" }, { quality: "auto" }],
            }
        );
        user.avatar = uploadResult.secure_url;
        user.avatarPublicId = uploadResult.public_id;
        await user.save();
        return res.status(200).json({
            success: true,
            avatar: user.avatar,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to update avatar",
        });
    }
};

export const contactSupport = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Name is required"
            });
        }

        if (!email || !validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email!"
            });
        }

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required"
            });
        }

        if (message.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message is too short"
            });
        }

        const user = await User.findById(req.user._id).select("name email username");
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const transporter = createEmailTransporter();
        const normalizedEmail = normalizeEmail(email);
        const safeMessage = message.trim();

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: process.env.EMAIL,
            replyTo: normalizedEmail,
            subject: `Support request from ${name.trim()}`,
            text: `Support request received

Name: ${name.trim()}
Email: ${normalizedEmail}
User ID: ${user._id}
Username: ${user.username || "Not set"}
Account Name: ${user.name || "Not set"}
Account Email: ${user.email || "Not set"}

Message:
${safeMessage}`,
            html: `
                <div style="font-family:Arial,sans-serif;color:#111111;line-height:1.6;">
                    <h2 style="margin:0 0 16px;">New support request</h2>
                    <p style="margin:0 0 8px;"><strong>Name:</strong> ${name.trim()}</p>
                    <p style="margin:0 0 8px;"><strong>Email:</strong> ${normalizedEmail}</p>
                    <p style="margin:0 0 8px;"><strong>User ID:</strong> ${user._id}</p>
                    <p style="margin:0 0 8px;"><strong>Username:</strong> ${user.username || "Not set"}</p>
                    <p style="margin:0 0 8px;"><strong>Account Name:</strong> ${user.name || "Not set"}</p>
                    <p style="margin:0 0 16px;"><strong>Account Email:</strong> ${user.email || "Not set"}</p>
                    <p style="margin:0 0 8px;"><strong>Message:</strong></p>
                    <div style="white-space:pre-wrap;border:1px solid #d4d4d4;padding:12px;background:#f7f7f7;">${safeMessage
                    .replace(/&/g, "&amp;")
                    .replace(/</g, "&lt;")
                    .replace(/>/g, "&gt;")
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;")}</div>
                </div>
            `,
        });

        return res.status(200).json({
            success: true,
            message: "Support message sent successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to send support request"
        });
    }
};
