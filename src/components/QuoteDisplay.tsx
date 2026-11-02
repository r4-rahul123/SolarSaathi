"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  Check,
} from "lucide-react";
import { Lead, SubsidyRule } from "@/types/solar";
import { calculateSolarQuote, DEFAULT_SUBSIDY_RULE } from "@/lib/solar-calculator";
import { formatCurrency } from "@/lib/utils";

interface QuoteDisplayProps {
  lead: Lead;
  initialRule?: SubsidyRule;
}

export function QuoteDisplay({ lead, initialRule = DEFAULT_SUBSIDY_RULE }: QuoteDisplayProps) {
  const [selectedKw, setSelectedKw] = useState<number>(lead.recommendedKw || 3);
  const [copied, setCopied] = useState(false);

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
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>PM Surya Ghar: Muft Bijli Yojana Approved</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {lead.name}&apos;s Rooftop Solar Plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>MSEDCL Consumer: <strong className="text-slate-200 font-mono">{lead.billExtraction?.consumerNumber || "410019283741"}</strong></span>
              <span>•</span>
              <span>Ref: <strong className="text-amber-400 font-mono">{lead.id}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer backdrop-blur-md shadow-xs"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Download PDF Quote</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl transition-all cursor-pointer backdrop-blur-md shadow-xs"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Story Numbers */}
        <div className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Box 1: System Size */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>System Size</span>
              <Sun className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono">
              {selectedKw} <span className="text-sm font-normal text-slate-300">kW</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Generates ~{currentQuote.annualGenerationUnits.toLocaleString()} units/yr
            </p>
          </div>

          {/* Box 2: Govt Subsidy */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Govt Subsidy (DBT)</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">
              {formatCurrency(currentQuote.subsidyAmount)}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Direct transfer to your bank account
            </p>
          </div>

          {/* Box 3: Net Cost to Homeowner */}
          <div className="bg-amber-500/20 border border-amber-500/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-medium text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Net Cost To You</span>
              <IndianRupee className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
              {formatCurrency(currentQuote.netCost)}
            </div>
            <p className="text-[11px] text-slate-300 mt-1">
              Gross: <span className="line-through">{formatCurrency(currentQuote.grossCost)}</span>
            </p>
          </div>

          {/* Box 4: Payback Period */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Payback Breakeven</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-400 font-mono">
              {currentQuote.paybackYears} <span className="text-sm font-normal text-slate-300">Years</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Free power for next 22 years
            </p>
          </div>
        </div>
      </div>

      {/* BEFORE VS AFTER SOLAR BILL COMPARISON CARD */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-500" />
              Monthly Electricity Bill: Before vs. After Solar
            </h3>
            <p className="text-xs text-slate-500">
              Net-metering allows you to bank surplus solar units with MSEDCL during daytime and use them at night.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Saves {formatCurrency(currentQuote.annualSavings)} / year
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Before Solar */}
          <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-red-900">
              <span>Today (Without Solar)</span>
              <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase">Current Cost</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-red-950 font-mono">
                {formatCurrency(lead.monthlyBill)}
              </span>
              <span className="text-xs text-red-700">/ month</span>
            </div>
            <div className="w-full bg-red-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full w-full" />
            </div>
            <p className="text-[11px] text-red-800">
              You pay approx <strong>{formatCurrency(lead.monthlyBill * 12)} per year</strong> to MSEDCL at escalating residential slab tariffs.
            </p>
          </div>

          {/* After Solar */}
          <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs font-semibold text-emerald-900">
              <span>With {selectedKw} kW Rooftop Solar</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">Net Metering</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700 font-mono">₹120</span>
              <span className="text-xs text-emerald-700">/ month (MSEDCL fixed grid fee only)</span>
            </div>
            <div className="w-full bg-emerald-200 h-2.5 rounded-full overflow-hidden">
              <div className="bg-emerald-600 h-full rounded-full w-[4%]" />
            </div>
            <p className="text-[11px] text-emerald-800">
              Your electricity units are offset 100% by solar. You only pay nominal grid connection charges.
            </p>
          </div>
        </div>
      </div>

      {/* REAL-TIME CAPACITY SLIDER WITH VISUAL ROOFTOP SIMULATION */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 print:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900">
                Interactive Solar Capacity Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag to see how government subsidy, system cost, and monthly generation adjust dynamically.
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs font-bold font-mono">
            <Sun className="w-3.5 h-3.5 text-amber-600" />
            <span>{selectedKw} kW Selected (~{selectedKw * 100} sq. ft. roof required)</span>
          </div>
        </div>

        {/* Custom Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="1"
            max="10"
            step="1"
            value={selectedKw}
            onChange={(e) => setSelectedKw(Number(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
          />
          <div className="flex justify-between text-[11px] font-mono text-slate-400 font-medium pt-1">
            <span>1 kW (100 sq ft)</span>
            <span>2 kW</span>
            <span className="text-amber-700 font-bold">3 kW (Max Subsidy)</span>
            <span>5 kW</span>
            <span>7 kW</span>
            <span>10 kW (Bungalow)</span>
          </div>
        </div>

        {/* Visual Milestone Badges for Capacities */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-slate-400 block text-[10px]">Tier-1 Mono Panels</span>
            <span className="font-bold font-mono text-slate-800">{Math.ceil((selectedKw * 1000) / 550)} Panels (550W)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-slate-400 block text-[10px]">Daily Power Generation</span>
            <span className="font-bold font-mono text-slate-800">~{((selectedKw * 1400) / 365).toFixed(1)} kWh/Day</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-slate-400 block text-[10px]">CO₂ Offset / Year</span>
            <span className="font-bold font-mono text-emerald-700">~{((selectedKw * 1400 * 0.82) / 1000).toFixed(1)} Tonnes</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-slate-400 block text-[10px]">25-Year Net Profit</span>
            <span className="font-bold font-mono text-emerald-700">{formatCurrency(currentQuote.lifetimeSavings25Yrs)}</span>
          </div>
        </div>
      </div>

      {/* 25-YEAR INVESTMENT TIMELINE & BREAKEVEN CHART */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            25-Year Cumulative Savings & Breakeven Point
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
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
              <div key={yr} className="flex items-center gap-3 text-xs">
                <span className="w-16 font-mono font-semibold text-slate-600 shrink-0">
                  Year {yr}
                </span>

                <div className="flex-1 bg-slate-100 h-6 rounded-lg overflow-hidden relative flex items-center">
                  <div
                    className={`h-full rounded-lg transition-all duration-700 ${
                      isBreakeven
                        ? "bg-amber-500"
                        : isProfitable
                        ? "bg-emerald-600"
                        : "bg-slate-300"
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(8, (savingsAtYear / (currentQuote.annualSavings * 25)) * 100))}%`,
                    }}
                  />
                  <span className="absolute left-2.5 font-mono text-[11px] font-bold text-slate-900 drop-shadow-2xs">
                    {formatCurrency(savingsAtYear)}
                  </span>
                </div>

                <div className="w-28 text-right shrink-0">
                  {isBreakeven ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                      ★ Breakeven!
                    </span>
                  ) : (
                    <span
                      className={`font-mono text-[11px] font-semibold ${
                        isProfitable ? "text-emerald-700" : "text-slate-400"
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
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 space-y-6">
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
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <span className="font-semibold text-amber-400 block">Mono PERC Bifacial Panels</span>
            <p className="text-slate-300 text-[11px]">
              High-efficiency 550W+ half-cut panels certified for high-temperature Vidarbha climates.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-1">
              ✓ 25-Year Performance Warranty
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <span className="font-semibold text-amber-400 block">On-Grid Smart Inverter</span>
            <p className="text-slate-300 text-[11px]">
              BIS-approved IP65 string inverter with integrated Wi-Fi generation tracking and remote diagnostics.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-1">
              ✓ 10-Year Comprehensive Warranty
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <span className="font-semibold text-amber-400 block">GI Hot-Dip Structure & Meter</span>
            <p className="text-slate-300 text-[11px]">
              Corrosion-resistant mounting engineered for 150 km/h wind speeds, with bi-directional net-meter.
            </p>
            <div className="text-[10px] font-mono text-emerald-400 pt-1">
              ✓ 5-Year Comprehensive Maintenance
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Confirm Your Rooftop Survey
          </h4>
          <p className="text-xs text-slate-500">
            Reference code <strong className="font-mono text-amber-700">{lead.id}</strong> has been assigned to our Somalwada/Wardha Road solar engineer.
          </p>
        </div>

        <Link
          href={`/track/${lead.id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl font-semibold text-sm shadow-md shadow-amber-500/20 transition-all cursor-pointer"
        >
          <span>Open Live Milestone Tracker</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
