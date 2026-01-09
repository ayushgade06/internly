interface ActivityItemProps {
  title: string;
  company: string;
  time: string;
}

export default function ActivityItem({
  title,
  company,
  time,
}: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 mt-0.5">{company}</p>
      </div>
      <div className="text-xs text-slate-400">{time}</div>
    </div>
  );
}
