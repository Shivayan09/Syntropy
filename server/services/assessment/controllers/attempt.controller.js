import redis from "../../../common/redis.js";
import Attempt from "../models/attempt.model.js";
import { getUserTest } from "../../generation/client.js";
import { evaluateSubjective } from "../services/evaluateSubjective.service.js";

// The parts of a test an attempt keeps a copy of.
const toTestSnapshot = (test) => ({
    _id: test._id,
    title: test.title,
    type: test.type,
    category: test.category,
    aptitude: test.aptitude,
    testFormat: test.testFormat,
    difficulty: test.difficulty,
    subjects: test.subjects,
    duration: test.duration,
    totalQuestions: test.totalQuestions,
    totalMarks: test.totalMarks,
    questions: test.questions,
});

// Attempts started before snapshots existed get their copy the first time they are read.
const loadTestSnapshot = async (attempt) => {
    if (!attempt.testSnapshot) {
        const test = await getUserTest(attempt.test, attempt.user);
        if (!test) {
            return null;
        }
        attempt.testSnapshot = toTestSnapshot(test);
        await Attempt.updateOne({ _id: attempt._id }, { $set: { testSnapshot: attempt.testSnapshot } });
    }
    return attempt.testSnapshot;
};

// Responses keep the old shape: the test is under attempt.test, like the old populate("test").
const toResponse = (attempt) => {
    const plainAttempt = attempt.toObject({ minimize: false });
    plainAttempt.test = plainAttempt.testSnapshot;
    delete plainAttempt.testSnapshot;
    return plainAttempt;
};

const normalizeAttemptAnswers = (answers = []) => {
    return answers.map((entry) => {
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
};

const sanitizeQuestionForAttempt = (question = {}) => ({
    question: question.question,
    options: question.options,
    marks: question.marks,
    subject: question.subject,
    difficulty: question.difficulty,
    topic: question.topic,
});

const sanitizeAttemptForActiveSession = (attempt) => {
    const plainAttempt = toResponse(attempt);
    plainAttempt.answers = normalizeAttemptAnswers(plainAttempt.answers);

    if (plainAttempt.test?.questions) {
        plainAttempt.test.questions = plainAttempt.test.questions.map(sanitizeQuestionForAttempt);
    }

    return plainAttempt;
};

const serializeAttempt = (attempt) => {
    const plainAttempt = toResponse(attempt);
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
        const attempt = await Attempt.findOne({ _id: attemptId, user: userId });
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
        const test = await loadTestSnapshot(attempt);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found"
            });
        }
        const now = new Date();
        const endTime = new Date(attempt.startedAt.getTime() + attempt.duration * 60000);
        const isExpired = now > endTime;
        const submittedAnswers = Array.isArray(answers) ? answers : [];
        let answersFormatted = [];
        if (test.testFormat === "mcq") {
            let correct = 0, wrong = 0, skipped = 0;
            answersFormatted = buildMcqAnswers(test.questions, submittedAnswers);
            test.questions.forEach((q, i) => {
                const ans = answersFormatted[i]?.answer;
                if (ans === null) {
                    skipped++;
                } else if (ans === q.correctAnswer) {
                    correct++;
                } else {
                    wrong++;
                }
            });
            const total = test.questions.length;
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
            answersFormatted = buildSubjectiveAnswers(test.questions, submittedAnswers);
            attempt.set("answers", answersFormatted);
            attempt.totalMarks = test.totalMarks || test.questions.reduce((sum, question) => sum + (question.marks || 0), 0);
            const evaluation = await evaluateSubjective(test.questions, attempt.answers);
            let obtained = 0;
            evaluation.forEach((res, i) => {
                const marks = Math.min(res.marksAwarded || 0, test.questions[i].marks);
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
        // A new completed attempt changes the "My attempts" list.
        await redis.del("attempts:" + userId).catch(() => null);
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
        const attempt = await Attempt.findOne({ _id: attemptId, user: userId });
        if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Attempt not found"
            });
        }
        await loadTestSnapshot(attempt);
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
            attempt: attempt.status === "in_progress"
                ? sanitizeAttemptForActiveSession(attempt)
                : serializeAttempt(attempt)
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Unable to load attempt"
        });
    }
};

export const getMyAttempts = async (req, res, next) => {
    try {
        const cacheKey = `attempts:${req.user._id}`;
        const cachedAttempts = await redis.get(cacheKey);
        if (cachedAttempts) {
            return res.json({
                success: true,
                attempts: cachedAttempts,
                source: "cache",
            });
        }
        const attemptDocs = await Attempt.find({ user: req.user._id, status: "completed" }).sort({ createdAt: -1 });
        for (const attempt of attemptDocs) {
            await loadTestSnapshot(attempt);
        }
        const attempts = attemptDocs.map(toResponse);
        await redis.set(cacheKey, attempts, {ex: 60*60});
        return res.json({
            success: true,
            attempts,
            source: "database",
        });
    } catch (error) {
        next(error);
    }
};

export const startAttempt = async (req, res) => {
    try {
        const userId = req.user._id;
        const { testId } = req.body;
        const test = await getUserTest(testId, userId);
        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Test not found"
            });
        }
        const existing = await Attempt.findOne({ user: userId, test: testId, isFirstAttempt: true });
        const attempt = await Attempt.create({ user: userId, test: testId, testSnapshot: toTestSnapshot(test), duration: test.duration, startedAt: new Date(), status: "in_progress", isFirstAttempt: !existing });
        res.json({
            attemptId: attempt._id
        });
    } catch {
        res.status(500).json({
            success: false,
            message: "Unable to start attempt"
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
    } catch {
        res.status(500).json({
            success: false,
            message: "Unable to update attempt activity"
        });
    }
};
