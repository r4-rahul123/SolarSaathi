import { ArrowRight, Home, Sun, Zap } from "lucide-react";

interface EnergyFlowProps {
  systemSizeKw: number;
  annualGenerationUnits: number;
}

export function AnimatedEnergyFlow({ systemSizeKw, annualGenerationUnits }: EnergyFlowProps) {
  const steps = [
    { icon: Sun, label: "Sunlight" },
    { icon: Zap, label: `${systemSizeKw} kW system` },
    { icon: Home, label: "Home & grid" },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-end">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Estimated solar generation</h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">A planning estimate based on the selected system size.</p>
        </div>
        <p className="font-mono text-lg font-semibold text-[#174b32] dark:text-emerald-300">
          ~{annualGenerationUnits.toLocaleString()} units / year
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-4 py-5 dark:bg-slate-950">
        {steps.map(({ icon: Icon, label }, index) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#e7f3ec] text-[#174b32] dark:bg-emerald-950 dark:text-emerald-300">
                <Icon className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
            </div>
            {index < steps.length - 1 && <ArrowRight className="ml-auto h-4 w-4 shrink-0 text-slate-400" />}
          </div>
        ))}
      </div>
    </section>
  );
}
