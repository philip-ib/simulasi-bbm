import { useState, useEffect, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";
import { formatRupiah } from "../../utils/format.js";

export default function AdminDashboard() {
  const { listMotor, listBbm, loadData, apiCall, logout } = useApp();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form motor
  const [merek, setMerek] = useState("");
  const [kapasitas, setKapasitas] = useState("");
  const [editingMotor, setEditingMotor] = useState(null);

  // Form BBM
  const [namaBbm, setNamaBbm] = useState("");
  const [hargaBbm, setHargaBbm] = useState("");
  const [editingBbm, setEditingBbm] = useState(null);

  const timerRef = useRef(null);

  const showMsg = (msg, isError = false) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (isError) {
      setError(msg);
      setSuccess(null);
    } else {
      setSuccess(msg);
      setError(null);
    }
    timerRef.current = setTimeout(() => {
      setError(null);
      setSuccess(null);
      timerRef.current = null;
    }, 4000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Motor CRUD
  const handleAddMotor = async (e) => {
    e.preventDefault();
    try {
      if (editingMotor) {
        await apiCall("PUT", `/motor/${editingMotor.id}`, { merek, kapasitas: parseFloat(kapasitas) });
        showMsg("Kendaraan berhasil diperbarui.");
        setEditingMotor(null);
      } else {
        await apiCall("POST", "/motor", { merek, kapasitas: parseFloat(kapasitas) });
        showMsg("Kendaraan berhasil ditambahkan.");
      }
      setMerek("");
      setKapasitas("");
      loadData();
    } catch (err) {
      showMsg(err.message, true);
    }
  };

  const handleEditMotor = (m) => {
    setEditingMotor(m);
    setMerek(m.merek);
    setKapasitas(String(m.kapasitas));
  };

  const [confirmDelete, setConfirmDelete] = useState(null); // { id, type, name }

  const handleDeleteMotor = async (id) => {
    const motor = listMotor.find((m) => m.id === id);
    setConfirmDelete({ id, type: "motor", name: motor?.merek || `ID ${id}` });
  };

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      await apiCall("DELETE", `/${confirmDelete.type}/${confirmDelete.id}`);
      showMsg(`${confirmDelete.type === "motor" ? "Kendaraan" : "BBM"} berhasil dihapus.`);
      loadData();
    } catch (err) {
      showMsg(err.message, true);
    } finally {
      setConfirmDelete(null);
    }
  };

  // BBM CRUD
  const handleAddBbm = async (e) => {
    e.preventDefault();
    try {
      if (editingBbm) {
        await apiCall("PUT", `/bbm/${editingBbm.id}`, { nama_bbm: namaBbm, harga: parseInt(hargaBbm) });
        showMsg("BBM berhasil diperbarui.");
        setEditingBbm(null);
      } else {
        await apiCall("POST", "/bbm", { nama_bbm: namaBbm, harga: parseInt(hargaBbm) });
        showMsg("BBM berhasil ditambahkan.");
      }
      setNamaBbm("");
      setHargaBbm("");
      loadData();
    } catch (err) {
      showMsg(err.message, true);
    }
  };

  const handleEditBbm = (b) => {
    setEditingBbm(b);
    setNamaBbm(b.nama_bbm);
    setHargaBbm(String(b.harga));
  };

  const handleDeleteBbm = async (id) => {
    const bbm = listBbm.find((b) => b.id === id);
    setConfirmDelete({ id, type: "bbm", name: bbm?.nama_bbm || `ID ${id}` });
  };

  return (
    <div className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-blue-900 text-white rounded-lg px-4 py-3">
        <p className="text-sm font-semibold">
          🔒 Mode Otoritas Karyawan / Admin Aktif.
        </p>
        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-1.5 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-2">
          {success}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-4">
            <h3 className="font-bold text-slate-800 mb-2">Konfirmasi Hapus</h3>
            <p className="text-sm text-slate-600 mb-4">
              Yakin hapus <strong>{confirmDelete.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Batal
              </button>
              <button
                onClick={confirmDeleteAction}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kendaraan Form */}
        <div className="bg-white rounded-xl shadow-md border-t-4 border-blue-900 p-6">
          <h3 className="font-bold text-slate-800 mb-4">
            🏍️ {editingMotor ? "Edit" : "Daftarkan"} Varian Kendaraan Baru
          </h3>
          <form onSubmit={handleAddMotor} className="space-y-3">
            <input
              type="text" value={merek} onChange={(e) => setMerek(e.target.value)}
              placeholder="Merek motor" required maxLength={100}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <input
              type="number" value={kapasitas} onChange={(e) => setKapasitas(e.target.value)}
              placeholder="Kapasitas tangki (Liter)" required min="0.1" step="0.1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                {editingMotor ? "Perbarui Kendaraan" : "Simpan Kendaraan"}
              </button>
              {editingMotor && (
                <button
                  type="button" onClick={() => { setEditingMotor(null); setMerek(""); setKapasitas(""); }}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {/* Tabel Motor */}
          {listMotor.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">Merek</th>
                    <th className="py-2">Kapasitas</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listMotor.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{m.merek}</td>
                      <td className="py-2">{m.kapasitas} L</td>
                      <td className="py-2 flex gap-1">
                        <button onClick={() => handleEditMotor(m)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => handleDeleteMotor(m.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic mt-4 text-center py-4">
              Belum ada kendaraan terdaftar.
            </p>
          )}
        </div>

        {/* BBM Form */}
        <div className="bg-white rounded-xl shadow-md border-t-4 border-emerald-600 p-6">
          <h3 className="font-bold text-slate-800 mb-4">
            ⛽ {editingBbm ? "Edit" : "Rilis"} Produk BBM Baru
          </h3>
          <form onSubmit={handleAddBbm} className="space-y-3">
            <input
              type="text" value={namaBbm} onChange={(e) => setNamaBbm(e.target.value)}
              placeholder="Nama BBM" required maxLength={100}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <input
              type="number" value={hargaBbm} onChange={(e) => setHargaBbm(e.target.value)}
              placeholder="Harga per liter (Rp)" required min="1" step="1"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
              >
                {editingBbm ? "Perbarui BBM" : "Simpan BBM"}
              </button>
              {editingBbm && (
                <button
                  type="button" onClick={() => { setEditingBbm(null); setNamaBbm(""); setHargaBbm(""); }}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm transition-colors"
                >
                  Batal
                </button>
              )}
            </div>
          </form>

          {/* Tabel BBM */}
          {listBbm.length > 0 ? (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-slate-500">
                    <th className="py-2">Nama BBM</th>
                    <th className="py-2">Harga/L</th>
                    <th className="py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {listBbm.map((b) => (
                    <tr key={b.id} className="border-b last:border-0">
                      <td className="py-2 font-medium">{b.nama_bbm}</td>
                      <td className="py-2">{formatRupiah(b.harga)}</td>
                      <td className="py-2 flex gap-1">
                        <button onClick={() => handleEditBbm(b)} className="text-blue-600 hover:underline text-xs">Edit</button>
                        <button onClick={() => handleDeleteBbm(b.id)} className="text-red-600 hover:underline text-xs">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic mt-4 text-center py-4">
              Belum ada BBM terdaftar.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
