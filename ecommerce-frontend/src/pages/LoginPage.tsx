import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UseAuth } from "../context/AuthContext";
import api from "../services/api";
import toast from "react-hot-toast";
import { LogIn, Mail, Lock } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = UseAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });

      const { token, user } = response.data;

      login(token, user);

      toast.success(`Selamat datang, ${user.name}!`);

      if (user.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (user.role === "SELLER") {
        navigate("/seller-dashboard");
      } else {
        navigate("/");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Login gagal";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Masuk Akun</h2>
          <p className="text-gray-500 mt-2">
            Silakan login untuk mulai belanja
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="nama@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                <LogIn className="h-5 w-5" /> Masuk
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          Belum punya akun?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:underline font-medium"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
