import { useApp } from "../../context/AppContext.jsx";

export default function Navbar() {
  const { tab, setTab } = useApp();

  return (
    <nav className="bg-blue-900 border-b-4 border-red-600 shadow-lg">
      <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-white font-bold text-xl tracking-tight">⛽ Simulasi BBM</span>
          <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            Simulator
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setTab("simulasi")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "simulasi"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Simulasi Pengisian
          </button>
          <button
            onClick={() => setTab("admin")}
            className={`px-4 py-2 text-sm font-semibold transition-colors ${
              tab === "admin"
                ? "text-emerald-400 border-b-2 border-emerald-400"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Panel Admin
          </button>
        </div>
      </div>
    </nav>
  );
}
