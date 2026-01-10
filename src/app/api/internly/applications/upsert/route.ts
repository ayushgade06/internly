import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const email = req.headers.get("x-user-email");
  const body = await req.json();

  if (!email || !body.applicationUrl) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const app = await prisma.application.upsert({
    where: {
      userId_applicationUrl: {
        userId: user.id,
        applicationUrl: body.applicationUrl,
      },
    },
    update: {
      company: body.company,
      role: body.role,
      stipend: body.stipend,
      description: body.description,
      status: body.status,
      source: body.source,
      updatedAt: new Date(body.updatedAt),
    },
    create: {
      applicationUrl: body.applicationUrl,
      company: body.company,
      role: body.role,
      stipend: body.stipend,
      description: body.description,
      status: body.status,
      source: body.source,
      createdAt: new Date(body.createdAt),
      updatedAt: new Date(body.updatedAt),
      userId: user.id,
    },
  });

  return NextResponse.json(app);
}
