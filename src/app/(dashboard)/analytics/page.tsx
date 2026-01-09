export const dynamic = "force-dynamic";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getAnalyticsData } from "./actions/getAnalyticsData";

import AnalyticsMetric from "@/components/analytics/analytics-metric";
import ApplicationsLineChart from "@/components/analytics/applications-line-chart";
import StatusPieChart from "@/components/analytics/status-pie-chart";
import WeeklyBarChart from "@/components/analytics/weekly-bar-chart";

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return null; // or redirect to login
  }

  const data = await getAnalyticsData(session.user.email);

  return (
    <div className="bg-slate-50 min-h-screen p-8">
      <h1 className="text-3xl font-bold text-slate-800">Analytics</h1>
      <p className="text-slate-500 mb-8">
        Understand your application trends and outcomes
      </p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <AnalyticsMetric
          title="Total Applications"
          value={data.metrics.totalApplications}
        />
        <AnalyticsMetric
          title="Interview Rate"
          value={`${data.metrics.interviewRate}%`}
        />
        <AnalyticsMetric
          title="Offer Rate"
          value={`${data.metrics.offerRate}%`}
        />
      </div>

      <ApplicationsLineChart data={data.lineChart} />

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <StatusPieChart data={data.statusPie} />
        <WeeklyBarChart data={data.weeklyBar} />
      </div>
    </div>
  );
}
