import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/* ---------------- GET: fetch interview logs ---------------- */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await prisma.interviewLog.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error("GET /api/interviews error:", error);
    return NextResponse.json(
      { error: "Failed to fetch interview logs" },
      { status: 500 }
    );
  }
}

/* ---------------- POST: create interview log ---------------- */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { round, company, mode, outcome, experience, date } =
      await req.json();

    if (!round || !company || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const log = await prisma.interviewLog.create({
      data: {
        round,
        company,
        mode,
        outcome,
        experience,
        date: new Date(date), // ✅ REQUIRED
        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error("POST /api/interviews error:", error);
    return NextResponse.json(
      { error: "Failed to create interview log" },
      { status: 500 }
    );
  }
}
