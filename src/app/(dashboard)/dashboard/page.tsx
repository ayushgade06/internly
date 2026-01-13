import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <header className="flex items-center justify-between border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard</h1>
            <p className="text-slate-400 mt-2 text-sm">
              Logged in as <span className="text-slate-200 font-medium">{session.user?.email}</span>
            </p>
          </div>
          <LogoutButton />
        </header>

        <DashboardClient />
      </div>
    </div>
  );
}
