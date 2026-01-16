import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import api from "../services/api";
import { UseAuth } from "./AuthContext";

interface WishlistContextType {
  wishlistCount: number;
  refreshWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

export const WishlistProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [wishlistCount, setWishlistCount] = useState(0);
  const { isAuthenticated } = UseAuth();

  const refreshWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistCount(0);
      return;
    }

    try {
      const response = await api.get("/wishlist");
      setWishlistCount(response.data.length);
    } catch (error) {
      console.error("Gagal refresh wishlist count", error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  return (
    <WishlistContext.Provider value={{ wishlistCount, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const UseWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context)
    throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
