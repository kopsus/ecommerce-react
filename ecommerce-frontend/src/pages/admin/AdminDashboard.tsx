import { useEffect, useState } from "react";
import api from "../../services/api";
import { formatRupiah } from "../../utils/format";
import { Users, DollarSign, Store, ShieldCheck } from "lucide-react";

const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/analytics/admin");
        setStats(response.data);
      } catch (error) {
        console.error("Gagal load admin stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return <div className="p-10 text-center">Memuat data admin...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Overview Sistem</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Pengguna</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats?.totalUsers || 0}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Penjual</p>
              <h3 className="text-2xl font-bold text-gray-800">
                {stats?.totalSellers || 0}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Butuh Verifikasi</p>
              <h3 className="text-2xl font-bold text-orange-600">
                {stats?.pendingVendors || 0}
              </h3>
            </div>
            <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Omzet</p>
              <h3 className="text-2xl font-bold text-green-600">
                {formatRupiah(stats?.totalRevenue || 0)}
              </h3>
            </div>
            <div className="p-3 bg-green-100 text-green-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
