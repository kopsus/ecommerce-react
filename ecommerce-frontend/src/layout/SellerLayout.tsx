import { useState } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { UseAuth } from "../context/AuthContext";
import {
  Store,
  LayoutDashboard,
  Package,
  Ticket,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const SellerLayout = () => {
  const { user, logout } = UseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Proteksi: Hanya Seller yang boleh masuk sini
  if (!user || user.role !== "SELLER") {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", path: "/seller-dashboard", icon: LayoutDashboard },
    { name: "Produk Saya", path: "/seller/products", icon: Package },
    { name: "Kelola Voucher", path: "/seller/vouchers", icon: Ticket },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* SIDEBAR */}
      <aside
        className={`bg-white shadow-xl fixed z-20 h-full transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } lg:relative`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {isSidebarOpen ? (
            <span className="text-xl font-bold text-blue-600 flex items-center gap-2">
              <Store /> SellerCenter
            </span>
          ) : (
            <Store className="text-blue-600 mx-auto" />
          )}

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 rounded hover:bg-gray-100 lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                location.pathname === item.path
                  ? "bg-blue-50 text-blue-600 font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {isSidebarOpen && <span>{item.name}</span>}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition mt-8"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Keluar</span>}
          </button>
        </nav>
      </aside>

      {/* KONTEN UTAMA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Mobile Toggle */}
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold ml-4">Seller Dashboard</span>
        </header>

        {/* Isi Halaman Berubah-ubah di sini */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SellerLayout;
