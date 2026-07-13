import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
import initDb from "./db/init.js";
import apiRoutes from "./routes/api.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

// API routes
app.use("/api", apiRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Serve frontend static files (production)
const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));

// SPA fallback — semua request tersisa ke index.html
app.use((req, res) => {
  if (req.path.startsWith("/api")) return;
  res.sendFile(path.join(clientDist, "index.html"));
});

const PORT = process.env.PORT || 5000;

// Inisialisasi DB (selalu, termasuk test mode)
await initDb();

// Start server hanya kalau bukan test
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`[Server] Simulasi BBM berjalan di http://localhost:${PORT}`);
  });
}

export default app;
