import { Lead, SubsidyRule, PricingRule, ProjectStage } from "@/types/solar";
import { getPostgresPool, hasPostgresConfig } from "@/lib/postgres";
import { randomUUID } from "node:crypto";
import {
  calculateLeadScore,
  calculateSolarQuote,
  DEFAULT_PRICING_RULES,
  DEFAULT_SUBSIDY_RULE,
  recommendSystemSize,
} from "./solar-calculator";

declare global {
  var __solarLeadsStore: Lead[] | undefined;
  var __solarRulesStore: SubsidyRule[] | undefined;
  var __solarPricingStore: PricingRule[] | undefined;
}

const INITIAL_RULES: SubsidyRule[] = [DEFAULT_SUBSIDY_RULE];
const INITIAL_PRICING: PricingRule[] = DEFAULT_PRICING_RULES;

const INITIAL_LEADS: Lead[] = [
  {
    id: "LD-30881",
    name: "Prashant Wankhede",
    phone: "+91 98231 44521",
    email: "prashant.w@gmail.com",
    address: "Plot 42, Wardha Road, Somalwada",
    pincode: "440015",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Concrete Flat",
    roofAreaSqFt: 650,
    monthlyBill: 3200,
    avgUnitsPerMonth: 340,
    recommendedKw: 3,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 25,
      roofAreaPoints: 20,
      consumptionPoints: 20,
      serviceabilityPoints: 10,
      totalScore: 100,
      tier: "High",
      explanation: "High Priority Score (100/100). Verified owner with high consumption (340 kWh/mo). Immediate site survey approved.",
    },
    status: "SITE_SURVEY",
    nextAction: "SITE_VISIT",
    billExtraction: {
      consumerNumber: "410019283741",
      tariff: "LT-I (Residential Single Phase)",
      sanctionedLoadKw: 4.0,
      monthlyUnits: 340,
      monthlyAmount: 3200,
      billingUnit: "Nagpur Urban BU-41",
      confidence: {
        consumerNumber: 0.98,
        tariff: 0.95,
        sanctionedLoadKw: 0.91,
        monthlyUnits: 0.88,
        overall: "High",
      },
      extractionNotes: "MSEDCL bill verified. Matched consumer address and sanctioned load.",
      extractedAt: "2026-11-01T10:16:30Z",
    },
    quote: calculateSolarQuote("LD-30881", 3),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "MSEDCL Bill #410019283741 verified via Gemini Vision OCR.",
        completedAt: "2026-11-01T10:15:00Z",
      },
      {
        stage: "SITE_SURVEY",
        title: "2. Rooftop Site Survey",
        description: "Senior Solar Engineer assigned for shadow-free area measurement.",
        completedAt: "2026-11-02T14:00:00Z",
        isCurrent: true,
      },
      {
        stage: "QUOTATION_APPROVED",
        title: "3. Quotation Approved",
        description: "3 kW System selected with ₹78,000 PM Surya Ghar Subsidy.",
      },
      {
        stage: "ADVANCE_PAYMENT",
        title: "4. Advance Token Payment",
        description: "10% installation advance recorded via mock payment gateway.",
      },
      {
        stage: "INSTALLATION",
        title: "5. Solar Panel Mounting",
        description: "Tier-1 Mono PERC panels & BIS-certified on-grid inverter mounting.",
      },
      {
        stage: "NET_METERING",
        title: "6. MSEDCL Bi-directional Net Meter",
        description: "Grid synchronization and DISCOM testing.",
      },
      {
        stage: "SUBSIDY_APPLICATION",
        title: "7. National Portal DBT Filing",
        description: "Commissioning report uploaded to central subsidy portal.",
      },
      {
        stage: "SUBSIDY_CREDITED",
        title: "8. ₹78,000 DBT Credited",
        description: "Subsidy amount transferred directly into consumer's bank account.",
      },
    ],
    notifications: [
      {
        id: "nt-1",
        channel: "WhatsApp",
        recipient: "+91 98231 44521",
        message: "Namaskar Prashant ji, your 3 kW SolarSaathi quote (Ref: LD-30881) with ₹78,000 PM subsidy is ready. Track here: solarsaathi.app/track/LD-30881",
        sentAt: "2026-11-01T10:18:00Z",
        status: "PREVIEW",
      },
    ],
    assignedStaff: "Sunil Deshpande",
    lastUpdatedDaysAgo: 1,
    isStuck: false,
    createdAt: "2026-11-01T10:15:00Z",
    updatedAt: "2026-11-02T14:00:00Z",
  },
  {
    id: "LD-30902",
    name: "Rohit Meshram",
    phone: "+91 97654 32189",
    email: "rohit.meshram@yahoo.com",
    address: "Flat 301, Manish Nagar",
    pincode: "440025",
    city: "Nagpur",
    occupancy: "Tenant",
    roofType: "Concrete Flat",
    roofAreaSqFt: 400,
    monthlyBill: 1900,
    avgUnitsPerMonth: 210,
    recommendedKw: 2,
    scoreBreakdown: {
      ownershipPoints: 5,
      billPoints: 20,
      roofAreaPoints: 14,
      consumptionPoints: 14,
      serviceabilityPoints: 10,
      totalScore: 63,
      tier: "Low",
      explanation: "Tenant lead. Rooftop property rights belong to landlord. Physical survey replaced with a 5-minute phone call to avoid wasting ₹2,500 survey cost.",
    },
    status: "LEAD_APPROVED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "410087654120",
      tariff: "LT-I (Residential)",
      sanctionedLoadKw: 2.0,
      monthlyUnits: 210,
      monthlyAmount: 1900,
      billingUnit: "Nagpur South",
      confidence: {
        consumerNumber: 0.98,
        tariff: 0.95,
        sanctionedLoadKw: 0.91,
        monthlyUnits: 0.88,
        overall: "High",
      },
      extractionNotes: "MSEDCL tenant bill parsed.",
      extractedAt: "2026-11-02T11:00:00Z",
    },
    quote: calculateSolarQuote("LD-30902", 2),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "MSEDCL Bill #410087654120 verified.",
        completedAt: "2026-11-02T11:00:00Z",
        isCurrent: true,
      },
      {
        stage: "SITE_SURVEY",
        title: "2. Rooftop Site Survey",
        description: "Scheduled upon landlord NOC confirmation.",
      },
    ],
    notifications: [
      {
        id: "nt-2",
        channel: "SMS",
        recipient: "+91 97654 32189",
        message: "Hi Rohit, thanks for your SolarSaathi interest! Since you are renting, our advisor will call to guide you on landlord NOC. Ref: LD-30902",
        sentAt: "2026-11-02T11:05:00Z",
        status: "PREVIEW",
      },
    ],
    assignedStaff: "Pooja Sharma",
    lastUpdatedDaysAgo: 2,
    isStuck: false,
    createdAt: "2026-11-02T11:00:00Z",
    updatedAt: "2026-11-02T11:05:00Z",
  },
  {
    id: "LD-30915",
    name: "Ayesha Siddiqui",
    phone: "+91 94228 11902",
    email: "ayesha.s@outlook.com",
    address: "House 12, Byramji Town",
    pincode: "440013",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Tiled Roof",
    roofAreaSqFt: 300,
    monthlyBill: 650,
    avgUnitsPerMonth: 85,
    recommendedKw: 1,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 5,
      roofAreaPoints: 14,
      consumptionPoints: 4,
      serviceabilityPoints: 10,
      totalScore: 58,
      tier: "Low",
      explanation: "Low consumption (85 units/mo, bill ₹650). Solar payback exceeds 6 years. Routed to telephone advisory instead of immediate ₹2,500 site visit.",
    },
    status: "LEAD_APPROVED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "410055129033",
      tariff: "LT-I (Residential)",
      sanctionedLoadKw: 1.0,
      monthlyUnits: 85,
      monthlyAmount: 650,
      billingUnit: "Nagpur Central",
      confidence: {
        consumerNumber: 0.96,
        tariff: 0.94,
        sanctionedLoadKw: 0.89,
        monthlyUnits: 0.85,
        overall: "High",
      },
      extractionNotes: "Low consumption detected.",
      extractedAt: "2026-11-03T09:30:00Z",
    },
    quote: calculateSolarQuote("LD-30915", 1),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "Bill details registered.",
        completedAt: "2026-11-03T09:30:00Z",
        isCurrent: true,
      },
    ],
    notifications: [
      {
        id: "nt-3",
        channel: "WhatsApp",
        recipient: "+91 94228 11902",
        message: "Hello Ayesha ji, your 1 kW Solar estimate is ₹45,000 with ₹30,000 PM subsidy. Our team will call you shortly to discuss. Ref: LD-30915",
        sentAt: "2026-11-03T09:32:00Z",
        status: "PREVIEW",
      },
    ],
    assignedStaff: "Amit Verma",
    lastUpdatedDaysAgo: 3,
    isStuck: false,
    createdAt: "2026-11-03T09:30:00Z",
    updatedAt: "2026-11-03T09:32:00Z",
  },
  {
    id: "PR-1025",
    name: "Dr. Rajesh Deshmukh",
    phone: "+91 98222 77110",
    email: "rajesh.deshmukh@gmail.com",
    address: "Bungalow 7, Ramdaspeth",
    pincode: "440010",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Concrete Flat",
    roofAreaSqFt: 1200,
    monthlyBill: 4800,
    avgUnitsPerMonth: 520,
    recommendedKw: 3,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 25,
      roofAreaPoints: 20,
      consumptionPoints: 20,
      serviceabilityPoints: 10,
      totalScore: 100,
      tier: "High",
      explanation: "Premium owner lead. 3 kW system fully installed, currently stuck at Net Metering DISCOM inspection.",
    },
    status: "NET_METERING",
    nextAction: "INSTALL_METER",
    quote: calculateSolarQuote("PR-1025", 3),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "Approved",
        completedAt: "2026-10-15T10:00:00Z",
      },
      {
        stage: "SITE_SURVEY",
        title: "2. Rooftop Site Survey",
        description: "Survey completed",
        completedAt: "2026-10-17T11:00:00Z",
      },
      {
        stage: "QUOTATION_APPROVED",
        title: "3. Quotation Approved",
        description: "Accepted 3kW proposal",
        completedAt: "2026-10-18T16:00:00Z",
      },
      {
        stage: "ADVANCE_PAYMENT",
        title: "4. Advance Token Payment",
        description: "Payment confirmed",
        completedAt: "2026-10-20T10:00:00Z",
      },
      {
        stage: "INSTALLATION",
        title: "5. Solar Panel Mounting",
        description: "Physical mounting completed",
        completedAt: "2026-10-25T17:00:00Z",
      },
      {
        stage: "NET_METERING",
        title: "6. MSEDCL Bi-directional Net Meter",
        description: "Pending DISCOM field inspection for meter commissioning.",
        completedAt: "2026-10-26T09:00:00Z",
        isCurrent: true,
      },
    ],
    notifications: [],
    assignedStaff: "Sunil Deshpande",
    lastUpdatedDaysAgo: 11,
    isStuck: true,
    createdAt: "2026-10-15T10:00:00Z",
    updatedAt: "2026-10-26T09:00:00Z",
  },
  {
    id: "PR-1026",
    name: "Sunita Patil",
    phone: "+91 93710 44882",
    email: "sunita.patil@rediffmail.com",
    address: "Plot 18, Trimurtee Nagar",
    pincode: "440022",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Concrete Flat",
    roofAreaSqFt: 800,
    monthlyBill: 3600,
    avgUnitsPerMonth: 380,
    recommendedKw: 3,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 25,
      roofAreaPoints: 20,
      consumptionPoints: 20,
      serviceabilityPoints: 10,
      totalScore: 100,
      tier: "High",
      explanation: "High priority owner. Plant commissioned, waiting on National Portal subsidy release.",
    },
    status: "SUBSIDY_APPLICATION",
    nextAction: "DISCOM_FILING",
    quote: calculateSolarQuote("PR-1026", 3),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "Approved",
        completedAt: "2026-10-10T10:00:00Z",
      },
      {
        stage: "SITE_SURVEY",
        title: "2. Rooftop Site Survey",
        description: "Survey done",
        completedAt: "2026-10-12T11:00:00Z",
      },
      {
        stage: "QUOTATION_APPROVED",
        title: "3. Quotation Approved",
        description: "Quotation signed",
        completedAt: "2026-10-14T14:00:00Z",
      },
      {
        stage: "ADVANCE_PAYMENT",
        title: "4. Advance Token Payment",
        description: "Token paid",
        completedAt: "2026-10-16T12:00:00Z",
      },
      {
        stage: "INSTALLATION",
        title: "5. Solar Panel Mounting",
        description: "Installed",
        completedAt: "2026-10-22T17:00:00Z",
      },
      {
        stage: "NET_METERING",
        title: "6. MSEDCL Bi-directional Net Meter",
        description: "Net meter active",
        completedAt: "2026-10-24T15:00:00Z",
      },
      {
        stage: "SUBSIDY_APPLICATION",
        title: "7. National Portal DBT Filing",
        description: "Joint inspection report submitted on National Portal; waiting for DBT credit sanction.",
        completedAt: "2026-10-25T11:00:00Z",
        isCurrent: true,
      },
    ],
    notifications: [],
    assignedStaff: "Amit Verma",
    lastUpdatedDaysAgo: 12,
    isStuck: true,
    createdAt: "2026-10-10T10:00:00Z",
    updatedAt: "2026-10-25T11:00:00Z",
  },
];

