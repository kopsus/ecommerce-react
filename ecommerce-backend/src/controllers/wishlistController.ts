import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// --- TAMBAH KE WISHLIST ---
export const addToWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.body;

    // Cek apakah sudah ada?
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: Number(productId),
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: "Produk sudah ada di wishlist" });
      return;
    }

    const wishlist = await prisma.wishlist.create({
      data: {
        userId: userId,
        productId: Number(productId),
      },
    });

    res.status(201).json({ message: "Berhasil masuk wishlist", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan wishlist", error });
  }
};

// --- LIHAT WISHLIST SAYA ---
export const getMyWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: true, // Kita butuh data produknya (Gambar, Harga, Nama)
      },
    });
    res.status(200).json(wishlist);
  } catch (error) {
    res.status(500).json({ message: "Error server", error });
  }
};

// --- HAPUS DARI WISHLIST ---
export const removeFromWishlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId } = req.params; // Kita hapus berdasarkan ID Produk saja biar gampang

    await prisma.wishlist.delete({
      where: {
        userId_productId: {
          userId: userId,
          productId: Number(productId),
        },
      },
    });

    res.status(200).json({ message: "Dihapus dari wishlist" });
  } catch (error) {
    res.status(500).json({
      message: "Gagal menghapus (Mungkin item tidak ditemukan)",
      error,
    });
  }
};
