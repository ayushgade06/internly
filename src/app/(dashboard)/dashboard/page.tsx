import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Welcome to Internly Dashboard
      </h1>

      <p className="mb-6">
        Logged in as <strong>{session.user?.email}</strong>
      </p>

      <LogoutButton />
    </div>
  );
}
