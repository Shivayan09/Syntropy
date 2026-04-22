import cloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";
import validator from 'validator'
import { buildAiTokenStatus, syncAiTokens } from "../utils/aiToken.utils.js";

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
            message: error.message
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, username, phoneNumber, email, college, semester, preferences, onboardingCompleted } = req.body;
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
            const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
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
                })
            }
            if (name.length > 50) {
                return res.status(400).json({
                    success: false,
                    message: "Name is too long (50 chars max)"
                })
            }
            updateData.name = name;
        }
        if (username !== undefined) {
            if (username.length < 3) {
                return res.status(400).json({
                    success: false,
                    message: "Username is too short (3 chars min)"
                })
            }
            if (username.length > 30) {
                return res.status(400).json({
                    success: false,
                    message: "Username is too long (30 chars max)"
                })
            }
            updateData.username = username;
        }
        if (phoneNumber !== undefined) {
            if (!validator.isMobilePhone(phoneNumber, "any")) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid phone number!"
                })
            }
            updateData.phoneNumber = phoneNumber;
        }
        if (email !== undefined) {
            if (!validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please enter a valid email!"
                })
            }
            updateData.email = email;
        }
        if (college !== undefined) {
            if (college.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: "College name is too short (2 chars min)"
                })
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
            message: error.message
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
            message: error.message,
        });
    }
};
