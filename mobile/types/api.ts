export type Difficulty = "Easy" | "Medium" | "Hard";
export type TestFormat = "mcq" | "subjective";

export type User = {
  _id: string;
  username?: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  provider?: "local" | "google";
  phoneNumber?: string;
  avatar?: string;
  college?: string;
  semester?: number;
  onboardingCompleted?: boolean;
  plan?: "free" | "starter" | "pro" | "power";
  planBillingCycle?: "monthly" | "annual" | null;
  planExpiry?: string;
  preferences?: {
    subjects?: string[];
    difficulty?: Difficulty;
    questionsPerTest?: number;
    targetRole?: string;
  };
};

export type Question = {
  _id?: string;
  question?: string;
  options?: string[];
  correctAnswer?: number;
  expectedAnswer?: string;
  keyPoints?: string[];
  explanation?: string;
  subject?: string | null;
  difficulty?: Difficulty;
  topic?: string;
  marks?: number;
};

export type TestSummary = {
  _id: string;
  title?: string;
  description?: string;
  difficulty?: Difficulty;
  subjects?: string[];
  duration?: number;
  totalQuestions?: number;
  totalMarks?: number;
  createdAt?: string;
  type?: "manual" | "generated";
  testFormat?: TestFormat;
  questions?: Question[];
};

export type AnswerEntry = {
  answer?: string | number | null;
  marksAwarded?: number;
  feedback?: string;
};

export type Attempt = {
  _id: string;
  answers?: Array<AnswerEntry | number | string | null | undefined>;
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
  status?: "in_progress" | "completed" | "expired" | "abandoned";
  isFirstAttempt?: boolean;
  test?: TestSummary;
};

export type AiTokenStatus = {
  remaining: number;
  hasTokens?: boolean;
  includedRemaining?: number;
  bonusRemaining?: number;
  nextResetDate?: string | null;
  plan?: string;
};

export type SyllabusTopic = {
  name: string;
};

export type SyllabusUnit = {
  title: string;
  topics: SyllabusTopic[];
};

export type SyllabusSubject = {
  name: string;
  units: SyllabusUnit[];
};

export type SyllabusRecord = {
  _id: string;
  title: string;
  subjects: SyllabusSubject[];
  parsed?: boolean;
};

export type LeaderboardUser = {
  _id: string;
  name?: string;
  username?: string;
  avgAccuracy?: number;
  avgScore?: number;
  testsTaken?: number;
  avatar?: string;
};

export type PublicProfile = {
  _id: string;
  name: string;
  username: string;
  avatar: string;
  college: string;
  semester: number | null;
  joinedOn?: string;
  targetRole?: string;
  testsAttempted?: number;
  testsCreated?: number;
  averageAccuracy?: number;
  averageScore?: number;
  bestScore?: number;
  totalQuestionsSolved?: number;
  totalCorrect?: number;
  totalWrong?: number;
  totalSkipped?: number;
  currentStreak?: number;
  longestStreak?: number;
  lastActive?: string | null;
};
