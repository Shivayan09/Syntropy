import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    marks: { type: Number, default: 1 },
    expectedAnswer: { type: String, default: "" },
    keyPoints: { type: [String], default: [] },
    options: { type: [String], validate: { validator: function (v) { return this.ownerDocument().testFormat === "mcq" ? v && v.length === 4 : true; } } },
    correctAnswer: { type: Number, validate: { validator: function (v) { return this.ownerDocument().testFormat === "mcq" ? v !== undefined && v >= 0 && v < 4 : true; } } },
    explanation: { type: String, default: "" },
    subject: { type: String, default: null },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    topic: String
});

const testSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["generated", "manual"], required: true },
    testFormat: { type: String, enum: ["mcq", "subjective"], required: true },
    totalMarks: { type: Number },
    markDistribution: [{ marks: Number, count: Number }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"] },
    subjects: { type: [String], default: [] },
    totalQuestions: { type: Number, required: true },
    duration: { type: Number, required: true },
    questions: [questionSchema],
    isPublished: { type: Boolean, default: true },
    attemptsCount: { type: Number, default: 0 },
    avgScore: { type: Number, default: 0 },
    tags: [String]
}, { timestamps: true });

const Test = mongoose.model("Test", testSchema);
export default Test;