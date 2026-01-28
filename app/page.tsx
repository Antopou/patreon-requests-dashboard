"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import RequestForm from '@/components/RequestForm';
import RequestTable from "@/components/RequestTable";
import MultiSelect from "@/components/MultiSelect";
import { loadRequests, updateExistingRequest } from "@/lib/storage";
import { RequestItem } from "@/types/request";
import { IMPORTED_REQUESTS } from "@/lib/seedData";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Not Doing", "Waiting Feedback", "Done"];
const TYPE_OPTIONS = ["Poll", "Not Poll"];

export default function DashboardPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [q, setQ] = useState("");
  // Default to active character requests
  const [statusFilter, setStatusFilter] = useState<string[]>(["Not Started", "In Progress"]);
  const [typeFilter, setTypeFilter] = useState<string[]>(["Not Poll"]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const deferredQuery = useDeferredValue(q);

  useEffect(() => {
    let cancelled = false;

    const schedule = (cb: () => void) => {
      // Give the browser breathing room when adding many rows
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        (window as any).requestIdleCallback(cb, { timeout: 200 });
      } else {
        setTimeout(cb, 16);
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      setItems([]);
      setLoadedCount(0);

      const data = await loadRequests();
      if (cancelled) return;

      const source = data.length > 0 ? data : IMPORTED_REQUESTS;
      setTotalCount(source.length);

      if (source.length === 0) {
        setIsLoading(false);
        return;
      }

      // Load rows in small batches for better performance
      const BATCH_SIZE = 5;
      let index = 0;

      const pushBatch = () => {
        if (cancelled) return;
        if (index < source.length) {
          const batch = source.slice(index, index + BATCH_SIZE);
          setItems(prev => [...prev, ...batch]);
          index += BATCH_SIZE;
          setLoadedCount(Math.min(index, source.length));
          schedule(pushBatch);
        } else {
          setIsLoading(false);
        }
      };

      schedule(pushBatch);
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    let base = items;

    if (statusFilter.length > 0) {
      base = base.filter(i => i?.status && statusFilter.includes(i.status));
    }

    if (typeFilter.length > 0) {
      base = base.filter(i => i?.requestType && typeFilter.includes(i.requestType));
    }

    const query = deferredQuery.trim().toLowerCase();
    if (query) {
      base = base.filter(r =>
        r?.patreonName?.toLowerCase().includes(query) ||
        r?.characterName?.toLowerCase().includes(query)
      );
    }

    const statusOrder = { "In Progress": 0, "Waiting Feedback": 1, "Not Started": 2, "Not Doing": 3, "Done": 4 } as const;

    return base
      .slice()
      .sort((a, b) => {
        const sa = statusOrder[a.status as keyof typeof statusOrder] ?? 99;
        const sb = statusOrder[b.status as keyof typeof statusOrder] ?? 99;
        if (sa !== sb) return sa - sb;
        return new Date(a.dateRequested).getTime() - new Date(b.dateRequested).getTime();
      });
  }, [items, deferredQuery, statusFilter, typeFilter]);

  async function update(id: string, patch: Partial<RequestItem>) {
    const updated = items.map(i => i.id === id ? { ...i, ...patch } : i);
    setItems(updated);
    await updateExistingRequest(id, patch);
  }

  return (
    <div className="grid gap-6 animate-fade-in relative z-10">
      <div className="flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/60 p-6 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:justify-between relative z-20">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            className="w-full rounded-xl border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            placeholder="Search by Patreon or Character..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <MultiSelect
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <MultiSelect
            label="Type"
            options={TYPE_OPTIONS}
            value={typeFilter}
            onChange={setTypeFilter}
          />
        </div>
      </div>

      <div className="relative z-0">
        <RequestTable
          items={filtered as any}
          onUpdate={update}
          isLoading={isLoading}
          loadedCount={loadedCount}
          totalCount={totalCount}
          waitForFullLoad={false}
        />
      </div>
    </div>
  );
}
