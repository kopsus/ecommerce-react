import axios from "axios";

// Ganti URL ini jika backend kamu berjalan di port berbeda
const API_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- INTERCEPTOR (PENTING) ---
// Ini berfungsi seperti "Satpam".
// Setiap kali kita kirim request, satpam ini akan mengecek:
// "Apakah ada token login di saku (localStorage)? Kalau ada, tempelkan ke request."
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
