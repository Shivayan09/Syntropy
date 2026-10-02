"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardPen,
  Crown,
  Infinity as InfinityIcon,
  Lock,
  RefreshCw,
  Shield,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useAiTokens } from "@/context/AiTokenContext";
import { useAuth } from "@/context/AuthContext";

type PlanKey = "free" | "starter" | "pro" | "power";
type PurchaseKey =
  | "starter_monthly"
  | "pro_monthly"
  | "topup_1"
  | "topup_5"
  | "topup_15";

type RazorpayResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    description?: string;
    reason?: string;
  };
};

type RazorpayInstance = {
  on: (event: "payment.failed", handler: (response: RazorpayFailureResponse) => void) => void;
  open: () => void;
};

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayResponse) => Promise<void>;
  prefill: {
    name: string;
    email: string;
  };
  modal: {
    ondismiss: () => void;
  };
  theme: {
    color: string;
  };
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const plans = [
  {
    key: "free",
    name: "Free",
    priceLabel: "Rs 0",
    quota: "10 AI tests per month",
    description: "For steady practice, with a monthly AI allowance and unlimited manual tests.",
    features: [
      "10 AI test generations each month",
      "Basic analytics",
      "Manual tests always unlimited",
      "Start without paying",
    ],
    highlighted: false,
    cta: "Free tier",
    itemKey: null,
  },
  {
    key: "starter",
    name: "Starter",
    priceLabel: "Rs 99/month",
    quota: "30 AI tests per month",
    description: "For students who want a reliable weekly AI practice rhythm without overspending.",
    features: [
      "30 AI test generations per month",
      "Standard explanations",
      "Weak-topic analysis",
      "Best value for regular practice",
    ],
    highlighted: true,
    cta: "Upgrade",
    itemKey: "starter_monthly",
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "Rs 249/month",
    quota: "100 AI tests per month",
    description: "For serious learners running repeated revision, retest, and correction cycles.",
    features: [
      "100 AI test generations per month",
      "Better analytics",
      "Priority generation",
      "Built for high-frequency prep",
    ],
    highlighted: false,
    cta: "Upgrade",
    itemKey: "pro_monthly",
  },
] as const;

const topUps = [
  {
    itemKey: "topup_1" as const,
    name: "1 extra test",
    tests: 1,
    price: 9,
    priceLabel: "Rs 9",
    description: "One more attempt before your next refill.",
    tag: null,
  },
  {
    itemKey: "topup_5" as const,
    name: "5 extra tests",
    tests: 5,
    price: 39,
    priceLabel: "Rs 39",
    description: "A short burst between monthly cycles.",
    tag: "Best value",
  },
  {
    itemKey: "topup_15" as const,
    name: "15 extra tests",
    tests: 15,
    price: 89,
    priceLabel: "Rs 89",
    description: "Recover a whole revision cycle without a bigger plan.",
    tag: "Lowest per test",
  },
] as const;

type TopUpKey = (typeof topUps)[number]["itemKey"];

const planMeta = {
  free: {
    icon: ShieldCheck,
    label: "Free",
    summary: "A monthly free allowance that keeps AI practice accessible before you spend anything.",
    status: "Monthly free tier",
  },
  starter: {
    icon: Zap,
    label: "Starter",
    summary: "Balanced for students who want regular AI practice without going overboard.",
    status: "Most popular tier",
  },
  pro: {
    icon: Crown,
    label: "Pro",
    summary: "Built for serious prep cycles with repeated tests, review, and correction.",
    status: "Serious prep tier",
  },
  power: {
    icon: Sparkles,
    label: "Power",
    summary: "Legacy access tier.",
    status: "Legacy tier",
  },
} as const;

const offerMeta = {
  starter_monthly: {
    name: "Starter",
    description: "Starter monthly subscription",
  },
  pro_monthly: {
    name: "Pro",
    description: "Pro monthly subscription",
  },
  topup_1: {
    name: "1 extra test",
    description: "1 extra AI test",
  },
  topup_5: {
    name: "5 extra tests",
    description: "5 extra AI tests",
  },
  topup_15: {
    name: "15 extra tests",
    description: "15 extra AI tests",
  },
} satisfies Record<PurchaseKey, { name: string; description: string }>;

