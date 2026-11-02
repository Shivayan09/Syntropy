import Attempt from "../models/attempt.model.js";
import { getUserAptitudeTests } from "../clients/generation.js";

export const getAptitudeStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const aptitudeTests = await getUserAptitudeTests(userId);

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
