import { Router } from "express";
import {
  createProduct,
  getAllProducts,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getAllProducts);

router.post("/", authenticateToken, createProduct);

export default router;
