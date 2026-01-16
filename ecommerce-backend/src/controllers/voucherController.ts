import { Request, Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

export const createVoucher = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.user?.userId;
    const { code, type, amount, minPurchase, expiresAt } = req.body;

    if (req.user?.role !== "SELLER") {
      res.status(403).json({ message: "Hanya Seller yang bisa buat voucher" });
      return;
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        type,
        amount: parseFloat(amount),
        minPurchase: minPurchase ? parseFloat(minPurchase) : 0,
        expiresAt: new Date(expiresAt),
        sellerId: sellerId,
      },
    });

    res.status(201).json({ message: "Voucher berhasil dibuat", voucher });
  } catch (error: any) {
    if (error.code === "P2002") {
      res.status(400).json({ message: "Kode voucher sudah digunakan." });
      return;
    }
    res
      .status(500)
      .json({ message: "Gagal membuat voucher", error: error.message });
  }
};

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

export const deleteVoucher = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const sellerId = req.user?.userId;

    const voucher = await prisma.voucher.findUnique({
      where: { id: Number(id) },
    });

    if (!voucher) {
      res.status(404).json({ message: "Voucher tidak ditemukan" });
      return;
    }

    if (voucher.sellerId !== sellerId) {
      res.status(403).json({ message: "Bukan voucher milik anda" });
      return;
    }

    await prisma.voucher.delete({ where: { id: Number(id) } });
    res.status(200).json({ message: "Voucher berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal hapus voucher", error });
  }
};
