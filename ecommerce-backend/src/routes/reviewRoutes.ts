import { Router } from "express";
import { addReview, getProductReviews } from "../controllers/reviewController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, addReview);
router.get("/:productId", getProductReviews);

export default router;
