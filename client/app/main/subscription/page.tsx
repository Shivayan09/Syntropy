"use client";

import { useMemo, useState } from "react";
import Script from "next/script";
import { toast } from "react-toastify";
import {
    ArrowRight,
    BadgeCheck,
    CalendarClock,
    Check,
    Crown,
    Gauge,
    Layers2,
    LineChart,
    Shield,
    Rocket,
    ShieldCheck,
    Sparkles,
    Star,
    Target,
    Zap,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type PlanKey = "free" | "pro" | "elite";

type RazorpayResponse = {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
};

type RazorpayInstance = {
    open: () => void;
};

type RazorpayOptions = {
    key: string | undefined;
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
    theme: {
        color: string;
    };
};

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

const plans = [
    {
        key: "free",
        name: "Free",
        priceLabel: "Rs 0",
        tokens: "1 token/day",
        description: "For casual practice and first reps, good for casual learners",
        features: [
            "1 AI test per day",
            "Basic analytics",
            "Community support",
            "Basic analysis"
        ],
        highlighted: false,
        accent: "from-zinc-500/10 to-transparent",
        cta: "Starter tier",
    },
    {
        key: "pro",
        name: "Pro",
        priceLabel: "Rs 199/month",
        tokens: "5 tokens/day",
        description: "For serious learners who practice every week",
        features: [
            "5 AI tests per day",
            "Advanced analytics",
            "Priority processing",
            "Detailed solutions",
        ],
        highlighted: true,
        accent: "from-(--primary)/20 to-transparent",
        cta: "Upgrade to Pro",
    },
    {
        key: "elite",
        name: "Elite",
        priceLabel: "Rs 499/month",
        tokens: "20 tokens/day",
        description: "For heavy prep, faster iteration, and full access",
        features: [
            "20 AI tests per day",
            "All Pro features",
            "Faster generation",
            "Early feature access",
        ],
        highlighted: false,
        accent: "from-cyan-400/20 to-transparent",
        cta: "Upgrade to Elite",
    },
] as const;

const planMeta = {
    free: {
        icon: ShieldCheck,
        summary: "A steady starter tier for light practice.",
        benefits: [
            "Daily AI test access for quick revision",
            "Core analytics to keep momentum visible",
            "No billing commitment while you explore",
        ],
        status: "Starter access",
    },
    pro: {
        icon: Zap,
        summary: "Balanced for students who want consistent prep.",
        benefits: [
            "More daily test generation without waiting",
            "Deeper analytics and richer review loops",
            "Priority processing for smoother study sessions",
        ],
        status: "Most popular tier",
    },
    elite: {
        icon: Crown,
        summary: "Built for intense prep cycles and maximum output.",
        benefits: [
            "High daily test capacity for repeated practice",
            "Everything in Pro with faster turnaround",
            "Early feature access for power users",
        ],
        status: "Full-speed access",
    },
} as const;

const infoItems = [
    {
        title: "Retention-first access",
        description: "Daily usage value, exam rhythm, and plan clarity are visible at a glance.",
        icon: BadgeCheck,
    },
    {
        title: "Upgrade with context",
        description: "The current tier stays anchored while premium tiers show the practical jump.",
        icon: Layers2,
    },
    {
        title: "Mock-test relevant",
        description: "Everything is framed around tests, review depth, pace, and consistency.",
        icon: Target,
    },
] as const;

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
    if (plan === "elite") return 3;
    if (plan === "pro") return 2;
    return 1;
};

