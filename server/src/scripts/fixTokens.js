import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/mongodb.js";
import User from "../models/user.model.js";

const run = async () => {
    try {
        await connectDB();
        console.log("MongoDB connected");
        const result = await User.updateMany(
            {},
            {
                $set: {
                    aiTokens: 0,
                    bonusAiTokens: 0,
                    freeAiTestsUsed: 0,
                }
            }
        );
        console.log("Updated users:", result.modifiedCount);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

run();
