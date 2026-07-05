import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import "dotenv/config";
import { pool } from "../index.js";

const SECRET_KEY = process.env.SECRET_KEY;

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Username atau Password salah!" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Username atau Password salah!" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: "1h" });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000 // 1 hour
    });

    return res.json({ message: "Login Berhasil!" });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logout Berhasil!" });
};
