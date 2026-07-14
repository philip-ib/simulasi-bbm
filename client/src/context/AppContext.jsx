import { createContext, useContext, useState, useCallback, useEffect } from "react";

const AppContext = createContext(null);

const API = "/api";

export function AppProvider({ children }) {
  const [tab, setTab] = useState("simulasi");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [listMotor, setListMotor] = useState([]);
  const [listBbm, setListBbm] = useState([]);
  const [selectedMotor, setSelectedMotor] = useState(null);
  const [selectedBbm, setSelectedBbm] = useState(null);
  const [tipeInput, setTipeInput] = useState("uang");
  const [inputUser, setInputUser] = useState("");
  const [hasil, setHasil] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, isError = false) => {
    setToast({ message, isError, key: Date.now() });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [motorRes, bbmRes] = await Promise.all([
        fetch(`${API}/motor`),
        fetch(`${API}/bbm`),
      ]);

      if (motorRes.ok) {
        setListMotor(await motorRes.json());
      } else {
        console.error("Gagal memuat data motor.");
      }

      if (bbmRes.ok) {
        setListBbm(await bbmRes.json());
      } else {
        console.error("Gagal memuat data BBM.");
      }
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, []);

  const hitung = useCallback(async () => {
    if (inputUser === "" || !selectedMotor || !selectedBbm) {
      setHasil(null);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API}/simulasi`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputUser: parseFloat(inputUser),
          tipeInput,
          kapasitasTangki: selectedMotor.kapasitas,
          hargaBbm: selectedBbm.harga,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Simulasi gagal diproses.");
        setHasil(null);
        return;
      }
      setHasil(data);
      setError(null);
    } catch {
      setHasil(null);
      setError("Gagal terhubung ke server.");
    } finally {
      setLoading(false);
    }
  }, [inputUser, tipeInput, selectedMotor, selectedBbm]);

  const login = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || "Login gagal." };
      }
      setIsLoggedIn(true);
      return { success: true, username };
    } catch {
      return { success: false, error: "Gagal terhubung ke server." };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API}/auth/logout`, { method: "POST" });
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch(`${API}/auth/me`);
      if (!res.ok) {
        setIsLoggedIn(false);
        localStorage.removeItem("isLoggedIn");
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  // Verifikasi session saat mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const apiCall = useCallback(async (method, path, body) => {
    const res = await fetch(`${API}${path}`, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });

    if (res.status === 401 || res.status === 403) {
      setIsLoggedIn(false);
      throw new Error("Sesi telah habis. Silakan login kembali.");
    }

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Gagal.");
    }
    return data;
  }, []);

  return (
    <AppContext.Provider
      value={{
        tab, setTab,
        isLoggedIn, setIsLoggedIn,
        listMotor, setListMotor,
        listBbm, setListBbm,
        selectedMotor, setSelectedMotor,
        selectedBbm, setSelectedBbm,
        tipeInput, setTipeInput,
        inputUser, setInputUser,
        hasil, setHasil,
        loading, setLoading,
        error, setError,
        toast, showToast, clearToast,
        loadData, hitung, login, logout, checkAuth, apiCall,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
