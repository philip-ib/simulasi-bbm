import { useState } from "react";
import { useApp } from "../../context/AppContext.jsx";

export default function AdminLogin() {
  const { login, loading, showToast } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    const result = await login(username, password);
    if (!result.success) {
      setLoginError(result.error);
      return;
    }
    setUsername("");
    setPassword("");
    showToast(`Selamat datang kembali, ${result.username}!`);
  };

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-xl shadow-md border-t-4 border-blue-900 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4 text-center">
          🔐 Sistem Keamanan Admin
        </h2>

        {loginError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2 mb-4">
            {loginError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "Memproses..." : "LOG IN SYSTEM"}
          </button>
        </form>
      </div>
    </div>
  );
}
