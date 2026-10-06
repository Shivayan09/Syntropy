"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type AiTokenStatus = {
  remaining: number;
  includedRemaining: number;
  bonusRemaining: number;
  cycleLimit: number;
  hasTokens: boolean;
  lastResetAt?: string;
  nextResetAt?: string | null;
  manualTestsUnlimited: boolean;
  unlimited?: boolean;
  plan: "free" | "starter" | "pro" | "power";
  planLabel: string;
  billingCycle: "monthly" | "annual";
};

type AiTokenContextType = {
  tokenStatus: AiTokenStatus | null;
  loading: boolean;
  error: string | null;
  refreshTokenStatus: () => Promise<void>;
  setTokenStatus: (status: AiTokenStatus | null) => void;
};

const AiTokenContext = createContext<AiTokenContextType | null>(null);

export const AiTokenProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  // Depend on the specific fields that actually change what the backend returns, not the
  // whole `user` object — getMe() recreates that object on every call anywhere in the app,
  // which otherwise re-fires this fetch (and the re-renders it causes) on unrelated updates.
  const entitlementKey = user ? `${user._id}:${user.plan}:${user.planBillingCycle}` : null;
  const [tokenStatus, setTokenStatus] = useState<AiTokenStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTokenStatus = useCallback(async () => {
    if (!entitlementKey) {
      setTokenStatus(null);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/user/ai-token-status", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Unable to load AI token status");
      }

      setTokenStatus(data.aiTokenStatus);
    } catch (err) {
      console.error("Failed to fetch AI token status", err);
      setTokenStatus(null);
      setError("AI token status is temporarily unavailable.");
    } finally {
      setLoading(false);
    }
  }, [entitlementKey]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void refreshTokenStatus();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [refreshTokenStatus]);

  const value = useMemo(
    () => ({ tokenStatus, loading, error, refreshTokenStatus, setTokenStatus }),
    [tokenStatus, loading, error, refreshTokenStatus]
  );

  return (
    <AiTokenContext.Provider value={value}>
      {children}
    </AiTokenContext.Provider>
  );
};

export const useAiTokens = () => {
  const context = useContext(AiTokenContext);
  if (!context) throw new Error("useAiTokens must be used inside AiTokenProvider");
  return context;
};
