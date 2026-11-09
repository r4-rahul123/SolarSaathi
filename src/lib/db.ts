import { Lead, SubsidyRule, PricingRule, ProjectStage, MockNotification } from "@/types/solar";
import { getPostgresPool, hasPostgresConfig } from "@/lib/postgres";
import { withPostgresTransaction } from "@/lib/postgres-transaction";
import { createMockNotificationRecord, generateMockWhatsAppMessage } from "@/lib/mock-notifications";
import { randomUUID } from "node:crypto";
import { daysSinceStatusChange, isProjectStuck } from "@/lib/project-timing";
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
    name: "Aarav Kulkarni (Sample Customer)",
    phone: "",
    email: "",
    address: "Sample Residence, Wardha Road, Somalwada",
    pincode: "440015",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Concrete Flat",
    roofAreaSqFt: 650,
    monthlyBill: 3500,
    avgUnitsPerMonth: 375,
    recommendedKw: 3,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 25,
      roofAreaPoints: 20,
      consumptionPoints: 20,
      serviceabilityPoints: 10,
      totalScore: 100,
      tier: "High",
      explanation: "Illustrative high-priority score based on a sample owner profile with 375 kWh monthly consumption.",
    },
    status: "SITE_SURVEY",
    nextAction: "SITE_VISIT",
    billExtraction: {
      consumerNumber: "SAMPLE-410019283741",
      tariff: "LT-I (Residential Single Phase)",
      sanctionedLoadKw: 4.0,
      monthlyUnits: 375,
      monthlyAmount: 3500,
      billingUnit: "Nagpur Urban BU-41",
      confidence: {
        consumerNumber: 0.98,
        tariff: 0.95,
        sanctionedLoadKw: 0.91,
        monthlyUnits: 0.88,
        overall: "High",
      },
      extractionNotes: "Illustrative sample bill data; not a real customer record.",
      extractedAt: "2026-11-01T10:16:30Z",
    },
    quote: calculateSolarQuote("LD-30881", 3),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "Illustrative sample bill reviewed for the demo workflow.",
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
        projectId: "LD-30881",
        customerName: "Aarav Kulkarni (Sample Customer)",
        channel: "WhatsApp Mock",
        recipient: "9823012345",
        message: generateMockWhatsAppMessage("Aarav Kulkarni", "LD-30881", "LEAD_APPROVED"),
        createdAt: "2026-11-01T10:18:00Z",
        sentAt: "2026-11-01T10:18:00Z",
        stage: "LEAD_APPROVED",
        status: "Sent Mock",
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
    name: "Riya Deshmukh (Sample Customer)",
    phone: "",
    email: "",
    address: "Sample Apartment 301, Manish Nagar",
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
      tier: "Medium",
      explanation: "Tenant lead. Rooftop property rights belong to landlord. Physical survey replaced with a 5-minute phone call to avoid wasting ₹2,500 survey cost.",
    },
    status: "LEAD_APPROVED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "SAMPLE-410087654120",
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
      extractionNotes: "Illustrative tenant sample bill data; not a real customer record.",
      extractedAt: "2026-11-02T11:00:00Z",
    },
    quote: calculateSolarQuote("LD-30902", 2),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "Illustrative sample tenant bill reviewed.",
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
        projectId: "LD-30902",
        customerName: "Riya Deshmukh (Sample Customer)",
        channel: "WhatsApp Mock",
        recipient: "9823054321",
        message: generateMockWhatsAppMessage("Riya Deshmukh", "LD-30902", "LEAD_APPROVED"),
        createdAt: "2026-11-02T11:05:00Z",
        sentAt: "2026-11-02T11:05:00Z",
        stage: "LEAD_APPROVED",
        status: "Sent Mock",
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
    name: "Meera Siddiqui (Sample Customer)",
    phone: "",
    email: "",
    address: "Sample House 12, Byramji Town",
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
      tier: "Medium",
      explanation: "Low consumption (85 units/mo, bill ₹650). Solar payback exceeds 6 years. Routed to telephone advisory instead of immediate ₹2,500 site visit.",
    },
    status: "LEAD_APPROVED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "SAMPLE-410055129033",
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
      extractionNotes: "Illustrative low-consumption sample bill data; not a real customer record.",
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
        projectId: "LD-30915",
        customerName: "Meera Siddiqui (Sample Customer)",
        channel: "WhatsApp Mock",
        recipient: "9823098765",
        message: generateMockWhatsAppMessage("Meera Siddiqui", "LD-30915", "LEAD_APPROVED"),
        createdAt: "2026-11-03T09:32:00Z",
        sentAt: "2026-11-03T09:32:00Z",
        stage: "LEAD_APPROVED",
        status: "Sent Mock",
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
    name: "Dr. Rajesh Deshmukh (Sample Customer)",
    phone: "",
    email: "",
    address: "Sample Bungalow 7, Ramdaspeth",
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
    name: "Sunita Patil (Sample Customer)",
    phone: "",
    email: "",
    address: "Sample Plot 18, Trimurtee Nagar",
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

