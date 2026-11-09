import React from "react";
import { Lead, SolarQuote, QuoteOption } from "@/types/solar";
import { calculateSolarQuote, DEFAULT_SUBSIDY_RULE } from "@/lib/solar-calculator";
import { formatCurrency } from "@/lib/utils";
import {
  maskConsumerNumber,
  resolveSnapshotNumber,
  selectQuotationOption,
  calculateMonthlyGeneration,
  getMaximumQuotedSystemKw,
} from "@/lib/quotation-utils";
import { SystemCapacityReviewWarning } from "@/components/SystemCapacityReviewWarning";
import { BUSINESS_CONTACT, getBusinessSupportMailto } from "@/config/business";

export { maskConsumerNumber, resolveSnapshotNumber, selectQuotationOption, calculateMonthlyGeneration, getMaximumQuotedSystemKw };

interface SolarQuotationDocumentProps {
  lead: Lead;
  selectedKw?: number;
}

export function SolarQuotationDocument({ lead, selectedKw }: SolarQuotationDocumentProps) {
  // Use saved quotation data and historical rule snapshots.
  // Never recalculate old quotations using current admin pricing or subsidy rules.
  const quote: SolarQuote =
    lead.quote || calculateSolarQuote(lead.id, lead.recommendedKw, DEFAULT_SUBSIDY_RULE);

  // Fallback option selection: activeKw ALWAYS matches activeOption.systemSizeKw
  const requestedKw = selectedKw ?? lead.recommendedKw ?? quote.recommendedSizeKw ?? 3;
  const activeOption: QuoteOption = selectQuotationOption(quote.options, requestedKw);
  const activeKw = activeOption.systemSizeKw;

  // Nullish-aware resolution preserving legitimate zero values in historical snapshots
  const tier1Rate = resolveSnapshotNumber(quote.ruleSnapshot?.tier1RatePerKw, DEFAULT_SUBSIDY_RULE.tier1RatePerKw);
  const tier2Rate = resolveSnapshotNumber(quote.ruleSnapshot?.tier2RatePerKw, DEFAULT_SUBSIDY_RULE.tier2RatePerKw);
  const maxCap = resolveSnapshotNumber(quote.ruleSnapshot?.maxCap, DEFAULT_SUBSIDY_RULE.maxSubsidyCap);
  const generationFactor = resolveSnapshotNumber(quote.ruleSnapshot?.generationFactor, DEFAULT_SUBSIDY_RULE.generationPerKwPerYear);
  const tariffAssumption = resolveSnapshotNumber(quote.ruleSnapshot?.tariffAssumption, DEFAULT_SUBSIDY_RULE.gridTariffPerUnit);
  const ruleName = quote.ruleSnapshot?.ruleName || DEFAULT_SUBSIDY_RULE.name;

  const rawDate = quote.createdAt ? new Date(quote.createdAt) : new Date();
  const issueDateFormatted = rawDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const validUntilDate = quote.validUntil
    ? new Date(quote.validUntil)
    : new Date(rawDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const validUntilFormatted = validUntilDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const maskedConsumer = maskConsumerNumber(lead.billExtraction?.consumerNumber);
  const customerPhone = /^0+$/.test(lead.phone?.replace(/\D/g, "") || "") ? "" : lead.phone;
  const monthlyConsumption = lead.avgUnitsPerMonth ?? lead.billExtraction?.monthlyUnits;
  const maximumSystemKw = getMaximumQuotedSystemKw(quote.options);

  const customerName = lead.name?.trim() || "Valued Homeowner";
  const customerAddress = [lead.address, lead.city, lead.pincode].filter(Boolean).join(", ") || "Nagpur, Maharashtra";

  return (
    <div className="quotation-document text-slate-800 bg-white font-sans text-xs leading-relaxed print:text-xs">
      {/* =========================================================================
          PAGE 1: CUSTOMER QUOTATION
          ========================================================================= */}
      <section className="quotation-page quotation-page-1 bg-white p-6 sm:p-10 print:p-5 flex flex-col justify-between border-b print:border-none border-slate-200">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start pb-5 border-b-2 border-[#123D2B]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#123D2B] text-white flex items-center justify-center font-black text-xl shadow-xs tracking-wider">
                SS
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black text-[#123D2B] tracking-tight">SolarSaathi</h1>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-[#E7F3EC] text-[#123D2B] border border-[#198754]/30">
                    विदर्भ सोलर
                  </span>
                </div>
                <p className="text-[11px] font-medium text-slate-600 mt-0.5">
                  Nagpur & Vidarbha Clean Energy Initiative
                </p>
                <p className="text-[10px] text-slate-500">
                  PM Surya Ghar: Muft Bijli Yojana Facilitation (Illustrative Demo)
                </p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-[10px] font-bold tracking-wider uppercase mb-1">
                Indicative Solar Quotation
              </div>
              <div className="text-xs font-mono font-bold text-[#123D2B]">Ref: {lead.id}</div>
              <div className="text-[11px] text-slate-600 mt-0.5">Date: {issueDateFormatted}</div>
              <div className="text-[11px] text-slate-600">Valid Until: {validUntilFormatted}</div>
            </div>
          </div>

          {/* Customer & Location Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px]">
            <div>
              <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Customer Name
              </span>
              <span className="font-bold text-slate-900 block break-words whitespace-normal leading-snug">
                {customerName}
              </span>
                  {customerPhone && <span className="text-slate-600 text-[10px]">{customerPhone}</span>}
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Installation Site
              </span>
              <span className="font-medium text-slate-800 block break-words whitespace-normal leading-snug">
                {customerAddress}
              </span>
              <span className="text-slate-600 text-[10px]">District: {lead.city || "Nagpur"}</span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Consumer Number
              </span>
              <span className="font-mono font-semibold text-slate-800 block">
                {maskedConsumer}
              </span>
              <span className="text-slate-600 text-[10px]">MSEDCL Distribution</span>
            </div>

            <div>
              <span className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Monthly Usage
              </span>
              <span className="font-bold text-slate-900 block">
                {lead.avgUnitsPerMonth ? `${lead.avgUnitsPerMonth} kWh` : "—"}
              </span>
              <span className="text-slate-600 text-[10px]">
                Bill: {lead.monthlyBill ? formatCurrency(lead.monthlyBill) : "—"}
              </span>
            </div>
          </div>

          <SystemCapacityReviewWarning
            monthlyConsumption={monthlyConsumption}
            generationPerKwYear={generationFactor}
            maximumSystemKw={maximumSystemKw}
            printCompact
          />

          {/* Recommended System Configuration (Visually Prominent Net Cost & System Size) */}
          <div className="rounded-2xl border-2 border-[#123D2B] bg-gradient-to-br from-[#123D2B] to-[#0A2218] text-white p-5 shadow-sm my-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-emerald-800/80">
              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold tracking-wide uppercase">
                  Primary Recommendation
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1 text-white tracking-tight">
                  {activeOption.systemSizeKw} kW Rooftop Solar Plant
                </h2>
                <p className="text-xs text-emerald-100/80">
                  Requires ~{activeOption.systemSizeKw * 100} sq. ft. shadow-free rooftop area
                </p>
              </div>

              <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 text-right w-full sm:w-auto">
                <span className="block text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                  Estimated Effective Cost After Subsidy
                </span>
                <span className="text-2xl sm:text-3xl font-black font-mono text-white block">
                  {formatCurrency(activeOption.netCost)}
                </span>
                <span className="text-[10px] text-emerald-200 block">
                  Net Payable After Central Subsidy
                </span>
              </div>
            </div>

            {/* Financial misunderstanding prevention notice */}
            <p className="text-[10px] text-emerald-100/80 mt-2.5 pt-2 border-t border-emerald-800/50 leading-relaxed">
              * Subsidy is subject to eligibility, commissioning and government approval. The customer may need to pay the gross installation amount initially.
            </p>

            {/* 4 Financial & Generation Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 text-xs">
              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="block text-[10px] text-slate-300 uppercase">Gross Installation</span>
                <span className="text-sm font-bold font-mono text-white block mt-0.5">
                  {formatCurrency(activeOption.installationCost)}
                </span>
                <span className="text-[9px] text-slate-400">Benchmark turnkey price</span>
              </div>

              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="block text-[10px] text-emerald-300 uppercase">Govt. Subsidy (DBT)</span>
                <span className="text-sm font-bold font-mono text-emerald-400 block mt-0.5">
                  - {formatCurrency(activeOption.subsidyAmount)}
                </span>
                <span className="text-[9px] text-emerald-200/70">Central PM Surya Ghar</span>
              </div>

              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="block text-[10px] text-slate-300 uppercase">Annual Generation</span>
                <span className="text-sm font-bold font-mono text-amber-300 block mt-0.5">
                  ~{activeOption.annualGenerationUnits.toLocaleString("en-IN")} Units
                </span>
                <span className="text-[9px] text-slate-400">~{Math.round(activeOption.annualGenerationUnits / 12)} units/month</span>
              </div>

              <div className="bg-black/20 rounded-lg p-2.5 border border-white/10">
                <span className="block text-[10px] text-slate-300 uppercase">Estimated Payback</span>
                <span className="text-sm font-bold font-mono text-blue-300 block mt-0.5">
                  {activeOption.paybackYears === null || activeOption.paybackYears <= 0
                    ? "Not calculable"
                    : `${activeOption.paybackYears} Years`}
                </span>
                <span className="text-[9px] text-slate-400">
                  Est. Savings: {formatCurrency(activeOption.annualSavings)}/yr
                </span>
              </div>
            </div>
          </div>

          {/* Multi-Tier System Capacity Comparison Table */}
          <div className="my-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                System Options Comparison (1 kW, 2 kW & 3 kW)
              </h3>
              <span className="text-[10px] text-slate-500">
                Assumed Grid Tariff: {formatCurrency(tariffAssumption)}/unit
              </span>
            </div>

            <div className="overflow-hidden border border-slate-200 rounded-xl">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Option</th>
                    <th className="py-2.5 px-2">Roof Area</th>
                    <th className="py-2.5 px-2 text-right">Gross Price</th>
                    <th className="py-2.5 px-2 text-right">Central Subsidy</th>
                    <th className="py-2.5 px-2 text-right">Net Cost</th>
                    <th className="py-2.5 px-2 text-right">Yearly Output</th>
                    <th className="py-2.5 px-2 text-right">Yearly Savings</th>
                    <th className="py-2.5 px-3 text-right">Payback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quote.options.map((opt) => {
                    const isSelected = opt.systemSizeKw === activeKw;
                    const paybackText =
                      opt.paybackYears === null || opt.paybackYears <= 0
                        ? "Not calculable"
                        : `${opt.paybackYears} yrs`;

                    return (
                      <tr
                        key={opt.systemSizeKw}
                        className={
                          isSelected
                            ? "bg-[#E7F3EC] font-semibold text-slate-900 border-l-4 border-l-[#198754]"
                            : "hover:bg-slate-50 text-slate-700"
                        }
                      >
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 font-mono">
                              {opt.systemSizeKw} kW Plant
                            </span>
                            {isSelected && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#198754] text-white uppercase">
                                Selected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 font-mono text-[10px]">
                          ~{opt.systemSizeKw * 100} sq.ft
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                          {formatCurrency(opt.installationCost)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-[#198754]">
                          - {formatCurrency(opt.subsidyAmount)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-[#123D2B]">
                          {formatCurrency(opt.netCost)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-slate-700">
                          {opt.annualGenerationUnits.toLocaleString("en-IN")} kWh
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-emerald-700">
                          {formatCurrency(opt.annualSavings)}/yr
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                          {paybackText}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Page 1 Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
          <div>
            <strong>SolarSaathi (विदर्भ सोलर)</strong> · Indicative Solar Quotation (Illustrative Demo)
          </div>
          <div className="font-mono font-semibold text-slate-600">
            Page 1 of 2 · Continued on Page 2 for Technical Specifications & Terms
          </div>
        </div>
      </section>

      {/* =========================================================================
          PAGE 2: TECHNICAL SPECIFICATIONS & FINANCIAL DETAILS
          ========================================================================= */}
      <section className="quotation-page quotation-page-2 bg-white p-6 sm:p-10 print:p-5 flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-center pb-3 border-b-2 border-[#123D2B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#123D2B] text-white flex items-center justify-center font-black text-sm">
                SS
              </div>
              <div>
                <h2 className="text-sm font-black text-[#123D2B] uppercase tracking-tight">
                  Technical Specifications & Financial Terms
                </h2>
                <span className="text-[10px] text-slate-500">
                  SolarSaathi (विदर्भ सोलर) · PM Surya Ghar Scheme Facilitation (Illustrative Demo)
                </span>
              </div>
            </div>

            <div className="text-right text-[10px] text-slate-600 font-mono">
              Quote Ref: <strong className="text-slate-900">{lead.id}</strong> · {customerName}
            </div>
          </div>

          {/* Section A: Technical Specifications */}
          <div className="my-3.5 print-compact-section">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[#123D2B] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#198754]" />
              1. Technical System Specifications & Regional Benchmarks
            </h3>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="block text-[10px] font-bold text-slate-600 uppercase">
                  Plant Architecture
                </span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  Grid-Tied On-Grid Rooftop Solar Photovoltaic
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Integrated with MSEDCL bi-directional net meter for energy credits.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="block text-[10px] font-bold text-slate-600 uppercase">
                  Regional Solar Generation Benchmark
                </span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  {generationFactor.toLocaleString("en-IN")} kWh / kW / year
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  Calibrated for {BUSINESS_CONTACT.serviceArea} region solar insolation.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="block text-[10px] font-bold text-slate-600 uppercase">
                  Rooftop Structural Requirement
                </span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  ~100 sq. ft. per kW Shadow-Free Area
                </span>
                <p className="text-[10px] text-slate-600 mt-0.5">
                  RCC flat slab or suitable tin shed with south-facing module tilt.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <span className="block text-[10px] font-bold text-slate-600 uppercase">
                  Equipment Quality Standards
                </span>
                <span className="font-semibold text-slate-900 block mt-0.5">
                  Tier-1 ALMM-Compliant Modules & BIS Inverter
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Indicative demo specification subject to final site survey and vendor contract.
                </p>
              </div>
            </div>
          </div>

          {/* Section B: Financial & Subsidy Calculation Breakdown */}
          <div className="my-3.5 print-compact-section">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-[#123D2B] mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#198754]" />
              2. Financial & Central Scheme Subsidy Breakdown
            </h3>

            <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
              <div className="grid grid-cols-3 bg-slate-100 p-2 font-bold text-slate-700 text-[10px] uppercase border-b border-slate-200">
                <span>Calculation Item</span>
                <span>Rule Snapshot / Parameter</span>
                <span className="text-right">Applied Value</span>
              </div>

              <div className="p-2 grid grid-cols-3 border-b border-slate-100">
                <span className="text-slate-700">Scheme Authority</span>
                <span className="text-slate-600">{ruleName}</span>
                <span className="text-right font-mono text-slate-800">MNRE National Portal</span>
              </div>

              <div className="p-2 grid grid-cols-3 border-b border-slate-100">
                <span className="text-slate-700">Tier 1 Subsidy (Up to 2 kW)</span>
                <span className="text-slate-600 font-mono">
                  {formatCurrency(tier1Rate)} per kW
                </span>
                <span className="text-right font-mono text-emerald-700 font-bold">
                  {formatCurrency(Math.min(activeKw, 2) * tier1Rate)}
                </span>
              </div>

              <div className="p-2 grid grid-cols-3 border-b border-slate-100">
                <span className="text-slate-700">Tier 2 Subsidy (2 kW to 3 kW)</span>
                <span className="text-slate-600 font-mono">
                  {formatCurrency(tier2Rate)} per kW (Cap: {formatCurrency(maxCap)})
                </span>
                <span className="text-right font-mono text-emerald-700 font-bold">
                  {activeKw > 2
                    ? formatCurrency(Math.min(activeKw - 2, 1) * tier2Rate)
                    : "₹0"}
                </span>
              </div>

              <div className="p-2 grid grid-cols-3 border-b border-slate-100 bg-[#E7F3EC]/50 font-semibold">
                <span className="text-[#123D2B]">Total Direct Central Subsidy</span>
                <span className="text-slate-600">Disbursed via DBT into bank account</span>
                <span className="text-right font-mono text-[#198754] font-black">
                  - {formatCurrency(activeOption.subsidyAmount)}
                </span>
              </div>

              <div className="p-2 grid grid-cols-3 border-b border-slate-100">
                <span className="text-slate-700">Grid Tariff Assumption</span>
                <span className="text-slate-600">Assumed residential grid tariff</span>
                <span className="text-right font-mono text-slate-800">
                  {formatCurrency(tariffAssumption)} / unit
                </span>
              </div>

              <div className="p-2 grid grid-cols-3 bg-slate-50 font-bold">
                <span className="text-slate-900">Payback Formula</span>
                <span className="text-slate-600 font-normal">
                  Net Cost ({formatCurrency(activeOption.netCost)}) ÷ Annual Savings ({formatCurrency(activeOption.annualSavings)})
                </span>
                <span className="text-right font-mono text-blue-700">
                  {activeOption.paybackYears === null || activeOption.paybackYears <= 0
                    ? "Not calculable"
                    : `${activeOption.paybackYears} Years`}
                </span>
              </div>
            </div>
          </div>

          {/* Section C: Terms, Survey & Scheme Disclaimers */}
          <div className="my-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] space-y-1.5 text-slate-600 leading-normal print-compact-section">
            <h4 className="font-bold text-slate-800 text-[11px] uppercase tracking-wider mb-1">
              Important Disclaimers & Scheme Terms
            </h4>
            <p>
              • <strong>Site Survey & Structural Feasibility:</strong> This document represents an indicative estimate based on preliminary customer data. Final equipment configuration, array placement, shading analysis, inverter location and price quotation will be confirmed following a physical site survey conducted by an authorized technical engineer.
            </p>
            <p>
              • <strong>Subsidy Eligibility & DBT Disbursement:</strong> Central Financial Assistance (CFA) is released directly by the Government of India through the National Portal for PM Surya Ghar into the beneficiary&apos;s Aadhaar-linked bank account. Disbursement is subject to customer scheme eligibility, sanctioned load matching, and DISCOM commissioning certificate verification.
            </p>
            <p>
              • <strong>DISCOM Regulations:</strong> Bi-directional net metering and tariff settlement rules are subject to Maharashtra State Electricity Distribution Co. Ltd. (MSEDCL / Mahavitaran) guidelines and MERC regulatory orders.
            </p>
            <p>
              • <strong>Quotation Validity:</strong> All indicative pricing and subsidy benchmarks stated in this quotation are valid for 30 calendar days from the date of issue (until {validUntilFormatted}).
            </p>
          </div>

          {/* Section D: Official Demo Support Contact */}
          <div className="my-3.5 p-2.5 rounded-lg border border-[#123D2B]/20 bg-[#E7F3EC]/30 text-[9px] leading-snug print-compact-section">
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <strong className="text-[#123D2B] text-[10px]">{BUSINESS_CONTACT.supportHeading}</strong>
              <span className="text-slate-600">Contact: {BUSINESS_CONTACT.contactPerson}</span>
            </div>
            <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-slate-700">
              <span>Email: <a className="font-mono font-semibold text-[#123D2B] underline underline-offset-2" href={getBusinessSupportMailto("Solar quotation enquiry")}>{BUSINESS_CONTACT.supportEmail}</a></span>
              <span>Phone: <strong className="font-mono text-slate-900">{BUSINESS_CONTACT.phoneDisplay}</strong></span>
              <span>WhatsApp: <strong className="text-slate-900">{BUSINESS_CONTACT.whatsappDisplay}</strong></span>
              <span>Service Area: <strong className="text-slate-900">{BUSINESS_CONTACT.serviceArea}</strong></span>
            </div>
          </div>
        </div>

        {/* Page 2 Footer */}
        <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
          <div>
            <strong>SolarSaathi (विदर्भ सोलर)</strong> · Nagpur & Vidarbha Clean Energy
          </div>
          <div className="font-mono font-semibold text-slate-600">
            Page 2 of 2 · Indicative Solar Quotation · PM Surya Ghar Muft Bijli Yojana Facilitation (Demo / Illustrative)
          </div>
        </div>
      </section>
    </div>
  );
}
