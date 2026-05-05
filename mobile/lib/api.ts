import type {
  AiTokenStatus,
  Attempt,
  Difficulty,
  LeaderboardUser,
  PublicProfile,
  SyllabusRecord,
  TestFormat,
  TestSummary,
  User,
} from "@/types/api";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

type UploadFile = File | { uri: string; name: string; mimeType?: string; type?: string };

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  token?: string | null;
  body?: unknown;
  mobileAuth?: boolean;
  isFormData?: boolean;
};

type AuthResponse = {
  success: boolean;
  message?: string;
  token?: string;
  user?: User;
};

type ManualQuestionInput =
  | {
      question: string;
      options: string[];
      correctAnswer: number;
    }
  | {
      question: string;
      marks: number;
      expectedAnswer: string;
      keyPoints: string[];
    };

type CreateManualTestPayload = {
  title: string;
  description: string;
  difficulty: Difficulty;
  duration: number;
  subjects: string[];
  testFormat: TestFormat;
  questions: ManualQuestionInput[];
};

type GenerateAiTestPayload = {
  subjects: string[];
  difficulty: Difficulty;
  time: number;
  topicFocus?: string;
  college?: string;
  semester?: number;
  testFormat: TestFormat;
  questions?: number;
  totalMarks?: number;
  mixedSubjects?: boolean;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};

  if (!options.isFormData) {
    headers["Content-Type"] = "application/json";
  }

  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  if (options.mobileAuth) {
    headers["x-client-platform"] = "mobile";
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.isFormData
      ? (options.body as BodyInit | undefined)
      : options.body
        ? JSON.stringify(options.body)
        : undefined,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data as T;
}

export const api = {
  login(email: string, password: string) {
    return request<AuthResponse>("/api/auth/login", {
      method: "POST",
      mobileAuth: true,
      body: { email, password, responseMode: "mobile" },
    });
  },
  register(payload: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
    acceptedTerms: boolean;
  }) {
    return request<AuthResponse>("/api/auth/register", {
      method: "POST",
      mobileAuth: true,
      body: { ...payload, responseMode: "mobile" },
    });
  },
  sendOtp(payload: { name: string; email: string; phoneNumber: string }) {
    return request<{ success: boolean; message: string }>("/api/auth/register/send-otp", {
      method: "POST",
      body: payload,
    });
  },
  verifyOtp(payload: { email: string; otp: string }) {
    return request<{ success: boolean; message: string }>("/api/auth/register/verify-otp", {
      method: "POST",
      body: payload,
    });
  },
  forgotPassword(email: string) {
    return request<{ success: boolean; message: string }>("/api/auth/forgot-password", {
      method: "POST",
      body: { email },
    });
  },
  resetPassword(tokenValue: string, password: string) {
    return request<{ success: boolean; message: string }>("/api/auth/reset-password", {
      method: "POST",
      body: { token: tokenValue, password },
    });
  },
  getMe(token: string) {
    return request<User>("/api/auth/getMe", { token });
  },
  logout(token?: string | null) {
    return request<{ success: boolean; message: string }>("/api/auth/logout", {
      method: "POST",
      token,
    });
  },
  updateProfile(
    token: string,
    payload: Partial<{
      name: string;
      username: string;
      email: string;
      phoneNumber: string;
      college: string;
      semester: number;
      onboardingCompleted: boolean;
      preferences: {
        subjects?: string[];
        difficulty?: Difficulty;
        questionsPerTest?: number;
        targetRole?: string;
      };
    }>,
  ) {
    return request<{ success: boolean; message: string; user: User }>("/api/user/update-profile", {
      method: "PUT",
      token,
      body: payload,
    });
  },
  updateAvatar(token: string, file: UploadFile) {
    const formData = new FormData();
    formData.append("avatar", file as never);
    return request<{ success: boolean; avatar: string }>("/api/user/update-avatar", {
      method: "PUT",
      token,
      body: formData,
      isFormData: true,
    });
  },
  contactSupport(token: string, payload: { name: string; email: string; message: string }) {
    return request<{ success: boolean; message: string }>("/api/user/contact-support", {
      method: "POST",
      token,
      body: payload,
    });
  },
  getAttempts(token: string) {
    return request<{ success: boolean; attempts: Attempt[] }>("/api/attempt/my", { token });
  },
  getAttempt(token: string, attemptId: string) {
    return request<{ success: boolean; attempt: Attempt }>(`/api/attempt/${attemptId}`, { token });
  },
  startAttempt(token: string, testId: string) {
    return request<{ attemptId: string }>("/api/attempt/start", {
      method: "POST",
      token,
      body: { testId },
    });
  },
  submitAttempt(token: string, attemptId: string, answers: Array<number | string | null | undefined>) {
    return request<{ success: boolean; attemptId: string }>("/api/attempt/submit", {
      method: "POST",
      token,
      body: { attemptId, answers },
    });
  },
  heartbeatAttempt(token: string, attemptId: string) {
    return request<{ success: boolean }>("/api/attempt/heartbeat", {
      method: "POST",
      token,
      body: { attemptId },
    });
  },
  getTests(token: string) {
    return request<{ success: boolean; tests: TestSummary[] }>("/api/test/all", { token });
  },
  getTest(token: string, testId: string) {
    return request<{ success: boolean; test: TestSummary }>(`/api/test/${testId}`, { token });
  },
  createManualTest(token: string, payload: CreateManualTestPayload) {
    return request<{ success: boolean; test: TestSummary }>("/api/test/create", {
      method: "POST",
      token,
      body: { ...payload, type: "manual" },
    });
  },
  generateAiTest(token: string, payload: GenerateAiTestPayload) {
    return request<{ success: boolean; testId: string; data: TestSummary; aiTokenStatus?: AiTokenStatus }>("/api/test/generate", {
      method: "POST",
      token,
      body: payload,
    });
  },
  getAiTokenStatus(token: string) {
    return request<{ success: boolean; aiTokenStatus: AiTokenStatus }>("/api/user/ai-token-status", { token });
  },
  getLeaderboard(token: string) {
    return request<{ success: boolean; users: LeaderboardUser[] }>("/api/leaderboard", { token });
  },
  getPublicProfile(token: string, userId: string) {
    return request<{ success: boolean; profile: PublicProfile }>(`/api/user/public/${userId}`, { token });
  },
  getSyllabus(token: string) {
    return request<{ success: boolean; syllabus: SyllabusRecord[] }>("/api/syllabus/my", { token });
  },
  uploadSyllabus(token: string, file: UploadFile) {
    const formData = new FormData();
    formData.append("file", file as never);
    return request<{ success: boolean; syllabus: SyllabusRecord; overwritten?: boolean }>("/api/syllabus/upload", {
      method: "POST",
      token,
      body: formData,
      isFormData: true,
    });
  },
  updateSyllabus(token: string, payload: { _id: string; subjects: SyllabusRecord["subjects"] }) {
    return request<{ success: boolean; syllabus: SyllabusRecord }>("/api/syllabus/update", {
      method: "PUT",
      token,
      body: payload,
    });
  },
};
