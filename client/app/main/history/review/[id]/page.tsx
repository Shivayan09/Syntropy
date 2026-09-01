"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3, FileQuestion, Lightbulb, RotateCcw, Target, XCircle } from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type Question = {
  question: string;
  options?: string[];
  correctAnswer?: number;
  marks?: number;
  explanation?: string;
  approach?: string;
  topic?: string;
};

type AnswerEntry = {
  answer?: string | number | null;
  marksAwarded?: number;
  feedback?: string;
};

type RawAnswer = AnswerEntry | number | null | undefined;

type ReviewAttempt = {
  _id: string;
  answers?: AnswerEntry[];
  score?: number;
  correct?: number;
  wrong?: number;
  skipped?: number;
  accuracy?: number;
  obtainedMarks?: number;
  totalMarks?: number;
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
    testFormat?: "mcq" | "subjective";
    totalMarks?: number;
  };
};

type QuestionState = "correct" | "wrong" | "skipped" | "answered";

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

const normalizeAnswerEntry = (entry?: RawAnswer): AnswerEntry => {
  if (typeof entry === "number" || entry === null || entry === undefined) {
    return {
      answer: entry ?? null,
      marksAwarded: 0,
      feedback: "",
    };
  }

  return {
    answer: entry.answer ?? null,
    marksAwarded: entry.marksAwarded ?? 0,
    feedback: entry.feedback ?? "",
  };
};

const getQuestionState = (
  question: Question,
  answerEntry?: AnswerEntry,
  isMCQ?: boolean,
): QuestionState => {
  if (!isMCQ) {
    const answer = typeof answerEntry?.answer === "string" ? answerEntry.answer.trim() : answerEntry?.answer;
    return answer === undefined || answer === null || answer === "" ? "skipped" : "answered";
  }

  const selected =
    typeof answerEntry?.answer === "number" ? answerEntry.answer : null;

  if (selected === null) return "skipped";
  return selected === question.correctAnswer ? "correct" : "wrong";
};

