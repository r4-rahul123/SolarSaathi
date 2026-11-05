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
  Award,
  Layers,
  Check,
} from "lucide-react";
import { Lead, SubsidyRule, QuoteOption } from "@/types/solar";
import { calculateSolarQuote, DEFAULT_SUBSIDY_RULE } from "@/lib/solar-calculator";
import { formatCurrency } from "@/lib/utils";
import { AnimatedEnergyFlow } from "./AnimatedEnergyFlow";
import { useLanguage } from "@/context/LanguageContext";

interface QuoteDisplayProps {
  lead: Lead;
  initialRule?: SubsidyRule;
}

export function QuoteDisplay({ lead, initialRule = DEFAULT_SUBSIDY_RULE }: QuoteDisplayProps) {
  const { t } = useLanguage();
  const [selectedKw, setSelectedKw] = useState<number>(lead.recommendedKw || 3);
  const [copied, setCopied] = useState(false);
  const [isAccepted, setIsAccepted] = useState(lead.quote?.status === "APPROVED");

  const quote = calculateSolarQuote(lead.id, selectedKw, initialRule);

  // Trigger celebration confetti on quote generation
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#198754", "#123D2B", "#f59e0b", "#ffffff"],
      });
    } catch (e) {
      // Graceful fallback
    }
  }, []);

  const handleCopyLink = () => {
    const url = `${window.location.origin}/track/${lead.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptQuote = async () => {
    setIsAccepted(true);
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors: ["#198754", "#10b981", "#f59e0b"],
    });

    try {
      await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QUOTATION_APPROVED",
          recommendedKw: selectedKw,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const activeOption = quote.options.find((o) => o.systemSizeKw === selectedKw) || quote.options[2];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Hero Story Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123D2B] via-[#0E2F21] to-[#0A2218] text-white p-6 sm:p-10 shadow-xl border border-emerald-900/60">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>SolarSaathi Certified • PM Surya Ghar Subsidy Engine</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {lead.name}&apos;s Rooftop Solar Quotation
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 flex flex-wrap items-center gap-2 font-medium">
              <span>MSEDCL Consumer: <strong className="text-white font-mono">{lead.billExtraction?.consumerNumber || "410019283741"}</strong></span>
              <span>•</span>
              <span>Project Ref: <strong className="text-amber-400 font-mono">{lead.id}</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 print:hidden w-full sm:w-auto">
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>{t("downloadPdf")}</span>
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

        {/* 4 Core Summary Metrics */}
        <div className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>Selected Plant</span>
              <Sun className="w-4 h-4 text-amber-400 animate-spin" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
              {activeOption.systemSizeKw} <span className="text-base font-normal text-slate-300">kW</span>
            </div>
            <p className="text-xs text-emerald-100/70 mt-1 font-medium">
              Generates ~{activeOption.annualGenerationUnits.toLocaleString()} units/yr
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{t("subsidy")}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-emerald-400 font-mono">
              {formatCurrency(activeOption.subsidyAmount)}
            </div>
            <p className="text-xs text-emerald-100/70 mt-1 font-medium">
              Direct transfer to your bank account
            </p>
          </div>

          <div className="bg-amber-500/20 border border-amber-400/40 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{t("netCost")}</span>
              <IndianRupee className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-white font-mono">
              {formatCurrency(activeOption.netCost)}
            </div>
            <p className="text-xs text-slate-300 mt-1 font-medium">
              Gross: <span className="line-through">{formatCurrency(activeOption.installationCost)}</span>
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{t("payback")}</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-blue-400 font-mono">
              {activeOption.paybackYears} <span className="text-base font-normal text-slate-300">{t("years")}</span>
            </div>
            <p className="text-xs text-emerald-100/70 mt-1 font-medium">
              Free power for next 21+ years
            </p>
          </div>
        </div>
      </div>

      {/* SIDE-BY-SIDE 3-OPTION SOLAR COMPARISON (1 kW, 2 kW, 3 kW) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F3EC] dark:bg-emerald-950/80 text-[#123D2B] dark:text-emerald-300 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-[#198754]" />
              <span>Multi-Tier System Sizing Comparison</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              Choose Your Solar Capacity Option
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Compare installation costs, government subsidies, and payback periods side by side:
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <span>Rule Snapshot: <strong className="text-emerald-700 dark:text-emerald-400">{quote.subsidyRuleId}</strong></span>
          </div>
        </div>

        {/* The 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quote.options.map((opt) => {
            const isSelected = opt.systemSizeKw === selectedKw;

            return (
              <div
                key={opt.systemSizeKw}
                onClick={() => setSelectedKw(opt.systemSizeKw)}
                className={`rounded-3xl p-6 border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? "border-[#198754] bg-[#E7F3EC]/30 dark:bg-emerald-950/30 shadow-lg scale-[1.02]"
                    : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-slate-950"
                }`}
              >
                {opt.systemSizeKw === 3 && (
                  <div className="absolute -top-3.5 right-6 bg-[#198754] text-white text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    ★ Best Value (Max Subsidy)
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Option {opt.systemSizeKw}
                    </span>
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        isSelected
                          ? "bg-[#198754] text-white"
                          : "border border-slate-300 dark:border-slate-700 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </div>

                  <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                    {opt.systemSizeKw} kW <span className="text-sm font-normal text-slate-500">Plant</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Needs ~{opt.systemSizeKw * 100} sq. ft. shadow-free roof
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Installation Cost:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(opt.installationCost)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Central Subsidy:</span>
                      <span className="font-mono font-bold text-[#198754] dark:text-emerald-400">
                        - {formatCurrency(opt.subsidyAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sm">
                      <span className="text-slate-900 dark:text-white">Net Payable:</span>
                      <span className="font-mono text-[#123D2B] dark:text-emerald-300">
                        {formatCurrency(opt.netCost)}
                      </span>
                    </div>
                  </div>

                  {/* Generation & Savings */}
                  <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs space-y-1.5 font-medium border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Yearly Generation:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{opt.annualGenerationUnits} Units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Annual Savings:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(opt.annualSavings)}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payback Period:</span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">{opt.paybackYears} Years</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#198754] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? "✓ Selected Option" : "Select This Plan"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIVE ANIMATED SOLAR ENERGY FLOW SIMULATOR */}
      <AnimatedEnergyFlow systemSizeKw={selectedKw} />

      {/* CUSTOMER QUOTATION ACCEPTANCE ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs uppercase font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-[#123D2B] dark:text-emerald-300">
              Selected: {selectedKw} kW System ({formatCurrency(activeOption.netCost)})
            </span>
          </div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white">
            {isAccepted ? "Quotation Accepted! Next: Site Survey Assignment" : "Accept Quotation & Initiate Project"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Lock in your ₹78,000 subsidy allocation. SolarSaathi will assign our Nagpur site engineer for structural confirmation.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {!isAccepted ? (
            <button
              onClick={handleAcceptQuote}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#198754] hover:bg-[#123D2B] text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Accept Quotation</span>
            </button>
          ) : (
            <Link
              href={`/track/${lead.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#123D2B] hover:bg-[#198754] text-white rounded-2xl font-black text-sm shadow-lg transition-all"
            >
              <span>View Live Project Tracker</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
