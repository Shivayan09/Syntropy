"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BrainCircuit, CalendarDays, Clock3, Flame, TicketCheck } from "lucide-react";
import { normalizeSubject } from "@/components/utils/subject";
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
  const topSubject = subjectStats[0];
  const displayedSubjectStats = subjectStats.slice(0, 4);

  const scoreTone =
    readiness >= 80
      ? "Exam-ready"
      : readiness >= 60
        ? "Building well"
        : attempts.length > 0
          ? "Needs reps"
          : "Start baseline";

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-7 relative">
      <section className="flex flex-col border-b border-(--border) gap-6 pb-4 lg:flex-row lg:justify-between">

        <div className="space-y-3">

          <div>
            <h2 className="text-3xl font-bold text-(--text)">
              {user?.onboardingCompleted ? `Welcome back ${user?.username} 👋` : `Welcome ${user?.name} 👋`}
            </h2>
            <p className="mt-2 text-muted-foreground">
              Let&apos;s continue your exam preparation.
            </p>
          </div>


        </div>
        <div className="bg-surface card flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-primary text-muted-foreground flex gap-1">
              <TicketCheck className="text-primary" size={18} />
              10 AI Test Credits <p className="text-(--text)">left this month</p>
            </p>
          </div>

        </div>

      </section>
      {!user?.onboardingCompleted && <CompleteOnboardingBanner />}
      <section className="grid gap-5 grid-cols-2 md:grid-cols-4">

        {[
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
            note: "Across completed tests",
          },
          {
            label: "Best score",
            value: bestAttempt ? `${clampPercent(bestAttempt.score || 0)}` : "--",
            note: bestAttempt?.test?.title || "No top score yet",
          },
        ].map((stat) => {

          return (
            <div key={stat.label} className="card min-h-36 p-5">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold opacity-60">{stat.label}</p>
              </div>
              <p className="mt-4 text-4xl font-extrabold">{stat.value}</p>
              <p className="mt-1 line-clamp-1 text-xs opacity-60">{stat.note}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <div className="card flex flex-col justify-between gap-6 p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold opacity-60">Exam readiness</p>
              <h2 className="mt-1 text-3xl font-extrabold">{scoreTone}</h2>
            </div>
            <Flame className="text-primary" size={30} />
          </div>

          <div className="flex items-center justify-center py-2">
            <div
              className="grid h-48 w-48 place-items-center rounded-full border border-black shadow-[5px_5px_0px_black]"
              style={{
                background: `conic-gradient(var(--primary) ${readiness * 3.6}deg, var(--surface) 0deg)`,
              }}
            >
              <div className="grid h-32 w-32 place-items-center rounded-full border border-black bg-(--bg-secondary) text-center">
                <div>
                  <p className="text-4xl font-extrabold">{readiness}%</p>
                  <p className="text-xs font-bold opacity-60">overall</p>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => router.push("/main/create/generate")} className="w-full gap-2">
            <BrainCircuit size={18} />
            Generate AI test
          </button>
        </div>

        <div className="card flex flex-col p-6 md:p-7">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold opacity-60">Subject map</p>
              <h2 className="text-2xl font-extrabold">Accuracy by practice zone</h2>
            </div>
            <button onClick={() => router.push("/main/analytics")} className="button-secondary gap-2">
              Analytics
              <ArrowRight size={18} />
            </button>
          </div>

          {subjectStats.length === 0 ? (
            <div className="grid min-h-44 place-items-center border border-dashed border-black p-6 text-center">
              <div>
                <p className="font-extrabold">No subjects mapped yet</p>
                <p className="mt-1 text-sm opacity-60">Your first attempt will unlock this view.</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col">
              <div className="space-y-1">
                {displayedSubjectStats.map((subject) => (
                  <div key={subject.name} className="py-1">
                    <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                      <p className="font-bold">{subject.name}</p>
                      <p className="font-extrabold">{subject.average}%</p>
                    </div>
                    <div className="h-4 overflow-clip rounded-full border border-black bg-secondary">
                      <div
                        className="h-full border-r border-black bg-primary"
                        style={{ width: `${subject.average}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs opacity-60">{subject.attempts} attempts</p>
                  </div>
                ))}
              </div>

              {displayedSubjectStats.length <= 2 && topSubject && (
                <div className="mt-6 grid gap-3 border-t border-(--border) pt-5 sm:grid-cols-3">
                  <div className="border border-(--border) bg-(--bg-secondary) p-4">
                    <p className="text-xs font-bold uppercase opacity-60">Primary zone</p>
                    <p className="mt-2 text-lg font-extrabold">{topSubject.name}</p>
                    <p className="mt-1 text-xs opacity-60">
                      {displayedSubjectStats.length === 1 ? "Current mapped subject" : "Strongest mapped subject"}
                    </p>
                  </div>
                  <div className="border border-(--border) bg-(--bg-secondary) p-4">
                    <p className="text-xs font-bold uppercase opacity-60">Tracked attempts</p>
                    <p className="mt-2 text-lg font-extrabold">
                      {displayedSubjectStats.reduce((total, subject) => total + subject.attempts, 0)}
                    </p>
                    <p className="mt-1 text-xs opacity-60">
                      {displayedSubjectStats.length === 1 ? "Attempts in this zone" : "Attempts across mapped zones"}
                    </p>
                  </div>
                  <div className="border border-(--border) bg-(--bg-secondary) p-4">
                    <p className="text-xs font-bold uppercase opacity-60">Current accuracy</p>
                    <p className="mt-2 text-lg font-extrabold">
                      {displayedSubjectStats.length === 1
                        ? `${topSubject.average}%`
                        : `${Math.round(
                          displayedSubjectStats.reduce((total, subject) => total + subject.average, 0) /
                          displayedSubjectStats.length
                        )}%`}
                    </p>
                    <p className="mt-1 text-xs opacity-60">
                      {displayedSubjectStats.length === 1
                        ? "Baseline before more subjects appear"
                        : "Average across the mapped subjects"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold opacity-60 mb-2">Recent attempts</p>
            <h2 className="text-3xl font-extrabold">Test history that still teaches</h2>
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
              <div key={attempt._id} className="card">

                {/* Mobile */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-bold leading-snug">
                        {attempt.test?.title || "AI Test"}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs opacity-70">
                        <span className="inline-flex items-center gap-1">
                          <CalendarDays size={14} />
                          {formatDate(attempt.createdAt)}
                        </span>

                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={14} />
                          {getDuration(attempt)}
                        </span>

                        <span>
                          {normalizeSubject(
                            attempt.test?.subjects?.[0],
                            "mixed practice"
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        router.push(`/main/history/review/${attempt._id}`)
                      }
                      className="button-secondary h-10 px-4"
                    >
                      Review
                    </button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-(--border) pt-4">
                    <div>
                      <p className="text-xs opacity-60">Score</p>
                      <p className="mt-1 text-2xl font-bold">
                        {clampPercent(attempt.score || 0)}%
                      </p>
                    </div>

                    <div>
                      <p className="text-xs opacity-60">Accuracy</p>
                      <p className="mt-1 text-2xl font-bold">
                        {clampPercent(attempt.accuracy || 0)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Desktop */}
                <div className="hidden gap-5 md:grid md:grid-cols-[1fr_auto_auto] md:items-center">
                  <div>
                    <p className="text-lg font-semibold">
                      {attempt.test?.title || "AI Test"}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs opacity-70">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays size={14} />
                        {formatDate(attempt.createdAt)}
                      </span>

                      <span className="inline-flex items-center gap-1">
                        <Clock3 size={14} />
                        {getDuration(attempt)}
                      </span>

                      <span>
                        {normalizeSubject(
                          attempt.test?.subjects?.[0],
                          "mixed practice"
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm md:w-48">
                    <div>
                      <p className="opacity-60">Score</p>
                      <p className="text-xl font-semibold">
                        {clampPercent(attempt.score || 0)}%
                      </p>
                    </div>

                    <div>
                      <p className="opacity-60">Accuracy</p>
                      <p className="text-xl font-semibold">
                        {clampPercent(attempt.accuracy || 0)}%
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(`/main/history/review/${attempt._id}`)
                    }
                    className="button-secondary w-fit gap-2"
                  >
                    Review
                    <ArrowRight size={18} />
                  </button>
                </div>
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
