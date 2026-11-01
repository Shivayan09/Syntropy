const RATE_LIMIT_MESSAGE =
  "The AI service is busy right now. Please wait a minute and try again. No credit was used.";

const CONFIG_MESSAGE = "The AI service is not available right now. Please try again later.";

/**
 * Groq surfaces quota problems as 413/429 with a raw provider message that is
 * not useful to a student. Map those to something actionable and keep everything
 * else as-is.
 */
export const describeAiError = (error) => {
  const status = error?.status;
  const code = error?.error?.error?.code || error?.code;

  if (status === 413 || status === 429 || code === "rate_limit_exceeded") {
    return RATE_LIMIT_MESSAGE;
  }

  if (status === 401 || status === 403) {
    return CONFIG_MESSAGE;
  }

  if (status >= 500) {
    return "The AI service failed to respond. Please try again. No credit was used.";
  }

  return error?.message || "Something went wrong while generating the test.";
};
