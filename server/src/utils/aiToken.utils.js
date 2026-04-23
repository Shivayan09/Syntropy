import { FREE_TRIAL_TESTS, PLAN_DETAILS, normalizePlan } from "../config/plan.js";

const addMonths = (date, months) => {
  const nextDate = new Date(date);
  nextDate.setMonth(nextDate.getMonth() + months);
  return nextDate;
};

export const getPlanDetails = (plan) => {
  const normalizedPlan = normalizePlan(plan);
  return PLAN_DETAILS[normalizedPlan] || PLAN_DETAILS.free;
};

export const isPaidPlan = (plan) => normalizePlan(plan) !== "free";

export const getCycleLimit = (user) => {
  const normalizedPlan = normalizePlan(user?.plan);

  if (normalizedPlan === "free") {
    return FREE_TRIAL_TESTS;
  }

  return getPlanDetails(normalizedPlan).credits;
};

const getPlanCreditsRemaining = (user) => {
  const normalizedPlan = normalizePlan(user?.plan);

  if (normalizedPlan === "free") {
    return Math.max(FREE_TRIAL_TESTS - (user?.freeAiTestsUsed || 0), 0);
  }

  return Math.max(user?.aiTokens || 0, 0);
};

const downgradeToFree = (user) => {
  user.plan = "free";
  user.planBillingCycle = null;
  user.planExpiry = undefined;
  user.aiTokens = 0;
  user.lastTokenReset = new Date();
};

export const getNextCreditResetAt = (user) => {
  const normalizedPlan = normalizePlan(user?.plan);

  if (normalizedPlan === "free" || !user?.lastTokenReset || !user?.planExpiry) {
    return null;
  }

  const nextReset = addMonths(user.lastTokenReset, 1);
  const expiry = new Date(user.planExpiry);
  return nextReset > expiry ? expiry : nextReset;
};

export const syncAiTokens = async (user) => {
  const now = new Date();
  const normalizedPlan = normalizePlan(user.plan);
  let shouldSave = false;

  if (user.plan !== normalizedPlan) {
    user.plan = normalizedPlan;
    shouldSave = true;
  }

  if (!isPaidPlan(user.plan)) {
    if (user.planBillingCycle || user.planExpiry || user.aiTokens !== 0) {
      downgradeToFree(user);
      shouldSave = true;
    }

    if (shouldSave) {
      await user.save();
    }

    return user;
  }

  const cycleLimit = getCycleLimit(user);
  const expiry = user.planExpiry ? new Date(user.planExpiry) : null;

  if (!expiry || now >= expiry) {
    downgradeToFree(user);
    await user.save();
    return user;
  }

  if (!user.lastTokenReset) {
    user.lastTokenReset = now;
    user.aiTokens = cycleLimit;
    await user.save();
    return user;
  }

  let cycleAnchor = new Date(user.lastTokenReset);

  while (now >= addMonths(cycleAnchor, 1) && addMonths(cycleAnchor, 1) <= expiry) {
    cycleAnchor = addMonths(cycleAnchor, 1);
    user.lastTokenReset = cycleAnchor;
    user.aiTokens = cycleLimit;
    shouldSave = true;
  }

  if (shouldSave) {
    await user.save();
  }

  return user;
};

export const consumeAiCredit = async (user) => {
  const normalizedPlan = normalizePlan(user.plan);

  if (normalizedPlan === "free") {
    const remainingFreeCredits = Math.max(FREE_TRIAL_TESTS - (user.freeAiTestsUsed || 0), 0);

    if (remainingFreeCredits > 0) {
      user.freeAiTestsUsed = (user.freeAiTestsUsed || 0) + 1;
      await user.save();
      return "free";
    }

    if ((user.bonusAiTokens || 0) > 0) {
      user.bonusAiTokens -= 1;
      await user.save();
      return "bonus";
    }

    return null;
  }

  if ((user.aiTokens || 0) > 0) {
    user.aiTokens -= 1;
    await user.save();
    return "plan";
  }

  if ((user.bonusAiTokens || 0) > 0) {
    user.bonusAiTokens -= 1;
    await user.save();
    return "bonus";
  }

  return null;
};

export const refundAiCredit = async (user, creditSource) => {
  if (!creditSource) {
    return user;
  }

  if (creditSource === "free") {
    user.freeAiTestsUsed = Math.max((user.freeAiTestsUsed || 0) - 1, 0);
  }

  if (creditSource === "plan") {
    user.aiTokens = (user.aiTokens || 0) + 1;
  }

  if (creditSource === "bonus") {
    user.bonusAiTokens = (user.bonusAiTokens || 0) + 1;
  }

  await user.save();
  return user;
};

export const buildAiTokenStatus = (user) => {
  const normalizedPlan = normalizePlan(user.plan);
  const includedRemaining = getPlanCreditsRemaining(user);
  const bonusRemaining = Math.max(user.bonusAiTokens || 0, 0);
  const cycleLimit = getCycleLimit(user);
  const nextResetAt = getNextCreditResetAt(user);
  const totalRemaining = includedRemaining + bonusRemaining;

  return {
    remaining: totalRemaining,
    includedRemaining,
    bonusRemaining,
    cycleLimit,
    hasTokens: totalRemaining > 0,
    lastResetAt: user.lastTokenReset,
    nextResetAt,
    manualTestsUnlimited: true,
    plan: normalizedPlan,
    planLabel: getPlanDetails(normalizedPlan).label,
    billingCycle: normalizedPlan === "free" ? "lifetime" : user.planBillingCycle || "monthly",
  };
};
