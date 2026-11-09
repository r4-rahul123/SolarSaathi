import { describe, test } from "node:test";
import assert from "node:assert";
import {
  calculateSubsidy,
  calculateSolarQuote,
  recommendSystemSize,
  calculateLeadScore,
  DEFAULT_SUBSIDY_RULE,
  DEFAULT_PRICING_RULES,
} from "../src/lib/solar-calculator.ts";

describe("Solar Financial & Subsidy Calculation Engine", () => {
  test("Central Scheme Subsidy correctly tiers at 1kW, 2kW, 3kW and caps at 78,000", () => {
    // 1 kW: ₹30,000
    assert.strictEqual(calculateSubsidy(1), 30000);

    // 2 kW: ₹60,000
    assert.strictEqual(calculateSubsidy(2), 60000);

    // 3 kW: ₹60,000 + ₹18,000 = ₹78,000
    assert.strictEqual(calculateSubsidy(3), 78000);

    // 5 kW: Capped at ₹78,000
    assert.strictEqual(calculateSubsidy(5), 78000);

    // 10 kW: Still capped at ₹78,000
    assert.strictEqual(calculateSubsidy(10), 78000);
  });

  test("System sizing computes capacity based on 1,400 units/kW/year benchmark", () => {
    // 340 units/month = 4,080 units/year / 1,400 = 2.91 -> 3 kW
    assert.strictEqual(recommendSystemSize(340), 3);

    // 85 units/month = 1,020 units/year / 1,400 = 0.72 -> clamped to 1 kW
    assert.strictEqual(recommendSystemSize(85), 1);
  });

  test("Homeowner Quote Payback matches expected ~3.5 years for 3 kW system", () => {
    const quote = calculateSolarQuote("TEST-LEAD-1", 3);
    const option3kW = quote.options.find((opt) => opt.systemSizeKw === 3);
    assert.ok(option3kW, "3kW quote option must exist");
    assert.strictEqual(option3kW.systemSizeKw, 3);
    assert.strictEqual(option3kW.installationCost, 195000);
    assert.strictEqual(option3kW.subsidyAmount, 78000);
    assert.strictEqual(option3kW.netCost, 117000);
    assert.strictEqual(option3kW.annualGenerationUnits, 4200); // 3 * 1,400
    assert.strictEqual(option3kW.annualSavings, 33600); // 4,200 * ₹8.00 grid tariff
    assert.strictEqual(option3kW.paybackYears, 3.48); // 117,000 / 33,600
  });

  test("Lead qualification engine saves ₹2,500 survey costs on Tenants & Small Bills", () => {
    // Tenant score stays point-based; ownership verification independently routes to a short call.
    const tenantResult = calculateLeadScore("Tenant", 1900, 210, 400, "440025");
    assert.strictEqual(tenantResult.breakdown.tier, "Medium");
    assert.strictEqual(tenantResult.nextAction, "SHORT_CALL");

    // Small-bill routing is independent of the points-based tier.
    const smallBillResult = calculateLeadScore("Owner", 650, 85, 300, "440012");
    assert.strictEqual(smallBillResult.breakdown.tier, "Medium");
    assert.strictEqual(smallBillResult.nextAction, "SHORT_CALL");

    // Case 3: High value owner (> ₹2,500) -> High tier, physical site visit
    const highResult = calculateLeadScore("Owner", 3200, 340, 650, "440015");
    assert.strictEqual(highResult.breakdown.tier, "High");
    assert.strictEqual(highResult.nextAction, "SITE_VISIT");

    // Capacity rounds up to avoid silently recommending less than the benchmark requires.
    assert.strictEqual(recommendSystemSize(280), 3);
    assert.strictEqual(recommendSystemSize(400), 3); // Above the displayed 3 kW options; quote warns for review.
  });
});
