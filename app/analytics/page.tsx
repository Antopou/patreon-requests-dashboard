"use client";

import { useEffect, useState } from "react";
import { loadRequests } from "@/lib/storage";
import { RequestItem } from "@/types/request";
import StatusChart from "@/components/StatusChart";
import WeeklyRequestsChart from "@/components/WeeklyRequestsChart";
import KpiCard from "@/components/KpiCard";

export default function AnalyticsPage() {
    const [items, setItems] = useState<RequestItem[]>([]);

    useEffect(() => {
        (async () => {
            const data = await loadRequests();
            setItems(data);
        })();
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
    const done = items.filter(i => i.status === "Done").length;
    
    // Active Pipeline: haven't done yet, excluding "Not Doing"
    const activePipeline = items.filter(i => 
        i.status !== "Done" && i.status !== "Not Doing"
    ).length;
    
    // Character Queue: Not Poll type with In Progress or Not Started
    const characterQueue = items.filter(i => 
        i.requestType === "Not Poll" && 
        (i.status === "In Progress" || i.status === "Not Started")
    ).length;
    
    // Polls Awaiting: Poll type with Waiting Feedback status
    const pollsAwaiting = items.filter(i => 
        i.requestType === "Poll" && 
        i.status === "Waiting Feedback"
    ).length;

    const statusData = getChartData("status");

    // Build last 7 days (including today) request counts
    const weeklyData = (() => {
        const today = new Date();
        const days: { name: string; value: number }[] = [];

        const sameDay = (a: Date, b: Date) =>
            a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

        for (let i = 6; i >= 0; i--) {
            const target = new Date(today);
            target.setHours(0, 0, 0, 0);
            target.setDate(today.getDate() - i);

            const label = target.toLocaleDateString(undefined, { weekday: "short" });

            const value = items.reduce((count, item) => {
                if (!item.dateRequested) return count;
                const parsed = new Date(item.dateRequested);
                if (isNaN(parsed.getTime())) return count;
                parsed.setHours(0, 0, 0, 0);
                return sameDay(parsed, target) ? count + 1 : count;
            }, 0);

            days.push({ name: label, value });
        }
        return days;
    })();

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                <KpiCard title="Total Requests" value={total} />
                <KpiCard title="Done" value={done} />
                <KpiCard title="Active Pipeline" value={activePipeline} />
                <KpiCard title="Character Queue" value={characterQueue} />
                <KpiCard title="Polls Awaiting" value={pollsAwaiting} />
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                <StatusChart data={statusData} />
                <WeeklyRequestsChart data={weeklyData} />
            </div>
        </div>
    );
}
