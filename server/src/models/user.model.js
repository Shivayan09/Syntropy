import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, minLength: 2, maxLength: 50 },
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true, minlength: 3, maxlength: 30 },
    phoneNumber: { type: String, minlength: 10 },
    avatar: { type: String, default: "" },
    avatarPublicId: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: function () { return !this.googleId }, minlength: 6, select: false },
    googleId: { type: String, unique: true, sparse: true },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    college: { type: String, trim: true, minLength: 2 },
    semester: { type: Number, min: 1, max: 8 },
    preferences: {
        type: {
            subjects: { type: [String], default: [] },
            difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
            questionsPerTest: { type: Number, default: 20 },
            targetRole: { type: String }
        },
        default: {}
    },
    stats: {
        type: {
            testsTaken: { type: Number, default: 0 },
            avgScore: { type: Number, default: 0 },
            bestScore: { type: Number, default: 0 },
            totalQuestionsSolved: { type: Number, default: 0 },
            accuracy: { type: Number, min: 0, max: 100, default: 0 }
        },
        default: {}
    },
    analytics: {
        type: {
            weakSubjects: { type: [String], default: [] },
            strongSubjects: { type: [String], default: [] },
            lastActive: { type: Date }
        },
        default: {}
    },
    streak: {
        type: {
            current: { type: Number, default: 0 },
            longest: { type: Number, default: 0 },
            lastTestDate: { type: Date }
        },
        default: {}
    },
    attempts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Attempt" }],
},
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;