"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import type { Internship } from "./EditInternshipModal";

/* ---------- Date helpers ---------- */

function fromDateInputValue(value: string) {
  return value ? new Date(value) : null;
}

type Props = {
  onClose: () => void;
  onAdd: (internship: Internship) => void;
};

export default function AddInternshipModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState({
    role: "",
    company: "",
    location: "",
    stipend: "",
    status: "Applied",
    appliedOn: "",
    followUpOn: "",
    notes: "",
  });

  function handleChange(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const payload = {
      role: form.role,
      company: form.company,
      location: form.location,
      status: form.status,
      stipend: form.stipend ? Number(form.stipend) : null,
      appliedOn: fromDateInputValue(form.appliedOn),
      followUpOn: fromDateInputValue(form.followUpOn),
      notes: form.notes,
    };

    const res = await fetch("/api/internships", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert("Failed to add internship");
      return;
    }

    const saved: Internship = await res.json();
    onAdd(saved);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <form
        onSubmit={handleSubmit}
        className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-6 space-y-4 text-slate-800"
      >
        <h2 className="text-xl font-semibold">Add Application</h2>

        <Input label="Role" name="role" value={form.role} onChange={handleChange} required />
        <Input label="Company" name="company" value={form.company} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Location" name="location" value={form.location} onChange={handleChange} />
          <Input label="Monthly Stipend (₹)" name="stipend" type="number" value={form.stipend} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select label="Status" name="status" value={form.status} onChange={handleChange} />
          <Input
            label="Applied Date"
            name="appliedOn"
            type="date"
            value={form.appliedOn}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Follow-up Date"
          name="followUpOn"
          type="date"
          value={form.followUpOn}
          onChange={handleChange}
        />

        <Textarea label="Notes" name="notes" value={form.notes} onChange={handleChange} />

        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="text-slate-600">Cancel</button>
          <button type="submit" className="bg-slate-900 text-white px-5 py-2 rounded-xl">Add</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- Inputs ---------- */

function Input({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <input {...props} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
    </div>
  );
}

function Select({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <select {...props} className="w-full px-3 py-2 rounded-xl border border-slate-300">
        {["Applied", "Interview", "Offer", "Accepted", "Rejected"].map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

function Textarea({ label, ...props }: any) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-medium">{label}</label>
      <textarea {...props} rows={4} className="w-full px-3 py-2 rounded-xl border border-slate-300" />
    </div>
  );
}
