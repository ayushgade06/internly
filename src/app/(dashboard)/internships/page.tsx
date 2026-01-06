"use client";

import { useEffect, useRef, useState } from "react";
import AddInternshipModal from "@/components/internships/AddInternshipModal";
import EditInternshipModal, {
  Internship,
} from "@/components/internships/EditInternshipModal";

/* ---------------- Constants ---------------- */

const STATUSES = ["Applied", "Interview", "Offer", "Accepted", "Rejected"];

/* ---------------- Page ---------------- */

export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Internship | null>(null);

  const isEmpty = internships.length === 0;

  useEffect(() => {
    async function fetchInternships() {
      try {
        const res = await fetch("/api/internships");
        const data: Internship[] = await res.json();
        await new Promise((r) => setTimeout(r, 300));
        setInternships(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchInternships();
  }, []);

  const handleAdd = (internship: Internship) => {
    setInternships((prev) => [internship, ...prev]);
  };

  const handleUpdate = (updated: Internship) => {
    setInternships((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Delete this internship?");
    if (!ok) return;

    // optimistic UI
    setInternships((prev) => prev.filter((i) => i.id !== id));

    await fetch(`/api/internships/${id}`, {
      method: "DELETE",
    });
  };

  return (
    <>
      <div className="space-y-8 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Internships</h1>
            <p className="text-slate-600 mt-1">
              Track all your internship applications in one place
            </p>
          </div>

          <button
            onClick={() => setOpen(true)}
            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-800"
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
              <thead className="bg-slate-50 border-b text-slate-600">
                <tr>
                  <th className="px-6 py-4 font-medium text-left">Role</th>
                  <th className="px-6 py-4 font-medium text-left">Company</th>
                  <th className="px-6 py-4 font-medium text-left">Location</th>
                  <th className="px-6 py-4 font-medium text-left">Stipend</th>
                  <th className="px-6 py-4 font-medium text-left">Status</th>
                  <th className="px-6 py-4 font-medium text-left">
                    Applied On
                  </th>
                  <th className="px-6 py-4 font-medium text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {internships.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-none hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium">{item.role}</td>
                    <td className="px-6 py-4">{item.company}</td>
                    <td className="px-6 py-4">{item.location}</td>
                    <td className="px-6 py-4">
                      {item.stipend ? `₹${item.stipend}` : "—"}
                    </td>

                    {/* INLINE STATUS */}
                    <td className="px-6 py-4">
                      <InlineStatusDropdown
                        internship={item}
                        onUpdate={handleUpdate}
                      />
                    </td>

                    <td className="px-6 py-4">
                      {item.appliedOn
                        ? new Date(item.appliedOn).toLocaleDateString()
                        : "—"}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => setEditing(item)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {open && (
        <AddInternshipModal
          onClose={() => setOpen(false)}
          onAdd={handleAdd}
        />
      )}

      {editing && (
        <EditInternshipModal
          internship={editing}
          onClose={() => setEditing(null)}
          onSave={handleUpdate}
        />
      )}
    </>
  );
}

/* ---------------- Inline Status Dropdown ---------------- */

function InlineStatusDropdown({
  internship,
  onUpdate,
}: {
  internship: Internship;
  onUpdate: (updated: Internship) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const styles: Record<string, string> = {
    Applied: "bg-blue-500/10 text-blue-700",
    Interview: "bg-amber-500/10 text-amber-700",
    Offer: "bg-emerald-500/10 text-emerald-700",
    Accepted: "bg-emerald-500/10 text-emerald-700",
    Rejected: "bg-red-500/10 text-red-700",
  };

  function openMenu() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 6,
      left: rect.left,
    });
    setOpen(true);
  }

  async function changeStatus(status: string) {
    setOpen(false);
    onUpdate({ ...internship, status });

    await fetch(`/api/internships/${internship.id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  }

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`px-3 py-1 rounded-full text-xs font-medium ${styles[internship.status]}`}
      >
        {internship.status}
      </button>

      {open && (
        <div
          className="fixed z-50 min-w-[9rem] rounded-lg bg-white shadow-lg ring-1 ring-black/5 overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          {STATUSES.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => changeStatus(status)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100
                ${
                  internship.status === status
                    ? "bg-slate-100 font-medium"
                    : "text-slate-700"
                }`}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------------- Helpers ---------------- */

function InternshipsSkeleton() {
  return <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />;
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white border rounded-xl p-8 text-center">
      <button
        onClick={onAdd}
        className="bg-slate-900 text-white px-4 py-2 rounded-xl"
      >
        Add Internship
      </button>
    </div>
  );
}
