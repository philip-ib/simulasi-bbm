import { useApp } from "../../context/AppContext.jsx";
import { useEffect } from "react";

function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function FuelForm() {
  const {
    listMotor, listBbm,
    selectedMotor, setSelectedMotor,
    selectedBbm, setSelectedBbm,
    tipeInput, setTipeInput,
    inputUser, setInputUser,
    hitung,
  } = useApp();

  // Hitung ulang setiap ada perubahan
  useEffect(() => {
    hitung();
  }, [selectedMotor, selectedBbm, tipeInput, inputUser, hitung]);

  const placeholder = tipeInput === "uang" ? "Masukkan nominal (Rp)" : "Masukkan volume (Liter)";

  return (
    <div className="bg-white rounded-xl shadow-md border-t-4 border-blue-900 p-6">
      <h2 className="text-lg font-bold text-slate-800 mb-4">
        ⛽ Kalkulator Dispenser BBM
      </h2>

      <div className="space-y-4">
        {/* Pilih Motor */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Merek Motor
          </label>
          <select
            value={selectedMotor ? listMotor.indexOf(selectedMotor) : ""}
            onChange={(e) => setSelectedMotor(listMotor[e.target.value] || null)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih Motor --</option>
            {listMotor.map((m, i) => (
              <option key={m.id} value={i}>
                {m.merek} ({m.kapasitas}L)
              </option>
            ))}
          </select>
        </div>

        {/* Pilih BBM */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            Jenis BBM
          </label>
          <select
            value={selectedBbm ? listBbm.indexOf(selectedBbm) : ""}
            onChange={(e) => setSelectedBbm(listBbm[e.target.value] || null)}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih BBM --</option>
            {listBbm.map((b, i) => (
              <option key={b.id} value={i}>
                {b.nama_bbm} ({formatRupiah(b.harga)}/L)
              </option>
            ))}
          </select>
        </div>

        {/* Metode Input */}
        <fieldset>
          <legend className="block text-sm font-semibold text-slate-600 mb-2">
            Metode Nozzle
          </legend>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipeInput"
                value="uang"
                checked={tipeInput === "uang"}
                onChange={() => { setTipeInput("uang"); setInputUser(""); }}
                className="accent-blue-900"
              />
              <span className="text-sm text-slate-700">Berdasarkan Rupiah (Rp)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="tipeInput"
                value="liter"
                checked={tipeInput === "liter"}
                onChange={() => { setTipeInput("liter"); setInputUser(""); }}
                className="accent-blue-900"
              />
              <span className="text-sm text-slate-700">Berdasarkan Liter</span>
            </label>
          </div>
        </fieldset>

        {/* Input User */}
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">
            {tipeInput === "uang" ? "Nominal (Rp)" : "Volume (Liter)"}
          </label>
          <input
            type="number"
            value={inputUser}
            onChange={(e) => setInputUser(e.target.value)}
            placeholder={placeholder}
            min="1"
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>
    </div>
  );
}
