import { useEffect, useState } from "react";
import api from "../../services/api";
import { Check, X, Clock } from "lucide-react";
import toast from "react-hot-toast";

const AdminVendors = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/auth/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Gagal load users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (
    userId: number,
    status: "APPROVED" | "REJECTED"
  ) => {
    if (
      !confirm(
        `Yakin ingin ${
          status === "APPROVED" ? "MENYETUJUI" : "MENOLAK"
        } vendor ini?`
      )
    )
      return;

    try {
      await api.patch(`/auth/verify-vendor/${userId}`, { status });
      toast.success(
        `Vendor berhasil ${status === "APPROVED" ? "disetujui" : "ditolak"}`
      );
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal verifikasi");
    }
  };

  const pendingVendors = users.filter((u) => u.vendorStatus === "PENDING");
  const otherUsers = users.filter((u) => u.vendorStatus !== "PENDING");

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Kelola Vendor</h1>

      <div className="bg-white rounded-xl shadow-md border border-orange-100 overflow-hidden mb-8">
        <div className="bg-orange-50 px-6 py-4 border-b border-orange-100 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h2 className="font-bold text-orange-800">
            Menunggu Persetujuan ({pendingVendors.length})
          </h2>
        </div>

        {pendingVendors.length === 0 ? (
          <p className="p-6 text-gray-500 text-center">
            Tidak ada pengajuan baru.
          </p>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-orange-50/50 text-gray-600 font-semibold text-sm">
              <tr>
                <th className="p-4">Nama User</th>
                <th className="p-4">Email</th>
                <th className="p-4">Tanggal Daftar</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pendingVendors.map((user) => (
                <tr key={user.id} className="hover:bg-orange-50/30 transition">
                  <td className="p-4 font-medium">{user.name}</td>
                  <td className="p-4 text-gray-600">{user.email}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex justify-center gap-3">
                    <button
                      onClick={() => handleVerify(user.id, "APPROVED")}
                      className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 text-sm font-bold transition"
                    >
                      <Check className="w-4 h-4" /> Terima
                    </button>
                    <button
                      onClick={() => handleVerify(user.id, "REJECTED")}
                      className="flex items-center gap-1 bg-red-100 text-red-700 px-3 py-1.5 rounded-lg hover:bg-red-200 text-sm font-bold transition"
                    >
                      <X className="w-4 h-4" /> Tolak
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-700">Daftar Pengguna Lainnya</h2>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm sticky top-0">
              <tr>
                <th className="p-4">Nama</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status Vendor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {otherUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-xs font-bold ${
                        user.role === "ADMIN"
                          ? "bg-black text-white"
                          : user.role === "SELLER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {user.vendorStatus || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminVendors;
