import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");

  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const token = auth.replace("Bearer ", "");
    const payload = jwt.verify(
      token,
      process.env.INTERNLY_JWT_SECRET!
    ) as { email: string };

    const user = await prisma.user.findUnique({
      where: { email: payload.email },
      include: { applications: true },
    });

    return NextResponse.json(user?.applications || []);
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
