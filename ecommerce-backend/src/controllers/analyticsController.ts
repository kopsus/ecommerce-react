import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

export const getAdminStats = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "ADMIN") {
      res.status(403).json({ message: "Akses ditolak" });
      return;
    }

    const totalUsers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });
    const pendingVendors = await prisma.user.count({
      where: { vendorStatus: "PENDING" },
    });

    const totalOrders = await prisma.order.count({ where: { status: "PAID" } });

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

    const soldItems = await prisma.orderItem.findMany({
      where: {
        product: { sellerId: sellerId },
        order: { status: "PAID" },
      },
      include: {
        product: true,
        order: true,
      },
    });

    let totalRevenue = 0;
    let totalSoldItems = 0;

    const productSales: Record<string, number> = {};

    soldItems.forEach((item) => {
      const revenue = item.price * item.quantity;
      totalRevenue += revenue;
      totalSoldItems += item.quantity;

      const prodName = item.product.name;
      if (productSales[prodName]) {
        productSales[prodName] += item.quantity;
      } else {
        productSales[prodName] = item.quantity;
      }
    });

    const topProducts = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    res.status(200).json({
      totalRevenue,
      totalSoldItems,
      totalOrders: soldItems.length,
      topProducts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error seller stats", error });
  }
};
