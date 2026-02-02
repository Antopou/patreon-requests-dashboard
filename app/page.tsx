"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
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
  const [statusFilter, setStatusFilter] = useState<string[]>(["Not Started", "In Progress"]);
  const [typeFilter, setTypeFilter] = useState<string[]>(["Not Poll"]);
  const [isLoading, setIsLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const deferredQuery = useDeferredValue(q);

  useEffect(() => {
    let cancelled = false;
    const loadData = async () => {
      setIsLoading(true);
      const data = await loadRequests();
      if (cancelled) return;
      const source = data && data.length > 0 ? data : IMPORTED_REQUESTS;
      setTotalCount(source.length);
      
      let index = 0;
      const batchSize = 15;
      const batch = () => {
        if (cancelled) return;
        if (index < source.length) {
          const nextSet = source.slice(index, index + batchSize);
          setItems(prev => [...prev, ...nextSet]);
          index += batchSize;
          setLoadedCount(Math.min(index, source.length));
          setTimeout(batch, 20);
        } else { 
          setIsLoading(false); 
        }
      };
      batch();
    };
    loadData();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const base = items || [];
    let result = [...base];

    if (statusFilter.length > 0) result = result.filter(i => statusFilter.includes(i.status));
    if (typeFilter.length > 0) result = result.filter(i => typeFilter.includes(i.requestType));
    
    const query = deferredQuery.toLowerCase().trim();
    if (query) {
      result = result.filter(r => 
        (r.patreonName || "").toLowerCase().includes(query) || 
        (r.characterName || "").toLowerCase().includes(query)
      );
    }

    const order = { "In Progress": 0, "Waiting Feedback": 1, "Not Started": 2, "Not Doing": 3, "Done": 4 } as any;
    return result.sort((a, b) => 
      (order[a.status] ?? 9) - (order[b.status] ?? 9) || 
      new Date(a.dateRequested).getTime() - new Date(b.dateRequested).getTime()
    );
  }, [items, deferredQuery, statusFilter, typeFilter]);

  async function update(id: string, patch: Partial<RequestItem>) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i));
    await updateExistingRequest(id, patch);
  }

  
  return (
    <div className="w-full max-w-full overflow-x-hidden px-2 md:px-6 py-3 md:py-8 space-y-3">
      
      <div className="flex flex-col md:flex-row md:items-center gap-2 rounded-2xl border border-white/50 bg-white/60 p-3 shadow-sm backdrop-blur-sm relative z-20">
        
        <div className="flex items-center gap-2 flex-1 w-full">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              placeholder="Search..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className={`md:hidden flex items-center justify-center p-2 h-9 w-9 rounded-xl border transition-all ${
              showMobileFilters ? 'bg-blue-500 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-400'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </button>
        </div>

        {/* Changed flex-col back to flex-row and removed w-full to make them compact */}
        <div className={`${showMobileFilters ? 'flex' : 'hidden'} md:flex flex-row flex-wrap gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-none`}>
          <div className="w-auto">
            <MultiSelect label="Status" options={STATUS_OPTIONS} value={statusFilter} onChange={setStatusFilter} />
          </div>
          <div className="w-auto">
            <MultiSelect label="Type" options={TYPE_OPTIONS} value={typeFilter} onChange={setTypeFilter} />
          </div>
        </div>
      </div>

      <div className="w-full">
        <RequestTable
          items={filtered}
          onUpdate={update}
          isLoading={isLoading}
          loadedCount={loadedCount}
          totalCount={totalCount}
        />
      </div>
    </div>
  );
}