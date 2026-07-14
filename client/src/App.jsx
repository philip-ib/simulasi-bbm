import { useEffect } from "react";
import { useApp } from "./context/AppContext.jsx";
import Navbar from "./components/layout/Navbar.jsx";
import Toast from "./components/layout/Toast.jsx";
import SimulasiPage from "./components/simulasi/SimulasiPage.jsx";
import AdminPage from "./components/admin/AdminPage.jsx";

export default function App() {
  const { tab, loadData, error, showToast } = useApp();

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tampilkan error global sebagai toast
  useEffect(() => {
    if (error) {
      showToast(error, true);
    }
  }, [error, showToast]);

  return (
    <div id="app">
      <Toast />
      <Navbar />
      <main className="max-w-4xl mx-auto p-6">
        {tab === "simulasi" ? <SimulasiPage /> : <AdminPage />}
      </main>
    </div>
  );
}
