import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Handle POST requests to create a new internship application


export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const email = session.user.email.toLowerCase();

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
    where: { email },
    update: {},
    create: {
      email,
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

// Handle GET requests to fetch all internship applications

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const email = session.user.email.toLowerCase();

  const [internships, extensionApps] = await Promise.all([
    prisma.internship.findMany({
      where: { user: { email } },
      orderBy: { appliedOn: "desc" },
    }),
    prisma.application.findMany({
      where: { user: { email } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  // Normalize and combine applications from both sources for the table

  const merged = [
    ...internships.map((i) => ({ ...i, source: "manual" })),
    ...extensionApps.map((a) => ({
      id: a.id,
      applicationId: a.applicationId,
      role: a.role,
      company: a.company,
      location: "Remote (Detected)", 
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
