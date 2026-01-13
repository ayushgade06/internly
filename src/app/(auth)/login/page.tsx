import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { GoogleLoginButton } from "./login-client";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950">
      <div className="w-full max-w-md p-8 rounded-lg bg-slate-900 border border-slate-800 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">Welcome Back</h1>
          <p className="text-slate-400 text-sm">
            Please sign in to your dashboard
          </p>
        </div>
        
        <GoogleLoginButton />
        
        <p className="text-center text-xs text-slate-500 leading-relaxed">
          By signing in, you agree to our <br />
          <span className="text-slate-400 cursor-pointer hover:text-slate-300">Terms of Service</span> and <span className="text-slate-400 cursor-pointer hover:text-slate-300">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
