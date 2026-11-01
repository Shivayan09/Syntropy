import mongoose from "mongoose";
import Wallet from "./models/wallet.model.js";
import { FREE_MONTHLY_TESTS, PLAN_DETAILS, hasUnlimitedCredits, normalizePlan } from "./config/plan.js";

const UNLIMITED_CREDIT_SENTINEL = 999999;

const WALLET_FIELDS = ["aiTokens", "bonusAiTokens", "freeAiTestsUsed", "lastTokenReset", "plan", "planBillingCycle", "planExpiry"];

// Returns the user's wallet, creating it the first time it is needed.
// Users from before the split still have their credits on the users document,
// so a new wallet starts from those values. New users just get the defaults.
export const getWallet = async (userId) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (wallet) {
    return wallet;
  }

  const oldUser = await mongoose.connection.collection("users").findOne({ _id: userId });
  const startingValues = {};
  for (const field of WALLET_FIELDS) {
    if (oldUser?.[field] !== undefined) {
      startingValues[field] = oldUser[field];
    }
  }

  // Upsert, so two requests creating the same wallet at once can't make a duplicate.
  return Wallet.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, ...startingValues } },
    { upsert: true, returnDocument: "after" },
  );
};

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

export const getCycleLimit = (wallet) => {
  const normalizedPlan = normalizePlan(wallet?.plan);

  if (normalizedPlan === "free") {
    return FREE_MONTHLY_TESTS;
  }

  return getPlanDetails(normalizedPlan).credits;
};

const getPlanCreditsRemaining = (wallet) => {
  const normalizedPlan = normalizePlan(wallet?.plan);

  if (normalizedPlan === "free") {
    return Math.max(FREE_MONTHLY_TESTS - (wallet?.freeAiTestsUsed || 0), 0);
  }

  return Math.max(wallet?.aiTokens || 0, 0);
};

const downgradeToFree = (wallet) => {
  wallet.plan = "free";
  wallet.planBillingCycle = null;
  wallet.planExpiry = undefined;
  wallet.aiTokens = 0;
  wallet.lastTokenReset = new Date();
};

export const getNextCreditResetAt = (wallet) => {
  if (!wallet?.lastTokenReset) {
    return null;
  }

  const nextReset = addMonths(wallet.lastTokenReset, 1);
  const normalizedPlan = normalizePlan(wallet?.plan);

  if (normalizedPlan === "free") {
    return nextReset;
  }

  if (!wallet?.planExpiry) {
    return null;
  }

  const expiry = new Date(wallet.planExpiry);
  return nextReset > expiry ? expiry : nextReset;
};

export const syncAiTokens = async (wallet, email) => {
  if (hasUnlimitedCredits(email)) {
    return wallet;
  }

  const now = new Date();
  const normalizedPlan = normalizePlan(wallet.plan);
  let shouldSave = false;

  if (wallet.plan !== normalizedPlan) {
    wallet.plan = normalizedPlan;
    shouldSave = true;
  }

  if (!isPaidPlan(wallet.plan)) {
    if (!wallet.lastTokenReset) {
      wallet.lastTokenReset = now;
      shouldSave = true;
    }

    let cycleAnchor = new Date(wallet.lastTokenReset);

    while (now >= addMonths(cycleAnchor, 1)) {
      cycleAnchor = addMonths(cycleAnchor, 1);
      wallet.lastTokenReset = cycleAnchor;
      wallet.freeAiTestsUsed = 0;
      shouldSave = true;
    }

    if (wallet.planBillingCycle || wallet.planExpiry || wallet.aiTokens !== 0) {
      wallet.planBillingCycle = null;
      wallet.planExpiry = undefined;
      wallet.aiTokens = 0;
      shouldSave = true;
    }

    if ((wallet.freeAiTestsUsed || 0) > FREE_MONTHLY_TESTS) {
      wallet.freeAiTestsUsed = FREE_MONTHLY_TESTS;
      shouldSave = true;
    }

    if (shouldSave) {
      await wallet.save();
    }

    return wallet;
  }

  const cycleLimit = getCycleLimit(wallet);
  const expiry = wallet.planExpiry ? new Date(wallet.planExpiry) : null;

  if (!expiry || now >= expiry) {
    downgradeToFree(wallet);
    await wallet.save();
    return wallet;
  }

  if (!wallet.lastTokenReset) {
    wallet.lastTokenReset = now;
    wallet.aiTokens = cycleLimit;
    await wallet.save();
    return wallet;
  }

  let cycleAnchor = new Date(wallet.lastTokenReset);

  while (now >= addMonths(cycleAnchor, 1) && addMonths(cycleAnchor, 1) <= expiry) {
    cycleAnchor = addMonths(cycleAnchor, 1);
    wallet.lastTokenReset = cycleAnchor;
    wallet.aiTokens = cycleLimit;
    shouldSave = true;
  }

  if (shouldSave) {
    await wallet.save();
  }

  return wallet;
};

