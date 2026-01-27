"use client";

import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";

type Props = { data: { name: string; value: number }[] };

const COLORS = [
  "#3b82f6", // Blue - Pending
  "#8b5cf6", // Purple - In Progress
  "#f59e0b", // Amber - Waiting
  "#10b981", // Emerald - Completed
];

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function StatusChart({ data }: Props) {
  // Container must have explicit dimensions for Recharts
  return (
    <div className="flex flex-col rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md min-w-0">
      <div className="mb-2">
        <h3 className="text-lg font-bold text-slate-800">Status Breakdown</h3>
      </div>

      <div className="h-[300px] w-full min-w-0 relative">
        <ResponsiveContainer width="100%" height="100%" minHeight={240} minWidth={240}>
          <PieChart>
            <Pie
              dataKey="value"
              data={data}
              cx="40%" // Left-align to fit legend
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={5}
              label={renderCustomizedLabel}
              labelLine={false}
              animationBegin={0}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth={2}
                  className="transition-all hover:opacity-80"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              itemStyle={{ color: '#1e293b', fontWeight: 600 }}
            />
            <Legend
              layout="vertical"
              verticalAlign="middle"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingLeft: "10px" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
