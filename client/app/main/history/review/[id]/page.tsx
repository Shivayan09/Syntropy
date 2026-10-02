"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  FileQuestion,
  Lightbulb,
  Map as MapIcon,
  MessageSquareText,
  PenLine,
  RotateCcw,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ReviewSkeleton from "@/components/skeletons/ReviewSkeleton";

type Question = {
  question: string;
  options?: string[];
  correctAnswer?: number;
  marks?: number;
  explanation?: string;
  approach?: string;
  topic?: string;
  subject?: string;
};

type AnswerEntry = {
  answer?: string | number | null;
  marksAwarded?: number;
  feedback?: string;
};

type RawAnswer = AnswerEntry | number | string | null | undefined;

type ReviewAttempt = {
  _id: string;
  answers?: RawAnswer[];
  score?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  accuracy?: number;
  obtainedMarks?: number;
  totalMarks?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  duration?: number;
  status?: string;
  test?: {
    _id?: string;
    title?: string;
    subjects?: string[];
    category?: "academic" | "aptitude";
    questions?: Question[];
    testFormat?: "mcq" | "subjective";
    totalMarks?: number;
  };
};

type QuestionState = "correct" | "wrong" | "skipped" | "answered";
type Filter = "all" | QuestionState;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const formatDateTime = (value?: string) => {
  if (!value) return "Not recorded";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDuration = (attempt: ReviewAttempt) => {
  if (attempt.startedAt && attempt.completedAt) {
    const seconds = Math.round(
      (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 1000,
    );

    if (Number.isFinite(seconds) && seconds >= 0) {
      const minutes = Math.floor(seconds / 60);
      const remaining = seconds % 60;
      return minutes > 0 ? `${minutes}m ${String(remaining).padStart(2, "0")}s` : `${remaining}s`;
    }
  }

  return attempt.duration ? `${attempt.duration} min` : "--";
};

const normalizeAnswerEntry = (entry: RawAnswer): AnswerEntry => {
  if (entry === null || entry === undefined || typeof entry === "number" || typeof entry === "string") {
    return { answer: entry ?? null, marksAwarded: 0, feedback: "" };
  }

  return {
    answer: entry.answer ?? null,
    marksAwarded: entry.marksAwarded ?? 0,
    feedback: entry.feedback ?? "",
  };
};

const getQuestionState = (question: Question, answerEntry: AnswerEntry | undefined, isMCQ: boolean): QuestionState => {
  if (!isMCQ) {
    const answer = typeof answerEntry?.answer === "string" ? answerEntry.answer.trim() : answerEntry?.answer;
    return answer === undefined || answer === null || answer === "" ? "skipped" : "answered";
  }

  const selected = typeof answerEntry?.answer === "number" ? answerEntry.answer : null;

  if (selected === null) return "skipped";
  return selected === question.correctAnswer ? "correct" : "wrong";
};

const stateMeta: Record<QuestionState, { label: string; icon: LucideIcon; dot: string }> = {
  correct: { label: "Correct", icon: CheckCircle2, dot: "var(--chart-correct)" },
  answered: { label: "Answered", icon: CheckCircle2, dot: "var(--chart-correct)" },
  wrong: { label: "Wrong", icon: XCircle, dot: "var(--chart-wrong)" },
  skipped: { label: "Skipped", icon: Circle, dot: "var(--chart-skipped)" },
};

const stateBadgeClass = (state: QuestionState) => {
  if (state === "correct" || state === "answered") return "bg-primary text-white";
  if (state === "wrong") return "bg-(--chart-wrong) text-white";
  return "border border-(--border) bg-(--bg-secondary)";
};

export default function AttemptReviewPage() {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <AttemptReview />
    </Suspense>
  );
}

function AttemptReview() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const attemptId = params.id;

  const [attempt, setAttempt] = useState<ReviewAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(() => {
    const requested = Number(searchParams.get("q"));
    return Number.isInteger(requested) && requested >= 0 ? requested : 0;
  });
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await fetch(BACKEND_URL + `/api/attempt/${attemptId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return;
        setAttempt(data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) fetchAttempt();
  }, [attemptId]);

  const questions = useMemo(() => attempt?.test?.questions || [], [attempt]);
  const answers = useMemo(() => (attempt?.answers || []).map(normalizeAnswerEntry), [attempt]);

  const isMCQ =
    attempt?.test?.testFormat === "mcq" ||
    (attempt?.test?.testFormat !== "subjective" &&
      questions.some((question) => Array.isArray(question.options) && question.options.length > 0));

  const states = useMemo(
    () => questions.map((question, index) => getQuestionState(question, answers[index], isMCQ)),
    [answers, isMCQ, questions],
  );

  // Clamp so a stale ?q= never points past the end of the paper.
  const activeIndex = questions.length ? Math.min(active, questions.length - 1) : 0;

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;

      if (event.key === "ArrowRight") {
        setActive((current) => Math.min(questions.length - 1, Math.min(current, questions.length - 1) + 1));
      } else if (event.key === "ArrowLeft") {
        setActive((current) => Math.max(0, Math.min(current, questions.length - 1) - 1));
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [questions.length]);

  if (loading) return <ReviewSkeleton />;

  const currentQuestion = questions[activeIndex];

  if (!attempt || !currentQuestion) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5">
        <div className="card max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
            <FileQuestion size={26} />
          </div>
          <p className="text-3xl font-extrabold">Review unavailable</p>
          <p className="mt-3 text-sm opacity-65">This attempt could not be loaded or has no questions.</p>
          <button onClick={() => router.push("/main/history")} className="mx-auto mt-7 gap-2">
            <ArrowLeft size={18} />
            Back to history
          </button>
        </div>
      </div>
    );
  }

  const currentAnswer = answers[activeIndex];
  const currentState = states[activeIndex];
  const selectedOption = typeof currentAnswer?.answer === "number" ? currentAnswer.answer : null;

  const answeredCount = states.filter((state) => state !== "skipped").length;
  const correctCount = isMCQ ? attempt.correct ?? states.filter((state) => state === "correct").length : answeredCount;
  const wrongCount = isMCQ ? attempt.wrong ?? states.filter((state) => state === "wrong").length : 0;
  const skippedCount = attempt.skipped ?? states.filter((state) => state === "skipped").length;

  const totalMarks =
    attempt.totalMarks ?? attempt.test?.totalMarks ?? questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const obtainedMarks = attempt.obtainedMarks ?? answers.reduce((sum, entry) => sum + (entry?.marksAwarded || 0), 0);

  const accuracy = Math.round(
    typeof attempt.accuracy === "number"
      ? attempt.accuracy
      : isMCQ
        ? questions.length
          ? (correctCount / questions.length) * 100
          : 0
        : totalMarks > 0
          ? (obtainedMarks / totalMarks) * 100
          : 0,
  );

  const subjectLabel = attempt.test?.subjects?.join(", ") || "General";
  const isAptitude = attempt.test?.category === "aptitude";

  const filters: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: questions.length },
    ...(isMCQ
      ? [
          { key: "correct" as Filter, label: "Correct", count: correctCount },
          { key: "wrong" as Filter, label: "Wrong", count: wrongCount },
        ]
      : [{ key: "answered" as Filter, label: "Answered", count: answeredCount }]),
    { key: "skipped", label: "Skipped", count: skippedCount },
  ];

  const visibleIndexes = questions
    .map((_, index) => index)
    .filter((index) => filter === "all" || states[index] === filter);

  const CurrentStateIcon = stateMeta[currentState].icon;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <section className="border-b border-(--border) pb-4">
        <div className="flex items-center justify-between gap-4">
          <div
            role="button"
            tabIndex={0}
            onClick={() => router.push("/main/history")}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                router.push("/main/history");
              }
            }}
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-bold opacity-70 transition-opacity hover:opacity-100"
          >
            <ArrowLeft size={16} />
            Back to history
          </div>

          <p className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <FileQuestion size={16} />
            Answer review
          </p>
        </div>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="truncate text-3xl font-extrabold leading-tight md:text-4xl">
              {attempt.test?.title || "Mock Test"}
            </h1>
            <p className="mt-2 text-sm opacity-65">
              Attempted {formatDateTime(attempt.completedAt || attempt.createdAt)} · {subjectLabel} ·{" "}
              {isMCQ ? "MCQ" : "Subjective"}
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
            <button
              onClick={() => router.push(`/main/test/result/${attempt._id}`)}
              className="button-secondary gap-2"
            >
              <Trophy size={18} />
              Score summary
            </button>
            {attempt.test?._id && (
              <button onClick={() => router.push(`/main/test/preview/${attempt.test?._id}`)} className="gap-2">
                <RotateCcw size={18} />
                Retake test
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <SummaryStat
          highlighted
          icon={Target}
          label="Score"
          value={
            <>
              {isMCQ ? attempt.score ?? correctCount : obtainedMarks}
              <span className="text-base opacity-55">/{isMCQ ? questions.length : totalMarks}</span>
            </>
          }
          hint={isMCQ ? `${correctCount} correct answer${correctCount === 1 ? "" : "s"}` : "marks awarded"}
        />
        <SummaryStat
          icon={CheckCircle2}
          label="Accuracy"
          value={`${accuracy}%`}
          hint={`${answeredCount} of ${questions.length} attempted`}
        />
        <SummaryStat
          icon={Clock3}
          label="Time taken"
          value={getDuration(attempt)}
          hint={attempt.duration ? `of ${attempt.duration} min allowed` : "duration not recorded"}
        />
        <SummaryStat
          icon={FileQuestion}
          label="Questions"
          value={String(questions.length)}
          hint={`${skippedCount} skipped`}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Question */}
        <article className="card p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-extrabold uppercase">
                Question {activeIndex + 1}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold uppercase ${stateBadgeClass(currentState)}`}
              >
                <CurrentStateIcon size={13} />
                {stateMeta[currentState].label}
              </span>
              {currentQuestion.topic && (
                <span className="bg-primary-soft inline-flex items-center rounded-full px-3 py-1 text-xs font-bold text-primary">
                  {currentQuestion.topic}
                </span>
              )}
              {!isMCQ && (
                <span className="inline-flex items-center rounded-full border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-bold">
                  {currentQuestion.marks || 0} marks
                </span>
              )}
            </div>
            <p className="text-sm font-bold opacity-65">
              {activeIndex + 1} of {questions.length}
            </p>
          </div>

          <h2 className="mt-6 whitespace-pre-wrap text-xl font-extrabold leading-relaxed md:text-2xl">
            {currentQuestion.question}
          </h2>

          {isMCQ ? (
            <div className="mt-6 space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = currentQuestion.correctAnswer === index;
                const isWrongSelection = isSelected && !isCorrect;
                const tinted = isCorrect || isWrongSelection;

                return (
                  <div
                    key={`${option}-${index}`}
                    className={`flex min-h-16 items-start justify-between gap-4 rounded-2xl border p-4 md:p-5 ${
                      isCorrect
                        ? "border-primary bg-primary text-white"
                        : isWrongSelection
                          ? "border-(--chart-wrong) bg-(--chart-wrong) text-white"
                          : "border-(--border) bg-(--surface)"
                    }`}
                  >
                    <div className="flex min-w-0 items-start gap-4">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm font-extrabold ${
                          tinted ? "border-white bg-white text-black" : "border-(--border) bg-(--bg-secondary)"
                        }`}
                      >
                        {optionLabels[index] || index + 1}
                      </span>
                      <p className="pt-1 font-semibold leading-relaxed">{option}</p>
                    </div>

                    {tinted && (
                      <div className="flex shrink-0 items-center gap-1.5 pt-1.5 text-xs font-extrabold uppercase">
                        {isCorrect ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                        <span className="hidden sm:inline">
                          {isCorrect && isSelected ? "Your answer" : isCorrect ? "Correct answer" : "Your answer"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}

              {currentState === "skipped" && (
                <div className="flex items-start gap-3 rounded-2xl border border-dashed border-(--border) bg-(--bg-secondary) p-4 text-sm">
                  <Circle size={16} className="mt-0.5 shrink-0 opacity-60" />
                  <p className="opacity-75">You skipped this question. The correct answer is highlighted above.</p>
                </div>
              )}

              {(currentQuestion.approach || currentQuestion.explanation) && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.approach && (
                    <div className="border-primary-soft bg-primary-soft rounded-2xl border p-5">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                        <Lightbulb size={15} />
                        Fastest approach
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{currentQuestion.approach}</p>
                    </div>
                  )}

                  {currentQuestion.explanation && (
                    <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-5">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase opacity-60">
                        <Target size={15} />
                        Solution
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">{currentQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-5">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase opacity-60">
                  <PenLine size={15} />
                  Your answer
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm font-medium leading-relaxed">
                  {typeof currentAnswer?.answer === "string" && currentAnswer.answer.trim()
                    ? currentAnswer.answer
                    : "No answer submitted."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)]">
                <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
                  <p className="text-xs font-extrabold uppercase opacity-60">Marks awarded</p>
                  <p className="mt-3 text-3xl font-extrabold leading-none">
                    {currentAnswer?.marksAwarded || 0}
                    <span className="text-base opacity-55">/{currentQuestion.marks || 0}</span>
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${
                          currentQuestion.marks
                            ? Math.min(100, ((currentAnswer?.marksAwarded || 0) / currentQuestion.marks) * 100)
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>

                <div className="border-primary-soft bg-primary-soft rounded-2xl border p-5">
                  <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                    <MessageSquareText size={15} />
                    Evaluator feedback
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                    {currentAnswer?.feedback?.trim() || "No feedback available for this answer."}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-(--border) pt-5">
            <button
              className="button-secondary gap-2"
              disabled={activeIndex === 0}
              onClick={() => setActive(Math.max(0, activeIndex - 1))}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            <p className="hidden text-xs opacity-55 sm:block">Use the left and right arrow keys to move</p>

            <button
              className="gap-2"
              disabled={activeIndex === questions.length - 1}
              onClick={() => setActive(Math.min(questions.length - 1, activeIndex + 1))}
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        </article>

        {/* Aside */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="card p-5">
            <p className="text-xs font-bold uppercase opacity-55">Outcome</p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {isMCQ ? (
                <>
                  <OutcomeTile state="correct" value={correctCount} />
                  <OutcomeTile state="wrong" value={wrongCount} />
                  <OutcomeTile state="skipped" value={skippedCount} />
                </>
              ) : (
                <>
                  <OutcomeTile state="answered" value={answeredCount} />
                  <OutcomeTile label="Marks" value={obtainedMarks} />
                  <OutcomeTile state="skipped" value={skippedCount} />
                </>
              )}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase opacity-55">Question map</p>
                <h2 className="mt-1 text-xl font-extrabold">Jump to any question</h2>
              </div>
              <MapIcon className="shrink-0 text-primary" size={22} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label="Filter questions">
              {filters.map((item) => (
                <span
                  key={item.key}
                  role="radio"
                  aria-checked={filter === item.key}
                  tabIndex={0}
                  data-selected={filter === item.key}
                  onClick={() => setFilter(item.key)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setFilter(item.key);
                    }
                  }}
                  className="select-chip"
                >
                  {item.label}
                  <span className={filter === item.key ? "opacity-80" : "opacity-55"}>{item.count}</span>
                </span>
              ))}
            </div>

            {visibleIndexes.length === 0 ? (
              <p className="mt-4 rounded-2xl border border-dashed border-(--border) px-4 py-6 text-center text-sm opacity-60">
                No questions in this group.
              </p>
            ) : (
              <div className="mt-4 grid grid-cols-5 gap-2 xl:grid-cols-4">
                {visibleIndexes.map((index) => {
                  const state = states[index];
                  const isActive = activeIndex === index;
                  const tinted = state !== "skipped";

                  return (
                    <div
                      key={index}
                      role="button"
                      tabIndex={0}
                      aria-current={isActive ? "true" : undefined}
                      aria-label={`Question ${index + 1}, ${stateMeta[state].label}`}
                      onClick={() => setActive(index)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setActive(index);
                        }
                      }}
                      className={`grid h-11 cursor-pointer place-items-center rounded-lg text-sm font-extrabold transition-transform hover:-translate-y-0.5 ${
                        tinted ? "text-white" : "border border-(--border) bg-(--bg-secondary)"
                      } ${isActive ? "ring-2 ring-(--text) ring-offset-2 ring-offset-(--bg)" : ""}`}
                      style={tinted ? { background: stateMeta[state].dot } : undefined}
                    >
                      {index + 1}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-(--border) pt-4 text-xs font-bold opacity-70">
              {(isMCQ ? (["correct", "wrong", "skipped"] as QuestionState[]) : (["answered", "skipped"] as QuestionState[])).map(
                (state) => (
                  <span key={state} className="inline-flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${state === "skipped" ? "border border-(--border) bg-(--bg-secondary)" : ""}`}
                      style={state === "skipped" ? undefined : { background: stateMeta[state].dot }}
                    />
                    {stateMeta[state].label}
                  </span>
                ),
              )}
            </div>
          </div>

          {isAptitude && attempt.test?._id && (
            <button
              onClick={() => router.push(`/main/aptitude/practice/${attempt.test?._id}`)}
              className="button-secondary w-full justify-between"
            >
              Practice this set untimed
              <RotateCcw size={18} />
            </button>
          )}
        </aside>
      </section>
    </div>
  );
}

function SummaryStat({
  highlighted,
  icon: Icon,
  label,
  value,
  hint,
}: {
  highlighted?: boolean;
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  hint: string;
}) {
  return (
    <div className={`${highlighted ? "card2" : "card"} p-5`}>
      <Icon size={20} className="text-primary" />
      <p className="mt-4 text-xs font-bold uppercase opacity-55">{label}</p>
      <p className="mt-1 text-3xl font-extrabold leading-tight">{value}</p>
      <p className="mt-1 truncate text-xs opacity-60">{hint}</p>
    </div>
  );
}

function OutcomeTile({ state, label, value }: { state?: QuestionState; label?: string; value: number }) {
  return (
    <div className="rounded-xl border border-(--border) bg-(--surface) p-3">
      <p className="text-xl font-extrabold leading-none">{value}</p>
      <p className="mt-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase opacity-60">
        {state && (
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${state === "skipped" ? "border border-(--border) bg-(--bg-secondary)" : ""}`}
            style={state === "skipped" ? undefined : { background: stateMeta[state].dot }}
          />
        )}
        {label || (state ? stateMeta[state].label : "")}
      </p>
    </div>
  );
}
