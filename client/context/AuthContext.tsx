"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type User = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  college?: string;
  semester?: number;
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
  getMe: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getMe = async () => {
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/api/getMe",
        {
          credentials: "include",
        }
      );
      if (!res.ok) {
        setUser(null);
      } else {
        const data: User = await res.json();
        setUser(data);
      }
    } catch {
      setUser(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    getMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, getMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};