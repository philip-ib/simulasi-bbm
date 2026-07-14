import { useEffect, useState, useRef } from "react";
import { useApp } from "../../context/AppContext.jsx";

export default function Toast() {
  const { toast, clearToast } = useApp();
  const [visible, setVisible] = useState(false);
  const innerTimerRef = useRef(null);

  useEffect(() => {
    if (!toast) {
      setVisible(false);
      return;
    }

    // Animasi masuk
    requestAnimationFrame(() => setVisible(true));

    // Auto-hilang setelah 2.5 detik
    const timer = setTimeout(() => {
      setVisible(false);
      innerTimerRef.current = setTimeout(clearToast, 400); // tunggu animasi fade-out selesai
    }, 2500);

    return () => {
      clearTimeout(timer);
      if (innerTimerRef.current) {
        clearTimeout(innerTimerRef.current);
        innerTimerRef.current = null;
      }
    };
  }, [toast, clearToast]);

  if (!toast) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm transition-all duration-300 ease-out ${
        visible
          ? "translate-x-0 opacity-100"
          : "translate-x-8 opacity-0"
      }`}
    >
      <div className={`px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 ${
        toast.isError ? "bg-red-600 text-white" : "bg-emerald-600 text-white"
      }`}>
        <span className="text-lg">{toast.isError ? "⚠️" : "✅"}</span>
        <p className="text-sm font-medium">{toast.message}</p>
        <button
          onClick={() => {
            setVisible(false);
            innerTimerRef.current = setTimeout(clearToast, 400);
          }}
          aria-label="Tutup notifikasi"
          className="ml-auto text-white/70 hover:text-white text-lg leading-none"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
