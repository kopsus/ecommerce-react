import { Request, Response } from "express";
import { prisma } from "../db";
import { snap } from "../utils/midtrans";
import { AuthRequest } from "../middleware/authMiddleware";

export const checkout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { user } = req; // Kita butuh data user (nama/email) untuk dikirim ke Midtrans

    // 1. Ambil Keranjang
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ message: "Keranjang kosong" });
      return;
    }

    // 2. Hitung Total
    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    // 3. Simpan Order ke Database (Status PENDING)
    // Kita butuh ID Order ini untuk dikirim ke Midtrans
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: totalAmount,
          status: "PENDING",
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      });

      // Kurangi Stok & Hapus Keranjang
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }
      await tx.cartItem.deleteMany({ where: { userId } });

      return newOrder;
    });

    // 4. MINTA TOKEN KE MIDTRANS (Langkah Baru)
    const parameter = {
      transaction_details: {
        order_id: order.id.toString(), // ID Order harus String
        gross_amount: order.totalAmount,
      },
      customer_details: {
        first_name: user?.name,
        email: user?.email,
      },
    };

    const token = await snap.createTransaction(parameter);

    // 5. Kirim Token ke Frontend
    res.status(201).json({
      message: "Order dibuat, silakan bayar",
      orderId: order.id,
      total: order.totalAmount,
      midtransToken: token.token, // <--- Ini "Kunci" buat popup pembayaran
      redirectUrl: token.redirect_url,
    });
  } catch (error) {
    console.error("Midtrans Error:", error);
    res.status(500).json({ message: "Gagal memproses checkout", error });
  }
};

export const midtransNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // 1. Ambil data dari body (pastikan nama variabelnya sesuai)
    const { order_id, transaction_status, fraud_status } = req.body;

    console.log(
      `Notifikasi masuk untuk Order ID: ${order_id}, Status: ${transaction_status}`
    );

    // 2. Siapkan variabel status untuk database
    let orderStatus = "PENDING";

    // 3. Logika status (Gunakan 'transaction_status' di sini)
    if (transaction_status == "capture") {
      if (fraud_status == "challenge") {
        // orderStatus = 'CHALLENGE';
      } else if (fraud_status == "accept") {
        orderStatus = "PAID";
      }
    } else if (transaction_status == "settlement") {
      orderStatus = "PAID";
    } else if (
      transaction_status == "cancel" ||
      transaction_status == "deny" || // Perbaikan disini
      transaction_status == "expire"
    ) {
      // Perbaikan disini
      orderStatus = "CANCELLED";
    }

    // 4. Update database
    if (orderStatus === "PAID" || orderStatus === "CANCELLED") {
      await prisma.order.updateMany({
        where: { id: Number(order_id) },
        data: { status: orderStatus as any },
      });
      console.log(`Order ${order_id} berhasil diupdate ke ${orderStatus}`);
    }

    res.status(200).send("OK");
  } catch (error) {
    console.error("Midtrans Notification Error:", error);
    res.status(500).send("Error processing notification");
  }
};

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
