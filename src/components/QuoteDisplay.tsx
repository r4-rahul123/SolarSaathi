"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  Sun,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  Sliders,
  Sparkles,
  Award,
  Layers,
} from "lucide-react";
import { Lead, SubsidyRule } from "@/types/solar";
import { calculateSolarQuote, DEFAULT_SUBSIDY_RULE } from "@/lib/solar-calculator";
import { formatCurrency } from "@/lib/utils";
import { AnimatedEnergyFlow } from "./AnimatedEnergyFlow";

interface QuoteDisplayProps {
  lead: Lead;
  initialRule?: SubsidyRule;
}

export function QuoteDisplay({ lead, initialRule = DEFAULT_SUBSIDY_RULE }: QuoteDisplayProps) {
  const [selectedKw, setSelectedKw] = useState<number>(lead.recommendedKw || 3);
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on quote generation
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#f59e0b", "#10b981", "#3b82f6", "#ffffff"],
      });
    } catch (e) {
      // Graceful fallback if in environment without canvas
    }
  }, []);

  const currentQuote = calculateSolarQuote(selectedKw, initialRule);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/track/${lead.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate 5-year snapshot milestones for visual ROI chart
  const roiYears = [1, 2, 3.2, 5, 10, 15, 20, 25];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Hero Story Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950 text-white p-6 sm:p-10 shadow-xl border border-slate-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PM Surya Ghar: Muft Bijli Yojana Approved</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {lead.name}&apos;s Rooftop Solar Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 flex flex-wrap items-center gap-2 font-medium">
              <span>MSEDCL Consumer: <strong className="text-white font-mono">{lead.billExtraction?.consumerNumber || "410019283741"}</strong></span>
              <span>•</span>
              <span>Ref Code: <strong className="text-amber-400 font-mono">{lead.id}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PDF Quote</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Story Numbers */}
        <div className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Box 1: System Size */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>System Size</span>
              <Sun className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
              {selectedKw} <span className="text-base font-normal text-slate-300">kW</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Generates ~{currentQuote.annualGenerationUnits.toLocaleString()} units/yr
            </p>
          </div>

          {/* Box 2: Govt Subsidy */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Govt Subsidy (DBT)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono">
              {formatCurrency(currentQuote.subsidyAmount)}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Direct transfer to your bank account
            </p>
          </div>

          {/* Box 3: Net Cost to Homeowner */}
          <div className="bg-amber-500/25 border border-amber-400/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Net Cost To You</span>
              <IndianRupee className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white font-mono">
              {formatCurrency(currentQuote.netCost)}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Gross: <span className="line-through">{formatCurrency(currentQuote.grossCost)}</span>
            </p>
          </div>

          {/* Box 4: Payback Period */}
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Payback Breakeven</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-blue-400 font-mono">
              {currentQuote.paybackYears} <span className="text-base font-normal text-slate-300">Years</span>
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Free power for next 22 years
            </p>
          </div>
        </div>
      </div>

      {/* BEFORE VS AFTER SOLAR BILL COMPARISON CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Monthly Electricity Bill: Before vs. After Solar
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Net-metering allows you to bank surplus solar units with MSEDCL during daytime and use them at night.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            Saves {formatCurrency(currentQuote.annualSavings)} / year
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Solar */}
          <div className="p-6 rounded-3xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/80 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold text-red-900 dark:text-red-300">
              <span className="text-sm">Today (Without Solar)</span>
              <span className="text-[11px] bg-red-200 dark:bg-red-900/60 text-red-800 dark:text-red-200 px-2.5 py-0.5 rounded-full uppercase font-bold">
                Current Cost
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-red-950 dark:text-red-200 font-mono">
                {formatCurrency(lead.monthlyBill)}
              </span>
              <span className="text-xs text-red-700 dark:text-red-300 font-semibold">/ month</span>
            </div>
            <div className="w-full bg-red-200 dark:bg-red-900/40 h-3 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full w-full" />
            </div>
            <p className="text-xs text-red-800 dark:text-red-300 font-medium">
              You pay approx <strong>{formatCurrency(lead.monthlyBill * 12)} per year</strong> to MSEDCL at escalating residential slab tariffs.
            </p>
          </div>

          {/* After Solar */}
          <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold text-emerald-900 dark:text-emerald-300">
              <span className="text-sm">With {selectedKw} kW Rooftop Solar</span>
              <span className="text-[11px] bg-emerald-200 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 px-2.5 py-0.5 rounded-full uppercase font-bold">
                Net Metering
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 dark:text-emerald-300 font-mono">₹120</span>
              <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">/ month (MSEDCL fixed grid fee only)</span>
            </div>
            <div className="w-full bg-emerald-200 dark:bg-emerald-900/40 h-3 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-[4%]" />
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-medium">
              Your electricity units are offset 100% by solar. You only pay nominal grid connection charges.
            </p>
          </div>
        </div>
      </div>

      {/* REAL-TIME CAPACITY SLIDER WITH VISUAL ROOFTOP SIMULATION */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-amber-500" />
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                Interactive Solar Capacity Simulator
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
              Drag to see how government subsidy, system cost, and monthly generation adjust dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 dark:bg-amber-950/60 rounded-2xl border border-amber-500/30 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold font-mono">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>{selectedKw} kW Selected (~{selectedKw * 100} sq. ft. roof required)</span>
          </div>
        </div>

        {/* Custom Range Slider */}
        <div className="space-y-2 pt-2">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={selectedKw}
            onChange={(e) => setSelectedKw(Number(e.target.value))}
            className="w-full h-3.5 bg-slate-200 dark:bg-slate-800 rounded-xl appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />
          <div className="flex justify-between text-xs font-mono text-slate-500 dark:text-slate-400 font-bold pt-1.5">
            <span>1 kW</span>
            <span>2 kW</span>
            <span className="text-amber-600 dark:text-amber-400 font-black">3 kW (Max Subsidy)</span>
            <span>5 kW</span>
            <span>7 kW</span>
            <span>10 kW</span>
          </div>
        </div>

        {/* Visual Milestone Badges for Capacities */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium">Mono Panels</span>
            <span className="font-black font-mono text-slate-900 dark:text-white text-sm sm:text-base">
              {Math.ceil((selectedKw * 1000) / 550)} Panels (550W)
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium">Daily Generation</span>
            <span className="font-black font-mono text-slate-900 dark:text-white text-sm sm:text-base">
              ~{((selectedKw * 1400) / 365).toFixed(1)} kWh/Day
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium">CO₂ Offset / Year</span>
            <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
              ~{((selectedKw * 1400 * 0.82) / 1000).toFixed(1)} Tonnes
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-slate-500 dark:text-slate-400 block text-xs font-medium">25-Yr Net Profit</span>
            <span className="font-black font-mono text-emerald-600 dark:text-emerald-400 text-sm sm:text-base">
              {formatCurrency(currentQuote.lifetimeSavings25Yrs)}
            </span>
          </div>
        </div>
      </div>

      {/* LIVE ANIMATED SOLAR ENERGY FLOW SIMULATOR */}
      <AnimatedEnergyFlow systemSizeKw={selectedKw} />

      {/* 25-YEAR INVESTMENT TIMELINE & BREAKEVEN CHART */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            25-Year Cumulative Savings & Breakeven Point
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
            Your investment breaks even at <strong>Year {currentQuote.paybackYears}</strong>. Every unit generated after that is 100% pure profit.
          </p>
        </div>

        {/* Visual Cumulative Bar Chart */}
        <div className="space-y-3 pt-2">
          {roiYears.map((yr) => {
            const isBreakeven = yr === 3.2;
            const savingsAtYear = Math.round(currentQuote.annualSavings * yr);
            const netAtYear = savingsAtYear - currentQuote.netCost;
            const isProfitable = netAtYear >= 0;

            return (
              <div key={yr} className="flex items-center gap-3 text-xs sm:text-sm">
                <span className="w-20 font-mono font-bold text-slate-700 dark:text-slate-300 shrink-0">
                  Year {yr}
                </span>

                <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-7 rounded-xl overflow-hidden relative flex items-center">
                  <div
                    className={`h-full rounded-xl transition-all duration-700 ${
                      isBreakeven
                        ? "bg-amber-500"
                        : isProfitable
                        ? "bg-emerald-600"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(10, (savingsAtYear / (currentQuote.annualSavings * 25)) * 100))}%`,
                    }}
                  />
                  <span className="absolute left-3 font-mono text-xs font-bold text-slate-900 dark:text-white drop-shadow-sm">
                    {formatCurrency(savingsAtYear)}
                  </span>
                </div>

                <div className="w-32 text-right shrink-0">
                  {isBreakeven ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      ★ Breakeven!
                    </span>
                  ) : (
                    <span
                      className={`font-mono text-xs sm:text-sm font-bold ${
                        isProfitable ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      {isProfitable ? `+${formatCurrency(netAtYear)}` : `-${formatCurrency(Math.abs(netAtYear))}`}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HARDWARE SPECIFICATIONS & WARRANTY GUARANTEES */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-amber-400 font-mono text-xs uppercase tracking-wider font-bold">
              Turnkey Equipment Standards
            </span>
            <h3 className="text-xl font-bold text-white mt-0.5">
              Tier-1 Hardware & Comprehensive Warranties
            </h3>
          </div>
          <Layers className="w-6 h-6 text-slate-600 hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="font-bold text-amber-400 block text-sm">Mono PERC Bifacial Panels</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              High-efficiency 550W+ half-cut panels certified for high-temperature Vidarbha climates.
            </p>
            <div className="text-xs font-mono font-bold text-emerald-400 pt-1">
              ✓ 25-Year Performance Warranty
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="font-bold text-amber-400 block text-sm">On-Grid Smart Inverter</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              BIS-approved IP65 string inverter with integrated Wi-Fi generation tracking and remote diagnostics.
            </p>
            <div className="text-xs font-mono font-bold text-emerald-400 pt-1">
              ✓ 10-Year Comprehensive Warranty
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
            <span className="font-bold text-amber-400 block text-sm">GI Hot-Dip Structure & Meter</span>
            <p className="text-slate-300 text-xs leading-relaxed">
              Corrosion-resistant mounting engineered for 150 km/h wind speeds, with bi-directional net-meter.
            </p>
            <div className="text-xs font-mono font-bold text-emerald-400 pt-1">
              ✓ 5-Year Comprehensive Maintenance
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden shadow-sm">
        <div>
          <h4 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            Confirm Your Rooftop Survey
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Reference code <strong className="font-mono text-amber-600 dark:text-amber-400">{lead.id}</strong> has been assigned to our Somalwada/Wardha Road solar engineer.
          </p>
        </div>

        <Link
          href={`/track/${lead.id}`}
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span>Open Live Milestone Tracker</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
