import { api } from "@/lib/api";
import { authStorage } from "@/lib/storage";
import type { User } from "@/types/api";
import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type RegisterPayload = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  acceptedTerms: boolean;
};

type AuthContextValue = {
  ready: boolean;
  token: string | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<User>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const bootstrap = async () => {
    try {
      const storedToken = await authStorage.getToken();
      if (!storedToken) {
        setReady(true);
        return;
      }

      const me = await api.getMe(storedToken);
      setToken(storedToken);
      setUser(me);
    } catch {
      await authStorage.clearToken();
      setToken(null);
      setUser(null);
    } finally {
      setReady(true);
    }
  };

  useEffect(() => {
    void bootstrap();
  }, []);

  const signIn = async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (!response.token || !response.user) {
      throw new Error("Login did not return a mobile session");
    }

    await authStorage.setToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (payload: RegisterPayload) => {
    const response = await api.register(payload);
    if (!response.token || !response.user) {
      throw new Error("Registration did not return a mobile session");
    }

    await authStorage.setToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  };

  const signOut = async () => {
    try {
      await api.logout(token);
    } catch {
      // Mobile sessions are bearer-based, so local cleanup is enough if the network fails.
    } finally {
      await authStorage.clearToken();
      setToken(null);
      setUser(null);
    }
  };

  const refreshUser = async () => {
    if (!token) {
      return;
    }

    const me = await api.getMe(token);
    setUser(me);
  };

  const value = useMemo(
    () => ({ ready, token, user, signIn, register, signOut, refreshUser, setUser }),
    [ready, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
