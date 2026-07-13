import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY || "dev-secret-key-ganti-di-production";

export function verifyToken(req, res, next) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      error: "Akses ditolak! Sesi telah berakhir atau Anda belum login.",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({
      error: "Tiket/Token tidak sah atau sudah kedaluwarsa!",
    });
  }
}

export { SECRET_KEY };
