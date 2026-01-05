import LogoutButton from "../logout-button"; 

export default function Topbar({ user }: { user: any }) {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold">Dashboard</h1>

      <div className="flex items-center gap-4">
        <span className="text-sm text-slate-600">
          {user?.name}
        </span>
        <LogoutButton />
      </div>
    </header>
  );
}
