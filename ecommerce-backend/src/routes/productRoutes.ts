import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/authMiddleware";
import { upload } from "../utils/upload";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", authenticateToken, upload.single("image"), createProduct);
router.put("/:id", authenticateToken, upload.single("image"), updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

export default router;
