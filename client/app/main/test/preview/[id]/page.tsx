"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardPen,
  FileQuestion,
  Gauge,
  Layers3,
  Sparkles,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type TestPreviewData = {
  _id: string;
  title: string;
  type?: "manual" | "generated";
  testFormat?: "mcq" | "subjective";
  difficulty?: string;
  totalQuestions?: number;
  duration?: number;
  subjects?: string[];
  createdAt?: string;
  questions?: unknown[];
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const formatDate = (value?: string) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function TestPreview() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [test, setTest] = useState<TestPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(
          BACKEND_URL + `/api/test/${id}`,
          {
            credentials: "include",
          }
        );

        const data = await res.json();

        if (!res.ok) return;

        setTest(data.test);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTest();
  }, [id]);

  const startTest = async () => {
    if (starting) return;

    try {
      setStarting(true);

      const res = await fetch(
        BACKEND_URL + "/api/attempt/start",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            testId: id,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) return;

      router.push(`/main/test/attempt/${data.attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const questionCount =
    test?.totalQuestions || test?.questions?.length || 0;

  const subjectCount = test?.subjects?.length || 0;

  const isGenerated = test?.type === "generated";

  const TestTypeIcon = isGenerated
    ? Sparkles
    : ClipboardPen;

  const formatLabel =
    test?.testFormat === "subjective"
      ? "Subjective"
      : "MCQ";

  const briefingItems = useMemo(
    () => [
      "The timer starts immediately after you begin.",
      "Keep the test tab open until you submit.",
    ],
    []
  );

  if (loading) return <Loader2 />;

  if (!test) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-5">
        <div className="card max-w-lg text-center">
          <h2 className="text-3xl font-bold">
            Test not found
          </h2>

          <p className="mt-3 text-sm opacity-65">
            This test may have been removed or is unavailable.
          </p>

          <button
            onClick={() =>
              router.push("/main/tests")
            }
            className="button-secondary mt-7 gap-2"
          >
            <ArrowLeft size={18} />
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=" space-y-5 px-5 py-5">

      <section className="flex flex-col gap-5 border-b border-(--border) pb-3 lg:flex-row lg:items-end lg:justify-between">

        <div className="flex gap-5">

          <button
            onClick={() => router.push("/main/tests") }
            className="button-secondary w-fit gap-2"
          >
            <ArrowLeft size={18} />
            Tests
          </button>

          <div>

            <h1 className="text-3xl font-bold">
              {test.title || "Untitled Test"}
            </h1>

          </div>

        </div>

      </section>

      <section className="grid gap-7 xl:grid-cols-[1fr_360px]">

        <div className="space-y-7">

          <div className="card">

            <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">

              <div>

                <div className="flex flex-wrap gap-3">

                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white">
                    <TestTypeIcon size={14} />
                    {isGenerated ? "AI Generated" : "Manual"}
                  </span>

                  <span className="inline-flex items-center rounded-full bg-secondary px-4 py-2 text-xs font-semibold">
                    {formatLabel}
                  </span>

                </div>

                <h2 className="mt-6 text-3xl font-bold">
                  Pre-attempt Overview
                </h2>

                <p className="mt-3 max-w-2xl text-sm opacity-70">
                  Check the test format, duration and
                  subject coverage before entering the
                  attempt interface.
                </p>

              </div>

              <div className="rounded-2xl bg-secondary p-6">

                <p className="text-xs uppercase tracking-wide opacity-60">
                  Estimated Pace
                </p>

                <p className="mt-3 text-4xl font-bold text-primary">

                  {questionCount && test.duration
                    ? Math.max(
                        1,
                        Math.round(
                          (test.duration * 60) /
                            questionCount
                        )
                      )
                    : "-"}

                  <span className="ml-1 text-lg">
                    sec
                  </span>

                </p>

                <p className="text-sm opacity-60">
                  per question
                </p>

              </div>

            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

              <div className="card">

                <div className="flex items-center gap-2">
                  <Gauge
                  className="text-primary"
                  size={24}
                />

                <p className="text-sm opacity-60">
                  Difficulty
                </p>
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {test.difficulty || "Mixed"}
                </h3>

              </div>

              <div className="card">

                <div className="flex items-center gap-2">
                  <FileQuestion
                  className="text-primary"
                  size={24}
                />

                <p className=" text-sm opacity-60">
                  Questions
                </p>
                </div>

                <h3 className="mt-4 text-2xl font-semibold">
                  {questionCount}
                </h3>

              </div>

              <div className="card">

                <div className="flex items-center gap-2">
                  <Clock3
                  className="text-primary"
                  size={24}
                />

                <p className="text-sm opacity-60">
                  Duration
                </p>
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {test.duration} min
                </h3>

              </div>

              <div className="card">

                <div className="flex items-center gap-2">
                  <Layers3
                  className="text-primary"
                  size={24}
                />

                <p className="text-sm opacity-60">
                  Subjects
                </p>
                </div>

                <h3 className="mt-4 text-xl font-semibold">
                  {subjectCount}
                </h3>

              </div>

            </div>

          </div>
                    <div className="card">

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm opacity-60">
                  Coverage
                </p>

                <h2 className="text-2xl font-bold">
                  Subjects in this test
                </h2>

              </div>

              <div className="flex items-center gap-2 text-sm opacity-65">
                <CalendarDays size={16} />
                Created {formatDate(test.createdAt)}
              </div>

            </div>

            {subjectCount > 0 ? (

              <div className="flex flex-wrap gap-3">

                {test.subjects?.map((subject) => (

                  <span
                    key={subject}
                    className="rounded-full bg-secondary px-4 py-2 text-sm font-medium"
                  >
                    {subject}
                  </span>

                ))}

              </div>

            ) : (

              <div className="rounded-xl border border-dashed border-(--border) bg-secondary p-5 text-sm opacity-70">
                No subject labels were attached to this test.
              </div>

            )}

          </div>

        </div>

        <aside className="space-y-4">

          <div className="card">

            <h2 className="mt-1 text-2xl font-bold">
              Before you begin
            </h2>

            <div className="mt-4 space-y-5">

              {briefingItems.map((item) => (

                <div
                  key={item}
                  className="flex items-start gap-3"
                >

                  <CheckCircle2
                    size={20}
                    className="mt-0.5 shrink-0 text-primary"
                  />

                  <p className="text-sm leading-6 opacity-80">
                    {item}
                  </p>

                </div>

              ))}

            </div>

          </div>

          <div className="card2">

            <p className="text-sm opacity-60">
              Start Attempt
            </p>

            <h2 className="mt-2 text-4xl font-bold">
              {test.duration || "-"}
              <span className="ml-2 text-lg font-medium opacity-70">
                minutes
              </span>
            </h2>

            <p className="mt-2 text-sm leading-6 opacity-70">
              Once you begin, you will be redirected
            </p>

            <div className="mt-5 space-y-2 rounded-2xl bg-secondary p-5">

              <div className="flex items-center justify-between">

                <span className="text-sm opacity-70">
                  Questions
                </span>

                <span className="font-semibold">
                  {questionCount}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm opacity-70">
                  Format
                </span>

                <span className="font-semibold">
                  {formatLabel}
                </span>

              </div>

              <div className="flex items-center justify-between">

                <span className="text-sm opacity-70">
                  Difficulty
                </span>

                <span className="font-semibold">
                  {test.difficulty || "Mixed"}
                </span>

              </div>

            </div>

            <button
              onClick={startTest}
              disabled={starting}
              className={`mt-5 w-full justify-between ${
                starting
                  ? "cursor-not-allowed opacity-60"
                  : ""
              }`}
            >

              {starting
                ? "Preparing attempt..."
                : "Start Test"}

              <ArrowRight size={18} />

            </button>

          </div>

        </aside>

      </section>

    </div>

  );

}