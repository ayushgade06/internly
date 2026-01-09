"use server";

import { prisma } from "@/lib/prisma";
import { startOfWeek, endOfWeek } from "date-fns";

// ✅ Server-side check
console.log("DB URL:", process.env.DATABASE_URL);

export async function getDashboardData(email: string) {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const end = endOfWeek(new Date(), { weekStartsOn: 1 });

  /* 1️⃣ Applications this week */
  const applicationsThisWeek = await prisma.internship.count({
  where: {
    user: {
      email: email,
    },
    appliedOn: {
      gte: start,
      lte: end,
    },
  },
});


  /* 2️⃣ Upcoming interviews */
  const interviewsUpcoming = await prisma.internship.count({
    where: {
      user: {
        email,
      },
      status: "Interview",
    },
  });

  /* 3️⃣ Offers awaiting response */
  const offersAwaiting = await prisma.internship.count({
    where: {
      user: {
        email,
      },
      status: "Offer",
    },
  });

  /* 4️⃣ Recently applied internships */
  const recentApplications = await prisma.internship.findMany({
  where: {
    user: {
      email,
    },
  },
  orderBy: {
    appliedOn: "desc",
  },
  take: 4,
  select: {
    id: true,
    role: true,
    company: true,
    appliedOn: true,
    status: true,
  },
});


  return {
    stats: {
      applicationsThisWeek,
      interviewsUpcoming,
      offersAwaiting,
    },
    recentApplications,
  };
}
