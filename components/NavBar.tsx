"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function NavBar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const links = [
        { href: "/", label: "Dashboard" },
        { href: "/requests/new", label: "Requests" },
        { href: "/ai-tools", label: "AI Tools" },
        { href: "/analytics", label: "Analytics" },
        { href: "/settings", label: "Settings" },
    ];

    return (
        <nav suppressHydrationWarning className="mb-2 flex items-center justify-between rounded-2xl border border-white/50 bg-white/60 px-2 md:px-4 py-2 md:py-3 shadow-sm backdrop-blur-md relative z-50">
            {/* Logo or title could go here if needed */}
            <div className="flex-1 flex items-center">
                {/* Hamburger for mobile */}
                <button
                    className="md:hidden p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    aria-label="Open navigation menu"
                    onClick={() => setOpen((v) => !v)}
                >
                    <svg className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {open ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16" />
                        )}
                    </svg>
                </button>
                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl w-full">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                                    ? "bg-white text-blue-600 shadow-sm"
                                    : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            </div>
            {/* Mobile dropdown */}
            {open && (
                <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-b-2xl shadow-lg border border-t-0 border-white/50 z-50 flex flex-col md:hidden animate-scale-in">
                    {links.map((link) => {
                        const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-6 py-3 text-base font-medium border-b last:border-b-0 border-slate-100 transition-all ${isActive
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-slate-700 hover:bg-slate-50"
                                    }`}
                                onClick={() => setOpen(false)}
                            >
                                {link.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </nav>
    );
}
