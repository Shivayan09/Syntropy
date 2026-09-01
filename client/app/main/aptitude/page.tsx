"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowRight,
    Brain,
    Briefcase,
    Calculator,
    Clock3,
    FileQuestion,
    Flame,
    Lightbulb,
    ListChecks,
    Puzzle,
    RotateCcw,
    Shapes,
    SpellCheck,
    Sparkles,
    Target,
    Timer,
    Zap,
} from "lucide-react";
import { toast } from "react-toastify";
import AiTokenStatus from "@/components/main/AiTokenStatus";
import TestsSkeleton from "@/components/skeletons/TestsSkeleton";
import Loader2 from "@/components/utils/Loader2";
import { AiTokenStatus as AiTokenStatusType, useAiTokens } from "@/context/AiTokenContext";
import { useAuth } from "@/context/AuthContext";
import {
    AptitudeCatalog,
    AptitudePreset,
    AptitudeStats,
    AptitudeTest,
    accuracyTone,
    fetchAptitudeCatalog,
    fetchAptitudeStats,
    fetchAptitudeTests,
    formatAptitudeDate,
} from "@/lib/aptitude";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const sectionIcons: Record<string, typeof Calculator> = {
    quantitative: Calculator,
    logical: Puzzle,
    verbal: SpellCheck,
    "data-interpretation": Shapes,
};

