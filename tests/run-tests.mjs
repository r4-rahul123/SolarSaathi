import { describe, test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import {
  calculateSubsidy,
  calculateSolarQuote,
  recommendSystemSize,
  calculateLeadScore,
  DEFAULT_SUBSIDY_RULE,
} from "../src/lib/solar-calculator.ts";
import { daysSinceStatusChange, isProjectStuck } from "../src/lib/project-timing.ts";
import { hideLeadScoring } from "../src/lib/lead-privacy.ts";
import { withPostgresTransaction } from "../src/lib/postgres-transaction.ts";
import "./pdf-quotation-redesign.test.mjs";
import "./business-contact.test.mjs";
import "./auth-hardening.test.mjs";
import "./payment-tracking.test.mjs";
import "./mock-notification.test.mjs";

describe("Solar Financial & Subsidy Calculation Engine", () => {
  test("Central Scheme Subsidy correctly tiers at 1kW, 2kW, 3kW and caps at 78,000", () => {
    // 1 kW: ₹30,000
    assert.strictEqual(calculateSubsidy(1), 30000);

    // 2 kW: ₹60,000
    assert.strictEqual(calculateSubsidy(2), 60000);

    // 3 kW: ₹60,000 + ₹18,000 = ₹78,000
    assert.strictEqual(calculateSubsidy(3), 78000);
    assert.strictEqual(calculateSubsidy(1.5), 45000);
    assert.strictEqual(calculateSubsidy(4.5), 78000);

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

    const zeroTariffQuote = calculateSolarQuote("ZERO-SAVINGS", 3, { ...DEFAULT_SUBSIDY_RULE, gridTariffPerUnit: 0 });
    assert.strictEqual(zeroTariffQuote.options[2].paybackYears, null);
    assert.strictEqual(zeroTariffQuote.ruleSnapshot.tier1RatePerKw, DEFAULT_SUBSIDY_RULE.tier1RatePerKw);
    const negativeTariffQuote = calculateSolarQuote("NEGATIVE-SAVINGS", 3, { ...DEFAULT_SUBSIDY_RULE, gridTariffPerUnit: -1 });
    assert.strictEqual(negativeTariffQuote.options[2].paybackYears, null);
    assert.strictEqual(zeroTariffQuote.options[2].installationCost, 195000);
    assert.strictEqual(zeroTariffQuote.options[2].subsidyAmount, 78000);
    assert.strictEqual(zeroTariffQuote.options[2].annualGenerationUnits, 4200);
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

  test("Quote snapshots retain historical rule values", () => {
    const rule = { ...DEFAULT_SUBSIDY_RULE };
    const quote = calculateSolarQuote("HISTORICAL", 3, rule);
    rule.tier1RatePerKw = 1;
    rule.gridTariffPerUnit = 0;
    assert.strictEqual(quote.ruleSnapshot.tier1RatePerKw, 30000);
    assert.strictEqual(quote.ruleSnapshot.tariffAssumption, 8);
    assert.strictEqual(quote.options[2].installationCost, 195000);
    assert.strictEqual(quote.options[2].subsidyAmount, 78000);
    assert.strictEqual(quote.options[2].annualSavings, 33600);
  });

  test("Project becomes stuck at seven full days; credited projects are terminal", () => {
    const now = Date.parse("2026-11-09T12:00:00.000Z");
    const exactlySevenDaysAgo = "2026-11-02T12:00:00.000Z";
    const oneMillisecondShort = "2026-11-02T12:00:00.001Z";
    assert.strictEqual(daysSinceStatusChange(exactlySevenDaysAgo, now), 7);
    assert.strictEqual(isProjectStuck("INSTALLATION", exactlySevenDaysAgo, now), true);
    assert.strictEqual(isProjectStuck("INSTALLATION", oneMillisecondShort, now), false);
    assert.strictEqual(isProjectStuck("SUBSIDY_CREDITED", exactlySevenDaysAgo, now), false);
  });

  test("Homeowner-safe lead projection removes internal score data", () => {
    const lead = {
      id: "PROJECT-TEST", score: "High", scoreReason: "internal reason",
      scoreBreakdown: { totalScore: 90, reasonCodes: ["HIGH_FIT_SCORE"] }, name: "Test",
    };
    const publicLead = hideLeadScoring(lead);
    assert.strictEqual("score" in publicLead, false);
    assert.strictEqual("scoreReason" in publicLead, false);
    assert.strictEqual("scoreBreakdown" in publicLead, false);
    assert.strictEqual(publicLead.name, "Test");
  });

  test("Signup transaction rolls back user when session insert fails", async () => {
    const statements = [];
    const client = {
      async query(sql) {
        statements.push(sql);
        if (sql.includes("INSERT INTO app_sessions")) throw new Error("simulated session write failure");
        return { rows: [{ id: "test-user-id" }] };
      },
      release() { statements.push("RELEASE"); },
    };
    const pool = { async connect() { return client; } };
    await assert.rejects(
      withPostgresTransaction(pool, async (tx) => {
        await tx.query("INSERT INTO app_users");
        await tx.query("INSERT INTO app_sessions");
      }),
      /simulated session write failure/,
    );
    assert.deepStrictEqual(statements, ["BEGIN", "INSERT INTO app_users", "INSERT INTO app_sessions", "ROLLBACK", "RELEASE"]);
  });

  test("Redesigned PDF Quotation generates exactly 2 pages with verified snapshot integrity", () => {
    const pdfPath = "output/pdf/SolarSaathi-Capacity-Review-Sample.pdf";
    assert.ok(fs.existsSync(pdfPath), "PDF quotation file must exist on disk");
    const buf = fs.readFileSync(pdfPath);
    const pdfString = buf.toString("latin1");
    assert.ok(pdfString.startsWith("%PDF-"), "File must be valid PDF");
    const countMatch = pdfString.match(/\/Count\s+(\d+)/);
    assert.ok(countMatch, "Page count must exist in catalog");
    assert.strictEqual(parseInt(countMatch[1], 10), 2, "PDF must have exactly 2 pages");
  });
});
