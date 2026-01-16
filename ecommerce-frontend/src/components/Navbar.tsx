import { Link, useNavigate } from "react-router-dom";
import { UseAuth } from "../context/AuthContext";
import { UseCart } from "../context/CartContext";
import { UseWishlist } from "../context/WishlistContext";
import { ShoppingCart, LogOut, Store, Heart, ShieldCheck } from "lucide-react"; // Import icon baru

const Navbar = () => {
  const { user, logout } = UseAuth();
  const { cartCount } = UseCart();
  const { wishlistCount } = UseWishlist();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo Kiri */}
          <Link
            to="/"
            className="flex items-center gap-2 text-blue-600 font-bold text-xl"
          >
            <Store className="h-8 w-8" />
            <span>TokoKita</span>
          </Link>

          {/* Menu Kanan */}
          <div className="flex items-center gap-6">
            {user ? (
              <>
                {/* --- LOGIC NAVBAR BERDASARKAN ROLE --- */}

                {/* 1. JIKA ADMIN: Tampilkan Tombol Dashboard Saja */}
                {user.role === "ADMIN" ? (
                  <Link
                    to="/admin-dashboard"
                    className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition shadow-md"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-sm font-bold">Admin Panel</span>
                  </Link>
                ) : (
                  // 2. JIKA BUKAN ADMIN (Customer/Seller): Tampilkan Keranjang & Wishlist
                  <>
                    <Link
                      to="/wishlist"
                      className="relative p-2 text-gray-400 hover:text-red-500 transition group"
                      title="Wishlist"
                    >
                      <Heart className="h-6 w-6 group-hover:fill-current" />
                      {wishlistCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full border-2 border-white">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>

                    <Link
                      to="/cart"
                      className="relative group p-2 hover:bg-gray-100 rounded-full transition"
                    >
                      <ShoppingCart className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                      {cartCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-blue-600 rounded-full">
                          {cartCount}
                        </span>
                      )}
                    </Link>
                  </>
                )}

                {/* Info User & Logout (Muncul untuk semua role) */}
                <div className="flex items-center gap-3 border-l pl-4 ml-2">
                  {/* Link Nama User: Kalau Admin ke Dashboard, kalau user lain ke Profile */}
                  <Link
                    to={user.role === "ADMIN" ? "/admin-dashboard" : "/profile"}
                    className="text-right hidden md:block hover:opacity-80 transition"
                  >
                    <p className="text-sm font-semibold text-gray-800">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">{user.role}</p>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 hover:text-red-600 transition"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              // Kalau Belum Login
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-blue-600 font-medium"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
