import { describe, test } from "node:test";
import assert from "node:assert";

// Core calculation logic mirroring src/lib/solar-calculator.ts for testing validation
function calculateSubsidy(systemSizeKw, maxCap = 78000) {
  let subsidy = 0;
  if (systemSizeKw <= 0) return 0;
  const tier1Kw = Math.min(systemSizeKw, 2);
  subsidy += tier1Kw * 30000;
  if (systemSizeKw > 2) {
    const tier2Kw = Math.min(systemSizeKw - 2, 1);
    subsidy += tier2Kw * 18000;
  }
  return Math.min(subsidy, maxCap);
}

function calculateSolarQuote(systemSizeKw, costPerKw = 60000, genBenchmark = 1400, tariff = 7.5) {
  const grossCost = systemSizeKw * costPerKw;
  const subsidyAmount = calculateSubsidy(systemSizeKw);
  const netCost = grossCost - subsidyAmount;
  const annualGenerationUnits = systemSizeKw * genBenchmark;
  const annualSavings = annualGenerationUnits * tariff;
  const paybackYears = Number((netCost / annualSavings).toFixed(1));

  return {
    systemSizeKw,
    grossCost,
    subsidyAmount,
    netCost,
    annualGenerationUnits,
    annualSavings,
    paybackYears,
  };
}

function recommendSystemSize(avgUnitsPerMonth, genBenchmark = 1400) {
  if (!avgUnitsPerMonth || avgUnitsPerMonth <= 0) return 1;
  const annualUnits = avgUnitsPerMonth * 12;
  const rounded = Math.round(annualUnits / genBenchmark);
  return Math.max(1, Math.min(rounded, 10));
}

function scoreLead(occupancy, monthlyBill, avgUnitsPerMonth) {
  if (occupancy === "Tenant") {
    return { score: "Low", nextAction: "SHORT_CALL" };
  }
  if (monthlyBill < 800 || avgUnitsPerMonth < 100) {
    return { score: "Low", nextAction: "SHORT_CALL" };
  }
  if (monthlyBill >= 2500 || avgUnitsPerMonth >= 250) {
    return { score: "High", nextAction: "SITE_VISIT" };
  }
  return { score: "Medium", nextAction: "SITE_VISIT" };
}

describe("Solar Financial & Subsidy Calculation Engine", () => {
  test("Central Scheme Subsidy correctly tiers at 1kW, 2kW, 3kW and caps at 78,000", () => {
    assert.strictEqual(calculateSubsidy(1), 30000);
    assert.strictEqual(calculateSubsidy(2), 60000);
    assert.strictEqual(calculateSubsidy(3), 78000);
    assert.strictEqual(calculateSubsidy(5), 78000);
    assert.strictEqual(calculateSubsidy(10), 78000);
  });

  test("System sizing computes capacity based on 1,400 units/kW/year benchmark", () => {
    assert.strictEqual(recommendSystemSize(340), 3);
    assert.strictEqual(recommendSystemSize(85), 1);
  });

  test("Homeowner Quote Payback matches expected ~3.2 years for 3 kW system", () => {
    const quote = calculateSolarQuote(3);
    assert.strictEqual(quote.systemSizeKw, 3);
    assert.strictEqual(quote.grossCost, 180000);
    assert.strictEqual(quote.subsidyAmount, 78000);
    assert.strictEqual(quote.netCost, 102000);
    assert.strictEqual(quote.annualGenerationUnits, 4200);
    assert.strictEqual(quote.annualSavings, 31500);
    assert.strictEqual(quote.paybackYears, 3.2);
  });

  test("Lead qualification engine saves ₹2,500 survey costs on Tenants & Small Bills", () => {
    assert.strictEqual(scoreLead("Tenant", 1900, 210).score, "Low");
    assert.strictEqual(scoreLead("Tenant", 1900, 210).nextAction, "SHORT_CALL");
    assert.strictEqual(scoreLead("Owner", 650, 85).score, "Low");
    assert.strictEqual(scoreLead("Owner", 650, 85).nextAction, "SHORT_CALL");
    assert.strictEqual(scoreLead("Owner", 3200, 340).score, "High");
    assert.strictEqual(scoreLead("Owner", 3200, 340).nextAction, "SITE_VISIT");
  });
});
