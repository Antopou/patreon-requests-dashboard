"use client";

import { memo, useCallback, useMemo } from "react";
import { RequestItem, STATUS, TIERS, TYPES } from "@/types/request";

type Props = {
  items: (RequestItem & { daysWaiting?: number; overdue?: boolean })[];
  onUpdate: (id: string, patch: Partial<RequestItem>) => void;
  compact?: boolean;
  isLoading?: boolean;
  loadedCount?: number;
  totalCount?: number;
  waitForFullLoad?: boolean;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "Not Started": return "#94a3b8";
    case "In Progress": return "#8b5cf6";
    case "Done": return "#10b981";
    case "Not Doing":
    case "Waiting Feedback": return "#d97706";
    default: return "#334155";
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    "Not Started": "bg-slate-100 text-slate-700 border-slate-200",
    "In Progress": "bg-purple-50 text-purple-700 border-purple-200",
    "Not Doing": "bg-amber-50 text-amber-700 border-amber-200",
    "Waiting Feedback": "bg-amber-50 text-amber-700 border-amber-200",
    "Done": "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const className = styles[status as keyof typeof styles] || "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${className}`}>
      <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${className.replace('bg-', 'bg-opacity-100 bg-').split(' ')[1].replace('text-', 'bg-')}`}></span>
      {status}
    </span>
  );
};

const RequestRow = memo(function RequestRow({ item, onUpdate }: { item: (RequestItem & { daysWaiting?: number; overdue?: boolean }); onUpdate: (id: string, patch: Partial<RequestItem>) => void; }) {
  const { id } = item;

  const updateField = useCallback((patch: Partial<RequestItem>) => {
    onUpdate(id, patch);
  }, [id, onUpdate]);

  return (
    <tr
      key={item.id}
      className={`group transition-colors hover:bg-blue-50/30 whitespace-nowrap animate-fade-in-row`}
    >
      <td className="px-4 py-4 font-medium text-slate-900">
        <input
          className="w-full bg-transparent font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
          value={item.patreonName || ""}
          onChange={(e) => updateField({ patreonName: e.target.value })}
        />
      </td>

      <td className="px-4 py-4">
        <select
          className="w-full rounded-lg border-none bg-slate-100/50 px-2 py-1 text-xs font-medium text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100"
          value={item.tier}
          onChange={(e) => updateField({ tier: e.target.value })}
        >
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>

      <td className="px-4 py-4 text-slate-500 font-mono text-xs">
        {item.dateRequested ? new Date(item.dateRequested).toLocaleDateString() : 'N/A'}
      </td>

      <td className="px-4 py-4 text-center">
        {/* KEPT YOUR ORIGINAL COLOR LOGIC */}
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          item.status === 'Done'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : item.daysSinceRequest && item.daysSinceRequest > 30 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : item.daysSinceRequest && item.daysSinceRequest > 14
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {item.daysSinceRequest || 0} days
        </span>
      </td>

      <td className="px-4 py-4 text-slate-700 font-medium">
        <input
          className="w-full bg-transparent font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
          value={item.characterName || ""}
          onChange={(e) => updateField({ characterName: e.target.value })}
        />
      </td>

      <td className="px-4 py-4 text-slate-600 italic">
        <input
          className="w-full bg-transparent italic text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
          value={item.origin || ""}
          placeholder="Origin..."
          onChange={(e) => updateField({ origin: e.target.value })}
        />
      </td>

      <td className="px-4 py-4">
        <select
          className="w-full rounded-lg border-none bg-slate-100/50 px-2 py-1 text-xs text-slate-600 focus:ring-0"
          value={item.requestType}
          onChange={(e) => updateField({ requestType: e.target.value })}
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>

      <td className="px-4 py-4">
        <select
          className="w-full rounded-lg border-none bg-transparent px-2 py-1 text-sm font-medium focus:ring-0"
          value={item.status}
          style={{ color: getStatusColor(item.status) }}
          onChange={(e) => updateField({ status: e.target.value })}
        >
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
    </tr>
  );
}, (prev, next) => prev.item === next.item && prev.onUpdate === next.onUpdate);

