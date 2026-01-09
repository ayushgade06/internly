import { Trash2, Pencil } from "lucide-react";

type InterviewLog = {
  id: string;
  round: string;
  company: string;
  mode: string;
  outcome: string;
  experience: string;
  date: string;
};

type Props = {
  log: InterviewLog;
  onEdit: (log: InterviewLog) => void;
  onDelete: (id: string) => void;
};

export default function InterviewCard({ log, onEdit, onDelete }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">
            {log.round}
          </h3>
          <p className="text-sm text-slate-500">
            {log.company} • {log.mode}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
            {log.outcome}
          </span>

          <button
            onClick={() => onEdit(log)}
            className="text-blue-500 hover:text-blue-700"
            title="Edit"
          >
            <Pencil size={16} />
          </button>

          <button
            onClick={() => onDelete(log.id)}
            className="text-red-500 hover:text-red-700"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <p className="text-sm text-slate-700">
        {log.experience}
      </p>

      <p className="text-xs text-slate-400">
        {new Date(log.date).toLocaleDateString("en-IN")}
      </p>
    </div>
  );
}
