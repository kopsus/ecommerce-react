import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";
import productRoutes from "./routes/productRoutes";
import cartRoutes from "./routes/cartRoutes";
import orderRoutes from "./routes/orderRoutes";
import path from "path";
import reviewRoutes from "./routes/reviewRoutes";
import voucherRoutes from "./routes/voucherRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import analyticsRoutes from "./routes/analyticsRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("API E-Commerce Ready with TypeScript! 🚀");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/vouchers", voucherRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/analytics", analyticsRoutes);

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
