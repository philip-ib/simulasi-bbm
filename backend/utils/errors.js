// ============================================================
// HELPER: SANITASI ERROR MESSAGE
// ============================================================

/**
 * Mengembalikan pesan error yang aman untuk client.
 * Di production, ganti err.message dengan pesan generic
 * untuk mencegah kebocoran informasi internal.
 */
export function safeErrorMessage(err) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "Terjadi kesalahan pada server.";
  }
  return err.message || "Terjadi kesalahan tidak diketahui.";
}
