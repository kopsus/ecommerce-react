import { Router } from "express";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, addToWishlist);
router.get("/", authenticateToken, getMyWishlist);
router.delete("/:productId", authenticateToken, removeFromWishlist);

export default router;
