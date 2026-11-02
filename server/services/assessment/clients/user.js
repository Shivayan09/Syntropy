// Assessment's calls to the user service, over HTTP.
import { callService } from "./callService.js";

// Name, username and avatar of every user, for the leaderboard.
export const getPublicUsers = async () => {
    const data = await callService("USER_URL", "/internal/user/public-users");
    return data.users;
};
