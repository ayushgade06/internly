"use client";

import { useEffect, useState } from "react";
import InterviewCard from "./components/InterviewCard";
import AddInterviewModal from "./components/AddInterviewModal";
import EditInterviewModal from "./components/EditInterviewModal";

type InterviewLog = {
  id: string;
  round: string;
  company: string;
  mode: string;
  outcome: string;
  experience: string;
  date: string;
};

export default function InterviewsPage() {
  const [logs, setLogs] = useState<InterviewLog[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<InterviewLog | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchLogs() {
    try {
      setLoading(true);
      const res = await fetch("/api/interviews");
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch interview logs", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/interviews/${id}`, { method: "DELETE" });
    setLogs((prev) => prev.filter((log) => log.id !== id));
  }

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Interview Logs
        </h1>
        <p className="text-slate-500 mt-1">
          Track and reflect on your interview experiences
        </p>
      </section>

      {/* Action */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        + Add Interview Log
      </button>

      {/* Logs */}
      <div className="space-y-4">
        {loading ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
            Loading interview logs...
          </div>
        ) : logs.length === 0 ? (
          <div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">
            No interview logs yet.
          </div>
        ) : (
          logs.map((log) => (
            <InterviewCard
              key={log.id}
              log={log}
              onDelete={handleDelete}
              onEdit={setEditing}
            />
          ))
        )}
      </div>

      {/* Add Modal */}
      {open && (
        <AddInterviewModal
          onClose={() => setOpen(false)}
          onSaved={() => {
            setOpen(false);
            fetchLogs();
          }}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <EditInterviewModal
          interview={editing}
          onClose={() => setEditing(null)}
          onSave={() => {          // ✅ FIXED
            setEditing(null);
            fetchLogs();
          }}
        />
      )}
    </div>
  );
}
