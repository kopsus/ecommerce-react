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
    const { user } = req; // Kita butuh data user (nama/email) untuk dikirim ke
    const { voucherCode } = req.body;

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

    let discountAmount = 0;
    let validVoucherId = null;

    if (voucherCode) {
      // Cari vouchernya
      const voucher = await prisma.voucher.findUnique({
        where: { code: voucherCode },
      });

      // Validasi Voucher
      if (!voucher) {
        res.status(404).json({ message: "Voucher tidak ditemukan" });
        return;
      }

      // Cek Kadaluarsa
      if (new Date() > voucher.expiresAt) {
        res.status(400).json({ message: "Voucher sudah kadaluarsa" });
        return;
      }

      // Cek Minimal Belanja
      if (voucher.minPurchase && totalAmount < voucher.minPurchase) {
        res.status(400).json({
          message: `Minimal belanja ${voucher.minPurchase} untuk pakai voucher ini`,
        });
        return;
      }

      // Hitung Potongan
      if (voucher.type === "FIXED") {
        discountAmount = voucher.amount;
      } else if (voucher.type === "PERCENT") {
        discountAmount = (totalAmount * voucher.amount) / 100;
      }

      // Set Voucher ID untuk disimpan nanti
      validVoucherId = voucher.id;
    }

    const finalAmount = Math.max(totalAmount - discountAmount, 0);

    // 3. Simpan Order ke Database (Status PENDING)
    // Kita butuh ID Order ini untuk dikirim ke Midtrans
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

export const getSellerOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const sellerId = req.user?.userId;

    // Cari Order yang MEMILIKI item dari seller ini
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            product: { sellerId: sellerId },
          },
        },
        // Opsional: Kita sembunyikan order yang masih PENDING (belum bayar) agar tidak menuh-menuhin
        status: { not: "PENDING" },
      },
      include: {
        user: { select: { name: true, email: true } }, // Data Pembeli
        items: {
          where: { product: { sellerId: sellerId } }, // Hanya ambil item milik seller ini
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
    const { id } = req.params; // Order ID
    const { status } = req.body; // Status Baru (SHIPPED, COMPLETED, CANCELLED)

    // Validasi status yang dibolehkan
    const allowedStatus = ["SHIPPED", "COMPLETED", "CANCELLED"];
    if (!allowedStatus.includes(status)) {
      res.status(400).json({ message: "Status tidak valid" });
      return;
    }

    // Cek apakah order ada & seller berhak (Logic sederhana: kalau seller punya barang di order itu, boleh update)
    // Note: Untuk sistem multi-vendor yang kompleks, status biasanya per-item, bukan per-order.
    // Tapi untuk tutorial ini, kita anggap status Order mewakili pengiriman paket.

    await prisma.order.update({
      where: { id: Number(id) },
      data: { status: status as any },
    });

    res.status(200).json({ message: `Status order diubah menjadi ${status}` });
  } catch (error) {
    res.status(500).json({ message: "Gagal update status", error });
  }
};
