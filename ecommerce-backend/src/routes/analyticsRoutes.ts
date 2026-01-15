import { Router } from "express";
import {
  getAdminStats,
  getSellerStats,
} from "../controllers/analyticsController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Endpoint Admin
router.get("/admin", authenticateToken, getAdminStats);

// Endpoint Seller
router.get("/seller", authenticateToken, getSellerStats);

export default router;
