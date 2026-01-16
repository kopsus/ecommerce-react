import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage"; // Import HomePage
import CartPage from "./pages/CartPage";
import { CartProvider } from "./context/CartContext";
import CheckoutPage from "./pages/CheckoutPage";
import ProfilePage from "./pages/ProfilePage";
import WishlistPage from "./pages/WishlistPage";
import { WishlistProvider } from "./context/WishlistContext";
import SellerLayout from "./layout/SellerLayout";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerProducts from "./pages/seller/SellerProducts";
import SellerOrders from "./pages/seller/SellerOrders";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            <Toaster position="top-right" />

            <Routes>
              {/* Ganti element Home lama dengan HomePage baru */}
              <Route path="/" element={<HomePage />} />

              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />

              <Route path="/wishlist" element={<WishlistPage />} />

              <Route path="/profile" element={<ProfilePage />} />

              {/* Layout Seller */}
              <Route path="/" element={<SellerLayout />}>
                <Route path="seller-dashboard" element={<SellerDashboard />} />
                <Route path="seller/products" element={<SellerProducts />} />
                <Route path="seller/orders" element={<SellerOrders />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
