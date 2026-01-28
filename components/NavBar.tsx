"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
    const pathname = usePathname();

    const links = [
        { href: "/", label: "Dashboard" },
        { href: "/requests/new", label: "Requests" },
        { href: "/ai-tools", label: "AI Tools" },
        { href: "/analytics", label: "Analytics" },
        { href: "/settings", label: "Settings" },
    ];

    return (
        <nav className="mb-8 flex items-center justify-between rounded-2xl border border-white/50 bg-white/60 px-6 py-4 shadow-sm backdrop-blur-md relative z-50">
            <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-xl">
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
        </nav>
    );
}
