import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      email: session.user.email,
      type: "chrome-extension",
    },
    process.env.NEXTAUTH_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({ token });
}
