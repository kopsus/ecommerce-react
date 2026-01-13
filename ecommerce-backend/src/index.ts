import dotenv from "dotenv";
import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("API E-Commerce Ready with TypeScript! 🚀");
});

// Routes
app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