export default function AptitudeHubPage() {
    const router = useRouter();
    const { user, getMe } = useAuth();
    const { tokenStatus, refreshTokenStatus, setTokenStatus } = useAiTokens();

    const [catalog, setCatalog] = useState<AptitudeCatalog | null>(null);
    const [tests, setTests] = useState<AptitudeTest[]>([]);
    const [stats, setStats] = useState<AptitudeStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [generatingPreset, setGeneratingPreset] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [catalogData, testsData, statsData] = await Promise.all([
                    fetchAptitudeCatalog(),
                    fetchAptitudeTests(),
                    fetchAptitudeStats(),
                ]);

                setCatalog(catalogData);
                setTests(testsData);
                setStats(statsData);
            } catch (err) {
                console.error("Failed to load aptitude data", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    const hasTokens = tokenStatus?.hasTokens ?? true;

    const runPreset = async (preset: AptitudePreset) => {
        if (generatingPreset) return;

        if (tokenStatus && !hasTokens) {
            toast.warn("No AI test credits left right now.");
            return;
        }

        try {
            setGeneratingPreset(preset.key);

            const res = await fetch(BACKEND_URL + "/api/aptitude/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ presetKey: preset.key }),
            });

            const data = await res.json();

            if (data.aiTokenStatus) {
                setTokenStatus(data.aiTokenStatus as AiTokenStatusType);
            } else {
                await refreshTokenStatus();
            }

            if (!res.ok) {
                toast.warn(data.message || "Could not build this practice set");
                setGeneratingPreset(null);
                return;
            }

            toast.success("Aptitude set ready");
            await getMe();
            router.push(`/main/test/preview/${data.testId}`);
        } catch (err) {
            console.error("Failed to generate aptitude preset", err);
            toast.error("Could not build this practice set");
            setGeneratingPreset(null);
        }
    };

    if (generatingPreset) {
        return <Loader2 />;
    }

    const statCards = [
        { label: "Practice sets", value: stats?.setsGenerated ?? 0, hint: "generated so far", icon: ListChecks },
        { label: "Questions solved", value: stats?.questionsSolved ?? 0, hint: "across all attempts", icon: FileQuestion },
        { label: "Overall accuracy", value: `${stats?.accuracy ?? 0}%`, hint: "answered correctly", icon: Target },
        { label: "Best attempt", value: `${stats?.bestAccuracy ?? 0}%`, hint: "highest accuracy", icon: Flame },
    ];

    return (
        <div className="space-y-7 relative">
            {!user?.onboardingCompleted && (
                <div
                    onClick={() => router.push("/main/profile/education")}
                    className="md:absolute mb-5 md:mb-0 right-0 z-50 bg-yellow-50 text-black flex items-center gap-2 text-sm px-3 py-2 w-fit rounded-md cursor-pointer transition-all"
                >
                    <div className="h-2 w-2 bg-yellow-300 animate-pulse rounded-full"></div>
                    Complete your profile for sharper practice sets <ArrowRight className="h-4" />
                </div>
            )}

            <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                    <Brain size={18} />
                    Aptitude Lab
                </div>
            </section>

            <div className="card2 -mt-3">
                <p className="text-sm opacity-70 mb-2">INTERVIEW PREP MODE</p>
                <h1 className="text-4xl font-extrabold">Crack the aptitude round.</h1>
                <p className="opacity-70 mt-3 max-w-2xl">
                    Quant, reasoning, verbal and data interpretation sets built the way placement and
                    interview papers are set. Practice untimed with instant solutions, or attempt a timed
                    round like the real thing.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">
                    <button onClick={() => router.push("/main/aptitude/generate")} className="gap-2">
                        <Sparkles size={18} />
                        Build a practice set
                    </button>
                    <button onClick={() => router.push("/main/create")} className="button-secondary gap-2">
                        Subject tests instead
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>

            <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                {statCards.map((card) => (
                    <div key={card.label} className="card p-5">
                        <div className="flex items-center gap-2">
                            <card.icon size={17} className="text-primary" />
                            <p className="text-xs font-bold uppercase opacity-60">{card.label}</p>
                        </div>
                        <p className="mt-3 text-3xl font-extrabold">{card.value}</p>
                        <p className="text-xs opacity-60">{card.hint}</p>
                    </div>
                ))}
            </section>

            <AiTokenStatus status={tokenStatus} compact />

            <section>
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                        <Zap size={17} />
                        Quick start
                    </div>
                    <p className="mt-2 text-sm opacity-70">
                        One click builds a ready set with the pattern already tuned. Uses 1 AI credit.
                    </p>
                </div>

                {loading ? (
                    <TestsSkeleton />
                ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {catalog?.presets.map((preset) => (
                            <article key={preset.key} className="card flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <Briefcase size={16} className="text-primary" />
                                        <p className="text-xs font-extrabold uppercase opacity-60">
                                            {catalog.companies.find((company) => company.key === preset.company)?.label || "Placement"}
                                        </p>
                                    </div>

                                    <h3 className="mt-3 text-xl font-extrabold">{preset.label}</h3>
                                    <p className="mt-2 text-sm opacity-70">{preset.description}</p>

                                    <div className="mt-4 flex flex-wrap gap-3 text-xs opacity-70">
                                        <span className="inline-flex items-center gap-1">
                                            <FileQuestion size={14} className="text-primary" />
                                            {preset.questions} questions
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Clock3 size={14} className="text-primary" />
                                            {preset.duration} min
                                        </span>
                                        <span className="inline-flex items-center gap-1">
                                            <Target size={14} className="text-primary" />
                                            {preset.difficulty}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => runPreset(preset)}
                                    disabled={Boolean(generatingPreset)}
                                    className="mt-5 w-full justify-between"
                                >
                                    Build this set
                                    <ArrowRight size={18} />
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                        <ListChecks size={17} />
                        Sections
                    </div>
                    <p className="mt-2 text-sm opacity-70">
                        Pick a section to drill the exact topics interviewers ask from.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    {catalog?.sections.map((section) => {
                        const Icon = sectionIcons[section.key] || Brain;
                        const sectionStat = stats?.sections.find((entry) => entry.name === section.label);

                        return (
                            <article key={section.key} className="card flex flex-col justify-between">
                                <div>
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <Icon size={26} className="text-primary" />
                                            <h3 className="text-xl font-extrabold">{section.label}</h3>
                                        </div>

                                        {sectionStat && sectionStat.attempted > 0 && (
                                            <span className={`text-sm font-extrabold ${accuracyTone(sectionStat.accuracy)}`}>
                                                {sectionStat.accuracy}%
                                            </span>
                                        )}
                                    </div>

                                    <p className="mt-3 text-sm opacity-70">{section.blurb}</p>

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {section.topics.slice(0, 8).map((topic) => (
                                            <span key={topic} className="rounded-full bg-secondary px-3 py-1 text-xs">
                                                {topic}
                                            </span>
                                        ))}
                                        {section.topics.length > 8 && (
                                            <span className="rounded-full bg-secondary px-3 py-1 text-xs opacity-70">
                                                +{section.topics.length - 8} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => router.push(`/main/aptitude/generate?section=${section.key}`)}
                                    className="button-secondary mt-5 w-full justify-between"
                                >
                                    Practice {section.label}
                                    <ArrowRight size={18} />
                                </button>
                            </article>
                        );
                    })}
                </div>
            </section>

            {stats && stats.weakTopics.length > 0 && (
                <section className="card2">
                    <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                        <Lightbulb size={17} />
                        Topics to fix first
                    </div>
                    <p className="mt-2 text-sm opacity-70">
                        Your accuracy is below 60% here. Generate a focused set on these before your next round.
                    </p>

                    <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {stats.weakTopics.map((topic) => (
                            <div key={topic.name} className="border border-(--border) bg-(--surface) rounded-xl p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="font-bold">{topic.name}</p>
                                    <span className={`text-sm font-extrabold ${accuracyTone(topic.accuracy)}`}>
                                        {topic.accuracy}%
                                    </span>
                                </div>
                                <p className="mt-1 text-xs opacity-60">
                                    {topic.correct} correct out of {topic.attempted} attempted
                                </p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() =>
                            router.push(
                                `/main/aptitude/generate?topics=${encodeURIComponent(
                                    stats.weakTopics.map((topic) => topic.name).join("|"),
                                )}`,
                            )
                        }
                        className="mt-6 gap-2"
                    >
                        <Sparkles size={18} />
                        Build a set on these topics
                    </button>
                </section>
            )}

            <section>
                <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                            <Timer size={17} />
                            Your aptitude sets
                        </div>
                        <p className="mt-2 text-sm opacity-70">
                            Practice mode reveals answers instantly. Timed mode records the attempt in your history.
                        </p>
                    </div>
                </div>

                {loading ? (
                    <TestsSkeleton />
                ) : tests.length === 0 ? (
                    <div className="card grid min-h-64 place-items-center p-7 text-center">
                        <div>
                            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white">
                                <Brain size={26} />
                            </div>
                            <p className="text-2xl font-extrabold">No aptitude sets yet</p>
                            <p className="mx-auto mt-2 max-w-md text-sm opacity-65">
                                Build your first set from a quick start card above, or customise sections and
                                topics yourself.
                            </p>
                            <button onClick={() => router.push("/main/aptitude/generate")} className="mt-6 gap-2 mx-auto">
                                <Sparkles size={18} />
                                Build a practice set
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {tests.map((test) => (
                            <article key={test._id} className="card border border-(--border)">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                                                <Brain size={12} />
                                                Aptitude
                                            </span>
                                            {test.aptitude?.companyLabel && (
                                                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                                                    {test.aptitude.companyLabel}
                                                </span>
                                            )}
                                            {test.difficulty && (
                                                <span className="rounded-full bg-secondary px-2.5 py-1 text-xs">
                                                    {test.difficulty}
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-3 truncate text-xl font-bold">{test.title}</p>

                                        <div className="mt-2 flex flex-wrap gap-4 text-xs opacity-70">
                                            <span className="inline-flex items-center gap-1">
                                                <FileQuestion size={14} className="text-primary" />
                                                {test.totalQuestions} questions
                                            </span>
                                            <span className="inline-flex items-center gap-1">
                                                <Clock3 size={14} className="text-primary" />
                                                {test.duration} min
                                            </span>
                                            <span>{formatAptitudeDate(test.createdAt)}</span>
                                        </div>

                                        {test.subjects && test.subjects.length > 0 && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {test.subjects.map((subject) => (
                                                    <span key={subject} className="rounded-full bg-secondary px-3 py-1 text-xs">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
                                        <button
                                            className="button-secondary gap-2"
                                            onClick={() => router.push(`/main/aptitude/practice/${test._id}`)}
                                        >
                                            <RotateCcw size={17} />
                                            Practice
                                        </button>
                                        <button
                                            className="gap-2"
                                            onClick={() => router.push(`/main/test/preview/${test._id}`)}
                                        >
                                            <Timer size={17} />
                                            Timed round
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
