import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret_default";

export interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  // 1. Ambil token dari Header
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Kita ambil bagian tokennya saja

  // 2. Jika tidak ada token, tolak akses
  if (!token) {
    res.status(401).json({ message: "Akses ditolak. Token tidak ditemukan." });
    return;
  }

  // 3. Verifikasi token
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      res.status(403).json({ message: "Token tidak valid atau kadaluarsa." });
      return;
    }

    // 4. Jika valid, simpan data user ke request agar bisa dipakai di controller
    req.user = user;

    // 5. Lanjut ke proses berikutnya (Controller)
    next();
  });
};
