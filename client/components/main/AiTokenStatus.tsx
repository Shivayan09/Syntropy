"use client";

import { ArrowRight, ClipboardPen, Sparkles, TicketCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import type { AiTokenStatus as AiTokenStatusData } from "@/context/AiTokenContext";

type AiTokenStatusProps = {
    status?: AiTokenStatusData | null;
    compact?: boolean;
    showManualAction?: boolean;
};

const formatResetTime = (value?: string) => {
    if (!value) return "daily";

    return new Date(value).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
};

export default function AiTokenStatus({ status, compact = false, showManualAction = false }: AiTokenStatusProps) {
    const router = useRouter();
    const remaining = status?.remaining ?? 0;
    const dailyLimit = status?.dailyLimit ?? 1;
    const hasTokens = status?.hasTokens ?? remaining > 0;
    const resetTime = formatResetTime(status?.nextResetAt);
    const isUnavailable = !status;

    if (isUnavailable) {
        return (
            <div className={`border border-black bg-(--surface) p-4 ${compact ? "mt-5" : "card2 mb-7"}`}>
                <p className="text-sm font-extrabold">AI token status unavailable</p>
                <p className="mt-1 text-xs opacity-65">
                    You can still create unlimited manual tests. AI generation will verify tokens before creating a test.
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
                            {remaining} Token{remaining === 1 ? "" : "s"} left
                        </p>
                        <p className="mt-1 text-xs opacity-65">
                            {hasTokens
                                ? "AI generation uses 1 token."
                                : `Next token resets at ${resetTime}.`}
                        </p>
                    </div>
                    <span className={`shrink-0 border border-black px-2 py-1 text-xs font-extrabold ${hasTokens ? "bg-primary text-white" : "bg-red-500 text-white"}`}>
                        {remaining}/{dailyLimit}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <section className={`card2 mb-7 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center`}>
            <div className="flex gap-4">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black text-white shadow-[4px_4px_0px_black] ${hasTokens ? "bg-primary" : "bg-red-500"}`}>
                    <TicketCheck size={24} />
                </div>
                <div>
                    <p className="text-xl font-extrabold">
                        {hasTokens ? "AI token available" : "No tokens left today"}
                    </p>
                    <p className="mt-1 text-sm opacity-70">
                        {hasTokens
                            ? "Generating this test will use 1 token from your daily AI allowance."
                            : "AI generation is paused for today, but manual test creation is always unlimited."}
                    </p>
                </div>
            </div>

            <div className="flex  gap-5">
                <div className="border border-black bg-(--surface) p-3">
                    <p className="text-xs font-extrabold uppercase opacity-55">Tokens left</p>
                    <p className="mt-1 text-3xl font-extrabold">{remaining}</p>
                    <p className="text-xs opacity-60">of {dailyLimit} today</p>
                </div>
                <div className="border border-black bg-(--surface) p-3">
                    <p className="text-xs font-extrabold uppercase opacity-55">Resets</p>
                    <p className="mt-1 text-lg font-extrabold">Tomorrow</p>
                    <p className="text-xs opacity-60">{resetTime}</p>
                </div>
                
            </div>

            {!hasTokens && showManualAction && (
                <div className="lg:col-span-2">
                    <button
                        type="button"
                        onClick={() => router.push("/main/create/manual")}
                        className="button-secondary w-full gap-2 sm:w-fit"
                    >
                        Create manual test instead
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}
        </section>
    );
}
