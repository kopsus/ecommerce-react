import { Request, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// --- BUAT VOUCHER (Khusus Seller) ---
export const createVoucher = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.user?.userId;
    const { code, type, amount, minPurchase, expiresAt } = req.body;

    // Validasi Role
    if (req.user?.role !== "SELLER") {
      res.status(403).json({ message: "Hanya Seller yang bisa buat voucher" });
      return;
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(), // Paksa huruf besar
        type, // PERCENT atau FIXED
        amount: parseFloat(amount),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        expiresAt: new Date(expiresAt), // Format: YYYY-MM-DD
        sellerId: sellerId,
      },
    });

    res.status(201).json({ message: "Voucher berhasil dibuat", voucher });
  } catch (error: any) {
    // Handle error duplicate code
    if (error.code === "P2002") {
      res.status(400).json({ message: "Kode voucher sudah digunakan." });
      return;
    }
    res
      .status(500)
      .json({ message: "Gagal membuat voucher", error: error.message });
  }
};

// --- LIHAT VOUCHER SAYA (Khusus Seller) ---
export const getMyVouchers = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.user?.userId;
    const vouchers = await prisma.voucher.findMany({
      where: { sellerId },
    });
    res.status(200).json(vouchers);
  } catch (error) {
    res.status(500).json({ message: "Error server", error });
  }
};
