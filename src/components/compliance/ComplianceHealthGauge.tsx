import { getHealthLabel } from "@/lib/dashboard-helpers";

interface ComplianceHealthGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
}

/**
 * Circular gauge showing the compliance health score percentage.
 * Color-coded: green (≥80%), yellow (50-79%), red (<50%).
 */
export default function ComplianceHealthGauge({
  score,
  size = "lg",
}: ComplianceHealthGaugeProps) {
  const { label, color, ringColor } = getHealthLabel(score);

  const dimensions = {
    sm: { size: 80, strokeWidth: 6, fontSize: "text-lg", labelSize: "text-xs" },
    md: { size: 120, strokeWidth: 8, fontSize: "text-2xl", labelSize: "text-sm" },
    lg: { size: 160, strokeWidth: 10, fontSize: "text-3xl", labelSize: "text-sm" },
  };

  const { size: svgSize, strokeWidth, fontSize, labelSize } = dimensions[size];

  const radius = (svgSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surface-200 dark:text-surface-700"
        />
        {/* Progress ring */}
        <circle
          cx={svgSize / 2}
          cy={svgSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={ringColor}
          style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
        />
      </svg>

      {/* Score and label overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold ${fontSize} ${color}`}>{score}%</span>
        <span className={`${labelSize} font-medium ${color} mt-0.5`}>
          {label}
        </span>
      </div>
    </div>
  );
}
