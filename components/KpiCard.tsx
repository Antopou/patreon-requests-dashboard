type Props = { title: string; value: number; tone?: "normal" | "danger" };

export default function KpiCard({ title, value, tone = "normal" }: Props) {
  const isDanger = tone === "danger";

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
        ${isDanger
          ? "border-red-200 bg-gradient-to-br from-red-50 to-white hover:shadow-red-500/10"
          : "border-white/50 bg-white/60 hover:shadow-blue-500/10 backdrop-blur-sm"
        }
      `}
    >
      <div className={`
        absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20
        ${isDanger ? "bg-red-500" : "bg-blue-500"}
      `} />

      <div className="relative">
        <div className="text-sm font-medium text-slate-500">{title}</div>
        <div className={`mt-2 text-3xl font-bold tracking-tight ${isDanger ? "text-red-600" : "text-slate-800"}`}>
          {value}
        </div>

        <div className="mt-3 flex items-center text-xs font-medium text-slate-400">
          <span className={`mr-1 flex h-4 w-4 items-center justify-center rounded-full ${isDanger ? "bg-red-100 text-red-600" : "bg-blue-50 text-blue-600"}`}>
            <svg width="10" height="10" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </span>
          <span>Updated just now</span>
        </div>
      </div>
    </div>
  );
}
