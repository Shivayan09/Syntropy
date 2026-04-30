import User from "../models/user.model.js";

export const getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      {
        $lookup: {
          from: "attempts",
          localField: "_id",
          foreignField: "user",
          as: "attempts"
        }
      },
      {
        $addFields: {
          firstAttempts: {
            $filter: {
              input: "$attempts",
              as: "a",
              cond: { $eq: ["$$a.isFirstAttempt", true] }
            }
          }
        }
      },
      {
        $addFields: {
          avgAccuracy: { $avg: "$firstAttempts.accuracy" },
          avgScore: { $avg: "$firstAttempts.score" },
          testsTaken: { $size: "$firstAttempts" }
        }
      },
      {
        $sort: {
          avgAccuracy: -1
        }
      },
      {
        $project: {
          _id: 1,
          name: 1,
          username: 1,
          avatar: 1,
          avgAccuracy: { $ifNull: ["$avgAccuracy", 0] },
          avgScore: { $ifNull: ["$avgScore", 0] },
          testsTaken: 1
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