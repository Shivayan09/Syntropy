import mongoose from "mongoose";

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    completed: { type: Boolean, default: false },
    weight: { type: Number, default: 1 }
});

const unitSchema = new mongoose.Schema({
    title: { type: String, required: true },
    topics: [topicSchema]
});

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String }, // optional (like ECE181601)
    units: [unitSchema]
});

const syllabusSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true },
    fileUrl: { type: String },
    fileType: { type: String, enum: ["pdf", "image"] },
    rawText: { type: String },
    subjects: [subjectSchema],
    source: { type: String, enum: ["upload", "manual", "ai"], default: "upload" },
    parsed: { type: Boolean, default: false }
},
    { timestamps: true }
);

const Syllabus = mongoose.model("Syllabus", syllabusSchema);
export default Syllabus;