"use client";

import {
    ArrowRight,
    Brain,
    ClipboardPen,
    FlaskConical,
    ListChecks,
    Settings2,
    Sparkles,
    Timer,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AiTokenStatus from "@/components/main/AiTokenStatus";
import { useAiTokens } from "@/context/AiTokenContext";
import { useAuth } from "@/context/AuthContext";

const modes = [
    {
        key: "generate",
        icon: Sparkles,
        title: "AI Test Generator",
        badge: "1 credit per test",
        desc: "Pick subjects, difficulty and duration, and get a ready-to-attempt paper in seconds.",
        chips: ["Quick revision", "Multi-subject drills", "Daily practice", "Weak-area targeting"],
        meta: "Uses 1 AI credit per test",
        action: "Generate with AI",
        href: "/main/create/generate",
    },
    {
        key: "manual",
        icon: ClipboardPen,
        title: "Manual Builder",
        badge: "Always free",
        desc: "Write every question yourself with full control over structure, marks and difficulty.",
        chips: ["Mock exams", "Chapter revision", "Important questions", "Concept checks"],
        meta: "No credits needed, unlimited tests",
        action: "Build it manually",
        href: "/main/create/manual",
    },
];

const flow = [
    {
        icon: ListChecks,
        title: "Pick a mode",
        desc: "Generate with AI for speed, or build manually for full control.",
    },
    {
        icon: Settings2,
        title: "Set it up",
        desc: "Choose subjects, question count, marks and duration.",
    },
    {
        icon: Timer,
        title: "Attempt it",
        desc: "Take it in a timed window, then review results and analytics.",
    },
];

export default function CreateTestPage() {
    const router = useRouter();
    const { tokenStatus } = useAiTokens();
    const { user } = useAuth();

    return (
        <div className="space-y-7 relative">
            {!user?.onboardingCompleted && (
                <div
                    onClick={() => router.push("/main/profile/education")}
                    className="md:absolute mb-5 md:mb-0 right-0 z-50 bg-yellow-50 text-black flex items-center gap-2 text-sm px-3 py-2 w-fit rounded-md cursor-pointer transition-all"
                >
                    <div className="h-2 w-2 bg-yellow-300 animate-pulse rounded-full"></div>
                    Add your syllabus in profile for personalized tests <ArrowRight className="h-4" />
                </div>
            )}

            <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                    <FlaskConical size={18} />
                    Test laboratory
                </div>
            </section>

            <div className="card2 -mt-3">
                <p className="text-sm opacity-70 mb-2">CREATE MODE</p>
                <h1 className="text-4xl font-extrabold">Build a test that fits your goal.</h1>
                <p className="opacity-70 mt-3 max-w-2xl">
                    Two ways to get to a paper: let AI draft one from your subjects, or write it
                    yourself question by question. Both end up in the same timed attempt flow.
                </p>
            </div>

            <AiTokenStatus status={tokenStatus} compact />

            <section className="grid gap-5 md:grid-cols-2">
                {modes.map((mode) => (
                    <article key={mode.key} className="card flex flex-col">
                        <div className="flex items-start justify-between gap-4">
                            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-(--border) bg-(--surface) text-primary shadow-(--shadow-sm)">
                                <mode.icon size={22} />
                            </span>
                            <span className="rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-extrabold opacity-70">
                                {mode.badge}
                            </span>
                        </div>

                        <h2 className="mt-5 text-2xl font-extrabold">{mode.title}</h2>
                        <p className="mt-2 text-sm opacity-70">{mode.desc}</p>

                        <div className="mt-5 flex flex-wrap gap-2">
                            {mode.chips.map((chip) => (
                                <span
                                    key={chip}
                                    className="rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-semibold opacity-75"
                                >
                                    {chip}
                                </span>
                            ))}
                        </div>

                        <p className="mt-auto pt-6 text-xs font-bold uppercase tracking-wide opacity-55">
                            {mode.meta}
                        </p>

                        <button
                            onClick={() => router.push(mode.href)}
                            className="mt-3 w-full justify-between"
                        >
                            {mode.action}
                            <ArrowRight size={18} />
                        </button>
                    </article>
                ))}
            </section>

            <section>
                <div className="mb-4 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                    <ListChecks size={17} />
                    How it works
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {flow.map((step, i) => (
                        <div key={step.title} className="card flex items-start gap-4">
                            <span className="step-badge">{i + 1}</span>
                            <div>
                                <p className="flex items-center gap-2 font-extrabold">
                                    <step.icon size={16} className="text-primary" />
                                    {step.title}
                                </p>
                                <p className="mt-1 text-sm opacity-65">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <div className="card2 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <Brain size={28} className="text-primary" />
                        <p className="text-2xl font-extrabold">Preparing for placements?</p>
                    </div>
                    <p className="mt-3 max-w-2xl text-sm opacity-70">
                        The Aptitude Gym is a separate space for interview rounds: quant, reasoning, verbal
                        and data interpretation sets tuned to company patterns, with untimed practice and
                        instant solutions.
                    </p>
                </div>

                <button onClick={() => router.push("/main/aptitude")} className="gap-2 lg:shrink-0">
                    Open Aptitude Gym
                    <ArrowRight size={18} />
                </button>
            </div>
        </div>
    );
}
