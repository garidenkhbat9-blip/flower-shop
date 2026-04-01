"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { useAuth } from "./AuthContext";

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem("wishlist");
    if (saved) {
      try {
        setWishlist(JSON.parse(saved));
      } catch {
        setWishlist([]);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  }, [wishlist]);

  useEffect(() => {
    if (!user) return;

    const wishlistRef = doc(db, "wishlists", user.uid);
    const unsubscribe = onSnapshot(wishlistRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.items && Array.isArray(data.items)) {
          setWishlist(data.items);
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const wishlistRef = doc(db, "wishlists", user.uid);
    setDoc(wishlistRef, { items: wishlist }, { merge: true }).catch((error) => {
      console.error("Wishlist-синк хийхэд алдаа гарлаа:", error);
    });
  }, [user, wishlist]);

  const toggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
  };

  const clearWishlist = () => setWishlist([]);

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider
      value={{ wishlist, toggleWishlist, isWishlisted, removeFromWishlist, clearWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
