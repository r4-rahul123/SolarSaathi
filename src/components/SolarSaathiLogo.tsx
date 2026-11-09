type SolarSaathiLogoProps = {
  size?: "sm" | "md" | "lg";
  inverse?: boolean;
  withName?: boolean;
  className?: string;
};

const sizes = {
  sm: { box: "h-8 w-8 rounded-xl", mark: "h-6 w-6", text: "text-lg" },
  md: { box: "h-10 w-10 rounded-2xl", mark: "h-7 w-7", text: "text-xl" },
  lg: { box: "h-12 w-12 rounded-2xl", mark: "h-8 w-8", text: "text-2xl" },
};

export function SolarSaathiLogo({ size = "md", inverse = false, withName = false, className = "" }: SolarSaathiLogoProps) {
  const dimension = sizes[size];

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`${dimension.box} inline-flex shrink-0 items-center justify-center bg-gradient-to-br from-[#123D2B] to-[#198754] text-white shadow-md shadow-emerald-950/20`} aria-hidden="true">
        <svg viewBox="0 0 48 48" className={dimension.mark} aria-hidden="true">
          <text
            x="24"
            y="34"
            textAnchor="middle"
            fontFamily="Arial, sans-serif"
            fontSize="29"
            fontWeight="800"
            letterSpacing="-4"
            fill="currentColor"
          >SS</text>
        </svg>
      </span>
      {withName && <span className={`${dimension.text} font-extrabold tracking-tight ${inverse ? "text-white" : "text-[#123D2B] dark:text-white"}`}>Solar<span className={inverse ? "text-emerald-300" : "text-[#198754] dark:text-emerald-400"}>Saathi</span></span>}
    </span>
  );
}
