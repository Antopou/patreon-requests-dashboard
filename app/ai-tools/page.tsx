"use client";

import ColabIntegration from '@/components/ColabIntegration';

export default function AIToolsPage() {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800 mb-6">AI Training Tools</h1>
      <ColabIntegration />
    </div>
  );
}
