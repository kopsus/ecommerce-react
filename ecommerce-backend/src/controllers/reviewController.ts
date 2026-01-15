import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// --- TAMBAH REVIEW ---
export const addReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId, rating, comment } = req.body;

    // 1. Validasi Input
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating harus antara 1 sampai 5" });
      return;
    }

    // 2. CEK SYARAT: Apakah User pernah membeli produk ini dan statusnya PAID/SHIPPED/COMPLETED?
    // Kita cari di tabel Order yang punya OrderItem dengan productId tersebut
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: userId,
        // Status harus sudah bayar (PAID) atau lebih lanjut
        status: { in: ["PAID", "SHIPPED", "COMPLETED"] },
        items: {
          some: { productId: Number(productId) },
        },
      },
    });

    if (!hasPurchased) {
      res.status(403).json({
        message:
          "Anda harus membeli produk ini terlebih dahulu untuk memberikan ulasan.",
      });
      return;
    }

    // 3. Buat Review
    const review = await prisma.review.create({
      data: {
        userId: userId,
        productId: Number(productId),
        rating: Number(rating),
        comment: comment,
      },
    });

    res.status(201).json({ message: "Ulasan berhasil dikirim", review });
  } catch (error: any) {
    // Handle error unique constraint (kalau user review 2x di produk yg sama)
    if (error.code === "P2002") {
      res
        .status(400)
        .json({ message: "Anda sudah mengulas produk ini sebelumnya." });
      return;
    }
    res
      .status(500)
      .json({ message: "Gagal mengirim ulasan", error: error.message });
  }
};

// --- LIHAT REVIEW PER PRODUK ---
export const getProductReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId: Number(productId) },
      include: {
        user: { select: { name: true } }, // Tampilkan nama reviewer
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil ulasan", error });
  }
};
