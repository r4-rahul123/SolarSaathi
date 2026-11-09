import { test, describe } from "node:test";
import assert from "node:assert";
import {
  calculateSubsidy,
  calculateSolarQuote,
  recommendSystemSize,
  scoreLead,
} from "../src/lib/solar-calculator.js";

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

  test("System sizing correctly computes capacity based on 1,400 units/kW/year benchmark", () => {
    // 340 units/month = 4,080 units/year / 1,400 = 2.91 -> 3 kW
    assert.strictEqual(recommendSystemSize(340), 3);

    // 85 units/month = 1,020 units/year / 1,400 = 0.72 -> clamped to 1 kW
    assert.strictEqual(recommendSystemSize(85), 1);
  });

  test("Homeowner Quote Payback matches expected ~3.2 years for 3 kW system", () => {
    const quote = calculateSolarQuote(3);
    assert.strictEqual(quote.systemSizeKw, 3);
    assert.strictEqual(quote.grossCost, 180000);
    assert.strictEqual(quote.subsidyAmount, 78000);
    assert.strictEqual(quote.netCost, 102000);
    assert.strictEqual(quote.annualGenerationUnits, 4200); // 3 * 1,400
    assert.strictEqual(quote.annualSavings, 31500); // 4,200 * ₹7.50
    assert.strictEqual(quote.paybackYears, 3.2); // 102,000 / 31,500
  });

  test("Lead qualification engine correctly saves ₹2,500 survey costs on Tenants & Small Bills", () => {
    // Case 1: Tenant -> Low score, replaced with short call
    const tenantResult = scoreLead("Tenant", 1900, 210);
    assert.strictEqual(tenantResult.score, "Low");
    assert.strictEqual(tenantResult.nextAction, "SHORT_CALL");

    // Case 2: Small bill (< ₹800) -> Low score, short call
    const smallBillResult = scoreLead("Owner", 650, 85);
    assert.strictEqual(smallBillResult.score, "Low");
    assert.strictEqual(smallBillResult.nextAction, "SHORT_CALL");

    // Case 3: High value owner (> ₹2,500) -> High score, physical site visit
    const highResult = scoreLead("Owner", 3200, 340);
    assert.strictEqual(highResult.score, "High");
    assert.strictEqual(highResult.nextAction, "SITE_VISIT");
  });
});
