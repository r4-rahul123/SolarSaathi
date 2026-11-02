export type OccupancyType = "Owner" | "Tenant";
export type RoofType = "Concrete Flat" | "Tin Shed" | "Tiled Roof" | "Other";

export type LeadScore = "High" | "Medium" | "Low";

export type ProjectStatus =
  | "LEAD_RECEIVED"
  | "AI_QUALIFIED"
  | "SURVEY_SCHEDULED"
  | "SURVEY_COMPLETED"
  | "DISCOM_APPLIED"
  | "INSTALLATION_IN_PROGRESS"
  | "NET_METER_INSTALLED"
  | "SUBSIDY_CREDITED";

export type NextAction = "SITE_VISIT" | "SHORT_CALL" | "DISCOM_FILING" | "INSTALL_METER" | "VERIFY_DOCS";

export interface BillExtraction {
  consumerNumber?: string;
  tariff?: string;
  sanctionedLoadKw?: number;
  monthlyUnits?: number;
  monthlyAmount?: number;
  billingUnit?: string; // BU e.g. Nagpur Urban
  extractedAt?: string;
  confidence: "High" | "Medium" | "Low" | "Unclear";
  extractionNotes?: string;
  rawResponse?: string;
}

export interface SolarQuote {
  systemSizeKw: number;
  grossCost: number;
  subsidyAmount: number;
  netCost: number;
  annualGenerationUnits: number;
  annualSavings: number;
  monthlySavings: number;
  paybackYears: number;
  lifetimeSavings25Yrs: number;
  rateRuleId: string;
  createdAt: string;
}

export interface TimelineMilestone {
  stage: ProjectStatus;
  title: string;
  description: string;
  completedAt?: string;
  isCurrent?: boolean;
}

export interface Lead {
  id: string; // e.g. LD-30881
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
  score: LeadScore;
  scoreReason: string;
  status: ProjectStatus;
  nextAction: NextAction;
  quote?: SolarQuote;
  timeline: TimelineMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface SubsidyRuleRate {
  minKw: number;
  maxKw: number;
  ratePerKw: number;
}

export interface SubsidyRule {
  id: string;
  name: string;
  effectiveFrom: string;
  effectiveTo?: string;
  description: string;
  rates: SubsidyRuleRate[];
  maxSubsidyCap: number;
  generationPerKwPerYear: number; // default: 1400
  gridTariffPerUnit: number; // default ₹7.50
  costPerKwRate: number; // benchmark installation cost per kW
  isActive: boolean;
}
