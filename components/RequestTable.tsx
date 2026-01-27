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
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`}>
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
      style={{ animationDelay: '0ms' }}
    >
      {/* 1. Patron Name */}
      <td className="px-4 py-4 font-medium text-slate-900">
        <input
          className="w-full bg-transparent font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
          value={item.patreonName}
          onChange={(e) => updateField({ patreonName: e.target.value })}
        />
      </td>

      {/* 2. Tier */}
      <td className="px-4 py-4">
        <select
          className="w-full rounded-lg border-none bg-slate-100/50 px-2 py-1 text-xs font-medium text-slate-600 focus:ring-0 cursor-pointer hover:bg-slate-100"
          value={item.tier}
          onChange={(e) => updateField({ tier: e.target.value })}
        >
          {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>

      {/* 3. Request Date */}
      <td className="px-4 py-4 text-slate-500 font-mono text-xs">
        {new Date(item.dateRequested).toLocaleDateString()}
      </td>

      {/* 4. Days Waiting */}
      <td className="px-4 py-4 text-center">
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
          item.daysSinceRequest && item.daysSinceRequest > 30 
            ? 'bg-red-50 text-red-700 border border-red-200'
            : item.daysSinceRequest && item.daysSinceRequest > 14
            ? 'bg-amber-50 text-amber-700 border border-amber-200'
            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        }`}>
          {item.daysSinceRequest || 0} days
        </span>
      </td>

      {/* 5. Character Name */}
      <td className="px-4 py-4 text-slate-700 font-medium">
        <input
          className="w-full bg-transparent font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
          value={item.characterName}
          onChange={(e) => updateField({ characterName: e.target.value })}
        />
      </td>

      {/* 5. Anime / Origin */}
      <td className="px-4 py-4 text-slate-600 italic">
        <input
          className="w-full bg-transparent italic text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 rounded-md -ml-2 px-2 py-1"
          value={item.origin || ""}
          placeholder="Origin..."
          onChange={(e) => updateField({ origin: e.target.value })}
        />
      </td>

      {/* 6. Type */}
      <td className="px-4 py-4">
        <select
          className="w-full rounded-lg border-none bg-slate-100/50 px-2 py-1 text-xs text-slate-600 focus:ring-0"
          value={item.requestType}
          onChange={(e) => updateField({ requestType: e.target.value })}
        >
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </td>

      {/* 7. Status */}
      <td className="px-4 py-4">
        <select
          className="w-full rounded-lg border-none bg-transparent px-2 py-1 text-sm font-medium focus:ring-0"
          value={item.status}
          style={{
            color:
              item.status === "Not Started" ? "#94a3b8" :
              item.status === "In Progress" ? "#8b5cf6" :
              item.status === "Done" ? "#10b981" :
              item.status === "Not Doing" || item.status === "Waiting Feedback" ? "#d97706" :
              "#334155"
          }}
          onChange={(e) => updateField({ status: e.target.value })}
        >
          {STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>

    </tr>
  );
}, (prev, next) => prev.item === next.item && prev.onUpdate === next.onUpdate);

export default function RequestTable({ items, onUpdate, compact, isLoading = false, loadedCount, totalCount, waitForFullLoad = false }: Props) {
  const ready = !waitForFullLoad || (loadedCount === totalCount && totalCount !== undefined && totalCount > 0 && !isLoading);
  const showSkeleton = !ready;
  const skeletonRows = useMemo(() => Array.from({ length: 2 }), []);
  const stableUpdate = useCallback(onUpdate, [onUpdate]);

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
            {showSkeleton && skeletonRows.map((_, idx) => (
              <tr key={`skeleton-${idx}`} className="animate-pulse whitespace-nowrap">
                <td className="px-4 py-4">
                  <div className="h-5 w-32 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-16 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-16 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-24 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-28 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-20 rounded bg-slate-200" />
                </td>
                <td className="px-4 py-4">
                  <div className="h-5 w-24 rounded bg-slate-200" />
                </td>
              </tr>
            ))}

            {ready && items.map((r) => (
              <RequestRow key={r.id} item={r} onUpdate={stableUpdate} />
            ))}

            {items.length === 0 && !isLoading && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                  No requests found.
                </td>
              </tr>
            )}

            {items.length === 0 && isLoading && (
              <>
                {skeletonRows.map((_, idx) => (
                  <tr key={`skeleton-loading-${idx}`} className="whitespace-nowrap">
                    <td className="px-4 py-4">
                      <div className="h-5 w-32 rounded bg-slate-200 animate-pulse" />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-16 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-16 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-28 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.2s' }} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-20 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.3s' }} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="h-5 w-24 rounded bg-slate-200 animate-pulse" style={{ animationDelay: '0.1s' }} />
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
        {!ready && (
          <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500 border-t border-slate-100">
            <span className="flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin text-slate-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading all requests...
            </span>
            {typeof loadedCount === "number" && typeof totalCount === "number" && (
              <span>{loadedCount} / {totalCount}</span>
            )}
          </div>
        )}

        {ready && typeof loadedCount === "number" && typeof totalCount === "number" && totalCount > 0 && (
          <div className="flex items-center justify-between px-4 py-3 text-xs text-slate-500 border-t border-slate-100">
            <span>Loaded</span>
            <span>
              {loadedCount} / {totalCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
