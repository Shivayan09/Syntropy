"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import {
  ArrowRight,
  BadgeCheck,
  Check,
  Crown,
  Layers2,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Wallet,
  Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type PlanKey = "free" | "starter" | "pro" | "power";
type PurchaseKey =
  | "starter_monthly"
  | "pro_monthly"
  | "pro_annual"
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
    priceLabel: "₹0",
    quota: "3 AI tests total",
    description: "For first-time users who want to feel the workflow before paying.",
    features: [
      "Basic analytics",
      "Limited review depth",
      "Watermarked AI",
      "Manual tests always available",
    ],
    highlighted: false,
    cta: "Starter tier",
    itemKey: null,
  },
  {
    key: "starter",
    name: "Starter",
    priceLabel: "₹99/month",
    quota: "15 AI tests / month",
    description: "For casual but paying students who want a low-friction study rhythm.",
    features: [
      "15 AI test generations per month",
      "Standard explanations",
      "Weak-topic analysis",
      "Best impulse-buy plan",
    ],
    highlighted: true,
    cta: "Upgrade",
    itemKey: "starter_monthly",
  },
  {
    key: "pro",
    name: "Pro",
    priceLabel: "₹249/month",
    quota: "50 AI tests / month",
    description: "For serious learners who revise, retest, and improve every week.",
    features: [
      "50 AI test generations per month",
      "Better analytics",
      "Priority generation",
      "Revision recommendations",
    ],
    highlighted: false,
    cta: "Upgrade",
    itemKey: "pro_monthly",
  },
] as const;

const annualOffer = {
  itemKey: "pro_annual" as const,
  name: "Pro Annual",
  priceLabel: "₹1,999",
  quota: "50 AI tests per month",
  description: "Serious exam-prep students can stay on Pro for a full year with 2 months free.",
};

const topUps = [
  {
    itemKey: "topup_1" as const,
    name: "1 extra test",
    priceLabel: "Rs 9",
    description: "For one more attempt before you stop.",
  },
  {
    itemKey: "topup_5" as const,
    name: "5 extra tests",
    priceLabel: "Rs 49",
    description: "For short bursts between plan cycles.",
  },
  {
    itemKey: "topup_15" as const,
    name: "15 extra tests",
    priceLabel: "Rs 99",
    description: "For recovery without committing to a bigger plan.",
  },
] as const;

const planMeta = {
  free: {
    icon: ShieldCheck,
    summary: "A short trial that lets students experience the product before subscribing.",
    status: "Trial access",
  },
  starter: {
    icon: Zap,
    summary: "Balanced for students who want weekly AI practice without overspending.",
    status: "Most popular tier",
  },
  pro: {
    icon: Crown,
    summary: "Built for serious prep cycles with repeated tests, review, and correction.",
    status: "Serious prep tier",
  },
  power: {
    icon: Sparkles,
    summary: "Legacy tier",
    status: "Hidden tier",
  },
} as const;

const infoItems = [
  {
    title: "Retention-first access",
    description: "Usage value, exam rhythm, and plan clarity are visible at a glance.",
    icon: BadgeCheck,
  },
  {
    title: "Upgrade with context",
    description: "The current tier stays anchored while stronger plans show the practical jump.",
    icon: Layers2,
  },
  {
    title: "Mock-test relevant",
    description: "Everything is framed around tests, review depth, pace, and consistency.",
    icon: Target,
  },
] as const;

