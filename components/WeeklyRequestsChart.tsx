"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

type Props = { data: { name: string; value: number }[] };

export default function WeeklyRequestsChart({ data }: Props) {
  return (
    <div className="flex flex-col rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md min-w-0">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800">This Week</h3>
        <p className="text-sm text-slate-500">Requests per day (last 7 days)</p>
      </div>

      <div className="h-[300px] w-full min-w-0 relative">
        <ResponsiveContainer width="100%" height="100%" minHeight={240} minWidth={240}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="weeklyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} dy={8} />
            <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
            <Tooltip
              cursor={{ stroke: "#3b82f6", strokeWidth: 1, strokeDasharray: "3 3" }}
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              }}
              itemStyle={{ color: "#1e293b", fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="value" stroke="#2563eb" fill="url(#weeklyFill)" strokeWidth={2.5} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
