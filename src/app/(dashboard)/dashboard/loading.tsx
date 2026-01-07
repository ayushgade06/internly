export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-40 bg-slate-200 rounded" />

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-28 bg-slate-200 rounded-2xl"
          />
        ))}
      </div>

      <div className="h-64 bg-slate-200 rounded-2xl" />
    </div>
  );
}
