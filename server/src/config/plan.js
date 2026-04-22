export const FREE_TRIAL_TESTS = 3;

export const PLAN_CATALOG = {
  starter_monthly: {
    key: "starter_monthly",
    kind: "plan",
    plan: "starter",
    label: "Starter Monthly",
    amountPaise: 9900,
    credits: 15,
    billingCycle: "monthly",
    durationMonths: 1,
    description: "15 AI test generations per month",
  },
  pro_monthly: {
    key: "pro_monthly",
    kind: "plan",
    plan: "pro",
    label: "Pro Monthly",
    amountPaise: 24900,
    credits: 50,
    billingCycle: "monthly",
    durationMonths: 1,
    description: "50 AI test generations per month",
  },
  pro_annual: {
    key: "pro_annual",
    kind: "plan",
    plan: "pro",
    label: "Pro Annual",
    amountPaise: 199900,
    credits: 50,
    billingCycle: "annual",
    durationMonths: 12,
    description: "50 AI test generations per month for 12 months",
  },
  topup_1: {
    key: "topup_1",
    kind: "topup",
    label: "Top-up 1",
    amountPaise: 900,
    credits: 1,
    description: "1 extra AI test",
  },
  topup_5: {
    key: "topup_5",
    kind: "topup",
    label: "Top-up 5",
    amountPaise: 4900,
    credits: 5,
    description: "5 extra AI tests",
  },
  topup_15: {
    key: "topup_15",
    kind: "topup",
    label: "Top-up 15",
    amountPaise: 9900,
    credits: 15,
    description: "15 extra AI tests",
  },
};

export const LEGACY_PLAN_ALIASES = {
  elite: "power",
};

export const PLAN_DETAILS = {
  free: {
    label: "Free",
    credits: FREE_TRIAL_TESTS,
    billingCycle: "lifetime",
  },
  starter: {
    label: "Starter",
    credits: 15,
    billingCycle: "monthly",
  },
  pro: {
    label: "Pro",
    credits: 50,
    billingCycle: "monthly",
  },
  power: {
    label: "Power",
    credits: 150,
    billingCycle: "monthly",
  },
};

export const normalizePlan = (plan) => {
  if (typeof plan !== "string") {
    return "free";
  }

  const normalizedPlan = plan.toLowerCase();
  return LEGACY_PLAN_ALIASES[normalizedPlan] || normalizedPlan;
};

export const getCatalogItem = (itemKey) => {
  if (typeof itemKey !== "string") {
    return null;
  }

  return PLAN_CATALOG[itemKey.toLowerCase()] || null;
};
