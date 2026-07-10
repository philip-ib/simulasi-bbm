// Vercel entry point - standalone Express app
import express from "express";
import cors from "cors";
import pg from "pg";
import cookieParser from "cookie-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import serverless from "serverless-http";

const { Pool } = pg;
const app = express();

// CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Database setup
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
    max: 1,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  return pool;
}

// Init DB
let dbInitialized = false;
async function initDb() {
  if (dbInitialized) return;
  dbInitialized = true;
  try {
    const db = getPool();
    await db.query(
      `CREATE TABLE IF NOT EXISTS bensin (id SERIAL PRIMARY KEY, nama_bbm TEXT, harga INTEGER)`,
    );
    await db.query(
      `CREATE TABLE IF NOT EXISTS motor (id SERIAL PRIMARY KEY, merek TEXT, kapasitas REAL)`,
    );
    await db.query(
      `CREATE TABLE IF NOT EXISTS users (id SERIAL PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)`,
    );

    const bensinCheck = await db.query("SELECT COUNT(*) FROM bensin");
    if (parseInt(bensinCheck.rows[0].count) === 0) {
      await db.query(
        "INSERT INTO bensin (nama_bbm, harga) VALUES ($1, $2), ($3, $4)",
        ["Pertamax", 13200, "Pertalite", 10000],
      );
    }
    const motorCheck = await db.query("SELECT COUNT(*) FROM motor");
    if (parseInt(motorCheck.rows[0].count) === 0) {
      await db.query(
        "INSERT INTO motor (merek, kapasitas) VALUES ($1, $2), ($3, $4)",
        ["Honda Karisma 125", 3.7, "Honda Beat", 4.2],
      );
    }
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
    console.log("Database initialized");
  } catch (err) {
    console.error("DB init error:", err.message);
  }
}
initDb();

// Routes
const SECRET_KEY = process.env.SECRET_KEY || "default-secret-key";

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Get data awal
app.get("/api/data-awal", async (req, res) => {
  try {
    const db = getPool();
    const bensinResult = await db.query("SELECT * FROM bensin ORDER BY id ASC");
    const motorResult = await db.query("SELECT * FROM motor ORDER BY id ASC");
    res.json({ bensin: bensinResult.rows, motor: motorResult.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Hitung simulasi
app.post("/api/hitung", (req, res) => {
  const { inputUser, tipeInput, kapasitasTangki, hargaBbm } = req.body;
  let liter =
    tipeInput === "uang"
      ? parseFloat((Number(inputUser) / hargaBbm).toFixed(2))
      : Number(inputUser);
  let rupiah = tipeInput === "uang" ? Number(inputUser) : liter * hargaBbm;
  let persentase = parseFloat(((liter / kapasitasTangki) * 100).toFixed(1));
  let status = liter > kapasitasTangki ? "Meluber! Tangki tidak muat." : "Aman";
  res.json({
    literDidapat: liter,
    totalBiaya: rupiah,
    persentaseTangki: persentase,
    status,
  });
});

// Login
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const db = getPool();
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (result.rows.length === 0)
      return res.status(400).json({ error: "Username atau Password salah!" });
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Username atau Password salah!" });
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" },
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 3600000,
    });
    return res.json({ message: "Login Berhasil!" });
  } catch (err) {
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
});

// Logout
app.post("/api/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout Berhasil!" });
});

// Verify token middleware
function verifyToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token)
    return res
      .status(401)
      .json({ error: "Akses ditolak! Sesi telah berakhir." });
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(401).json({ error: "Token tidak sah!" });
    req.admin = decoded;
    next();
  });
}

// Tambah motor (protected)
app.post("/api/motor", verifyToken, async (req, res) => {
  const { merek, kapasitas } = req.body;
  try {
    const db = getPool();
    await db.query("INSERT INTO motor (merek, kapasitas) VALUES ($1, $2)", [
      merek,
      kapasitas,
    ]);
    res.json({ message: "Motor baru berhasil disimpan!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update motor (protected)
app.put("/api/motor/:id", verifyToken, async (req, res) => {
  const { merek, kapasitas } = req.body;
  const { id } = req.params;
  try {
    const db = getPool();
    await db.query(
      "UPDATE motor SET merek = $1, kapasitas = $2 WHERE id = $3",
      [merek, kapasitas, id],
    );
    res.json({ message: "Data motor berhasil diperbarui!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tambah BBM (protected)
app.post("/api/bensin", verifyToken, async (req, res) => {
  const { nama_bbm, harga } = req.body;
  try {
    const db = getPool();
    await db.query("INSERT INTO bensin (nama_bbm, harga) VALUES ($1, $2)", [
      nama_bbm,
      harga,
    ]);
    res.json({ message: "BBM baru berhasil disimpan!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update BBM (protected)
app.put("/api/bensin/:id", verifyToken, async (req, res) => {
  const { nama_bbm, harga } = req.body;
  const { id } = req.params;
  try {
    const db = getPool();
    await db.query(
      "UPDATE bensin SET nama_bbm = $1, harga = $2 WHERE id = $3",
      [nama_bbm, harga, id],
    );
    res.json({ message: "Data bensin berhasil diperbarui!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export for Vercel
export default serverless(app);
