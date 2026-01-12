import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET: Fetch the list of interview logs for the current user

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

    return NextResponse.json(
      { error: "Failed to fetch interview logs" },
      { status: 500 }
    );
  }
}

// POST: Create a new interview log entry

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
        date: new Date(date), // Date is required

        user: {
          connect: {
            email: session.user.email,
          },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {

    return NextResponse.json(
      { error: "Failed to create interview log" },
      { status: 500 }
    );
  }
}
