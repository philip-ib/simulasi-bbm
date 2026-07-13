import express from "express";
import cors from "cors";
import pg from "pg";
import apiRoutes from "./routes/api.js";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import serverless from "serverless-http";
import "dotenv/config";

const { Pool } = pg;
export const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================
// CORS - Whitelist origin untuk keamanan
// ============================================================
function getAllowedOrigins() {
  if (process.env.ALLOWED_ORIGIN) {
    return process.env.ALLOWED_ORIGIN.split(",").map(o => o.trim());
  }
  return [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ];
}
const allowedOrigins = getAllowedOrigins();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn("CORS blocked origin:", origin);
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ============================================================
// SETUP KONEKSI POSTGRESQL (dengan caching untuk serverless)
// ============================================================
let pool = null;

function getPool() {
  if (pool) return pool;

  const rawDbUrl = process.env.DATABASE_URL || "";
  const cleanDbUrl = rawDbUrl
    .replace(/[&?]channel_binding=[^&]*/g, "")
    .replace(/\?$/, "");

  pool = new Pool({
    connectionString: cleanDbUrl,
    ssl: cleanDbUrl.includes("localhost")
      ? false
      : { rejectUnauthorized: false },
    // Untuk serverless: max 1 koneksi, idle timeout cepat
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });

  return pool;
}

export { getPool };

// ============================================================
// INISIALISASI DATABASE (dipanggil sekali di awal)
// ============================================================
let dbInitialized = false;

async function initDb() {
  if (dbInitialized) return;
  dbInitialized = true;

  try {
    const db = getPool();

    // Buat Tabel Bensin
    await db.query(`
      CREATE TABLE IF NOT EXISTS bensin (
        id SERIAL PRIMARY KEY, 
        nama_bbm TEXT, 
        harga INTEGER
      )
    `);

    // Buat Tabel Motor
    await db.query(`
      CREATE TABLE IF NOT EXISTS motor (
        id SERIAL PRIMARY KEY, 
        merek TEXT, 
        kapasitas REAL
      )
    `);

    // Isi data awal jika tabel bensin kosong
    const bensinCheck = await db.query("SELECT COUNT(*) FROM bensin");
    if (parseInt(bensinCheck.rows[0].count) === 0) {
      await db.query(
        "INSERT INTO bensin (nama_bbm, harga) VALUES ($1, $2), ($3, $4)",
        ["Pertamax", 13200, "Pertalite", 10000],
      );
    }

    // Isi data awal jika tabel motor kosong
    const motorCheck = await db.query("SELECT COUNT(*) FROM motor");
    if (parseInt(motorCheck.rows[0].count) === 0) {
      await db.query(
        "INSERT INTO motor (merek, kapasitas) VALUES ($1, $2), ($3, $4)",
        ["Honda Karisma 125", 3.7, "Honda Beat", 4.2],
      );
    }

    // Buat Tabel Users
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      )
    `);

    // Isi data admin default jika tabel users kosong
    const userCheck = await db.query("SELECT COUNT(*) FROM users");
    if (parseInt(userCheck.rows[0].count) === 0) {
      const defaultUsername = process.env.ADMIN_USERNAME || "admin";
      const defaultPassword = process.env.ADMIN_PASSWORD || "123456";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);
      await db.query("INSERT INTO users (username, password) VALUES ($1, $2)", [
        defaultUsername,
        hashedPassword,
      ]);
    }

    console.log("Sukses: Terhubung dan Sinkronisasi ke PostgreSQL Cloud");
  } catch (err) {
    console.error("Gagal inisialisasi database PostgreSQL:", err.message);
  }
}

// Panggil initDb (aman dipanggil multiple kali di serverless)
initDb();

// ============================================================
// ROUTES
// ============================================================
app.use("/api", apiRoutes);

// Health check endpoint untuk Vercel
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============================================================
// JALANKAN SERVER (Hanya jika di lokal)
// ============================================================
if (process.env.NODE_ENV !== "production" && !process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server Backend berjalan di http://localhost:${PORT}`),
  );
}

// ============================================================
// EXPORT UNTUK VERCEL SERVERLESS
// ============================================================
export default serverless(app);
