import jwt from "jsonwebtoken";

export function verifyInternlyToken(req: Request) {
  const auth = req.headers.get("authorization");
  if (!auth) return null;

  const token = auth.replace("Bearer ", "");

  try {
    return jwt.verify(token, process.env.INTERNLY_JWT_SECRET!) as {
      email: string;
    };
  } catch {
    return null;
  }
}
