import express from "express";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { verifyToken } from "../middlewares/auth.js";
import {
  getDataAwal,
  hitungSimulasi,
  tambahBbm,
  updateBbm,
  tambahMotor,
  updateMotor,
} from "../controllers/bbmController.js";

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY;

// Endpoint Login Admin (Langsung di sini karena singkat)
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "1h" });
    return res.json({ message: "Login Berhasil!", token });
  }
  res.status(400).json({ error: "Username atau Password salah!" });
});

// Peta Jalan Endpoint Umum (Publik)
router.get("/data-awal", getDataAwal);
router.post("/hitung", hitungSimulasi);

// Peta Jalan Endpoint Terproteksi Admin (Melewati Satpam verifyToken dulu)
router.post("/motor", verifyToken, tambahMotor);
router.post("/bensin", verifyToken, tambahBbm);
router.put("/bensin/:id", verifyToken, updateBbm);
router.put("/motor/:id", verifyToken, updateMotor);

export default router;
