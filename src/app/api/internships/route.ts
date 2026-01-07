import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔥 Disable caching for this route (VERY IMPORTANT)
export const dynamic = "force-dynamic";

/* ================= POST ================= */

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { role, company, location, status, appliedOn, stipend } = body;

  // Ensure user exists in DB
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });

  const internship = await prisma.internship.create({
    data: {
      role,
      company,
      location,
      status,
      appliedOn: new Date(appliedOn),
      stipend: stipend ? Number(stipend) : null,
      userId: user.id,
    },
  });

  return NextResponse.json(internship, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

/* ================= GET ================= */

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const internships = await prisma.internship.findMany({
    where: {
      user: {
        email: session.user.email,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(internships, {
    headers: {
      "Cache-Control": "no-store", // 🔥 prevents stale data
    },
  });
}
