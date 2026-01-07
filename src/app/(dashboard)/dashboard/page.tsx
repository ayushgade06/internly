import { getDashboardData } from "./actions/getDashboardData";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null;
  }

  const { stats, recentApplications } =
    await getDashboardData(session.user.email);

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
          value={stats.applicationsThisWeek.toString()}
          description="This week"
          accent="blue"
        />

        <MetricCard
          title="Interviews"
          value={stats.interviewsUpcoming.toString()}
          description="Upcoming"
          accent="amber"
        />

        <MetricCard
          title="Offers"
          value={stats.offersAwaiting.toString()}
          description="Awaiting response"
          accent="emerald"
        />
      </section>

      {/* Activity + CTA */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-2xl border p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            Recently Applied
          </h3>

          <div className="space-y-4">
            {recentApplications.length === 0 ? (
              <p className="text-sm text-slate-500">
                No applications yet
              </p>
            ) : (
              recentApplications.map((app) => (
                <ActivityItem
                  key={app.id}
                  title={app.role}
                  company={app.company}
                  time={new Date(app.appliedOn).toLocaleDateString(
                    "en-IN"
                  )}
                />
              ))
            )}
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

          <Link
            href="/internships"
            className="mt-6 inline-flex justify-center bg-white text-slate-900 rounded-xl px-4 py-2 font-medium hover:bg-slate-100 transition"
          >
            Add Internship
          </Link>
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
