import { Lead, SubsidyRule } from "@/types/solar";
import { calculateSolarQuote, DEFAULT_SUBSIDY_RULE, recommendSystemSize, scoreLead } from "./solar-calculator";

// In-memory singleton store for demo & local evaluation
// Persists for the lifetime of the server process

const INITIAL_RULES: SubsidyRule[] = [DEFAULT_SUBSIDY_RULE];

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
    score: "High",
    scoreReason: "Owner with high electricity consumption (>₹2,500/mo). Excellent payback period (~3.2 years). Scheduled for priority same-day site survey.",
    status: "SURVEY_SCHEDULED",
    nextAction: "SITE_VISIT",
    billExtraction: {
      consumerNumber: "410019283741",
      tariff: "LT-I (Residential)",
      sanctionedLoadKw: 4.0,
      monthlyUnits: 340,
      monthlyAmount: 3200,
      billingUnit: "Nagpur Urban BU-41",
      confidence: "High",
      extractionNotes: "MSEDCL bill verified. Matched consumer address and sanctioned load.",
    },
    quote: calculateSolarQuote(3),
    timeline: [
      {
        stage: "LEAD_RECEIVED",
        title: "Bill Uploaded & Lead Received",
        description: "Electricity bill uploaded via mobile web portal.",
        completedAt: "2026-11-01T10:15:00Z",
      },
      {
        stage: "AI_QUALIFIED",
        title: "AI Bill Verification & Score: High",
        description: "Verified MSEDCL Consumer #410019283741. Recommended 3 kW system.",
        completedAt: "2026-11-01T10:16:30Z",
      },
      {
        stage: "SURVEY_SCHEDULED",
        title: "Roof Survey Scheduled",
        description: "Senior Solar Engineer assigned for roof structural check and shadow analysis.",
        completedAt: "2026-11-02T14:00:00Z",
        isCurrent: true,
      },
      {
        stage: "DISCOM_APPLIED",
        title: "MSEDCL Net-Metering Application",
        description: "Documentation submitted to Maharashtra State Electricity Distribution Co.",
      },
      {
        stage: "INSTALLATION_IN_PROGRESS",
        title: "Solar Panel & Inverter Installation",
        description: "Tier-1 Mono PERC panels & BIS-certified on-grid inverter mounting.",
      },
      {
        stage: "SUBSIDY_CREDITED",
        title: "Net-Meter Commissioned & ₹78,000 Subsidy Credited",
        description: "Bi-directional meter live, DBT subsidy transferred to bank account.",
      },
    ],
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
    score: "Low",
    scoreReason: "Tenant - rooftop property rights belong to owner. Physical survey replaced with a 5-minute phone call to avoid wasting ₹2,500 survey cost.",
    status: "AI_QUALIFIED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "410087654120",
      tariff: "LT-I (Residential)",
      sanctionedLoadKw: 2.0,
      monthlyUnits: 210,
      monthlyAmount: 1900,
      billingUnit: "Nagpur South",
      confidence: "High",
      extractionNotes: "Bill parsed successfully. Marked as tenant lead.",
    },
    quote: calculateSolarQuote(2),
    timeline: [
      {
        stage: "LEAD_RECEIVED",
        title: "Bill Uploaded",
        description: "Inquiry received for rental apartment.",
        completedAt: "2026-11-02T11:20:00Z",
      },
      {
        stage: "AI_QUALIFIED",
        title: "AI Score: Low (Tenant)",
        description: "Survey visit bypassed. Assigned to phone consultation desk.",
        completedAt: "2026-11-02T11:21:00Z",
        isCurrent: true,
      },
    ],
    createdAt: "2026-11-02T11:20:00Z",
    updatedAt: "2026-11-02T11:21:00Z",
  },
  {
    id: "LD-30915",
    name: "Ayesha Siddiqui",
    phone: "+91 94228 11902",
    address: "House 12, Gittikhadan, Katol Road",
    pincode: "440013",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Tin Shed",
    roofAreaSqFt: 300,
    monthlyBill: 650,
    avgUnitsPerMonth: 85,
    recommendedKw: 1,
    score: "Low",
    scoreReason: "Small bill (<₹800/mo). Payback period is too long to justify ₹2,500 site survey visit. Queued for phone consultation instead.",
    status: "AI_QUALIFIED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "410055214981",
      tariff: "LT-I (Residential)",
      sanctionedLoadKw: 1.0,
      monthlyUnits: 85,
      monthlyAmount: 650,
      billingUnit: "Nagpur West",
      confidence: "High",
      extractionNotes: "Bill verified. Low consumption noted.",
    },
    quote: calculateSolarQuote(1),
    timeline: [
      {
        stage: "LEAD_RECEIVED",
        title: "Lead Received",
        description: "Small residential rooftop inquiry.",
        completedAt: "2026-11-02T15:45:00Z",
      },
      {
        stage: "AI_QUALIFIED",
        title: "AI Score: Low (Small Bill)",
        description: "Bill amount ₹650/month. Converted from site survey to tele-advisory.",
        completedAt: "2026-11-02T15:46:00Z",
        isCurrent: true,
      },
    ],
    createdAt: "2026-11-02T15:45:00Z",
    updatedAt: "2026-11-02T15:46:00Z",
  },
  {
    id: "LD-30790",
    name: "Dr. Rajesh Deshmukh",
    phone: "+91 98222 77110",
    email: "dr.deshmukh@gmail.com",
    address: "Bunglow 9, Ramdaspeth",
    pincode: "440010",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Concrete Flat",
    roofAreaSqFt: 1200,
    monthlyBill: 5800,
    avgUnitsPerMonth: 610,
    recommendedKw: 5,
    score: "High",
    scoreReason: "Owner with high electricity consumption (>₹2,500/mo). Priority execution.",
    status: "DISCOM_APPLIED",
    nextAction: "DISCOM_FILING",
    quote: calculateSolarQuote(5),
    timeline: [
      {
        stage: "LEAD_RECEIVED",
        title: "Bill Uploaded",
        completedAt: "2026-10-20T09:00:00Z",
        description: "MSEDCL bill verified.",
      },
      {
        stage: "SURVEY_COMPLETED",
        title: "Roof Survey Approved",
        completedAt: "2026-10-22T16:00:00Z",
        description: "Concrete slab shadow-free. Structure engineered for 5 kW.",
      },
      {
        stage: "DISCOM_APPLIED",
        title: "MSEDCL Net-Metering Applied",
        completedAt: "2026-10-25T11:30:00Z",
        description: "Application #MSEDCL-NGP-2026-8819 submitted.",
        isCurrent: true,
      },
    ],
    createdAt: "2026-10-20T09:00:00Z",
    updatedAt: "2026-10-25T11:30:00Z",
  },
];

