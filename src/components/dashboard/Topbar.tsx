import LogoutButton from "../logout-button";

export default function Topbar({ user }: { user: any }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      {/* User Name */}
      <h1 className="text-lg font-semibold text-slate-800">
        {user?.name ?? "Welcome"}
      </h1>

      <div className="flex items-center gap-4">
        <LogoutButton />
      </div>
    </header>
  );
}
