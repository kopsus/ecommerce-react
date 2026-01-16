import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Semua rute di sini WAJIB login (ada authenticateToken)
router.post("/", authenticateToken, addToCart); // Tambah barang
router.get("/", authenticateToken, getCart); // Lihat keranjang
router.delete("/:id", authenticateToken, removeFromCart); // Hapus item (berdasarkan ID cartItem)
router.put("/:id", authenticateToken, updateCartItem);

export default router;
