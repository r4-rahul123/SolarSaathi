import { LeadScore, NextAction, OccupancyType, SolarQuote, SubsidyRule } from "@/types/solar";

export const DEFAULT_SUBSIDY_RULE: SubsidyRule = {
  id: "PM-SURYA-GHAR-2026",
  name: "PM Surya Ghar: Muft Bijli Yojana (Vidarbha / Maharashtra)",
  effectiveFrom: "2024-02-15",
  effectiveTo: "2027-03-31",
  description:
    "Central residential rooftop solar scheme: ₹30,000/kW for 1st & 2nd kW, ₹18,000 for 3rd kW, capped at ₹78,000 maximum subsidy.",
  rates: [
    { minKw: 0, maxKw: 2, ratePerKw: 30000 },
    { minKw: 2, maxKw: 3, ratePerKw: 18000 },
  ],
  maxSubsidyCap: 78000,
  generationPerKwPerYear: 1400, // Explicitly specified in client brief
  gridTariffPerUnit: 7.5, // Average MSEB Tier-1 residential tariff ₹/unit
  costPerKwRate: 60000, // Benchmark turnkey cost per kW in Vidarbha
  isActive: true,
};

/**
 * Calculates central government subsidy based on dated rule tables
 */
export function calculateSubsidy(systemSizeKw: number, rule: SubsidyRule = DEFAULT_SUBSIDY_RULE): number {
  let subsidy = 0;

  if (systemSizeKw <= 0) return 0;

  // 1st tier: up to 2 kW @ ₹30,000/kW
  const tier1Kw = Math.min(systemSizeKw, 2);
  subsidy += tier1Kw * 30000;

  // 2nd tier: 2 kW to 3 kW @ ₹18,000/kW
  if (systemSizeKw > 2) {
    const tier2Kw = Math.min(systemSizeKw - 2, 1);
    subsidy += tier2Kw * 18000;
  }

  // Cap at maximum allowable subsidy
  return Math.min(subsidy, rule.maxSubsidyCap);
}

/**
 * Calculates complete financial breakdown & payback story for homeowner
 */
export function calculateSolarQuote(
  systemSizeKw: number,
  rule: SubsidyRule = DEFAULT_SUBSIDY_RULE
): SolarQuote {
  const grossCost = systemSizeKw * rule.costPerKwRate;
  const subsidyAmount = calculateSubsidy(systemSizeKw, rule);
  const netCost = grossCost - subsidyAmount;

  const annualGenerationUnits = systemSizeKw * rule.generationPerKwPerYear;
  const annualSavings = annualGenerationUnits * rule.gridTariffPerUnit;
  const monthlySavings = Math.round(annualSavings / 12);

  // Payback in years (Net Cost / Annual Savings)
  const paybackYears = Number((netCost / annualSavings).toFixed(1));

  // 25 Years lifetime net savings
  const lifetimeGrossSavings = annualSavings * 25;
  const lifetimeSavings25Yrs = lifetimeGrossSavings - netCost;

  return {
    systemSizeKw,
    grossCost,
    subsidyAmount,
    netCost,
    annualGenerationUnits,
    annualSavings,
    monthlySavings,
    paybackYears,
    lifetimeSavings25Yrs,
    rateRuleId: rule.id,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Recommends optimal system capacity (kW) based on monthly units
 */
export function recommendSystemSize(avgUnitsPerMonth: number, rule: SubsidyRule = DEFAULT_SUBSIDY_RULE): number {
  if (!avgUnitsPerMonth || avgUnitsPerMonth <= 0) return 1;
  const annualUnits = avgUnitsPerMonth * 12;
  const rawSize = annualUnits / rule.generationPerKwPerYear;
  const rounded = Math.round(rawSize);
  return Math.max(1, Math.min(rounded, 10)); // Clamp between 1kW and 10kW residential
}

/**
 * Lead qualification & scoring engine (solves 40% wasted survey problem)
 */
export function scoreLead(
  occupancy: OccupancyType,
  monthlyBill: number,
  avgUnitsPerMonth: number
): { score: LeadScore; reason: string; nextAction: NextAction } {
  // Case 1: Tenant (cannot legally install without landlord deed)
  if (occupancy === "Tenant") {
    return {
      score: "Low",
      reason: "Tenant - rooftop property rights belong to owner. Physical survey replaced with a 5-minute phone call to avoid wasting ₹2,500 survey cost.",
      nextAction: "SHORT_CALL",
    };
  }

  // Case 2: Very small bill (< ₹800 or < 100 units)
  if (monthlyBill < 800 || avgUnitsPerMonth < 100) {
    return {
      score: "Low",
      reason: "Small bill (<₹800/mo). Payback period is too long to justify ₹2,500 site survey visit. Queued for phone consultation instead.",
      nextAction: "SHORT_CALL",
    };
  }

  // Case 3: High-value lead (> ₹2,500 or > 250 units)
  if (monthlyBill >= 2500 || avgUnitsPerMonth >= 250) {
    return {
      score: "High",
      reason: "Owner with high electricity consumption (>₹2,500/mo). Excellent payback period (~3.2 years). Scheduled for priority same-day site survey.",
      nextAction: "SITE_VISIT",
    };
  }

  // Case 4: Medium value lead (₹800 - ₹2,500)
  return {
    score: "Medium",
    reason: "Owner with moderate consumption. Suitable for 1-2 kW system. Qualified for standard site survey.",
    nextAction: "SITE_VISIT",
  };
}
