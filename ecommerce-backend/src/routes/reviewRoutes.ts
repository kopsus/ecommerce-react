import { Router } from "express";
import { addReview, getProductReviews } from "../controllers/reviewController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// POST: Harus login untuk review
router.post("/", authenticateToken, addReview);

// GET: Publik boleh lihat review (tanpa login juga bisa sebenernya, tapi pakai auth request buat konsistensi tipe data di controller)
// Kita buka akses publik saja untuk melihat review (hapus authenticateToken kalau mau benar2 public)
router.get("/:productId", getProductReviews);

export default router;
