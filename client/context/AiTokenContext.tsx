"use client";

import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export type AiTokenStatus = {
  remaining: number;
  dailyLimit: number;
  hasTokens: boolean;
  lastResetAt?: string;
  nextResetAt: string;
  manualTestsUnlimited: boolean;
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
  const [tokenStatus, setTokenStatus] = useState<AiTokenStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTokenStatus = useCallback(async () => {
    if (!user) {
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
  }, [user]);

  useEffect(() => {
    refreshTokenStatus();
  }, [refreshTokenStatus]);

  return (
    <AiTokenContext.Provider value={{ tokenStatus, loading, error, refreshTokenStatus, setTokenStatus }}>
      {children}
    </AiTokenContext.Provider>
  );
};

export const useAiTokens = () => {
  const context = useContext(AiTokenContext);
  if (!context) throw new Error("useAiTokens must be used inside AiTokenProvider");
  return context;
};
