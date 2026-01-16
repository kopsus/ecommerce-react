import { Router } from "express";
import {
  checkout,
  getMyOrders,
  getSellerOrders,
  midtransNotification,
  updateOrderStatus,
} from "../controllers/orderController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, checkout);
router.get("/", authenticateToken, getMyOrders);

router.post("/notification", midtransNotification);

router.get("/seller", authenticateToken, getSellerOrders);
router.patch("/:id/status", authenticateToken, updateOrderStatus);

export default router;
