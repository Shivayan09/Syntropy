"use client";

import { useEffect, useMemo, useState } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import { ArrowRight, Check, Crown, Shield, ShieldCheck, Sparkles, Wallet, X, Zap } from "lucide-react";
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
    priceLabel: "Rs 9",
    description: "For one more attempt before your next refill.",
  },
  {
    itemKey: "topup_5" as const,
    name: "5 extra tests",
    priceLabel: "Rs 39",
    description: "For short bursts between monthly cycles.",
  },
  {
    itemKey: "topup_15" as const,
    name: "15 extra tests",
    priceLabel: "Rs 89",
    description: "For recovery without committing to a bigger plan.",
  },
] as const;

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

const createReceipt = (itemKey: PurchaseKey) => `${itemKey}_${crypto.randomUUID()}`;

export default function PlansPage() {
  const { user, getMe } = useAuth();
  const [loading, setLoading] = useState<PurchaseKey | null>(null);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const [creditsInfoOpen, setCreditsInfoOpen] = useState(false);
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

  const handlePurchase = async (itemKey: PurchaseKey) => {
    if (!checkoutReady || !window.Razorpay) {
      toast.error("Razorpay checkout is still loading. Please try again.");
      return;
    }

    if (!razorpayKeyId) {
      toast.error("Razorpay key is missing from the client environment.");
      return;
    }

    setLoading(itemKey);

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

        <section className="mt-7">
          <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
            <div className="card2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 border border-black bg-primary px-3 py-1 text-white">
                  <CurrentPlanIcon size={16} className="text-white" />
                  <span className="text-sm font-extrabold uppercase">
                    {currentPlan.name} Plan
                  </span>
                </div>

                <div className="border border-black bg-(--surface) px-3 py-1 text-xs font-extrabold uppercase">
                  {planMeta[currentPlanKey].status}
                </div>
              </div>

              <div>
                <h1 className="text-2xl leading-tight font-extrabold md:text-3xl">
                  Your current setup is tuned for{" "}
                  <span className="text-primary">consistent practice</span>
                </h1>
              </div>

              <div className="flex flex-col gap-2">
                <StatTile
                  label="Progress loop"
                  value="Active user"
                  note="attempt tests -> review your attempts -> improve"
                />

                <StatTile
                  label={isPaidPlan ? "Valid till" : "Upgrade path"}
                  value={isPaidPlan ? formatExpiry(user?.planExpiry) : "Starter / Pro"}
                  note={currentPlan.name==="Pro" ? "Already on max level plan" : "Upgrade to the next plan for more benefits"}
                />
              </div>

              <div className="border border-dashed border-black bg-(--bg-secondary) p-4">
                <p className="text-sm font-extrabold">What this means for your prep</p>

                <p className="mt-1 text-sm opacity-70">
                  {currentPlanKey === "free"
                    ? "You get 10 AI tests every month for free, and can scale with a paid plan or a top-up whenever needed."
                    : currentPlanKey === "starter"
                      ? "You can keep a weekly revision rhythm without overspending, and step up when prep intensity grows."
                      : "You can run repeated focused tests per week, making revision cycles tighter and more effective."}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary">
                  <Wallet size={18} />
                  <p className="text-lg font-extrabold uppercase tracking-wider">
                    Top-up Packs
                  </p>
                </div>

                <span className="text-xs font-bold border border-black px-2 py-1 bg-primary text-white shadow-[2px_2px_0px_black]">
                  Instant Credits
                </span>
              </div>

              <div className="space-y-6">
                {topUps.map((pack, i) => (
                  <div
                    key={pack.itemKey}
                    className="group relative flex items-center justify-between gap-4 border-2 border-black bg-(--surface) p-5 shadow-[4px_4px_0px_black] transition-all duration-150"
                  >
                    {i === 1 && (
                      <span className="absolute -top-3 left-4 bg-primary text-white text-xs font-extrabold px-2 py-1 border border-black shadow-[2px_2px_0px_black]">
                        BEST VALUE
                      </span>
                    )}

                    <div>
                      <p className="text-xl font-extrabold">{pack.name}</p>
                      <p className="mt-1 text-sm opacity-70 max-w-55">
                        {pack.description}
                      </p>
                      {(pack.itemKey === "topup_5" || pack.itemKey === "topup_15") && (
                        <div className="mt-3 inline-flex border-2 border-black bg-primary px-3 py-1 text-sm font-extrabold text-white shadow-[3px_3px_0px_black]">
                          {pack.itemKey === "topup_5"
                            ? formatPerTestCost(39, 5)
                            : formatPerTestCost(89, 15)}
                        </div>
                      )}

                      <p className="mt-2 text-xs font-bold text-primary">
                        {i === 1 ? "Most popular choice" : "Upgrade your performance"}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <span className="border-2 border-black bg-secondary text-primary px-4 py-1 text-sm font-extrabold shadow-[2px_2px_0px_black]">
                        {pack.priceLabel}
                      </span>

                      <button
                        onClick={() => handlePurchase(pack.itemKey)}
                        disabled={loading === pack.itemKey}
                        className={`flex items-center justify-center gap-2 px-5 h-10 font-bold border-2 border-black bg-(--bg-secondary) text-(--text) shadow-[4px_4px_0px_black] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_black] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_black] ${loading === pack.itemKey ? "opacity-70 cursor-not-allowed" : ""}`}
                      >
                        {loading === pack.itemKey ? (
                          "Processing..."
                        ) : (
                          <>
                            <span className="sm:hidden">Buy</span>
                            <span className="hidden sm:inline">Buy Now</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10">
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
                            <span className="border border-black bg-primary px-2 py-1 text-xs font-extrabold text-white">
                              POPULAR
                            </span>
                          )}
                          {isCurrent && (
                            <span className="border border-black bg-(--surface) px-2 py-1 text-xs font-extrabold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 py-2">
                        <p className="text-3xl font-extrabold">{plan.priceLabel}</p>
                        <p className="mt-1 text-sm font-bold text-primary">{plan.quota}</p>
                        {(plan.key === "starter" || plan.key === "pro") && (
                          <div className="mt-3 inline-flex border-2 border-black bg-primary px-3 py-1 text-sm font-extrabold text-white shadow-[3px_3px_0px_black]">
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

          <div className="relative w-full max-w-lg border-2 border-black bg-(--surface) p-6 card">
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

function StatTile({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold opacity-60">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs opacity-60">{note}</p>
    </div>
  );
}
