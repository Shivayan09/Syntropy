// What other services are allowed to ask the billing service.
// Everything runs in one process for now, so these call the wallet code directly.
// When services run as separate containers, these become HTTP calls to /internal/billing.
import { normalizePlan } from "./config/plan.js";
import { buildAiTokenStatus, consumeAiCredit, getWallet, refundAiCredit, syncAiTokens } from "./wallet.js";

// Takes one AI credit. creditSource is null when the user has none left.
export const consumeCredit = async (userId, email) => {
  const wallet = await getWallet(userId);
  await syncAiTokens(wallet, email);
  const creditSource = await consumeAiCredit(wallet, email);
  return { creditSource, aiTokenStatus: buildAiTokenStatus(wallet, email) };
};

// Gives back a credit taken by consumeCredit, e.g. when AI generation failed.
export const refundCredit = async (userId, email, creditSource) => {
  const wallet = await getWallet(userId);
  await refundAiCredit(wallet, creditSource);
  return buildAiTokenStatus(wallet, email);
};

export const getPlan = async (userId) => {
  const wallet = await getWallet(userId);
  return {
    plan: normalizePlan(wallet.plan),
    planBillingCycle: wallet.planBillingCycle,
    planExpiry: wallet.planExpiry,
  };
};
