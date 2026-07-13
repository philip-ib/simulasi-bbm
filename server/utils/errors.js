export function safeErrorMessage(err) {
  if (process.env.NODE_ENV === "production") {
    return "Terjadi kesalahan pada server.";
  }
  return err.message;
}
