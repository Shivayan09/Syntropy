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
  ListChecks,
  RotateCcw,
  Target,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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

const formatAttemptDuration = (result: AttemptResult) => {
  if (result.timeTaken) return formatTime(result.timeTaken);
  if (!result.startedAt || !result.completedAt) return "-";

  const seconds = Math.round(
    (new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()) / 1000,
  );

  return Number.isFinite(seconds) && seconds >= 0 ? formatTime(seconds) : "-";
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
  const duration = formatAttemptDuration(result);
  const submittedAt = formatDateTime(result.completedAt);
  const testTitle = result.test?.title || "Mock Test";
  const resultTone =
    accuracy >= 80
      ? "Excellent control"
      : accuracy >= 60
        ? "Solid attempt"
        : "Needs focused review";

  return (
    <div className="mx-auto space-y-7 overflow-y-auto px-8 py-6">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
            <Trophy size={18} />
            Attempt result
          </div>
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

      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="card2 p-6 md:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-bold opacity-60">Score report</p>
              <h2 className="mt-1 text-3xl font-extrabold">{resultTone}</h2>
            </div>
            <Target className="text-primary" size={28} />
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-[13rem_1fr] md:items-center xl:grid-cols-1">
            <div
              className="grid h-52 w-52 place-items-center justify-self-center rounded-full border border-(--border)"
              style={{
                background: `conic-gradient(var(--primary) ${accuracy * 3.6}deg, var(--surface) 0deg)`,
              }}
            >
              <div className="grid h-36 w-36 place-items-center rounded-full border border-(--border) bg-(--bg-secondary) text-center">
                <div>
                  <p className="text-5xl font-extrabold">{accuracy}%</p>
                  <p className="text-xs font-bold uppercase opacity-60">accuracy</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border border-(--border) bg-(--surface) p-4">
                <p className="text-sm font-bold opacity-60">Test</p>
                <p className="mt-1 truncate text-xl font-extrabold">{testTitle}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-(--border) bg-(--surface) p-4">
                  <p className="text-sm font-bold opacity-60">Submitted</p>
                  <p className="mt-1 text-base font-extrabold">{submittedAt}</p>
                </div>
                <div className="border border-(--border) bg-(--surface) p-4">
                  <p className="text-sm font-bold opacity-60">Time</p>
                  <p className="mt-1 text-base font-extrabold">{duration}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <ResultMetric icon={CheckCircle2} label="Correct" value={correct} tone="primary" />
            <ResultMetric icon={CircleX} label="Wrong" value={wrong} />
            <ResultMetric icon={FileQuestion} label="Skipped" value={skipped} />
          </div>

          <div className="card p-6 md:p-7">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold opacity-60">Question distribution</p>
                <h2 className="text-2xl font-extrabold">Attempt quality</h2>
              </div>
              <p className="text-sm font-bold opacity-65">
                {attempted}/{totalQuestions || "-"} attempted
              </p>
            </div>

            <div className="space-y-4">
              <DistributionRow
                label="Correct"
                value={correct}
                total={totalQuestions}
                className="bg-primary"
              />
              <DistributionRow
                label="Wrong"
                value={wrong}
                total={totalQuestions}
                className="bg-(--text)"
              />
              <DistributionRow
                label="Skipped"
                value={skipped}
                total={totalQuestions}
                className="bg-(--bg-secondary)"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <SmallStat icon={BarChart3} label="Score" value={`${score}/${totalQuestions || "-"}`} />
            <SmallStat icon={Clock3} label="Time taken" value={duration} />
            <SmallStat icon={ListChecks} label="Status" value="Submitted" />
          </div>
        </div>
      </section>

      <section className="grid gap-8 border-t border-(--border) pt-7 xl:grid-cols-[1fr_0.65fr]">
        <div>
          <p className="text-sm font-bold opacity-60">Recommended next step</p>
          <h2 className="mt-1 text-2xl font-extrabold">Review every incorrect and skipped question before retaking.</h2>
          <p className="mt-2 max-w-2xl text-sm opacity-65">
            The fastest improvement usually comes from checking why an answer was missed, then attempting a similar test after a short revision pass.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
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
        </div>

        <div className="border-l-0 border-(--border) xl:border-l xl:pl-7">
          <p className="text-sm font-bold opacity-60">Quick read</p>
          <div className="mt-4 space-y-3 text-sm font-semibold">
            <p className="border-b border-(--border) pb-3">
              {accuracy >= 70 ? "Accuracy is in a healthy range." : "Accuracy needs focused revision."}
            </p>
            <p className="border-b border-(--border) pb-3">
              {skipped > 0 ? `${skipped} skipped questions should be reviewed first.` : "No skipped questions. Good completion discipline."}
            </p>
            <p>
              {wrong > 0 ? `${wrong} wrong answers need concept-level review.` : "No wrong answers recorded."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ResultMetric({
  label,
  tone,
  value,
}: {
  icon: LucideIcon;
  label: string;
  tone?: "primary";
  value: number;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-bold opacity-60">{label}</p>
      <p className={`mt-2 text-4xl font-extrabold ${tone === "primary" ? "text-primary" : ""}`}>{value}</p>
    </div>
  );
}

function DistributionRow({
  className,
  label,
  total,
  value,
}: {
  className: string;
  label: string;
  total: number;
  value: number;
}) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4 text-sm">
        <p className="font-bold">{label}</p>
        <p className="font-extrabold">{value}</p>
      </div>
      <div className="h-3 border border-(--border) bg-(--surface)">
        <div className={`h-full ${className}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function SmallStat({
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-5">
      <p className="text-sm font-bold opacity-60">{label}</p>
      <p className="mt-2 text-2xl font-extrabold">{value}</p>
    </div>
  );
}
