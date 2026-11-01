import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minLength: 2, maxLength: 50 },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    phoneNumber: { type: String, minlength: 10 },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: function () { return !this.googleId }, minlength: 6, select: false },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
    emailVerified: { type: Boolean, default: false },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    college: { type: String, trim: true, minLength: 2 },
    semester: { type: Number, min: 1, max: 8 },
    onboardingCompleted: { type: Boolean, default: false },
    termsAcceptedAt: { type: Date },
    preferences: {
        type: {
            subjects: { type: [String], default: [] },
            difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
            questionsPerTest: { type: Number, default: 20 },
            targetRole: { type: String }
        },
        default: {}
    },
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