export default function RequestTable({ 
  items = [], // Default to empty array to prevent map error
  onUpdate, 
  isLoading = false, 
  loadedCount, 
  totalCount, 
  waitForFullLoad = false 
}: Props) {
  const ready = !waitForFullLoad || (loadedCount === totalCount && totalCount !== undefined && totalCount > 0 && !isLoading);
  const showSkeleton = isLoading && items.length === 0;
  const skeletonRows = useMemo(() => Array.from({ length: 5 }), []);
  const stableUpdate = useCallback(onUpdate, [onUpdate]);

  return (
    <div className="rounded-3xl border border-white/50 bg-white/60 shadow-sm backdrop-blur-sm transition-all hover:shadow-md overflow-hidden w-full max-w-full">
      
      {/* DESKTOP VIEW */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/50 text-xs font-semibold uppercase text-slate-500 whitespace-nowrap">
            <tr>
              <th className="px-4 py-4 min-w-[150px]">Patreon Name</th>
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
            {showSkeleton ? skeletonRows.map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse">
                {Array.from({ length: 8 }).map((_, i) => (
                  <td key={i} className="px-4 py-4"><div className="h-5 bg-slate-200 rounded w-full" /></td>
                ))}
              </tr>
            )) : items.length > 0 ? items.map((r) => (
              <RequestRow key={r.id} item={r} onUpdate={stableUpdate} />
            )) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No requests found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden divide-y divide-slate-100 w-full overflow-hidden">
        {showSkeleton ? (
           <div className="p-4 space-y-4">
             {skeletonRows.slice(0, 3).map((_, i) => (
               <div key={i} className="animate-pulse space-y-3 p-4 bg-white/50 rounded-2xl border border-slate-100">
                 <div className="flex justify-between"><div className="h-5 bg-slate-200 rounded w-1/2" /><div className="h-5 bg-slate-200 rounded w-1/4" /></div>
                 <div className="h-12 bg-slate-100 rounded-lg" />
                 <div className="flex gap-2"><div className="h-9 bg-slate-200 rounded flex-1" /><div className="h-9 bg-slate-200 rounded flex-1" /></div>
               </div>
             ))}
           </div>
        ) : items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="p-4 space-y-4 bg-white/40 w-full box-border">
              <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col min-w-0 flex-1">
                  <input 
                    className="font-bold text-slate-900 bg-transparent focus:ring-0 text-base -ml-1 w-full truncate" 
                    value={item.patreonName || ""} 
                    onChange={(e) => stableUpdate(item.id, { patreonName: e.target.value })} 
                  />
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tight truncate">
                    {item.dateRequested ? new Date(item.dateRequested).toLocaleDateString() : 'N/A'} • {item.daysSinceRequest || 0}d
                  </span>
                </div>
                <div className="flex-shrink-0">
                  <StatusBadge status={item.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/50 p-2 border border-slate-100">
                <div className="min-w-0">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Character</label>
                  <input className="w-full bg-transparent text-sm font-medium text-slate-700 focus:ring-0 truncate" value={item.characterName || ""} onChange={(e) => stableUpdate(item.id, { characterName: e.target.value })} />
                </div>
                <div className="min-w-0">
                  <label className="text-[9px] font-bold text-slate-400 uppercase block">Origin</label>
                  <input className="w-full bg-transparent text-sm italic text-slate-600 focus:ring-0 truncate" value={item.origin || ""} onChange={(e) => stableUpdate(item.id, { origin: e.target.value })} />
                </div>
              </div>

              <div className="flex gap-2">
                <select className="flex-1 bg-white/80 border border-slate-200 rounded-lg py-2 px-1 text-[11px] font-medium" value={item.tier} onChange={(e) => stableUpdate(item.id, { tier: e.target.value })}>
                  {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="flex-1 bg-white/80 border border-slate-200 rounded-lg py-2 px-1 text-[11px] font-bold" style={{ color: getStatusColor(item.status) }} value={item.status} onChange={(e) => stableUpdate(item.id, { status: e.target.value })}>
                  {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">No requests found.</div>
        )}
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between px-4 py-3 text-[10px] font-bold uppercase text-slate-400 border-t border-slate-100 bg-slate-50/30">
        <span className="flex items-center gap-2">
          {!ready && <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
          {ready ? "Sync Ready" : "Loading Data..."}
        </span>
        {typeof loadedCount === "number" && (
          <span>{loadedCount} / {totalCount}</span>
        )}
      </div>
    </div>
  );
}