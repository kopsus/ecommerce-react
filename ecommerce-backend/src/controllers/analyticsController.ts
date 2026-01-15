import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

// --- DASHBOARD ADMIN (Global Stats) ---
export const getAdminStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({ message: "Akses ditolak" });
      return;
    }

    // 1. Total User & Seller
    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });
    const pendingVendors = await prisma.user.count({
      where: { vendorStatus: "PENDING" },
    });

    // 2. Total Pesanan (Yang sudah lunas)
    const totalOrders = await prisma.order.count({ where: { status: "PAID" } });

    // 3. Total Pendapatan Aplikasi (Semua uang masuk)
    const revenueAgg = await prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { status: "PAID" },
    });
    const totalRevenue = revenueAgg._sum.totalAmount || 0;

    res.status(200).json({
      totalUsers,
      totalSellers,
      pendingVendors,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    res.status(500).json({ message: "Error admin stats", error });
  }
};

// --- DASHBOARD SELLER (Toko Sendiri) ---
export const getSellerStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.user?.userId;

    if (req.user?.role !== "SELLER") {
      res.status(403).json({ message: "Hanya untuk penjual" });
      return;
    }

    // 1. Ambil semua item yang terjual dari toko ini (Status Order harus PAID)
    const soldItems = await prisma.orderItem.findMany({
      where: {
        product: { sellerId: sellerId }, // Produk milik seller ini
        order: { status: "PAID" }, // Order sudah dibayar
      },
      include: {
        product: true,
        order: true,
      },
    });

    // 2. Hitung Total Pendapatan & Jumlah Terjual
    let totalRevenue = 0;
    let totalSoldItems = 0;

    // Kita juga mau hitung produk mana yang paling laku (Top Products)
    const productSales: Record<string, number> = {};

    soldItems.forEach((item) => {
      const revenue = item.price * item.quantity; // Harga saat beli * jumlah
      totalRevenue += revenue;
      totalSoldItems += item.quantity;

      // Hitung per produk untuk Top Product
      const prodName = item.product.name;
      if (productSales[prodName]) {
        productSales[prodName] += item.quantity;
      } else {
        productSales[prodName] = item.quantity;
      }
    });

    // 3. Format Data untuk Grafik (Top 5 Produk Terlaris)
    // Mengubah object { "Sepatu": 10, "Baju": 5 } menjadi array [{name: "Sepatu", value: 10}, ...]
    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales) // Urutkan dari yg terbesar
      .slice(0, 5); // Ambil 5 teratas

    res.status(200).json({
      totalRevenue,
      totalSoldItems,
      totalOrders: soldItems.length, // Sebenarnya ini jumlah baris item, bukan jumlah nota order, tapi cukup untuk gambaran
      topProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error seller stats", error });
  }
};
