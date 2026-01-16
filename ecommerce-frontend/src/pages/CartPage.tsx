import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import type { CartItem } from "../types";
import { UseCart } from "../context/CartContext";

const CartPage = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = UseCart();
  const navigate = useNavigate();

  // Ambil data keranjang saat halaman dibuka
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCartItems(response.data);
    } catch (error) {
      console.error("Gagal ambil keranjang", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (
    id: number,
    currentQty: number,
    change: number
  ) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; // Minimal 1

    try {
      // Panggil endpoint PUT yang baru kita buat di backend
      await api.put(`/cart/${id}`, { quantity: newQty });

      // Update UI Frontend secara manual biar cepat (Optimistic UI)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item
        )
      );

      refreshCart(); // Update angka di navbar
    } catch {
      toast.error("Gagal update jumlah");
    }
  };

  const handleRemove = async (id: number) => {
    try {
      await api.delete(`/cart/${id}`);
      setCartItems((prev) => prev.filter((item) => item.id !== id));
      refreshCart(); // Update navbar
      toast.success("Item dihapus");
    } catch {
      toast.error("Gagal menghapus item");
    }
  };

  // Update Quantity (Logic UI saja, backend update quantity belum kita buat spesifik endpointnya,
  // biasanya add to cart lagi dgn quantity berbeda.
  // TAPI untuk simplifikasi sekarang: Kita hapus item lalu add ulang, atau biarkan statis dulu).
  // *CATATAN*: Agar tutorial tidak terlalu panjang, kita skip fitur update quantity +/- di halaman cart dulu.
  // User harus hapus dan add lagi dari depan. (Next improvement).

  // Hitung Total Harga
  const totalPrice = cartItems.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const handleCheckout = () => {
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <ShoppingBag className="h-8 w-8 text-blue-600" /> Keranjang Belanja
        </h1>

        {loading ? (
          <p className="text-center py-10">Memuat keranjang...</p>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg mb-4">
              Keranjang kamu kosong 😔
            </p>
            <Link
              to="/"
              className="text-blue-600 font-semibold hover:underline"
            >
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* List Barang (Kiri) */}
            <div className="grow">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 border-b border-gray-100 last:border-0 flex items-center gap-6"
                  >
                    {/* Gambar Kecil */}
                    <img
                      src={
                        item.product.image
                          ? `${IMAGE_URL}${item.product.image}`
                          : "https://via.placeholder.com/100"
                      }
                      alt={item.product.name}
                      className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    />

                    {/* Info */}
                    <div className="grow">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {item.product.name}
                      </h3>
                      <p className="text-blue-600 font-bold">
                        {formatRupiah(item.product.price)}
                      </p>

                      {/* Kontrol Quantity */}
                      <div className="flex items-center mt-2 gap-3">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity, -1)
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="font-medium w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity, 1)
                          }
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Tombol Hapus */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Ringkasan Belanja (Kanan) */}
            <div className="lg:w-1/3">
              <div className="bg-white p-6 rounded-xl shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Ringkasan Belanja
                </h3>

                <div className="flex justify-between mb-2 text-gray-600">
                  <span>Total Item</span>
                  <span>{cartItems.length} barang</span>
                </div>

                <div className="border-t border-gray-200 my-4 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-800">
                    Total Harga
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg mt-4"
                >
                  Checkout Sekarang
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CartPage;
