import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// DELETE: Remove an interview log entry by ID


export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params; // The ID is required


  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.interviewLog.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

// PATCH: Update an existing interview log entry


export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params; // The ID is required

  const body = await req.json();

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const updatedInterview = await prisma.interviewLog.update({
    where: { id },
    data: {
      company: body.company,
      round: body.round,
      mode: body.mode,
      outcome: body.outcome,
      experience: body.experience,
      date: new Date(body.date), // Parse the date correctly

    },
  });

  return NextResponse.json(updatedInterview);
}
