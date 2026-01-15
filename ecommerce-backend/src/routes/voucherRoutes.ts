import { Router } from "express";
import { createVoucher, getMyVouchers } from "../controllers/voucherController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

// Endpoint Seller
router.post("/", authenticateToken, createVoucher);
router.get("/", authenticateToken, getMyVouchers);

export default router;
