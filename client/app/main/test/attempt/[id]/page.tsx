"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  FileQuestion,
  Flag,
  ListChecks,
  Send,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type Question = {
  question: string;
  options: string[];
};

type Test = {
  _id: string;
  title?: string;
  questions: Question[];
};

type Attempt = {
  _id: string;
  status: string;
  startedAt: string;
  duration: number;
  test: Test;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const formatTime = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export default function AttemptPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const attemptId = params.id;

  const [test, setTest] = useState<Test | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Array<number | undefined>>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const questions = useMemo(() => test?.questions || [], [test]);
  const currentQuestion = questions[current];
  const answeredCount = answers.filter((answer) => answer !== undefined).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progress = questions.length > 0 ? Math.round(((current + 1) / questions.length) * 100) : 0;
  const isLastQuestion = current === questions.length - 1;

  const submitTest = useCallback(async () => {
    if (submitting || !attemptId) return;

    try {
      setSubmitting(true);

      const res = await fetch(BACKEND_URL + "/api/attempt/submit", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attemptId,
          answers,
        }),
      });

      const data = await res.json();
      if (!res.ok) return;

      router.replace(`/main/test/result/${data.attemptId}`);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }, [answers, attemptId, router, submitting]);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await fetch(BACKEND_URL + `/api/attempt/${attemptId}`, {
          credentials: "include",
        });

        const data = await res.json();
        if (!res.ok) return;

        if (data.attempt.status !== "in_progress") {
          router.replace(`/main/test/result/${data.attempt._id}`);
          return;
        }

        const fetchedAttempt = data.attempt as Attempt;
        const fetchedQuestions = fetchedAttempt.test.questions || [];

        setAttempt(fetchedAttempt);
        setTest(fetchedAttempt.test);
        setAnswers(Array(fetchedQuestions.length).fill(undefined));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) fetchAttempt();
  }, [attemptId, router]);

  useEffect(() => {
    if (!attempt) return;

    const start = new Date(attempt.startedAt).getTime();
    const duration = attempt.duration * 60 * 1000;

    const updateTimer = () => {
      const remaining = start + duration - Date.now();

      if (remaining <= 0) {
        setTimeLeft(0);
        submitTest();
        return;
      }

      setTimeLeft(Math.floor(remaining / 1000));
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);

    return () => window.clearInterval(interval);
  }, [attempt, submitTest]);

  useEffect(() => {
    const handleLeave = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleLeave);
    return () => window.removeEventListener("beforeunload", handleLeave);
  }, []);

  const selectOption = (index: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = index;
      return updated;
    });
  };

  const goToQuestion = (index: number) => {
    setCurrent(Math.max(0, Math.min(index, questions.length - 1)));
  };

  if (loading) {
    return <Loader2 />;
  }

  if (!test || questions.length === 0 || !currentQuestion) {
    return (
      <div className="grid h-screen place-items-center bg-(--bg) p-6">
        <div className="card max-w-xl p-8 text-center">
          <p className="text-2xl font-extrabold">Attempt unavailable</p>
          <p className="mt-2 text-sm opacity-65">This attempt has no questions or could not be loaded.</p>
          <button onClick={() => router.push("/main/tests")} className="mt-6 gap-2">
            <ArrowLeft size={18} />
            Back to tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-(--bg) text-(--text)">
      <header className="shrink-0 border-b border-black bg-(--bg-secondary) px-4 py-3 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
              <FileQuestion size={15} />
              Live attempt
            </div>
            <h1 className="truncate text-2xl font-extrabold md:text-3xl">
              {test.title || "Mock Test"}
            </h1>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:min-w-136">
            <div className="border border-black bg-(--surface) px-4 py-2 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold opacity-60">Question</p>
              <p className="text-lg font-extrabold">
                {current + 1}/{questions.length}
              </p>
            </div>
            <div className="border border-black bg-(--surface) px-4 py-2 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold opacity-60">Answered</p>
              <p className="text-lg font-extrabold text-primary">{answeredCount}</p>
            </div>
            <div className="border border-black bg-(--surface) px-4 py-2 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="text-xs font-bold opacity-60">Time left</p>
              <p className={`text-lg font-extrabold ${timeLeft <= 300 ? "text-primary" : ""}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 h-3 border border-black bg-(--surface)">
          <div className="h-full border-r border-black bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[1fr_20rem]">
        <section className="min-h-0 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-5">
            <div className="card p-6 md:p-8">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 border border-black bg-(--surface) px-3 py-1 text-xs font-extrabold uppercase shadow-[3px_3px_0px_black]">
                  <ListChecks size={14} />
                  Single correct option
                </div>
                <div className="flex items-center gap-2 text-sm font-bold opacity-65">
                  <Clock3 size={17} />
                  {formatTime(timeLeft)}
                </div>
              </div>

              <p className="mb-3 text-sm font-bold uppercase opacity-60">
                Question {current + 1}
              </p>
              <h2 className="text-2xl font-extrabold leading-relaxed md:text-3xl">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, index) => {
                const selected = answers[current] === index;

                return (
                  <div
                    key={`${option}-${index}`}
                    onClick={() => selectOption(index)}
                    className={`h-auto cursor-pointer rounded-full overflow-clip min-h-18 w-full justify-start px-0 py-0 text-left shadow-none hover:transform-none hover:shadow-none ${
                      selected
                        ? "bg-primary text-white"
                        : "button-secondary bg-(--bg-secondary) text-(--text)"
                    }`}
                  >
                    <span
                      className={`flex h-full w-full items-start gap-4 p-5 ${
                        selected ? "bg-primary text-white" : ""
                      }`}
                    >
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center border border-black text-sm font-extrabold shadow-[2px_2px_0px_black] ${
                          selected ? "bg-white text-black" : "bg-(--bg-secondary)"
                        }`}
                      >
                        {optionLabels[index] || index + 1}
                      </span>
                      <span className="pt-1 text-base font-bold leading-relaxed">{option}</span>
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-3 border-t border-(--border) pt-5 sm:flex-row sm:items-center sm:justify-between">
              <button
                className="button-secondary gap-2"
                onClick={() => goToQuestion(current - 1)}
                disabled={current === 0}
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              {isLastQuestion ? (
                <button
                  disabled={submitting}
                  className={`gap-2 ${submitting ? "cursor-not-allowed opacity-65" : ""}`}
                  onClick={submitTest}
                >
                  {submitting ? "Submitting" : "Submit test"}
                  <Send size={18} />
                </button>
              ) : (
                <button className="gap-2" onClick={() => goToQuestion(current + 1)}>
                  Next
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </section>

        <aside className="min-h-0 overflow-y-auto border-t border-black bg-(--bg-secondary) p-4 lg:border-l lg:border-t-0 lg:p-5">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold opacity-60">Question palette</p>
              <h2 className="text-2xl font-extrabold">Navigate</h2>
            </div>
            <Flag className="text-primary" size={24} />
          </div>

          <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
            <div className="border border-black bg-(--surface) p-3 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="font-extrabold text-primary">{answeredCount}</p>
              <p className="text-xs opacity-60">Answered</p>
            </div>
            <div className="border border-black bg-(--surface) p-3 shadow-[3px_3px_0px_var(--shadow)]">
              <p className="font-extrabold">{unansweredCount}</p>
              <p className="text-xs opacity-60">Remaining</p>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 lg:grid-cols-4">
            {questions.map((_, index) => {
              const answered = answers[index] !== undefined;
              const active = current === index;

              return (
                <button
                  key={index}
                  onClick={() => goToQuestion(index)}
                  className={`h-11 rounded-none px-0 text-sm shadow-[3px_3px_0px_black] hover:transform-none ${
                    active || answered
                      ? "bg-primary text-white"
                      : "button-secondary bg-(--surface) text-(--text)"
                  }`}
                >
                  <span className="flex items-center justify-center gap-1">
                    {answered ? <CheckCircle2 size={14} /> : <Circle size={12} />}
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            disabled={submitting}
            onClick={submitTest}
            className={`mt-6 w-full justify-between ${submitting ? "cursor-not-allowed opacity-65" : ""}`}
          >
            {submitting ? "Submitting" : "Submit"}
            <Send size={18} />
          </button>
        </aside>
      </main>
    </div>
  );
}
