import Test from "../models/test.model.js";
import { getUserPreferences } from "../clients/user.js";
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
import { consumeCredit, refundCredit } from "../clients/billing.js";
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
    const userId = req.user._id;
    let creditSource = null;

    try {
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

        const user = await getUserPreferences(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const credit = await consumeCredit(userId, req.user.email);
        creditSource = credit.creditSource;

        if (!creditSource) {
            return res.status(403).json({
                success: false,
                message: "No AI test credits left right now. You can still create unlimited manual tests.",
                aiTokenStatus: credit.aiTokenStatus
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
            aiTokenStatus: credit.aiTokenStatus
        });
    } catch (error) {
        const aiTokenStatus = creditSource ? await refundCredit(userId, req.user.email, creditSource) : undefined;

        return res.status(500).json({
            success: false,
            message: describeAiError(error),
            aiTokenStatus
        });
    }
};