export const consumeAiCredit = async (wallet, email) => {
  if (hasUnlimitedCredits(email)) {
    return "unlimited";
  }

  const normalizedPlan = normalizePlan(wallet.plan);

  if (normalizedPlan === "free") {
    const remainingFreeCredits = Math.max(FREE_MONTHLY_TESTS - (wallet.freeAiTestsUsed || 0), 0);

    if (remainingFreeCredits > 0) {
      wallet.freeAiTestsUsed = (wallet.freeAiTestsUsed || 0) + 1;
      await wallet.save();
      return "free";
    }

    if ((wallet.bonusAiTokens || 0) > 0) {
      wallet.bonusAiTokens -= 1;
      await wallet.save();
      return "bonus";
    }

    return null;
  }

  if ((wallet.aiTokens || 0) > 0) {
    wallet.aiTokens -= 1;
    await wallet.save();
    return "plan";
  }

  if ((wallet.bonusAiTokens || 0) > 0) {
    wallet.bonusAiTokens -= 1;
    await wallet.save();
    return "bonus";
  }

  return null;
};

export const refundAiCredit = async (wallet, creditSource) => {
  if (!creditSource || creditSource === "unlimited") {
    return wallet;
  }

  if (creditSource === "free") {
    wallet.freeAiTestsUsed = Math.max((wallet.freeAiTestsUsed || 0) - 1, 0);
  }

  if (creditSource === "plan") {
    wallet.aiTokens = (wallet.aiTokens || 0) + 1;
  }

  if (creditSource === "bonus") {
    wallet.bonusAiTokens = (wallet.bonusAiTokens || 0) + 1;
  }

  await wallet.save();
  return wallet;
};

export const buildAiTokenStatus = (wallet, email) => {
  const normalizedPlan = normalizePlan(wallet.plan);

  if (hasUnlimitedCredits(email)) {
    return {
      remaining: UNLIMITED_CREDIT_SENTINEL,
      includedRemaining: UNLIMITED_CREDIT_SENTINEL,
      bonusRemaining: 0,
      cycleLimit: UNLIMITED_CREDIT_SENTINEL,
      hasTokens: true,
      lastResetAt: wallet.lastTokenReset,
      nextResetAt: null,
      manualTestsUnlimited: true,
      unlimited: true,
      plan: normalizedPlan,
      planLabel: getPlanDetails(normalizedPlan).label,
      billingCycle: normalizedPlan === "free" ? "monthly" : wallet.planBillingCycle || "monthly",
    };
  }

  const includedRemaining = getPlanCreditsRemaining(wallet);
  const bonusRemaining = Math.max(wallet.bonusAiTokens || 0, 0);
  const cycleLimit = getCycleLimit(wallet);
  const nextResetAt = getNextCreditResetAt(wallet);
  const totalRemaining = includedRemaining + bonusRemaining;

  return {
    remaining: totalRemaining,
    includedRemaining,
    bonusRemaining,
    cycleLimit,
    hasTokens: totalRemaining > 0,
    lastResetAt: wallet.lastTokenReset,
    nextResetAt,
    manualTestsUnlimited: true,
    unlimited: false,
    plan: normalizedPlan,
    planLabel: getPlanDetails(normalizedPlan).label,
    billingCycle: normalizedPlan === "free" ? "monthly" : wallet.planBillingCycle || "monthly",
  };
};
