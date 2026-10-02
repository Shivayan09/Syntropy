"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  Gauge,
  ListChecks,
  RotateCcw,
  Target,
  Timer,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import ResultSkeleton from "@/components/skeletons/ResultSkeleton";

type ResultQuestion = {
  question: string;
  options?: string[];
  correctAnswer?: number;
  marks?: number;
  topic?: string;
};

type AnswerEntry = {
  answer?: string | number | null;
  marksAwarded?: number;
  feedback?: string;
};

type RawAnswer = AnswerEntry | number | string | null | undefined;

type AttemptResult = {
  _id: string;
  score?: number;
  accuracy?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  timeTaken?: number;
  duration?: number;
  startedAt?: string;
  completedAt?: string;

  test?: {
    _id?: string;
    title?: string;
    category?: "academic" | "aptitude";
    duration?: number;
    questions?: ResultQuestion[];
    testFormat?: "mcq" | "subjective";
    totalMarks?: number;
  };

  answers?: RawAnswer[];

  obtainedMarks?: number;
  totalMarks?: number;
};

type Outcome = "correct" | "wrong" | "skipped";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatSeconds = (seconds?: number | null) => {
  if (!seconds || seconds <= 0) return "--";
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes <= 0) return `${remaining}s`;
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
};

const getAttemptSeconds = (result: AttemptResult) => {
  if (result.timeTaken) return result.timeTaken;
  if (!result.startedAt || !result.completedAt) return null;

  const seconds = Math.round(
    (new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000,
  );

  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
};

const formatDateTime = (value?: string) => {
  if (!value) return "--";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const normalizeAnswer = (entry: RawAnswer): AnswerEntry => {
  if (entry === null || entry === undefined || typeof entry === "number" || typeof entry === "string") {
    return { answer: entry ?? null, marksAwarded: 0, feedback: "" };
  }

  return {
    answer: entry.answer ?? null,
    marksAwarded: entry.marksAwarded ?? 0,
    feedback: entry.feedback ?? "",
  };
};

const outcomeStyles: Record<Outcome, { dot: string; label: string }> = {
  correct: { dot: "var(--chart-correct)", label: "Correct" },
  wrong: { dot: "var(--chart-wrong)", label: "Wrong" },
  skipped: { dot: "var(--chart-skipped)", label: "Skipped" },
};

export default function ResultPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [result, setResult] = useState<AttemptResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/attempt/${id}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return;

        setResult(data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  const questions = useMemo(() => result?.test?.questions || [], [result]);
  const answers = useMemo(() => (result?.answers || []).map(normalizeAnswer), [result]);

  const isMCQ =
    result?.test?.testFormat === "mcq" ||
    (result?.test?.testFormat !== "subjective" &&
      questions.some((question) => Array.isArray(question.options) && question.options.length > 0));

  const outcomes = useMemo<Outcome[]>(
    () =>
      questions.map((question, index) => {
        const answer = answers[index]?.answer;
        if (typeof answer !== "number") return "skipped";
        return answer === question.correctAnswer ? "correct" : "wrong";
      }),
    [answers, questions],
  );

  // Routes under /main/test render without the layout padding, so this page owns its own.
  if (loading) {
    return (
      <div className="px-4 py-6 md:px-8">
        <ResultSkeleton />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5">
        <div className="card max-w-lg p-8 text-center">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full bg-primary text-white">
            <Trophy size={26} />
          </div>
          <p className="text-3xl font-extrabold">Result not found</p>
          <p className="mt-3 text-sm opacity-65">This attempt result could not be loaded.</p>
          <button onClick={() => router.push("/main/tests")} className="mx-auto mt-7 gap-2">
            Back to tests
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const correct = isMCQ ? result.correct ?? outcomes.filter((o) => o === "correct").length : 0;
  const wrong = isMCQ ? result.wrong ?? outcomes.filter((o) => o === "wrong").length : 0;
  const skipped = isMCQ
    ? result.skipped ?? outcomes.filter((o) => o === "skipped").length
    : answers.filter((entry) => typeof entry.answer !== "string" || !entry.answer.trim()).length;

  const totalQuestions = isMCQ ? correct + wrong + skipped || questions.length : questions.length;
  const attempted = isMCQ ? correct + wrong : Math.max(0, totalQuestions - skipped);

  const obtainedMarks = result.obtainedMarks ?? 0;
  const totalMarks =
    result.totalMarks ||
    result.test?.totalMarks ||
    questions.reduce((sum, question) => sum + (question.marks || 0), 0);

  const accuracy = isMCQ
    ? clampPercent(result.accuracy ?? (totalQuestions ? (correct / totalQuestions) * 100 : 0))
    : clampPercent(totalMarks ? (obtainedMarks / totalMarks) * 100 : 0);

  const score = isMCQ ? Math.round(result.score ?? correct) : obtainedMarks;

  const seconds = getAttemptSeconds(result);
  const durationLabel = formatSeconds(seconds);
  const perQuestion = seconds && totalQuestions ? Math.round(seconds / totalQuestions) : null;
  const timeLimit = result.duration || result.test?.duration;

  const testTitle = result.test?.title || "Mock Test";
  const isAptitude = result.test?.category === "aptitude";
  const backHref = isAptitude ? "/main/aptitude" : "/main/tests";
  const backLabel = isAptitude ? "Aptitude Gym" : "Tests";

  const verdict =
    accuracy >= 80
      ? {
          tone: "Excellent control",
          hint: "Lock it in with another timed round while the patterns are fresh.",
        }
      : accuracy >= 60
        ? {
            tone: "Solid attempt",
            hint: "Review the wrong answers and retake to push past 80%.",
          }
        : {
            tone: "Needs focused review",
            hint: "Go through every explanation before you retake this test.",
          };

  const insight = isMCQ
    ? `You attempted ${attempted} of ${totalQuestions} questions and got ${correct} right${
        seconds ? ` in ${durationLabel}` : ""
      }.`
    : `You scored ${obtainedMarks} of ${totalMarks || "--"} marks across ${totalQuestions} written question${
        totalQuestions === 1 ? "" : "s"
      }${seconds ? ` in ${durationLabel}` : ""}.`;

  const segments = (
    [
      { key: "correct" as Outcome, value: correct },
      { key: "wrong" as Outcome, value: wrong },
      { key: "skipped" as Outcome, value: skipped },
    ] as const
  ).map((part) => ({
    ...part,
    pct: totalQuestions ? (part.value / totalQuestions) * 100 : 0,
  }));

  const openReview = (index?: number) => {
    const query = typeof index === "number" ? `?q=${index}` : "";
    router.push(`/main/history/review/${result._id}${query}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 md:px-8">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-(--border) pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <Trophy size={18} />
            Attempt result
          </div>
          <h1 className="mt-2 truncate text-3xl font-extrabold leading-tight md:text-4xl">{testTitle}</h1>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm opacity-65">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={14} />
              Submitted {formatDateTime(result.completedAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock3 size={14} />
              {durationLabel}
            </span>
            <span>{isMCQ ? "MCQ" : "Subjective"}</span>
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
          <button onClick={() => router.push(backHref)} className="button-secondary gap-2">
            <ArrowLeft size={18} />
            {backLabel}
          </button>
          <button onClick={() => openReview()} className="gap-2">
            Review answers
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Performance */}
        <div className="card2 flex flex-col p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-bold uppercase opacity-55">Performance</p>
            <Target className="text-primary" size={26} />
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
            <div
              className="grid h-44 w-44 shrink-0 place-items-center rounded-full"
              role="img"
              aria-label={`${accuracy} percent ${isMCQ ? "accuracy" : "of marks"}`}
              style={{
                background: `conic-gradient(var(--primary) ${accuracy * 3.6}deg, color-mix(in srgb, var(--primary) 14%, transparent) 0deg)`,
              }}
            >
              <div className="grid h-[8.5rem] w-[8.5rem] place-items-center rounded-full bg-(--bg) text-center">
                <div>
                  <p className="text-4xl font-extrabold leading-none">{accuracy}%</p>
                  <p className="mt-1.5 text-[11px] font-bold uppercase opacity-55">
                    {isMCQ ? "accuracy" : "of marks"}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <h2 className="text-3xl font-extrabold leading-tight">{verdict.tone}</h2>
              <p className="mt-2 text-sm leading-6 opacity-70">{insight}</p>
              <p className="mt-3 text-sm font-bold text-primary">{verdict.hint}</p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-(--border) pt-5">
            {isMCQ ? (
              <>
                <OutcomeTile outcome="correct" value={correct} />
                <OutcomeTile outcome="wrong" value={wrong} />
                <OutcomeTile outcome="skipped" value={skipped} />
              </>
            ) : (
              <>
                <OutcomeTile outcome="correct" label="Marks scored" value={obtainedMarks} />
                <OutcomeTile label="Total marks" value={totalMarks} />
                <OutcomeTile outcome="skipped" value={skipped} />
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Distribution */}
          <div className="card p-6 md:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase opacity-55">Question distribution</p>
                <h2 className="mt-1 text-2xl font-extrabold">How the paper went</h2>
              </div>
              <p className="text-sm font-bold opacity-65">
                {isMCQ ? `${attempted}/${totalQuestions || "--"} attempted` : `${obtainedMarks}/${totalMarks || "--"} marks`}
              </p>
            </div>

            {isMCQ ? (
              totalQuestions === 0 ? (
                <p className="mt-6 rounded-2xl border border-dashed border-(--border) px-4 py-6 text-center text-sm opacity-60">
                  No questions were recorded for this attempt.
                </p>
              ) : (
                <>
                  <div className="mt-6 flex h-4 w-full gap-[2px] overflow-hidden rounded-[4px]">
                    {segments
                      .filter((part) => part.value > 0)
                      .map((part) => (
                        <div
                          key={part.key}
                          title={`${outcomeStyles[part.key].label}: ${part.value} (${Math.round(part.pct)}%)`}
                          style={{ flexBasis: `${part.pct}%`, background: outcomeStyles[part.key].dot }}
                          className="flex min-w-0 items-center justify-center overflow-hidden"
                        >
                          {part.pct >= 14 && (
                            <span className="text-[10px] font-extrabold text-white">{Math.round(part.pct)}%</span>
                          )}
                        </div>
                      ))}
                  </div>

                  <dl className="mt-5 grid gap-3 sm:grid-cols-3">
                    {segments.map((part) => (
                      <div
                        key={part.key}
                        className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--bg-secondary) px-4 py-3"
                      >
                        <span
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ background: outcomeStyles[part.key].dot }}
                          aria-hidden="true"
                        />
                        <div className="min-w-0">
                          <dt className="text-xs font-bold uppercase opacity-55">{outcomeStyles[part.key].label}</dt>
                          <dd className="text-lg font-extrabold">
                            {part.value}
                            <span className="ml-2 text-xs font-bold opacity-55">{Math.round(part.pct)}%</span>
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </>
              )
            ) : (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="font-bold">Marks scored</p>
                  <p className="font-extrabold">
                    {obtainedMarks}
                    <span className="opacity-55">/{totalMarks || "--"}</span>
                  </p>
                </div>
                <div
                  className="h-4 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]"
                  role="img"
                  aria-label={`${accuracy} percent of marks scored`}
                >
                  <div className="h-full rounded-full bg-primary" style={{ width: `${accuracy}%` }} />
                </div>
                <p className="mt-2 text-xs opacity-55">
                  {attempted} of {totalQuestions} questions answered
                </p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <DetailStat
              icon={Target}
              label="Score"
              value={isMCQ ? `${score}/${totalQuestions || "--"}` : `${obtainedMarks}/${totalMarks || "--"}`}
            />
            <DetailStat icon={Clock3} label="Time taken" value={durationLabel} />
            <DetailStat icon={Timer} label="Per question" value={perQuestion ? `${perQuestion}s` : "--"} />
            <DetailStat icon={Gauge} label="Time limit" value={timeLimit ? `${timeLimit} min` : "--"} />
            <DetailStat icon={ListChecks} label="Format" value={isMCQ ? "MCQ" : "Subjective"} />
            <DetailStat icon={CheckCircle2} label="Status" value="Submitted" />
          </div>
        </div>
      </section>

      {/* Question map */}
      {questions.length > 0 && (
        <section className="card p-6 md:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase opacity-55">Question map</p>
              <h2 className="mt-1 text-2xl font-extrabold">
                {isMCQ ? "Where marks were lost" : "Marks by question"}
              </h2>
              <p className="mt-1 text-sm opacity-60">Select a question to open it in the answer review.</p>
            </div>
            <button onClick={() => openReview()} className="button-secondary gap-2">
              Open review
              <ArrowRight size={18} />
            </button>
          </div>

          {isMCQ ? (
            <>
              <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
                {outcomes.map((outcome, index) => (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    aria-label={`Question ${index + 1}, ${outcomeStyles[outcome].label}. Open in review.`}
                    onClick={() => openReview(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openReview(index);
                      }
                    }}
                    className={`grid h-11 cursor-pointer place-items-center rounded-lg text-sm font-extrabold transition-transform hover:-translate-y-0.5 ${
                      outcome === "skipped" ? "border border-(--border) bg-(--bg-secondary)" : "text-white"
                    }`}
                    style={outcome === "skipped" ? undefined : { background: outcomeStyles[outcome].dot }}
                  >
                    {index + 1}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold opacity-70">
                {(["correct", "wrong", "skipped"] as Outcome[]).map((outcome) => (
                  <span key={outcome} className="inline-flex items-center gap-2">
                    <span
                      className={`h-3 w-3 rounded-full ${outcome === "skipped" ? "border border-(--border) bg-(--bg-secondary)" : ""}`}
                      style={outcome === "skipped" ? undefined : { background: outcomeStyles[outcome].dot }}
                    />
                    {outcomeStyles[outcome].label}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-6 space-y-2">
              {questions.map((question, index) => {
                const awarded = answers[index]?.marksAwarded || 0;
                const max = question.marks || 0;
                const pct = max ? clampPercent((awarded / max) * 100) : 0;

                return (
                  <div
                    key={index}
                    role="button"
                    tabIndex={0}
                    onClick={() => openReview(index)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openReview(index);
                      }
                    }}
                    className="grid cursor-pointer gap-3 rounded-2xl border border-(--border) bg-(--surface) p-4 transition-colors hover:border-primary-soft sm:grid-cols-[3rem_minmax(0,1fr)_7rem] sm:items-center"
                  >
                    <span className="text-xs font-extrabold uppercase opacity-55">Q{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">{question.question}</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <p className="text-right text-lg font-extrabold">
                      {awarded}
                      <span className="text-sm opacity-55">/{max}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Next steps */}
      <section className="grid gap-4 md:grid-cols-3">
        <ActionCard
          highlighted
          icon={BookOpenCheck}
          title="Review every answer"
          note="Walk through each question with the correct answer and explanation."
          onClick={() => openReview()}
        />
        {result.test?._id ? (
          <ActionCard
            icon={RotateCcw}
            title="Retake this test"
            note="Run the same paper again and see if the score moves."
            onClick={() => router.push(`/main/test/preview/${result.test?._id}`)}
          />
        ) : (
          <ActionCard
            icon={FileQuestion}
            title="Pick another test"
            note="Browse the library for your next timed attempt."
            onClick={() => router.push("/main/tests")}
          />
        )}
        {isAptitude && result.test?._id ? (
          <ActionCard
            icon={Brain}
            title="Practice untimed"
            note="Replay this set with solutions after every pick."
            onClick={() => router.push(`/main/aptitude/practice/${result.test?._id}`)}
          />
        ) : (
          <ActionCard
            icon={FileQuestion}
            title={isAptitude ? "Back to Aptitude Gym" : "Back to test library"}
            note={isAptitude ? "Build another set or try a new company pattern." : "Choose your next paper or generate one with AI."}
            onClick={() => router.push(backHref)}
          />
        )}
      </section>
    </div>
  );
}

function OutcomeTile({
  outcome,
  label,
  value,
}: {
  outcome?: Outcome;
  label?: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-4">
      <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-55">
        {outcome && (
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: outcomeStyles[outcome].dot }} />
        )}
        {label || (outcome ? outcomeStyles[outcome].label : "")}
      </p>
      <p className="mt-2 text-3xl font-extrabold leading-none">{value}</p>
    </div>
  );
}

function DetailStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="card p-5">
      <Icon size={20} className="text-primary" />
      <p className="mt-4 text-xs font-bold uppercase opacity-55">{label}</p>
      <p className="mt-1 truncate text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function ActionCard({
  highlighted,
  icon: Icon,
  title,
  note,
  onClick,
}: {
  highlighted?: boolean;
  icon: LucideIcon;
  title: string;
  note: string;
  onClick: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
      className={`${highlighted ? "card2" : "card"} flex cursor-pointer flex-col p-5`}
    >
      <div className="flex items-start justify-between gap-3">
        <Icon size={22} className="text-primary" />
        <ArrowRight size={18} className="opacity-40" />
      </div>
      <p className="mt-4 text-lg font-extrabold leading-tight">{title}</p>
      <p className="mt-1 text-sm opacity-65">{note}</p>
    </div>
  );
}
