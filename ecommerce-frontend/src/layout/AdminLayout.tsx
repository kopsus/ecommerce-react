import { useState } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { UseAuth } from "../context/AuthContext";
import {
  ShieldCheck,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const AdminLayout = () => {
  const { user, logout } = UseAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (!user || user.role !== "ADMIN") {
    navigate("/login");
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside
        className={`bg-slate-900 text-white shadow-xl fixed z-20 h-screen transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } lg:relative`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {isSidebarOpen ? (
            <span className="text-xl font-bold flex items-center gap-2 text-blue-400">
              <ShieldCheck /> AdminPanel
            </span>
          ) : (
            <ShieldCheck className="text-blue-400 mx-auto" />
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-800 rounded lg:hidden"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            to="/admin-dashboard"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === "/admin-dashboard"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            {isSidebarOpen && <span>Dashboard</span>}
          </Link>

          <Link
            to="/admin/vendors"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
              location.pathname === "/admin/vendors"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Users className="w-5 h-5" />
            {isSidebarOpen && <span>Kelola Vendor</span>}
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition mt-8"
          >
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </nav>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-4 lg:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2">
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-bold ml-4">Admin Area</span>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
