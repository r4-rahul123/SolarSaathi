"use client";

import React from "react";
import Link from "next/link";
import { Sun, Moon, ShieldCheck, MapPin, PhoneCall, Sparkles } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/25 group-hover:scale-105 transition-all">
              <Sun className="w-6 h-6 animate-[spin_16s_linear_infinite]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight">
                  Vidarbha<span className="text-amber-500">Solar</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full border border-amber-200 dark:border-amber-800/60">
                  विदर्भ सोलर हब
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <MapPin className="w-3 h-3 text-amber-500" />
                <span>Nagpur Rooftop Clean Energy</span>
              </div>
            </div>
          </Link>

          {/* Navigation & Controls */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              Get Solar Quote
            </Link>
            <Link
              href="/track/LD-30881"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
            >
              Track Project
            </Link>

            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Staff CRM</span>
            </Link>

            {/* DARK / LIGHT MODE TOGGLE BUTTON */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark and Light Mode"
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 ml-1"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>
          </nav>
        </div>
      </div>

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 text-slate-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 border-t border-slate-800/60">
        <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide">
          PM Surya Ghar
        </span>
        <span className="font-medium text-slate-200">
          Get up to <strong className="text-amber-400 font-bold">₹78,000 Direct Bank Subsidy</strong> on Vidarbha Rooftops.
        </span>
        <span className="hidden md:inline text-slate-500">|</span>
        <span className="hidden md:inline-flex items-center gap-1 text-amber-300 font-medium">
          <PhoneCall className="w-3 h-3" /> Nagpur Helpline: 0712-254890
        </span>
      </div>
    </header>
  );
}
