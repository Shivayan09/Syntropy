// Generation's calls to the syllabus service, over HTTP.
import { callService } from "./callService.js";

// The user's saved syllabus, or null.
export const getUserSyllabus = async (userId) => {
    const data = await callService("SYLLABUS_URL", "/internal/syllabus/user-syllabus", { userId });
    return data.syllabus;
};
