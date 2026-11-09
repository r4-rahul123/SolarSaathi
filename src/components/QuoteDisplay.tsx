"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PanelsTopLeft,
  IndianRupee,
  Calendar,
  CheckCircle2,
  Download,
  Share2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Check,
} from "lucide-react";
import { Lead } from "@/types/solar";
import { calculateSolarQuote, DEFAULT_SUBSIDY_RULE } from "@/lib/solar-calculator";
import { formatCurrency } from "@/lib/utils";
import { AnimatedEnergyFlow } from "./AnimatedEnergyFlow";
import { SolarQuotationDocument } from "./SolarQuotationDocument";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { calculateCapacityCoverage, getMaximumQuotedSystemKw, selectQuotationOption } from "@/lib/quotation-utils";
import { SystemCapacityReviewWarning } from "@/components/SystemCapacityReviewWarning";

interface QuoteDisplayProps {
  lead: Lead;
  isPreview?: boolean;
  onSaveEstimate?: () => void;
  isSavingEstimate?: boolean;
}

export function QuoteDisplay({ lead, isPreview = false, onSaveEstimate, isSavingEstimate = false }: QuoteDisplayProps) {
  const { t } = useLanguage();
  const { user, setIsAuthModalOpen } = useAuth();
  const [selectedKw, setSelectedKw] = useState<number>(lead.recommendedKw || 3);
  const [copied, setCopied] = useState(false);
  const [isAccepted, setIsAccepted] = useState(lead.quote?.status === "APPROVED");
  const [isAccepting, setIsAccepting] = useState(false);
  const [actionError, setActionError] = useState("");

  const quote = lead.quote || calculateSolarQuote(lead.id, lead.recommendedKw, DEFAULT_SUBSIDY_RULE);
  const monthlyConsumption = lead.avgUnitsPerMonth ?? lead.billExtraction?.monthlyUnits;
  const maximumSystemKw = getMaximumQuotedSystemKw(quote.options);

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/track/${lead.id}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setActionError("");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setActionError(t("copyLinkFailed"));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAcceptQuote = async () => {
    if (!user) {
      setIsAuthModalOpen(true);
      setActionError(t("signInToAcceptHelp"));
      return;
    }
    setIsAccepting(true);
    setActionError("");
    try {
      const response = await fetch(`/api/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "QUOTATION_APPROVED",
          recommendedKw: selectedKw,
        }),
      });
      if (!response.ok) throw new Error(t("saveResponseFailed"));
      setIsAccepted(true);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t("saveResponseFailed"));
    } finally {
      setIsAccepting(false);
    }
  };

  const activeOption = selectQuotationOption(quote.options, selectedKw);
  const selectedUsageCoverage = calculateCapacityCoverage(
    monthlyConsumption,
    quote.ruleSnapshot?.generationFactor,
    activeOption.systemSizeKw,
  )?.coveragePercent ?? null;

  return (
    <>
      <div className="print:hidden space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Hero Story Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#123D2B] via-[#0E2F21] to-[#0A2218] text-white p-6 sm:p-10 shadow-xl border border-emerald-900/60">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{t("estimatePreview")}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              {isPreview ? t("quotePreviewTitle") : `${lead.name}${t("quoteTitleSuffix")}`}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1 flex flex-wrap items-center gap-2 font-medium">
              {isPreview ? <span>{t("estimatePreviewHint")}</span> : <span>{t("projectReference")} <strong className="text-amber-400 font-mono">{lead.id}</strong></span>}
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
            {!isPreview && <button
              onClick={handleCopyLink}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl transition-all cursor-pointer backdrop-blur-md shadow-sm"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>{copied ? t("linkCopied") : t("shareLink")}</span>
            </button>}
          </div>
        </div>

        {/* 4 Core Summary Metrics */}
        <div className="relative z-10 mt-8 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{t("selectedSystem")}</span>
              <PanelsTopLeft className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono">
              {activeOption.systemSizeKw} <span className="text-base font-normal text-slate-300">kW</span>
            </div>
            <p className="text-xs text-emerald-100/70 mt-1 font-medium">
              {t("generatesAbout")}{activeOption.annualGenerationUnits.toLocaleString()} {t("unitsPerYear")}
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
              {t("subjectToEligibility")}
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
              {t("gross")} <span className="line-through">{formatCurrency(activeOption.installationCost)}</span>
            </p>
          </div>

          <div className="bg-white/10 border border-white/15 rounded-2xl p-4 sm:p-5 backdrop-blur-md">
            <div className="text-[11px] font-bold text-emerald-200 uppercase tracking-wider mb-1 flex items-center justify-between">
              <span>{t("payback")}</span>
              <Calendar className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl sm:text-4xl font-black text-blue-400 font-mono">
              {activeOption.paybackYears === null ? t("notCalculable") : <>{activeOption.paybackYears} <span className="text-base font-normal text-slate-300">{t("years")}</span></>}
            </div>
            <p className="text-xs text-emerald-100/70 mt-1 font-medium">
              {t("basedOnAssumptions")}
            </p>
          </div>
        </div>
      </div>

      <SystemCapacityReviewWarning
        monthlyConsumption={monthlyConsumption}
        generationPerKwYear={quote.ruleSnapshot?.generationFactor}
        maximumSystemKw={maximumSystemKw}
      />

      {/* SIDE-BY-SIDE 3-OPTION SOLAR COMPARISON (1 kW, 2 kW, 3 kW) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F3EC] dark:bg-emerald-950/80 text-[#123D2B] dark:text-emerald-300 text-xs font-bold mb-2">
              <Zap className="w-3.5 h-3.5 text-[#198754]" />
              <span>{t("sizingComparison")}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              {t("chooseCapacity")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t("compareOptionsDescription")}
            </p>
          </div>

          <span className="text-xs font-medium text-slate-400">{t("basedOnEstimateAssumptions")}</span>
        </div>

        {/* The 3 Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {quote.options.map((opt) => {
            const isSelected = opt.systemSizeKw === selectedKw;

            return (
              <div
                key={opt.systemSizeKw}
                className={`rounded-3xl p-6 border-2 transition-all relative flex flex-col justify-between ${
                  isSelected
                    ? "border-[#198754] bg-[#E7F3EC]/30 dark:bg-emerald-950/30 shadow-lg scale-[1.02]"
                    : "border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-white dark:bg-slate-950"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {t("optionLabel")} {opt.systemSizeKw}
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
                    {opt.systemSizeKw} kW <span className="text-sm font-normal text-slate-500">{t("plant")}</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {t("roofAreaNeeded")}{opt.systemSizeKw * 100} {t("shadowFreeRoof")}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="mt-5 space-y-2.5 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t("installationCostLabel")}</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(opt.installationCost)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">{t("centralSubsidy")}</span>
                      <span className="font-mono font-bold text-[#198754] dark:text-emerald-400">
                        - {formatCurrency(opt.subsidyAmount)}
                      </span>
                    </div>

                    <div className="flex justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-bold text-sm">
                      <span className="text-slate-900 dark:text-white">{t("estimatedCostAfterSubsidy")}</span>
                      <span className="font-mono text-[#123D2B] dark:text-emerald-300">
                        {formatCurrency(opt.netCost)}
                      </span>
                    </div>
                  </div>

                  {/* Generation & Savings */}
                  <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-xs space-y-1.5 font-medium border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("yearlyGeneration")}</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{opt.annualGenerationUnits} {t("units")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("estimatedAnnualOffset")}</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(opt.annualSavings)}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">{t("paybackPeriod")}</span>
                      <span className="font-mono font-black text-blue-600 dark:text-blue-400">{opt.paybackYears === null ? t("notCalculable") : `${opt.paybackYears} ${t("years")}`}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <button
                    type="button"
                    onClick={() => setSelectedKw(opt.systemSizeKw)}
                    aria-pressed={isSelected}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#198754] text-white shadow-xs"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected ? t("selectedOption") : t("selectPlan")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-semibold text-slate-900 dark:text-white">{t("howEstimateCalculated")}</h3>
        {selectedUsageCoverage !== null && (
          <p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">
            {t("selectedBenchmark")} {selectedKw} {t("benchmarkGenerationAbout")} {selectedUsageCoverage}% {t("enteredUnits")}
          </p>
        )}
        <p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">
          {t("generationUses")} {quote.ruleSnapshot.generationFactor.toLocaleString()} {t("unitsPerKwYear")} {formatCurrency(quote.ruleSnapshot.tariffAssumption)} {t("perUnit")}
        </p>
        <p className="mt-2 leading-6 text-slate-600 dark:text-slate-400">
          {t("subsidyDisclaimer")}
        </p>
      </div>

      <AnimatedEnergyFlow
        systemSizeKw={selectedKw}
        annualGenerationUnits={activeOption.annualGenerationUnits}
      />

      {/* CUSTOMER QUOTATION ACCEPTANCE ACTION BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5 shadow-sm print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-xs uppercase font-mono px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-[#123D2B] dark:text-emerald-300">
              {t("selectedSystemCost")} {selectedKw} kW {t("system")} ({formatCurrency(activeOption.netCost)})
            </span>
          </div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white">
            {isPreview ? t("wantKeepEstimate") : isAccepted ? t("quotationAccepted") : t("acceptQuotationStartProject")}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            {isPreview ? t("signInSaveLater") : t("estimateNotOrder")}
          </p>
          {actionError && <p role="alert" className="mt-2 text-xs font-medium text-red-600">{actionError}</p>}
        </div>

        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
          {isPreview ? <button type="button" onClick={onSaveEstimate} disabled={isSavingEstimate} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#198754] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#123D2B] disabled:opacity-60">
            {isSavingEstimate ? t("saving") : user ? t("saveEstimateMyProjects") : t("signInSaveEstimate")}
          </button> : !isAccepted ? (
            user ? <button
                onClick={handleAcceptQuote}
                disabled={isAccepting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#198754] hover:bg-[#123D2B] text-white rounded-2xl font-black text-sm shadow-lg shadow-emerald-900/20 transition-all hover:scale-[1.02] cursor-pointer disabled:opacity-60"
              >
                <Check className="w-4 h-4" />
                <span>{isAccepting ? t("saving") : t("acceptEstimateNextStep")}</span>
              </button> : <>
                <Link href={`/login?next=${encodeURIComponent(`/track/${lead.id}`)}`} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-[#198754] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#123D2B]">{t("signInAccept")}</Link>
                <Link href={`/signup?next=${encodeURIComponent(`/track/${lead.id}`)}`} className="text-center text-sm font-semibold text-emerald-700 hover:underline dark:text-emerald-400">{t("createAccount")}</Link>
              </>
          ) : (
            <Link
              href={`/track/${lead.id}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#123D2B] hover:bg-[#198754] text-white rounded-2xl font-black text-sm shadow-lg transition-all"
            >
              <span>{t("viewProjectTracker")}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
      </div>

      {/* DEDICATED 2-PAGE A4 QUOTATION DOCUMENT FOR PRINT/PDF */}
      <div id="dedicated-solar-quotation" className="hidden print:block">
        <SolarQuotationDocument lead={lead} selectedKw={selectedKw} />
      </div>
    </>
  );
}
