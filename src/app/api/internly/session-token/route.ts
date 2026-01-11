import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import jwt from "jsonwebtoken";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = jwt.sign(
    {
      email: session.user.email,
    },
    process.env.INTERNLY_JWT_SECRET!,
    {
      expiresIn: "15m", // short-lived on purpose
    }
  );

  return Response.json({ token });
}
