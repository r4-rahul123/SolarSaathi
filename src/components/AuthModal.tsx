"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  User,
  ShieldCheck,
  CheckCircle2,
  HardHat,
  PhoneCall,
  Sliders,
  LogIn,
  UserPlus,
  ArrowRight,
} from "lucide-react";
import { useAuth, DEMO_ACCOUNTS, UserRole } from "@/context/AuthContext";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, quickLogin, login, signup, user } = useAuth();
  const [activeTab, setActiveTab] = useState<"quick" | "login" | "signup">("quick");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupRole, setSignupRole] = useState<UserRole>("HOMEOWNER");

  if (!isAuthModalOpen) return null;

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
  };

  const handleManualSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    signup(name, email, signupRole);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-950 p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-bold mb-1.5 border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Role-Based Authentication (RBAC)</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Vidarbha Solar Access Portal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Switch roles to experience the app as a Homeowner, Sales Desk, Surveyor, or Admin.
            </p>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-6 pt-3 text-xs sm:text-sm font-bold gap-4">
          <button
            onClick={() => setActiveTab("quick")}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "quick"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>⚡ 1-Click Demo Login</span>
          </button>

          <button
            onClick={() => setActiveTab("login")}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "login"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            onClick={() => setActiveTab("signup")}
            className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "signup"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 font-black"
                : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Sign Up</span>
          </button>
        </div>

        {/* TAB 1: 1-CLICK QUICK DEMO LOGINS */}
        {activeTab === "quick" && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Click any role card below to instantly sign in with pre-configured permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Homeowner Card */}
              <button
                onClick={() => quickLogin("HOMEOWNER")}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    Homeowner
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Prashant Wankhede
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Submit bill, get instant subsidy quote & track project
                </div>
              </button>

              {/* Sales Lead Desk Card */}
              <button
                onClick={() => quickLogin("SALES")}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <PhoneCall className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                    Sales Desk
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Sunil Deshpande
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Filter AI scores, call tenants & eliminate ₹2,500 waste
                </div>
              </button>

              {/* Site Surveyor Card */}
              <button
                onClick={() => quickLogin("SURVEYOR")}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <HardHat className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                    Surveyor
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Amit Verma (Site Engg)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Conduct shadow analysis & approve rooftop viability
                </div>
              </button>

              {/* Project Coordinator / Admin Card */}
              <button
                onClick={() => quickLogin("COORDINATOR")}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50 dark:bg-slate-950/60 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 text-left transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </span>
                  <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                    Admin
                  </span>
                </div>
                <div className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-amber-600 transition-colors">
                  Dr. Ananya Joshi (Admin)
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Full control: MSEDCL Net Metering & Dated Rules Master
                </div>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL LOGIN */}
        {activeTab === "login" && (
          <form onSubmit={handleManualLogin} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Staff / Customer Email
              </label>
              <input
                type="email"
                required
                placeholder="e.g. sales@vidarbhasolar.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Demo passwords: <code>sales123</code>, <code>admin123</code>, <code>user123</code>
              </span>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: SIGN UP */}
        {activeTab === "signup" && (
          <form onSubmit={handleManualSignup} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="rahul@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Assign System Role
              </label>
              <select
                value={signupRole}
                onChange={(e) => setSignupRole(e.target.value as UserRole)}
                className="w-full px-4 py-2.5 text-xs sm:text-sm font-semibold border border-slate-300 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
              >
                <option value="HOMEOWNER">Homeowner / Customer</option>
                <option value="SALES">Sales Lead Desk</option>
                <option value="SURVEYOR">Site Surveyor Engineer</option>
                <option value="COORDINATOR">Project Coordinator (Admin)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Create Account & Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