function getMemoryLeads(): Lead[] {
  if (!globalThis.__solarLeadsStore) {
    globalThis.__solarLeadsStore = JSON.parse(JSON.stringify(INITIAL_LEADS));
  }
  return globalThis.__solarLeadsStore!;
}

function getMemoryRules(): SubsidyRule[] {
  if (!globalThis.__solarRulesStore) {
    globalThis.__solarRulesStore = JSON.parse(JSON.stringify(INITIAL_RULES));
  }
  return globalThis.__solarRulesStore!;
}

function getMemoryPricing(): PricingRule[] {
  if (!globalThis.__solarPricingStore) {
    globalThis.__solarPricingStore = JSON.parse(JSON.stringify(INITIAL_PRICING));
  }
  return globalThis.__solarPricingStore!;
}

let seedPromise: Promise<void> | null = null;

async function ensureDefaultRules() {
  if (!hasPostgresConfig()) return;
  if (!seedPromise) {
    seedPromise = (async () => {
      try {
        const pool = getPostgresPool();
        for (const rule of INITIAL_RULES) {
          await pool.query(
            "INSERT INTO solar_rules (id, kind, data) VALUES ($1, 'subsidy', $2::jsonb) ON CONFLICT (id) DO NOTHING",
            [rule.id, JSON.stringify(rule)],
          );
        }
        for (const rule of INITIAL_PRICING) {
          await pool.query(
            "INSERT INTO solar_rules (id, kind, data) VALUES ($1, 'pricing', $2::jsonb) ON CONFLICT (id) DO NOTHING",
            [`pricing-${rule.systemSizeKw}`, JSON.stringify(rule)],
          );
        }
        for (const lead of INITIAL_LEADS) {
          await pool.query(
            "INSERT INTO solar_leads (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO NOTHING",
            [lead.id, JSON.stringify(lead)],
          );
        }
      } catch (err) {
        console.warn("Postgres seeding skipped or failed:", err instanceof Error ? err.message : err);
      }
    })().catch((error) => {
      seedPromise = null;
      console.warn("Error initializing default Postgres records:", error);
    });
  }
  await seedPromise;
}

