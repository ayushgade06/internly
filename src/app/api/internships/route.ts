import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/* ================= POST ================= */

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const {
    role,
    company,
    location,
    status,
    appliedOn,
    followUpOn,
    stipend,
    notes,
  } = await req.json();

  if (!appliedOn) {
    return new NextResponse("Applied date is required", { status: 400 });
  }

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
      followUpOn: followUpOn ? new Date(followUpOn) : null,
      stipend: stipend ? Number(stipend) : null,
      notes,
      userId: user.id,
    },
  });

  return NextResponse.json(internship, {
    headers: { "Cache-Control": "no-store" },
  });
}

/* ================= GET ================= */

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [internships, extensionApps] = await Promise.all([
    prisma.internship.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { appliedOn: "desc" },
    }),
    prisma.application.findMany({
      where: { user: { email: session.user.email } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Merge and normalize for the table view
  const merged = [
    ...internships.map((i) => ({ ...i, source: "manual" })),
    ...extensionApps.map((a) => ({
      id: a.id,
      role: a.role,
      company: a.company,
      location: "Remote (Detected)", // Or placeholder
      status: a.status,
      stipend: a.stipend,
      appliedOn: a.createdAt,
      notes: a.description,
      source: "extension",
    })),
  ].sort(
    (a, b) =>
      new Date(b.appliedOn).getTime() - new Date(a.appliedOn).getTime()
  );

  return NextResponse.json(merged, {
    headers: { "Cache-Control": "no-store" },
  });
}
