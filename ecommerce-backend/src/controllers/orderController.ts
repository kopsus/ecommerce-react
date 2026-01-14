import { Response } from "express";
import { prisma } from "../db";
import { AuthRequest } from "../middleware/authMiddleware";

export const checkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;

    // 1. Ambil semua item di keranjang user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }, // Kita butuh harga produk
    });

    if (cartItems.length === 0) {
      res.status(400).json({ message: "Keranjang belanja kosong" });
      return;
    }

    // 2. Hitung Total Harga
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // 3. MULAI TRANSAKSI DATABASE
    // Kita gunakan $transaction agar semua proses ini dianggap satu paket.
    const order = await prisma.$transaction(async (tx) => {
      // a. Buat Order Baru
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: "PENDING",
          // Kita langsung masukkan item-nya di sini
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price, // Simpan harga saat ini
            })),
          },
        },
        include: { items: true },
      });

      // b. Kurangi Stok Produk (Opsional - tapi bagus untuk inventory)
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // c. Kosongkan Keranjang User
      await tx.cartItem.deleteMany({
        where: { userId },
      });

      return newOrder;
    });

    res.status(201).json({ message: "Pesanan berhasil dibuat", order });
  } catch (error) {
    console.error(error); // Bantu debugging kalau ada error
    res.status(500).json({ message: "Gagal memproses pesanan", error });
  }
};

// --- History Pesanan ---
export const getMyOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const orders = await prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: true } } }, // Include sampai detail produk
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pesanan", error });
  }
};
