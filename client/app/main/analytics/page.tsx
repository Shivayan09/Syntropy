"use client";

import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  FileQuestion,
  Target,
  TrendingUp,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type Difficulty = "Easy" | "Medium" | "Hard";

type Question = {
  correctAnswer?: number;
  subject?: string | null;
  difficulty?: Difficulty;
  topic?: string;
};

type TestSummary = {
  _id?: string;
  title?: string;
  difficulty?: Difficulty;
  subjects?: string[];
  totalQuestions?: number;
  questions?: Question[];
};

type Attempt = {
  _id: string;
  answers?: Array<number | null | undefined>;
  score?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  accuracy?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
  test?: TestSummary;
};

type Breakdown = {
  name: string;
  correct: number;
  wrong: number;
  skipped: number;
  total: number;
  accuracy: number;
};

type TrendPoint = {
  id: string;
  title: string;
  date: string;
  accuracy: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatDate = (value?: string) => {
  if (!value) return "Not recorded";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getQuestionTotal = (attempt: Attempt) => attempt.test?.totalQuestions || attempt.test?.questions?.length || 0;

const getAccuracy = (attempt: Attempt) => {
  if (typeof attempt.accuracy === "number") return clampPercent(attempt.accuracy);

  const total = getQuestionTotal(attempt);
  return total > 0 ? clampPercent(((attempt.correct || 0) / total) * 100) : 0;
};

const getDurationMinutes = (attempt: Attempt) => {
  if (!attempt.startedAt || !attempt.completedAt) return null;

  const minutes = Math.round(
    (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000,
  );

  return Number.isFinite(minutes) && minutes >= 0 ? minutes : null;
};

const getAttemptSubject = (attempt: Attempt) => attempt.test?.subjects?.[0] || "General";

const addBreakdownResult = (
  map: Map<string, Omit<Breakdown, "name" | "accuracy">>,
  key: string,
  result: "correct" | "wrong" | "skipped",
) => {
  const current = map.get(key) || { correct: 0, wrong: 0, skipped: 0, total: 0 };
  map.set(key, {
    correct: current.correct + (result === "correct" ? 1 : 0),
    wrong: current.wrong + (result === "wrong" ? 1 : 0),
    skipped: current.skipped + (result === "skipped" ? 1 : 0),
    total: current.total + 1,
  });
};

const makeBreakdown = (entries: Map<string, Omit<Breakdown, "name" | "accuracy">>) =>
  Array.from(entries.entries())
    .map(([name, stat]) => ({
      name,
      ...stat,
      accuracy: stat.total > 0 ? clampPercent((stat.correct / stat.total) * 100) : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy || b.total - a.total);

export default function Analytics() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch(BACKEND_URL + "/api/attempt/my", {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return;
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const analytics = useMemo(() => {
    const chronological = [...attempts].sort(
      (a, b) => new Date(a.completedAt || a.createdAt || 0).getTime() - new Date(b.completedAt || b.createdAt || 0).getTime(),
    );
    const totalQuestions = attempts.reduce((total, attempt) => total + getQuestionTotal(attempt), 0);
    const totalCorrect = attempts.reduce((total, attempt) => total + (attempt.correct || 0), 0);
    const totalWrong = attempts.reduce((total, attempt) => total + (attempt.wrong || 0), 0);
    const totalSkipped = attempts.reduce((total, attempt) => total + (attempt.skipped || 0), 0);
    const averageAccuracy =
      attempts.length > 0 ? clampPercent(attempts.reduce((total, attempt) => total + getAccuracy(attempt), 0) / attempts.length) : 0;
    const bestAttempt = attempts.reduce<Attempt | undefined>((best, attempt) => {
      if (!best) return attempt;
      return getAccuracy(attempt) > getAccuracy(best) ? attempt : best;
    }, undefined);

    const paceSamples = attempts
      .map((attempt) => {
        const minutes = getDurationMinutes(attempt);
        const questions = getQuestionTotal(attempt);
        return minutes !== null && questions > 0 ? (minutes * 60) / questions : null;
      })
      .filter((value): value is number => value !== null);
    const averagePace = paceSamples.length > 0 ? Math.round(paceSamples.reduce((total, value) => total + value, 0) / paceSamples.length) : 0;

    const trend: TrendPoint[] = chronological.slice(-7).map((attempt) => ({
      id: attempt._id,
      title: attempt.test?.title || "Mock Test",
      date: formatDate(attempt.completedAt || attempt.createdAt),
      accuracy: getAccuracy(attempt),
    }));

    const firstWindow = chronological.slice(0, 3);
    const latestWindow = chronological.slice(-3);
    const firstAverage =
      firstWindow.length > 0 ? firstWindow.reduce((total, attempt) => total + getAccuracy(attempt), 0) / firstWindow.length : 0;
    const latestAverage =
      latestWindow.length > 0 ? latestWindow.reduce((total, attempt) => total + getAccuracy(attempt), 0) / latestWindow.length : 0;
    const improvement = attempts.length >= 2 ? Math.round(latestAverage - firstAverage) : 0;

    const subjectMap = new Map<string, Omit<Breakdown, "name" | "accuracy">>();
    const topicMap = new Map<string, Omit<Breakdown, "name" | "accuracy">>();

    attempts.forEach((attempt) => {
      const questions = attempt.test?.questions || [];
      questions.forEach((question, index) => {
        const answer = attempt.answers?.[index];
        const result =
          answer === undefined || answer === null
            ? "skipped"
            : answer === question.correctAnswer
              ? "correct"
              : "wrong";
        const subject = question.subject || getAttemptSubject(attempt);
        const topic = question.topic?.trim();

        addBreakdownResult(subjectMap, subject, result);
        if (topic) addBreakdownResult(topicMap, topic, result);
      });
    });

    const subjects = makeBreakdown(subjectMap);
    const weakestSubjects = [...subjects].sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
    const weakTopics = makeBreakdown(topicMap)
      .filter((topic) => topic.wrong + topic.skipped > 0)
      .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);

    const testGroups = new Map<string, Attempt[]>();
    chronological.forEach((attempt) => {
      const testId = attempt.test?._id;
      if (!testId) return;
      testGroups.set(testId, [...(testGroups.get(testId) || []), attempt]);
    });
    const retakeGroups = Array.from(testGroups.values()).filter((group) => group.length > 1);
    const retakeLift =
      retakeGroups.length > 0
        ? Math.round(
            retakeGroups.reduce((total, group) => {
              const first = group[0];
              const last = group[group.length - 1];
              return total + (getAccuracy(last) - getAccuracy(first));
            }, 0) / retakeGroups.length,
          )
        : 0;

    return {
      averageAccuracy,
      averagePace,
      bestAttempt,
      improvement,
      retakeGroups: retakeGroups.length,
      retakeLift,
      subjects,
      totalCorrect,
      totalQuestions,
      totalSkipped,
      totalWrong,
      trend,
      weakestSubjects,
      weakTopics,
    };
  }, [attempts]);

  if (loading) {
    return <Loader2 />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <BarChart3 size={18} />
            Analytics
          </div>
        </div>

        <button onClick={() => router.push("/main/tests")} className="gap-2">
          <FileQuestion size={18} />
          Take test
        </button>
      </section>

      {attempts.length === 0 ? (
        <section className="card grid min-h-96 place-items-center p-8 text-center">
          <div>
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-full border border-black bg-primary text-white shadow-[4px_4px_0px_black]">
              <BarChart3 size={26} />
            </div>
            <p className="text-2xl font-extrabold">Analytics will appear after your first completed mock test.</p>
            <p className="mx-auto mt-2 max-w-md text-sm opacity-65">
              Complete a timed attempt to unlock progress, subject focus, and review history.
            </p>
            <button onClick={() => router.push("/main/tests")} className="mt-6 gap-2">
              Browse tests
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <div className="card2 p-6 md:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold opacity-60">Current standing</p>
                  <h2 className="mt-1 text-5xl font-extrabold">{analytics.averageAccuracy}%</h2>
                  <p className="mt-1 text-sm opacity-65">average accuracy across completed attempts</p>
                </div>
                <Target className="text-primary" size={28} />
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <SummaryTile label="Attempts" value={attempts.length.toString()} />
                <SummaryTile label="Questions reviewed" value={analytics.totalQuestions.toString()} />
                <SummaryTile label="Estimated pace" value={analytics.averagePace ? `${analytics.averagePace}s` : "--"} />
              </div>

            </div>

            <div className="card p-6 md:p-7">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold opacity-60">Recent trend</p>
                  <h2 className="text-2xl font-extrabold">Are attempts moving up?</h2>
                </div>
                <div className="border border-(--border) bg-(--surface) px-3 py-2 text-sm font-extrabold">
                  {analytics.improvement >= 0 ? "+" : ""}
                  {analytics.improvement}% recent shift
                </div>
              </div>

              <TrendLineChart points={analytics.trend} onSelect={(id) => router.push(`/main/history/review/${id}`)} />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <p className="text-sm font-bold opacity-60">What to do next</p>
              <h2 className="text-2xl font-extrabold">Study direction</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <FocusCard
                icon={BookOpenCheck}
                label="Protect your strength"
                title={analytics.subjects[0]?.name || "Not enough data"}
                note={analytics.subjects[0] ? `${analytics.subjects[0].accuracy}% accuracy` : "Complete more attempts to identify it."}
              />
              <FocusCard
                highlighted
                icon={Target}
                label="Main focus"
                title={analytics.weakestSubjects[0]?.name || "Not enough data"}
                note={
                  analytics.weakestSubjects[0]
                    ? `${analytics.weakestSubjects[0].accuracy}% accuracy across observed questions`
                    : "Weak areas will appear after more attempts."
                }
              />
              <FocusCard
                icon={BrainCircuit}
                label="Topic to revisit"
                title={analytics.weakTopics[0]?.name || "No topic signal"}
                note={analytics.weakTopics[0] ? `${analytics.weakTopics[0].wrong + analytics.weakTopics[0].skipped} missed questions` : "Topic labels are optional in tests."}
              />
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
            <div className="card p-6 md:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold opacity-60">Subject map</p>
                  <h2 className="text-2xl font-extrabold">Where marks are coming from</h2>
                </div>
                <BookOpenCheck className="text-primary" size={25} />
              </div>

              {analytics.subjects.length === 0 ? (
                <EmptyState text="No subject-level question data is available yet." />
              ) : (
                <div className="space-y-4">
                  {analytics.subjects.slice(0, 6).map((subject) => (
                    <MetricBar key={subject.name} label={subject.name} value={subject.accuracy} note={`${subject.total} questions`} />
                  ))}
                </div>
              )}
            </div>

            <div className="card p-6 md:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-bold opacity-60">Attempt quality</p>
                  <h2 className="text-2xl font-extrabold">Answer outcomes</h2>
                </div>
                <TrendingUp className="text-primary" size={25} />
              </div>

              <div className="space-y-4">
                <OutcomeRow label="Correct" value={analytics.totalCorrect} />
                <OutcomeRow label="Wrong" value={analytics.totalWrong} />
                <OutcomeRow label="Skipped" value={analytics.totalSkipped} />
              </div>

              <div className="mt-6 border-t border-(--border) pt-5">
                <p className="text-sm font-bold opacity-60">Retakes</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="font-extrabold">{analytics.retakeGroups} repeated tests</p>
                  <p className="font-extrabold">
                    {analytics.retakeGroups ? `${analytics.retakeLift >= 0 ? "+" : ""}${analytics.retakeLift}%` : "--"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="card p-6 md:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold opacity-60">Recent attempts</p>
                <h2 className="text-2xl font-extrabold">Review trail</h2>
              </div>
              <button onClick={() => router.push("/main/history")} className="button-secondary gap-2">
                Full history
                <ArrowRight size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {attempts.slice(0, 5).map((attempt) => (
                <article
                  key={attempt._id}
                  className="grid gap-4 border border-(--border) bg-(--surface) p-4 lg:grid-cols-[1fr_8rem_8rem_7rem] lg:items-center"
                >
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{attempt.test?.title || "Mock Test"}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs opacity-60">
                      <CalendarDays size={14} />
                      {formatDate(attempt.completedAt || attempt.createdAt)} - {getAttemptSubject(attempt)}
                    </p>
                  </div>
                  <p className="font-bold">{getAccuracy(attempt)}% accuracy</p>
                  <p className="font-bold">{attempt.correct || 0}/{getQuestionTotal(attempt)}</p>
                  <button
                    onClick={() => router.push(`/main/history/review/${attempt._id}`)}
                    className="button-secondary w-full gap-2 lg:w-fit"
                  >
                    Review
                    <ArrowRight size={18} />
                  </button>
                </article>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-(--border) bg-(--surface) p-4">
      <p className="text-sm font-bold opacity-60">{label}</p>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function FocusCard({
  highlighted,
  icon: Icon,
  label,
  note,
  title,
}: {
  highlighted?: boolean;
  icon: ElementType;
  label: string;
  note: string;
  title: string;
}) {
  return (
    <div className={`${highlighted ? "card2" : "card"} p-5`}>
      <Icon size={22} className="mb-4 text-primary" />
      <p className="text-sm font-bold opacity-60">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{title}</p>
      <p className="mt-1 text-sm opacity-65">{note}</p>
    </div>
  );
}

function TrendLineChart({ points, onSelect }: { points: TrendPoint[]; onSelect: (id: string) => void }) {
  if (points.length === 0) {
    return <EmptyState text="No trend data is available yet." />;
  }

  const width = 640;
  const height = 260;
  const paddingX = 36;
  const paddingY = 28;
  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingY * 2;
  const coordinates = points.map((point, index) => {
    const x = points.length === 1 ? width / 2 : paddingX + (index / (points.length - 1)) * chartWidth;
    const y = paddingY + ((100 - point.accuracy) / 100) * chartHeight;
    return { ...point, x, y };
  });
  const path = coordinates.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  return (
    <div className="overflow-hidden border border-(--border) bg-(--surface) p-4">
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-72 w-full" role="img" aria-label="Accuracy trend line chart">
          {[0, 25, 50, 75, 100].map((mark) => {
            const y = paddingY + ((100 - mark) / 100) * chartHeight;

            return (
              <g key={mark}>
                <line x1={paddingX} x2={width - paddingX} y1={y} y2={y} stroke="var(--border)" strokeDasharray="4 6" opacity="0.35" />
                <text x={8} y={y + 4} className="fill-current text-[11px] font-bold opacity-50">
                  {mark}%
                </text>
              </g>
            );
          })}

          <path d={path} fill="none" stroke="var(--primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

          {coordinates.map((point) => (
            <g key={point.id}>
              <circle cx={point.x} cy={point.y} r="8" fill="var(--surface)" stroke="var(--primary)" strokeWidth="4" />
              <text x={point.x} y={point.y - 15} textAnchor="middle" className="fill-current text-[12px] font-extrabold">
                {point.accuracy}%
              </text>
            </g>
          ))}
        </svg>

        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(0, 1fr))` }}>
          {points.map((point) => (
            <div
              key={point.id}
              onClick={() => onSelect(point.id)}
              className="button-secondary cursor-pointer rounded-md h-auto min-h-10 px-2 py-2 text-xs shadow-none hover:transform-none hover:shadow-none"
              aria-label={`Review ${point.title}`}
            >
              <span className="truncate">{point.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricBar({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate font-extrabold">{label}</p>
          <p className="text-xs opacity-60">{note}</p>
        </div>
        <p className="font-extrabold">{value}%</p>
      </div>
      <div className="h-3 border border-(--border) bg-(--surface) rounded-full overflow-clip">
        <div className="h-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function OutcomeRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-(--border) bg-(--surface) p-4">
      <p className="font-bold">{label}</p>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="grid min-h-36 place-items-center border border-dashed border-(--border) bg-(--surface) p-5 text-center">
      <p className="text-sm opacity-60">{text}</p>
    </div>
  );
}