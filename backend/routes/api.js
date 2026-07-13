import express from "express";
import rateLimit from "express-rate-limit";
import { verifyToken } from "../middlewares/auth.js";
import {
  validateLogin,
  validateHitung,
  validateBbm,
  validateMotor,
} from "../middlewares/validate.js";
import {
  getDataAwal,
  hitungSimulasi,
  tambahBbm,
  updateBbm,
  tambahMotor,
  updateMotor,
} from "../controllers/bbmController.js";
import { login, logout } from "../controllers/authController.js";

const router = express.Router();

// Rate limiter untuk endpoint login (brute force protection)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10,                  // maksimal 10 percobaan per window
  message: { error: "Terlalu banyak percobaan login. Coba lagi dalam 15 menit." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Endpoint Login & Logout Admin
router.post("/login", loginLimiter, validateLogin, login);
router.post("/logout", logout);

// Peta Jalan Endpoint Umum (Publik)
router.get("/data-awal", getDataAwal);
router.post("/hitung", validateHitung, hitungSimulasi);

// Peta Jalan Endpoint Terproteksi Admin (Melewati Satpam verifyToken dulu)
router.post("/motor", verifyToken, validateMotor, tambahMotor);
router.post("/bensin", verifyToken, validateBbm, tambahBbm);
router.put("/bensin/:id", verifyToken, validateBbm, updateBbm);
router.put("/motor/:id", verifyToken, validateMotor, updateMotor);

export default router;