export class SolarDB {
  static async getLeads(): Promise<Lead[]> {
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        const { rows } = await getPostgresPool().query<{ data: Lead }>("SELECT data FROM solar_leads ORDER BY created_at DESC");
        if (rows && rows.length > 0) {
          return rows.map((row) => row.data);
        }
      } catch (err) {
        console.warn("Postgres getLeads failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryLeads();
  }

  static async getLeadsByOwner(ownerUserId: string): Promise<Lead[]> {
    if (hasPostgresConfig()) {
      try {
        const { rows } = await getPostgresPool().query<{ data: Lead }>(
          "SELECT data FROM solar_leads WHERE data->>'ownerUserId' = $1 ORDER BY created_at DESC",
          [ownerUserId],
        );
        return rows.map((row) => row.data);
      } catch (err) {
        console.warn("Postgres getLeadsByOwner failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryLeads().filter((lead) => lead.ownerUserId === ownerUserId);
  }

  static async getLeadById(id: string): Promise<Lead | undefined> {
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        const { rows } = await getPostgresPool().query<{ data: Lead }>("SELECT data FROM solar_leads WHERE LOWER(id) = LOWER($1)", [id]);
        if (rows[0]?.data) return rows[0].data;
      } catch (err) {
        console.warn("Postgres getLeadById failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryLeads().find((lead) => lead.id.toLowerCase() === id.toLowerCase());
  }

  static async createLead(
    leadData: Omit<
      Lead,
      | "id"
      | "scoreBreakdown"
      | "recommendedKw"
      | "quote"
      | "timeline"
      | "notifications"
      | "lastUpdatedDaysAgo"
      | "isStuck"
      | "createdAt"
      | "updatedAt"
      | "status"
      | "nextAction"
    >,
    saveToDatabase = true,
  ): Promise<Lead> {
    const rules = await this.getSubsidyRules();
    const today = new Date().toISOString().slice(0, 10);
    const activeRule = rules
      .filter((r) => r.isActive && r.effectiveFrom <= today && (!r.effectiveTo || r.effectiveTo >= today))
      .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))[0] || DEFAULT_SUBSIDY_RULE;

    const recommendedKw = recommendSystemSize(leadData.avgUnitsPerMonth, activeRule);
    const scoreResult = calculateLeadScore(
      leadData.occupancy,
      leadData.monthlyBill,
      leadData.avgUnitsPerMonth,
      leadData.roofAreaSqFt,
      leadData.pincode
    );

    const newId = `PROJECT-${randomUUID()}`;

    const activePricing = (await this.getPricingRules())
      .filter((rule) => rule.isActive && rule.effectiveFrom <= today)
      .reduce((latest, rule) => {
        const existing = latest.get(rule.systemSizeKw);
        if (!existing || rule.effectiveFrom > existing.effectiveFrom) latest.set(rule.systemSizeKw, rule);
        return latest;
      }, new Map<number, PricingRule>());
    const quote = calculateSolarQuote(newId, recommendedKw, activeRule, [...activePricing.values()]);

    const newLead: Lead = {
      ...leadData,
      id: newId,
      recommendedKw,
      scoreBreakdown: scoreResult.breakdown,
      score: scoreResult.breakdown.tier,
      scoreReason: scoreResult.breakdown.explanation,
      status: "LEAD_APPROVED",
      nextAction: scoreResult.nextAction,
      quote,
      timeline: [
        {
          stage: "LEAD_APPROVED",
          title: "1. Enquiry received",
          description: "Your details and electricity bill have been received. Our team will review them.",
          completedAt: new Date().toISOString(),
          isCurrent: true,
        },
      ],
      notifications: [],
      assignedStaff: "Not assigned",
      lastUpdatedDaysAgo: 0,
      isStuck: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (!saveToDatabase) return newLead;

    // Save to in-memory store
    const memLeads = getMemoryLeads();
    memLeads.unshift(newLead);
    globalThis.__solarLeadsStore = memLeads;

    // Also persist to Postgres if available
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        const persistedLead = { ...newLead, billImageBase64: undefined };
        await getPostgresPool().query(
          "INSERT INTO solar_leads (id, data) VALUES ($1, $2::jsonb) ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()",
          [newLead.id, JSON.stringify(persistedLead)],
        );
      } catch (err) {
        console.warn("Postgres insert failed, saved to memory store only:", err instanceof Error ? err.message : err);
      }
    }

    return newLead;
  }

  static async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const existing = await this.getLeadById(id);
    if (!existing) return null;

    const STAGE_METADATA: Record<ProjectStage, { title: string; description: string }> = {
      LEAD_APPROVED: {
        title: "1. Lead & Bill Approved",
        description: "Lead details received; bill values and roof feasibility need confirmation.",
      },
      SITE_SURVEY: {
        title: "2. Rooftop Site Survey",
        description: "A site survey is the next step; date and roof conditions need confirmation.",
      },
      QUOTATION_APPROVED: {
        title: "3. Quotation Approved",
        description: "The estimate was accepted. Final system size and subsidy eligibility need confirmation.",
      },
      ADVANCE_PAYMENT: {
        title: "4. Advance Token Payment",
        description: "Payment details will be updated by the project team after confirmation.",
      },
      INSTALLATION: {
        title: "5. Solar Panel Mounting",
        description: "Installation progress will be updated by the project team.",
      },
      NET_METERING: {
        title: "6. Net metering status",
        description: "Net metering progress will be updated by the project team.",
      },
      SUBSIDY_APPLICATION: {
        title: "7. National Portal DBT Filing",
        description: "Subsidy application progress will be updated by the project team.",
      },
      SUBSIDY_CREDITED: {
        title: "8. Subsidy status updated",
        description: "Subsidy credit status will be updated after confirmation.",
      },
    };

    const ORDERED_STAGES: ProjectStage[] = [
      "LEAD_APPROVED",
      "SITE_SURVEY",
      "QUOTATION_APPROVED",
      "ADVANCE_PAYMENT",
      "INSTALLATION",
      "NET_METERING",
      "SUBSIDY_APPLICATION",
      "SUBSIDY_CREDITED",
    ];

    let newTimeline = existing.timeline || [];
    if (updates.status && updates.status !== existing.status) {
      const targetIdx = ORDERED_STAGES.indexOf(updates.status);

      newTimeline = ORDERED_STAGES.map((stg, i) => {
        const meta = STAGE_METADATA[stg];
        const isPast = i < targetIdx;
        const isCurr = i === targetIdx;

        return {
          stage: stg,
          title: meta.title,
          description: meta.description,
          completedAt: isPast || isCurr ? new Date().toISOString() : undefined,
          isCurrent: isCurr,
        };
      });
    }

    const updated: Lead = {
      ...existing,
      ...updates,
      timeline: updates.timeline || newTimeline,
      notifications: updates.notifications || existing.notifications || [],
      lastUpdatedDaysAgo: 0,
      isStuck: false,
      updatedAt: new Date().toISOString(),
    };

    // Update in-memory
    const memLeads = getMemoryLeads();
    const idx = memLeads.findIndex((l) => l.id.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      memLeads[idx] = updated;
      globalThis.__solarLeadsStore = memLeads;
    }

    // Update Postgres if available
    if (hasPostgresConfig()) {
      try {
        await getPostgresPool().query(
          "UPDATE solar_leads SET data = $2::jsonb, updated_at = NOW() WHERE LOWER(id) = LOWER($1)",
          [id, JSON.stringify(updated)],
        );
      } catch (err) {
        console.warn("Postgres update failed, updated in memory store only:", err instanceof Error ? err.message : err);
      }
    }

    return updated;
  }

  static async getSubsidyRules(): Promise<SubsidyRule[]> {
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        const { rows } = await getPostgresPool().query<{ data: SubsidyRule }>("SELECT data FROM solar_rules WHERE kind = 'subsidy' ORDER BY updated_at DESC");
        if (rows && rows.length > 0) return rows.map((row) => row.data);
      } catch (err) {
        console.warn("Postgres getSubsidyRules failed, using memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryRules();
  }

  static async updateSubsidyRule(ruleId: string, updates: Partial<SubsidyRule>): Promise<SubsidyRule | null> {
    const rules = await this.getSubsidyRules();
    const existing = rules.find((rule) => rule.id === ruleId);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
    };

    // Update memory store
    const memRules = getMemoryRules();
    const idx = memRules.findIndex((r) => r.id === ruleId);
    if (idx !== -1) {
      memRules[idx] = updated;
      globalThis.__solarRulesStore = memRules;
    }

    // Update Postgres
    if (hasPostgresConfig()) {
      try {
        await getPostgresPool().query(
          "UPDATE solar_rules SET data = $2::jsonb, updated_at = NOW() WHERE id = $1 AND kind = 'subsidy'",
          [ruleId, JSON.stringify(updated)],
        );
      } catch (err) {
        console.warn("Postgres updateSubsidyRule failed:", err instanceof Error ? err.message : err);
      }
    }

    return updated;
  }

  static async getPricingRules(): Promise<PricingRule[]> {
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        const { rows } = await getPostgresPool().query<{ data: PricingRule }>("SELECT data FROM solar_rules WHERE kind = 'pricing' ORDER BY updated_at DESC");
        if (rows && rows.length > 0) return rows.map((row) => row.data);
      } catch (err) {
        console.warn("Postgres getPricingRules failed, using memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryPricing();
  }

  static async updatePricingRule(kw: number, price: number): Promise<PricingRule | null> {
    const numKw = Number(kw);
    const numPrice = Number(price);
    const pricing = await this.getPricingRules();
    const existing = pricing.find((rule) => Number(rule.systemSizeKw) === numKw);
    if (!existing) return null;
    const updated = { ...existing, price: numPrice, effectiveFrom: new Date().toISOString().split("T")[0] };

    // Update memory
    const memPricing = getMemoryPricing();
    const idx = memPricing.findIndex((p) => Number(p.systemSizeKw) === numKw);
    if (idx !== -1) {
      memPricing[idx] = updated;
      globalThis.__solarPricingStore = memPricing;
    }

    // Update Postgres
    if (hasPostgresConfig()) {
      try {
        await getPostgresPool().query(
          "UPDATE solar_rules SET data = $2::jsonb, updated_at = NOW() WHERE id = $1 AND kind = 'pricing'",
          [`pricing-${numKw}`, JSON.stringify(updated)],
        );
      } catch (err) {
        console.warn("Postgres updatePricingRule failed:", err instanceof Error ? err.message : err);
      }
    }

    return updated;
  }
}
