import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: { email: string };

  try {
    const token = auth.replace("Bearer ", "");
    payload = jwt.verify(
      token,
      process.env.INTERNLY_JWT_SECRET!
    ) as { email: string };
    payload.email = payload.email.toLowerCase();
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const body = await req.json();
  const applications = body.applications || [];

  if (!Array.isArray(applications)) {
    return NextResponse.json(
      { error: "Invalid applications payload (must be an array)" },
      { status: 400 }
    );
  }

  // Ensure user exists
  const email = payload.email;
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  });

  const receivedIds = (applications as any[]).map(a => a.applicationId).filter(Boolean);
  console.log(`[Sync] User: ${email}, Received: ${receivedIds.length} apps`);
  const results = [];

  for (const app of applications) {
    if (!app.applicationId || !app.applicationUrl) continue;

    const stipend = app.stipend ? parseInt(String(app.stipend), 10) : null;
    const finalStipend = isNaN(stipend as any) ? null : stipend;

    const saved = await prisma.application.upsert({
      where: {
        userId_applicationId: {
          userId: user.id,
          applicationId: app.applicationId,
        },
      },
      update: {
        company: app.company,
        role: app.role,
        stipend: finalStipend,
        description: app.description,
        status: app.status,
        source: "extension",
        updatedAt: new Date(app.updatedAt || new Date()),
      },
      create: {
        applicationId: app.applicationId,
        applicationUrl: app.applicationUrl,
        company: app.company,
        role: app.role,
        stipend: finalStipend,
        description: app.description,
        status: app.status,
        source: "extension",
        createdAt: new Date(app.createdAt || new Date()),
        updatedAt: new Date(app.updatedAt || new Date()),
        userId: user.id,
      },
    });

    results.push(saved);
  }

  // Delete records NOT in the push payload (Full Sync)
  if (receivedIds.length === 0) {
    console.log(`[Sync] Cleaning up all extension records for ${user.id}`);
    await prisma.application.deleteMany({
      where: {
        userId: user.id,
        source: "extension"
      }
    });
  } else {
    console.log(`[Sync] Cleaning up missing records for ${user.id}`);
    await prisma.application.deleteMany({
      where: {
        userId: user.id,
        source: "extension",
        applicationId: { notIn: receivedIds }
      }
    });
  }

  const origin = req.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Credentials": "true",
  };

  return NextResponse.json({ count: results.length }, { headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
