import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatRupiah } from "../../utils/format";
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react";

const SellerDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/analytics/seller");
        setStats(response.data);
      } catch (error) {
        console.error("Gagal ambil data dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Memuat data toko...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Ringkasan Toko</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-green-100 text-green-600 rounded-full">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Pendapatan</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {formatRupiah(stats?.totalRevenue || 0)}
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Produk Terjual</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats?.totalSoldItems || 0} pcs
            </h3>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-purple-100 text-purple-600 rounded-full">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Transaksi</p>
            <h3 className="text-2xl font-bold text-gray-800">
              {stats?.totalOrders || 0}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-lg mb-4 text-gray-800">
          Produk Paling Laris
        </h3>
        {stats?.topProducts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500 text-sm">
                  <th className="pb-3">Nama Produk</th>
                  <th className="pb-3 text-right">Terjual</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {stats.topProducts.map((prod: any, idx: number) => (
                  <tr
                    key={idx}
                    className="border-b last:border-0 hover:bg-gray-50"
                  >
                    <td className="py-3">{prod.name}</td>
                    <td className="py-3 text-right font-semibold">
                      {prod.sales} pcs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-sm py-4">
            Belum ada data penjualan.
          </p>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
