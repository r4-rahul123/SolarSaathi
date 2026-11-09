"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type UserRole = "HOMEOWNER" | "SALES" | "SURVEYOR" | "COORDINATOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (name: string, email: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => "Authentication is unavailable.",
  signup: async () => "Authentication is unavailable.",
  logout: async () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const refreshSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await response.json();
      setUser(response.ok ? data.user ?? null : null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Session lookup is an external async request; its result initializes client auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession();
  }, [refreshSession]);

  const submitAuth = async (path: string, body: Record<string, string>) => {
    try {
      const response = await fetch(path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) return data.error || "Could not sign in.";
      await refreshSession();
      setIsAuthModalOpen(false);
      return null;
    } catch {
      return "Could not reach the server. Check that PostgreSQL is running.";
    }
  };

  const login = (email: string, password: string) => submitAuth("/api/auth/login", { email, password });
  const signup = (name: string, email: string, password: string) =>
    submitAuth("/api/auth/signup", { name, email, password });

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, isAuthModalOpen, setIsAuthModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
