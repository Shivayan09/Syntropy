export const DAILY_AI_TOKEN_LIMIT = 1;

const isSameDay = (first, second) =>
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear();

export const getNextTokenResetAt = (from = new Date()) => {
    const resetAt = new Date(from);
    resetAt.setDate(resetAt.getDate() + 1);
    resetAt.setHours(0, 0, 0, 0);
    return resetAt;
};

export const syncDailyAiTokens = async (user) => {
    const now = new Date();
    const lastReset = user.lastTokenReset || user.createdAt || now;

    if (!isSameDay(now, lastReset)) {
        user.aiTokens = DAILY_AI_TOKEN_LIMIT;
        user.lastTokenReset = now;
        await user.save();
    }

    return user;
};

export const buildAiTokenStatus = (user) => {
    const remaining = Math.max(user.aiTokens || 0, 0);
    const nextResetAt = getNextTokenResetAt();

    return {
        remaining,
        dailyLimit: DAILY_AI_TOKEN_LIMIT,
        hasTokens: remaining > 0,
        lastResetAt: user.lastTokenReset,
        nextResetAt,
        manualTestsUnlimited: true
    };
};
