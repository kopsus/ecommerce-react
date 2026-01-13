import { Response } from "express";
import { PrismaClient } from "@prisma/client";
import { AuthRequest } from "../middleware/authMiddleware";

const prisma = new PrismaClient();

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ambil data dari body postman
    const { name, description, price, stock } = req.body;

    // Ambil ID user dari token (yg sudah dicek middleware)
    const sellerId = req.user?.userId;

    // Validasi sederhana
    if (!name || !price || !sellerId) {
      res.status(400).json({ message: "Nama dan harga wajib diisi" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price), // Jaga-jaga kalau dikirim string, kita ubah jadi angka
        stock: parseInt(stock),
        sellerId: sellerId, // Produk ini otomatis terhubung ke user yang login
      },
    });

    res.status(201).json({
      message: "Produk berhasil dibuat",
      product,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal membuat produk", error });
  }
};

export const getAllProducts = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      include: {
        seller: {
          // Kita ikut sertakan data penjualnya (tapi cuma nama & email)
          select: { name: true, email: true },
        },
      },
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data produk", error });
  }
};
