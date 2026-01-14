import { Router } from "express";
import { checkout, getMyOrders } from "../controllers/orderController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, checkout); // Checkout keranjang saat ini
router.get("/", authenticateToken, getMyOrders); // Lihat riwayat belanja

export default router;
