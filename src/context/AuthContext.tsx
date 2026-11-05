"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "HOMEOWNER" | "SALES" | "SURVEYOR" | "COORDINATOR";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export const DEMO_ACCOUNTS: Record<UserRole, AuthUser & { passwordHint: string }> = {
  HOMEOWNER: {
    id: "user-homeowner-1",
    name: "Prashant Wankhede",
    email: "customer@solarsaathi.demo",
    role: "HOMEOWNER",
    phone: "+91 98231 44521",
    passwordHint: "customer123",
  },
  SALES: {
    id: "staff-sales-1",
    name: "Sunil Deshpande",
    email: "sales@solarsaathi.demo",
    role: "SALES",
    phone: "+91 98222 10001",
    passwordHint: "sales123",
  },
  SURVEYOR: {
    id: "staff-surveyor-1",
    name: "Amit Verma (Site Engg)",
    email: "surveyor@solarsaathi.demo",
    role: "SURVEYOR",
    phone: "+91 98222 10002",
    passwordHint: "survey123",
  },
  COORDINATOR: {
    id: "staff-admin-1",
    name: "Dr. Ananya Joshi (Admin)",
    email: "admin@solarsaathi.demo",
    role: "COORDINATOR",
    phone: "+91 98222 10003",
    passwordHint: "admin123",
  },
};

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, role?: UserRole) => void;
  quickLogin: (role: UserRole) => void;
  signup: (name: string, email: string, role: UserRole) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  quickLogin: () => {},
  signup: () => {},
  logout: () => {},
  isAuthModalOpen: false,
  setIsAuthModalOpen: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("solarsaathi-auth");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    } else {
      setUser(DEMO_ACCOUNTS.COORDINATOR);
      localStorage.setItem("solarsaathi-auth", JSON.stringify(DEMO_ACCOUNTS.COORDINATOR));
    }
  }, []);

  const login = (email: string, role: UserRole = "HOMEOWNER") => {
    const matchedRole = (Object.keys(DEMO_ACCOUNTS) as UserRole[]).find(
      (r) => DEMO_ACCOUNTS[r].email.toLowerCase() === email.toLowerCase()
    );

    const loggedUser: AuthUser = matchedRole
      ? DEMO_ACCOUNTS[matchedRole]
      : {
          id: `user-${Date.now()}`,
          name: email.split("@")[0].toUpperCase(),
          email,
          role,
        };

    setUser(loggedUser);
    localStorage.setItem("solarsaathi-auth", JSON.stringify(loggedUser));
    setIsAuthModalOpen(false);
  };

  const quickLogin = (role: UserRole) => {
    const demo = DEMO_ACCOUNTS[role];
    setUser(demo);
    localStorage.setItem("solarsaathi-auth", JSON.stringify(demo));
    setIsAuthModalOpen(false);
  };

  const signup = (name: string, email: string, role: UserRole) => {
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
    };
    setUser(newUser);
    localStorage.setItem("solarsaathi-auth", JSON.stringify(newUser));
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("solarsaathi-auth");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        quickLogin,
        signup,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
