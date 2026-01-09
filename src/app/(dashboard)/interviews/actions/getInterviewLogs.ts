import { prisma } from "@/lib/prisma";

export async function getInterviewLogs(userId: string) {
  return prisma.interviewLog.findMany({
    where: {
      userId,
    },
    orderBy: {
      date: "desc",
    },
  });
}
