import Attempt from "../models/attempt.model.js";
import { getPublicUsers } from "../../user/client.js";

// Ranks every user by the average accuracy of their first attempt at each test.
// Users who haven't attempted anything are listed last with zeros.
export const getLeaderboard = async (req, res) => {
  try {
    const [stats, users] = await Promise.all([
      Attempt.aggregate([
        { $match: { isFirstAttempt: true } },
        { $group: { _id: "$user", avgAccuracy: { $avg: "$accuracy" }, avgScore: { $avg: "$score" }, testsTaken: { $sum: 1 } } },
      ]),
      getPublicUsers(),
    ]);

    const statsByUser = new Map(stats.map((entry) => [String(entry._id), entry]));

    const leaderboard = users.map((user) => {
      const entry = statsByUser.get(String(user._id));
      return {
        _id: user._id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        avgAccuracy: entry?.avgAccuracy ?? 0,
        avgScore: entry?.avgScore ?? 0,
        testsTaken: entry?.testsTaken ?? 0,
      };
    });

    leaderboard.sort((a, b) => {
      if (a.testsTaken === 0 || b.testsTaken === 0) {
        return b.testsTaken - a.testsTaken;
      }
      return b.avgAccuracy - a.avgAccuracy;
    });

    res.json({
      success: true,
      users: leaderboard
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
