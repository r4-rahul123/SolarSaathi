"use client";

import React from "react";
import Link from "next/link";
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
import { SolarIntakeForm } from "@/components/SolarIntakeForm";

export default function HomePage() {
  return (
    <div className="space-y-12 pb-16">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>AI-Powered Rooftop Solar Intake & Instant Subsidy Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Switch to Solar in Nagpur. <br />
              <span className="text-amber-600">Save up to ₹78,000</span> with PM Subsidy.
            </h1>

            <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
              Upload your MSEDCL electricity bill or enter your monthly units. Our AI calculates your recommended system size, verifies your rooftop feasibility, and gives you a same-day quote.
            </p>

            {/* Quick 3-Pillar Value Proposition */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs font-medium text-slate-700">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>₹30,000/kW Govt Subsidy</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>~3.2 Years Payback</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
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
        <div className="bg-slate-900 text-slate-300 rounded-2xl p-6 sm:p-7 shadow-lg border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="font-bold text-sm text-white">
                Evaluator / Reviewer Quick Tour Guide
              </span>
            </div>
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/80 px-2 py-0.5 rounded">
              Take-Home Core Build
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-white block">1. Test AI Bill Extraction</span>
              <p className="text-slate-400 text-[11px]">
                Click <strong>&quot;Sample High (Owner)&quot;</strong> above to pre-fill MSEDCL bill data for Prashant Wankhede, or upload your own bill photo.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-white block">2. AI Lead Qualification</span>
              <p className="text-slate-400 text-[11px]">
                Test <strong>&quot;Sample Tenant&quot;</strong> or <strong>&quot;Sample Small Bill&quot;</strong> to see how the system automatically saves ₹2,500/survey by replacing site visits with short phone calls.
              </p>
            </div>

            <div className="space-y-1">
              <span className="font-semibold text-white block">3. Staff CRM & Rules Master</span>
              <p className="text-slate-400 text-[11px]">
                Visit the{" "}
                <Link href="/admin" className="text-amber-400 underline font-semibold">
                  Staff CRM Portal
                </Link>{" "}
                to inspect the dated subsidy rule tables and update milestone stages.
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] border-t border-slate-800 text-slate-400">
            <span>
              Sample Leads from Brief:{" "}
              <Link href="/track/LD-30881" className="text-amber-400 underline font-mono">
                LD-30881
              </Link>
              ,{" "}
              <Link href="/track/LD-30902" className="text-amber-400 underline font-mono">
                LD-30902
              </Link>
              ,{" "}
              <Link href="/track/LD-30915" className="text-amber-400 underline font-mono">
                LD-30915
              </Link>
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-white hover:text-amber-400 font-semibold"
            >
              <span>Go to Staff Operations Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS / STORYTELLING */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-bold text-slate-900">
            Transparent Rooftop Solar Process
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Engineered to eliminate delays and cut quotation turnaround from 3 days to under 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto font-bold text-base">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-sm">AI Bill Analysis</h3>
            <p className="text-xs text-slate-500">
              Gemini Vision scans your bill to extract your consumer ID, sanctioned load, and 12-month power consumption pattern.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto font-bold text-base">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Instant Dated Subsidy Quote</h3>
            <p className="text-xs text-slate-500">
              Applies central PM Surya Ghar rules (up to ₹78,000) and 1,400 units/kW benchmark to give you exact ROI & payback numbers.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto font-bold text-base">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-sm">Magic Link Tracking</h3>
            <p className="text-xs text-slate-500">
              Track your rooftop survey, MSEDCL net-metering application, and subsidy credit on your phone in real time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
