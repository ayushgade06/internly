import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const updated = await prisma.internship.updateMany({
    where: {
      id: params.id,
      user: { email: session.user.email }, // 🔒 ownership check
    },
    data: {
        role: body.role,
        company: body.company,
        location: body.location,
        stipend: body.stipend ? Number(body.stipend) : null,
        status: body.status,
        appliedOn: body.appliedOn ? new Date(body.appliedOn) : undefined,
        notes: body.notes,
    },

  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.internship.delete({
    where: { id: params.id },
  });

  return NextResponse.json({ success: true });
}