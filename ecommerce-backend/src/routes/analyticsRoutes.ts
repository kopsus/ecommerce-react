import { Router } from "express";
import {
  getAdminStats,
  getSellerStats,
} from "../controllers/analyticsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/admin", authenticateToken, getAdminStats);
router.get("/seller", authenticateToken, getSellerStats);

export default router;
