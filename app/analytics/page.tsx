"use client";

import { useEffect, useState } from "react";
import { loadRequests } from "@/lib/storage";
import { RequestItem } from "@/types/request";
import StatusChart from "@/components/StatusChart";
import TierChart from "@/components/TierChart";
import KpiCard from "@/components/KpiCard";

export default function AnalyticsPage() {
    const [items, setItems] = useState<RequestItem[]>([]);

    useEffect(() => {
        setItems(loadRequests());
    }, []);

    /* 
     Groups items by a key and returns chart data format 
  */
    function getChartData(key: keyof RequestItem) {
        const counts: Record<string, number> = {};
        items.forEach(i => {
            const val = i[key] as string || "Unknown";
            counts[val] = (counts[val] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }

    const total = items.length;
    const completed = items.filter(i => i.status === "Completed").length;
    const pending = items.filter(i => i.status === "Pending").length;
    const inProgress = items.filter(i => i.status === "In Progress").length;

    const statusData = getChartData("status");
    const tierData = getChartData("tier");

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <KpiCard title="Total Requests" value={total} />
                <KpiCard title="Completed" value={completed} />
                <KpiCard title="In Progress" value={inProgress} />
                <KpiCard title="Pending" value={pending} />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <StatusChart data={statusData} />
                <TierChart data={tierData} />
            </div>
        </div>
    );
}
