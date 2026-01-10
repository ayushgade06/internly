import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const email = req.headers.get("x-user-email");

  if (!email) {
    return NextResponse.json(
      { error: "Missing user email" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { applications: true },
  });

  return NextResponse.json(user?.applications || []);
}
