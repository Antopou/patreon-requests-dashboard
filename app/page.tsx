"use client";

import { useEffect, useMemo, useState } from "react";
import RequestTable from "@/components/RequestTable";
import MultiSelect from "@/components/MultiSelect";
import { loadRequests, updateExistingRequest, seedIfEmpty } from "@/lib/storage";
import { RequestItem } from "@/types/request";
import { IMPORTED_REQUESTS } from "@/lib/seedData";

const STATUS_OPTIONS = ["Not Started", "In Progress", "Completed", "Cancelled"];
const TYPE_OPTIONS = ["Portrait", "Full Body", "Poll", "Not Poll"];

export default function DashboardPage() {
  const [items, setItems] = useState<RequestItem[]>([]);
  const [q, setQ] = useState("");
  // Default to these 2 statuses as "Active"
  const [statusFilter, setStatusFilter] = useState<string[]>(["Not Started", "In Progress"]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]); // Empty means All

  useEffect(() => {
    const loadData = async () => {
      await seedIfEmpty(IMPORTED_REQUESTS);
      const data = await loadRequests();
      setItems(data);
    };
    loadData();
  }, []);

  const filtered = useMemo(() => {
    // Start with all items
    let base = items;

    // Filter by Status
    if (statusFilter.length > 0) {
      base = base.filter(i => statusFilter.includes(i.status));
    }

    // Filter by Type
    if (typeFilter.length > 0) {
      base = base.filter(i => typeFilter.includes(i.requestType));
    }

    // Filter by Search Query
    const query = q.trim().toLowerCase();
    if (query) {
      base = base.filter(r =>
        r.patreonName.toLowerCase().includes(query) ||
        r.characterName.toLowerCase().includes(query)
      );
    }

    // Sort: 1. In Progress, 2. Pending, 3. Completed, 4. Cancelled
    // Then by date requested (oldest first)
    return base.sort((a, b) => {
      const statusOrder = { "In Progress": 0, "Not Started": 1, "Completed": 2, "Cancelled": 3 } as any;
      const sa = statusOrder[a.status] ?? 99;
      const sb = statusOrder[b.status] ?? 99;
      if (sa !== sb) return sa - sb;
      return new Date(a.dateRequested).getTime() - new Date(b.dateRequested).getTime();
    });
  }, [items, q, statusFilter, typeFilter]);

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
        <RequestTable items={filtered as any} onUpdate={update} />
      </div>
    </div>
  );
}
