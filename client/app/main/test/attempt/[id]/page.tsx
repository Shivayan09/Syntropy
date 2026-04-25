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
  X,
} from "lucide-react";
import Loader2 from "@/components/utils/Loader2";

type Question = {
  question: string;
  options?: string[];
  marks?: number;
};

type Test = {
  _id: string;
  title?: string;
  questions: Question[];
  testFormat: "mcq" | "subjective"; // ✅ add this
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
  const [answers, setAnswers] = useState<Array<number | string | undefined>>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  const questions = useMemo(() => test?.questions || [], [test]);
  const currentQuestion = questions[current];
  const answeredCount = answers.filter((answer) => answer !== undefined && answer !== "").length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const reviewCount = markedForReview.filter(Boolean).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const isLastQuestion = current === questions.length - 1;
  const timeWarning = timeLeft > 0 && timeLeft <= 300;
  const isMCQ = test?.testFormat === "mcq";

  const submitTest = useCallback(async () => {
    if (submitting || !attemptId) {
      return;
    }
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
      if (!res.ok) {
        return;
      }
      setConfirmOpen(false);
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
        console.log("API RESPONSE:", data);
        if (!data || !data.attempt) {
          console.error("Invalid attempt response", data);
          return;
        }
        const fetchedAttempt = data.attempt as Attempt;
        if (fetchedAttempt.status !== "in_progress") {
          router.replace(`/main/test/result/${fetchedAttempt._id}`);
          return;
        }
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
    if (!attempt) {
      return;
    }
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

  useEffect(() => {
    if (!paletteOpen) {
      return;
    }
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [paletteOpen]);

  const selectOption = (index: number) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = index;
      return updated;
    });
  };

  const setSubjectiveAnswer = (value: string) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[current] = value;
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
    setPaletteOpen(false);
  };

  const openSubmitModal = () => {
    if (submitting) return;
    setConfirmOpen(true);
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
    <div className="min-h-screen bg-(--bg-secondary) text-(--text) xl:grid xl:h-screen xl:overflow-hidden xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="flex min-h-0 flex-col">
        <div className="sticky top-0 z-20 border-b border-(--border) bg-(--surface) px-4 py-3 shadow-[0_3px_0px_var(--shadow)] xl:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase text-primary">Mock test attempt</p>
              <h1 className="truncate text-base font-extrabold">{test.title || "Mock Test"}</h1>
              <p className="mt-1 text-xs font-bold opacity-65">
                Question {current + 1} of {questions.length}
              </p>
            </div>

            <div className={`shrink-0 border px-3 py-2 text-right ${timeWarning ? "border-primary bg-primary text-white" : "border-(--border) bg-(--bg-secondary)"}`}>
              <p className="text-[10px] font-bold uppercase opacity-70">Time left</p>
              <p className="mt-1 flex items-center justify-end gap-1 text-lg font-extrabold">
                <Clock3 size={16} />
                {formatTime(timeLeft)}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between text-[11px] font-bold uppercase opacity-65">
                <span>Progress</span>
                <span>{answeredCount}/{questions.length}</span>
              </div>
              <div className="h-2 bg-(--bg-secondary)">
                <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <button type="button" className="button-secondary h-10 gap-2 px-4 text-sm" onClick={() => setPaletteOpen(true)}>
              <Flag size={16} />
              Palette
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 pb-36 md:px-8 xl:pb-5">
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
                    {isMCQ ? "Single correct option" : "Written response"}
                  </span>
                  {!isMCQ && (
                    <span className="inline-flex items-center gap-2 border border-(--border) bg-(--bg-secondary) px-3 py-1 text-xs font-extrabold uppercase">
                      {currentQuestion.marks || 0} marks
                    </span>
                  )}
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
              {isMCQ ? (
                currentQuestion.options?.map((option, index) => {
                  const selected = answers[current] === index;

                  return (
                    <div key={`${option}-${index}`} onClick={() => selectOption(index)} className={`h-auto min-h-16 shadow-[4px_4px_0px_var(--shadow)] w-full rounded-none px-0 py-0 text-left hover:transform-none cursor-pointer ${selected ? "bg-primary text-white" : "button-secondary bg-(--surface) text-(--text)"}`} >
                      <span className="flex min-h-16 w-full items-start gap-4 p-4 md:p-5">
                        <span className={`grid h-9 w-9 shrink-0 place-items-center border text-sm font-extrabold ${selected ? "border-white bg-white text-black" : "border-(--border) bg-(--bg-secondary)"}`} >
                          {optionLabels[index] || index + 1}
                        </span>
                        <span className="pt-1 text-base font-semibold leading-relaxed">
                          {option}
                        </span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <textarea value={(answers[current] as string) || ""} onChange={(e) => setSubjectiveAnswer(e.target.value)} placeholder="Write your answer..." className="w-full min-h-40" />
              )}
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 z-20 shrink-0 border-t border-(--border) bg-(--surface) px-4 py-4 shadow-[0_-3px_0px_var(--shadow)] md:px-8 xl:static xl:border-t-0 xl:bg-transparent xl:px-4 xl:py-5 xl:shadow-none">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row">
              <button className="button-secondary gap-2" onClick={toggleReview}>
                {markedForReview[current] ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                {markedForReview[current] ? "Reviewed" : "Mark review"}
              </button>
              <button className="button-secondary gap-2" onClick={clearAnswer} disabled={answers[current] === undefined}>
                <Eraser size={18} />
                Clear response
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-row sm:justify-end">
              <button className="button-secondary gap-2" onClick={() => goToQuestion(current - 1)} disabled={current === 0}>
                <ArrowLeft size={18} />
                Previous
              </button>

              {isLastQuestion ? (
                <button disabled={submitting} className={`gap-2 ${submitting ? "cursor-not-allowed opacity-65" : ""}`} onClick={openSubmitModal}>
                  {submitting ? "Submitting" : "Submit test"}
                  <Send size={18} />
                </button>
              ) : (
                <button className="gap-2" onClick={() => goToQuestion(current + 1)}>
                  Save & next
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      <aside className="hidden min-h-0 overflow-y-auto border-t border-(--border) bg-(--surface) p-4 xl:block xl:border-l xl:border-t-0 xl:p-5">
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
            const answered =
              answers[index] !== undefined &&
              answers[index] !== "";
            const active = current === index;
            const marked = markedForReview[index];

            return (
              <button key={index} type="button" onClick={() => goToQuestion(index)}
                className={`h-11 rounded-none px-0 text-sm shadow-none hover:transform-none hover:shadow-none
                ${active ? "bg-black text-white" : answered ? "bg-primary text-white" : marked ? "button-secondary border-primary bg-(--surface) text-primary" : "button-secondary bg-(--surface) text-(--text)"}`} aria-label={`Go to question ${index + 1}`} >

                <span className="flex items-center justify-center gap-1">
                  {answered ? <CheckCircle2 size={14} /> : marked ? <Bookmark size={13} /> : <Circle size={12} />}
                  {index + 1}
                </span>
              </button>
            );
          })}
        </div>
        <div className="py-5 mt-5 border-t border-(--border)">
          <button disabled={submitting} className={`gap-2 w-full ${submitting ? "cursor-not-allowed opacity-65" : ""}`} onClick={openSubmitModal}>
            {submitting ? "Submitting" : "Submit test"}
            <Send size={18} />
          </button>
        </div>
      </aside>

      <MobilePaletteDrawer
        open={paletteOpen}
        submitting={submitting}
        timeWarning={timeWarning}
        title={test.title || "Mock Test"}
        timeLeft={timeLeft}
        answeredCount={answeredCount}
        unansweredCount={unansweredCount}
        reviewCount={reviewCount}
        progress={progress}
        totalQuestions={questions.length}
        current={current}
        answers={answers}
        markedForReview={markedForReview}
        onClose={() => setPaletteOpen(false)}
        onSelectQuestion={goToQuestion}
        onSubmit={openSubmitModal} />

      <SubmitConfirmModal
        open={confirmOpen}
        loading={submitting}
        answeredCount={answeredCount}
        reviewCount={reviewCount}
        totalQuestions={questions.length}
        unansweredCount={unansweredCount}
        onClose={() => setConfirmOpen(false)}
        onConfirm={submitTest} />
    </div>
  );
}

function MobilePaletteDrawer({
  answers,
  answeredCount,
  current,
  markedForReview,
  onClose,
  onSelectQuestion,
  onSubmit,
  open,
  progress,
  reviewCount,
  submitting,
  timeLeft,
  timeWarning,
  title,
  totalQuestions,
  unansweredCount,
}: {
  answers: Array<number | string | undefined>;
  answeredCount: number;
  current: number;
  markedForReview: boolean[];
  onClose: () => void;
  onSelectQuestion: (index: number) => void;
  onSubmit: () => void;
  open: boolean;
  progress: number;
  reviewCount: number;
  submitting: boolean;
  timeLeft: number;
  timeWarning: boolean;
  title: string;
  totalQuestions: number;
  unansweredCount: number;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 xl:hidden">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-hidden rounded-t-[28px] border border-(--border) bg-(--surface) shadow-[0_-4px_0px_var(--shadow)]">
        <div className="flex items-center justify-between border-b border-(--border) px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase text-primary">Answer sheet</p>
            <h2 className="truncate text-lg font-extrabold">{title}</h2>
          </div>
          <button type="button" className="button-secondary h-10 w-10 px-0" onClick={onClose} aria-label="Close palette">
            <X size={16} />
          </button>
        </div>

        <div className="max-h-[calc(85vh-4.5rem)] overflow-y-auto px-4 py-4">
          <div className={`border px-4 py-3 ${timeWarning ? "border-primary bg-primary text-white" : "border-(--border) bg-(--bg-secondary)"}`}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase opacity-70">Time left</p>
                <p className="mt-1 flex items-center gap-2 text-2xl font-extrabold">
                  <Clock3 size={18} />
                  {formatTime(timeLeft)}
                </p>
              </div>
              <div className="text-right text-xs font-bold uppercase opacity-70">
                <p>Answered</p>
                <p className="mt-1 text-base font-extrabold opacity-100">{answeredCount}/{totalQuestions}</p>
              </div>
            </div>

            <div className="mt-3 h-2 bg-(--surface)/40">
              <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="my-4 grid grid-cols-3 gap-2 text-sm">
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

          <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
            {Array.from({ length: totalQuestions }).map((_, index) => {
              const answered = answers[index] !== undefined && answers[index] !== "";
              const active = current === index;
              const marked = markedForReview[index];

              return (
                <button key={index} type="button" onClick={() => onSelectQuestion(index)}
                  className={`h-11 rounded-none px-0 text-sm shadow-none hover:transform-none hover:shadow-none
                  ${active ? "bg-black text-white" : answered ? "bg-primary text-white" : marked ? "button-secondary border-primary bg-(--surface) text-primary" : "button-secondary bg-(--surface) text-(--text)"}`} aria-label={`Go to question ${index + 1}`} >

                  <span className="flex items-center justify-center gap-1">
                    {answered ? <CheckCircle2 size={14} /> : marked ? <Bookmark size={13} /> : <Circle size={12} />}
                    {index + 1}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-0 mt-4 border-t border-(--border) bg-(--surface) py-4">
            <button disabled={submitting} className={`w-full gap-2 ${submitting ? "cursor-not-allowed opacity-65" : ""}`} onClick={() => { onClose(); onSubmit(); }} >
              {submitting ? "Submitting" : "Submit test"}
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitConfirmModal({
  answeredCount,
  loading,
  onClose,
  onConfirm,
  open,
  reviewCount,
  totalQuestions,
  unansweredCount,
}: {
  answeredCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
  open: boolean;
  reviewCount: number;
  totalQuestions: number;
  unansweredCount: number;
}) {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    if (open) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [loading, onClose, open]);

  if (!open) {
    return null;
  }

  const hasUnanswered = unansweredCount > 0;
  const hasReview = reviewCount > 0;
  const title = hasUnanswered
    ? "Submit with unanswered questions?"
    : hasReview
      ? "Submit with questions marked for review?"
      : "Submit test?";
  const description = hasUnanswered
    ? "Some questions are still unanswered. Once submitted, your responses cannot be changed."
    : hasReview
      ? "You still have questions marked for review. Confirm only if you are done reviewing them."
      : "All questions are answered and none are marked for review. Confirm to complete this attempt.";

  const safeClose = () => {
    if (!loading) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" onClick={safeClose} />
      <div className="relative w-full max-w-md rounded-lg border border-primary bg-surface p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
        <div
          role="button"
          tabIndex={loading ? -1 : 0}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-70"}`}
          onClick={safeClose}
          onKeyDown={(event) => {
            if ((event.key === "Enter" || event.key === " ") && !loading) {
              event.preventDefault();
              onClose();
            }
          }}
          aria-disabled={loading} aria-label="Close submit confirmation" >

          <X size={18} />
        </div>

        <div className="pr-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-primary bg-primary text-white">
            <AlertTriangle size={22} />
          </div>
          <h2 className="text-xl font-extrabold">{title}</h2>
          <p className="mt-2 text-sm opacity-70">{description}</p>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
          <div className="border border-(--border) bg-(--bg-secondary) p-3">
            <p className="font-extrabold text-primary">{answeredCount}</p>
            <p className="text-xs opacity-60">Answered</p>
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

        <div className="mt-4 border border-(--border) bg-(--bg-secondary) p-3 text-sm font-semibold opacity-80">
          {answeredCount}/{totalQuestions} questions attempted
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="button-secondary" onClick={safeClose} disabled={loading}>
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className={`gap-2 ${loading ? "cursor-not-allowed opacity-70" : ""}`}>
            {loading ? "Submitting..." : "Confirm submit"}
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
