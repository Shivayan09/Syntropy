// How other services talk to generation. Every call is an HTTP request to generation's /internal routes.
import { callService, serviceUrl } from "../../common/internal.js";

const GENERATION_URL = serviceUrl("GENERATION_URL");

// The full test, including answers, or null if the user doesn't own it.
export const getUserTest = async (testId, userId) => {
    const data = await callService(`${GENERATION_URL}/internal/generation/user-test`, { testId, userId });
    return data.test;
};

export const countUserTests = async (userId) => {
    const data = await callService(`${GENERATION_URL}/internal/generation/count-user-tests`, { userId });
    return data.count;
};

export const getUserAptitudeTests = async (userId) => {
    const data = await callService(`${GENERATION_URL}/internal/generation/user-aptitude-tests`, { userId });
    return data.tests;
};
