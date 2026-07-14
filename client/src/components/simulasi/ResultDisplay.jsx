import { useApp } from "../../context/AppContext.jsx";
import { formatRupiah } from "../../utils/format.js";

export default function ResultDisplay() {
  const { hasil, loading } = useApp();

  return (
    <div className="bg-white rounded-xl shadow-md border-t-4 border-red-600 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        📊 Hasil Pengisian
      </h2>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="bg-slate-100 rounded-lg p-3 h-16" />
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-100 rounded-lg p-3 h-16" />
            <div className="bg-slate-100 rounded-lg p-3 h-16" />
            <div className="bg-slate-100 rounded-lg p-3 h-16" />
            <div className="bg-slate-100 rounded-lg p-3 h-16" />
          </div>
        </div>
      ) : !hasil ? (
        <p className="text-sm text-slate-400 italic">
          Silakan pilih motor, BBM, dan masukkan nominal untuk melihat hasil.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Volume BBM</p>
            <p className="text-lg font-bold text-slate-800">
              {hasil.literDidapat} <span className="text-sm font-normal">Liter</span>
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Total Harga</p>
            <p className="text-lg font-bold text-slate-800">
              {formatRupiah(hasil.totalBiaya)}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Persentase Tangki</p>
            <p className="text-lg font-bold text-slate-800">{hasil.persentaseTangki}%</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3">
            <p className="text-slate-500 text-xs uppercase tracking-wide">Kondisi BBM</p>
            <p className={`text-lg font-bold ${
              hasil.status !== "Aman" ? "text-red-600" : "text-emerald-600"
            }`}>
              {hasil.status}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
