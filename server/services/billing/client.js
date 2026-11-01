// How other services talk to billing. Every call is an HTTP request to billing's /internal routes.
import { callService, serviceUrl } from "../../common/internal.js";

const BILLING_URL = serviceUrl("BILLING_URL");

// Returns { creditSource, aiTokenStatus }. creditSource is null when the user has no credits left.
export const consumeCredit = (userId, email) =>
    callService(`${BILLING_URL}/internal/billing/consume-credit`, { userId, email });

// Returns the updated aiTokenStatus.
export const refundCredit = async (userId, email, creditSource) => {
    const data = await callService(`${BILLING_URL}/internal/billing/refund-credit`, { userId, email, creditSource });
    return data.aiTokenStatus;
};

// Returns { plan, planBillingCycle, planExpiry }.
export const getPlan = (userId) => callService(`${BILLING_URL}/internal/billing/plan`, { userId });
