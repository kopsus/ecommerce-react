import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  updateProduct,
} from "../controllers/productController";
import { authenticateToken } from "../middleware/authMiddleware";
import { upload } from "../utils/upload";

const router = Router();

router.get("/", getAllProducts);
router.post("/", authenticateToken, upload.single("image"), createProduct);
router.put("/:id", authenticateToken, updateProduct);
router.delete("/:id", authenticateToken, deleteProduct);

export default router;
