import { useEffect, useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UseCart } from "../context/CartContext";
import { UseWishlist } from "../context/WishlistContext";

// Kita definisikan tipe data khusus untuk respon wishlist
interface WishlistItem {
  id: number;
  productId: number;
  product: {
    id: number;
    name: string;
    price: number;
    image: string | null;
    stock: number;
    description: string;
  };
}

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { refreshCart } = UseCart();
  const { refreshWishlist } = UseWishlist();

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data);
    } catch (error) {
      console.error("Gagal ambil wishlist", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      // Update UI: Hapus item yang ID produknya cocok
      setWishlist((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      refreshWishlist();
      toast.success("Dihapus dari wishlist");
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await api.post("/cart", { productId: product.id, quantity: 1 });
      toast.success("Masuk keranjang! 🛒");
      refreshCart();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal add to cart");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
          <Heart className="h-7 w-7 text-red-500 fill-current" /> Wishlist Saya
        </h1>

        {loading ? (
          <p className="text-center py-10">Memuat wishlist...</p>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
            <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-lg mb-4">
              Wishlist kamu masih kosong
            </p>
            <Link to="/" className="text-blue-600 hover:underline font-medium">
              Cari barang impian yuk!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {wishlist.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group"
              >
                {/* Gambar */}
                <div className="h-48 relative overflow-hidden bg-gray-100">
                  <img
                    src={
                      item.product.image
                        ? `${IMAGE_URL}${item.product.image}`
                        : "https://via.placeholder.com/300"
                    }
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Tombol Hapus Absolute */}
                  <button
                    onClick={() => handleRemove(item.product.id)}
                    className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition shadow-sm backdrop-blur-sm"
                    title="Hapus dari wishlist"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Info */}
                <div className="p-4 flex flex-col grow">
                  <h3 className="font-semibold text-gray-800 line-clamp-1 mb-1">
                    {item.product.name}
                  </h3>
                  <p className="text-blue-600 font-bold mb-4">
                    {formatRupiah(item.product.price)}
                  </p>

                  <button
                    onClick={() => handleAddToCart(item.product)}
                    className="mt-auto w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2 transition text-sm font-medium"
                  >
                    <ShoppingCart className="h-4 w-4" /> + Keranjang
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
