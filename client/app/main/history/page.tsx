"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileQuestion,
  History,
  ListFilter,
  RotateCcw,
  Search,
  Target,
  TrendingUp,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type Attempt = {
  _id: string;
  score?: number;
  accuracy?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  test?: {
    _id?: string;
    title?: string;
    subjects?: string[];
    totalQuestions?: number;
  };
};

type SortMode = "latest" | "oldest" | "highest-score" | "highest-accuracy" | "fastest";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const formatDate = (value?: string) => {
  if (!value) return "Not recorded";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatTime = (value?: string) => {
  if (!value) return "";

  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDuration = (attempt: Attempt) => {
  if (!attempt.startedAt || !attempt.completedAt) return null;

  const duration = Math.round(
    (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000,
  );

  return Number.isFinite(duration) && duration >= 0 ? duration : null;
};

const getSubject = (attempt: Attempt) => attempt.test?.subjects?.[0] || "General";

const percent = (value?: number) => `${Math.round(value || 0)}%`;

export default function AttemptsPage() {
  const router = useRouter();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(6);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState<SortMode>("latest");

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

  const subjects = useMemo(() => {
    return Array.from(new Set(attempts.map(getSubject))).sort((a, b) => a.localeCompare(b));
  }, [attempts]);

  const filteredAttempts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return attempts
      .filter((attempt) => {
        const title = (attempt.test?.title || "Mock Test").toLowerCase();
        const attemptSubject = getSubject(attempt).toLowerCase();
        const matchesSearch = title.includes(query) || attemptSubject.includes(query);
        const matchesSubject = subject === "all" || attemptSubject === subject.toLowerCase();

        return matchesSearch && matchesSubject;
      })
      .sort((a, b) => {
        if (sort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sort === "highest-score") return (b.score || 0) - (a.score || 0);
        if (sort === "highest-accuracy") return (b.accuracy || 0) - (a.accuracy || 0);
        if (sort === "fastest") {
          return (getDuration(a) ?? Number.MAX_SAFE_INTEGER) - (getDuration(b) ?? Number.MAX_SAFE_INTEGER);
        }

        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [attempts, search, sort, subject]);

  const visibleAttempts = filteredAttempts.slice(0, visible);
  const completedAttempts = attempts.filter((attempt) => attempt.completedAt);
  const averageAccuracy =
    completedAttempts.length > 0
      ? Math.round(
          completedAttempts.reduce((total, attempt) => total + (attempt.accuracy || 0), 0) /
            completedAttempts.length,
        )
      : 0;
  const bestAttempt = attempts.reduce<Attempt | null>((best, attempt) => {
    if (!best) return attempt;
    return (attempt.score || 0) > (best.score || 0) ? attempt : best;
  }, null);
  const totalMinutes = attempts.reduce((total, attempt) => total + (getDuration(attempt) || 0), 0);

  const handleSearch = (value: string) => {
    setSearch(value);
    setVisible(6);
  };

  const handleSubject = (value: string) => {
    setSubject(value);
    setVisible(6);
  };

  const handleSort = (value: SortMode) => {
    setSort(value);
    setVisible(6);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <History size={18} />
            Attempt History
          </div>
        </div>

        <button onClick={() => router.push("/main/tests")} className="gap-2">
          <FileQuestion size={18} />
          Take test
        </button>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="card2 p-5">
          <CheckCircle2 size={23} className="mb-4 text-primary" />
          <p className="text-sm font-bold opacity-60">Completed attempts</p>
          <p className="mt-2 text-3xl font-extrabold">{completedAttempts.length}</p>
          <p className="text-xs opacity-60">{attempts.length} total records</p>
        </div>

        <div className="card p-5">
          <Target size={23} className="mb-4 text-primary" />
          <p className="text-sm font-bold opacity-60">Average accuracy</p>
          <p className="mt-2 text-3xl font-extrabold">{completedAttempts.length ? `${averageAccuracy}%` : "--"}</p>
          <p className="text-xs opacity-60">across completed tests</p>
        </div>

        <div className="card p-5">
          <TrendingUp size={23} className="mb-4 text-primary" />
          <p className="text-sm font-bold opacity-60">Best score</p>
          <p className="mt-2 text-3xl font-extrabold">
            {bestAttempt ? Math.round(bestAttempt.score || 0) : "--"}
          </p>
          <p className="truncate text-xs opacity-60">{bestAttempt?.test?.title || `${totalMinutes} min practiced`}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_13rem_13rem] lg:items-center">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <input
            value={search}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search by test title or subject..."
            className="h-11 w-full pl-10!"
          />
        </label>

        <label className="relative">
          <FileQuestion className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <select
            value={subject}
            onChange={(event) => handleSubject(event.target.value)}
            className="h-11 w-full pl-10!"
          >
            <option value="all">All subjects</option>
            {subjects.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="relative">
          <ListFilter className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" size={18} />
          <select
            value={sort}
            onChange={(event) => handleSort(event.target.value as SortMode)}
            className="h-11 w-full pl-10!"
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest-score">Highest score</option>
            <option value="highest-accuracy">Highest accuracy</option>
            <option value="fastest">Fastest completion</option>
          </select>
        </label>
      </section>

      <section>
        <div className="mb-3 grid grid-cols-[1fr_5rem_7rem_6rem_10rem_11rem] gap-4 px-5 text-xs font-extrabold uppercase opacity-50 max-lg:hidden">
          <span>Test</span>
          <span>Score</span>
          <span>Accuracy</span>
          <span>Duration</span>
          <span>Completed</span>
          <span className="text-right">Action</span>
        </div>

        {loading ? (
          <Loader2 />
        ) : filteredAttempts.length === 0 ? (
          <div className="card grid min-h-64 place-items-center p-7 text-center">
            <div>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-black bg-primary text-white shadow-[4px_4px_0px_black]">
                <History size={26} />
              </div>
              <p className="text-2xl font-extrabold">No attempts found</p>
              <p className="mx-auto mt-2 max-w-md text-sm opacity-65">
                {attempts.length
                  ? "Try changing the search, subject, or sorting controls."
                  : "Your completed mock tests will appear here with review and retake options."}
              </p>
              <button onClick={() => router.push("/main/tests")} className="mt-6 gap-2">
                <FileQuestion size={18} />
                Browse tests
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {visibleAttempts.map((attempt) => {
              const duration = getDuration(attempt);
              const completedAt = attempt.completedAt || attempt.createdAt;
              const canRetake = Boolean(attempt.test?._id);

              return (
                <article key={attempt._id} className="card grid gap-4 p-5 lg:grid-cols-[1fr_5rem_7rem_6rem_10rem_11rem] lg:items-center">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 border border-black bg-(--surface) px-2 py-0.5 text-xs font-extrabold uppercase">
                        <FileQuestion size={13} />
                        {getSubject(attempt)}
                      </span>
                    </div>
                    <p className="truncate text-lg font-bold">{attempt.test?.title || "Mock Test"}</p>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{Math.round(attempt.score || 0)}</span>
                    <span className="opacity-60 lg:hidden">score</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{percent(attempt.accuracy)}</span>
                    <span className="opacity-60 lg:hidden">accuracy</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{duration === null ? "--" : `${duration} min`}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-semibold">{formatDate(completedAt)}</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row lg:justify-end">
                    <button className="button-secondary w-full gap-2 px-3 lg:w-fit" onClick={() => router.push(`/main/history/review/${attempt._id}`)}>
                      Review
                      <ArrowRight size={17} />
                    </button>
                    {canRetake && (
                      <button className="w-full gap-2 px-3 lg:w-fit" onClick={() => router.push(`/main/test/preview/${attempt.test?._id}`)}>
                        <RotateCcw size={17} />
                        Retake
                      </button>
                    )}
                  </div>
                </article>
              );
            })}

            {visible < filteredAttempts.length && (
              <div className="flex justify-end pt-2">
                <button className="button-secondary gap-2" onClick={() => setVisible((prev) => prev + 8)}>
                  Load more
                  <ArrowRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}