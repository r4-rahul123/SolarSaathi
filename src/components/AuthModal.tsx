"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useAuth();
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const message = await login(userName, password);
    setError(message || "");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-[32px] max-w-4xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          aria-label="Close modal"
          className="absolute right-4 top-4 z-20 p-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT COLUMN: Graphic Banner matching Dribbble design */}
        <div className="relative overflow-hidden bg-[#123D2B] p-8 text-white flex flex-col justify-between min-h-[300px] md:min-h-[480px]">
          <Image src="/images/hero-solar-rooftop.jpg" alt="Solar panels on a sunny rooftop" fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#092016] via-[#123D2B]/50 to-[#123D2B]/20" />
          <div className="relative z-10 space-y-2">
            <SolarSaathiLogo size="lg" inverse withName />
            <p className="text-xs sm:text-sm text-emerald-50/90 font-medium max-w-xs">
              Sign in to access your SolarSaathi account.
            </p>
          </div>

          {/* SVG Illustration */}
          <div className="relative z-10 w-full mt-4 flex justify-center items-end">
            <svg
              viewBox="0 0 400 200"
              className="w-full h-auto max-h-[180px] drop-shadow-md"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* City Silhouettes */}
              <rect x="50" y="90" width="25" height="50" fill="white" fillOpacity="0.2" rx="2" />
              <rect x="65" y="70" width="30" height="70" fill="white" fillOpacity="0.25" rx="2" />
              <rect x="250" y="80" width="30" height="60" fill="white" fillOpacity="0.2" rx="2" />
              <rect x="290" y="90" width="35" height="50" fill="white" fillOpacity="0.22" rx="2" />

              {/* Hills */}
              <path d="M-10 160 Q 100 120 200 145 T 410 135 L 410 200 L -10 200 Z" fill="#047857" fillOpacity="0.6" />
              <path d="M-10 170 Q 120 140 240 160 T 410 155 L 410 200 L -10 200 Z" fill="#065f46" />

              {/* Wind Turbines */}
              <line x1="60" y1="160" x2="60" y2="80" stroke="white" strokeWidth="2.5" />
              <circle cx="60" cy="80" r="3" fill="white" />
              <path d="M60 80 L60 50 L58 50 Z" fill="white" stroke="#ef4444" strokeWidth="0.8" />
              <path d="M60 80 L35 95 L37 97 Z" fill="white" stroke="#ef4444" strokeWidth="0.8" />
              <path d="M60 80 L85 95 L83 97 Z" fill="white" stroke="#ef4444" strokeWidth="0.8" />

              <line x1="170" y1="160" x2="170" y2="55" stroke="white" strokeWidth="3.5" />
              <circle cx="170" cy="55" r="4" fill="white" />
              <path d="M170 55 L170 15 L168 15 Z" fill="white" stroke="#ef4444" strokeWidth="1" />
              <path d="M170 55 L130 75 L132 77 Z" fill="white" stroke="#ef4444" strokeWidth="1" />
              <path d="M170 55 L210 75 L208 77 Z" fill="white" stroke="#ef4444" strokeWidth="1" />

              <line x1="300" y1="160" x2="300" y2="70" stroke="white" strokeWidth="2.5" />
              <circle cx="300" cy="70" r="3" fill="white" />
              <path d="M300 70 L300 40 L298 40 Z" fill="white" stroke="#ef4444" strokeWidth="0.8" />
              <path d="M300 70 L275 85 L277 87 Z" fill="white" stroke="#ef4444" strokeWidth="0.8" />
              <path d="M300 70 L325 85 L323 87 Z" fill="white" stroke="#ef4444" strokeWidth="0.8" />

              {/* Foreground Solar Panel */}
              <g transform="skewX(-10) translate(20, 0)">
                <line x1="160" y1="150" x2="160" y2="180" stroke="#64748b" strokeWidth="2" />
                <line x1="230" y1="140" x2="230" y2="175" stroke="#64748b" strokeWidth="2" />
                <polygon points="140,110 250,95 250,155 140,170" fill="#1e40af" stroke="#93c5fd" strokeWidth="2" />
                <line x1="140" y1="125" x2="250" y2="110" stroke="#60a5fa" strokeWidth="0.8" />
                <line x1="140" y1="140" x2="250" y2="125" stroke="#60a5fa" strokeWidth="0.8" />
                <line x1="140" y1="155" x2="250" y2="140" stroke="#60a5fa" strokeWidth="0.8" />
                <line x1="175" y1="105" x2="175" y2="165" stroke="#60a5fa" strokeWidth="0.8" />
                <line x1="210" y1="100" x2="210" y2="160" stroke="#60a5fa" strokeWidth="0.8" />
              </g>

              {/* Trees */}
              <circle cx="130" cy="170" r="7" fill="#22c55e" />
              <circle cx="260" cy="165" r="8" fill="#22c55e" />
            </svg>
          </div>

          <div className="relative z-10 pt-2 text-[11px] text-white/80">
            SolarSaathi • Nagpur Circle
          </div>
        </div>

        {/* RIGHT COLUMN: Form matching Dribbble design */}
        <div className="p-6 sm:p-8 flex flex-col justify-between">
          <div className="space-y-5">
            <div className="text-center space-y-1">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Sign in
              </h3>
              <p className="text-xs text-slate-400">
                Sign in with your email and password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</p>}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email address
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border-0 focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold border-0 focus:ring-2 focus:ring-teal-500 text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Link href="/forgot-password" onClick={() => setIsAuthModalOpen(false)} className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold">
                  Forgot password?
                </Link>
              </div>

              {/* Gradient Pill Button matching Dribbble */}
              <button
                type="submit"
                className="w-full py-3 px-5 rounded-full bg-gradient-to-r from-teal-500 via-teal-600 to-sky-600 hover:from-teal-600 hover:to-sky-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-teal-500/25 transition-all hover:scale-[1.01] cursor-pointer"
              >
                Sign in
              </button>
              <p className="text-center text-xs text-slate-500">
                New here? <Link href="/signup" onClick={() => setIsAuthModalOpen(false)} className="font-semibold text-teal-700">Create a homeowner account</Link>
              </p>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
