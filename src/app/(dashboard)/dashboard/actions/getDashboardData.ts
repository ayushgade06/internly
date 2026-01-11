"use server";

import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

// ✅ Server-side check
console.log("DB URL:", process.env.DATABASE_URL);

export async function getDashboardData(email: string) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  /* 1️⃣ Applications this week */
  const [internshipsThisWeek, extensionAppsThisWeek] = await Promise.all([
    prisma.internship.count({
      where: {
        user: { email },
        appliedOn: { gte: start, lte: end },
      },
    }),
    prisma.application.count({
      where: {
        user: { email },
        createdAt: { gte: start, lte: end },
      },
    }),
  ]);

  const applicationsThisWeek = internshipsThisWeek + extensionAppsThisWeek;

  /* 2️⃣ Upcoming interviews */
  const [internshipsInterview, extensionAppsInterview] = await Promise.all([
    prisma.internship.count({
      where: { user: { email }, status: "Interview" },
    }),
    prisma.application.count({
      where: { user: { email }, status: "Interview" },
    }),
  ]);

  const interviewsUpcoming = internshipsInterview + extensionAppsInterview;

  /* 3️⃣ Offers awaiting response */
  const [internshipsOffer, extensionAppsOffer] = await Promise.all([
    prisma.internship.count({
      where: { user: { email }, status: "Offer" },
    }),
    prisma.application.count({
      where: { user: { email }, status: "Offer" },
    }),
  ]);

  const offersAwaiting = internshipsOffer + extensionAppsOffer;

  /* 4️⃣ Recently applied (Merged) */
  const [recentInternships, recentExtensionApps] = await Promise.all([
    prisma.internship.findMany({
      where: { user: { email } },
      orderBy: { appliedOn: "desc" },
      take: 4,
    }),
    prisma.application.findMany({
      where: { user: { email } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const recentApplications = [
    ...recentInternships.map((i) => ({
      id: i.id,
      role: i.role,
      company: i.company,
      appliedOn: i.appliedOn,
      status: i.status,
    })),
    ...recentExtensionApps.map((a) => ({
      id: a.id,
      role: a.role,
      company: a.company,
      appliedOn: a.createdAt,
      status: a.status,
    })),
  ]
    .sort((a, b) => b.appliedOn.getTime() - a.appliedOn.getTime())
    .slice(0, 4);

  return {
    stats: {
      applicationsThisWeek,
      interviewsUpcoming,
      offersAwaiting,
    },
    recentApplications,
  };
}
