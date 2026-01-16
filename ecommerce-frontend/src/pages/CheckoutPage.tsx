import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import { CreditCard, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { UseCart } from "../context/CartContext";
import type { CartItem } from "../types";

const CheckoutPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [voucherCode, setVoucherCode] = useState("");

  const [subtotal, setSubtotal] = useState(0);

  const navigate = useNavigate();
  const { refreshCart } = UseCart();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      const items = response.data;
      setCartItems(items);

      const total = items.reduce(
        (acc: number, item: any) => acc + item.product.price * item.quantity,
        0
      );
      setSubtotal(total);
    } catch (error) {
      console.error("Gagal load cart", error);
    }
  };

  const handlePay = async () => {
    setLoading(true);
    try {
      // 1. Buat Order di Backend
      const response = await api.post("/orders", {
        voucherCode: voucherCode || undefined, // Kirim kode voucher jika ada
      });

      const { midtransToken } = response.data;

      // 2. Munculkan Popup Midtrans
      if (window.snap) {
        window.snap.pay(midtransToken, {
          onSuccess: async function (result: any) {
            try {
              await api.post("/orders/notification", {
                order_id: result.order_id,
                transaction_status: "settlement", // Kata kunci Midtrans untuk "Lunas"
                fraud_status: "accept",
              });

              toast.success("Pembayaran Berhasil & Terverifikasi! 🎉");
              refreshCart(); // Reset keranjang
              navigate("/profile"); // Arahkan ke halaman Profile/History
            } catch (error) {
              console.error("Gagal update status otomatis:", error);
              toast.success(
                "Pembayaran berhasil, tapi status sedang diproses sistem."
              );
              navigate("/profile");
            }
          },
          onPending: function () {
            toast("Menunggu pembayaran...", { icon: "⏳" });
            refreshCart();
            navigate("/orders");
          },
          onError: function (result) {
            toast.error("Pembayaran Gagal");
            console.error(result);
          },
          onClose: function () {
            toast("Pembayaran belum diselesaikan");
          },
        });
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Gagal memproses checkout";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Review Pesanan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* List Barang */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h2 className="font-semibold mb-4">Barang yang dibeli</h2>
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 mb-4 pb-4 border-b last:border-0 last:pb-0 last:mb-0"
                >
                  <img
                    src={
                      item.product.image
                        ? `${IMAGE_URL}${item.product.image}`
                        : "https://via.placeholder.com/100"
                    }
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded bg-gray-100"
                  />
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.quantity} x {formatRupiah(item.product.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ringkasan & Bayar */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
              <h2 className="font-semibold mb-4">Ringkasan Pembayaran</h2>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
                {/* Kalau mau hitung diskon real-time butuh API cek voucher, 
                    disini kita simpelkan dulu transaksinya */}
                <div className="flex justify-between font-bold text-gray-900 pt-2 border-t">
                  <span>Total Tagihan</span>
                  <span>{formatRupiah(subtotal)}</span>
                </div>
              </div>

              {/* Input Voucher */}
              <div className="mb-6">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Kode Voucher
                </label>
                <div className="flex gap-2 mt-1">
                  <div className="relative grow">
                    <Tag className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Masukan Kode"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  *Diskon akan dihitung otomatis saat checkout
                </p>
              </div>

              <button
                onClick={handlePay}
                disabled={loading || cartItems.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg flex justify-center items-center gap-2"
              >
                {loading ? (
                  "Memproses..."
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" /> Bayar Sekarang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
