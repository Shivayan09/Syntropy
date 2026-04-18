"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ClipboardPen,
  FileQuestion,
  Gauge,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type TestPreviewData = {
  _id: string;
  title: string;
  type?: "manual" | "generated";
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
        const res = await fetch(BACKEND_URL + `/api/test/${id}`, {
          credentials: "include",
        });
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
      const res = await fetch(BACKEND_URL + "/api/attempt/start", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ testId: id }),
      });
      const data = await res.json();
      if (!res.ok) return;
      router.push(`/main/test/attempt/${data.attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setStarting(false);
    }
  };

  const questionCount = test?.totalQuestions || test?.questions?.length || 0;
  const subjectCount = test?.subjects?.length || 0;
  const isGenerated = test?.type === "generated";
  const TestTypeIcon = isGenerated ? Sparkles : ClipboardPen;

  const briefingItems = useMemo(
    () => [
      "The timer starts immediately after you begin.",
      "Keep the test tab open until you submit.",
      "Review all answered and unanswered questions before final submission.",
    ],
    []
  );

  if (loading) {
    return <Loader2 />;
  }

  if (!test) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center">
        <div className="card p-8 text-center">
          <p className="text-2xl font-extrabold">Test not found</p>
          <p className="mt-2 text-sm opacity-65">This test may have been removed or is unavailable.</p>
          <button onClick={() => router.push("/main/tests")} className="mt-6 gap-2">
            <ArrowLeft size={18} />
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto space-y-7 px-8 py-6">
      <section className="flex flex-col gap-5 border-b border-(--border) pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex items-center gap-3 md:gap-7">
          <div>
            <button onClick={() => router.push("/main/tests")} className="button-secondary gap-2">
            <ArrowLeft size={18} />
            Tests
          </button>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">
            {test.title || "Untitled test"}
          </h1>

        </div>

      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_0.42fr]">
        <div className="space-y-6">
          <div className="card p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <span className="inline-flex items-center text-white gap-2 border border-black bg-(--primary) px-3 py-1 text-xs font-extrabold uppercase shadow-[3px_3px_0px_black]">
                  <TestTypeIcon size={14} />
                  {isGenerated ? "AI Generated" : "Manual"}
                </span>
                <h2 className="mt-5 text-3xl font-extrabold">Pre-attempt overview</h2>
                <p className="mt-2 max-w-2xl text-sm opacity-70">
                  A quick operational check before you enter the timed attempt environment.
                </p>
              </div>

              <div className="border border-black bg-(--surface) p-4 shadow-[4px_4px_0px_var(--shadow)] lg:min-w-56">
                <p className="text-xs font-bold uppercase opacity-60">Estimated pace</p>
                <p className="mt-2 text-3xl font-extrabold text-primary">
                  {questionCount && test.duration ? Math.max(1, Math.round((test.duration * 60) / questionCount)) : "-"}s
                </p>
                <p className="text-xs opacity-60">per question</p>
              </div>
            </div>

            <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="card bg-(--surface) p-5">
                <Gauge size={22} className="mb-4 text-primary" />
                <p className="text-sm font-bold opacity-60">Difficulty</p>
                <p className="mt-1 text-xl font-extrabold">{test.difficulty || "Mixed"}</p>
              </div>

              <div className="card bg-(--surface) p-5">
                <FileQuestion size={22} className="mb-4 text-primary" />
                <p className="text-sm font-bold opacity-60">Questions</p>
                <p className="mt-1 text-xl font-extrabold">{questionCount || "-"}</p>
              </div>

              <div className="card bg-(--surface) p-5">
                <Clock3 size={22} className="mb-4 text-primary" />
                <p className="text-sm font-bold opacity-60">Duration</p>
                <p className="mt-1 text-xl font-extrabold">{test.duration || "-"} min</p>
              </div>

              <div className="card bg-(--surface) p-5">
                <Layers3 size={22} className="mb-4 text-primary" />
                <p className="text-sm font-bold opacity-60">Subjects</p>
                <p className="mt-1 text-xl font-extrabold">{subjectCount || "-"}</p>
              </div>
            </div>
          </div>

          <div className="card p-6 md:p-7">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-bold opacity-60">Coverage</p>
                <h2 className="text-2xl font-extrabold">Subjects in this test</h2>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold opacity-65">
                <CalendarDays size={17} />
                Created {formatDate(test.createdAt)}
              </div>
            </div>

            {subjectCount > 0 ? (
              <div className="flex flex-wrap gap-3">
                {test.subjects?.map((subject) => (
                  <span
                    key={subject}
                    className="border border-black bg-(--surface) px-4 py-2 text-sm font-extrabold shadow-[3px_3px_0px_var(--shadow)]"
                  >
                    {subject}
                  </span>
                ))}
              </div>
            ) : (
              <div className="border border-dashed border-black p-5 text-sm opacity-65">
                No subject labels were attached to this test.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="card p-6 md:p-7">
            <div className="mb-5 flex items-center gap-3">
              <div>
                <p className="text-sm font-bold opacity-60">Readiness check</p>
                <h2 className="text-2xl font-extrabold">Before you begin</h2>
              </div>
            </div>

            <div className="space-y-4">
              {briefingItems.map((item) => (
                <div key={item} className="flex gap-3 text-sm">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-primary" />
                  <p className="font-semibold opacity-80">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card2 p-6 md:p-7">
            <p className="text-sm font-bold opacity-60">Start attempt</p>
            <h2 className="mt-1 text-3xl font-extrabold">{test.duration || "-"} minutes</h2>
            <p className="mt-2 text-sm opacity-70">
              You will be redirected to the attempt interface immediately.
            </p>

            <button
              onClick={startTest}
              disabled={starting}
              className={`mt-6 w-full justify-between ${starting ? "cursor-not-allowed opacity-65" : ""}`}
            >
              {starting ? "Preparing attempt" : "Start now"}
              <ArrowRight size={18} />
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
