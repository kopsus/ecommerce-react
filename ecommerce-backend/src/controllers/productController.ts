import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";

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

export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params; // Ambil ID produk dari URL
    const { name, description, price, stock } = req.body;
    const userId = req.user?.userId;

    // 1. Cek dulu apakah produknya ada?
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    // 2. Cek apakah yang mau edit adalah pemilik produknya?
    if (product.sellerId !== userId) {
      res
        .status(403)
        .json({ message: "Anda tidak memiliki izin mengedit produk ini" });
      return;
    }

    // 3. Lakukan update
    const updatedProduct = await prisma.product.update({
      where: { id: Number(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined, // Update jika ada data baru
        stock: stock ? parseInt(stock) : undefined,
      },
    });

    res.status(200).json({
      message: "Produk berhasil diperbarui",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengupdate produk", error });
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    // 1. Cek produk ada atau tidak
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    // 2. Cek kepemilikan
    if (product.sellerId !== userId) {
      res
        .status(403)
        .json({ message: "Anda tidak berhak menghapus produk ini" });
      return;
    }

    // 3. Hapus produk
    await prisma.product.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menghapus produk", error });
  }
};
