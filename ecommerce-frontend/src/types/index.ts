// Tipe data User (Sesuai database)
export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER" | "SELLER";
  vendorStatus?: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
}

// Tipe data respon Login
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Tipe data Produk
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string | null;
  sellerId: number;
  seller?: {
    name: string;
  };
}

// Tipe data Cart Item
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: Product;
}
