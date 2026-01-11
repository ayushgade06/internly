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
  if (body.description !== undefined) data.description = body.description;

  if (body.stipend !== undefined) {
    data.stipend = body.stipend ? Number(body.stipend) : null;
  }

  try {
    // Try Internship first
    const updated = await prisma.internship.update({
      where: { id },
      data: {
        ...data,
        appliedOn: body.appliedOn ? new Date(body.appliedOn) : undefined,
        followUpOn: body.followUpOn ? new Date(body.followUpOn) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch {
    // Then try Application
    try {
      const updated = await prisma.application.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });
      return NextResponse.json(updated);
    } catch (err) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }
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

  try {
    await prisma.internship.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    try {
      await prisma.application.delete({ where: { id } });
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }
  }
}
