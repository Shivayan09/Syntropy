import mongoose from "mongoose";

const attemptSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    test: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    // Copy of the test taken when the attempt starts, so grading never depends on the generation service.
    testSnapshot: { type: mongoose.Schema.Types.Mixed },
    isFirstAttempt: { type: Boolean, default: false },
    answers: { type: [mongoose.Schema.Types.Mixed], default: [] },
    totalMarks: { type: Number, default: 0 },
    obtainedMarks: { type: Number, default: 0 },
    score: { type: Number, default: 0 },
    correct: { type: Number, default: 0 },
    wrong: { type: Number, default: 0 },
    skipped: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    duration: { type: Number, required: true },
    lastActiveAt: { type: Date, default: Date.now },
    status: { type: String, enum: ["in_progress", "completed", "expired", "abandoned"], default: "in_progress" }
},
    { timestamps: true, minimize: false }
);

const Attempt = mongoose.model("Attempt", attemptSchema);
export default Attempt;
