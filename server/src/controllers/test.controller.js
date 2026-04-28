import Test from "../models/test.model.js";
import User from "../models/user.model.js";
import { generateTest } from "../services/aiMcqTest.service.js";
import { generateSubjectiveTest } from "../services/aiSubjectiveTest.service.js";
import { buildAiTokenStatus, consumeAiCredit, refundAiCredit, syncAiTokens } from "../utils/aiToken.utils.js";
import { sanitizeSubjects } from "../utils/subjectValidation.js";
import { getTestNumber } from "../utils/testTitle.utils.js";

export const createTest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, difficulty, duration, subjects, questions, type, testFormat } = req.body;
        if (!["mcq", "subjective"].includes(testFormat)) {
            return res.status(400).json({ success: false, message: "Invalid test format" });
        }
        if (!title) {
            return res.status(400).json({ success: false, message: "Title is required" });
        }
        if (!subjects || subjects.length < 1) {
            return res.status(400).json({ success: false, message: "Enter atleast 1 subject" });
        }
        if (!questions || questions.length < 1) {
            return res.status(400).json({ success: false, message: "At least 1 question is required" });
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.question.trim()) {
                return res.status(400).json({ success: false, message: `Question ${i + 1} cannot be empty` });
            }
            if (testFormat === "mcq") {
                if (!q.options || q.options.length !== 4) {
                    return res.status(400).json({ success: false, message: `Question ${i + 1} must have exactly 4 options` });
                }
                for (let j = 0; j < 4; j++) {
                    if (!q.options[j] || !q.options[j].trim()) {
                        return res.status(400).json({ success: false, message: `Option ${j + 1} in Question ${i + 1} cannot be empty` });
                    }
                }
                if (q.correctAnswer === undefined || q.correctAnswer < 0 || q.correctAnswer >= 4) {
                    return res.status(400).json({ success: false, message: `Question ${i + 1} must have a valid correct answer` });
                }
            }
            if (testFormat === "subjective") {
                if (q.marks === undefined || q.marks <= 0) {
                    return res.status(400).json({ success: false, message: `Question ${i + 1} must have valid marks` });
                }
            }
        }
        const formattedQuestions = questions.map(q => ({ ...q }));
        const test = await Test.create({ title, description, difficulty, duration, subjects, questions: formattedQuestions, totalQuestions: formattedQuestions.length, createdBy: userId, type, testFormat, totalMarks: testFormat === "subjective" ? formattedQuestions.reduce((sum, q) => sum + q.marks, 0) : undefined });
        res.status(201).json({
            success: true,
            test
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTest = async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id });
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found"
            });
        }

        const responseTest = test.toObject();

        if (responseTest.type === "generated") {
            const testNumber = await getTestNumber(req.user._id, test);
            responseTest.title = `Test ${testNumber}`;
        }

        res.json({
            success: true,
            test: responseTest
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllTests = async (req, res) => {
    try {
        const tests = await Test.find({ createdBy: req.user._id }).select("-questions").sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            tests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getTestForAttempt = async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id }).select("-questions.correctAnswer");
        res.status(200).json({
            success: true,
            test
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const aiTest = async (req, res) => {
    let user;
    let creditSource = null;

    try {
        const userId = req.user._id;
        const { subjects: rawSubjects } = req.body;
        const { subjects, invalidSubjects } = sanitizeSubjects(rawSubjects);

        if (!subjects.length) {
            return res.status(400).json({
                success: false,
                message: "Enter at least 1 valid subject"
            });
        }

        if (invalidSubjects.length) {
            return res.status(400).json({
                success: false,
                message: `Invalid subject${invalidSubjects.length > 1 ? "s" : ""}: ${invalidSubjects.join(", ")}`
            });
        }

        req.body.subjects = subjects;
        user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        await syncAiTokens(user);
        creditSource = await consumeAiCredit(user);
        if (!creditSource) {
            return res.status(403).json({
                success: false,
                message: "No AI test credits left right now. You can still create unlimited manual tests.",
                aiTokenStatus: buildAiTokenStatus(user)
            });
        }
        let test;
        if (req.body.testFormat === "subjective") {
            test = await generateSubjectiveTest(req.body, userId);
        } else {
            test = await generateTest(req.body, userId);
        }
        return res.status(200).json({
            success: true,
            testId: test._id,
            data: test,
            aiTokenStatus: buildAiTokenStatus(user)
        });
    } catch (err) {
        if (user && creditSource) {
            await refundAiCredit(user, creditSource);
        }

        return res.status(500).json({
            success: false,
            message: err.message,
            aiTokenStatus: user ? buildAiTokenStatus(user) : undefined
        });
    }
};
