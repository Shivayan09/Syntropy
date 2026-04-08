import Test from "../models/test.model.js";


export const createTest = async (req, res) => {
    try {
        const userId = req.user._id;
        const { title, description, difficulty, duration, subjects, questions, type } = req.body;
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