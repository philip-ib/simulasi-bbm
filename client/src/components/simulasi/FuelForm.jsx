import { useApp } from "../../context/AppContext.jsx";
import { useEffect, useRef } from "react";
import { formatRupiah } from "../../utils/format.js";

export default function FuelForm() {
  const {
    listMotor, listBbm,
    selectedMotor, setSelectedMotor,
    selectedBbm, setSelectedBbm,
    tipeInput, setTipeInput,
    inputUser, setInputUser,
    hitung,
  } = useApp();

  // Hitung ulang setiap ada perubahan (dengan debounce 400ms)
  const debounceRef = useRef(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => hitung(), 400);
    return () => clearTimeout(debounceRef.current);
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
            value={selectedMotor ? selectedMotor.id : ""}
            onChange={(e) => {
              const motor = listMotor.find((m) => m.id === parseInt(e.target.value));
              setSelectedMotor(motor || null);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih Motor --</option>
            {listMotor.map((m) => (
              <option key={m.id} value={m.id}>
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
            value={selectedBbm ? selectedBbm.id : ""}
            onChange={(e) => {
              const bbm = listBbm.find((b) => b.id === parseInt(e.target.value));
              setSelectedBbm(bbm || null);
            }}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          >
            <option value="">-- Pilih BBM --</option>
            {listBbm.map((b) => (
              <option key={b.id} value={b.id}>
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
