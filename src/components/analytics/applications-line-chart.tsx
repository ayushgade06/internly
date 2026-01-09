"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { LineChartPoint } from "@/types/analytics";

export default function ApplicationsLineChart({
  data,
}: {
  data: LineChartPoint[];
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4 text-slate-800">Applications Over Time</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis
              stroke="#94a3b8"
              allowDecimals={false}
              tickFormatter={(value) => Math.floor(value).toString()}
            />

            <Tooltip />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
