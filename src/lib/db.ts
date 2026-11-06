import { Lead, SubsidyRule, PricingRule, ProjectStage } from "@/types/solar";
import { getPostgresPool } from "@/lib/postgres";
import { randomUUID } from "node:crypto";
import {
  calculateLeadScore,
  calculateSolarQuote,
  DEFAULT_PRICING_RULES,
  DEFAULT_SUBSIDY_RULE,
  recommendSystemSize,
} from "./solar-calculator";

const INITIAL_RULES: SubsidyRule[] = [DEFAULT_SUBSIDY_RULE];
const INITIAL_PRICING: PricingRule[] = DEFAULT_PRICING_RULES;
const BUILT_IN_SAMPLE_LEAD_IDS = new Set(["LD-30881", "LD-30902", "LD-30915", "PR-1025", "PR-1026"]);

let seedPromise: Promise<void> | null = null;

async function ensureDefaultRules() {
  if (!seedPromise) {
    seedPromise = (async () => {
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
    })().catch((error) => {
      seedPromise = null;
      throw error;
    });
  }
  await seedPromise;
}

export class SolarDB {
  static async getLeads(): Promise<Lead[]> {
    await ensureDefaultRules();
    const { rows } = await getPostgresPool().query<{ data: Lead }>("SELECT data FROM solar_leads ORDER BY created_at DESC");
    return rows.map((row) => row.data).filter((lead) => !BUILT_IN_SAMPLE_LEAD_IDS.has(lead.id.toUpperCase()));
  }

  static async getLeadsByOwner(ownerUserId: string): Promise<Lead[]> {
    const { rows } = await getPostgresPool().query<{ data: Lead }>(
      "SELECT data FROM solar_leads WHERE data->>'ownerUserId' = $1 ORDER BY created_at DESC",
      [ownerUserId],
    );
    return rows.map((row) => row.data);
  }

  static async getLeadById(id: string): Promise<Lead | undefined> {
    await ensureDefaultRules();
    if (BUILT_IN_SAMPLE_LEAD_IDS.has(id.toUpperCase())) return undefined;
    const { rows } = await getPostgresPool().query<{ data: Lead }>("SELECT data FROM solar_leads WHERE LOWER(id) = LOWER($1)", [id]);
    return rows[0]?.data;
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
    await ensureDefaultRules();
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

    const persistedLead = { ...newLead, billImageBase64: undefined };
    await getPostgresPool().query(
      "INSERT INTO solar_leads (id, data) VALUES ($1, $2::jsonb)",
      [newLead.id, JSON.stringify(persistedLead)],
    );
    return persistedLead;
  }

  static async updateLead(id: string, updates: Partial<Lead>): Promise<Lead | null> {
    const existing = await this.getLeadById(id);
    if (!existing) return null;
    // Define 8 canonical stages with descriptive titles
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

    await getPostgresPool().query(
      "UPDATE solar_leads SET data = $2::jsonb, updated_at = NOW() WHERE LOWER(id) = LOWER($1)",
      [id, JSON.stringify(updated)],
    );
    return updated;
  }

  static async getSubsidyRules(): Promise<SubsidyRule[]> {
    await ensureDefaultRules();
    const { rows } = await getPostgresPool().query<{ data: SubsidyRule }>("SELECT data FROM solar_rules WHERE kind = 'subsidy' ORDER BY updated_at DESC");
    return rows.map((row) => row.data);
  }

  static async updateSubsidyRule(ruleId: string, updates: Partial<SubsidyRule>): Promise<SubsidyRule | null> {
    const rules = await this.getSubsidyRules();
    const existing = rules.find((rule) => rule.id === ruleId);
    if (!existing) return null;
    const updated = {
      ...existing,
      ...updates,
    };
    await getPostgresPool().query(
      "UPDATE solar_rules SET data = $2::jsonb, updated_at = NOW() WHERE id = $1 AND kind = 'subsidy'",
      [ruleId, JSON.stringify(updated)],
    );
    return updated;
  }

  static async getPricingRules(): Promise<PricingRule[]> {
    await ensureDefaultRules();
    const { rows } = await getPostgresPool().query<{ data: PricingRule }>("SELECT data FROM solar_rules WHERE kind = 'pricing' ORDER BY updated_at DESC");
    return rows.map((row) => row.data);
  }

  static async updatePricingRule(kw: number, price: number): Promise<PricingRule | null> {
    const pricing = await this.getPricingRules();
    const existing = pricing.find((rule) => rule.systemSizeKw === kw);
    if (!existing) return null;
    const updated = { ...existing, price, effectiveFrom: new Date().toISOString().split("T")[0] };
    await getPostgresPool().query(
      "UPDATE solar_rules SET data = $2::jsonb, updated_at = NOW() WHERE id = $1 AND kind = 'pricing'",
      [`pricing-${kw}`, JSON.stringify(updated)],
    );
    return updated;
  }
}
