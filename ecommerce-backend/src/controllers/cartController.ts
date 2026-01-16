import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";

// --- TAMBAH KE KERANJANG ---
export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.userId;

    // Pastikan quantity minimal 1
    const qty = quantity || 1;

    // 1. Cek apakah barang ini sudah ada di keranjang user?
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          // Ini bisa dipakai karena kita set @@unique di schema
          userId: userId,
          productId: Number(productId),
        },
      },
    });

    if (existingItem) {
      // 2. Kalau sudah ada, update quantity-nya saja
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty },
      });
      res.status(200).json({
        message: "Jumlah produk di keranjang diperbarui",
        cartItem: updatedItem,
      });
    } else {
      // 3. Kalau belum ada, buat item baru
      const newItem = await prisma.cartItem.create({
        data: {
          userId: userId,
          productId: Number(productId),
          quantity: qty,
        },
      });
      res
        .status(201)
        .json({ message: "Produk masuk keranjang", cartItem: newItem });
    }
  } catch (error) {
    res.status(500).json({ message: "Gagal menambahkan ke keranjang", error });
  }
};

export const updateCartItem = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // ID CartItem
    const { quantity } = req.body; // Quantity BARU (Absolute, misal: 5)

    if (quantity < 1) {
      res.status(400).json({ message: "Jumlah minimal 1" });
      return;
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: Number(id) },
      data: { quantity: Number(quantity) },
      include: { product: true },
    });

    res.status(200).json({ message: "Jumlah diupdate", item: updatedItem });
  } catch (error) {
    res.status(500).json({ message: "Gagal update keranjang", error });
  }
};

// --- LIHAT ISI KERANJANG ---
export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true, // Kita butuh data nama & harga produknya, bukan cuma ID doang
      },
    });

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data keranjang", error });
  }
};

// --- HAPUS DARI KERANJANG ---
export const removeFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // ID CartItem
    const userId = req.user?.userId;

    await prisma.cartItem.deleteMany({
      where: {
        id: Number(id),
        userId: userId, // Pastikan yang dihapus adalah milik user yg login
      },
    });

    res.status(200).json({ message: "Produk dihapus dari keranjang" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus item", error });
  }
};
