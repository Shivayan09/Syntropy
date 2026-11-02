// Generation's calls to the user service, over HTTP.
import { callService } from "./callService.js";

// { preferences } of the user, or null if they don't exist.
export const getUserPreferences = async (userId) => {
    const data = await callService("USER_URL", "/internal/user/preferences", { userId });
    return data.user;
};
