import { Router } from "express";
import {
  createVoucher,
  deleteVoucher,
  getMyVouchers,
} from "../controllers/voucherController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.post("/", authenticateToken, createVoucher);
router.get("/", authenticateToken, getMyVouchers);
router.delete("/:id", authenticateToken, deleteVoucher);

export default router;
