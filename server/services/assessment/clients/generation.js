// Assessment's calls to the generation service, over HTTP.
import { callService } from "./callService.js";

// The full test, including answers, or null if the user doesn't own it.
export const getUserTest = async (testId, userId) => {
    const data = await callService("GENERATION_URL", "/internal/generation/user-test", { testId, userId });
    return data.test;
};

export const getUserAptitudeTests = async (userId) => {
    const data = await callService("GENERATION_URL", "/internal/generation/user-aptitude-tests", { userId });
    return data.tests;
};
