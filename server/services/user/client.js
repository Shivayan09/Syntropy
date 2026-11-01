// How other services talk to user. Every call is an HTTP request to user's /internal routes.
import { callService, serviceUrl } from "../../common/internal.js";

const USER_URL = serviceUrl("USER_URL");

// { preferences } of the user, or null if they don't exist.
export const getUserPreferences = async (userId) => {
    const data = await callService(`${USER_URL}/internal/user/preferences`, { userId });
    return data.user;
};

// Name, username and avatar of every user, for the leaderboard.
export const getPublicUsers = async () => {
    const data = await callService(`${USER_URL}/internal/user/public-users`);
    return data.users;
};
