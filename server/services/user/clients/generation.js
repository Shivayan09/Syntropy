// User's calls to the generation service, over HTTP.
import { callService } from "./callService.js";

export const countUserTests = async (userId) => {
    const data = await callService("GENERATION_URL", "/internal/generation/count-user-tests", { userId });
    return data.count;
};
