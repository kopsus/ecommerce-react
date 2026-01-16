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
    const { user } = req;
    const { voucherCode } = req.body;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      res.status(400).json({ message: "Keranjang kosong" });
      return;
    }

    const totalAmount = cartItems.reduce((total, item) => {
      return total + item.product.price * item.quantity;
    }, 0);

    let discountAmount = 0;
    let validVoucherId = null;

    if (voucherCode) {
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode },
      });

      if (!voucher) {
        res.status(404).json({ message: "Voucher tidak ditemukan" });
        return;
      }

      if (new Date() > voucher.expiresAt) {
        res.status(400).json({ message: "Voucher sudah kadaluarsa" });
        return;
      }

      if (voucher.minPurchase && totalAmount < voucher.minPurchase) {
        res.status(400).json({
          message: `Minimal belanja ${voucher.minPurchase} untuk pakai voucher ini`,
        });
        return;
      }

      if (voucher.type === "FIXED") {
        discountAmount = voucher.amount;
      } else if (voucher.type === "PERCENT") {
        discountAmount = (totalAmount * voucher.amount) / 100;
      }

      validVoucherId = voucher.id;
    }

    const finalAmount = Math.max(totalAmount - discountAmount, 0);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          totalAmount: finalAmount,
          voucherId: validVoucherId,
          discountAmount: discountAmount,
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
      message: "Order dibuat",
      orderId: order.id,
      totalBeforeDiscount: totalAmount,
      discount: discountAmount,
      finalTotal: order.totalAmount,
      midtransToken: token.token,
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
    const { order_id, transaction_status, fraud_status } = req.body;

    console.log(
      `Notifikasi masuk untuk Order ID: ${order_id}, Status: ${transaction_status}`
    );

    let orderStatus = "PENDING";

    if (transaction_status == "capture") {
      if (fraud_status == "challenge") {
      } else if (fraud_status == "accept") {
        orderStatus = "PAID";
      }
    } else if (transaction_status == "settlement") {
      orderStatus = "PAID";
    } else if (
      transaction_status == "cancel" ||
      transaction_status == "deny" ||
      transaction_status == "expire"
    ) {
      orderStatus = "CANCELLED";
    }

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
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data pesanan", error });
  }
};

export const getSellerOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.user?.userId;

    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { sellerId: sellerId },
          },
        },
        status: { not: "PENDING" },
      },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          where: { product: { sellerId: sellerId } },
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Gagal ambil pesanan seller", error });
  }
};

export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validasi status yang dibolehkan
    const allowedStatus = ["SHIPPED", "COMPLETED", "CANCELLED"];
    if (!allowedStatus.includes(status)) {
      res.status(400).json({ message: "Status tidak valid" });
      return;
    }

    await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status as any },
    });

    res.status(200).json({ message: `Status order diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Gagal update status", error });
  }
};
