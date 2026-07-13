import { useApp } from "../../context/AppContext.jsx";

export default function TankVisual() {
  const { hasil } = useApp();

  const pct = hasil ? Math.min(hasil.persentaseTangki, 100) : 0;

  const barColor =
    pct <= 20 ? "bg-red-600"
    : pct <= 50 ? "bg-amber-400"
    : "bg-emerald-500";

  const statusColor =
    !hasil ? "text-slate-400"
    : hasil.status !== "Aman" ? "text-red-600"
    : pct <= 20 ? "text-red-600"
    : pct <= 50 ? "text-amber-500"
    : "text-emerald-600";

  const statusText =
    !hasil ? "Menunggu Input"
    : hasil.status !== "Aman" ? hasil.status
    : pct <= 20 ? "bensin sekarat segera isi"
    : pct <= 50 ? "masih aman"
    : "aman";

  return (
    <div className="flex flex-col items-center mb-6">
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
        Nozzle Status Indicator
      </p>

      {/* Tank */}
      <div className="w-44 h-64 border-4 border-slate-800 rounded-b-3xl relative bg-slate-100 overflow-hidden shadow-inner flex flex-col justify-end">
        {/* Fill bar */}
        <div
          className={`w-full transition-all duration-500 ease-out ${barColor}`}
          style={{ height: `${pct}%` }}
        />
        {/* Percentage overlay */}
        <div className="absolute inset-0 flex items-center justify-center font-black text-3xl text-slate-900 drop-shadow-sm">
          {pct}%
        </div>
      </div>

      {/* Status text */}
      <p className={`mt-3 text-sm font-bold uppercase ${statusColor}`}>
        {statusText}
      </p>
    </div>
  );
}
