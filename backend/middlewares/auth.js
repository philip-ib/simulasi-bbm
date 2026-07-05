import jwt from "jsonwebtoken";
import "dotenv/config";

const SECRET_KEY = process.env.SECRET_KEY;

export const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(401)
      .json({ error: "Akses ditolak! Sesi telah berakhir atau Anda belum login." });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .json({ error: "Tiket/Token tidak sah atau sudah kedaluwarsa!" });
    }
    req.admin = decoded;
    next();
  });
};
