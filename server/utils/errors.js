export function safeErrorMessage(err) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    return "Terjadi kesalahan pada server.";
  }
  return err.message;
}
