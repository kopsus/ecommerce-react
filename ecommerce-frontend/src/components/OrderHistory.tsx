import { useEffect, useState } from "react";
import api from "../services/api";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import {
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  PackageOpen,
  Star,
  Send,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "../types";
import { toast } from "react-hot-toast";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);

  const openReviewModal = (item: any) => {
    setSelectedItem(item);
    setRating(5);
    setComment("");
    setShowReviewModal(true);
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    setSubmitLoading(true);

    try {
      await api.post("/reviews", {
        productId: selectedItem.productId,
        rating,
        comment,
      });
      toast.success("Terima kasih atas ulasannya!");
      setShowReviewModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal kirim review");
    } finally {
      setSubmitLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/orders");
        setOrders(response.data);
      } catch (error) {
        console.error("Gagal ambil order", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-bold">
            <Clock className="w-3 h-3" /> Menunggu Bayar
          </span>
        );
      case "PAID":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            <CheckCircle className="w-3 h-3" /> Dibayar
          </span>
        );
      case "SHIPPED":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
            <Truck className="w-3 h-3" /> Dikirim
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            <CheckCircle className="w-3 h-3" /> Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-bold">
            <XCircle className="w-3 h-3" /> Batal
          </span>
        );
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="text-center py-10">
        <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );

  if (orders.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
        <PackageOpen className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Belum ada riwayat pesanan</p>
        <Link
          to="/"
          className="text-blue-600 hover:underline text-sm mt-2 block"
        >
          Mulai Belanja
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <div
          key={order.id}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition"
        >
          <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-200">
            <div>
              <p className="text-xs text-gray-500 font-bold">#{order.id}</p>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString("id-ID")}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
          <div className="p-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 mb-3 last:mb-0">
                <img
                  src={
                    item.product.image
                      ? `${IMAGE_URL}${item.product.image}`
                      : "https://via.placeholder.com/80"
                  }
                  alt={item.product.name}
                  className="w-12 h-12 object-cover rounded bg-gray-100"
                />
                <div className="grow">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} x {formatRupiah(item.price)}
                  </p>
                </div>
                {order.status === "COMPLETED" && (
                  <button
                    onClick={() => openReviewModal(item)}
                    className="text-sm bg-yellow-50 text-yellow-600 px-3 py-1.5 rounded-lg hover:bg-yellow-100 font-medium flex items-center gap-1 transition"
                  >
                    <Star className="w-4 h-4" /> Beri Ulasan
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-lg font-bold text-blue-600">
              {formatRupiah(order.totalAmount)}
            </span>
          </div>
        </div>
      ))}

      {showReviewModal && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                Ulas {selectedItem.product.name}
              </h3>
              <button onClick={() => setShowReviewModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <form onSubmit={submitReview} className="p-6">
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition-all transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 fill-none"
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Komentar Anda
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Barangnya bagus, pengiriman cepat..."
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex justify-center items-center gap-2"
              >
                {submitLoading ? "Mengirim..." : "Kirim Ulasan"}{" "}
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
