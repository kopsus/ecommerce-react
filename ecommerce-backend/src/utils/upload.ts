import multer from "multer";
import path from "path";

// Konfigurasi tempat penyimpanan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Simpan di folder 'uploads' yang ada di root project
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    // Beri nama unik agar tidak bentrok (timestamp + nama asli)
    // Contoh: 173829102-sepatu.jpg
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Filter: Hanya terima gambar
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Hanya file gambar yang diperbolehkan!"), false);
  }
};

export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Batas ukuran 5MB
});
