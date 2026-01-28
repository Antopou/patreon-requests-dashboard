"use client";

import { useState, useEffect } from "react";

export default function SettingsPage() {
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const saved = localStorage.getItem("theme-preference");
        if (saved) setTheme(saved);
    }, []);

    function changeTheme(newTheme: string) {
        setTheme(newTheme);
        localStorage.setItem("theme-preference", newTheme);
        
        const html = document.documentElement;
        // Force remove dark class first
        html.classList.remove("dark");
        
        // Then add if needed
        if (newTheme === "dark") {
            html.classList.add("dark");
        }
        
        html.style.colorScheme = newTheme;
    }

    return (
        <div className="mx-auto max-w-2xl animate-fade-in space-y-6">
            <h1 className="mb-8 text-3xl font-bold text-slate-900">Settings</h1>

            {/* Appearance */}
            <div className="rounded-2xl border border-white/50 bg-white/60 p-8 shadow-sm backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold text-slate-800">Appearance</h2>
                <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={theme === "light"}
                            onChange={(e) => changeTheme(e.target.value)}
                            className="w-4 h-4"
                        />
                        <span className="text-slate-700">Light Theme</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={theme === "dark"}
                            onChange={(e) => changeTheme(e.target.value)}
                            className="w-4 h-4"
                        />
                        <span className="text-slate-700">Dark Theme</span>
                    </label>
                </div>
            </div>

            {/* About */}
            <div className="rounded-2xl border border-white/50 bg-white/60 p-8 shadow-sm backdrop-blur-md">
                <h2 className="mb-4 text-xl font-semibold text-slate-800">About</h2>
                <div className="space-y-2 text-sm text-slate-600">
                    <p><span className="font-medium text-slate-900">App Version:</span> 1.0.0</p>
                    <p><span className="font-medium text-slate-900">Last Updated:</span> January 28, 2026</p>
                    <p className="text-xs pt-2">Built with Next.js, TypeScript, and Tailwind CSS</p>
                </div>
            </div>
        </div>
    );
}
