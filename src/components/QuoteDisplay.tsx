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

  return (
    <div className="space-y-8">
      {/* Printable Quote Wrapper */}
      <div id="printable-quote" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Solar Feasibility & Subsidy Approved</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              Personalized Rooftop Solar Quote
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Prepared for <strong className="text-slate-800">{lead.name}</strong> • Reference:{" "}
              <span className="font-mono text-amber-700 font-semibold">{lead.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download / Print Quote</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? "Link Copied!" : "Share Link"}</span>
            </button>
          </div>
        </div>

        {/* Homeowner Simple Story (The Heart of the Quote) */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-3">
            The Financial Story • Your 25-Year Investment
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Box 1: Recommended Size */}
            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-amber-800 mb-1">
                <span className="text-xs font-medium">Recommended System</span>
                <Sun className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-3xl font-extrabold text-amber-950 font-mono">
                {selectedKw} <span className="text-base font-normal">kW</span>
              </div>
              <p className="text-[11px] text-amber-700 mt-1">
                Covers ~{currentQuote.annualGenerationUnits} units/yr of your power consumption.
              </p>
            </div>

            {/* Box 2: Central Subsidy */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-emerald-800 mb-1">
                <span className="text-xs font-medium">PM Surya Ghar Subsidy</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl font-extrabold text-emerald-700 font-mono">
                {formatCurrency(currentQuote.subsidyAmount)}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                Direct DBT transfer to your bank account post net-metering.
              </p>
            </div>

            {/* Box 3: Net Payable */}
            <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="text-xs font-medium">Net Cost to You</span>
                <IndianRupee className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono">
                {formatCurrency(currentQuote.netCost)}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Gross: <span className="line-through">{formatCurrency(currentQuote.grossCost)}</span> (Inclusive of GST & Meter)
              </p>
            </div>

            {/* Box 4: Payback Period */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4">
              <div className="flex items-center justify-between text-blue-800 mb-1">
                <span className="text-xs font-medium">Payback Period</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-blue-950 font-mono">
                {currentQuote.paybackYears} <span className="text-base font-normal">Years</span>
              </div>
              <p className="text-[11px] text-blue-700 mt-1">
                100% ROI in ~{Math.round(currentQuote.paybackYears * 12)} months; free power for remaining 22 years!
              </p>
            </div>
          </div>
        </div>

        {/* Real-time System Capacity Slider */}
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-xl p-5 print:hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-600" />
              <label htmlFor="kw-slider" className="text-sm font-semibold text-slate-800">
                Adjust Solar Capacity (kW)
              </label>
              <span className="text-xs text-slate-500">
                (AI suggested: {lead.recommendedKw} kW based on your {lead.avgUnitsPerMonth} units/month)
              </span>
            </div>
            <span className="font-mono font-bold text-amber-600 text-base">
              {selectedKw} kW Solar Plant
            </span>
          </div>

          <input
            id="kw-slider"
            type="range"
            min="1"
            max="10"
            step="1"
            value={selectedKw}
            onChange={(e) => setSelectedKw(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />

          <div className="flex justify-between text-[11px] font-mono text-slate-400 mt-1.5">
            <span>1 kW (Small Home)</span>
            <span>3 kW (Standard 2-3 BHK)</span>
            <span>5 kW (Bungalow)</span>
            <span>10 kW (Commercial/Large)</span>
          </div>
        </div>

        {/* Detailed Technical & Generation Breakdown */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              Annual Generation & Savings
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Benchmark Solar Generation</span>
                <span className="font-mono font-medium text-slate-900">
                  1,400 Units / kW / Year (Vidarbha)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Expected Annual Generation</span>
                <span className="font-mono font-semibold text-emerald-600">
                  {currentQuote.annualGenerationUnits.toLocaleString()} kWh (Units)
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Estimated Monthly Savings</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(currentQuote.monthlySavings)} / month
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Estimated Annual Electricity Savings</span>
                <span className="font-mono font-semibold text-slate-900">
                  {formatCurrency(currentQuote.annualSavings)} / year
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">25-Year Lifetime Net Profit</span>
                <span className="font-mono font-bold text-emerald-700">
                  {formatCurrency(currentQuote.lifetimeSavings25Yrs)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider font-semibold text-slate-500 mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-500" />
              Cost & Subsidy Breakdown
            </h4>
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Base System Cost ({selectedKw} kW @ ₹60,000/kW)</span>
                <span className="font-mono font-medium text-slate-900">
                  {formatCurrency(currentQuote.grossCost)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Central Residential Scheme Subsidy</span>
                <span className="font-mono font-semibold text-emerald-600">
                  - {formatCurrency(currentQuote.subsidyAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Net Payable Post-Subsidy</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {formatCurrency(currentQuote.netCost)}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Applicable Subsidy Scheme</span>
                <span className="font-medium text-slate-700">{initialRule.name}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-600">Subsidy Rule Effective Date</span>
                <span className="font-mono text-slate-600">{initialRule.effectiveFrom} to {initialRule.effectiveTo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Call to Action & Track */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="text-center sm:text-left">
            <h4 className="text-sm font-semibold text-slate-900">
              Ready to install rooftop solar?
            </h4>
            <p className="text-xs text-slate-500">
              Our site surveyor can visit your Nagpur rooftop to verify shadow-free area and load sanction.
            </p>
          </div>

          <Link
            href={`/track/${lead.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium text-sm shadow-sm transition-colors"
          >
            <span>Track Application Progress</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
