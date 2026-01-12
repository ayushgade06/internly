"use client";

import { useEffect, useRef, useState } from "react";
import AddInternshipModal from "@/components/internships/AddInternshipModal";
import EditInternshipModal, {
  Internship,
} from "@/components/internships/EditInternshipModal";
import { Pencil, Trash2, FileText } from "lucide-react";

const STATUSES = ["Applied", "Interview", "Offer", "Accepted", "Rejected"];

// Status-specific styling


const STATUS_STYLES: Record<string, string> = {
  Applied: "bg-blue-500/10 text-blue-700",
  Interview: "bg-amber-500/10 text-amber-700",
  Offer: "bg-emerald-500/10 text-emerald-700",
  Accepted: "bg-green-500/10 text-green-700",
  Rejected: "bg-red-500/10 text-red-700",
};

// Main internships management page


export default function InternshipsPage() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Internship | null>(null);

  // Notes hover state (rendered outside table)
  const [hoveredNotes, setHoveredNotes] = useState<{
    text: string;
    top: number;
    left: number;
  } | null>(null);

  useEffect(() => {
    async function fetchInternships() {
      try {
        const res = await fetch("/api/internships", {
          cache: "no-store",
        });
        const data: Internship[] = await res.json();
        setInternships(data);
      } catch (err) {

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

    const res = await fetch(`/api/internships/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setInternships((prev) => prev.filter((i) => i.id !== id));
  };

  function showNotes(
    e: React.MouseEvent<SVGSVGElement>,
    notes: string
  ) {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredNotes({
      text: notes,
      top: rect.bottom + 8,
      left: rect.left,
    });
  }

  function hideNotes() {
    setHoveredNotes(null);
  }

  return (
    <>
      <div className="space-y-8 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Internships</h1>
            <p className="text-slate-600 mt-1">
              Track all your internship applications
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
          <div className="h-40 bg-slate-100 rounded-xl animate-pulse" />
        ) : internships.length === 0 ? (
          <div className="bg-white border rounded-xl p-8 text-center">
            <button
              onClick={() => setOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-xl"
            >
              Add Internship
            </button>
          </div>
        ) : (
          <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b text-slate-600">
                <tr>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Company</th>
                  <th className="px-6 py-4 text-left">Location</th>
                  <th className="px-6 py-4 text-left">Stipend</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-left">Applied On</th>
                  <th className="px-6 py-4 text-left">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {internships.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b last:border-none hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-medium">
                      {item.role}
                    </td>
                    <td className="px-6 py-4">{item.company}</td>
                    <td className="px-6 py-4">{item.location}</td>
                    <td className="px-6 py-4">
                      {item.stipend ? `₹${item.stipend}` : "—"}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <InlineStatusDropdown
                        internship={item}
                        onUpdate={handleUpdate}
                      />
                    </td>

                    <td className="px-6 py-4">
                      {item.appliedOn
                        ? new Date(item.appliedOn).toLocaleDateString(
                            "en-IN"
                          )
                        : "—"}
                    </td>

                    {/* Notes */}
                    <td className="px-6 py-4">
                      {item.notes ? (
                        <FileText
                          size={16}
                          onMouseEnter={(e) =>
                            showNotes(e, item.notes!)
                          }
                          onMouseLeave={hideNotes}
                          className="text-slate-500 hover:text-slate-700 cursor-pointer"
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => setEditing(item)}
                          className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Notes Hover Card */}
      {hoveredNotes && (
        <div
          style={{
            top: hoveredNotes.top,
            left: hoveredNotes.left,
          }}
          className="fixed z-[9999] w-80 rounded-xl bg-white border shadow-xl p-4"
        >
          <p className="text-xs font-medium text-slate-500 mb-1">
            Notes
          </p>
          <p className="text-sm text-slate-800 whitespace-pre-wrap">
            {hoveredNotes.text}
          </p>
        </div>
      )}

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

// Component for updating application status in real-time


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

  function openMenu() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.left });
    setOpen(true);
  }

  async function changeStatus(status: string) {
    setOpen(false);

    const res = await fetch(`/api/internships/${internship.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Failed to update status");
      return;
    }

    const updated = await res.json();

    onUpdate({
      ...internship,
      ...updated,
    });
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
        className={`px-3 py-1 rounded-full text-xs font-medium ${
          STATUS_STYLES[internship.status]
        }`}
      >
        {internship.status}
      </button>

      {open && (
        <div
          className="fixed z-50 min-w-[10rem] rounded-xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden"
          style={{ top: pos.top, left: pos.left }}
        >
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => changeStatus(status)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-100 ${
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
