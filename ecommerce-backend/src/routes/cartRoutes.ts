import { Router } from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  updateCartItem,
} from "../controllers/cartController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, addToCart);
router.get("/", authenticateToken, getCart);
router.delete("/:id", authenticateToken, removeFromCart);
router.put("/:id", authenticateToken, updateCartItem);

export default router;
