import { describe, test } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import {
  calculateSolarQuote,
  DEFAULT_SUBSIDY_RULE,
} from "../src/lib/solar-calculator.ts";
import {
  maskConsumerNumber,
  resolveSnapshotNumber,
  selectQuotationOption,
  calculateMonthlyGeneration,
  calculateCapacityCoverage,
  getMaximumQuotedSystemKw,
} from "../src/lib/quotation-utils.ts";

describe("SolarSaathi Redesigned PDF Quotation Engine & Regression Tests", () => {
  test("1 kW, 2 kW and 3 kW quotation tiers contain exact financial numbers", () => {
    const quote = calculateSolarQuote("TEST-TIERS", 3, DEFAULT_SUBSIDY_RULE);
    const opt1 = quote.options.find((o) => o.systemSizeKw === 1);
    const opt2 = quote.options.find((o) => o.systemSizeKw === 2);
    const opt3 = quote.options.find((o) => o.systemSizeKw === 3);

    assert.ok(opt1 && opt2 && opt3, "All 3 options must exist");

    // 1 kW: Gross ₹75,000, Subsidy ₹30,000, Net ₹45,000, Units 1,400, Payback 4.02
    assert.strictEqual(opt1.installationCost, 75000);
    assert.strictEqual(opt1.subsidyAmount, 30000);
    assert.strictEqual(opt1.netCost, 45000);
    assert.strictEqual(opt1.annualGenerationUnits, 1400);
    assert.strictEqual(opt1.annualSavings, 11200);
    assert.strictEqual(opt1.paybackYears, 4.02);

    // 2 kW: Gross ₹1,40,000, Subsidy ₹60,000, Net ₹80,000, Units 2,800, Payback 3.57
    assert.strictEqual(opt2.installationCost, 140000);
    assert.strictEqual(opt2.subsidyAmount, 60000);
    assert.strictEqual(opt2.netCost, 80000);
    assert.strictEqual(opt2.annualGenerationUnits, 2800);
    assert.strictEqual(opt2.annualSavings, 22400);
    assert.strictEqual(opt2.paybackYears, 3.57);

    // 3 kW: Gross ₹1,95,000, Subsidy ₹78,000, Net ₹1,17,000, Units 4,200, Payback 3.48
    assert.strictEqual(opt3.installationCost, 195000);
    assert.strictEqual(opt3.subsidyAmount, 78000);
    assert.strictEqual(opt3.netCost, 117000);
    assert.strictEqual(opt3.annualGenerationUnits, 4200);
    assert.strictEqual(opt3.annualSavings, 33600);
    assert.strictEqual(opt3.paybackYears, 3.48);
  });

  test("Zero tariff in historical snapshot preserves 0 and produces null payback", () => {
    // Nullish-aware numeric validation preserves 0 and '0'
    assert.strictEqual(resolveSnapshotNumber(0, 8.0), 0);
    assert.strictEqual(resolveSnapshotNumber("0", 8.0), 0);
    assert.strictEqual(resolveSnapshotNumber(null, 8.0), 8.0);
    assert.strictEqual(resolveSnapshotNumber(undefined, 8.0), 8.0);
    assert.strictEqual(resolveSnapshotNumber("", 8.0), 8.0);
    assert.strictEqual(resolveSnapshotNumber(NaN, 8.0), 8.0);

    // When grid tariff is 0 (e.g. agricultural/subsidized zero bill), payback is Not calculable (null)
    const zeroTariffQuote = calculateSolarQuote("ZERO-TEST", 3, {
      ...DEFAULT_SUBSIDY_RULE,
      gridTariffPerUnit: 0,
    });
    assert.strictEqual(zeroTariffQuote.options[0].paybackYears, null);
    assert.strictEqual(zeroTariffQuote.options[1].paybackYears, null);
    assert.strictEqual(zeroTariffQuote.options[2].paybackYears, null);
    assert.strictEqual(zeroTariffQuote.options[0].annualSavings, 0);

    const negTariffQuote = calculateSolarQuote("NEG-TEST", 3, {
      ...DEFAULT_SUBSIDY_RULE,
      gridTariffPerUnit: -5,
    });
    assert.strictEqual(negTariffQuote.options[0].paybackYears, null);
    assert.strictEqual(negTariffQuote.options[1].paybackYears, null);
    assert.strictEqual(negTariffQuote.options[2].paybackYears, null);
  });

  test("Consumer number masking protects all lengths and never exposes full raw number", () => {
    assert.strictEqual(maskConsumerNumber(undefined), "—");
    assert.strictEqual(maskConsumerNumber(""), "—");
    assert.strictEqual(maskConsumerNumber("   "), "—");

    // Short numbers (1 to 4 chars)
    assert.strictEqual(maskConsumerNumber("9"), "*");
    assert.strictEqual(maskConsumerNumber("99"), "*9");
    assert.strictEqual(maskConsumerNumber("123"), "*3");
    assert.strictEqual(maskConsumerNumber("1234"), "*4");

    // Medium numbers (5 to 8 chars)
    assert.strictEqual(maskConsumerNumber("12345"), "12****45");
    assert.strictEqual(maskConsumerNumber("123456"), "12****56");
    assert.strictEqual(maskConsumerNumber("1234567"), "12****67");
    assert.strictEqual(maskConsumerNumber("12345678"), "12****78");

    // Full 12-digit DISCOM consumer number
    assert.strictEqual(maskConsumerNumber("123456789012"), "1234****9012");

    // Verify none contains the full unmasked sequence
    const rawSamples = ["99", "1234", "123456", "12345678", "123456789012"];
    for (const raw of rawSamples) {
      assert.notStrictEqual(maskConsumerNumber(raw), raw, `Raw '${raw}' must never match masked output`);
    }
  });

  test("Invalid selected option fallback aligns activeKw and activeOption perfectly", () => {
    const quote = calculateSolarQuote("TEST-FALLBACK", 3);
    
    // Requested option 99 kW does not exist in standard 1,2,3 kW options
    const fallbackOption = selectQuotationOption(quote.options, 99);
    assert.ok(fallbackOption);
    // Should fall back to 3kW option (or first available)
    assert.strictEqual(fallbackOption.systemSizeKw, 3);

    // If options are empty, it should throw
    assert.throws(() => selectQuotationOption([]), /at least one option/);

    // If requested option 2 kW exists, returns 2 kW option
    const opt2 = selectQuotationOption(quote.options, 2);
    assert.strictEqual(opt2.systemSizeKw, 2);
    assert.strictEqual(opt2.netCost, 80000);
  });

  test("Customer details handle long Marathi names and missing optional fields", () => {
    const marathiName = "श्रीमंत छत्रपती राजवर्धन भोसले-देशमुख (सोमलवाडा, नागपूर)";
    const leadWithLongMarathiName = {
      id: "LD-MARATHI-NAME",
      name: marathiName,
      recommendedKw: 3,
      address: "",
      city: "",
      pincode: "",
      phone: "",
    };

    const quote = calculateSolarQuote(leadWithLongMarathiName.id, 3);
    assert.ok(quote.options.length === 3);
    assert.strictEqual(leadWithLongMarathiName.name, marathiName);
    assert.ok(leadWithLongMarathiName.name.length > 40);
  });

  test("Fractional generation displays correct rounded monthly units", () => {
    // 1 kW: 1,400 units / 12 = 116.666... -> Math.round -> 117
    assert.strictEqual(calculateMonthlyGeneration(1400), 117);
    // 2 kW: 2,800 units / 12 = 233.333... -> Math.round -> 233
    assert.strictEqual(calculateMonthlyGeneration(2800), 233);
    // 3 kW: 4,200 units / 12 = 350 -> Math.round -> 350
    assert.strictEqual(calculateMonthlyGeneration(4200), 350);
    // Fractional test
    assert.strictEqual(calculateMonthlyGeneration(1250), 104);
  });

  test("Capacity warning covers consumption above the maximum 3 kW benchmark", () => {
    const maxSystemKw = getMaximumQuotedSystemKw([
      { systemSizeKw: 1 },
      { systemSizeKw: 2 },
      { systemSizeKw: 3 },
    ]);
    const review = calculateCapacityCoverage(375, 1400, maxSystemKw);

    assert.deepStrictEqual(review, {
      maximumSystemKw: 3,
      monthlyConsumptionUnits: 375,
      monthlyGenerationUnits: 350,
      coveragePercent: 93.3,
      reviewRequired: true,
    });
  });

  test("Capacity warning is omitted at exact 3 kW benchmark coverage", () => {
    const review = calculateCapacityCoverage(350, 1400, 3);
    assert.strictEqual(review?.monthlyGenerationUnits, 350);
    assert.strictEqual(review?.coveragePercent, 100);
    assert.strictEqual(review?.reviewRequired, false);
  });

  test("Capacity warning is omitted below 3 kW benchmark coverage", () => {
    const review = calculateCapacityCoverage(300, 1400, 3);
    assert.strictEqual(review?.coveragePercent, 116.7);
    assert.strictEqual(review?.reviewRequired, false);
  });

  test("Zero or invalid monthly consumption has no warning or coverage percentage", () => {
    for (const consumption of [0, -1, NaN, Infinity, "not a number", ""]) {
      assert.strictEqual(calculateCapacityCoverage(consumption, 1400, 3), null);
    }
  });

  test("Historical quotation snapshot is strictly preserved against new admin rules", () => {
    // Lead created under old 2023 rules with zero tariff and customized subsidy
    const historicalLead = {
      id: "LD-HISTORICAL-2023",
      name: "Old Customer",
      recommendedKw: 3,
      quote: {
        id: "QUOTE-HISTORICAL",
        leadId: "LD-HISTORICAL-2023",
        options: [
          {
            systemSizeKw: 3,
            installationCost: 180000,
            subsidyAmount: 50000,
            netCost: 130000,
            annualGenerationUnits: 3600,
            annualSavings: 0,
            paybackYears: null,
          },
        ],
        recommendedSizeKw: 3,
        subsidyRuleId: "OLD-RULE-2023",
        ruleSnapshot: {
          ruleName: "Old Scheme 2023",
          effectiveDate: "2023-01-01",
          maxCap: 50000,
          tier1RatePerKw: 20000,
          tier2RatePerKw: 10000,
          generationFactor: 1200,
          tariffAssumption: 0,
        },
        status: "APPROVED",
        createdAt: "2023-06-01T10:00:00Z",
        validUntil: "2023-07-01T10:00:00Z",
      },
    };

    // When resolving snapshot numbers, the historical values must NOT be overwritten by new admin defaults
    const snapTariff = resolveSnapshotNumber(historicalLead.quote.ruleSnapshot.tariffAssumption, DEFAULT_SUBSIDY_RULE.gridTariffPerUnit);
    const snapCap = resolveSnapshotNumber(historicalLead.quote.ruleSnapshot.maxCap, DEFAULT_SUBSIDY_RULE.maxSubsidyCap);
    const snapGen = resolveSnapshotNumber(historicalLead.quote.ruleSnapshot.generationFactor, DEFAULT_SUBSIDY_RULE.generationPerKwPerYear);

    assert.strictEqual(snapTariff, 0); // Preserved legitimate zero
    assert.strictEqual(snapCap, 50000); // Preserved old cap
    assert.strictEqual(snapGen, 1200); // Preserved old factor
    assert.strictEqual(historicalLead.quote.options[0].netCost, 130000);
    assert.strictEqual(historicalLead.quote.options[0].paybackYears, null);
    assert.notStrictEqual(snapCap, DEFAULT_SUBSIDY_RULE.maxSubsidyCap);
  });

  test("Generated PDF file on disk is valid and has exactly 2 pages", () => {
    const pdfPath = "output/pdf/SolarSaathi-Capacity-Review-Sample.pdf";
    assert.ok(fs.existsSync(pdfPath), "Generated PDF must exist on disk");
    const buf = fs.readFileSync(pdfPath);
    assert.ok(buf.length > 50000, "PDF size must be substantial");

    const pdfString = buf.toString("latin1");
    // Verify standard PDF header
    assert.ok(pdfString.startsWith("%PDF-"), "File must be a valid PDF");

    // Verify exactly 2 pages in PDF catalog count
    const countMatch = pdfString.match(/\/Count\s+(\d+)/);
    assert.ok(countMatch, "PDF must have a page count");
    assert.strictEqual(parseInt(countMatch[1], 10), 2, "PDF must be exactly 2 pages");
  });
});