const getStateBadgeClasses = (state: QuestionState) => {
  if (state === "correct" || state === "answered") {
    return "border-primary bg-primary text-white";
  }

  if (state === "wrong") {
    return "border-[#ef4444] bg-[#ef4444] text-white";
  }

  return "border-(--border) bg-(--bg-secondary)";
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
  const answers = useMemo(
    () => (attempt?.answers || []).map((entry) => normalizeAnswerEntry(entry as RawAnswer)),
    [attempt],
  );
  const isMCQ =
    attempt?.test?.testFormat === "mcq" ||
    questions.some((question) => Array.isArray(question.options) && question.options.length > 0);
  const currentQuestion = questions[active];
  const currentAnswer = answers[active];
  const currentState = currentQuestion ? getQuestionState(currentQuestion, currentAnswer, isMCQ) : "skipped";
  const answeredCount = questions.filter((q, index) => getQuestionState(q, answers[index], isMCQ) !== "skipped").length;
  const correctCount = isMCQ
    ? attempt?.correct ?? questions.filter((q, index) => getQuestionState(q, answers[index], true) === "correct").length
    : answeredCount;
  const wrongCount = isMCQ
    ? attempt?.wrong ?? questions.filter((q, index) => getQuestionState(q, answers[index], true) === "wrong").length
    : Math.max(0, questions.length - answeredCount);
  const skippedCount =
    attempt?.skipped ?? questions.filter((q, index) => getQuestionState(q, answers[index], isMCQ) === "skipped").length;
  const totalMarks = attempt?.totalMarks ?? attempt?.test?.totalMarks ?? questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  const obtainedMarks = attempt?.obtainedMarks ?? answers.reduce((sum, entry) => sum + (entry?.marksAwarded || 0), 0);
  const accuracy = Math.round(
    typeof attempt?.accuracy === "number"
      ? attempt.accuracy
      : isMCQ
        ? 0
        : totalMarks > 0
          ? (obtainedMarks / totalMarks) * 100
          : 0,
  );
  const subjectLabel = attempt?.test?.subjects?.join(", ") || "General";
  const selectedOption = typeof currentAnswer?.answer === "number" ? currentAnswer.answer : null;

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
        <div className="min-w-0 w-full">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
              <FileQuestion size={15} />
              Answer review
            </p>
            <p className="text-sm opacity-65">
              Attempted on {formatDateTime(attempt.completedAt || attempt.createdAt)} · {subjectLabel}
            </p>
          </div>
          <div className="flex items-center justify-between mt-3">
            <h1 className="truncate text-3xl font-extrabold leading-tight">{attempt.test?.title || "Mock Test"}</h1>
            {attempt.test?._id && (
              <button onClick={() => router.push(`/main/test/preview/${attempt.test?._id}`)} className="gap-2">
                <RotateCcw size={18} />
                Retake test
              </button>
            )}
          </div>
        </div>

      </section>

      <section className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="card2 p-5">
          <Target size={22} className="mb-3 text-primary" />
          <p className="text-sm font-bold opacity-60">Score</p>
          <p className="mt-1 text-3xl font-extrabold">
            {isMCQ ? attempt.score ?? correctCount : obtainedMarks}
            <span className="text-base opacity-55">/{isMCQ ? questions.length : totalMarks}</span>
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
                <span className={`inline-flex items-center gap-2 border px-3 py-1 text-xs font-extrabold uppercase ${getStateBadgeClasses(currentState)}`}>
                  {currentState === "correct" && <CheckCircle2 size={14} />}
                  {currentState === "wrong" && <XCircle size={14} />}
                  {currentState === "skipped" && <Circle size={13} />}
                  {currentState === "answered" && <CheckCircle2 size={14} />}
                  {currentState}
                </span>
              </div>
              <p className="text-sm font-bold opacity-65">
                {active + 1} of {questions.length}
              </p>
            </div>

            <h2 className="text-xl font-extrabold leading-relaxed md:text-2xl">{currentQuestion.question}</h2>
          </article>

          {isMCQ ? (
            <div className="space-y-3">
              {currentQuestion.options?.map((option, index) => {
                const isSelected = selectedOption === index;
                const isCorrect = currentQuestion.correctAnswer === index;
                const isWrongSelection = isSelected && !isCorrect;

                return (
                  <div
                    key={`${option}-${index}`}
                    className={`flex rounded-xl min-h-16 items-start justify-between gap-4 border p-4 md:p-5 ${isCorrect
                      ? "border-primary bg-primary text-white"
                      : isWrongSelection
                        ? "border-[#ef4444] bg-[#ef4444] text-white"
                        : "border-(--border) bg-(--surface)"
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center border text-sm font-extrabold ${isCorrect || isWrongSelection ? "border-white bg-white text-black" : "border-(--border) bg-(--bg-secondary)"
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

              {(currentQuestion.approach || currentQuestion.explanation) && (
                <div className="space-y-4 pt-2">
                  {currentQuestion.approach && (
                    <div className="rounded-xl border border-(--border) bg-(--bg-secondary) p-5">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-primary">
                        <Lightbulb size={15} />
                        Fastest approach
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                        {currentQuestion.approach}
                      </p>
                    </div>
                  )}

                  {currentQuestion.explanation && (
                    <div className="rounded-xl border border-(--border) bg-(--surface) p-5">
                      <div className="flex items-center gap-2 text-xs font-extrabold uppercase opacity-60">
                        <Target size={15} />
                        Solution
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border border-(--border) bg-(--surface) p-5">
                <p className="text-sm font-bold opacity-60">Your answer</p>
                <p className="mt-3 whitespace-pre-wrap font-semibold leading-relaxed">
                  {typeof currentAnswer?.answer === "string" && currentAnswer.answer.trim()
                    ? currentAnswer.answer
                    : "No answer submitted."}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-[12rem_1fr]">
                <div className="border border-(--border) bg-(--surface) p-5">
                  <p className="text-sm font-bold opacity-60">Marks awarded</p>
                  <p className="mt-3 text-3xl font-extrabold">
                    {currentAnswer?.marksAwarded || 0}
                    <span className="text-base opacity-55">/{currentQuestion.marks || 0}</span>
                  </p>
                </div>

                <div className="border border-(--border) bg-(--surface) p-5">
                  <p className="text-sm font-bold opacity-60">Feedback</p>
                  <p className="mt-3 whitespace-pre-wrap font-semibold leading-relaxed">
                    {currentAnswer?.feedback?.trim() || "No feedback available."}
                  </p>
                </div>
              </div>
            </div>
          )}

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
              {isMCQ ? (
                <>
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
                </>
              ) : (
                <>
                  <div className="border border-(--border) bg-(--surface) p-3">
                    <p className="font-extrabold text-primary">{answeredCount}</p>
                    <p className="text-xs opacity-60">Answered</p>
                  </div>
                  <div className="border border-(--border) bg-(--surface) p-3">
                    <p className="font-extrabold">{obtainedMarks}</p>
                    <p className="text-xs opacity-60">Marks</p>
                  </div>
                  <div className="border border-(--border) bg-(--surface) p-3">
                    <p className="font-extrabold">{skippedCount}</p>
                    <p className="text-xs opacity-60">Skipped</p>
                  </div>
                </>
              )}
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
                const state = getQuestionState(question, answers[index], isMCQ);
                const isActive = active === index;

                return (
                  <div
                    key={index}
                    onClick={() => setActive(index)}
                    className={`h-11 cursor-pointer items-center justify-center rounded-lg px-0 text-sm shadow-none hover:transform-none hover:shadow-none ${isActive
                      ? "flex bg-primary text-white"
                      : state === "correct" || state === "answered"
                        ? "button-secondary flex bg-(--surface) text-(--text)"
                        : state === "wrong"
                          ? "flex border border-[#ef4444]"
                          : "button-secondary flex bg-(--surface) text-(--text)"
                      }`}
                    aria-label={`Review question ${index + 1}`}
                  >
                    <span className="flex items-center justify-center gap-1.5">
                      {state === "correct" && (
                        isActive
                          ? <CheckCircle2 size={14} className="text-white" />
                          : <CheckCircle2 size={14} className="text-primary" />
                      )}

                      {state === "answered" && (
                        isActive
                          ? <CheckCircle2 size={14} className="text-white" />
                          : <CheckCircle2 size={14} className="text-primary" />
                      )}

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
