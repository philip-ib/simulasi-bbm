import { getDb } from "../db/connection.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { SECRET_KEY } from "../middlewares/auth.js";

export async function login(req, res) {
  try {
    const { username, password } = req.body;
    const db = await getDb();

    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    if (!user) {
      return res.status(400).json({ error: "Username atau Password salah!" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(400).json({ error: "Username atau Password salah!" });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({ message: "Login Berhasil!" });
  } catch (err) {
    res.status(500).json({ error: "Terjadi kesalahan pada server." });
  }
}

export function logout(req, res) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
  res.json({ message: "Logout Berhasil!" });
}

export function me(req, res) {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ loggedIn: false });
    }

    const decoded = jwt.verify(token, SECRET_KEY);
    return res.json({ loggedIn: true, username: decoded.username });
  } catch {
    return res.status(401).json({ loggedIn: false });
  }
}
