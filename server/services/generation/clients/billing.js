// Generation's calls to the billing service, over HTTP.
import { callService } from "./callService.js";

// Returns { creditSource, aiTokenStatus }. creditSource is null when the user has no credits left.
export const consumeCredit = (userId, email) =>
    callService("BILLING_URL", "/internal/billing/consume-credit", { userId, email });

// Returns the updated aiTokenStatus.
export const refundCredit = async (userId, email, creditSource) => {
    const data = await callService("BILLING_URL", "/internal/billing/refund-credit", { userId, email, creditSource });
    return data.aiTokenStatus;
};
