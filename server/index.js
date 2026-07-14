import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env dari root project
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import express from "express";
import cookieParser from "cookie-parser";
import initDb from "./db/init.js";
import apiRoutes from "./routes/api.js";

const app = express();

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.set("trust proxy", 1);

// API routes
app.use("/api", apiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend static files (production)
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

// 404 handler untuk endpoint API yang tidak dikenali
app.use("/api", (req, res) => {
  res.status(404).json({ error: "Endpoint API tidak ditemukan." });
});

// SPA fallback — semua request tersisa ke index.html
app.use((req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

// Global error handler (Express 5)
app.use((err, req, res, next) => {
  console.error("[Server Error]", err);
  res.status(500).json({ error: "Terjadi kesalahan pada server." });
});

const PORT = process.env.PORT || 5000;

// Inisialisasi DB (selalu, termasuk test mode)
await initDb();

// Graceful shutdown
function shutdown() {
  console.log("[Server] Shutting down...");
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Start server hanya kalau bukan test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Server] Simulasi BBM berjalan di http://localhost:${PORT}`);
  });
}

export default app;
