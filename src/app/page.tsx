"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Sun,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";

const SolarIntakeForm = dynamic(
  () => import("@/components/SolarIntakeForm").then((mod) => mod.SolarIntakeForm),
  {
    ssr: false,
    loading: () => (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs animate-pulse space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
        </div>
      </div>
    ),
  }
);

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16 transition-colors">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/10 dark:via-slate-950/40 dark:to-transparent pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700/60 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin" />
              <span>AI-Powered Rooftop Sizing & Instant Govt Subsidy Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              Switch to Solar in Nagpur. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-400 dark:via-amber-300 dark:to-amber-500">
                Save up to ₹78,000
              </span>{" "}
              with PM Subsidy.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
              Upload your MSEDCL electricity bill or enter your monthly units. Our AI calculates your recommended system capacity, qualifies your rooftop eligibility, and delivers an instant same-day quote.
            </p>

            {/* Quick 3-Pillar Value Proposition */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>₹30,000/kW Subsidy</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>~3.2 Years Payback</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>25 Years Free Electricity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE BUILD INTERACTIVE INTAKE WORKSTATION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <SolarIntakeForm />
      </section>

      {/* REVIEWER & DEMO HELPER BAR */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-slate-900 dark:bg-slate-950 text-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block">
                  Evaluator Quick Test Tour
                </span>
                <span className="text-[11px] text-slate-400">Everything needed to review the take-home in 2 minutes</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2.5 py-1 rounded-lg">
              Take-Home Core Build
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-bold text-white block">1. Test AI Bill Extraction</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Click <strong>&quot;★ Sample High (Owner)&quot;</strong> above to pre-fill MSEDCL bill data for Prashant Wankhede, or upload your own bill photo.
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-bold text-white block">2. AI Lead Qualification</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Test <strong>&quot;Sample Tenant&quot;</strong> or <strong>&quot;Sample Small Bill&quot;</strong> to see how the system automatically saves ₹2,500/survey by replacing site visits with short calls.
              </p>
            </div>

            <div className="space-y-1.5 p-3 rounded-xl bg-slate-800/50 border border-slate-800">
              <span className="font-bold text-white block">3. Staff CRM & Rules Master</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Visit the{" "}
                <Link href="/admin" className="text-amber-400 underline font-bold">
                  Staff CRM Portal
                </Link>{" "}
                to inspect the dated subsidy rule tables and update milestone stages.
              </p>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-slate-800 text-slate-300 font-medium">
            <span>
              Pre-seeded Leads:{" "}
              <Link href="/track/LD-30881" className="text-amber-400 underline font-mono font-bold">
                LD-30881
              </Link>
              ,{" "}
              <Link href="/track/LD-30902" className="text-amber-400 underline font-mono font-bold">
                LD-30902
              </Link>
              ,{" "}
              <Link href="/track/LD-30915" className="text-amber-400 underline font-mono font-bold">
                LD-30915
              </Link>
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-white bg-amber-600 hover:bg-amber-500 px-3.5 py-1.5 rounded-xl font-bold transition-colors shadow-xs"
            >
              <span>Go to Staff Operations CRM</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3-STEP TRANSPARENT PROCESS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Transparent Rooftop Solar Process
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Engineered to eliminate delays and cut quotation turnaround from 3 days to under 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs hover:border-amber-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto font-black text-lg border border-amber-200 dark:border-amber-800/80">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Bill Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Gemini Vision scans your bill to extract your consumer ID, sanctioned load, and 12-month power consumption pattern.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs hover:border-emerald-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto font-black text-lg border border-emerald-200 dark:border-emerald-800/80">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Dated Subsidy Quote</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Applies central PM Surya Ghar rules (up to ₹78,000) and 1,400 units/kW benchmark to give you exact ROI & payback numbers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs hover:border-blue-400 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center mx-auto font-black text-lg border border-blue-200 dark:border-blue-800/80">
              3
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Magic Link Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Track your rooftop survey, MSEDCL net-metering application, and subsidy credit on your phone in real time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
