import express from "express";
import { verifyToken } from "../middlewares/auth.js";
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

// Endpoint Login & Logout Admin
router.post("/login", login);
router.post("/logout", logout);

// Peta Jalan Endpoint Umum (Publik)
router.get("/data-awal", getDataAwal);
router.post("/hitung", hitungSimulasi);

// Peta Jalan Endpoint Terproteksi Admin (Melewati Satpam verifyToken dulu)
router.post("/motor", verifyToken, tambahMotor);
router.post("/bensin", verifyToken, tambahBbm);
router.put("/bensin/:id", verifyToken, updateBbm);
router.put("/motor/:id", verifyToken, updateMotor);

export default router;
