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
router.post("/motor", verifyToken, validateMotor, tambahMotor);
router.put("/motor/:id", verifyToken, validateMotor, updateMotor);
router.delete("/motor/:id", verifyToken, hapusMotor);

// Protected BBM routes
router.post("/bbm", verifyToken, validateBbm, tambahBbm);
router.put("/bbm/:id", verifyToken, validateBbm, updateBbm);
router.delete("/bbm/:id", verifyToken, hapusBbm);

export default router;
