import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { formatRupiah, IMAGE_URL } from "../utils/format";
import { Star, ShoppingCart, Minus, Plus, ArrowLeft } from "lucide-react";
import { UseCart } from "../context/CartContext";
import toast from "react-hot-toast";
import type { Product } from "../types";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { refreshCart } = UseCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const productRes = await api.get(`/products/${id}`);
        setProduct(productRes.data);

        const reviewRes = await api.get(`/reviews/${id}`);
        setReviews(reviewRes.data);
      } catch (error) {
        console.error("Gagal load detail", error);
        toast.error("Produk tidak ditemukan");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductAndReviews();
    }
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!product) return;
    setAdding(true);
    try {
      await api.post("/cart", { productId: product.id, quantity: qty });
      refreshCart();
      toast.success("Masuk keranjang!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className="text-center py-20">Memuat produk...</div>;
  if (!product) return null;

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length
        ).toFixed(1)
      : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-1" /> Kembali
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-1/2 bg-gray-100 h-100 md:h-125 flex items-center justify-center relative">
              <img
                src={
                  product.image
                    ? `${IMAGE_URL}${product.image}`
                    : "https://via.placeholder.com/500"
                }
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="w-full md:w-1/2 p-8 flex flex-col">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <span className="font-bold text-gray-700">{averageRating}</span>
                <span className="text-gray-400 text-sm">
                  ({reviews.length} Ulasan)
                </span>
              </div>

              <div className="text-3xl font-bold text-blue-600 mb-6">
                {formatRupiah(product.price)}
              </div>

              <div className="prose text-gray-600 mb-8 grow">
                <p>{product.description}</p>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-gray-700 font-medium">Jumlah:</span>
                  <div className="flex items-center border rounded-lg">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="p-2 hover:bg-gray-100"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 font-bold">{qty}</span>
                    <button
                      onClick={() =>
                        setQty((q) => Math.min(product.stock, q + 1))
                      }
                      className="p-2 hover:bg-gray-100"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-500">
                    Stok: {product.stock}
                  </span>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition disabled:bg-gray-300"
                >
                  <ShoppingCart className="w-5 h-5" />
                  {product.stock === 0
                    ? "Stok Habis"
                    : adding
                    ? "Menambahkan..."
                    : "Tambah ke Keranjang"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-400 fill-current" /> Ulasan
            Pembeli
          </h2>

          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">
              Belum ada ulasan untuk produk ini.
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-500 text-xs">
                        {review.user.name.charAt(0)}
                      </div>
                      <span className="font-semibold text-gray-800">
                        {review.user.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex text-yellow-400 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating ? "fill-current" : "text-gray-200"
                        }`}
                      />
                    ))}
                  </div>

                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
