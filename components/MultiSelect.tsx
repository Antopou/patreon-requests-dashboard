"use client";

import { useState, useRef, useEffect } from "react";

type Props = {
    label: string;
    options: string[];
    value: string[];
    onChange: (value: string[]) => void;
};

export default function MultiSelect({ label, options, value, onChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        if (value.includes(option)) {
            onChange(value.filter((v) => v !== option));
        } else {
            onChange([...value, option]);
        }
    };

    const displayText = value.length === 0
        ? "All"
        : value.length === options.length
            ? "All"
            : `${value.length} selected`;

    return (
        <div className="relative" ref={containerRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
            >
                <span className="text-slate-500">{label}:</span>
                <span className="text-slate-900">{displayText}</span>
                <svg
                    className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-2 w-56 origin-top-right rounded-xl border border-slate-100 bg-white p-2 shadow-lg shadow-slate-200/50 ring-1 ring-black ring-opacity-5 focus:outline-none animate-scale-in">
                    <div className="space-y-1">
                        <button
                            onClick={() => onChange([])}
                            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-colors ${value.length === 0 ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                                }`}
                        >
                            <span>Select All</span>
                            {value.length === 0 && (
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </button>
                        <div className="h-px bg-slate-100 my-1" />
                        {options.map((option) => {
                            const isSelected = value.includes(option);
                            return (
                                <button
                                    key={option}
                                    onClick={() => toggleOption(option)}
                                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${isSelected ? "bg-blue-50 text-blue-700" : "text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <span>{option}</span>
                                    {isSelected && (
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
