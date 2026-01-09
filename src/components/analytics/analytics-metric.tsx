// src/components/analytics/analytics-metric.tsx

type Props = {
  title: string
  value: string | number
}

export default function AnalyticsMetric({ title, value }: Props) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}