const offerMeta = {
  starter_monthly: {
    name: "Starter",
    description: "Starter monthly subscription",
  },
  pro_monthly: {
    name: "Pro",
    description: "Pro monthly subscription",
  },
  pro_annual: {
    name: "Pro Annual",
    description: "Pro annual subscription",
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

export default function PlansPage() {
  const { user, getMe } = useAuth();
  const [loading, setLoading] = useState<PurchaseKey | null>(null);
  const [checkoutReady, setCheckoutReady] = useState(false);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const currentPlanKey = (user?.plan || "free") as PlanKey;
  const currentPlan =
    useMemo(() => plans.find((plan) => plan.key === currentPlanKey) || plans[0], [currentPlanKey]);
  const nextPlan = useMemo(() => {
    if (currentPlanKey === "free") return plans.find((plan) => plan.key === "starter");
    if (currentPlanKey === "starter") return plans.find((plan) => plan.key === "pro");
    return null;
  }, [currentPlanKey]);
  const CurrentPlanIcon = planMeta[currentPlanKey].icon;
  const isPaidPlan = currentPlanKey !== "free";
  const currentRank = getPlanRank(currentPlanKey);

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
          receipt: `${itemKey}_${Date.now()}`,
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
          <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="card2 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 border border-black bg-primary px-3 py-1 text-white">
                  <CurrentPlanIcon size={16} className="text-white" />
                  <span className="text-sm font-extrabold uppercase">{currentPlan.name} Plan</span>
                </div>
                <div className="border border-black bg-(--surface) px-3 py-1 text-xs font-extrabold uppercase">
                  {planMeta[currentPlanKey].status}
                </div>
              </div>
              <div>
                <h1 className="text-3xl leading-tight font-extrabold md:text-4xl">
                  Your current setup is tuned for{" "}
                  <span className="text-primary">consistent practice</span>.
                </h1>

                <p className="mt-3 max-w-xl text-sm opacity-70">
                  {planMeta[currentPlanKey].summary} Every test you generate, every review you do,
                  feeds into a loop designed to improve accuracy and speed.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <StatTile label="AI tests" value={currentPlan.quota} note="included allowance" />
                <StatTile label="Progress loop" value="Active user" note="test -> review -> improve" />
                <StatTile
                  label={isPaidPlan ? "Valid till" : "Upgrade path"}
                  value={isPaidPlan ? formatExpiry(user?.planExpiry) : "Starter / Pro"}
                  note={isPaidPlan ? "billing cycle" : "monthly or top-up"}
                />
              </div>
              <div className="border border-dashed border-black bg-(--bg-secondary) p-4">
                <p className="text-sm font-extrabold">What this means for your prep</p>
                <p className="mt-1 text-sm opacity-70">
                  {currentPlanKey === "free"
                    ? "You can try the product properly, but regular AI practice will need a paid plan or a top-up."
                    : currentPlanKey === "starter"
                      ? "You can keep a weekly revision rhythm without overspending, and step up when prep intensity grows."
                      : "You can run repeated focused tests per week, making revision cycles tighter and more effective."}
                </p>
              </div>
            </div>

            <div className="card flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold uppercase opacity-60">What you can do right now</p>
              </div>

              

              {nextPlan && (
                <div className="border border-dashed border-black bg-(--surface) p-4">
                  <p className="text-xs font-bold uppercase opacity-60">Next step</p>

                  <p className="mt-1 text-lg font-extrabold">Move to {nextPlan.name}</p>

                  <p className="mt-2 text-sm opacity-70">
                    Unlock {nextPlan.quota.toLowerCase()} and shorten the gap between practice and
                    improvement.
                  </p>
                </div>
              )}

              <div className="grid gap-3">
                {infoItems.map((item) => (
                  <MiniPanel
                    key={item.title}
                    icon={item.icon}
                    title={item.title}
                    note={item.description}
                  />
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
                  <div
                    key={plan.key}
                    className={`${isCurrent ? "card2" : "card"} relative flex h-full flex-col justify-between p-0`}
                  >
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
                              : "Best when you only need a guided first experience."}
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
                      className={`w-full gap-2 rounded-none border-x-0 border-b-0 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none ${
                        plan.highlighted && !isCurrent ? "" : "button-secondary"
                      }`}
                    >
                      {isLoading ? "Processing..." : isCurrent ? "Current plan" : plan.cta}
                      {plan.itemKey && !isCurrent && <ArrowRight size={17} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-5 xl:grid-cols-[1fr_1fr]">
          <div className="card2 flex flex-col gap-5">
            <div className="flex items-center gap-2 text-primary">
              <Star size={18} />
              <p className="text-sm font-bold uppercase">Annual option</p>
            </div>

            <div>
              <h2 className="text-3xl font-extrabold">{annualOffer.name}</h2>
              <p className="mt-2 text-sm opacity-70">{annualOffer.description}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <StatTile label="Price" value={annualOffer.priceLabel} note="single yearly payment" />
              <StatTile label="Access" value={annualOffer.quota} note="monthly refill" />
              <StatTile label="Anchor" value="2 months free" note="best long-term value" />
            </div>

            <button
              onClick={() => handlePurchase(annualOffer.itemKey)}
              disabled={
                loading === annualOffer.itemKey ||
                (user?.plan === "pro" && user?.planBillingCycle === "annual")
              }
              className="w-full gap-2"
            >
              {loading === annualOffer.itemKey
                ? "Processing..."
                : user?.plan === "pro" && user?.planBillingCycle === "annual"
                  ? "Current annual plan"
                  : "Upgrade to Pro Annual"}
              {!(user?.plan === "pro" && user?.planBillingCycle === "annual") && (
                <ArrowRight size={17} />
              )}
            </button>
          </div>

          <div className="card flex flex-col gap-5">
            <div className="flex items-center gap-2 text-primary">
              <Wallet size={18} />
              <p className="text-sm font-bold uppercase">Top-up packs</p>
            </div>

            <div className="space-y-3">
              {topUps.map((pack) => (
                <div
                  key={pack.itemKey}
                  className="flex items-start justify-between gap-4 border border-(--border) bg-(--bg-secondary) p-4"
                >
                  <div>
                    <p className="text-lg font-extrabold">{pack.name}</p>
                    <p className="mt-1 text-sm opacity-70">{pack.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="border border-black bg-(--surface) px-3 py-1 text-sm font-extrabold">
                      {pack.priceLabel}
                    </span>
                    <button
                      onClick={() => handlePurchase(pack.itemKey)}
                      disabled={loading === pack.itemKey}
                      className="button-secondary gap-2"
                    >
                      {loading === pack.itemKey ? "Processing..." : "Buy now"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-10 text-center text-sm opacity-60">
          {isPaidPlan
            ? `Your ${currentPlan.name.toLowerCase()} access is active through ${formatExpiry(user?.planExpiry)}.`
            : "You are on the free trial right now. Upgrade anytime when you need more AI tests."}
        </div>
      </div>
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
    <div className="border border-(--border) p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-bold opacity-60">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-extrabold">{value}</p>
      <p className="mt-1 text-xs opacity-60">{note}</p>
    </div>
  );
}

function MiniPanel({
  icon: Icon,
  title,
  note,
}: {
  icon: typeof Star;
  title: string;
  note: string;
}) {
  return (
    <div className="card border border-(--border) bg-(--surface) p-4">
      <div className="mb-3 flex items-center gap-2 text-primary">
        <Icon size={18} />
        <p className="text-sm font-extrabold">{title}</p>
      </div>
      <p className="text-sm opacity-70">{note}</p>
    </div>
  );
}
