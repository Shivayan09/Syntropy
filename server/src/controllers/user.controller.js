import User from "../models/user.model.js";

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { name, username, phoneNumber, email, college, semester, preferences } = req.body;
        const existingUsername = await User.findOne({ username, _id: { $ne: userId } });
        if (existingUsername) {
            return res.status(400).json({
                success: false,
                message: "Username is already taken"
            });
        }
        const existingEmail = await User.findOne({ email, _id: { $ne: userId } });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already in use"
            });
        }
        const updateData = { name, username, phoneNumber, email, college, semester, };
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