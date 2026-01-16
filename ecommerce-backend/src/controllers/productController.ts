import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import { prisma } from "../db";
import fs from "fs";
import path from "path";

const deleteImageFile = (filename: string) => {
  const filePath = path.join(__dirname, "../../uploads", filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const body = req.body || {};
    const { name, description, price, stock } = body;
    const sellerId = req.user?.userId;
    const imagePath = req.file ? req.file.filename : null; // Ambil path gambar

    if (!name || !price || !sellerId) {
      res.status(400).json({ message: "Nama dan harga wajib diisi" });
      return;
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        sellerId: sellerId,
        image: imagePath,
      },
    });

    res.status(201).json({
      message: "Produk berhasil dibuat",
      product,
    });
  } catch (error: any) {
    // Tambahkan ': any' biar typescript tidak rewel
    // 1. Tampilkan Error di Terminal VS Code
    console.error("❌ ERROR CREATE PRODUCT:", error);

    // 2. Kirim pesan error yang jelas ke Postman
    res.status(500).json({
      message: "Gagal membuat produk",
      error: error.message || "Internal Server Error", // Ambil .message nya saja
    });
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
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    const image = req.file?.filename; // Nama file baru (jika ada)

    // 1. Cek produk lama
    const oldProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!oldProduct) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    // 2. Cek kepemilikan
    if (oldProduct.sellerId !== req.user?.userId) {
      res.status(403).json({ message: "Bukan produk anda" });
      return;
    }

    // 3. Logic Ganti Foto
    let updatedData: any = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
    };

    if (image) {
      // Jika user upload foto baru:
      // a. Hapus foto lama dari folder
      if (oldProduct.image) {
        deleteImageFile(oldProduct.image);
      }
      // b. Masukkan nama foto baru ke database
      updatedData.image = image;
    }

    // 4. Update Database
    const product = await prisma.product.update({
      where: { id: Number(id) },
      data: updatedData,
    });

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal update produk", error });
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    // 1. Cek produk
    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { orderItems: true } } }, // Cek apakah ada order
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    if (product.sellerId !== req.user?.userId) {
      res.status(403).json({ message: "Akses ditolak" });
      return;
    }

    // 2. Proteksi: Jangan hapus jika sudah pernah terjual
    if (product._count.orderItems > 0) {
      res.status(400).json({
        message:
          "Produk tidak bisa dihapus karena sudah ada riwayat transaksi. Edit stok jadi 0 saja.",
      });
      return;
    }

    // 3. Hapus File Gambar Fisik
    if (product.image) {
      deleteImageFile(product.image);
    }

    // 4. Hapus dari Database
    await prisma.product.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "Produk dan gambar berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal hapus produk", error });
  }
};
