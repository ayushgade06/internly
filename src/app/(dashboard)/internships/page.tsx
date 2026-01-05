"use client";

import { useState, useEffect } from "react";

export default function InternshipsPage() {
  const [internships, setInternships] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const isEmpty = internships.length === 0;

  useEffect(() => {
    async function fetchInternships() {
      try {
        const res = await fetch("/api/internships");
        const data = await res.json();
        setInternships(data);
      } catch (error) {
        console.error("Failed to fetch internships", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInternships();
  }, []);

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Internships
            </h1>
            <p className="text-slate-500 mt-1">
              Track all your internship applications in one place
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
          >
            + Add Internship
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <InternshipsSkeleton />
        ) : isEmpty ? (
          <EmptyState onAdd={() => setOpen(true)} />
        ) : (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr className="text-left text-slate-500">
                  <th className="px-6 py-4 font-medium">Role</th>
                  <th className="px-6 py-4 font-medium">Company</th>
                  <th className="px-6 py-4 font-medium">Location</th>
                  <th className="px-6 py-4 font-medium">Stipend</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Applied On</th>
                </tr>
              </thead>

              <tbody>
                {internships.map((item, idx) => (
                  <tr
                    key={idx}
                    className="border-b last:border-none hover:bg-slate-50 transition"
                  >
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {item.role}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.company}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.location}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.stipend
                        ? `₹${Number(item.stipend).toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {item.appliedOn
                        ? new Date(item.appliedOn).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {open && <AddInternshipModal onClose={() => setOpen(false)} />}
    </>
  );
}

/* ---------------- Status Badge ---------------- */

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Applied: "bg-blue-500/10 text-blue-600",
    Interview: "bg-amber-500/10 text-amber-600",
    Offer: "bg-emerald-500/10 text-emerald-600",
    Rejected: "bg-red-500/10 text-red-600",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${
        styles[status]
      }`}
    >
      {status}
    </span>
  );
}

/* ---------------- Empty State ---------------- */

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white border rounded-2xl p-12 text-center shadow-sm">
      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
        📄
      </div>

      <h3 className="text-lg font-semibold text-slate-900">
        No internships yet
      </h3>

      <p className="text-slate-500 mt-2 max-w-sm mx-auto">
        Start tracking your internship applications to stay organised and improve your chances.
      </p>

      <button
        onClick={onAdd}
        className="mt-6 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-slate-800 transition"
      >
        Add your first internship
      </button>
    </div>
  );
}

/* ---------------- Skeleton Loader ---------------- */

function InternshipsSkeleton() {
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-6">
          <div className="h-4 w-1/5 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/5 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-1/6 bg-slate-200 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Modal ---------------- */

function AddInternshipModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6">
        <h2 className="text-xl font-semibold">
          Add Internship
        </h2>

        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            await fetch("/api/internships", {
              method: "POST",
              body: JSON.stringify({
                role: formData.get("role"),
                company: formData.get("company"),
                location: formData.get("location"),
                stipend: formData.get("stipend"),
                status: formData.get("status"),
                appliedOn: formData.get("appliedOn"),
              }),
            });

            onClose();
            window.location.reload();
          }}
        >
          <Input name="role" label="Role" />
          <Input name="company" label="Company" />

          <div className="grid grid-cols-2 gap-4">
            <Input name="location" label="Location" />
            <Input
              name="stipend"
              label="Monthly Stipend (₹)"
              type="number"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              name="status"
              label="Status"
              options={["Applied", "Interview", "Offer", "Rejected"]}
            />
            <Input name="appliedOn" label="Applied Date" type="date" />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800"
            >
              Save Internship
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------------- Inputs ---------------- */

function Input({
  label,
  name,
  type = "text",
}: {
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        name={name}
        type={type}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
      />
    </div>
  );
}

function Select({
  label,
  name,
  options,
}: {
  label: string;
  name: string;
  options: string[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        name={name}
        className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 outline-none"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
