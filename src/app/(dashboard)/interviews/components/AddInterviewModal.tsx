"use client";

import { useState } from "react";

interface Props {
  onClose: () => void;
  onSaved?: () => void;
}

export default function AddInterviewModal({ onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    round: "",
    company: "",
    mode: "Online",
    outcome: "Pending",
    experience: "",
    date: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSave() {
    try {
      setLoading(true);

      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json();

        throw new Error(err.error || "Failed to save interview");
      }

      onSaved ? onSaved() : onClose();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Add Interview Log</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* Form */}
        <div className="space-y-3">
          <input
            name="round"
            placeholder="Interview Round"
            value={form.round}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />

          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <select
              name="mode"
              value={form.mode}
              onChange={handleChange}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option>Online</option>
              <option>Onsite</option>
            </select>

            <select
              name="outcome"
              value={form.outcome}
              onChange={handleChange}
              className="rounded-xl border px-3 py-2 text-sm"
            >
              <option>Pending</option>
              <option>Cleared</option>
              <option>Rejected</option>
            </select>
          </div>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />

          <textarea
            name="experience"
            placeholder="Interview experience / questions"
            value={form.experience}
            onChange={handleChange}
            rows={4}
            className="w-full rounded-xl border px-3 py-2 text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
