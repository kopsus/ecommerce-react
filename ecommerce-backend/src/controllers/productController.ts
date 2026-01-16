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
    const imagePath = req.file ? req.file.filename : null;

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
    console.error("❌ ERROR CREATE PRODUCT:", error);

    res.status(500).json({
      message: "Gagal membuat produk",
      error: error.message || "Internal Server Error",
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
          select: { name: true, email: true },
        },
      },
    });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data produk", error });
  }
};

export const getProductById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: {
        seller: {
          select: { name: true, email: true, id: true },
        },
      },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error getProductById:", error);
    res.status(500).json({ message: "Gagal mengambil detail produk", error });
  }
};

export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    const image = req.file?.filename;

    const oldProduct = await prisma.product.findUnique({
      where: { id: Number(id) },
    });
    if (!oldProduct) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    if (oldProduct.sellerId !== req.user?.userId) {
      res.status(403).json({ message: "Bukan produk anda" });
      return;
    }

    let updatedData: any = {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
    };

    if (image) {
      if (oldProduct.image) {
        deleteImageFile(oldProduct.image);
      }
      updatedData.image = image;
    }

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

    const product = await prisma.product.findUnique({
      where: { id: Number(id) },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!product) {
      res.status(404).json({ message: "Produk tidak ditemukan" });
      return;
    }

    if (product.sellerId !== req.user?.userId) {
      res.status(403).json({ message: "Akses ditolak" });
      return;
    }

    if (product._count.orderItems > 0) {
      res.status(400).json({
        message:
          "Produk tidak bisa dihapus karena sudah ada riwayat transaksi. Edit stok jadi 0 saja.",
      });
      return;
    }

    if (product.image) {
      deleteImageFile(product.image);
    }

    await prisma.product.delete({ where: { id: Number(id) } });

    res.status(200).json({ message: "Produk dan gambar berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal hapus produk", error });
  }
};
