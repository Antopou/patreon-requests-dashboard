"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

type Props = { data: { name: string; value: number }[] };

const COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#6366f1"];

export default function TierChart({ data }: Props) {
    return (
        <div className="flex flex-col rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md min-w-0">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-slate-800">Requests by Tier</h3>
                <p className="text-sm text-slate-500">Volume per membership level</p>
            </div>

            <div className="h-[300px] w-full min-w-0 relative">
                <ResponsiveContainer width="100%" height="100%" minHeight={240} minWidth={240}>
                    <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: '#f1f5f9' }}
                            contentStyle={{
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                borderRadius: '12px',
                                border: 'none',
                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                            itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
