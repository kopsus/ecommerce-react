import React, { useEffect, useState } from "react";
import api from "../../services/api";
import { formatRupiah } from "../../utils/format";
import {
  Ticket,
  Plus,
  Trash2,
  X,
  Loader2,
  Calendar,
  DollarSign,
} from "lucide-react";
import toast from "react-hot-toast";

const SellerVouchers = () => {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modal & Form
  const [showModal, setShowModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form Inputs Sesuai Schema Kamu
  const [code, setCode] = useState("");
  const [type, setType] = useState("FIXED"); // FIXED atau PERCENT
  const [amount, setAmount] = useState("");
  const [minPurchase, setMinPurchase] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const response = await api.get("/vouchers"); // Sesuaikan path
      setVouchers(response.data);
    } catch (error) {
      console.error("Gagal load voucher", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      // Kirim data sesuai schema backend kamu
      await api.post("/vouchers", {
        code,
        type,
        amount: Number(amount),
        minPurchase: Number(minPurchase),
        expiresAt, // Format string YYYY-MM-DD dari input date sudah oke
      });

      toast.success("Voucher berhasil dibuat!");
      setShowModal(false);
      resetForm();
      fetchVouchers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal buat voucher");
    } finally {
      setSubmitLoading(false);
    }
  };

  const resetForm = () => {
    setCode("");
    setType("FIXED");
    setAmount("");
    setMinPurchase("");
    setExpiresAt("");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Hapus voucher ini?")) return;
    try {
      await api.delete(`/vouchers/${id}`);
      setVouchers((prev) => prev.filter((v) => v.id !== id));
      toast.success("Voucher dihapus");
    } catch {
      toast.error("Gagal hapus voucher");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Voucher</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-5 h-5" /> Buat Voucher
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Memuat...</p>
        ) : (
          vouchers.map((voucher) => (
            <div
              key={voucher.id}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group overflow-hidden hover:shadow-md transition"
            >
              <div className="absolute -right-6 -top-6 bg-blue-50 w-24 h-24 rounded-full z-0"></div>
              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                      {voucher.type === "PERCENT"
                        ? "Diskon Persen"
                        : "Potongan Harga"}
                    </p>
                    <h3 className="text-xl font-bold text-blue-600 font-mono tracking-wide">
                      {voucher.code}
                    </h3>
                  </div>
                  <Ticket className="text-blue-200 w-8 h-8" />
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-3xl font-bold text-gray-800">
                      {voucher.type === "PERCENT"
                        ? `${voucher.amount}%`
                        : formatRupiah(voucher.amount)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3" /> Min. Blj:{" "}
                      {formatRupiah(voucher.minPurchase || 0)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> Exp:{" "}
                      {new Date(voucher.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => handleDelete(voucher.id)}
                      className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-bold">Voucher Baru</h3>
              <button onClick={() => setShowModal(false)}>
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* KODE */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kode Voucher
                </label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="MERDEKA45"
                  className="w-full px-4 py-2 border rounded-lg font-mono uppercase focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* TIPE & AMOUNT */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipe
                  </label>
                  <div>
                    <div className="w-full p-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500">
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full outline-0"
                      >
                        <option value="FIXED">Potongan Rp</option>
                        <option value="PERCENT">Diskon %</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nilai ({type === "PERCENT" ? "%" : "Rp"})
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* MIN PURCHASE & EXPIRY */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimal Belanja (Rp)
                </label>
                <input
                  type="number"
                  value={minPurchase}
                  onChange={(e) => setMinPurchase(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Berlaku Sampai
                </label>
                <input
                  type="date"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={submitLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg mt-2 flex justify-center gap-2"
              >
                {submitLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Buat Voucher"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerVouchers;
