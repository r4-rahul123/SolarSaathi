import {
  OccupancyType,
  ScoreBreakdown,
  SolarQuote,
  QuoteOption,
  SubsidyRule,
  PricingRule,
  NextAction,
} from "@/types/solar";

export const DEFAULT_SUBSIDY_RULE: SubsidyRule = {
  id: "PM-SURYA-GHAR-2026",
  name: "PM Surya Ghar: Muft Bijli Yojana (Nagpur & Vidarbha)",
  effectiveFrom: "2024-02-15",
  effectiveTo: "2027-03-31",
  description:
    "Central residential rooftop solar scheme: ₹30,000/kW for 1st & 2nd kW, ₹18,000 for 3rd kW, capped at ₹78,000 maximum subsidy.",
  tier1RatePerKw: 30000,
  tier2RatePerKw: 18000,
  maxSubsidyCap: 78000,
  generationPerKwPerYear: 1400, // Explicitly specified in client brief
  gridTariffPerUnit: 8.0,       // ₹8.00 / kWh average MSEDCL residential slab
  isActive: true,
};

export const DEFAULT_PRICING_RULES: PricingRule[] = [
  { systemSizeKw: 1, price: 75000, effectiveFrom: "2024-01-01", isActive: true },
  { systemSizeKw: 2, price: 140000, effectiveFrom: "2024-01-01", isActive: true },
  { systemSizeKw: 3, price: 195000, effectiveFrom: "2024-01-01", isActive: true },
];

/**
 * Calculates central government subsidy based on dated rule tables
 */
export function calculateSubsidy(systemSizeKw: number, rule: SubsidyRule = DEFAULT_SUBSIDY_RULE): number {
  if (systemSizeKw <= 0) return 0;

  let subsidy = 0;
  // Tier 1: up to 2 kW @ ₹30,000/kW
  const tier1Kw = Math.min(systemSizeKw, 2);
  subsidy += tier1Kw * rule.tier1RatePerKw;

  // Tier 2: 2 kW to 3 kW @ ₹18,000/kW
  if (systemSizeKw > 2) {
    const tier2Kw = Math.min(systemSizeKw - 2, 1);
    subsidy += tier2Kw * rule.tier2RatePerKw;
  }

  return Math.min(subsidy, rule.maxSubsidyCap);
}

/**
 * Generates single quote option
 */
function buildOption(
  kw: number,
  installationPrice: number,
  rule: SubsidyRule,
  isRecommended: boolean = false
): QuoteOption {
  const subsidyAmount = calculateSubsidy(kw, rule);
  const netCost = installationPrice - subsidyAmount;
  const annualGenerationUnits = kw * rule.generationPerKwPerYear;
  const annualSavings = annualGenerationUnits * rule.gridTariffPerUnit;
  const monthlySavings = Math.round(annualSavings / 12);
  const paybackYears = Number((netCost / annualSavings).toFixed(2));
  const lifetimeSavings25Yrs = annualSavings * 25 - netCost;

  return {
    systemSizeKw: kw,
    installationCost: installationPrice,
    subsidyAmount,
    netCost,
    annualGenerationUnits,
    annualSavings,
    monthlySavings,
    paybackYears,
    lifetimeSavings25Yrs,
    isRecommended,
  };
}

/**
 * Builds the complete side-by-side 3-tier solar quote (1kW, 2kW, 3kW) with rule snapshot
 */
export function calculateSolarQuote(
  leadId: string,
  recommendedKw: number = 3,
  rule: SubsidyRule = DEFAULT_SUBSIDY_RULE
): SolarQuote {
  const option1 = buildOption(1, 75000, rule, recommendedKw === 1);
  const option2 = buildOption(2, 140000, rule, recommendedKw === 2);
  const option3 = buildOption(3, 195000, rule, recommendedKw >= 3);

  return {
    id: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
    leadId,
    options: [option1, option2, option3],
    recommendedSizeKw: Math.min(3, Math.max(1, recommendedKw)),
    subsidyRuleId: rule.id,
    ruleSnapshot: {
      ruleName: rule.name,
      effectiveDate: rule.effectiveFrom,
      maxCap: rule.maxSubsidyCap,
      generationFactor: rule.generationPerKwPerYear,
      tariffAssumption: rule.gridTariffPerUnit,
    },
    status: "SENT",
    createdAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
  return Math.max(1, Math.min(rounded, 3)); // 1kW to 3kW residential PM Surya Ghar
}

/**
 * Transparent 100-Point Hybrid Lead Scoring Engine
 * Solves the ₹26.4 Lakhs wasted survey problem
 */
export function calculateLeadScore(
  occupancy: OccupancyType,
  monthlyBill: number,
  avgUnitsPerMonth: number,
  roofAreaSqFt: number = 500,
  pincode: string = "440015"
): { breakdown: ScoreBreakdown; nextAction: NextAction } {
  // 1. Property ownership (max 25 pts)
  const ownershipPoints = occupancy === "Owner" ? 25 : 5;

  // 2. Monthly electricity bill (max 25 pts)
  let billPoints = 5;
  if (monthlyBill >= 2800) billPoints = 25;
  else if (monthlyBill >= 1800) billPoints = 20;
  else if (monthlyBill >= 1000) billPoints = 12;

  // 3. Available roof area (max 20 pts)
  let roofAreaPoints = 5;
  if (roofAreaSqFt >= 500) roofAreaPoints = 20;
  else if (roofAreaSqFt >= 300) roofAreaPoints = 14;

  // 4. Electricity consumption (max 20 pts)
  let consumptionPoints = 4;
  if (avgUnitsPerMonth >= 300) consumptionPoints = 20;
  else if (avgUnitsPerMonth >= 180) consumptionPoints = 14;
  else if (avgUnitsPerMonth >= 100) consumptionPoints = 8;

  // 5. Serviceability / Nagpur Vidarbha pincode (max 10 pts)
  const serviceabilityPoints = pincode.startsWith("44") ? 10 : 6;

  const totalScore = ownershipPoints + billPoints + roofAreaPoints + consumptionPoints + serviceabilityPoints;

  let tier: "High" | "Medium" | "Low" = "Medium";
  let explanation = "";
  let nextAction: NextAction = "SITE_VISIT";

  if (occupancy === "Tenant") {
    tier = "Low";
    nextAction = "SHORT_CALL";
    explanation =
      "Tenant lead. Rooftop property rights belong to landlord. Physical survey replaced with a 5-minute phone call to avoid wasting ₹2,500 survey cost.";
  } else if (monthlyBill < 800 || avgUnitsPerMonth < 100) {
    tier = "Low";
    nextAction = "SHORT_CALL";
    explanation =
      "Small bill (<₹800/mo). Payback period is too long to justify ₹2,500 site visit. Queued for phone consultation instead.";
  } else if (totalScore >= 70) {
    tier = "High";
    nextAction = "SITE_VISIT";
    explanation = `High Priority Score (${totalScore}/100). Verified owner with high consumption (${avgUnitsPerMonth} kWh/mo). Immediate site survey approved.`;
  } else {
    tier = "Medium";
    nextAction = "SITE_VISIT";
    explanation = `Moderate Score (${totalScore}/100). Suitable for 1-2 kW system. Standard survey queue.`;
  }

  return {
    breakdown: {
      ownershipPoints,
      billPoints,
      roofAreaPoints,
      consumptionPoints,
      serviceabilityPoints,
      totalScore,
      tier,
      explanation,
    },
    nextAction,
  };
}
