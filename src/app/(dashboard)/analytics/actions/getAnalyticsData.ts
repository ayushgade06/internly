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
  const [internships, extensionApps] = await Promise.all([
    prisma.internship.findMany({
      where: { user: { email } },
      select: { status: true, createdAt: true },
    }),
    prisma.application.findMany({
      where: { user: { email } },
      select: { status: true, createdAt: true },
    }),
  ]);

  // Combine both sources for a complete picture
  const allEntries = [
    ...internships,
    ...extensionApps,
  ];

  const totalApplications = allEntries.length;

  // ---------- NORMALIZED COUNTS ----------
  const appliedCount = allEntries.filter(
    (i) => normalizeStatus(i.status) === "APPLIED"
  ).length;

  const interviewCount = allEntries.filter(
    (i) => normalizeStatus(i.status) === "INTERVIEW"
  ).length;

  const offerCount = allEntries.filter(
    (i) => normalizeStatus(i.status) === "OFFER"
  ).length;

  const rejectedCount = allEntries.filter(
    (i) => normalizeStatus(i.status) === "REJECTED"
  ).length;

  // ---------- Line Chart ----------
  const dateMap = new Map<string, number>();

  allEntries.forEach((i) => {
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
    apps: allEntries.filter(
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
