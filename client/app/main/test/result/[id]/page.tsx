"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  CircleX,
  Clock3,
  FileQuestion,
  History,
  RotateCcw,
  Trophy,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type TestSummary = {
  _id?: string;
  title?: string;
  duration?: number;
  questions?: unknown[];
};

type AttemptResult = {
  _id: string;
  score?: number;
  accuracy?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  timeTaken?: number;
  startedAt?: string;
  completedAt?: string;
  test?: TestSummary;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

const formatTime = (seconds?: number) => {
  if (!seconds) return "-";

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes <= 0) return `${remainingSeconds}s`;
  return `${minutes}m ${String(remainingSeconds).padStart(2, "0")}s`;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
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

  const totalQuestions = useMemo(() => {
    if (!result) return 0;
    const counted = (result.correct || 0) + (result.wrong || 0) + (result.skipped || 0);
    return counted || result.test?.questions?.length || 0;
  }, [result]);

  if (loading) {
    return <Loader2 />;
  }

  if (!result) {
    return (
      <div className="grid min-h-screen place-items-center bg-(--bg) p-6">
        <div className="card max-w-xl p-8 text-center">
          <p className="text-2xl font-extrabold">Result not found</p>
          <p className="mt-2 text-sm opacity-65">This attempt result could not be loaded.</p>
          <button onClick={() => router.push("/main/tests")} className="mt-6 gap-2">
            Back to tests
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  const accuracy = clampPercent(result.accuracy || 0);
  const score = Math.round(result.score || 0);
  const correct = result.correct || 0;
  const wrong = result.wrong || 0;
  const skipped = result.skipped || 0;
  const attempted = correct + wrong;
  const resultTone =
    accuracy >= 80
      ? "Excellent control"
      : accuracy >= 60
        ? "Solid attempt"
        : "Needs focused review";

  return (
    <div className="mx-auto space-y-7 overflow-y-auto px-8 py-6">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <Trophy size={18} />
            Attempt result
          </div>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">
            {result.test?.title || "Test Result"}
          </h1>
          <p className="mt-3 max-w-2xl text-sm opacity-70">
            Submitted {formatDateTime(result.completedAt || result.startedAt)}. Review the breakdown before your next attempt.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={() => router.push("/main/tests")} className="button-secondary gap-2">
            <FileQuestion size={18} />
            Tests
          </button>
          <button onClick={() => router.push(`/main/history/review/${result._id}`)} className="gap-2">
            Review answers
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.42fr_1fr]">
        <div className="card2 p-6 md:p-7">
          <p className="text-sm font-bold opacity-60">Overall performance</p>
          <h2 className="mt-1 text-3xl font-extrabold">{resultTone}</h2>

          <div className="my-7 flex justify-center">
            <div
              className="grid h-56 w-56 place-items-center rounded-full border border-black shadow-[5px_5px_0px_black]"
              style={{
                background: `conic-gradient(var(--primary) ${accuracy * 3.6}deg, var(--surface) 0deg)`,
              }}
            >
              <div className="grid h-40 w-40 place-items-center rounded-full border border-black bg-(--bg-secondary) text-center">
                <div>
                  <p className="text-5xl font-extrabold">{accuracy}%</p>
                  <p className="text-xs font-bold uppercase opacity-60">accuracy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="border border-black bg-(--surface) p-3 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="font-bold opacity-60">Score</p>
              <p className="mt-1 text-2xl font-extrabold text-primary">{score}</p>
            </div>
            <div className="border border-black bg-(--surface) p-3 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="font-bold opacity-60">Total</p>
              <p className="mt-1 text-2xl font-extrabold">{totalQuestions || "-"}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <CheckCircle2 size={24} className="mb-4 text-primary" />
              <p className="text-sm font-bold opacity-60">Correct</p>
              <p className="mt-2 text-4xl font-extrabold text-primary">{correct}</p>
            </div>

            <div className="card p-5">
              <CircleX size={24} className="mb-4 text-primary" />
              <p className="text-sm font-bold opacity-60">Wrong</p>
              <p className="mt-2 text-4xl font-extrabold">{wrong}</p>
            </div>

            <div className="card p-5">
              <FileQuestion size={24} className="mb-4 text-primary" />
              <p className="text-sm font-bold opacity-60">Skipped</p>
              <p className="mt-2 text-4xl font-extrabold">{skipped}</p>
            </div>
          </div>

          <div className="card p-6 md:p-7">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold opacity-60">Attempt breakdown</p>
                <h2 className="text-2xl font-extrabold">Question distribution</h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold opacity-65">
                <Clock3 size={17} />
                {formatTime(result.timeTaken)}
              </div>
            </div>

            <div className="h-5 overflow-hidden border border-black bg-(--surface)">
              <div className="flex h-full">
                <div
                  className="border-r border-black bg-primary"
                  style={{ width: `${totalQuestions ? (correct / totalQuestions) * 100 : 0}%` }}
                />
                <div
                  className="border-r border-black bg-(--text)"
                  style={{ width: `${totalQuestions ? (wrong / totalQuestions) * 100 : 0}%` }}
                />
                <div
                  className="bg-(--bg-secondary)"
                  style={{ width: `${totalQuestions ? (skipped / totalQuestions) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3 text-sm md:grid-cols-3">
              <div className="flex items-center gap-2 font-bold">
                <span className="h-3 w-3 border border-black bg-primary" />
                Correct: {correct}
              </div>
              <div className="flex items-center gap-2 font-bold">
                <span className="h-3 w-3 border border-black bg-(--text)" />
                Wrong: {wrong}
              </div>
              <div className="flex items-center gap-2 font-bold">
                <span className="h-3 w-3 border border-black bg-(--bg-secondary)" />
                Skipped: {skipped}
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="card p-5">
              <BarChart3 size={22} className="mb-4 text-primary" />
              <p className="text-sm font-bold opacity-60">Attempted</p>
              <p className="mt-2 text-2xl font-extrabold">{attempted}</p>
            </div>
            <div className="card p-5">
              <Clock3 size={22} className="mb-4 text-primary" />
              <p className="text-sm font-bold opacity-60">Time taken</p>
              <p className="mt-2 text-2xl font-extrabold">{formatTime(result.timeTaken)}</p>
            </div>
            <div className="card p-5">
              <History size={22} className="mb-4 text-primary" />
              <p className="text-sm font-bold opacity-60">Status</p>
              <p className="mt-2 text-2xl font-extrabold">Submitted</p>
            </div>
          </div>
        </div>
      </section>

      <section className="card flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-7">
        <div>
          <p className="text-sm font-bold opacity-60">Next step</p>
          <h2 className="text-2xl font-extrabold">Review mistakes before attempting again.</h2>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={() => router.push(`/main/history/review/${result._id}`)} className="gap-2">
            Review answers
            <ArrowRight size={18} />
          </button>
          {result.test?._id && (
            <button
              onClick={() => router.push(`/main/test/preview/${result.test?._id}`)}
              className="button-secondary gap-2"
            >
              <RotateCcw size={18} />
              Retake
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
