import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  const origin = req.headers.get("origin");

  // CORS Headers
  const headers: Record<string, string> = {};
  if (origin && (origin.startsWith("chrome-extension://") || origin.includes("localhost") || origin.includes("192.168"))) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
  }

  const token = jwt.sign(
    {
      email: session.user.email.toLowerCase(),
    },
    process.env.INTERNLY_JWT_SECRET!,
    {
      expiresIn: "1h", // Increased to 1h for development reliability
    }
  );

  return NextResponse.json({ token }, { headers });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}
