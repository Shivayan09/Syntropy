// User's calls to the billing service, over HTTP.
import { callService } from "./callService.js";

// Returns { plan, planBillingCycle, planExpiry }.
export const getPlan = (userId) => callService("BILLING_URL", "/internal/billing/plan", { userId });
