import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";

export const addToCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user?.userId;

    const qty = quantity || 1;

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: userId,
          productId: Number(productId),
        },
      },
    });

    if (existingItem) {
      const updatedItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty },
      });
      res.status(200).json({
        message: "Jumlah produk di keranjang diperbarui",
        cartItem: updatedItem,
      });
    } else {
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
    const { id } = req.params;
    const { quantity } = req.body;

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

export const getCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: true,
      },
    });

    res.status(200).json(cartItems);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data keranjang", error });
  }
};

export const removeFromCart = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    await prisma.cartItem.deleteMany({
      where: {
        id: Number(id),
        userId: userId,
      },
    });

    res.status(200).json({ message: "Produk dihapus dari keranjang" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus item", error });
  }
};
