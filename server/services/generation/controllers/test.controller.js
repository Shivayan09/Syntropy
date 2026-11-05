import redis from "../redis.js";
import Test from "../models/test.model.js";
import { generateTest } from "../services/aiMcqTest.service.js";
import { generateSubjectiveTest } from "../services/aiSubjectiveTest.service.js";
import { findInvalidSubjects } from "../services/subjectCheck.service.js";
import { describeAiError } from "../utils/aiError.utils.js";
import { consumeCredit, refundCredit } from "../clients/billing.js";
import { sanitizeSubjects } from "../utils/subjectValidation.utils.js";
import { invalidateTestListCache } from "../utils/testCache.utils.js";
import { getGeneratedTestTitle } from "../utils/testTitle.utils.js";

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
        await invalidateTestListCache(userId);
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
            responseTest.title = await getGeneratedTestTitle(req.user._id, test);
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
        const category = req.query.category === "aptitude" || req.query.category === "academic" ? req.query.category : null;
        const cacheKey = category ? `tests:${req.user._id}:${category}` : `tests:${req.user._id}`;
        const cachedTests = await redis.get(cacheKey);
        if (cachedTests) {
            return res.status(200).json({
                success: true,
                tests: cachedTests,
                cached: true,
            });
        }
        const query = { createdBy: req.user._id };
        if (category === "aptitude") {
            query.category = "aptitude";
        } else if (category === "academic") {
            query.category = { $ne: "aptitude" };
        }
        const tests = await Test.find(query).select("-questions").sort({ createdAt: -1 });
        await redis.set(cacheKey, tests, { ex: 60 * 60 });
        res.status(200).json({
            success: true,
            tests,
            cached: false,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getTestForAttempt = async (req, res) => {
    try {
        const cacheKey = `test:${req.user._id}:${req.params.id}`;
        const cachedTest = await redis.get(cacheKey);
        if (cachedTest) {
            return res.status(200).json({
                success: true,
                test: cachedTest,
                cached: true,
            });
        }
        const test = await Test.findOne({ _id: req.params.id, createdBy: req.user._id }).select("-questions.correctAnswer");
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found",
            });
        }
        await redis.set(cacheKey, test, { ex: 60 * 60 });
        res.status(200).json({
            success: true,
            test,
            cached: false,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const aiTest = async (req, res) => {
    const userId = req.user._id;
    let creditSource = null;
    try {
        const { subjects: rawSubjects } = req.body;
        const { subjects, invalidSubjects: malformedSubjects } = sanitizeSubjects(rawSubjects);
        if (!subjects.length) {
            return res.status(400).json({
                success: false,
                message: "Enter at least 1 valid subject"
            });
        }
        // Basic checks first, so the AI is only asked about names that look fine.
        const invalidSubjects = malformedSubjects.length
            ? malformedSubjects
            : await findInvalidSubjects(subjects, userId);
        if (invalidSubjects.length) {
            return res.status(400).json({
                success: false,
                message: `Invalid subject${invalidSubjects.length > 1 ? "s" : ""}: ${invalidSubjects.join(", ")}`
            });
        }
        req.body.subjects = subjects;
        const credit = await consumeCredit(userId, req.user.email);
        creditSource = credit.creditSource;
        if (!creditSource) {
            return res.status(403).json({
                success: false,
                message: "No AI test credits left right now. You can still create unlimited manual tests.",
                aiTokenStatus: credit.aiTokenStatus
            });
        }
        let test;
        if (req.body.testFormat === "subjective") {
            test = await generateSubjectiveTest(req.body, userId);
        } else {
            test = await generateTest(req.body, userId);
        }
        await invalidateTestListCache(userId);
        return res.status(200).json({
            success: true,
            testId: test._id,
            data: test,
            aiTokenStatus: credit.aiTokenStatus
        });
    } catch (err) {
        const aiTokenStatus = creditSource ? await refundCredit(userId, req.user.email, creditSource) : undefined;
        return res.status(500).json({
            success: false,
            message: describeAiError(err),
            aiTokenStatus
        });
    }
};
