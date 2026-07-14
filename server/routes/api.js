import { Router } from "express";
import rateLimit from "express-rate-limit";
import { login, logout, me } from "../controllers/authController.js";
import {
  getMotor,
  getBbm,
  hitungSimulasi,
  tambahMotor,
  updateMotor,
  hapusMotor,
  tambahBbm,
  updateBbm,
  hapusBbm,
} from "../controllers/simulasiController.js";
import { verifyToken } from "../middlewares/auth.js";
import { validateLogin, validateSimulasi, validateBbm, validateMotor } from "../middlewares/validate.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Terlalu banyak percobaan login. Coba lagi 15 menit." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: "Terlalu banyak permintaan. Coba lagi nanti." },
});

// Auth routes
router.post("/auth/login", loginLimiter, validateLogin, login);
router.post("/auth/logout", logout);
router.get("/auth/me", me);

// Public data routes
router.get("/motor", getMotor);
router.get("/bbm", getBbm);

// Simulation route
router.post("/simulasi", validateSimulasi, hitungSimulasi);

// Protected motor routes
router.post("/motor", verifyToken, apiLimiter, validateMotor, tambahMotor);
router.put("/motor/:id", verifyToken, apiLimiter, validateMotor, updateMotor);
router.delete("/motor/:id", verifyToken, apiLimiter, hapusMotor);

// Protected BBM routes
router.post("/bbm", verifyToken, apiLimiter, validateBbm, tambahBbm);
router.put("/bbm/:id", verifyToken, apiLimiter, validateBbm, updateBbm);
router.delete("/bbm/:id", verifyToken, apiLimiter, hapusBbm);

export default router;
