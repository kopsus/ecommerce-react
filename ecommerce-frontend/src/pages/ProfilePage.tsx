import { useState } from "react";
import Navbar from "../components/Navbar";
import OrderHistory from "../components/OrderHistory";
import { UseAuth } from "../context/AuthContext";
import { User, ShoppingBag, LogOut, Settings, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, logout } = UseAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"profile" | "orders">("profile");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* SIDEBAR KIRI */}
          <aside className="w-full md:w-1/4">
            <div className="bg-white rounded-xl shadow-sm p-6 text-center border border-gray-100">
              <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto flex items-center justify-center text-blue-600 mb-4">
                <span className="text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{user.email}</p>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  user.role === "SELLER"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {user.role}
              </span>

              <div className="mt-8 space-y-2">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <User className="w-5 h-5" /> Profil Saya
                </button>
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    activeTab === "orders"
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" /> Riwayat Pesanan
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition"
                >
                  <LogOut className="w-5 h-5" /> Keluar
                </button>
              </div>
            </div>
          </aside>

          {/* KONTEN KANAN */}
          <section className="w-full md:w-3/4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-125">
              {activeTab === "profile" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Settings className="h-6 w-6 text-blue-600" /> Pengaturan
                    Profil
                  </h2>

                  <div className="grid gap-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={user.name}
                        disabled
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status Akun
                      </label>
                      <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200">
                        <ShieldCheck className="h-5 w-5" />
                        <span className="font-medium">Akun Terverifikasi</span>
                      </div>
                    </div>

                    {/* Disini bisa ditambah tombol Edit Profil nanti jika backend sudah siap */}
                    {/* <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 self-start">Simpan Perubahan</button> */}
                  </div>
                </div>
              )}

              {activeTab === "orders" && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <ShoppingBag className="h-6 w-6 text-blue-600" /> Riwayat
                    Belanja
                  </h2>
                  <OrderHistory />
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
