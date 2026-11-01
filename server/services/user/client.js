// What other services are allowed to ask the user service.
// Everything runs in one process for now, so these read the model directly.
// When services run as separate containers, these become HTTP calls to /internal/user.
import User from "./models/user.model.js";

export const getUserPreferences = (userId) => User.findById(userId).select("preferences").lean();

// Name, username and avatar of every user, for the leaderboard.
export const getPublicUsers = () => User.find().select("name username avatar").lean();
