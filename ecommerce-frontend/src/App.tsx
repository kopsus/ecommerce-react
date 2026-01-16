import { Routes, Route, Navigate } from "react-router-dom"; // Import Routes
import { AuthProvider, UseAuth } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Komponen Halaman Home Sementara
const Home = () => {
  const { user, logout } = UseAuth();
  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Selamat Datang di Toko! 🛒</h1>
      {user ? (
        <div className="bg-white p-6 rounded shadow inline-block">
          <p className="text-xl text-green-600 font-semibold">
            Halo, {user.name}!
          </p>
          <p className="text-gray-500">Role: {user.role}</p>
          <button
            onClick={logout}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Anda belum login.</p>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Toaster position="top-right" />

        {/* Definisi Rute Halaman */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Kalau URL ngaco, balikin ke Home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;
