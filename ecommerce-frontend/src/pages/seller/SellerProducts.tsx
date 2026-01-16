import React, { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import { formatRupiah, IMAGE_URL } from "../../utils/format";
import {
  Plus,
  Trash2,
  Image as ImageIcon,
  X,
  Loader2,
  Edit,
} from "lucide-react";
import toast from "react-hot-toast";
import { UseAuth } from "../../context/AuthContext";
import type { Product } from "../../types";

const SellerProducts = () => {
  const { user } = UseAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setName(product.name);
    setPrice(product.price.toString());
    setStock(product.stock.toString());
    setDescription(product.description);
    setImageFile(null);
    setShowModal(true);
  };

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchMyProducts = useCallback(async () => {
    try {
      const response = await api.get("/products");
      const myProducts = response.data.filter(
        (p: Product) => p.sellerId === user?.id
      );
      setProducts(myProducts);
    } catch (error) {
      console.error("Gagal load produk", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    }
  }, [fetchMyProducts, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !stock) {
      toast.error("Mohon lengkapi data wajib");
      return;
    }

    setSubmitLoading(true);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      if (editingId) {
        await api.put(`/products/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Produk berhasil diupdate!");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Produk berhasil ditambahkan!");
      }

      setShowModal(false);
      resetForm();
      fetchMyProducts();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal simpan produk");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus produk ini?")) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Produk dihapus");
    } catch {
      toast.error("Gagal menghapus produk");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDescription("");
    setPrice("");
    setStock("");
    setImageFile(null);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produk Saya</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-5 h-5" /> Tambah Produk
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">Memuat produk...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            Belum ada produk. Silakan tambah produk baru.
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold text-sm">
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">Harga</th>
                <th className="p-4 text-center">Stok</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-4">
                    <img
                      src={
                        product.image
                          ? `${IMAGE_URL}${product.image}`
                          : "https://via.placeholder.com/50"
                      }
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover bg-gray-100 border"
                    />
                    <span className="font-medium text-gray-800">
                      {product.name}
                    </span>
                  </td>
                  <td className="p-4 text-blue-600 font-medium">
                    {formatRupiah(product.price)}
                  </td>
                  <td className="p-4 text-center text-gray-600">
                    {product.stock}
                  </td>
                  <td className="p-4 text-center flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
                      title="Edit"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold text-gray-800">
                {editingId ? "Edit Produk" : "Tambah Produk Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setImageFile(e.target.files[0])
                  }
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {imageFile ? (
                  <p className="text-green-600 font-medium flex items-center justify-center gap-2">
                    <ImageIcon className="w-5 h-5" /> {imageFile.name}
                  </p>
                ) : (
                  <div className="text-gray-500">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">Klik untuk upload gambar</p>
                    <p className="text-xs text-gray-400 mt-1">
                      PNG, JPG, JPEG (Max 5MB)
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Produk
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Contoh: Sepatu Sneakers"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Harga (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="150000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stok
                  </label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="Jelaskan detail produk..."
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition mt-4 flex justify-center items-center gap-2"
              >
                {submitLoading ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : editingId ? (
                  "Simpan Perubahan"
                ) : (
                  "Simpan Produk"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerProducts;
