"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Clock3,
  FileQuestion,
  RotateCcw,
  Target,
  XCircle,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type Question = {
  question: string;
  options: string[];
  correctAnswer: number;
};

type ReviewAttempt = {
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
  duration?: number;
  status?: string;
  test?: {
    _id?: string;
    title?: string;
    subjects?: string[];
    questions?: Question[];
  };
};

type QuestionState = "correct" | "wrong" | "skipped";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const formatDateTime = (value?: string) => {
  if (!value) return "Not recorded";

  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDuration = (attempt: ReviewAttempt) => {
  if (attempt.startedAt && attempt.completedAt) {
    const minutes = Math.round(
      (new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000,
    );

    if (Number.isFinite(minutes) && minutes >= 0) return `${minutes} min`;
  }

  return attempt.duration ? `${attempt.duration} min` : "--";
};

const getQuestionState = (question: Question, selected?: number | null): QuestionState => {
  if (selected === undefined || selected === null) return "skipped";
  return selected === question.correctAnswer ? "correct" : "wrong";
};

export default function AttemptReviewPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const attemptId = params.id;

  const [attempt, setAttempt] = useState<ReviewAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await fetch(BACKEND_URL + `/api/attempt/${attemptId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) return;
        setAttempt(data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (attemptId) fetchAttempt();
  }, [attemptId]);

  const questions = useMemo(() => attempt?.test?.questions || [], [attempt]);
  const answers = useMemo(() => attempt?.answers || [], [attempt]);
  const currentQuestion = questions[active];
  const selected = answers[active];
  const currentState = currentQuestion ? getQuestionState(currentQuestion, selected) : "skipped";
  const correctCount = attempt?.correct ?? questions.filter((q, index) => getQuestionState(q, answers[index]) === "correct").length;
  const wrongCount = attempt?.wrong ?? questions.filter((q, index) => getQuestionState(q, answers[index]) === "wrong").length;
  const skippedCount =
    attempt?.skipped ?? questions.filter((q, index) => getQuestionState(q, answers[index]) === "skipped").length;
  const accuracy = Math.round(attempt?.accuracy || 0);
  const subjectLabel = attempt?.test?.subjects?.join(", ") || "General";

  if (loading) {
    return <Loader2 />;
  }

  if (!attempt || !currentQuestion) {
    return (
      <div className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center">
        <div className="card p-8 text-center">
          <p className="text-2xl font-extrabold">Review unavailable</p>
          <p className="mt-2 text-sm opacity-65">This attempt could not be loaded or has no questions.</p>
          <button onClick={() => router.push("/main/history")} className="mt-6 gap-2">
            <ArrowLeft size={18} />
            Back to history
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <section className="flex flex-col gap-4 border-b border-(--border) pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <button onClick={() => router.push("/main/history")} className="button-secondary mb-4 gap-2">
            <ArrowLeft size={18} />
            History
          </button>
          <p className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
            <FileQuestion size={15} />
            Answer review
          </p>
          <h1 className="truncate text-3xl font-extrabold leading-tight">{attempt.test?.title || "Mock Test"}</h1>
          <p className="mt-2 text-sm opacity-65">
            Attempted on {formatDateTime(attempt.completedAt || attempt.createdAt)} · {subjectLabel}
          </p>
        </div>

        {attempt.test?._id && (
          <button onClick={() => router.push(`/main/test/preview/${attempt.test?._id}`)} className="gap-2">
            <RotateCcw size={18} />
            Retake test
          </button>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="card2 p-5">
          <Target size={22} className="mb-3 text-primary" />
          <p className="text-sm font-bold opacity-60">Score</p>
          <p className="mt-1 text-3xl font-extrabold">
            {attempt.score ?? correctCount}
            <span className="text-base opacity-55">/{questions.length}</span>
          </p>
        </div>

        <div className="card p-5">
          <CheckCircle2 size={22} className="mb-3 text-primary" />
          <p className="text-sm font-bold opacity-60">Accuracy</p>
          <p className="mt-1 text-3xl font-extrabold">{accuracy}%</p>
        </div>

        <div className="card p-5">
          <Clock3 size={22} className="mb-3 text-primary" />
          <p className="text-sm font-bold opacity-60">Time taken</p>
          <p className="mt-1 text-3xl font-extrabold">{getDuration(attempt)}</p>
        </div>

        <div className="card p-5">
          <Circle size={22} className="mb-3 text-primary" />
          <p className="text-sm font-bold opacity-60">Questions</p>
          <p className="mt-1 text-3xl font-extrabold">{questions.length}</p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-5">
          <article className="border border-(--border) bg-(--surface) p-5 shadow-[4px_4px_0px_var(--shadow)] md:p-7">
            <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-extrabold uppercase">
                  Question {active + 1}
                </span>
                <span
                  className={`inline-flex items-center gap-2 border px-3 py-1 text-xs font-extrabold uppercase ${
                    currentState === "correct"
                      ? "border-primary bg-primary text-white"
                      : currentState === "wrong"
                        ? "border-[#ef4444] bg-[#ef4444] text-white"
                        : "border-(--border) bg-(--bg-secondary)"
                  }`}
                >
                  {currentState === "correct" && <CheckCircle2 size={14} />}
                  {currentState === "wrong" && <XCircle size={14} />}
                  {currentState === "skipped" && <Circle size={13} />}
                  {currentState}
                </span>
              </div>
              <p className="text-sm font-bold opacity-65">
                {active + 1} of {questions.length}
              </p>
            </div>

            <h2 className="text-xl font-extrabold leading-relaxed md:text-2xl">{currentQuestion.question}</h2>
          </article>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrect = currentQuestion.correctAnswer === index;
              const isWrongSelection = isSelected && !isCorrect;

              return (
                <div
                  key={`${option}-${index}`}
                  className={`flex min-h-16 items-start justify-between gap-4 border p-4 md:p-5 ${
                    isCorrect
                      ? "border-primary bg-primary text-white"
                      : isWrongSelection
                        ? "border-[#ef4444] bg-[#ef4444] text-white"
                        : "border-(--border) bg-(--surface)"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span
                      className={`grid h-9 w-9 shrink-0 place-items-center border text-sm font-extrabold ${
                        isCorrect || isWrongSelection ? "border-white bg-white text-black" : "border-(--border) bg-(--bg-secondary)"
                      }`}
                    >
                      {optionLabels[index] || index + 1}
                    </span>
                    <p className="pt-1 font-semibold leading-relaxed">{option}</p>
                  </div>

                  <div className="shrink-0 pt-1 text-sm font-extrabold uppercase">
                    {isCorrect && "Correct"}
                    {isWrongSelection && "Your answer"}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 border-t border-(--border) pt-5 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="button-secondary gap-2"
              disabled={active === 0}
              onClick={() => setActive((prev) => Math.max(0, prev - 1))}
            >
              <ArrowLeft size={18} />
              Previous
            </button>

            <p className="text-sm font-bold opacity-65">
              Question {active + 1} / {questions.length}
            </p>

            <button
              className="gap-2"
              disabled={active === questions.length - 1}
              onClick={() => setActive((prev) => Math.min(questions.length - 1, prev + 1))}
            >
              Next
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <p className="text-sm font-bold opacity-60">Outcome</p>
            <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div className="border border-(--border) bg-(--surface) p-3">
                <p className="font-extrabold text-primary">{correctCount}</p>
                <p className="text-xs opacity-60">Correct</p>
              </div>
              <div className="border border-(--border) bg-(--surface) p-3">
                <p className="font-extrabold text-[#ef4444]">{wrongCount}</p>
                <p className="text-xs opacity-60">Wrong</p>
              </div>
              <div className="border border-(--border) bg-(--surface) p-3">
                <p className="font-extrabold">{skippedCount}</p>
                <p className="text-xs opacity-60">Skipped</p>
              </div>
            </div>
          </div>

          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold opacity-60">Question map</p>
                <h2 className="text-2xl font-extrabold">Review</h2>
              </div>
              <FileQuestion className="text-primary" size={23} />
            </div>

            <div className="grid grid-cols-5 gap-2 xl:grid-cols-4">
            {questions.map((question, index) => {
              const state = getQuestionState(question, answers[index]);
              const isActive = active === index;

              return (
                <div
                  key={index}
                  onClick={() => setActive(index)}
                  className={`h-11 flex items-center justify-center cursor-pointer rounded-lg px-0 text-sm shadow-none hover:transform-none hover:shadow-none ${
                    isActive
                      ? "bg-primary text-white"
                      : state === "correct"
                        ? "button-secondary bg-(--surface) text-(--text)"
                        : state === "wrong"
                          ? "border border-[#ef4444]"
                          : "button-secondary bg-(--surface) text-(--text)"
                  }`}
                  aria-label={`Review question ${index + 1}`}
                >
                  <span className="flex items-center justify-center gap-1.5">
                    {/* CORRECT */}
                    {state === "correct" && (
                      isActive
                        ? <CheckCircle2 size={14} className="text-white" />
                        : <CheckCircle2 size={14} className="text-primary" />
                    )}

                    {/* WRONG */}
                    {state === "wrong" && (
                      isActive
                        ? <XCircle size={14} className="text-white" />
                        : <XCircle size={14} className="text-[#ef4444]" />
                    )}

                    {index + 1}
                  </span>
                </div>
              );
            })}
          </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
