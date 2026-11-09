export type OccupancyType = "Owner" | "Tenant";
export type RoofType = "Concrete Flat" | "Tin Shed" | "Tiled Roof" | "Other";
export type Language = "en" | "mr" | "hi";

export type LeadScoreCategory = "High" | "Medium" | "Low";

export interface ScoreBreakdown {
  ownershipPoints: number;      // max 25
  billPoints: number;           // max 25
  roofAreaPoints: number;       // max 20
  consumptionPoints: number;    // max 20
  serviceabilityPoints: number; // max 10
  totalScore: number;           // 0 - 100
  tier: LeadScoreCategory;      // Assumed bands: 70+ High, 40-69 Medium, below 40 Low
  explanation: string;
}

export type ProjectStage =
  | "LEAD_APPROVED"
  | "SITE_SURVEY"
  | "QUOTATION_APPROVED"
  | "ADVANCE_PAYMENT"
  | "INSTALLATION"
  | "NET_METERING"
  | "SUBSIDY_APPLICATION"
  | "SUBSIDY_CREDITED";

export type NextAction = "SITE_VISIT" | "SHORT_CALL" | "DISCOM_FILING" | "INSTALL_METER" | "VERIFY_DOCS";

export interface FieldConfidence {
  value: number; // 0.00 to 1.00 (e.g. 0.98 = 98%)
  status: "verified" | "needs_review" | "manual";
}

export interface BillExtraction {
  consumerNumber?: string;
  tariff?: string;
  sanctionedLoadKw?: number;
  monthlyUnits?: number;
  monthlyAmount?: number;
  billingUnit?: string;
  extractedAt?: string;
  confidence?: {
    consumerNumber?: number; // e.g. 0.98 (98%)
    tariff?: number;         // e.g. 0.95 (95%)
    sanctionedLoadKw?: number; // e.g. 0.91 (91%)
    monthlyUnits?: number;   // e.g. 0.88 (88%)
    overall: "High" | "Medium" | "Low" | "Unclear";
  };
  extractionNotes?: string;
  rawResponse?: string;
}

export interface QuoteOption {
  systemSizeKw: number;
  installationCost: number;
  subsidyAmount: number;
  netCost: number;
  annualGenerationUnits: number;
  annualSavings: number;
  monthlySavings: number;
  paybackYears: number;
  lifetimeSavings25Yrs: number;
  isRecommended?: boolean;
}

export interface SolarQuote {
  id: string;
  leadId: string;
  options: QuoteOption[];
  recommendedSizeKw: number;
  subsidyRuleId: string;
  ruleSnapshot: {
    ruleName: string;
    effectiveDate: string;
    maxCap: number;
    generationFactor: number;
    tariffAssumption: number;
  };
  status: "DRAFT" | "SENT" | "APPROVED" | "REJECTED";
  createdAt: string;
  validUntil: string;
}

export interface ProjectMilestone {
  stage: ProjectStage;
  title: string;
  description: string;
  completedAt?: string;
  isCurrent?: boolean;
}

export interface MockNotification {
  id: string;
  channel: "WhatsApp" | "SMS";
  recipient: string;
  message: string;
  sentAt: string;
  status: "PREVIEW";
}

export interface Lead {
  id: string; // Generated PROJECT-<UUID> reference
  ownerUserId?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  pincode: string;
  city: string;
  occupancy: OccupancyType;
  roofType: RoofType;
  roofAreaSqFt: number;
  monthlyBill: number;
  avgUnitsPerMonth: number;
  billImageBase64?: string;
  billImageName?: string;
  billExtraction?: BillExtraction;
  recommendedKw: number;
  scoreBreakdown: ScoreBreakdown;
  score?: LeadScoreCategory;
  scoreReason?: string;
  status: ProjectStage;
  nextAction: NextAction;
  quote?: SolarQuote;
  timeline: ProjectMilestone[];
  notifications: MockNotification[];
  assignedStaff?: string;
  lastUpdatedDaysAgo: number;
  isStuck?: boolean; // True if status unchanged for > 7 days
  createdAt: string;
  updatedAt: string;
  lastStatusChangedAt?: string;
}

export interface PricingRule {
  systemSizeKw: number;
  price: number;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface SubsidyRule {
  id: string;
  name: string;
  effectiveFrom: string;
  effectiveTo?: string;
  description: string;
  tier1RatePerKw: number; // up to 2 kW: ₹30,000
  tier2RatePerKw: number; // 3rd kW: ₹18,000
  maxSubsidyCap: number;  // ₹78,000
  generationPerKwPerYear: number; // 1,400 units
  gridTariffPerUnit: number; // ₹8.00 / kWh
  isActive: boolean;
}
