"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Clock3,
  Layers,
  Sparkles,
  Target,
  TicketCheck,
  TrendingUp,
} from "lucide-react";
import { normalizeSubject } from "@/components/utils/subject";
import { useAiTokens } from "@/context/AiTokenContext";
import { useAuth } from "@/context/AuthContext";
import CompleteOnboardingBanner from "@/components/main/CompleteOnboardingBanner";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

type TestSummary = {
  _id?: string;
  title?: string;
  type?: "manual" | "generated";
  subjects?: string[];
};

type Attempt = {
  _id: string;
  score?: number;
  accuracy?: number;
  createdAt?: string;
  startedAt?: string;
  completedAt?: string;
  isFirstAttempt?: boolean;
  test?: TestSummary;
};

type SubjectStat = {
  name: string;
  attempts: number;
  average: number;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatDate = (value?: string) => {
  if (!value) return "Not attempted";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getDuration = (attempt?: Attempt) => {
  if (!attempt?.completedAt || !attempt.startedAt) return "-";

  const minutes = Math.max(
    1,
    Math.round(
      (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) /
      60000
    )
  );

  return `${minutes} min`;
};

export default function Dashboard() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { tokenStatus } = useAiTokens();

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch(BACKEND_URL + "/api/attempt/my", { credentials: "include" });
        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttempts();
  }, []);

  const firstAttempts = useMemo(
    () => attempts.filter((attempt) => attempt.isFirstAttempt),
    [attempts]
  );

  const uniqueAttempts = firstAttempts.length > 0 ? firstAttempts : attempts;
  const bestAttempt = attempts.reduce<Attempt | undefined>((best, attempt) => {
    if (!best) return attempt;
    return (attempt.score || 0) > (best.score || 0) ? attempt : best;
  }, undefined);

  const averageScore =
    uniqueAttempts.length > 0
      ? clampPercent(
        uniqueAttempts.reduce((total, attempt) => total + (attempt.score || 0), 0) /
        uniqueAttempts.length
      )
      : 0;

  const averageAccuracy =
    uniqueAttempts.length > 0
      ? clampPercent(
        uniqueAttempts.reduce((total, attempt) => total + (attempt.accuracy || 0), 0) /
        uniqueAttempts.length
      )
      : 0;

  const readiness = attempts.length > 0 ? clampPercent(averageScore * 0.65 + averageAccuracy * 0.35) : 0;

  const subjectStats = useMemo<SubjectStat[]>(() => {
    const subjectMap = new Map<string, { total: number; count: number }>();

    attempts.forEach((attempt) => {
      const subject = normalizeSubject(attempt.test?.subjects?.[0], "mixed practice");
      const current = subjectMap.get(subject) || { total: 0, count: 0 };
      subjectMap.set(subject, {
        total: current.total + (attempt.accuracy || 0),
        count: current.count + 1,
      });
    });

    return Array.from(subjectMap.entries())
      .map(([name, stat]) => ({
        name,
        attempts: stat.count,
        average: clampPercent(stat.total / stat.count),
      }))
      .sort((a, b) => b.average - a.average);
  }, [attempts]);
  const displayedSubjectStats = subjectStats.slice(0, 4);

  // Sorted strongest-first, so the tail is the subject that needs the work.
  const focusSubject = subjectStats.length > 1 ? subjectStats[subjectStats.length - 1] : undefined;

  const recentForm = useMemo(
    () =>
      attempts
        .filter((attempt) => attempt.createdAt)
        .slice()
        .sort(
          (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
        )
        .slice(-8)
        .map((attempt) => clampPercent(attempt.score || 0)),
    [attempts]
  );

  // 0-100 mapped onto a 32-unit box; percentages always keep a full 0-100 scale.
  const trendPoints = recentForm.map((value, i) => {
    const x = recentForm.length === 1 ? 50 : (i / (recentForm.length - 1)) * 100;
    return [x, 30 - (value / 100) * 28] as const;
  });
  const trendLine = trendPoints.map(([x, y]) => `${x},${y}`).join(" ");
  const trendArea = `0,32 ${trendLine} 100,32`;
  const latestScore = recentForm[recentForm.length - 1];
  const previousScore = recentForm.length > 1 ? recentForm[recentForm.length - 2] : undefined;
  const trendDelta = previousScore !== undefined ? latestScore - previousScore : undefined;
  const hasReadinessDetail =
    recentForm.length > 1 || Boolean(focusSubject) || attempts.length === 0;

  const scoreTone =
    readiness >= 80
      ? "Exam-ready"
      : readiness >= 60
        ? "Building well"
        : attempts.length > 0
          ? "Needs reps"
          : "Start baseline";

  const stats = [
    {
      label: "Tests taken",
      value: uniqueAttempts.length || "--",
      note: attempts.length > 0 ? `${attempts.length} total attempts` : "Awaiting first run",
    },
    {
      label: "Average score",
      value: attempts.length > 0 ? `${averageScore}` : "--",
      note: "First attempts counted",
    },
    {
      label: "Accuracy",
      value: attempts.length > 0 ? `${averageAccuracy}%` : "--",
      note: "First attempts counted",
    },
    {
      label: "Best score",
      value: bestAttempt ? `${clampPercent(bestAttempt.score || 0)}` : "--",
      note: bestAttempt?.test?.title || "No top score yet",
    },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-7 relative">
      <section className="flex flex-col gap-6 border-b border-(--border) pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-(--text)">
            {user?.onboardingCompleted ? `Welcome back ${user?.username} 👋` : `Welcome ${user?.name} 👋`}
          </h2>
          <p className="mt-2 opacity-70">Let&apos;s continue your exam preparation.</p>
        </div>

        <div
          onClick={() => router.push("/main/subscription")}
          className="card bg-surface flex cursor-pointer items-center gap-4 lg:shrink-0"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-(--border) bg-(--bg-secondary) text-primary">
            <TicketCheck size={20} />
          </span>
          <div>
            <p className="text-lg font-extrabold leading-tight">
              {tokenStatus
                ? tokenStatus.unlimited
                  ? "Unlimited AI credits"
                  : `${tokenStatus.remaining} AI credit${tokenStatus.remaining === 1 ? "" : "s"}`
                : "AI credits"}
            </p>
            <p className="text-xs opacity-60">
              {tokenStatus
                ? tokenStatus.unlimited
                  ? `on ${tokenStatus.planLabel}`
                  : `left of ${tokenStatus.cycleLimit} on ${tokenStatus.planLabel}`
                : "Checking your balance"}
            </p>
          </div>
          <ArrowRight size={18} className="ml-2 shrink-0 opacity-50" />
        </div>
      </section>

      {!user?.onboardingCompleted && <CompleteOnboardingBanner />}

      <section className="grid gap-5 grid-cols-2 md:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card min-h-36 p-5">
            <p className="text-xs font-bold uppercase opacity-55">{stat.label}</p>
            <p className="mt-4 text-4xl font-extrabold">{stat.value}</p>
            <p className="mt-1 line-clamp-1 text-xs opacity-60">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card flex flex-col gap-6 p-6 md:p-7">
          <div>
            <p className="text-xs font-bold uppercase opacity-55">Exam readiness</p>

            <p className="mt-4 text-6xl font-extrabold leading-none">{readiness}%</p>
            <p className="mt-2 text-xl font-extrabold text-primary">{scoreTone}</p>

            <div
              className="mt-5 h-2.5 rounded-full bg-[color-mix(in_srgb,var(--primary)_16%,transparent)]"
              role="img"
              aria-label={`Exam readiness ${readiness} percent`}
            >
              <div className="h-full rounded-full bg-primary" style={{ width: `${readiness}%` }} />
            </div>
          </div>

          {hasReadinessDetail && (
          <div className="flex flex-1 flex-col justify-center gap-5 border-t border-(--border) pt-5">
            {recentForm.length > 1 && (
              <div>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase opacity-55">
                    <TrendingUp size={14} />
                    Recent form
                  </p>
                  <p className="text-sm font-extrabold">
                    {latestScore}%
                    {trendDelta !== undefined && trendDelta !== 0 && (
                      <span className="ml-1.5 text-xs font-bold opacity-55">
                        {trendDelta > 0 ? "+" : ""}
                        {trendDelta}
                      </span>
                    )}
                  </p>
                </div>

                <svg
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  className="mt-3 h-12 w-full"
                  role="img"
                  aria-label={`Scores of the last ${recentForm.length} attempts, most recent ${latestScore} percent`}
                >
                  <polygon
                    points={trendArea}
                    fill="color-mix(in srgb, var(--primary) 14%, transparent)"
                  />
                  <polyline
                    points={trendLine}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>

                <p className="mt-1 text-xs opacity-55">
                  Score across your last {recentForm.length} attempts
                </p>
              </div>
            )}

            {focusSubject ? (
              <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--bg-secondary) px-4 py-3">
                <Target size={17} className="shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase opacity-55">Focus next</p>
                  <p className="truncate text-sm font-extrabold">
                    {focusSubject.name}
                    <span className="ml-2 font-bold opacity-55">{focusSubject.average}%</span>
                  </p>
                </div>
              </div>
            ) : (
              attempts.length === 0 && (
                <div className="flex items-center gap-3 rounded-2xl border border-(--border) bg-(--bg-secondary) px-4 py-3">
                  <Sparkles size={17} className="shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase opacity-55">First step</p>
                    <p className="text-sm font-extrabold">
                      Attempt one test to set your baseline
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
          )}

          <button onClick={() => router.push("/main/create/generate")} className="w-full gap-2">
            <BrainCircuit size={18} />
            Generate AI test
          </button>
        </div>

        <div className="card flex flex-col p-6 md:p-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase opacity-55">Subject map</p>
              <h2 className="mt-1 text-2xl font-extrabold">Accuracy by practice zone</h2>
            </div>
            <button onClick={() => router.push("/main/analytics")} className="button-secondary gap-2">
              Analytics
              <ArrowRight size={18} />
            </button>
          </div>

          {displayedSubjectStats.length === 0 ? (
            <div className="grid min-h-44 flex-1 place-items-center rounded-2xl border border-dashed border-(--border) p-6 text-center">
              <div>
                <p className="font-extrabold">No subjects mapped yet</p>
                <p className="mt-1 text-sm opacity-60">Your first attempt will unlock this view.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {displayedSubjectStats.map((subject) => (
                <div key={subject.name}>
                  <div className="mb-2 flex items-baseline justify-between gap-4 text-sm">
                    <p className="min-w-0 truncate font-bold">{subject.name}</p>
                    <p className="shrink-0 font-extrabold">{subject.average}%</p>
                  </div>

                  <div className="h-3 rounded-full bg-[color-mix(in_srgb,var(--primary)_14%,transparent)]">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${subject.average}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-xs opacity-55">
                    {subject.attempts} attempt{subject.attempts === 1 ? "" : "s"}
                  </p>
                </div>
              ))}

              {subjectStats.length > displayedSubjectStats.length && (
                <p className="flex items-center gap-2 border-t border-(--border) pt-4 text-xs opacity-55">
                  <Layers size={14} />
                  {subjectStats.length - displayedSubjectStats.length} more subject
                  {subjectStats.length - displayedSubjectStats.length === 1 ? "" : "s"} in analytics
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase opacity-55">Recent attempts</p>
            <h2 className="mt-1 text-3xl font-extrabold">Where your last tests landed</h2>
          </div>
          <button onClick={() => router.push("/main/history")} className="button-secondary gap-2">
            History
            <ArrowRight size={18} />
          </button>
        </div>

        {attempts.length === 0 ? (
          <div className="card grid min-h-52 place-items-center p-7 text-center">
            <div>
              <p className="text-2xl font-extrabold">Your dashboard is waiting for data.</p>
              <p className="mx-auto mt-2 max-w-md text-sm opacity-60">
                Attempt a manual mock or generate one with AI to start seeing trends here.
              </p>
              <button onClick={() => router.push("/main/tests")} className="mt-5 gap-2">
                Browse tests
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.slice(0, visibleCount).map((attempt) => (
              <div
                key={attempt._id}
                className="card flex flex-col gap-4 md:flex-row md:items-center md:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-bold leading-snug">
                    {attempt.test?.title || "AI Test"}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs opacity-70">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays size={14} />
                      {formatDate(attempt.createdAt)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 size={14} />
                      {getDuration(attempt)}
                    </span>
                    <span>{normalizeSubject(attempt.test?.subjects?.[0], "mixed practice")}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-(--border) pt-4 md:w-44 md:shrink-0 md:border-t-0 md:pt-0">
                  <div>
                    <p className="text-xs opacity-60">Score</p>
                    <p className="mt-1 text-xl font-extrabold">
                      {clampPercent(attempt.score || 0)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-xs opacity-60">Accuracy</p>
                    <p className="mt-1 text-xl font-extrabold">
                      {clampPercent(attempt.accuracy || 0)}%
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/main/history/review/${attempt._id}`)}
                  className="button-secondary w-full gap-2 md:w-fit md:shrink-0"
                >
                  Review
                  <ArrowRight size={18} />
                </button>
              </div>
            ))}

            {visibleCount < attempts.length && (
              <div className="flex justify-end">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 8)}
                  className="button-secondary"
                >
                  Load more
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
