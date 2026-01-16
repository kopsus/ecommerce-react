import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatRupiah, IMAGE_URL } from "../../utils/format";
import { Package, Truck, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const SellerOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders/seller");
      setOrders(response.data);
    } catch (error) {
      console.error("Gagal load order seller", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    if (!confirm(`Ubah status pesanan menjadi ${newStatus}?`)) return;

    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Status berhasil diubah ke ${newStatus}`);
      fetchOrders(); // Refresh data
    } catch {
      toast.error("Gagal update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Siap Dikirim
          </span>
        );
      case "SHIPPED":
        return (
          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Truck className="w-3 h-3" /> Sedang Dikirim
          </span>
        );
      case "COMPLETED":
        return (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Selesai
          </span>
        );
      case "CANCELLED":
        return (
          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3 h-3" /> Batal
          </span>
        );
      default:
        return status;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pesanan Masuk</h1>

      <div className="space-y-6">
        {loading ? (
          <p className="text-center">Memuat pesanan...</p>
        ) : orders.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-sm">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada pesanan masuk.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
            >
              {/* Header Order */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b">
                <div>
                  <p className="text-sm font-bold text-gray-800">
                    Order #{order.id} - {order.user.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} •{" "}
                    {order.user.email}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(order.status)}

                  {/* TOMBOL AKSI SELLER */}
                  {order.status === "PAID" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "SHIPPED")}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition cursor-pointer"
                    >
                      Kirim Paket
                    </button>
                  )}
                  {order.status === "SHIPPED" && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, "COMPLETED")}
                      className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg transition"
                    >
                      Tandai Selesai
                    </button>
                  )}
                </div>
              </div>

              {/* List Item */}
              <div className="p-6">
                {order.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 mb-4 last:mb-0 items-center"
                  >
                    <img
                      src={
                        item.product.image
                          ? `${IMAGE_URL}${item.product.image}`
                          : "https://via.placeholder.com/50"
                      }
                      className="w-12 h-12 rounded object-cover bg-gray-100"
                    />
                    <div className="grow">
                      <p className="font-semibold text-gray-800">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.quantity} x {formatRupiah(item.price)}
                      </p>
                    </div>
                    <p className="font-bold text-gray-800">
                      {formatRupiah(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SellerOrders;
