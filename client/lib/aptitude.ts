export type AptitudeDifficulty = "Easy" | "Medium" | "Hard";

export type AptitudeSection = {
  key: string;
  label: string;
  blurb: string;
  topics: string[];
};

export type AptitudeCompany = {
  key: string;
  label: string;
  hint: string;
};

export type AptitudePreset = {
  key: string;
  label: string;
  description: string;
  sections: string[];
  topics: string[];
  questions: number;
  duration: number;
  difficulty: AptitudeDifficulty;
  company: string;
};

export type AptitudeCatalog = {
  sections: AptitudeSection[];
  companies: AptitudeCompany[];
  presets: AptitudePreset[];
  limits: {
    minQuestions: number;
    maxQuestions: number;
    minDuration: number;
    maxDuration: number;
  };
};

export type AptitudeTest = {
  _id: string;
  title: string;
  description?: string;
  difficulty?: AptitudeDifficulty;
  totalQuestions: number;
  duration: number;
  createdAt: string;
  subjects?: string[];
  aptitude?: {
    sections?: string[];
    topics?: string[];
    company?: string;
    companyLabel?: string;
  };
};

export type AptitudeBreakdown = {
  name: string;
  section?: string;
  attempted: number;
  correct: number;
  accuracy: number;
};

export type AptitudeStats = {
  setsGenerated: number;
  attempts: number;
  questionsSolved: number;
  accuracy: number;
  bestAccuracy: number;
  sections: AptitudeBreakdown[];
  topics: AptitudeBreakdown[];
  weakTopics: AptitudeBreakdown[];
  recent: {
    attemptId: string;
    testId: string;
    accuracy: number;
    obtainedMarks: number;
    totalMarks: number;
    createdAt: string;
  }[];
};

export type AptitudeQuestion = {
  question: string;
  options?: string[];
  correctAnswer?: number;
  explanation?: string;
  approach?: string;
  subject?: string;
  topic?: string;
  difficulty?: AptitudeDifficulty;
};

export type AptitudePracticeSet = AptitudeTest & {
  questions: AptitudeQuestion[];
};

export const DEFAULT_APTITUDE_CATALOG: AptitudeCatalog = {
  sections: [],
  companies: [],
  presets: [],
  limits: {
    minQuestions: 5,
    maxQuestions: 30,
    minDuration: 5,
    maxDuration: 120,
  },
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

const request = async <T,>(path: string): Promise<T> => {
  const res = await fetch(BACKEND_URL + path, { credentials: "include" });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data as T;
};

export const fetchAptitudeCatalog = async () => {
  const data = await request<{ catalog: AptitudeCatalog }>("/api/aptitude/catalog");
  return data.catalog;
};

export const fetchAptitudeTests = async () => {
  const data = await request<{ tests: AptitudeTest[] }>("/api/aptitude/tests");
  return data.tests || [];
};

export const fetchAptitudeStats = async () => {
  const data = await request<{ stats: AptitudeStats }>("/api/aptitude/stats");
  return data.stats;
};

export const fetchAptitudePracticeSet = async (id: string) => {
  const data = await request<{ test: AptitudePracticeSet }>(`/api/aptitude/practice/${id}`);
  return data.test;
};

export const formatAptitudeDate = (value?: string) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export const accuracyTone = (accuracy: number) => {
  if (accuracy >= 75) return "text-primary";
  if (accuracy >= 50) return "text-yellow-500";
  return "text-red-500";
};
