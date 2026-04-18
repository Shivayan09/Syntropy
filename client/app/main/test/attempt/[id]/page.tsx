"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Circle,
  Clock3,
  Eraser,
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
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  const questions = useMemo(() => test?.questions || [], [test]);
  const currentQuestion = questions[current];
  const answeredCount = answers.filter((answer) => answer !== undefined).length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const reviewCount = markedForReview.filter(Boolean).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLastQuestion = current === questions.length - 1;
  const timeWarning = timeLeft > 0 && timeLeft <= 300;

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
        setMarkedForReview(Array(fetchedQuestions.length).fill(false));
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

  const clearAnswer = () => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = undefined;
      return updated;
    });
  };

  const toggleReview = () => {
    setMarkedForReview((prev) => {
      const updated = [...prev];
      updated[current] = !updated[current];
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
    <div className="grid h-screen overflow-hidden bg-(--bg-secondary) text-(--text) xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="flex min-h-0 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-8">
          <div className="mx-auto max-w-5xl space-y-5">
            {timeWarning && (
              <div className="flex items-start gap-3 border border-primary bg-(--surface) p-4 text-sm font-semibold text-(--text)">
                <AlertTriangle className="mt-0.5 shrink-0 text-primary" size={18} />
                <p>Less than five minutes remain. Confirm pending answers and submit before the timer expires.</p>
              </div>
            )}

            <div className="border border-(--border) bg-(--surface) px-5 py-5 shadow-[4px_4px_0px_var(--shadow)] md:px-7 md:py-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-2 border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-extrabold uppercase">
                    <ListChecks size={14} />
                    Single correct option
                  </span>
                  {markedForReview[current] && (
                    <span className="inline-flex items-center gap-2 border border-primary bg-primary px-3 py-1 text-xs font-extrabold uppercase text-white">
                      <BookmarkCheck size={14} />
                      Marked for review
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold opacity-65">Question {current + 1} of {questions.length}</p>
              </div>

              <h2 className="text-xl font-extrabold leading-relaxed md:text-2xl">
                {currentQuestion.question}
              </h2>
            </div>

            <div className="space-y-3 pb-4">
              {currentQuestion.options.map((option, index) => {
                const selected = answers[current] === index;

                return (
                  <div
                    key={`${option}-${index}`}
                    onClick={() => selectOption(index)}
                    className={`h-auto min-h-16 shadow-[4px_4px_0px_var(--shadow)] w-full rounded-none px-0 py-0 text-left hover:transform-none cursor-pointer ${
                      selected
                        ? "bg-primary text-white"
                        : "button-secondary bg-(--surface) text-(--text)"
                    }`}
                  >
                    <span className="flex min-h-16 w-full items-start gap-4 p-4 md:p-5">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center border text-sm font-extrabold ${
                          selected ? "border-white bg-white text-black" : "border-(--border) bg-(--bg-secondary)"
                        }`}
                      >
                        {optionLabels[index] || index + 1}
                      </span>
                      <span className="pt-1 text-base font-semibold leading-relaxed">{option}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="shrink-0 px-4 py-5 md:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
              <button
                className="button-secondary gap-2"
                onClick={toggleReview}
              >
                {markedForReview[current] ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {markedForReview[current] ? "Reviewed" : "Mark review"}
              </button>
              <button
                className="button-secondary gap-2"
                onClick={clearAnswer}
                disabled={answers[current] === undefined}
              >
                <Eraser size={18} />
                Clear response
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-end">
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
                  Save & next
                  <ArrowRight size={18} />
                </button>
              )}

              {!isLastQuestion && (
                <button
                  disabled={submitting}
                  className={`gap-2 ${submitting ? "cursor-not-allowed opacity-65" : ""}`}
                  onClick={submitTest}
                >
                  {submitting ? "Submitting" : "Submit test"}
                  <Send size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className="min-h-0 overflow-y-auto border-t border-(--border) bg-(--surface) p-4 xl:border-l xl:border-t-0 xl:p-5">
        <div className="mb-5 border-b border-(--border) pb-5">
          <p className="mb-1 text-xs font-extrabold uppercase text-primary">Mock test attempt</p>
          <h1 className="truncate text-xl font-extrabold leading-tight">{test.title || "Mock Test"}</h1>

          <div className={`mt-4 border px-4 py-3 ${timeWarning ? "border-primary bg-primary text-white" : "border-(--border) bg-(--bg-secondary)"}`}>
            <p className="text-xs font-bold uppercase opacity-70">Time left</p>
            <p className="mt-1 flex items-center gap-2 text-3xl font-extrabold">
              <Clock3 size={22} />
              {formatTime(timeLeft)}
            </p>
          </div>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase opacity-65">
              <span>Answered</span>
              <span>{answeredCount}/{questions.length}</span>
            </div>
            <div className="h-2 bg-(--bg-secondary)">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold opacity-60">Answer sheet</p>
            <h2 className="text-2xl font-extrabold">Palette</h2>
          </div>
          <Flag className="text-primary" size={23} />
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2 text-sm">
          <div className="border border-(--border) bg-(--bg-secondary) p-3">
            <p className="font-extrabold text-primary">{answeredCount}</p>
            <p className="text-xs opacity-60">Done</p>
          </div>
          <div className="border border-(--border) bg-(--bg-secondary) p-3">
            <p className="font-extrabold">{unansweredCount}</p>
            <p className="text-xs opacity-60">Left</p>
          </div>
          <div className="border border-(--border) bg-(--bg-secondary) p-3">
            <p className="font-extrabold">{reviewCount}</p>
            <p className="text-xs opacity-60">Review</p>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-2 xl:grid-cols-4">
          {questions.map((_, index) => {
            const answered = answers[index] !== undefined;
            const active = current === index;
            const marked = markedForReview[index];

            return (
              <button
                key={index}
                type="button"
                onClick={() => goToQuestion(index)}
                className={`h-11 rounded-none px-0 text-sm shadow-none hover:transform-none hover:shadow-none ${
                  active
                    ? "bg-black text-white"
                    : answered
                      ? "bg-primary text-white"
                      : marked
                        ? "button-secondary border-primary bg-(--surface) text-primary"
                        : "button-secondary bg-(--surface) text-(--text)"
                }`}
                aria-label={`Go to question ${index + 1}`}
              >
                <span className="flex items-center justify-center gap-1">
                  {answered ? <CheckCircle2 size={14} /> : marked ? <Bookmark size={13} /> : <Circle size={12} />}
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
