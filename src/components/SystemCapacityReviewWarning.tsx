import { TriangleAlert } from "lucide-react";
import { calculateCapacityCoverage } from "@/lib/quotation-utils";
import { useLanguage } from "@/context/LanguageContext";

interface SystemCapacityReviewWarningProps {
  monthlyConsumption: unknown;
  generationPerKwYear: unknown;
  maximumSystemKw: unknown;
  printCompact?: boolean;
}

export function SystemCapacityReviewWarning({
  monthlyConsumption,
  generationPerKwYear,
  maximumSystemKw,
  printCompact = false,
}: SystemCapacityReviewWarningProps) {
  const { t } = useLanguage();
  const coverage = calculateCapacityCoverage(
    monthlyConsumption,
    generationPerKwYear,
    maximumSystemKw,
  );

  if (!coverage?.reviewRequired) return null;

  const numberFormat = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 1 });

  return (
    <aside
      data-testid="system-capacity-warning"
      aria-label={t("capacityReviewRequired")}
      className={`rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-950 shadow-sm ${
        printCompact ? "p-3 text-[10px] leading-snug" : "p-4 sm:p-5 text-sm leading-relaxed"
      }`}
    >
      <div className="flex items-center gap-2">
        <TriangleAlert className="h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
        <h3 className={`${printCompact ? "text-xs" : "text-base"} font-black tracking-wide`}>
          {t("capacityReviewRequired")}
        </h3>
      </div>

      <p className="mt-2 font-medium">
        {t("maxOptionExplanation").replace("{kw}", numberFormat.format(coverage.maximumSystemKw))}
      </p>
      <p className="mt-1">
        {t("benchmarkGenerationLabel")} <strong>{numberFormat.format(coverage.monthlyGenerationUnits)} units/month</strong>; {t("coverageLabel")} <strong>{coverage.coveragePercent.toFixed(1)}%</strong> {t("ofRecordedUnits").replace("{units}", numberFormat.format(coverage.monthlyConsumptionUnits))}
      </p>
      <p className="mt-1">
        <strong>{t("manualReviewRequired")}</strong> {t("manualReviewItems")}
      </p>
    </aside>
  );
}
