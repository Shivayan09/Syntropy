import Attempt from "../models/attempt.model.js";
import Test from "../models/test.model.js";
import User from "../models/user.model.js";
import {
    APTITUDE_PRESETS,
    MAX_APTITUDE_DURATION,
    MAX_APTITUDE_QUESTIONS,
    MIN_APTITUDE_DURATION,
    MIN_APTITUDE_QUESTIONS,
    buildAptitudeCatalog,
    getAptitudeSection,
    getCompanyTarget,
    sanitizeSections,
    sanitizeTopics
} from "../config/aptitude.js";
import { generateAptitudeTest } from "../services/aiAptitudeTest.service.js";
import { describeAiError } from "../utils/aiError.utils.js";
import { buildAiTokenStatus, consumeAiCredit, refundAiCredit, syncAiTokens } from "../utils/aiToken.utils.js";
import { invalidateTestListCache } from "../utils/testCache.utils.js";
import { getGeneratedTestTitle } from "../utils/testTitle.utils.js";

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getAptitudeCatalog = async (_req, res) => {
    try {
        res.status(200).json({
            success: true,
            catalog: buildAptitudeCatalog()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAptitudeTests = async (req, res) => {
    try {
        const tests = await Test.find({ createdBy: req.user._id, category: "aptitude" })
            .select("-questions")
            .sort({ createdAt: -1 });

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

export const getAptitudeStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const aptitudeTests = await Test.find({ createdBy: userId, category: "aptitude" })
            .select("_id questions aptitude")
            .lean();

        if (!aptitudeTests.length) {
            return res.status(200).json({
                success: true,
                stats: {
                    setsGenerated: 0,
                    attempts: 0,
                    questionsSolved: 0,
                    accuracy: 0,
                    bestAccuracy: 0,
                    sections: [],
                    topics: [],
                    weakTopics: [],
                    recent: []
                }
            });
        }

        const testMap = new Map(aptitudeTests.map((test) => [String(test._id), test]));

        const attempts = await Attempt.find({
            user: userId,
            status: { $in: ["completed", "expired"] },
            test: { $in: aptitudeTests.map((test) => test._id) }
        })
            .select("test answers accuracy obtainedMarks totalMarks createdAt")
            .sort({ createdAt: -1 })
            .lean();

        const sectionMap = new Map();
        const topicMap = new Map();

        let totalAnswered = 0;
        let totalCorrect = 0;
        let bestAccuracy = 0;

        for (const attempt of attempts) {
            const test = testMap.get(String(attempt.test));
            if (!test) continue;

            bestAccuracy = Math.max(bestAccuracy, attempt.accuracy || 0);

            (test.questions || []).forEach((question, index) => {
                const entry = attempt.answers?.[index];
                const answer = typeof entry === "number" ? entry : entry?.answer;
                if (answer === null || answer === undefined) return;

                const isCorrect = answer === question.correctAnswer;
                totalAnswered += 1;
                if (isCorrect) totalCorrect += 1;

                const sectionName = question.subject || "Aptitude";
                const section = sectionMap.get(sectionName) || { name: sectionName, attempted: 0, correct: 0 };
                section.attempted += 1;
                if (isCorrect) section.correct += 1;
                sectionMap.set(sectionName, section);

                if (!question.topic) return;
                const topic = topicMap.get(question.topic) || { name: question.topic, section: sectionName, attempted: 0, correct: 0 };
                topic.attempted += 1;
                if (isCorrect) topic.correct += 1;
                topicMap.set(question.topic, topic);
            });
        }

        const withAccuracy = (entry) => ({
            ...entry,
            accuracy: entry.attempted ? Math.round((entry.correct / entry.attempted) * 100) : 0
        });

        const sections = [...sectionMap.values()].map(withAccuracy).sort((a, b) => b.attempted - a.attempted);
        const topics = [...topicMap.values()].map(withAccuracy).sort((a, b) => b.attempted - a.attempted);

        const weakTopics = topics
            .filter((topic) => topic.attempted >= 2 && topic.accuracy < 60)
            .sort((a, b) => a.accuracy - b.accuracy)
            .slice(0, 5);

        const recent = attempts.slice(0, 5).map((attempt) => ({
            attemptId: attempt._id,
            testId: attempt.test,
            accuracy: Math.round(attempt.accuracy || 0),
            obtainedMarks: attempt.obtainedMarks || 0,
            totalMarks: attempt.totalMarks || 0,
            createdAt: attempt.createdAt
        }));

        res.status(200).json({
            success: true,
            stats: {
                setsGenerated: aptitudeTests.length,
                attempts: attempts.length,
                questionsSolved: totalAnswered,
                accuracy: totalAnswered ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
                bestAccuracy: Math.round(bestAccuracy),
                sections,
                topics,
                weakTopics,
                recent
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAptitudePracticeSet = async (req, res) => {
    try {
        const test = await Test.findOne({
            _id: req.params.id,
            createdBy: req.user._id,
            category: "aptitude"
        });

        if (!test) {
            return res.status(404).json({
                success: false,
                message: "Aptitude set not found"
            });
        }

        const responseTest = test.toObject();

        if (responseTest.type === "generated") {
            responseTest.title = await getGeneratedTestTitle(req.user._id, test);
        }

        res.status(200).json({
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

export const generateAptitudeSet = async (req, res) => {
    let user;
    let creditSource = null;

    try {
        const userId = req.user._id;
        const { presetKey } = req.body;

        const preset = presetKey ? APTITUDE_PRESETS.find((item) => item.key === presetKey) : null;

        if (presetKey && !preset) {
            return res.status(400).json({
                success: false,
                message: "Invalid practice preset"
            });
        }

        const source = preset
            ? { ...preset, questions: preset.questions, duration: preset.duration }
            : req.body;

        const sections = sanitizeSections(source.sections);

        if (!sections.length) {
            return res.status(400).json({
                success: false,
                message: "Select at least 1 aptitude section"
            });
        }

        const topics = sanitizeTopics(sections, source.topics);

        const topicsBySection = sections.reduce((acc, sectionKey) => {
            const sectionTopics = getAptitudeSection(sectionKey)?.topics || [];
            acc[sectionKey] = topics.filter((topic) => sectionTopics.includes(topic));
            return acc;
        }, {});

        const sectionsWithoutTopics = sections.filter((sectionKey) => !topicsBySection[sectionKey].length);

        if (topics.length && sectionsWithoutTopics.length === sections.length) {
            return res.status(400).json({
                success: false,
                message: "Selected topics do not belong to the selected sections"
            });
        }

        const difficulty = DIFFICULTIES.includes(source.difficulty) ? source.difficulty : "Medium";
        const questions = clamp(
            Number.isFinite(Number(source.questions)) ? Math.round(Number(source.questions)) : 20,
            MIN_APTITUDE_QUESTIONS,
            MAX_APTITUDE_QUESTIONS
        );
        const time = clamp(
            Number.isFinite(Number(source.duration ?? source.time)) ? Math.round(Number(source.duration ?? source.time)) : 20,
            MIN_APTITUDE_DURATION,
            MAX_APTITUDE_DURATION
        );

        if (questions < sections.length) {
            return res.status(400).json({
                success: false,
                message: "Add more questions or fewer sections so every section gets at least 1 question"
            });
        }

        const company = getCompanyTarget(source.company)?.key || "general";

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

        const test = await generateAptitudeTest(
            {
                sections,
                topicsBySection,
                allTopics: topics,
                difficulty,
                questions,
                time,
                company,
                targetRole: user.preferences?.targetRole
            },
            userId
        );

        await invalidateTestListCache(userId);

        return res.status(200).json({
            success: true,
            testId: test._id,
            data: test,
            aiTokenStatus: buildAiTokenStatus(user)
        });
    } catch (error) {
        if (user && creditSource) {
            await refundAiCredit(user, creditSource);
        }

        return res.status(500).json({
            success: false,
            message: describeAiError(error),
            aiTokenStatus: user ? buildAiTokenStatus(user) : undefined
        });
    }
};
