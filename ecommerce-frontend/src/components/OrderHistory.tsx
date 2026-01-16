import { useEffect, useState } from "react";
import api from "../services/api";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import { Clock, CheckCircle, XCircle, Truck, PackageOpen } from "lucide-react";
import { Link } from "react-router-dom";
import type { Order } from "../types";

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
};

export default OrderHistory;
