import { prisma } from "@/lib/prisma";
import {
  calculateRate,
  formatDate,
  getLast7Days,
  normalizeStatus,
} from "@/lib/analytics/analytics.utils";
import { AnalyticsData } from "@/types/analytics";
import { StatusPiePoint } from "@/types/analytics";

export async function getAnalyticsData(
  email: string
): Promise<AnalyticsData> {
  const internships = await prisma.internship.findMany({
    where: {
      user: {
        email,
      },
    },
    select: {
      status: true,
      createdAt: true,
    },
  });

  const totalApplications = internships.length;

  // ---------- NORMALIZED COUNTS ----------
  const appliedCount = internships.filter(
    (i) => normalizeStatus(i.status) === "APPLIED"
  ).length;

  const interviewCount = internships.filter(
    (i) => normalizeStatus(i.status) === "INTERVIEW"
  ).length;

  const offerCount = internships.filter(
    (i) => normalizeStatus(i.status) === "OFFER"
  ).length;

  const rejectedCount = internships.filter(
    (i) => normalizeStatus(i.status) === "REJECTED"
  ).length;

  // ---------- Line Chart ----------
  const dateMap = new Map<string, number>();

  internships.forEach((i) => {
    const key = formatDate(i.createdAt);
    dateMap.set(key, (dateMap.get(key) || 0) + 1);
  });

  const lineChart = Array.from(dateMap.entries()).map(
    ([date, count]) => ({ date, count })
  );

  // ---------- Pie ----------
const statusPie: StatusPiePoint[] = [
  { name: "Applied", value: appliedCount },
  { name: "Interview", value: interviewCount },
  { name: "Offer", value: offerCount },
  { name: "Rejected", value: rejectedCount },
];


  // ---------- Weekly ----------
  const days = getLast7Days();

  const weeklyBar = days.map((day) => ({
    day,
    apps: internships.filter(
      (i) =>
        i.createdAt.toLocaleDateString("en-IN", {
          weekday: "short",
        }) === day
    ).length,
  }));

  return {
    metrics: {
      totalApplications,
      interviewRate: calculateRate(
        interviewCount,
        totalApplications
      ),
      offerRate: calculateRate(
        offerCount,
        totalApplications
      ),
    },
    lineChart,
    statusPie,
    weeklyBar,
  };
}
