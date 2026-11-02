// User's calls to the assessment service, over HTTP.
import { callService } from "./callService.js";

// Totals over the user's first attempt at each test, for their public profile. Null if they have none.
export const getUserAttemptStats = async (userId) => {
    const data = await callService("ASSESSMENT_URL", "/internal/assessment/user-attempt-stats", { userId });
    return data.stats;
};
