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
      </div>
    </div>
  );
}
