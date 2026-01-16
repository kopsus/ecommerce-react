import toast from "react-hot-toast";
import type { Product } from "../types";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import { ShoppingCart, Heart, Loader2 } from "lucide-react";
import api from "../services/api";
import { useState } from "react";
import { UseAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { UseCart } from "../context/CartContext";
import { UseWishlist } from "../context/WishlistContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { user } = UseAuth();
  const navigate = useNavigate();
  const { refreshCart } = UseCart();
  const { refreshWishlist } = UseWishlist();

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Silakan login untuk belanja");
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      await api.post("/cart", {
        productId: product.id,
        quantity: 1,
      });
      toast.success("Masuk keranjang!");
      refreshCart();
    } catch (error: any) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Gagal menambah ke keranjang"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error("Login dulu untuk wishlist");
      return;
    }

    try {
      await api.post("/wishlist", { productId: product.id });
      toast.success("Disimpan ke Wishlist ❤");
      refreshWishlist();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      if (msg === "Produk sudah ada di wishlist") {
        toast("Produk sudah ada di wishlist", { icon: "ℹ️" });
      } else {
        toast.error("Gagal menambah wishlist");
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-300 border border-gray-100 overflow-hidden flex flex-col h-full">
      <Link to={`/product/${product.id}`}>
        <div className="h-48 w-full bg-gray-100 relative overflow-hidden group">
          <img
            src={
              product.image
                ? `${IMAGE_URL}${product.image}`
                : "https://via.placeholder.com/300"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
          />
          <button
            onClick={handleAddToWishlist}
            className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0 text-gray-400 hover:text-red-500"
          >
            <Heart className="h-5 w-5" />
          </button>
        </div>
      </Link>

      <div className="p-4 flex flex-col grow">
        <div className="grow">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-1">
              {product.name}
            </h3>
          </Link>
          <p className="text-gray-500 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <div>
            <span className="text-blue-600 font-bold text-lg block">
              {formatRupiah(product.price)}
            </span>
            <span className="text-xs text-gray-400">Stok: {product.stock}</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={loading || product.stock <= 0}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition shadow-md flex items-center gap-2 disabled:bg-gray-400"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShoppingCart className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
