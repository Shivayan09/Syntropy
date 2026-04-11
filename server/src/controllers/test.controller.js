import Test from "../models/test.model.js";
import { generateTest } from "../services/test.service.js";

export const createTest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, difficulty, duration, subjects, questions, type } = req.body;
        if (!title) {
            return res.status(400).json({
                success: false,
                message: "Title is required"
            });
        }
        if(subjects.length<1) {
            return res.status(400).json({
                success: false,
                message: "Enter atleast 1 subject"
            })
        }
        if (!questions || questions.length < 1) {
            return res.status(400).json({
                success: false,
                message: "At least 1 question is required"
            });
        }
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.question || !q.question.trim()) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} cannot be empty`
                });
            }
            if (!q.options || q.options.length < 2) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have options`
                });
            }
            for (let j = 0; j < q.options.length; j++) {
                if (!q.options[j] || !q.options[j].trim()) {
                    return res.status(400).json({
                        success: false,
                        message: `Option ${j + 1} in Question ${i + 1} cannot be empty`
                    });
                }
            }
            if (q.correctAnswer === undefined || q.correctAnswer === null || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                return res.status(400).json({
                    success: false,
                    message: `Question ${i + 1} must have a valid correct answer`
                });
            }
        }
        const test = await Test.create({ title, description, difficulty, duration, subjects, questions, totalQuestions: questions.length, createdBy: userId, type });
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
        const test = await Test.findById(req.params.id);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found"
            });
        }
        res.json({
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

export const getAllTests = async (req, res) => {
    try {
        const tests = await Test.find().select("-questions").sort({ createdAt: -1 });
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
        const test = await Test.findById(req.params.id).select("-questions.correctAnswer");
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
    try {
        const test = await generateTest(req.body, req.user._id);
        res.json({
            success: true,
            testId: test._id,
            data: test
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};