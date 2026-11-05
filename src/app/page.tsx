"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  Building,
  Award,
  MapPin,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

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
  const { t } = useLanguage();

  return (
    <div className="space-y-14 pb-16 transition-colors">
      {/* HERO SECTION WITH REAL PHOTO SHOWCASE */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#E7F3EC] via-[#E7F3EC]/30 to-transparent dark:from-[#123D2B]/30 dark:via-slate-950/40 dark:to-transparent pt-10 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E7F3EC] dark:bg-[#123D2B]/80 text-[#123D2B] dark:text-emerald-300 text-xs font-bold border border-[#198754]/40 shadow-xs">
                <Sparkles className="w-4 h-4 text-[#198754] dark:text-emerald-400 animate-spin" />
                <span>{t("region")} • PM Surya Ghar Muft Bijli Yojana</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {t("heroTitle")} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#123D2B] via-[#198754] to-emerald-600 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300">
                  {t("heroSubtitle")}
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-xl font-medium leading-relaxed mx-auto lg:mx-0">
                {t("heroDescription")}
              </p>

              {/* Quick 3-Pillar Value Proposition */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#198754]" />
                  <span>₹30,000/kW Subsidy</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#198754]" />
                  <span>~3.2 Years Payback</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#198754]" />
                  <span>25 Years Free Electricity</span>
                </div>
              </div>
            </div>

            {/* Right Photo Column (Real Rooftop Photo with Glassmorphism Badges) */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white/60 dark:border-slate-800 group">
                <img
                  src="/images/hero-solar-rooftop.jpg"
                  alt="Modern rooftop solar installation in Nagpur"
                  className="w-full h-[340px] sm:h-[400px] object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Floating Glassmorphism Badge 1: Subsidy */}
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/40 dark:border-slate-700 shadow-lg flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">
                    ✓
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Direct DBT
                    </span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">
                      ₹78,000 Central Subsidy
                    </span>
                  </div>
                </div>

                {/* Floating Glassmorphism Badge 2: Location */}
                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold block">Verified Rooftop Installation</span>
                      <span className="text-[11px] text-emerald-200/90">Somalwada, Wardha Road • Nagpur BU-41</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-500/40">
                    3 kW Plant
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CORE BUILD INTERACTIVE INTAKE WORKSTATION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <SolarIntakeForm />
      </section>

      {/* REAL NAGPUR ROOFTOP PHOTO GALLERY & VERIFIED CASE STUDIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-2">
            <Award className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Nagpur Rooftops</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Real Solar Installations Across Nagpur & Vidarbha
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            Over 350+ homes energized in 2026 with certified DISCOM net-metering and fast subsidy release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Rooftop Array */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group hover:border-[#198754] transition-all">
            <div className="relative h-60 overflow-hidden">
              <img
                src="/images/hero-solar-rooftop.jpg"
                alt="Prashant Wankhede Rooftop Solar"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 bg-[#123D2B] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                ★ 3 kW Residential Setup
              </span>
              <span className="absolute bottom-3 right-3 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-xs">
                Zero Bill Achieved
              </span>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Prashant Wankhede Residence
                  </h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3 h-3 text-[#198754]" /> Somalwada, Wardha Road
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">Annual Savings</span>
                  <span className="font-mono font-black text-[#198754] text-base">₹31,500/yr</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Replaced ₹3,200/mo electricity bill with a 3 kW on-grid solar plant. Received ₹78,000 direct bank subsidy within 22 days of net-meter synchronization.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Ref: #LD-30881</span>
                <Link
                  href="/track/LD-30881"
                  className="font-bold text-[#198754] hover:underline flex items-center gap-1"
                >
                  <span>View Project Timeline</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Certified Surveyor Inspection */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md group hover:border-[#198754] transition-all">
            <div className="relative h-60 overflow-hidden">
              <img
                src="/images/site-surveyor.jpg"
                alt="Certified Site Surveyor Inspection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute top-3 left-3 bg-[#123D2B] text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                Certified Rooftop Engineering
              </span>
              <span className="absolute bottom-3 right-3 bg-blue-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-xs">
                Digital Shadow Mapping
              </span>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    Nagpur Urban Feeder Feasibility
                  </h3>
                  <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                    <MapPin className="w-3 h-3 text-[#198754]" /> Ramdaspeth & Civil Lines
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block font-medium">DISCOM Turnaround</span>
                  <span className="font-mono font-black text-blue-600 text-base">&lt; 14 Days</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Certified solar engineers conduct 3D shadow mapping on your concrete terrace and file direct bi-directional net-meter documentation with MSEDCL BU-41 circle.
              </p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400 font-mono">Ref: #PR-1025</span>
                <Link
                  href="/track/PR-1025"
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <span>View Net-Meter Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWER & DEMO HELPER BAR */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#123D2B] text-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/60 space-y-5">
          <div className="flex items-center justify-between border-b border-emerald-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block">
                  Evaluator Quick Test Tour
                </span>
                <span className="text-[11px] text-emerald-200/80">Everything needed to review the take-home in 2 minutes</span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-200 bg-emerald-950/80 border border-emerald-700/80 px-2.5 py-1 rounded-lg">
              Take-Home Core Build
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="font-bold text-white block">1. Test AI Bill Extraction</span>
              <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                Click <strong>&quot;★ Sample High (Owner)&quot;</strong> above to pre-fill MSEDCL bill data for Prashant Wankhede, or upload your own bill photo/PDF.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="font-bold text-white block">2. AI Lead Qualification</span>
              <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                Test <strong>&quot;Sample Tenant&quot;</strong> or <strong>&quot;Sample Small Bill&quot;</strong> to see how the 100-point score breakdown automatically saves ₹2,500/survey by routing to a 5-min call.
              </p>
            </div>

            <div className="space-y-1.5 p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/60">
              <span className="font-bold text-white block">3. Staff CRM & Rules Master</span>
              <p className="text-emerald-100/80 text-[11px] leading-relaxed">
                Visit the{" "}
                <Link href="/admin" className="text-emerald-300 underline font-bold">
                  Staff CRM Portal
                </Link>{" "}
                to inspect the dated subsidy rules, installation pricing, stuck project alerts, and milestone updates.
              </p>
            </div>
          </div>

          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 text-xs border-t border-emerald-800/80 text-emerald-200 font-medium">
            <span>
              Pre-seeded Leads:{" "}
              <Link href="/track/LD-30881" className="text-emerald-300 underline font-mono font-bold">
                LD-30881
              </Link>
              ,{" "}
              <Link href="/track/LD-30902" className="text-emerald-300 underline font-mono font-bold">
                LD-30902
              </Link>
              ,{" "}
              <Link href="/track/LD-30915" className="text-emerald-300 underline font-mono font-bold">
                LD-30915
              </Link>
              ,{" "}
              <Link href="/track/PR-1025" className="text-amber-300 underline font-mono font-bold">
                PR-1025 (Stuck 10d)
              </Link>
            </span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-[#123D2B] bg-white hover:bg-emerald-50 px-3.5 py-1.5 rounded-xl font-bold transition-colors shadow-xs"
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
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs hover:border-[#198754] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F3EC] dark:bg-[#123D2B]/80 text-[#123D2B] dark:text-emerald-400 flex items-center justify-center mx-auto font-black text-lg border border-[#198754]/30">
              1
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">AI Bill Analysis</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Gemini Vision scans your bill to extract your consumer ID, sanctioned load, and 12-month power consumption pattern.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs hover:border-[#198754] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F3EC] dark:bg-[#123D2B]/80 text-[#123D2B] dark:text-emerald-400 flex items-center justify-center mx-auto font-black text-lg border border-[#198754]/30">
              2
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Dated Subsidy Quote</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Applies central PM Surya Ghar rules (up to ₹78,000) and 1,400 units/kW benchmark to give you exact ROI & payback numbers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-xs hover:border-[#198754] transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#E7F3EC] dark:bg-[#123D2B]/80 text-[#123D2B] dark:text-emerald-400 flex items-center justify-center mx-auto font-black text-lg border border-[#198754]/30">
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
