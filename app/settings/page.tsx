"use client";

import { useState } from "react";
import { saveRequests } from "@/lib/storage";

export default function SettingsPage() {
    const [cleared, setCleared] = useState(false);

    function resetAll() {
        if (!confirm("Clear all saved requests on this browser? This will NOT delete from Excel unless you click Save.")) return;
        saveRequests([]);
        setCleared(true);
        setTimeout(() => setCleared(false), 3000);
    }

    return (
        <div className="mx-auto max-w-2xl animate-fade-in">
            <h1 className="mb-8 text-3xl font-bold text-slate-900">Settings</h1>

            <div className="rounded-2xl border border-white/50 bg-white/60 p-8 shadow-sm backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold text-slate-800">Data Management</h2>
                <p className="mb-6 text-slate-600">
                    Sync status is local to this browser. Clearing data here will remove it from your local storage but will not affect the original Excel file unless you've overwritten it.
                </p>

                <button
                    onClick={resetAll}
                    className="rounded-xl border border-red-200 bg-red-50 px-6 py-3 font-medium text-red-600 hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all"
                >
                    Reset All Data
                </button>

                {cleared && (
                    <p className="mt-4 text-sm font-medium text-green-600 animate-slide-up">
                        Data cleared successfully.
                    </p>
                )}
            </div>
        </div>
    );
}