export default function PlansPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState<string | null>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const currentPlanKey = (user?.plan || "free") as PlanKey;
    const currentPlan = useMemo(
        () => plans.find((plan) => plan.key === currentPlanKey) || plans[0],
        [currentPlanKey]
    );
    const nextPlan = useMemo(() => {
        if (currentPlanKey === "free") return plans.find((plan) => plan.key === "pro");
        if (currentPlanKey === "pro") return plans.find((plan) => plan.key === "elite");
        return null;
    }, [currentPlanKey]);
    const CurrentPlanIcon = planMeta[currentPlanKey].icon;
    const isPaidPlan = currentPlanKey !== "free";
    const currentRank = getPlanRank(currentPlanKey);

    const handleUpgrade = async (plan: string) => {
        toast.warn("Coming soon")
    };

    return (
        <div>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

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
                                <div className="flex items-center gap-1 border border-black px-3 py-1 bg-primary text-white">
                                    <CurrentPlanIcon size={16} className="text-white" />
                                    <span className="text-sm font-extrabold uppercase">
                                        {currentPlan.name} Plan
                                    </span>
                                </div>

                            </div>
                            <div>
                                <h1 className="text-3xl font-extrabold md:text-4xl leading-tight">
                                    Your current setup is tuned for{" "}
                                    <span className="text-primary">consistent practice</span>.
                                </h1>

                                <p className="mt-3 text-sm opacity-70 max-w-xl">
                                    {planMeta[currentPlanKey].summary} Every test you generate, every review you do,
                                    feeds into a loop designed to improve accuracy and speed.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">

                                <StatTile icon={Gauge} label="Daily tests" value={currentPlan.tokens} note="AI generation limit" />

                                <StatTile icon={LineChart} label="Progress loop" value="Active" note="test → review → improve" />

                                <StatTile icon={CalendarClock} label={isPaidPlan ? "Valid till" : "Reset cycle"} value={isPaidPlan ? formatExpiry(user?.planExpiry) : "Daily"} note={isPaidPlan ? "billing cycle" : "resets every midnight"} />

                            </div>
                            <div className="border border-dashed border-black p-4 bg-(--bg-secondary)">
                                <p className="text-sm font-extrabold">
                                    What this means for your prep
                                </p>
                                <p className="text-sm opacity-70 mt-1">
                                    {currentPlanKey === "free"
                                        ? "You can stay consistent with daily tests, but scaling practice volume will require an upgrade."
                                        : currentPlanKey === "pro"
                                            ? "You can run multiple focused tests per day, making revision cycles tighter and more effective."
                                            : "You have full-speed practice. The limit is your time, not the platform."}
                                </p>
                            </div>
                        </div>

                        <div className="card flex flex-col gap-5">

                            <div>
                                <p className="text-xs font-bold uppercase opacity-60">
                                    What you can do right now
                                </p>
                            </div>

                            <div className="space-y-3">
                                {currentPlan.features.map((feature, index) => (
                                    <div key={feature} className="flex items-start gap-3 border border-(--border) bg-(--bg-secondary) p-3">
                                        <div className="grid h-6 w-6 place-items-center border border-black bg-primary text-white text-xs font-bold">
                                            {index + 1}
                                        </div>

                                        <div>
                                            <p className="text-sm font-extrabold">{feature}</p>
                                            <p className="text-xs opacity-60 mt-0.5">
                                                {index === 0
                                                    ? "Generate and attempt tests aligned to your subjects"
                                                    : index === 1
                                                        ? "Track performance and identify weak areas"
                                                        : index === 2
                                                            ? "Faster response and smoother experience"
                                                            : "Improve understanding with better breakdowns"}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {nextPlan && (
                                <div className="border border-dashed border-black p-4 bg-(--surface)">
                                    <p className="text-xs font-bold uppercase opacity-60">
                                        Next step
                                    </p>

                                    <p className="text-lg font-extrabold mt-1">
                                        Move to {nextPlan.name}
                                    </p>

                                    <p className="text-sm opacity-70 mt-2">
                                        Unlock {nextPlan.tokens.toLowerCase()} and shorten the gap between
                                        practice and improvement.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="mt-10">

                    <div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <p className="text-sm font-bold uppercase text-primary">All plans</p>
                                <h2 className="text-3xl font-extrabold mt-2">Compare tiers side by side</h2>
                            </div>
                            <p className="text-sm opacity-60">No hidden charges. Cancel anytime.</p>
                        </div>

                        <div className="mt-6 grid gap-5 xl:grid-cols-3">
                            {plans.map((plan) => {
                                const isCurrent = plan.key === currentPlanKey;
                                const isUpgrade = getPlanRank(plan.key) > currentRank;

                                return (
                                    <div
                                        key={plan.key}
                                        className={`${isCurrent ? "card2" : "card"} relative flex h-full flex-col justify-between p-0 ${plan.highlighted ? "" : ""}`}
                                    >
                                        <div className="p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <h3 className="text-2xl font-extrabold">{plan.name}</h3>
                                                    <p className="mt-1 text-sm opacity-70">{plan.description}</p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
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
                                                <p className="mt-1 text-sm font-bold text-primary">{plan.tokens}</p>
                                            </div>

                                            <ul className="mt-5 space-y-3">
                                                {plan.features.map((feature) => (
                                                    <li key={feature} className="flex items-start gap-3 text-sm">
                                                        <Check size={15} className="mt-0.5 shrink-0 text-primary" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <div className="mt-5 border border-dashed border-(--border) p-3 text-sm">
                                                <p className="font-extrabold">
                                                    {isCurrent
                                                        ? "You are here"
                                                        : isUpgrade
                                                            ? "More room for high-frequency prep"
                                                            : "Light entry point for new users"}
                                                </p>
                                                <p className="mt-1 opacity-60">
                                                    {isCurrent
                                                        ? "Your current workflow is mapped to this plan."
                                                        : isUpgrade
                                                            ? "Useful when AI generation becomes part of your weekly routine."
                                                            : "Best when you only need occasional practice."}
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleUpgrade(plan.key)}
                                            disabled={loading === plan.key || isCurrent || plan.key === "free"}
                                            className={`w-full gap-2 rounded-none border-x-0 border-b-0 shadow-none hover:translate-x-0 hover:translate-y-0 hover:shadow-none ${plan.highlighted && !isCurrent ? "" : "button-secondary"}`}
                                        >
                                            {loading === plan.key
                                                ? "Processing..."
                                                : isCurrent
                                                    ? "Current plan"
                                                    : plan.cta}
                                            {!isCurrent && <ArrowRight size={17} />}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                <div className="text-center text-sm opacity-60 mt-10">
                    {isPaidPlan
                        ? `Your ${currentPlan.name.toLowerCase()} access is active through ${formatExpiry(user?.planExpiry)}.`
                        : "You are on the free plan right now. Upgrade anytime when you need more daily tests."}
                </div>
            </div>
        </div>
    );
}

function StatTile({
    icon: Icon,
    label,
    value,
    note,
}: {
    icon: typeof Gauge;
    label: string;
    value: string;
    note: string;
}) {
    return (
        <div className="card2">
            <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold opacity-60">{label}</p>
                <Icon size={18} className="text-primary" />
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
        <div className="border border-(--border) bg-(--surface) p-4 card2">
            <div className="mb-3 flex items-center gap-2 text-primary">
                <Icon size={18} />
                <p className="text-sm font-extrabold">{title}</p>
            </div>
            <p className="text-sm opacity-70">{note}</p>
        </div>
    );
}
