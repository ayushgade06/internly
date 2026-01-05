export default function DashboardPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Dashboard
        </h1>
        <p className="text-slate-500">
          Track your internship progress and stay organised
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Applications Sent"
          value="12"
          description="+3 this week"
          accent="blue"
        />

        <MetricCard
          title="Interviews"
          value="3"
          description="2 upcoming"
          accent="amber"
        />

        <MetricCard
          title="Offers"
          value="1"
          description="Awaiting response"
          accent="emerald"
        />
      </section>

      {/* Activity + CTA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Recent Activity
          </h3>

          <div className="space-y-4">
            <ActivityItem
              title="Applied to Software Intern"
              company="Stripe"
              time="2 days ago"
            />
            <ActivityItem
              title="Interview Scheduled"
              company="Google"
              time="5 days ago"
            />
            <ActivityItem
              title="Application Viewed"
              company="Microsoft"
              time="1 week ago"
            />
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              Ready to apply more?
            </h3>
            <p className="text-slate-300 text-sm mt-2">
              Keep your momentum going by tracking new opportunities.
            </p>
          </div>

          <button className="mt-6 bg-white text-slate-900 rounded-xl px-4 py-2 font-medium hover:bg-slate-100 transition">
            Add Internship
          </button>
        </div>
      </section>
    </div>
  );
}

/* ---------------- Components ---------------- */

function MetricCard({
  title,
  value,
  description,
  accent,
}: {
  title: string;
  value: string;
  description: string;
  accent: "blue" | "amber" | "emerald";
}) {
  const accentMap = {
    blue: "text-blue-600 bg-blue-500/10",
    amber: "text-amber-600 bg-amber-500/10",
    emerald: "text-emerald-600 bg-emerald-500/10",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm hover:shadow-md transition">
      <div
        className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-medium ${accentMap[accent]}`}
      >
        {title}
      </div>

      <div className="mt-6">
        <p className="text-4xl font-semibold text-slate-900">
          {value}
        </p>
        <p className="text-sm text-slate-500 mt-1">
          {description}
        </p>
      </div>
    </div>
  );
}

function ActivityItem({
  title,
  company,
  time,
}: {
  title: string;
  company: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="font-medium text-slate-900">
          {title}
        </p>
        <p className="text-sm text-slate-500">
          {company}
        </p>
      </div>
      <span className="text-xs text-slate-400">
        {time}
      </span>
    </div>
  );
}
