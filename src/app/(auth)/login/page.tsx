import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        action={async () => {
          "use server";
          const { signIn } = await import("next-auth/react");
          await signIn("google");
        }}
      >
        <button className="px-6 py-3 bg-black text-white rounded-xl">
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
