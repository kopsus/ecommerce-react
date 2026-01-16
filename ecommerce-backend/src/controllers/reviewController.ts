import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

export const addReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { productId, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating harus antara 1 sampai 5" });
      return;
    }

    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId: userId,
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

export const getProductReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { productId } = req.params;

    const reviews = await prisma.review.findMany({
      where: { productId: Number(productId) },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil ulasan", error });
  }
};
