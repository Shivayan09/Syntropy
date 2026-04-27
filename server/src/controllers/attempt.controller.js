import Attempt from "../models/attempt.model.js";
import Test from "../models/test.model.js";
import { evaluateSubjective } from "../services/evaluateSubjective.service.js";

const normalizeAttemptAnswers = (answers = []) => {
    answers.map((entry) => {
        if (typeof entry === "number" || entry === null || entry === undefined) {
            return {
                answer: entry ?? null,
                marksAwarded: 0,
                feedback: ""
            };
        }
        return {
            answer: entry?.answer ?? null,
            marksAwarded: entry?.marksAwarded ?? 0,
            feedback: entry?.feedback ?? ""
        };
    });
}

const serializeAttempt = (attempt) => {
    const plainAttempt = attempt.toObject({ minimize: false });
    plainAttempt.answers = normalizeAttemptAnswers(plainAttempt.answers);
    return plainAttempt;
};

const buildMcqAnswers = (questions = [], submittedAnswers = []) =>
    questions.map((question, index) => {
        const rawAnswer = submittedAnswers[index];
        const selectedAnswer = typeof rawAnswer === "number" ? rawAnswer : null;
        return {
            answer: selectedAnswer,
            marksAwarded: selectedAnswer !== null && selectedAnswer === question.correctAnswer ? 1 : 0,
            feedback: ""
        };
    });

const buildSubjectiveAnswers = (questions = [], submittedAnswers = []) =>
    questions.map((_, index) => ({
        answer: typeof submittedAnswers[index] === "string" ? submittedAnswers[index].trim() : "",
        marksAwarded: 0,
        feedback: ""
    }));

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
        const endTime = new Date(attempt.startedAt.getTime() + attempt.duration * 60000);
        const isExpired = now > endTime;
        const submittedAnswers = Array.isArray(answers) ? answers : [];
        let answersFormatted = [];
        if (attempt.test.testFormat === "mcq") {
            let correct = 0, wrong = 0, skipped = 0;
            answersFormatted = buildMcqAnswers(attempt.test.questions, submittedAnswers);
            attempt.test.questions.forEach((q, i) => {
                const ans = answersFormatted[i]?.answer;
                if (ans === null) {
                    skipped++;
                } else if (ans === q.correctAnswer) {
                    correct++;
                } else {
                    wrong++;
                }
            });
            const total = attempt.test.questions.length;
            const accuracy = (correct / total) * 100;
            attempt.set("answers", answersFormatted);
            attempt.score = correct;
            attempt.correct = correct;
            attempt.wrong = wrong;
            attempt.skipped = skipped;
            attempt.accuracy = accuracy;
            attempt.totalMarks = total;
            attempt.obtainedMarks = correct;
            attempt.markModified("answers");
        }
        else {
            answersFormatted = buildSubjectiveAnswers(attempt.test.questions, submittedAnswers);
            attempt.set("answers", answersFormatted);
            attempt.totalMarks = attempt.test.totalMarks || attempt.test.questions.reduce((sum, question) => sum + (question.marks || 0), 0);
            const evaluation = await evaluateSubjective(attempt);
            let obtained = 0;
            evaluation.forEach((res, i) => {
                const marks = Math.min(res.marksAwarded || 0, attempt.test.questions[i].marks);
                attempt.answers[i].marksAwarded = marks;
                attempt.answers[i].feedback = res.feedback || "";
                obtained += marks;
            });
            attempt.obtainedMarks = obtained;
            attempt.score = obtained;
            attempt.correct = 0;
            attempt.wrong = 0;
            attempt.skipped = answersFormatted.filter((entry) => !entry.answer).length;
            attempt.accuracy = attempt.totalMarks > 0 ? (obtained / attempt.totalMarks) * 100 : 0;
            attempt.markModified("answers");
        }
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
        const attempt = await Attempt.findOne({ _id: attemptId, user: userId }).populate({ path: "test", select: "title subjects duration questions testFormat totalMarks" });
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }
        if (attempt.status === "in_progress") {
            const now = new Date();
            const endTime = new Date(attempt.startedAt.getTime() + attempt.duration * 60000);
            if (now > endTime) {
                attempt.status = "expired";
                attempt.completedAt = endTime;
                await attempt.save();
            } else if (now - attempt.lastActiveAt > 2 * 60 * 1000) {
                attempt.status = "abandoned";
                await attempt.save();
            }
        }
        return res.json({
            success: true,
            attempt: serializeAttempt(attempt)
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
        const attempts = await Attempt.find({ user: req.user._id, status: "completed" }).populate("test", "title subjects duration difficulty totalQuestions type questions").sort({ createdAt: -1 })
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
                success: false,
                message: "Test not found"
            });
        }
        const existing = await Attempt.findOne({ user: userId, test: testId, isFirstAttempt: true });
        const attempt = await Attempt.create({ user: userId, test: testId, duration: test.duration, startedAt: new Date(), status: "in_progress", isFirstAttempt: !existing });
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
            return res.json({
                success: true
            });
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
