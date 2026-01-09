interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  accent: "blue" | "amber" | "emerald";
}

const accentColors = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    border: "border-emerald-200",
  },
};

export default function MetricCard({
  title,
  value,
  description,
  accent,
}: MetricCardProps) {
  const colors = accentColors[accent];

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <p className={`text-4xl font-bold ${colors.text} mb-1`}>{value}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
