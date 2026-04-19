export const AI_TOKEN_LIMITS = {
    free: 1,
    pro: 5,
    elite: 20
};

export const getDailyLimit = (user) => {
    return AI_TOKEN_LIMITS[user.plan] || 1;
};

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
    if (!user.lastTokenReset) {
        user.aiTokens = getDailyLimit(user);
        user.lastTokenReset = now;
        await user.save();
        return user;
    }
    const nextReset = new Date(user.lastTokenReset);
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(0, 0, 0, 0);
    if (now >= nextReset) {
        user.aiTokens = getDailyLimit(user);
        user.lastTokenReset = now;
        await user.save();
    }
    return user;
};

export const buildAiTokenStatus = (user) => {
    const limit = getDailyLimit(user);
    const remaining = Math.max(user.aiTokens || 0, 0);
    const nextResetAt = getNextTokenResetAt();
    return {
        remaining,
        dailyLimit: limit,
        hasTokens: remaining > 0,
        lastResetAt: user.lastTokenReset,
        nextResetAt,
        manualTestsUnlimited: true
    };
};