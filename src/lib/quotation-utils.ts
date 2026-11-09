import type { QuoteOption } from "../types/solar.ts";

/**
 * Mask consumer numbers of any length to ensure privacy compliance.
 * Non-empty short values (e.g. 1-8 chars) are masked with asterisks.
 * Never displays the full raw consumer number.
 */
export function maskConsumerNumber(raw?: string): string {
  const trimmed = raw?.trim() || "";
  if (!trimmed) return "—";
  if (trimmed.length <= 4) {
    return trimmed.length === 1 ? "*" : `*${trimmed.slice(-1)}`;
  }
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}****${trimmed.slice(-2)}`;
  }
  return `${trimmed.slice(0, 4)}****${trimmed.slice(-4)}`;
}

/**
 * Nullish-aware numeric resolver for historical snapshots.
 * Correctly preserves legitimate 0 (zero) values.
 */
export function resolveSnapshotNumber(val: unknown, fallback: number): number {
  if (val !== null && val !== undefined && val !== "") {
    const num = Number(val);
    if (Number.isFinite(num)) return num;
  }
  return fallback;
}

/**
 * Select the active quotation option with strict fallback alignment.
 * The activeKw will always match the returned option's systemSizeKw.
 */
export function selectQuotationOption(
  options: QuoteOption[],
  requestedKw?: number
): QuoteOption {
  if (!options || options.length === 0) {
    throw new Error("Quotation must have at least one option");
  }
  return (
    (requestedKw !== undefined && requestedKw !== null
      ? options.find((opt) => opt.systemSizeKw === requestedKw)
      : undefined) ||
    options.find((opt) => opt.systemSizeKw === 3) ||
    options[0]
  );
}

/**
 * Monthly generation calculation using explicit rounding.
 */
export function calculateMonthlyGeneration(annualUnits: number): number {
  return Math.round(annualUnits / 12);
}

export interface CapacityCoverage {
  maximumSystemKw: number;
  monthlyConsumptionUnits: number;
  monthlyGenerationUnits: number;
  coveragePercent: number;
  reviewRequired: boolean;
}

/**
 * Calculates benchmark coverage using the quotation's historical generation factor.
 * Invalid or non-positive monthly consumption has no meaningful coverage percentage.
 */
export function calculateCapacityCoverage(
  monthlyConsumption: unknown,
  generationPerKwYear: unknown,
  maximumSystemKw: unknown,
): CapacityCoverage | null {
  const consumption = toFinitePositiveNumber(monthlyConsumption);
  const generationFactor = toFinitePositiveNumber(generationPerKwYear);
  const systemKw = toFinitePositiveNumber(maximumSystemKw);

  if (consumption === null || generationFactor === null || systemKw === null) return null;

  const monthlyGeneration = systemKw * generationFactor / 12;
  if (!Number.isFinite(monthlyGeneration) || monthlyGeneration <= 0) return null;

  return {
    maximumSystemKw: systemKw,
    monthlyConsumptionUnits: consumption,
    monthlyGenerationUnits: roundToOneDecimal(monthlyGeneration),
    coveragePercent: roundToOneDecimal(monthlyGeneration / consumption * 100),
    reviewRequired: consumption > monthlyGeneration,
  };
}

export function getMaximumQuotedSystemKw(options: readonly Pick<QuoteOption, "systemSizeKw">[]): number | null {
  const sizes = options
    .map((option) => toFinitePositiveNumber(option.systemSizeKw))
    .filter((size): size is number => size !== null);
  return sizes.length ? Math.max(...sizes) : null;
}

function toFinitePositiveNumber(value: unknown): number | null {
  if (typeof value !== "number" && typeof value !== "string") return null;
  if (typeof value === "string" && value.trim() === "") return null;

  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : null;
}

function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}
