import Attempt from "../models/attempt.model.js";
import Test from "../models/test.model.js";

export const submitAttempt = async (req, res) => {
    try {
        const userId = req.user._id;
        const { attemptId, answers } = req.body;
        const attempt = await Attempt.findOne({ _id: attemptId, user: userId }).populate("test");
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }
        if (attempt.status !== "in_progress") {
            return res.status(400).json({
                success: false,
                message: "Attempt already submitted"
            });
        }
        const now = new Date();
        const endTime = new Date(
            attempt.startedAt.getTime() + attempt.duration * 60000
        );
        const isExpired = now > endTime;
        let correct = 0;
        let wrong = 0;
        let skipped = 0;
        attempt.test.questions.forEach((q, i) => {
            if (answers[i] === undefined) {
                skipped++;
            } else if (answers[i] === q.correctAnswer) {
                correct++;
            } else {
                wrong++;
            }
        });
        const total = attempt.test.questions.length;
        const accuracy = (correct / total) * 100;
        attempt.answers = answers;
        attempt.score = correct;
        attempt.correct = correct;
        attempt.wrong = wrong;
        attempt.skipped = skipped;
        attempt.accuracy = accuracy;
        attempt.status = isExpired ? "expired" : "completed";
        attempt.completedAt = now;
        await attempt.save();
        res.json({
            success: true,
            attemptId: attempt._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAttemptById = async (req, res) => {
    try {
        const userId = req.user._id;
        const attemptId = req.params.id;
        const attempt = await Attempt.findOne({ _id: attemptId, user: userId }).populate({ path: "test", select: "title subjects duration questions" });
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }
        if (attempt.status === "in_progress") {
            const now = new Date();
            const endTime = new Date(
                attempt.startedAt.getTime() + attempt.duration * 60000
            );
            if (now > endTime) {
                attempt.status = "expired";
                attempt.completedAt = endTime;
                await attempt.save();
            }
            else if (now - attempt.lastActiveAt > 2 * 60 * 1000) {
                attempt.status = "abandoned";
                await attempt.save();
            }
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
        const attempts = await Attempt.find({ user: req.user._id, status: "completed" }).populate("test", "title subjects duration").sort({ createdAt: -1 })
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

export const startAttempt = async (req, res) => {
    try {
        const userId = req.user._id;
        const { testId } = req.body;
        const test = await Test.findById(testId);
        if (!test) {
            return res.status(404).json({
                message: "Test not found"
            });
        }
        const existing = await Attempt.findOne({ user: userId, test: testId, isFirstAttempt: true });
        const attempt = await Attempt.create({
            user: userId,
            test: testId,
            duration: test.duration,
            startedAt: new Date(),
            status: "in_progress",
            isFirstAttempt: !existing
        });
        res.json({
            attemptId: attempt._id
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const heartbeatAttempt = async (req, res) => {
    try {
        const userId = req.user._id;
        const { attemptId } = req.body;
        const attempt = await Attempt.findOne({ _id: attemptId, user: userId });
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }
        if (attempt.status !== "in_progress") {
            return res.json({ success: true });
        }
        attempt.lastActiveAt = new Date();
        await attempt.save();
        res.json({
            success: true
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};