// How other services talk to assessment. Every call is an HTTP request to assessment's /internal routes.
import { callService, serviceUrl } from "../../common/internal.js";

const ASSESSMENT_URL = serviceUrl("ASSESSMENT_URL");

// Totals over the user's first attempt at each test, for their public profile. Null if they have none.
export const getUserAttemptStats = async (userId) => {
    const data = await callService(`${ASSESSMENT_URL}/internal/assessment/user-attempt-stats`, { userId });
    return data.stats;
};
