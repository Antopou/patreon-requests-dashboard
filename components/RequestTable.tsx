"use client";

import { RequestItem, STATUS, TIERS, TYPES } from "@/types/request";

type Props = {
  items: (RequestItem & { daysWaiting?: number; overdue?: boolean })[];
  onUpdate: (id: string, patch: Partial<RequestItem>) => void;
  compact?: boolean;
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    "Pending": "bg-blue-50 text-blue-700 border-blue-200",
    "In Progress": "bg-purple-50 text-purple-700 border-purple-200",
    "Waiting for Client": "bg-amber-50 text-amber-700 border-amber-200",
    "Completed": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const className = styles[status as keyof typeof styles] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${className.replace('bg-', 'bg-opacity-100 bg-').split(' ')[1].replace('text-', 'bg-')}`}></span>
      {status}
    </span>
  );
};

export default function RequestTable({ items, onUpdate, compact }: Props) {
  return (
    <div className="rounded-3xl border border-white/50 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
            <tr>
              <th className="px-4 py-4 min-w-[150px]">Patron Name</th>
              <th className="px-4 py-4 w-[100px]">Tier</th>
              <th className="px-4 py-4 w-[120px]">Request Date</th>
              <th className="px-4 py-4 w-[100px]">Days Waiting</th>
              <th className="px-4 py-4 min-w-[150px]">Character Name</th>
              <th className="px-4 py-4 min-w-[150px]">Anime / Origin</th>
              <th className="px-4 py-4 w-[120px]">Type</th>
              <th className="px-4 py-4 w-[150px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((r) => (
              <tr
                key={r.id}
                className={`group transition-colors hover:bg-blue-50/30 whitespace-nowrap`}
              >
                {/* 1. Patron Name */}
                <td className="px-4 py-4 font-medium text-slate-900">
                  <input
                    className="w-full bg-transparent font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
                    value={r.patreonName}
                    onChange={(e) => onUpdate(r.id, { patreonName: e.target.value })}
                  />
                </td>

                {/* 2. Tier */}
                <td className="px-4 py-4">
                  <select
                    className="w-full rounded-lg border-none bg-slate-100/50 px-2 py-1 text-xs font-medium text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100"
                    value={r.tier}
                    onChange={(e) => onUpdate(r.id, { tier: e.target.value })}
                  >
                    {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>

                {/* 3. Request Date */}
                <td className="px-4 py-4 text-slate-500 font-mono text-xs">
                  {new Date(r.dateRequested).toLocaleDateString()}
                </td>

                {/* 4. Days Waiting */}
                <td className="px-4 py-4 text-center">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                    r.daysSinceRequest && r.daysSinceRequest > 30 
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : r.daysSinceRequest && r.daysSinceRequest > 14
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {r.daysSinceRequest || 0} days
                  </span>
                </td>

                {/* 5. Character Name */}
                <td className="px-4 py-4 text-slate-700 font-medium">
                  <input
                    className="w-full bg-transparent font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
                    value={r.characterName}
                    onChange={(e) => onUpdate(r.id, { characterName: e.target.value })}
                  />
                </td>

                {/* 5. Anime / Origin */}
                <td className="px-4 py-4 text-slate-600 italic">
                  <input
                    className="w-full bg-transparent italic text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
                    value={r.origin || ""}
                    placeholder="Origin..."
                    onChange={(e) => onUpdate(r.id, { origin: e.target.value })}
                  />
                </td>

                {/* 6. Type */}
                <td className="px-4 py-4">
                  <select
                    className="w-full rounded-lg border-none bg-slate-100/50 px-2 py-1 text-xs text-slate-600 focus:ring-0"
                    value={r.requestType}
                    onChange={(e) => onUpdate(r.id, { requestType: e.target.value })}
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>

                {/* 7. Status */}
                <td className="px-4 py-4">
                  <select
                    className="w-full rounded-lg border-none bg-transparent px-2 py-1 text-sm font-medium focus:ring-0"
                    value={r.status}
                    style={{
                      color: r.status === "Not Started" ? "#94a3b8" : r.status === "In Progress" ? "#8b5cf6" : r.status === "Completed" ? "#10b981" : "#334155"
                    }}
                    onChange={(e) => onUpdate(r.id, { status: e.target.value })}
                  >
                    {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
