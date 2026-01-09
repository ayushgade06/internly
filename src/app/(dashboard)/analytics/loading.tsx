// src/app/(dashboard)/analytics/loading.tsx

export default function AnalyticsLoading() {
  return (
    <div className="bg-slate-50 min-h-screen p-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="h-8 w-40 bg-slate-200 rounded-md mb-2" />
        <div className="h-4 w-72 bg-slate-200 rounded-md" />
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="h-4 w-24 bg-slate-200 rounded mb-4" />
            <div className="h-8 w-20 bg-slate-200 rounded" />
          </div>
        ))}
      </div>

      {/* Line Chart Skeleton */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
        <div className="h-5 w-48 bg-slate-200 rounded mb-6" />
        <div className="h-72 bg-slate-100 rounded-xl" />
      </div>

      {/* Pie + Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm p-6"
          >
            <div className="h-5 w-40 bg-slate-200 rounded mb-6" />
            <div className="h-64 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}
