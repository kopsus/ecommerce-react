import express from "express";
import {
  register,
  login,
  getProfile,
  verifyVendor,
  getPendingVendors,
  applyAsSeller,
  getAllUsers,
} from "../controllers/authController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authenticateToken, getProfile);

router.post("/apply-seller", authenticateToken, applyAsSeller);
router.get("/pending-vendors", authenticateToken, getPendingVendors);
router.patch("/verify-vendor/:id", authenticateToken, verifyVendor);
router.get("/users", authenticateToken, getAllUsers);

export default router;
