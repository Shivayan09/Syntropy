import Attempt from "../models/attempt.model.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Attempt.aggregate([
      {
        $match: {
          isFirstAttempt: true
        }
      },
      {
        $group: {
          _id: "$user",
          avgAccuracy: { $avg: "$accuracy" },
          avgScore: { $avg: "$score" },
          testsTaken: { $sum: 1 }
        }
      },
      {
        $sort: {
          avgAccuracy: -1
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          avgAccuracy: 1,
          avgScore: 1,
          testsTaken: 1,
          name: "$user.name",
          username: "$user.username",
          avatar: "$user.avatar"
        }
      }
    ]);

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
