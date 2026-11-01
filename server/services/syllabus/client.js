// How other services talk to syllabus. Every call is an HTTP request to syllabus's /internal routes.
import { callService, serviceUrl } from "../../common/internal.js";

const SYLLABUS_URL = serviceUrl("SYLLABUS_URL");

// The user's saved syllabus, or null.
export const getUserSyllabus = async (userId) => {
    const data = await callService(`${SYLLABUS_URL}/internal/syllabus/user-syllabus`, { userId });
    return data.syllabus;
};
