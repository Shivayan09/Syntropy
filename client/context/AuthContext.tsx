"use client";

import Loader from "@/components/utils/Loader";
import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { flushSync } from "react-dom";

type User = {
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
    difficulty?: "Easy" | "Medium" | "Hard";
    questionsPerTest?: number;
    targetRole?: string;
  };
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  getMe: () => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getMe = useCallback(async (): Promise<User | null> => {
    let nextUser: User | null = null;
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/auth/getMe", { credentials: "include" });
      if (res.ok) {
        nextUser = await res.json();
      }
    } catch {
      nextUser = null;
    }
    // Forces the user/loading update to commit before the caller's next line (usually a
    // router.push/replace) runs, so a freshly-mounted route guard never reads a stale value.
    flushSync(() => {
      setUser(nextUser);
      setLoading(false);
    });
    return nextUser;
  }, []);

  useEffect(() => {
    void Promise.resolve().then(getMe);
  }, [getMe]);

  const value = useMemo(() => ({ user, loading, getMe }), [user, loading, getMe]);

  if (loading) {
    return <Loader />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};
