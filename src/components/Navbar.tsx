"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sun,
  Moon,
  ShieldCheck,
  MapPin,
  PhoneCall,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth, UserRole } from "@/context/AuthContext";

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, setIsAuthModalOpen, quickLogin } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "HOMEOWNER":
        return { label: "Homeowner", bg: "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300" };
      case "SALES":
        return { label: "Sales Desk", bg: "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300" };
      case "SURVEYOR":
        return { label: "Site Surveyor", bg: "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300" };
      case "COORDINATOR":
        return { label: "Coordinator (Admin)", bg: "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300" };
    }
  };

  const badge = user ? getRoleBadge(user.role) : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
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
                  विदर्भ सोलर
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
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden md:inline-block"
            >
              Get Solar Quote
            </Link>
            <Link
              href="/track/LD-30881"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden sm:inline-block"
            >
              Track Project
            </Link>

            {/* Staff CRM Link */}
            <Link
              href="/admin"
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
            >
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Staff CRM</span>
            </Link>

            {/* Role / User Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
                  {badge && (
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${badge.bg}`}>
                      {badge.label}
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 text-xs font-semibold animate-in fade-in duration-150">
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-extrabold text-slate-900 dark:text-white truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono truncate">{user.email}</div>
                      <div className="mt-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${badge?.bg}`}>
                          Role: {badge?.label}
                        </span>
                      </div>
                    </div>

                    <div className="p-1 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400 px-2 py-1 block">
                        Switch Demo Role:
                      </span>
                      <button
                        onClick={() => {
                          quickLogin("HOMEOWNER");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>🏠 Homeowner</span>
                        {user.role === "HOMEOWNER" && <span className="text-amber-500 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          quickLogin("SALES");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>📞 Sales Lead Desk</span>
                        {user.role === "SALES" && <span className="text-amber-500 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          quickLogin("SURVEYOR");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>🛠️ Site Surveyor</span>
                        {user.role === "SURVEYOR" && <span className="text-amber-500 font-bold">✓</span>}
                      </button>
                      <button
                        onClick={() => {
                          quickLogin("COORDINATOR");
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-between cursor-pointer"
                      >
                        <span>📋 Admin / Coordinator</span>
                        {user.role === "COORDINATOR" && <span className="text-amber-500 font-bold">✓</span>}
                      </button>
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsAuthModalOpen(true);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Open Auth Portal</span>
                      </button>

                      <button
                        onClick={() => {
                          logout();
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs"
              >
                Sign In
              </button>
            )}

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
