import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
        test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true, index: true },
        isFirstAttempt: { type: Boolean, default: false },
        answers: { type: [Number], default: [] },
        score: { type: Number, default: 0 },
        correct: { type: Number, default: 0 },
        wrong: { type: Number, default: 0 },
        skipped: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        startedAt: { type: Date, default: Date.now },
        submittedAt: { type: Date },
        timeTaken: { type: Number },
        status: { type: String, enum: ["in-progress", "completed"], default: "in-progress" }
    },
    { timestamps: true }
);

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;