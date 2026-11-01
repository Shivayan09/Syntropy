// What other services are allowed to ask the assessment service.
// Everything runs in one process for now, so this reads the model directly.
// When services run as separate containers, this becomes an HTTP call to /internal/assessment.
import Attempt from "./models/attempt.model.js";

// Totals over the user's first attempt at each test, for their public profile. Null if they have none.
export const getUserAttemptStats = async (userId) => {
    const [stats] = await Attempt.aggregate([
        { $match: { user: userId, isFirstAttempt: true } },
        {
            $group: {
                _id: null,
                testsAttempted: { $sum: 1 },
                averageAccuracy: { $avg: "$accuracy" },
                averageScore: { $avg: "$score" },
                bestScore: { $max: "$score" },
                totalQuestionsSolved: { $sum: { $add: ["$correct", "$wrong", "$skipped"] } },
                totalCorrect: { $sum: "$correct" },
                totalWrong: { $sum: "$wrong" },
                totalSkipped: { $sum: "$skipped" }
            }
        }
    ]);
    return stats || null;
};
