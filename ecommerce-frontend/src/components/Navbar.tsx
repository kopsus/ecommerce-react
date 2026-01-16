import { Link } from "react-router-dom";
import { ShoppingCart, Store } from "lucide-react";
import { UseAuth } from "../context/AuthContext";
import { UseCart } from "../context/CartContext";

const Navbar = () => {
  const { user } = UseAuth();
  const { cartCount } = UseCart();

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
                {/* Menu Keranjang */}
                <Link
                  to="/cart"
                  className="relative group p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <ShoppingCart className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                  {cartCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Info User & Logout */}
                <div className="flex items-center gap-3 border-l pl-4 ml-2">
                  <div className="text-right hidden md:block">
                    <Link
                      to="/profile"
                      className="text-right hidden md:block hover:opacity-80 transition"
                    >
                      <p className="text-sm font-semibold text-gray-800">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500">{user.role}</p>
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              // Kalau belum login
              <div className="flex items-center gap-4">
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
