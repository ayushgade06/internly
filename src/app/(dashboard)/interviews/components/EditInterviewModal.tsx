"use client";

import { useState } from "react";

export default function EditInterviewModal({
  interview,
  onClose,
  onSave,
}: any) {
  const [form, setForm] = useState(interview);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    try {
      setSaving(true);

      const res = await fetch(`/api/interviews/${interview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const updated = await res.json();
      onSave(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 space-y-4 shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit Interview
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Company
          </label>
          <input
            value={form.company}
            onChange={(e) =>
              setForm({ ...form, company: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Company name"
          />
        </div>

        {/* Role / Round */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Role / Round
          </label>
          <input
            value={form.round}
            onChange={(e) =>
              setForm({ ...form, round: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="Technical, HR, Managerial..."
          />
        </div>

        {/* Experience / Logs */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Interview Experience / Notes
          </label>
          <textarea
            value={form.experience}
            onChange={(e) =>
              setForm({ ...form, experience: e.target.value })
            }
            rows={4}
            className="w-full rounded-lg border px-3 py-2 text-sm text-slate-800 resize-none focus:outline-none focus:ring-2 focus:ring-slate-900"
            placeholder="What went well? Questions asked? Takeaways..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
