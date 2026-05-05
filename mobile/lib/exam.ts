import type { AnswerEntry, Attempt, Question } from "@/types/api";

export const optionLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not recorded";

export const formatDateTime = (value?: string) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Not recorded";

export const formatDurationMinutes = (startedAt?: string, completedAt?: string, fallbackMinutes?: number) => {
  if (startedAt && completedAt) {
    const duration = Math.round((new Date(completedAt).getTime() - new Date(startedAt).getTime()) / 60000);
    if (Number.isFinite(duration) && duration >= 0) {
      return `${duration} min`;
    }
  }

  return fallbackMinutes ? `${fallbackMinutes} min` : "--";
};

export const formatClock = (seconds: number) => {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

export const normalizeSubject = (value?: string, fallback = "Mixed practice") => value?.trim() || fallback;

export const normalizeAnswerEntry = (entry?: AnswerEntry | number | string | null): AnswerEntry => {
  if (typeof entry === "number" || typeof entry === "string" || entry === null || entry === undefined) {
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

export const questionState = (question: Question, answerEntry?: AnswerEntry, isMcq?: boolean) => {
  if (!isMcq) {
    const answer = typeof answerEntry?.answer === "string" ? answerEntry.answer.trim() : answerEntry?.answer;
    return answer === undefined || answer === null || answer === "" ? "skipped" : "answered";
  }

  const selected = typeof answerEntry?.answer === "number" ? answerEntry.answer : null;
  if (selected === null) return "skipped";
  return selected === question.correctAnswer ? "correct" : "wrong";
};

export const getQuestionTotal = (attempt: Attempt) =>
  attempt.test?.totalQuestions || attempt.test?.questions?.length || 0;

export const getAccuracy = (attempt: Attempt) => {
  if (typeof attempt.accuracy === "number") return clampPercent(attempt.accuracy);
  const total = getQuestionTotal(attempt);
  return total > 0 ? clampPercent(((attempt.correct || 0) / total) * 100) : 0;
};
