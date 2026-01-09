"use client";

import { useEffect, useState } from "react";

type Internship = {
  id: string;
  role: string;
  company: string;
  status: string;
  appliedOn: string | null;
  followUpOn?: string | null;
};

type Filter = "overdue" | "week" | "all";

/* ---------- Date helpers ---------- */

function formatDate(date?: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}-${month}-${year}`;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function ApplicationPage() {
  const [items, setItems] = useState<Internship[]>([]);
  const [filter, setFilter] = useState<Filter>("overdue");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/internships", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        setItems(data);
        setLoading(false);
      });
  }, []);

  const now = new Date();
  const weekEnd = addDays(now, 7);

  const filtered = items.filter((app) => {
    if (!app.followUpOn) return filter === "all";

    const followUp = new Date(app.followUpOn);

    if (filter === "overdue") return followUp < now;
    if (filter === "week")
      return followUp >= now && followUp <= weekEnd;

    return true;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="text-slate-600 text-sm">
          Track and act on your applications
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <FilterButton
          active={filter === "overdue"}
          onClick={() => setFilter("overdue")}
        >
          Overdue
        </FilterButton>
        <FilterButton
          active={filter === "week"}
          onClick={() => setFilter("week")}
        >
          Due this week
        </FilterButton>
        <FilterButton
          active={filter === "all"}
          onClick={() => setFilter("all")}
        >
          All
        </FilterButton>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow divide-y">
        {loading && (
          <div className="p-4 text-sm text-slate-500">Loading...</div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="p-4 text-sm text-slate-500">
            No applications found
          </div>
        )}

        {filtered.map((app) => {
          const isOverdue =
            app.followUpOn &&
            new Date(app.followUpOn) < now;

          return (
            <div
              key={app.id}
              className="p-4 flex items-center justify-between"
            >
              <div>
                <p className="font-medium">
                  {app.company} — {app.role}
                </p>
                <p className="text-xs text-slate-500">
                  Applied: {formatDate(app.appliedOn)}
                </p>
                <p className="text-xs text-slate-500">
                  Follow-up: {formatDate(app.followUpOn)}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100">
                  {app.status}
                </span>

                {isOverdue && (
                  <p className="text-xs text-red-600 mt-1">
                    Follow-up overdue
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- Small UI ---------- */

function FilterButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-lg text-sm border ${
        active
          ? "bg-slate-900 text-white border-slate-900"
          : "bg-white text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