const formatExpiry = (value?: string) => {
  if (!value) return "No active renewal";

  const expiry = new Date(value);
  if (Number.isNaN(expiry.getTime())) return "No active renewal";

  return expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong, try again later";
};

const getPlanRank = (plan: PlanKey) => {
  if (plan === "power") return 4;
  if (plan === "pro") return 3;
  if (plan === "starter") return 2;
  return 1;
};

const formatPerTestCost = (totalRupees: number, totalTests: number) =>
  `Rs ${Number((totalRupees / totalTests).toFixed(1)).toString()}/test`;

function PlanFact({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Zap;
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-3.5">
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase opacity-55">
        <Icon size={13} className="text-primary" />
        {label}
      </p>
      <p className="mt-1.5 truncate text-lg font-extrabold leading-tight">{value}</p>
      <p className="text-[11px] opacity-55">{hint}</p>
    </div>
  );
}

const createReceipt = (itemKey: PurchaseKey) => {
  const compactId = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  return `${itemKey}_${compactId}`;
};

export default function PlansPage() {
  const { user, getMe } = useAuth();
  const { tokenStatus } = useAiTokens();
  const [loading, setLoading] = useState<PurchaseKey | null>(null);
  // The script may already be on the page from an earlier visit, in which case
  // next/script's onLoad never fires again. Start from the real window state.
  const [checkoutReady, setCheckoutReady] = useState(
    () => typeof window !== "undefined" && Boolean(window.Razorpay),
  );
  const [creditsInfoOpen, setCreditsInfoOpen] = useState(false);
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpKey>("topup_5");
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const currentPlanKey = (user?.plan || "free") as PlanKey;
  const currentPlan =
    useMemo(
      () =>
        plans.find((plan) => plan.key === currentPlanKey) ||
        {
          key: currentPlanKey,
          name: planMeta[currentPlanKey].label,
          priceLabel: "Legacy",
          quota: "Managed on your account",
          description: planMeta[currentPlanKey].summary,
          features: ["Legacy access remains active on your account"],
          highlighted: false,
          cta: "Current plan",
          itemKey: null,
        },
      [currentPlanKey]
    );
  const CurrentPlanIcon = planMeta[currentPlanKey].icon;
  const isPaidPlan = currentPlanKey !== "free";
  const currentRank = getPlanRank(currentPlanKey);

  const remainingCredits = tokenStatus?.remaining ?? null;
  const cycleLimit = tokenStatus?.cycleLimit ?? null;
  const includedRemaining = tokenStatus?.includedRemaining ?? 0;
  const bonusRemaining = tokenStatus?.bonusRemaining ?? 0;
  const includedUsedPercent =
    cycleLimit && cycleLimit > 0
      ? Math.max(0, Math.min(100, Math.round((includedRemaining / cycleLimit) * 100)))
      : 0;
  const nextRefill = tokenStatus?.nextResetAt
    ? new Date(tokenStatus.nextResetAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : null;

  const selectedPack = topUps.find((pack) => pack.itemKey === selectedTopUp) ?? topUps[1];

  useEffect(() => {
    if (!creditsInfoOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setCreditsInfoOpen(false);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [creditsInfoOpen]);

  const verifyPayment = async (response: RazorpayResponse, itemKey: PurchaseKey) => {
    const verifyResponse = await fetch(`${backendUrl}/api/payment/verify-payment`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...response,
        itemKey,
      }),
    });

    const verifyData = await verifyResponse.json();
    if (!verifyResponse.ok) {
      throw new Error(verifyData.message || "Payment verification failed");
    }

    await getMe();
    toast.success(verifyData.message || `${offerMeta[itemKey].name} activated successfully`);
  };

  // Waits briefly for checkout.js if the user clicks before it has finished loading.
  const waitForRazorpay = async () => {
    if (window.Razorpay) return true;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 200));
      if (window.Razorpay) return true;
    }

    return false;
  };

  const handlePurchase = async (itemKey: PurchaseKey) => {
    setLoading(itemKey);

    const ready = checkoutReady && Boolean(window.Razorpay) ? true : await waitForRazorpay();
    if (!ready || !window.Razorpay) {
      toast.error("Razorpay checkout could not be loaded. Check your connection or ad blocker and try again.");
      setLoading(null);
      return;
    }
    setCheckoutReady(true);

    if (!razorpayKeyId) {
      toast.error("Razorpay key is missing from the client environment.");
      setLoading(null);
      return;
    }

    try {
      const orderResponse = await fetch(`${backendUrl}/api/payment/create-order`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemKey,
          receipt: createReceipt(itemKey),
          currency: "INR",
        }),
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) {
        throw new Error(orderData.message || "Unable to create order");
      }

      const razorpay = new window.Razorpay({
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Testify",
        description: offerMeta[itemKey].description,
        order_id: orderData.order_id,
        handler: async (response) => {
          try {
            await verifyPayment(response, itemKey);
          } catch (error) {
            toast.error(getErrorMessage(error));
          } finally {
            setLoading(null);
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(null);
          },
        },
        theme: {
          color: "#00a85a",
        },
      });

      razorpay.on("payment.failed", (response) => {
        const message =
          response.error?.description ||
          response.error?.reason ||
          "Payment failed. Please try again.";
        toast.error(message);
        setLoading(null);
      });

      razorpay.open();
    } catch (error) {
      toast.error(getErrorMessage(error));
      setLoading(null);
    }
  };

  return (
    <div>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setCheckoutReady(true)}
        onReady={() => setCheckoutReady(true)}
        onError={() => {
          setCheckoutReady(false);
          toast.error("Failed to load Razorpay checkout");
        }}
      />

      <div>
        <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
              <Shield size={18} />
              Subscription
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            {/* Current plan */}
            <div className="card2 flex flex-col p-6 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="bg-primary-soft inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-extrabold text-primary">
                  <CurrentPlanIcon size={16} />
                  {currentPlan.name} plan
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  {isPaidPlan ? `Active till ${formatExpiry(user?.planExpiry)}` : "Active"}
                </span>
              </div>

              <div className="mt-6">
                <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-55">
                  <TicketCheck size={14} />
                  AI credits this cycle
                </p>

                <div className="mt-2 flex items-end gap-2">
                  <span className="text-5xl font-extrabold leading-none">
                    {remainingCredits ?? "--"}
                  </span>
                  <span className="pb-1 text-base font-bold opacity-60">
                    {cycleLimit ? `of ${cycleLimit} left` : "credits"}
                  </span>
                </div>

                <div
                  className="mt-4 h-2.5 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
                  role="img"
                  aria-label={`${includedUsedPercent} percent of plan credits remaining`}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${includedUsedPercent}%` }} />
                </div>

                <p className="mt-2 text-xs opacity-60">
                  {tokenStatus
                    ? `${includedRemaining} plan credit${includedRemaining === 1 ? "" : "s"}${
                        bonusRemaining > 0 ? ` and ${bonusRemaining} top-up credit${bonusRemaining === 1 ? "" : "s"}` : ""
                      } remaining${nextRefill ? ` · plan credits refill on ${nextRefill}` : ""}`
                    : "Checking your balance"}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <PlanFact icon={Zap} label="Monthly quota" value={currentPlan.quota.split(" ")[0]} hint="AI tests" />
                <PlanFact icon={InfinityIcon} label="Manual tests" value="Unlimited" hint="always free" />
                <PlanFact
                  icon={isPaidPlan ? CalendarDays : RefreshCw}
                  label={isPaidPlan ? "Billing" : "Price"}
                  value={isPaidPlan ? (user?.planBillingCycle === "annual" ? "Annual" : "Monthly") : "Rs 0"}
                  hint={isPaidPlan ? "auto-managed" : "monthly refill"}
                />
              </div>

              <ul className="mt-6 grid gap-x-6 gap-y-2.5 border-t border-(--border) pt-5 sm:grid-cols-2">
                {currentPlan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                    <span className="opacity-85">{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                {currentPlanKey !== "pro" && currentPlanKey !== "power" ? (
                  <a href="#plans" className="contents">
                    <button type="button" className="w-full gap-2 sm:w-auto">
                      <Sparkles size={17} />
                      {isPaidPlan ? "Upgrade to Pro" : "Upgrade for more credits"}
                    </button>
                  </a>
                ) : (
                  <a href="#plans" className="contents">
                    <button type="button" className="button-secondary w-full gap-2 sm:w-auto">
                      Compare plans
                      <ArrowRight size={17} />
                    </button>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setCreditsInfoOpen(true)}
                  className="button-secondary w-full gap-2 sm:w-auto"
                >
                  How credits work
                </button>
              </div>
            </div>

            {/* Top-up packs */}
            <div className="card flex flex-col p-6 md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="bg-primary-soft grid h-9 w-9 place-items-center rounded-xl text-primary">
                    <Wallet size={18} />
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold leading-tight">Top-up packs</h2>
                    <p className="text-xs opacity-60">Extra AI tests on top of your plan</p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-bold">
                  <Lock size={12} className="text-primary" />
                  Never expire
                </span>
              </div>

              <div className="mt-5 space-y-3" role="radiogroup" aria-label="Choose a top-up pack">
                {topUps.map((pack) => {
                  const selected = selectedTopUp === pack.itemKey;

                  return (
                    <div
                      key={pack.itemKey}
                      role="radio"
                      aria-checked={selected}
                      tabIndex={0}
                      data-selected={selected}
                      onClick={() => setSelectedTopUp(pack.itemKey)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedTopUp(pack.itemKey);
                        }
                      }}
                      className="select-card flex items-center gap-4 p-4!"
                    >
                      <span className="select-indicator is-round" data-selected={selected} aria-hidden="true">
                        <span className={`h-2 w-2 rounded-full ${selected ? "bg-white" : "bg-transparent"}`} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-extrabold leading-tight">{pack.name}</p>
                          {pack.tag && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
                              {pack.tag}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-xs opacity-60">{pack.description}</p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-lg font-extrabold leading-tight">{pack.priceLabel}</p>
                        <p className="text-[11px] font-bold opacity-55">{formatPerTestCost(pack.price, pack.tests)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-(--border) bg-(--bg-secondary) px-4 py-3 text-sm">
                <div>
                  <p className="font-extrabold">{selectedPack.name}</p>
                  <p className="text-xs opacity-60">Added to your balance right after payment</p>
                </div>
                <p className="text-xl font-extrabold">{selectedPack.priceLabel}</p>
              </div>

              <button
                onClick={() => handlePurchase(selectedPack.itemKey)}
                disabled={loading === selectedPack.itemKey}
                className={`mt-4 w-full justify-between ${loading === selectedPack.itemKey ? "cursor-not-allowed opacity-60" : ""}`}
              >
                {loading === selectedPack.itemKey
                  ? "Processing..."
                  : `Buy ${selectedPack.tests} extra test${selectedPack.tests === 1 ? "" : "s"} for ${selectedPack.priceLabel}`}
                <ArrowRight size={18} />
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs opacity-55">
                <ShieldCheck size={13} />
                Secure checkout with Razorpay. Plan credits are used before top-ups.
              </p>

              <div className="mt-5 flex items-start gap-2.5 border-t border-(--border) pt-4 text-xs opacity-65">
                <ClipboardPen size={14} className="mt-0.5 shrink-0 text-primary" />
                <p>Manual tests never use credits, so you can keep building papers by hand at any time.</p>
              </div>
            </div>
          </div>
        </section>

        <section id="plans" className="mt-10 scroll-mt-6">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold uppercase text-primary">All plans</p>
                <h2 className="mt-2 text-3xl font-extrabold">Compare tiers side by side</h2>
              </div>
              <p className="text-sm opacity-60">No hidden charges. Cancel anytime.</p>
            </div>

            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              {plans.map((plan) => {
                const isCurrent = plan.key === currentPlanKey;
                const isUpgrade = getPlanRank(plan.key) > currentRank;
                const isLoading = plan.itemKey ? loading === plan.itemKey : false;

                return (
                  <div key={plan.key} className={`${isCurrent ? "card2" : "card"} relative flex h-full flex-col justify-between p-0`}>
                    <div className="p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-2xl font-extrabold">{plan.name}</h3>
                          <p className="mt-1 text-sm opacity-70">{plan.description}</p>
                        </div>
                        <div className="absolute top-3 right-5">
                          {plan.highlighted && (
                            <span className="text-primary px-2 py-1 text-xs font-extrabold text-white">
                              POPULAR
                            </span>
                          )}
                          {isCurrent && (
                            <span className="text-primary px-2 py-1 text-xs font-extrabold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 py-2">
                        <p className="text-3xl font-extrabold">{plan.priceLabel}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{plan.quota}</p>
                        {(plan.key === "starter" || plan.key === "pro") && (
                          <div className="mt-3 inline-flex shadow-sm shadow-green-500 bg-primary px-3 py-1 text-sm font-extrabold text-white rounded-xl">
                            {plan.key === "starter"
                              ? formatPerTestCost(99, 30)
                              : formatPerTestCost(249, 100)}
                          </div>
                        )}
                      </div>

                      <ul className="mt-5 space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3 text-sm">
                            <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-5 mb-3 border border-dashed border-(--border) p-3 text-sm">
                        <p className="font-extrabold">
                          {isCurrent
                            ? "You are here"
                            : isUpgrade
                              ? "Room for higher-frequency prep"
                              : "Light entry point for new users"}
                        </p>
                        <p className="mt-1 opacity-60">
                          {isCurrent
                            ? "Your current workflow is mapped to this plan."
                            : isUpgrade
                              ? "Useful when AI generation becomes part of your regular prep routine."
                              : "Best when you want recurring free usage before spending."}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (plan.itemKey) {
                          handlePurchase(plan.itemKey);
                        }
                      }}
                      disabled={isLoading || isCurrent || !plan.itemKey}
                      className={`w-full gap-2 rounded-none border-x-0 border-b-0 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none ${plan.highlighted && !isCurrent ? "" : "button-secondary"}`}
                    >
                      {isLoading ? "Processing..." : isCurrent ? "Current plan" : plan.cta}
                      {plan.itemKey && !isCurrent && <ArrowRight size={17} />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-3 card2 border-black bg-(--bg-secondary) p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-extrabold">Credits policy</p>
                <p className="mt-1 text-sm opacity-70">
                  Monthly plan credits reset each billing cycle and unused included credits do not roll over. Top-up credits stay in your account until used.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCreditsInfoOpen(true)}
                className="button-secondary gap-2 self-start sm:self-auto w-64"
              >
                How credits work
                <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </section>

        <div className="mt-10 text-center text-sm opacity-60">
          {isPaidPlan
            ? `Your ${currentPlan.name.toLowerCase()} access is active through ${formatExpiry(user?.planExpiry)}.`
            : "You are on the monthly free plan right now. Upgrade anytime when you need more AI tests."}
        </div>
      </div>

      {creditsInfoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCreditsInfoOpen(false)} />

          <div className="card relative w-full max-w-lg border border-primary bg-(--bg-secondary) p-6 backdrop-blur-none">
            <div
              onClick={() => setCreditsInfoOpen(false)}
              className=" flex items-center justify-center cursor-pointer absolute right-3 top-3 h-10 w-10 px-0"
              aria-label="Close credits info"
            >
              <X size={20} />
            </div>

            <div className="pr-12">
              <p className="text-sm font-extrabold uppercase text-primary">How Credits Work</p>
              <h3 className="mt-2 text-2xl font-extrabold">Simple billing rules, before you buy</h3>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="border border-black bg-(--bg-secondary) p-4">
                <p className="font-extrabold">Monthly plans</p>
                <p className="mt-1 opacity-70">
                  Starter and Pro credits belong to that billing cycle. When the next monthly cycle begins, the included credits reset and unused included credits do not roll over.
                </p>
              </div>

              <div className="border border-black bg-(--bg-secondary) p-4">
                <p className="font-extrabold">Top-up packs</p>
                <p className="mt-1 opacity-70">
                  Top-up credits are added separately and stay in your account until you use them.
                </p>
              </div>

              <div className="border border-black bg-(--bg-secondary) p-4">
                <p className="font-extrabold">Usage order</p>
                <p className="mt-1 opacity-70">
                  If you have an active paid plan, your included monthly credits are used first. Top-up credits remain available after that.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
