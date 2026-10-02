"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    ArrowRight,
    Brain,
    CheckCircle2,
    Lightbulb,
    RotateCcw,
    Target,
    Timer,
    XCircle,
} from "lucide-react";
import PracticeSkeleton from "@/components/skeletons/PracticeSkeleton";
import {
    AptitudePracticeSet,
    accuracyTone,
    fetchAptitudePracticeSet,
} from "@/lib/aptitude";

const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function AptitudePracticePage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [test, setTest] = useState<AptitudePracticeSet | null>(null);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(0);
    const [selected, setSelected] = useState<Record<number, number>>({});
    const [revealed, setRevealed] = useState<Record<number, boolean>>({});
    const [finished, setFinished] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const data = await fetchAptitudePracticeSet(id);
                setTest(data);
            } catch (err) {
                console.error("Failed to load practice set", err);
            } finally {
                setLoading(false);
            }
        };

        if (id) load();
    }, [id]);

    const questions = useMemo(() => test?.questions || [], [test]);
    const currentQuestion = questions[active];
    const isRevealed = Boolean(revealed[active]);
    const selectedOption = selected[active];

    const answeredCount = Object.keys(revealed).length;
    const correctCount = useMemo(
        () =>
            Object.keys(revealed).reduce((total, key) => {
                const index = Number(key);
                return selected[index] === questions[index]?.correctAnswer ? total + 1 : total;
            }, 0),
        [questions, revealed, selected],
    );
    const accuracy = answeredCount ? Math.round((correctCount / answeredCount) * 100) : 0;

    const chooseOption = (index: number) => {
        if (isRevealed) return;

        setSelected((current) => ({ ...current, [active]: index }));
        setRevealed((current) => ({ ...current, [active]: true }));
    };

    const goNext = () => {
        if (active >= questions.length - 1) {
            setFinished(true);
            return;
        }

        setActive((current) => current + 1);
    };

    const restart = () => {
        setSelected({});
        setRevealed({});
        setActive(0);
        setFinished(false);
    };

    if (loading) return <PracticeSkeleton />;

    if (!test || !questions.length) {
        return (
            <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5">
                <div className="card max-w-lg text-center">
                    <h2 className="text-3xl font-bold">Practice set not found</h2>
                    <p className="mt-3 text-sm opacity-65">
                        This aptitude set may have been removed or is unavailable.
                    </p>
                    <button onClick={() => router.push("/main/aptitude")} className="button-secondary mt-7 gap-2 mx-auto">
                        <ArrowLeft size={18} />
                        Back to Aptitude Gym
                    </button>
                </div>
            </div>
        );
    }

    if (finished) {
        const weakTopics = Object.keys(revealed)
            .map(Number)
            .filter((index) => selected[index] !== questions[index]?.correctAnswer)
            .map((index) => questions[index]?.topic)
            .filter((topic): topic is string => Boolean(topic));

        const uniqueWeakTopics = [...new Set(weakTopics)];

        return (
            <div className="space-y-7">
                <div className="card2">
                    <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                        <Brain size={18} />
                        Practice complete
                    </div>

                    <h1 className="mt-3 text-4xl font-extrabold">
                        {correctCount} / {answeredCount} correct
                    </h1>

                    <p className={`mt-2 text-xl font-extrabold ${accuracyTone(accuracy)}`}>{accuracy}% accuracy</p>

                    <p className="mt-3 max-w-2xl text-sm opacity-70">
                        Practice runs are not recorded in your attempt history. Take the timed round when you
                        want this set scored and tracked.
                    </p>

                    {uniqueWeakTopics.length > 0 && (
                        <div className="mt-6">
                            <p className="text-xs font-extrabold uppercase opacity-60">Topics you missed</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {uniqueWeakTopics.map((topic) => (
                                    <span key={topic} className="rounded-full bg-secondary px-3 py-1 text-sm">
                                        {topic}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-7 flex flex-wrap gap-3">
                        <button onClick={restart} className="gap-2">
                            <RotateCcw size={18} />
                            Practice again
                        </button>
                        <button
                            onClick={() => router.push(`/main/test/preview/${test._id}`)}
                            className="button-secondary gap-2"
                        >
                            <Timer size={18} />
                            Take it timed
                        </button>
                        <button onClick={() => router.push("/main/aptitude")} className="button-secondary gap-2">
                            Back to Aptitude Gym
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <section className="flex flex-col gap-4 border-b border-(--border) pb-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push("/main/aptitude")} className="button-secondary gap-2">
                        <ArrowLeft size={18} />
                        Exit
                    </button>

                    <div>
                        <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                            <Brain size={15} />
                            Practice mode · untimed
                        </div>
                        <h1 className="text-2xl font-extrabold">{test.title}</h1>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="rounded-xl bg-secondary px-4 py-2 text-center">
                        <p className="text-xs opacity-60">Solved</p>
                        <p className="font-extrabold">
                            {answeredCount}/{questions.length}
                        </p>
                    </div>
                    <div className="rounded-xl bg-secondary px-4 py-2 text-center">
                        <p className="text-xs opacity-60">Accuracy</p>
                        <p className={`font-extrabold ${accuracyTone(accuracy)}`}>{accuracy}%</p>
                    </div>
                </div>
            </section>

            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${((active + 1) / questions.length) * 100}%` }}
                />
            </div>

            <article className="card">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        {currentQuestion.subject && (
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                                {currentQuestion.subject}
                            </span>
                        )}
                        {currentQuestion.topic && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs">{currentQuestion.topic}</span>
                        )}
                        {currentQuestion.difficulty && (
                            <span className="rounded-full bg-secondary px-3 py-1 text-xs">
                                {currentQuestion.difficulty}
                            </span>
                        )}
                    </div>

                    <p className="text-sm font-bold opacity-65">
                        {active + 1} of {questions.length}
                    </p>
                </div>

                <h2 className="mt-5 whitespace-pre-wrap text-xl font-extrabold leading-relaxed md:text-2xl">
                    {currentQuestion.question}
                </h2>

                <div className="mt-6 space-y-3">
                    {currentQuestion.options?.map((option, index) => {
                        const isChosen = selectedOption === index;
                        const isCorrect = currentQuestion.correctAnswer === index;
                        const showCorrect = isRevealed && isCorrect;
                        const showWrong = isRevealed && isChosen && !isCorrect;

                        return (
                            <div
                                key={`${option}-${index}`}
                                role="button"
                                tabIndex={isRevealed ? -1 : 0}
                                onClick={() => chooseOption(index)}
                                onKeyDown={(event) => {
                                    if ((event.key === "Enter" || event.key === " ") && !isRevealed) {
                                        event.preventDefault();
                                        chooseOption(index);
                                    }
                                }}
                                className={`flex min-h-16 items-start justify-between gap-4 rounded-xl border p-4 transition-colors md:p-5 ${
                                    showCorrect
                                        ? "border-primary bg-primary text-white"
                                        : showWrong
                                          ? "border-[#ef4444] bg-[#ef4444] text-white"
                                          : "border-(--border) bg-(--surface)"
                                } ${isRevealed ? "cursor-default" : "cursor-pointer hover:border-primary"}`}
                            >
                                <div className="flex items-start gap-4">
                                    <span
                                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm font-extrabold ${
                                            showCorrect || showWrong
                                                ? "border-white bg-white text-black"
                                                : "border-(--border) bg-(--bg-secondary)"
                                        }`}
                                    >
                                        {optionLabels[index] || index + 1}
                                    </span>
                                    <p className="pt-1 font-semibold leading-relaxed">{option}</p>
                                </div>

                                {(showCorrect || showWrong) && (
                                    <div className="shrink-0 pt-1">
                                        {showCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {isRevealed && (
                    <div className="mt-6 space-y-4">
                        {currentQuestion.approach && (
                            <div className="card2">
                                <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                                    <Lightbulb size={15} />
                                    Fastest approach
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                                    {currentQuestion.approach}
                                </p>
                            </div>
                        )}

                        {currentQuestion.explanation && (
                            <div className="rounded-xl border border-(--border) bg-(--surface) p-5">
                                <div className="flex items-center gap-2 text-xs font-extrabold uppercase opacity-60">
                                    <Target size={15} />
                                    Solution
                                </div>
                                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                                    {currentQuestion.explanation}
                                </p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-6 flex flex-col gap-3 border-t border-(--border) pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <button
                        className="button-secondary gap-2"
                        disabled={active === 0}
                        onClick={() => setActive((current) => Math.max(0, current - 1))}
                    >
                        <ArrowLeft size={18} />
                        Previous
                    </button>

                    <p className="text-sm font-bold opacity-65">
                        {isRevealed ? "Answer revealed" : "Pick an option to see the solution"}
                    </p>

                    <button onClick={goNext} className="gap-2">
                        {active >= questions.length - 1 ? "Finish practice" : "Next"}
                        <ArrowRight size={18} />
                    </button>
                </div>
            </article>
        </div>
    );
}
