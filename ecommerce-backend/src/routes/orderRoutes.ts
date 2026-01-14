import { Router } from "express";
import {
  checkout,
  getMyOrders,
  midtransNotification,
} from "../controllers/orderController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, checkout);
router.get("/", authenticateToken, getMyOrders);

router.post("/notification", midtransNotification);

export default router;
