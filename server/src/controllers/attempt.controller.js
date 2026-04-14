import Attempt from "../models/attempt.model.js";
import Test from "../models/test.model.js";

export const submitAttempt = async (req, res) => {
    try {
        const userId = req.user._id;
        const { testId, answers } = req.body;
        const test = await Test.findById(testId);
        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        test.questions.forEach((q, i) => {
            if (answers[i] === undefined) {
                skipped++;
            }
            else if (answers[i] === q.correctAnswer) {
                correct++;
            }
            else {
                wrong++;
            }
        });
        const score = correct;
        const accuracy = (correct / test.questions.length) * 100;
        const existing = await Attempt.findOne({
            user: userId,
            test: testId,
            isFirstAttempt: true
        });
        const attempt = await Attempt.create({ user: userId, test: testId, answers, score, correct, wrong, skipped, accuracy, status: "completed", isFirstAttempt: !existing });
        res.json({ attemptId: attempt._id });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAttemptById = async (req, res) => {
    try {
        const attempt = await Attempt.findOne({ _id: req.params.id, user: req.user._id }).populate({ path: "test", select: "title subjects duration questions" });
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }
        res.json({
            success: true,
            attempt
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getMyAttempts = async (req, res) => {
    try {
        const attempts = await Attempt.find({ user: req.user._id }).populate("test", "title subjects duration").sort({ createdAt: -1 })
        res.json({
            success: true,
            attempts
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};