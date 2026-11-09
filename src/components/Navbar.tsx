"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Contrast,
  ShieldCheck,
  MapPin,
  LogOut,
  ChevronDown,
  Languages,
  FolderKanban,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { SolarSaathiLogo } from "@/components/SolarSaathiLogo";

export function Navbar() {
  const { toggleTheme } = useTheme();
  const { user, logout, setIsAuthModalOpen } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#06150F]/90 backdrop-blur-md border-b border-emerald-900/10 dark:border-emerald-900/30 transition-colors print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <span className="transition-transform group-hover:scale-105"><SolarSaathiLogo size="md" /></span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg text-[#123D2B] dark:text-emerald-400 tracking-tight">
                  Solar<span className="text-[#198754] dark:text-white">Saathi</span>
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 text-[11px] font-bold bg-[#E7F3EC] dark:bg-emerald-950/80 text-[#123D2B] dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                  विदर्भ सोलर
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <MapPin className="w-3 h-3 text-[#198754]" />
                <span>Nagpur & Vidarbha Clean Energy</span>
              </div>
            </div>
          </Link>

          {/* Navigation & Controls */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#123D2B] dark:hover:text-emerald-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden md:inline-block"
            >
              {t("getQuote")}
            </Link>
            {user?.role === "HOMEOWNER" ? (
              <Link
                href="/track"
                className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#123D2B] dark:hover:text-emerald-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden sm:inline-block"
              >
                {t("trackProject")}
              </Link>
            ) : !user ? (
              <Link
                href="/login?next=%2Ftrack"
                className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-[#123D2B] dark:hover:text-emerald-400 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors hidden sm:inline-block"
              >
                {t("trackProject")}
              </Link>
            ) : null}

            {user && user.role !== "HOMEOWNER" && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white bg-[#123D2B] hover:bg-[#198754] dark:bg-[#198754] dark:hover:bg-emerald-500 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>{t("staffCrm")}</span>
              </Link>
            )}

            {/* LANGUAGE SWITCHER DROPDOWN */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                title="Switch Language (English / मराठी / हिंदी)"
              >
                <Languages className="w-3.5 h-3.5 text-[#198754]" />
                <span className="uppercase">{lang}</span>
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-xs font-bold animate-in fade-in duration-150">
                  <button
                    onClick={() => {
                      setLang("en");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      lang === "en" ? "bg-[#E7F3EC] text-[#123D2B] dark:bg-emerald-950 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>English</span>
                    {lang === "en" && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLang("mr");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      lang === "mr" ? "bg-[#E7F3EC] text-[#123D2B] dark:bg-emerald-950 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>मराठी</span>
                    {lang === "mr" && <span>✓</span>}
                  </button>
                  <button
                    onClick={() => {
                      setLang("hi");
                      setIsLangOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center justify-between ${
                      lang === "hi" ? "bg-[#E7F3EC] text-[#123D2B] dark:bg-emerald-950 dark:text-emerald-300" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                    }`}
                  >
                    <span>हिंदी</span>
                    {lang === "hi" && <span>✓</span>}
                  </button>
                </div>
              )}
            </div>

            {/* Role / User Button */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200"
                >
                  <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#198754] dark:text-emerald-400 flex items-center justify-center font-black text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{user.name}</span>
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
                    </div>

                    <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                      {user.role === "HOMEOWNER" && (
                        <Link
                          href="/track"
                          onClick={() => setIsDropdownOpen(false)}
                          className="w-full rounded-lg px-2 py-1.5 text-left font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 flex items-center gap-2"
                        >
                          <FolderKanban className="h-3.5 w-3.5" />
                          <span>My Projects</span>
                        </Link>
                      )}
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
                className="px-3.5 py-1.5 rounded-xl bg-[#123D2B] dark:bg-white text-white dark:text-slate-900 font-bold text-xs hover:opacity-90 transition-all cursor-pointer shadow-xs"
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
              <Contrast className="w-4 h-4" />
            </button>
          </nav>
        </div>
      </div>

      {/* Top Notification Strip */}
      <div className="bg-[#123D2B] text-slate-200 text-xs py-1.5 px-4 text-center flex items-center justify-center gap-2 border-t border-emerald-950">
        <span className="bg-[#198754] text-white px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide">
          PM Surya Ghar
        </span>
        <span className="font-medium text-emerald-100">
          {t("pmBanner")}
        </span>
        <span className="hidden md:inline text-emerald-700">|</span>
      </div>
    </header>
  );
}
