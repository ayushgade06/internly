import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ================= PATCH ================= */

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, any> = {};

  if (body.role !== undefined) data.role = body.role;
  if (body.company !== undefined) data.company = body.company;
  if (body.location !== undefined) data.location = body.location;
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;

  if (body.stipend !== undefined) {
    data.stipend = body.stipend ? Number(body.stipend) : null;
  }

  if (body.appliedOn !== undefined) {
    data.appliedOn = body.appliedOn ? new Date(body.appliedOn) : null;
  }

  if (body.followUpOn !== undefined) {
    data.followUpOn = body.followUpOn ? new Date(body.followUpOn) : null;
  }

  const updated = await prisma.internship.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated, {
    headers: { "Cache-Control": "no-store" },
  });
}

/* ================= DELETE ================= */

export async function DELETE(
  _: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.internship.delete({ where: { id } });

  return NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } }
  );
}
