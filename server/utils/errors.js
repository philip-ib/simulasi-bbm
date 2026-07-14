export function safeErrorMessage(err) {
  console.error("[Internal Error]", err);
  if (process.env.NODE_ENV === "production") {
    return "Terjadi kesalahan pada server.";
  }
  return err?.message || "Terjadi kesalahan pada server.";
}