// In-memory data store with global caching to handle Next.js hot reload
declare global {
  // eslint-disable-next-line no-var
  var __solarLeadsStore: Lead[] | undefined;
  // eslint-disable-next-line no-var
  var __solarRulesStore: SubsidyRule[] | undefined;
}

globalThis.__solarLeadsStore = globalThis.__solarLeadsStore || INITIAL_LEADS;
globalThis.__solarRulesStore = globalThis.__solarRulesStore || INITIAL_RULES;

export class SolarDB {
  static getLeads(): Lead[] {
    return globalThis.__solarLeadsStore || [];
  }

  static getLeadById(id: string): Lead | undefined {
    return (globalThis.__solarLeadsStore || []).find((l) => l.id.toLowerCase() === id.toLowerCase());
  }

  static createLead(
    leadData: Omit<
      Lead,
      | "id"
      | "score"
      | "scoreReason"
      | "recommendedKw"
      | "quote"
      | "timeline"
      | "createdAt"
      | "updatedAt"
      | "status"
      | "nextAction"
    >
  ): Lead {
    const rules = this.getSubsidyRules();
    const activeRule = rules.find((r) => r.isActive) || DEFAULT_SUBSIDY_RULE;

    const recommendedKw = recommendSystemSize(leadData.avgUnitsPerMonth, activeRule);
    const scoreResult = scoreLead(leadData.occupancy, leadData.monthlyBill, leadData.avgUnitsPerMonth);
    const quote = calculateSolarQuote(recommendedKw, activeRule);

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `LD-${randomSuffix}`;

    const newLead: Lead = {
      ...leadData,
      id: newId,
      recommendedKw,
      score: scoreResult.score,
      scoreReason: scoreResult.reason,
      status: scoreResult.score === "High" ? "SURVEY_SCHEDULED" : "AI_QUALIFIED",
      nextAction: scoreResult.nextAction,
      quote,
      timeline: [
        {
          stage: "LEAD_RECEIVED",
          title: "Lead & Bill Submitted",
          description: "Details received via Vidarbha Solar intake portal.",
          completedAt: new Date().toISOString(),
        },
        {
          stage: "AI_QUALIFIED",
          title: `AI Qualification: ${scoreResult.score} Score`,
          description: scoreResult.reason,
          completedAt: new Date().toISOString(),
          isCurrent: scoreResult.score !== "High",
        },
        ...(scoreResult.score === "High"
          ? [
              {
                stage: "SURVEY_SCHEDULED" as const,
                title: "Site Survey Scheduled",
                description: "Assigned for physical rooftop shadow analysis & measurement.",
                completedAt: new Date().toISOString(),
                isCurrent: true,
              },
            ]
          : []),
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    globalThis.__solarLeadsStore = [newLead, ...(globalThis.__solarLeadsStore || [])];
    return newLead;
  }

  static updateLead(id: string, updates: Partial<Lead>): Lead | null {
    const leads = globalThis.__solarLeadsStore || [];
    const index = leads.findIndex((l) => l.id.toLowerCase() === id.toLowerCase());
    if (index === -1) return null;

    const updated = {
      ...leads[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    leads[index] = updated;
    globalThis.__solarLeadsStore = leads;
    return updated;
  }

  static getSubsidyRules(): SubsidyRule[] {
    return globalThis.__solarRulesStore || INITIAL_RULES;
  }

  static updateSubsidyRule(ruleId: string, updates: Partial<SubsidyRule>): SubsidyRule | null {
    const rules = globalThis.__solarRulesStore || INITIAL_RULES;
    const index = rules.findIndex((r) => r.id === ruleId);
    if (index === -1) return null;

    const updated = {
      ...rules[index],
      ...updates,
    };
    rules[index] = updated;
    globalThis.__solarRulesStore = rules;
    return updated;
  }
}
