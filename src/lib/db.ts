import { Lead, SubsidyRule, PricingRule, ProjectStage } from "@/types/solar";
import {
  calculateLeadScore,
  calculateSolarQuote,
  DEFAULT_PRICING_RULES,
  DEFAULT_SUBSIDY_RULE,
  recommendSystemSize,
} from "./solar-calculator";

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
        status: "READ",
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
      extractionNotes: "Bill parsed successfully. Tenant occupancy flagged.",
      extractedAt: "2026-11-02T11:21:00Z",
    },
    quote: calculateSolarQuote("LD-30902", 2),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead & Bill Approved",
        description: "Assigned to Tele-Advisory Desk for landlord consent consultation.",
        completedAt: "2026-11-02T11:20:00Z",
        isCurrent: true,
      },
    ],
    notifications: [
      {
        id: "nt-2",
        channel: "SMS",
        recipient: "+91 97654 32189",
        message: "Hello Rohit, SolarSaathi advisory desk has received your inquiry. Our consultant will call you to discuss landlord NOC requirements.",
        sentAt: "2026-11-02T11:22:00Z",
        status: "DELIVERED",
      },
    ],
    assignedStaff: "Sunil Deshpande",
    lastUpdatedDaysAgo: 2,
    isStuck: false,
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
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 5,
      roofAreaPoints: 14,
      consumptionPoints: 4,
      serviceabilityPoints: 10,
      totalScore: 58,
      tier: "Low",
      explanation: "Small bill (<₹800/mo). Payback period is too long to justify ₹2,500 site visit. Queued for phone consultation instead.",
    },
    status: "LEAD_APPROVED",
    nextAction: "SHORT_CALL",
    billExtraction: {
      consumerNumber: "410055214981",
      tariff: "LT-I (Residential)",
      sanctionedLoadKw: 1.0,
      monthlyUnits: 85,
      monthlyAmount: 650,
      billingUnit: "Nagpur West",
      confidence: {
        consumerNumber: 0.98,
        tariff: 0.95,
        sanctionedLoadKw: 0.91,
        monthlyUnits: 0.88,
        overall: "High",
      },
      extractionNotes: "Bill verified. Low monthly units noted.",
      extractedAt: "2026-11-02T15:46:00Z",
    },
    quote: calculateSolarQuote("LD-30915", 1),
    timeline: [
      {
        stage: "LEAD_APPROVED",
        title: "1. Lead Evaluated",
        description: "Small residential rooftop inquiry. Diverted to phone consultation.",
        completedAt: "2026-11-02T15:45:00Z",
        isCurrent: true,
      },
    ],
    notifications: [],
    assignedStaff: "Sunil Deshpande",
    lastUpdatedDaysAgo: 3,
    isStuck: false,
    createdAt: "2026-11-02T15:45:00Z",
    updatedAt: "2026-11-02T15:46:00Z",
  },
  {
    id: "PR-1025",
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
    recommendedKw: 3,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 25,
      roofAreaPoints: 20,
      consumptionPoints: 20,
      serviceabilityPoints: 10,
      totalScore: 100,
      tier: "High",
      explanation: "Priority High-Capacity Installation.",
    },
    status: "NET_METERING",
    nextAction: "INSTALL_METER",
    quote: calculateSolarQuote("PR-1025", 3),
    timeline: [
      { stage: "LEAD_APPROVED", title: "1. Lead Approved", completedAt: "2026-10-10T09:00:00Z", description: "Verified." },
      { stage: "SITE_SURVEY", title: "2. Site Survey Approved", completedAt: "2026-10-12T16:00:00Z", description: "Concrete slab OK." },
      { stage: "QUOTATION_APPROVED", title: "3. Quotation Accepted", completedAt: "2026-10-14T11:00:00Z", description: "3 kW selected." },
      { stage: "ADVANCE_PAYMENT", title: "4. Advance Received", completedAt: "2026-10-15T15:00:00Z", description: "₹19,500 token paid." },
      { stage: "INSTALLATION", title: "5. Installation Completed", completedAt: "2026-10-22T12:00:00Z", description: "Panels mounted." },
      { stage: "NET_METERING", title: "6. MSEDCL Net Metering", description: "Awaiting DISCOM inspector test bench approval.", isCurrent: true },
    ],
    notifications: [
      {
        id: "nt-3",
        channel: "WhatsApp",
        recipient: "+91 98222 77110",
        message: "Update for PR-1025: Net-metering application submitted to MSEDCL Nagpur Urban circle.",
        sentAt: "2026-10-25T11:00:00Z",
        status: "READ",
      },
    ],
    assignedStaff: "Amit Verma",
    lastUpdatedDaysAgo: 10,
    isStuck: true, // Flagged because no update in 10 days (>7 days threshold)
    createdAt: "2026-10-10T09:00:00Z",
    updatedAt: "2026-10-25T11:00:00Z",
  },
  {
    id: "PR-1026",
    name: "Sunita Patil",
    phone: "+91 98230 55412",
    address: "Plot 18, Pratap Nagar",
    pincode: "440022",
    city: "Nagpur",
    occupancy: "Owner",
    roofType: "Concrete Flat",
    roofAreaSqFt: 700,
    monthlyBill: 3400,
    avgUnitsPerMonth: 360,
    recommendedKw: 3,
    scoreBreakdown: {
      ownershipPoints: 25,
      billPoints: 25,
      roofAreaPoints: 20,
      consumptionPoints: 20,
      serviceabilityPoints: 10,
      totalScore: 100,
      tier: "High",
      explanation: "Full turnkey installation.",
    },
    status: "SUBSIDY_APPLICATION",
    nextAction: "VERIFY_DOCS",
    quote: calculateSolarQuote("PR-1026", 3),
    timeline: [
      { stage: "LEAD_APPROVED", title: "1. Lead Approved", completedAt: "2026-10-01T09:00:00Z", description: "Verified." },
      { stage: "INSTALLATION", title: "5. Installation Done", completedAt: "2026-10-12T16:00:00Z", description: "Done." },
      { stage: "NET_METERING", title: "6. Meter Live", completedAt: "2026-10-18T10:00:00Z", description: "Commissioned." },
      { stage: "SUBSIDY_APPLICATION", title: "7. Subsidy Claim Submitted", description: "Awaiting DBT bank clearance.", isCurrent: true },
    ],
    notifications: [],
    assignedStaff: "Sunil Deshpande",
    lastUpdatedDaysAgo: 15,
    isStuck: true, // Flagged because no update in 15 days (>7 days threshold)
    createdAt: "2026-10-01T09:00:00Z",
    updatedAt: "2026-10-18T10:00:00Z",
  },
];