function withCurrentLeadAge(lead: Lead): Lead {
  const statusChangedAt = lead.lastStatusChangedAt || lead.updatedAt;
  const lastUpdatedDaysAgo = daysSinceStatusChange(statusChangedAt) || lead.lastUpdatedDaysAgo || 0;
  return {
    ...lead,
    lastUpdatedDaysAgo,
    isStuck: isProjectStuck(lead.status, statusChangedAt),
  };
}

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
        await pool.query(`
          CREATE TABLE IF NOT EXISTS solar_notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            project_id TEXT NOT NULL REFERENCES solar_leads(id) ON DELETE CASCADE,
            customer_id UUID REFERENCES app_users(id) ON DELETE SET NULL,
            channel TEXT NOT NULL DEFAULT 'WhatsApp Mock',
            recipient TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Sent Mock',
            stage TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            read_at TIMESTAMPTZ
          );
          CREATE INDEX IF NOT EXISTS solar_notifications_project_id_idx ON solar_notifications(project_id);
          CREATE INDEX IF NOT EXISTS solar_notifications_customer_id_idx ON solar_notifications(customer_id);
          CREATE INDEX IF NOT EXISTS solar_notifications_created_at_idx ON solar_notifications(created_at DESC);
        `);
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
          for (const notif of lead.notifications || []) {
            await pool.query(
              `INSERT INTO solar_notifications (id, project_id, customer_id, channel, recipient, message, status, stage, created_at)
               VALUES ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
               ON CONFLICT (id) DO NOTHING`,
              [
                notif.id.length === 36 ? notif.id : randomUUID(),
                lead.id,
                lead.ownerUserId || null,
                notif.channel,
                notif.recipient,
                notif.message,
                notif.status,
                notif.stage,
                notif.createdAt,
              ]
            ).catch(() => undefined);
          }
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
          return rows.map((row) => withCurrentLeadAge(row.data));
        }
      } catch (err) {
        console.warn("Postgres getLeads failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryLeads().map(withCurrentLeadAge);
  }

  static async getLeadsByOwner(ownerUserId: string): Promise<Lead[]> {
    if (hasPostgresConfig()) {
      try {
        const { rows } = await getPostgresPool().query<{ data: Lead }>(
          "SELECT data FROM solar_leads WHERE data->>'ownerUserId' = $1 ORDER BY created_at DESC",
          [ownerUserId],
        );
        return rows.map((row) => withCurrentLeadAge(row.data));
      } catch (err) {
        console.warn("Postgres getLeadsByOwner failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }
    return getMemoryLeads().filter((lead) => lead.ownerUserId === ownerUserId).map(withCurrentLeadAge);
  }

  static async getLeadById(id: string): Promise<Lead | undefined> {
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        const { rows } = await getPostgresPool().query<{ data: Lead }>("SELECT data FROM solar_leads WHERE LOWER(id) = LOWER($1)", [id]);
        if (rows[0]?.data) return withCurrentLeadAge(rows[0].data);
      } catch (err) {
        console.warn("Postgres getLeadById failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }
    const lead = getMemoryLeads().find((lead) => lead.id.toLowerCase() === id.toLowerCase());
    return lead ? withCurrentLeadAge(lead) : undefined;
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
      lastStatusChangedAt: new Date().toISOString(),
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

    const isStageValid = updates.status ? ORDERED_STAGES.includes(updates.status) : false;
    const isStatusChanged = isStageValid && updates.status !== existing.status;

    let newTimeline = existing.timeline || [];
    let newNotification: MockNotification | null = null;

    if (isStatusChanged && updates.status) {
      const targetStage = updates.status;
      const targetIdx = ORDERED_STAGES.indexOf(targetStage);

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

      // Avoid creating duplicate notification if one already exists for this exact stage
      const existingNotifs = existing.notifications || [];
      const alreadyHasStageNotif = existingNotifs.some((n) => n.stage === targetStage);

      if (!alreadyHasStageNotif) {
        newNotification = createMockNotificationRecord(existing, targetStage, "WhatsApp Mock");
      }
    }

    const currentNotifications = newNotification
      ? [newNotification, ...(existing.notifications || [])]
      : updates.notifications || existing.notifications || [];

    const updated: Lead = {
      ...existing,
      ...updates,
      timeline: updates.timeline || newTimeline,
      notifications: currentNotifications,
      lastUpdatedDaysAgo: 0,
      isStuck: false,
      updatedAt: new Date().toISOString(),
      lastStatusChangedAt: isStatusChanged
        ? new Date().toISOString()
        : existing.lastStatusChangedAt || existing.updatedAt,
    };

    // Update Postgres if available using ATOMIC TRANSACTION
    if (hasPostgresConfig()) {
      try {
        await withPostgresTransaction(getPostgresPool(), async (client) => {
          await client.query(
            "UPDATE solar_leads SET data = $2::jsonb, updated_at = NOW() WHERE LOWER(id) = LOWER($1)",
            [id, JSON.stringify(updated)],
          );
          if (newNotification) {
            await client.query(
              `INSERT INTO solar_notifications (id, project_id, customer_id, channel, recipient, message, status, stage, created_at)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [
                newNotification.id,
                newNotification.projectId,
                newNotification.customerId || null,
                newNotification.channel,
                newNotification.recipient,
                newNotification.message,
                newNotification.status,
                newNotification.stage,
                newNotification.createdAt,
              ],
            );
          }
        });
      } catch (err) {
        console.warn("Postgres status update transaction failed:", err instanceof Error ? err.message : err);
        throw err;
      }
    }

    // Update in-memory
    const memLeads = getMemoryLeads();
    const idx = memLeads.findIndex((l) => l.id.toLowerCase() === id.toLowerCase());
    if (idx !== -1) {
      memLeads[idx] = updated;
      globalThis.__solarLeadsStore = memLeads;
    }

    return updated;
  }

  static async getNotifications(filters?: {
    projectId?: string;
    customerId?: string;
    channel?: string;
    status?: string;
  }): Promise<MockNotification[]> {
    if (hasPostgresConfig()) {
      try {
        await ensureDefaultRules();
        let query = `
          SELECT
            n.id,
            n.project_id AS "projectId",
            n.customer_id AS "customerId",
            COALESCE(l.data->>'name', 'Valued Customer') AS "customerName",
            n.channel,
            n.recipient,
            n.message,
            n.status,
            n.stage,
            n.created_at AS "createdAt",
            n.read_at AS "readAt"
          FROM solar_notifications n
          LEFT JOIN solar_leads l ON LOWER(n.project_id) = LOWER(l.id)
          WHERE 1=1
        `;
        const params: unknown[] = [];
        if (filters?.projectId) {
          params.push(filters.projectId.toLowerCase());
          query += ` AND LOWER(n.project_id) = $${params.length}`;
        }
        if (filters?.customerId) {
          params.push(filters.customerId);
          query += ` AND n.customer_id = $${params.length}`;
        }
        if (filters?.channel && filters.channel !== "ALL") {
          params.push(filters.channel);
          query += ` AND n.channel = $${params.length}`;
        }
        if (filters?.status && filters.status !== "ALL") {
          params.push(filters.status);
          query += ` AND n.status = $${params.length}`;
        }
        query += " ORDER BY n.created_at DESC";

        const { rows } = await getPostgresPool().query<MockNotification>(query, params);
        if (rows && rows.length > 0) return rows;
      } catch (err) {
        console.warn("Postgres getNotifications failed, falling back to memory store:", err instanceof Error ? err.message : err);
      }
    }

    // In-memory fallback
    const allLeads = getMemoryLeads();
    let notifications: MockNotification[] = [];
    for (const lead of allLeads) {
      if (lead.notifications && lead.notifications.length > 0) {
        for (const n of lead.notifications) {
          notifications.push({
            ...n,
            projectId: n.projectId || lead.id,
            customerName: n.customerName || lead.name,
            customerId: n.customerId || lead.ownerUserId,
            recipient: n.recipient || lead.phone || "—",
            createdAt: n.createdAt || n.sentAt || lead.updatedAt,
          });
        }
      }
    }

    if (filters?.projectId) {
      notifications = notifications.filter(
        (n) => n.projectId.toLowerCase() === filters.projectId!.toLowerCase()
      );
    }
    if (filters?.customerId) {
      notifications = notifications.filter((n) => n.customerId === filters.customerId);
    }
    if (filters?.channel && filters.channel !== "ALL") {
      notifications = notifications.filter((n) => n.channel === filters.channel);
    }
    if (filters?.status && filters.status !== "ALL") {
      notifications = notifications.filter((n) => n.status === filters.status);
    }

    return notifications.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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
