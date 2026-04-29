"use client";

import { ArrowRight, ClipboardPen, Sparkles, TicketCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AiTokenStatus as AiTokenStatusData } from "@/context/AiTokenContext";

type AiTokenStatusProps = {
  status?: AiTokenStatusData | null;
  compact?: boolean;
  showManualAction?: boolean;
};

const formatResetTime = (value?: string | null) => {
  if (!value) return "No scheduled reset";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getWindowCopy = (status: AiTokenStatusData) => {
  if (status.plan === "free") {
    return "Monthly free allowance";
  }

  return status.billingCycle === "annual" ? "Monthly refill on annual plan" : "Monthly refill";
};

export default function AiTokenStatus({
  status,
  compact = false,
  showManualAction = false,
}: AiTokenStatusProps) {
  const router = useRouter();
  const remaining = status?.remaining ?? 0;
  const includedRemaining = status?.includedRemaining ?? 0;
  const bonusRemaining = status?.bonusRemaining ?? 0;
  const cycleLimit = status?.cycleLimit ?? 0;
  const hasTokens = status?.hasTokens ?? remaining > 0;
  const resetTime = formatResetTime(status?.nextResetAt);
  const isUnavailable = !status;

  if (isUnavailable) {
    return (
      <div className={`border border-black bg-(--surface) p-4 ${compact ? "mt-5" : "card2 mb-7"}`}>
        <p className="text-sm font-extrabold">AI credit status unavailable</p>
        <p className="mt-1 text-xs opacity-65">
          You can still create unlimited manual tests. AI generation will verify your credits
          before creating a test.
        </p>
        {showManualAction && (
          <button
            type="button"
            onClick={() => router.push("/main/create/manual")}
            className="button-secondary mt-4 gap-2"
          >
            <ClipboardPen size={16} />
            Create manual test
          </button>
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`mt-5 border border-black bg-(--surface) p-4 ${hasTokens ? "" : "border-red-500!"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="flex items-center gap-2 text-sm font-extrabold">
              <TicketCheck size={17} className={hasTokens ? "text-primary" : "text-red-500"} />
              {remaining} AI credit{remaining === 1 ? "" : "s"} left
            </p>
            <p className="mt-1 text-xs opacity-65">
              {hasTokens
                ? `${includedRemaining} plan credits and ${bonusRemaining} top-up credits available.`
                : status.plan === "free"
                  ? `Your monthly free credits are finished. Next refill by ${resetTime}.`
                  : `Next refill by ${resetTime}.`}
            </p>
          </div>
          <span
            className={`shrink-0 border border-black px-2 py-1 text-xs font-extrabold ${
              hasTokens ? "bg-primary text-white" : "bg-red-500 text-white"
            }`}
          >
            {remaining}
          </span>
        </div>
      </div>
    );
  }

  return (
    <section className="card2 mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black text-white shadow-[4px_4px_0px_black] ${
            hasTokens ? "bg-primary" : "bg-red-500"
          }`}
        >
          <Sparkles size={24} />
        </div>
        <div>
          <p className="text-md md:text-xl font-extrabold">
            {hasTokens ? "AI test credits available" : "No AI credits available"}
          </p>
          <p className="mt-1 text-sm opacity-70">
            {hasTokens
              ? "Each AI-generated test uses 1 credit. Manual test creation stays unlimited."
              : status.plan === "free"
                ? "Your monthly free credits are finished, but you can unlock more with a plan or a top-up."
                : "Your included credits are empty right now, but manual test creation is always unlimited."}
          </p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-2 md:gap-5">
        <div className="border border-black bg-(--surface) p-3">
          <p className="text-xs font-extrabold uppercase opacity-55">Credits left</p>
          <p className="mt-1 text-xl font-extrabold">{remaining}</p>
          <p className="text-xs opacity-60">
            {includedRemaining} plan + {bonusRemaining} top-up
          </p>
        </div>
        <div className="border border-black bg-(--surface) p-3">
          <p className="text-xs font-extrabold uppercase opacity-55">Monthly allowance</p>
          <p className="mt-1 text-xl font-extrabold">{cycleLimit}</p>
          <p className="text-xs opacity-60">{getWindowCopy(status)}</p>
        </div>
        <div className="border border-black bg-(--surface) p-3">
          <p className="text-xs font-extrabold uppercase opacity-55">Next refill</p>
          <p className="mt-1 text-xl font-extrabold">{resetTime}</p>
          <p className="text-xs opacity-60">{status.planLabel} access</p>
        </div>
      </div>

      {!hasTokens && showManualAction && (
        <div className="lg:col-span-2 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => router.push("/main/create/manual")}
            className="button-secondary gap-2"
          >
            Create manual test instead
            <ArrowRight size={18} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/main/subscription")}
            className="gap-2"
          >
            Get more AI credits
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