declare global {
  // eslint-disable-next-line no-var
  var __solarLeadsStore: Lead[] | undefined;
  // eslint-disable-next-line no-var
  var __solarRulesStore: SubsidyRule[] | undefined;
  // eslint-disable-next-line no-var
  var __solarPricingStore: PricingRule[] | undefined;
}

globalThis.__solarLeadsStore = globalThis.__solarLeadsStore || INITIAL_LEADS;
globalThis.__solarRulesStore = globalThis.__solarRulesStore || INITIAL_RULES;
globalThis.__solarPricingStore = globalThis.__solarPricingStore || INITIAL_PRICING;

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
    >
  ): Lead {
    const rules = this.getSubsidyRules();
    const activeRule = rules.find((r) => r.isActive) || DEFAULT_SUBSIDY_RULE;

    const recommendedKw = recommendSystemSize(leadData.avgUnitsPerMonth, activeRule);
    const scoreResult = calculateLeadScore(
      leadData.occupancy,
      leadData.monthlyBill,
      leadData.avgUnitsPerMonth,
      leadData.roofAreaSqFt,
      leadData.pincode
    );

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newId = `PROJECT-${randomSuffix}`;

    const quote = calculateSolarQuote(newId, recommendedKw, activeRule);

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
          title: "1. Lead & Bill Received",
          description: "Verified via SolarSaathi AI Intake.",
          completedAt: new Date().toISOString(),
          isCurrent: scoreResult.breakdown.tier !== "High",
        },
        ...(scoreResult.breakdown.tier === "High"
          ? [
              {
                stage: "SITE_SURVEY" as const,
                title: "2. Site Survey Scheduled",
                description: "Assigned for rooftop shadow analysis.",
                completedAt: new Date().toISOString(),
                isCurrent: true,
              },
            ]
          : []),
      ],
      notifications: [
        {
          id: `nt-${Date.now()}`,
          channel: "WhatsApp",
          recipient: leadData.phone,
          message: `Namaskar ${leadData.name}, your solar quotation (Ref: ${newId}) is ready. Track anytime: solarsaathi.app/track/${newId}`,
          sentAt: new Date().toISOString(),
          status: "DELIVERED",
        },
      ],
      assignedStaff: "Sunil Deshpande",
      lastUpdatedDaysAgo: 0,
      isStuck: false,
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

    const existing = leads[index];
    const newStatus = updates.status || existing.status;

    // Define 8 canonical stages with descriptive titles
    const STAGE_METADATA: Record<ProjectStage, { title: string; description: string; msg: string }> = {
      LEAD_APPROVED: {
        title: "1. Lead & Bill Approved",
        description: "MSEDCL Bill verified via Gemini Vision OCR & roof feasibility evaluated.",
        msg: "Lead & MSEDCL bill verified. Immediate feasibility confirmed.",
      },
      SITE_SURVEY: {
        title: "2. Rooftop Site Survey",
        description: "Certified solar engineer assigned for physical shadow-free area measurement.",
        msg: "Site surveyor assigned to inspect your rooftop structure and shadow clearance.",
      },
      QUOTATION_APPROVED: {
        title: "3. Quotation Approved",
        description: "System size selected and ₹78,000 central subsidy reserved under dated rule.",
        msg: "Quotation approved! 3 kW rooftop solar plant locked with ₹78,000 subsidy reservation.",
      },
      ADVANCE_PAYMENT: {
        title: "4. Advance Token Payment",
        description: "10% installation advance recorded via mock payment gateway.",
        msg: "10% Advance payment received. Equipment procurement dispatched from Nagpur warehouse.",
      },
      INSTALLATION: {
        title: "5. Solar Panel Mounting",
        description: "Tier-1 Mono PERC panels & BIS-certified on-grid inverter mounting completed.",
        msg: "Solar panel mounting and on-grid inverter wiring completed at your rooftop.",
      },
      NET_METERING: {
        title: "6. MSEDCL Bi-directional Net Meter",
        description: "Grid synchronization and DISCOM inspector testing approved.",
        msg: "MSEDCL bi-directional net-meter installed. Clean solar power is now feeding into the Nagpur grid!",
      },
      SUBSIDY_APPLICATION: {
        title: "7. National Portal DBT Filing",
        description: "Joint commissioning report uploaded to central PM Surya Ghar portal.",
        msg: "National Portal DBT subsidy claim filed with MSEDCL commissioning report.",
      },
      SUBSIDY_CREDITED: {
        title: "8. ₹78,000 DBT Credited",
        description: "Direct Benefit Transfer successfully credited into consumer's bank account.",
        msg: "Congratulations! ₹78,000 direct subsidy credited into your bank account. SolarSaathi project complete!",
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
    let newNotifications = existing.notifications || [];

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

      const meta = STAGE_METADATA[updates.status];
      newNotifications = [
        ...newNotifications,
        {
          id: `nt-${Date.now()}`,
          channel: "WhatsApp",
          recipient: existing.phone,
          message: `Namaskar ${existing.name}! Update for Ref #${existing.id}: ${meta.msg} Track live: solarsaathi.app/track/${existing.id}`,
          sentAt: new Date().toISOString(),
          status: "DELIVERED",
        },
      ];
    }

    const updated: Lead = {
      ...existing,
      ...updates,
      timeline: updates.timeline || newTimeline,
      notifications: updates.notifications || newNotifications,
      lastUpdatedDaysAgo: 0,
      isStuck: false,
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

  static getPricingRules(): PricingRule[] {
    return globalThis.__solarPricingStore || INITIAL_PRICING;
  }

  static updatePricingRule(kw: number, price: number): PricingRule | null {
    const pricing = globalThis.__solarPricingStore || INITIAL_PRICING;
    const index = pricing.findIndex((p) => p.systemSizeKw === kw);
    if (index === -1) return null;

    pricing[index] = { ...pricing[index], price, effectiveFrom: new Date().toISOString().split("T")[0] };
    globalThis.__solarPricingStore = pricing;
    return pricing[index];
  }
}
