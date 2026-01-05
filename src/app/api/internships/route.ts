import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/* ================= POST ================= */

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const { role, company, location, status, appliedOn, stipend } = body;

  // 🔒 Ensure user exists
  const user = await prisma.user.upsert({
    where: { email: session.user.email },
    update: {},
    create: {
      email: session.user.email,
      name: session.user.name,
      image: session.user.image,
    },
  });

  // ✅ NO connect() ANYWHERE
  const internship = await prisma.internship.create({
    data: {
      role,
      company,
      location,
      status,
      appliedOn: new Date(appliedOn),
      stipend: stipend ? Number(stipend) : null,
      userId: user.id, // ← THIS IS CRITICAL
    },
  });

  return NextResponse.json(internship);
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

  return NextResponse.json(internships);
}
