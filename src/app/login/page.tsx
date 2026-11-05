"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth, DEMO_ACCOUNTS, UserRole } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login, quickLogin, user } = useAuth();
  const [userName, setUserName] = useState("sales@solarsaathi.demo");
  const [password, setPassword] = useState("••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [signupRole, setSignupRole] = useState<UserRole>("HOMEOWNER");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(userName);
    if (userName.includes("sales") || userName.includes("admin") || userName.includes("surveyor")) {
      router.push("/admin");
    } else {
      router.push("/");
    }
  };

  const handleDemoSelect = (role: UserRole) => {
    quickLogin(role);
    if (role === "HOMEOWNER") {
      router.push("/track/LD-30881");
    } else {
      router.push("/admin");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT COLUMN: Graphic Banner matching the Dribbble design */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#10b981] via-[#059669] to-[#0284c7] p-8 sm:p-12 text-white flex flex-col justify-between min-h-[380px] lg:min-h-[640px]">
          {/* Subtle light glow elements */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-white/15 blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />

          {/* Top Headline & Tagline */}
          <div className="relative z-10 space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tight leading-tight drop-shadow-sm">
              Solar Execution <br />
              Simplified
            </h1>
            <p className="text-sm sm:text-base text-emerald-50/90 font-medium max-w-sm leading-relaxed">
              Sign in to monitor, manage, and optimize your rooftop solar projects, subsidy claims, and sales pipeline.
            </p>
          </div>

          {/* Clean Energy Vector Illustration matching the Dribbble artwork */}
          <div className="relative z-10 w-full mt-8 sm:mt-12 flex justify-center items-end">
            <svg
              viewBox="0 0 500 280"
              className="w-full h-auto max-h-[280px] drop-shadow-lg"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Distant City Skyline Silhouettes */}
              <rect x="60" y="140" width="30" height="70" fill="white" fillOpacity="0.18" rx="2" />
              <rect x="80" y="120" width="35" height="90" fill="white" fillOpacity="0.22" rx="2" />
              <rect x="130" y="150" width="40" height="60" fill="white" fillOpacity="0.15" rx="2" />
              <rect x="290" y="130" width="35" height="80" fill="white" fillOpacity="0.18" rx="2" />
              <rect x="330" y="145" width="45" height="65" fill="white" fillOpacity="0.2" rx="2" />
              <rect x="390" y="125" width="40" height="85" fill="white" fillOpacity="0.15" rx="2" />

              {/* Rolling Green Hills Background */}
              <path
                d="M-20 230 Q 120 180 250 210 T 520 190 L 520 280 L -20 280 Z"
                fill="#047857"
                fillOpacity="0.6"
              />
              <path
                d="M-20 240 Q 150 200 300 225 T 520 215 L 520 280 L -20 280 Z"
                fill="#065f46"
              />

              {/* WIND TURBINE 1 (Left Tall) */}
              <line x1="75" y1="230" x2="75" y2="120" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="75" cy="120" r="4" fill="white" />
              {/* Rotor Blades with Red Tips */}
              <path d="M75 120 L75 75 L73 75 Z" fill="white" stroke="#ef4444" strokeWidth="1" />
              <path d="M75 120 L40 145 L42 147 Z" fill="white" stroke="#ef4444" strokeWidth="1" />
              <path d="M75 120 L110 145 L108 147 Z" fill="white" stroke="#ef4444" strokeWidth="1" />

              {/* WIND TURBINE 2 (Center Hero) */}
              <line x1="210" y1="230" x2="210" y2="85" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="210" cy="85" r="5" fill="white" />
              {/* Rotor Blades with Red Tips */}
              <path d="M210 85 L210 30 L207 30 Z" fill="white" stroke="#ef4444" strokeWidth="1.5" />
              <rect x="207.5" y="30" width="5" height="10" fill="#ef4444" />
              <path d="M210 85 L160 115 L162 118 Z" fill="white" stroke="#ef4444" strokeWidth="1.5" />
              <rect x="160" y="110" width="8" height="6" fill="#ef4444" transform="rotate(-30 160 110)" />
              <path d="M210 85 L260 115 L258 118 Z" fill="white" stroke="#ef4444" strokeWidth="1.5" />
              <rect x="252" y="115" width="8" height="6" fill="#ef4444" transform="rotate(30 252 115)" />

              {/* WIND TURBINE 3 (Right Medium) */}
              <line x1="380" y1="230" x2="380" y2="110" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="380" cy="110" r="4" fill="white" />
              <path d="M380 110 L380 65 L378 65 Z" fill="white" stroke="#ef4444" strokeWidth="1" />
              <path d="M380 110 L345 135 L347 137 Z" fill="white" stroke="#ef4444" strokeWidth="1" />
              <path d="M380 110 L415 135 L413 137 Z" fill="white" stroke="#ef4444" strokeWidth="1" />

              {/* FOREGROUND SOLAR PANELS ARRAY */}
              {/* Left Row of Panels */}
              <g transform="skewX(-15) translate(40, 0)">
                <polygon points="50,230 110,215 110,250 50,265" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                <line x1="70" y1="225" x2="70" y2="260" stroke="#93c5fd" strokeWidth="0.8" />
                <line x1="90" y1="220" x2="90" y2="255" stroke="#93c5fd" strokeWidth="0.8" />
                <line x1="50" y1="247" x2="110" y2="232" stroke="#93c5fd" strokeWidth="0.8" />
              </g>

              {/* Center Main Solar Panel Array */}
              <g transform="skewX(-10) translate(25, 0)">
                {/* Mount Stands */}
                <line x1="200" y1="220" x2="200" y2="255" stroke="#64748b" strokeWidth="2.5" />
                <line x1="280" y1="210" x2="280" y2="250" stroke="#64748b" strokeWidth="2.5" />
                {/* Panel Face */}
                <polygon points="170,165 310,145 310,225 170,245" fill="#1e40af" stroke="#93c5fd" strokeWidth="2.5" />
                {/* Grid Lines */}
                <line x1="170" y1="185" x2="310" y2="165" stroke="#60a5fa" strokeWidth="1" />
                <line x1="170" y1="205" x2="310" y2="185" stroke="#60a5fa" strokeWidth="1" />
                <line x1="170" y1="225" x2="310" y2="205" stroke="#60a5fa" strokeWidth="1" />
                <line x1="205" y1="160" x2="205" y2="240" stroke="#60a5fa" strokeWidth="1" />
                <line x1="240" y1="155" x2="240" y2="235" stroke="#60a5fa" strokeWidth="1" />
                <line x1="275" y1="150" x2="275" y2="230" stroke="#60a5fa" strokeWidth="1" />
              </g>

              {/* Right Solar Panels */}
              <g transform="skewX(12) translate(-20, 0)">
                <polygon points="360,200 440,185 440,230 360,245" fill="#1e3a8a" stroke="#60a5fa" strokeWidth="1.5" />
                <line x1="385" y1="195" x2="385" y2="240" stroke="#93c5fd" strokeWidth="0.8" />
                <line x1="415" y1="190" x2="415" y2="235" stroke="#93c5fd" strokeWidth="0.8" />
                <line x1="360" y1="222" x2="440" y2="207" stroke="#93c5fd" strokeWidth="0.8" />
              </g>

              {/* Small Trees & Vegetation */}
              <circle cx="160" cy="245" r="8" fill="#15803d" />
              <circle cx="165" cy="240" r="10" fill="#22c55e" />
              <circle cx="320" cy="240" r="11" fill="#15803d" />
              <circle cx="326" cy="235" r="9" fill="#22c55e" />
              <circle cx="440" cy="245" r="8" fill="#15803d" />
            </svg>
          </div>

          <div className="relative z-10 pt-4 flex items-center justify-between text-xs text-white/80 border-t border-white/20">
            <span>SolarSaathi Clean Energy</span>
            <span>Nagpur • Vidarbha Circle</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Sign In Form matching the Dribbble design */}
        <div className="p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
          <div className="max-w-md w-full mx-auto space-y-8">
            {/* Header Text */}
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {isSignUpMode ? "Create Account" : "Sign In"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                {isSignUpMode
                  ? "Register to start your solar project"
                  : "Sign in by entering the information below"}
              </p>
            </div>

            {/* 1-Click Role Presets Strip */}
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
                ⚡ 1-Click Demo Logins (Instant Access)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => handleDemoSelect("HOMEOWNER")}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition-all text-center cursor-pointer shadow-2xs"
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect("SALES")}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition-all text-center cursor-pointer shadow-2xs"
                >
                  Sales Desk
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect("SURVEYOR")}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition-all text-center cursor-pointer shadow-2xs"
                >
                  Surveyor
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSelect("COORDINATOR")}
                  className="py-1.5 px-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-slate-700 dark:text-slate-200 transition-all text-center cursor-pointer shadow-2xs"
                >
                  Admin
                </button>
              </div>
            </div>

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {isSignUpMode && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    Account Role
                  </label>
                  <select
                    value={signupRole}
                    onChange={(e) => setSignupRole(e.target.value as UserRole)}
                    className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs sm:text-sm font-semibold border-0 focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white"
                  >
                    <option value="HOMEOWNER">Homeowner / Customer</option>
                    <option value="SALES">Sales Desk Staff</option>
                    <option value="SURVEYOR">Site Surveyor</option>
                    <option value="COORDINATOR">Project Coordinator (Admin)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  User Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your user name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs sm:text-sm font-semibold border-0 focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-11 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs sm:text-sm font-semibold border-0 focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isSignUpMode && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => alert("For this assignment demo, passwords are pre-filled or accept any value.")}
                    className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Pill Button matching the Dribbble design */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-bold text-sm shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                {isSignUpMode ? "Create Account" : "Sign in"}
              </button>

              {/* Sign up / Sign in toggle link */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setIsSignUpMode(!isSignUpMode)}
                  className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                >
                  {isSignUpMode ? "Already have an account? Sign in" : "Sign up"}
                </button>
              </div>
            </form>
          </div>

          {/* Footer Back Link */}
          <div className="text-center pt-6 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600 dark:hover:text-slate-200 font-semibold">
              ← Return to SolarSaathi Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
