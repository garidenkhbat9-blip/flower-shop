"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  packaging?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: any, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, delta: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // Хэрэглэгчийг хянах
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. Хэрэглэгч нэвтрэх үед Firestore-оос сагсыг нь татах
  useEffect(() => {
    if (!user) {
      setCart([]); // Гарах үед сагсыг хоослох
      return;
    }

    const cartRef = doc(db, "carts", user.uid);
    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        setCart(docSnap.data().items || []);
      } else {
        setCart([]);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Сагс өөрчлөгдөх бүрт Firestore руу хадгалах функц
  const syncCartToFirebase = async (newCart: CartItem[]) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "carts", user.uid), { items: newCart });
    } catch (error) {
      console.error("Сагс хадгалахад алдаа:", error);
    }
  };

  const addToCart = (product: any, quantity: number = 1) => {
  // 1. Хэрэв нэвтрээгүй байвал ALERT ГАРГАХГҮЙ, зөвхөн сагсыг нээнэ
  if (!user) {
    setIsCartOpen(true); 
    return; // Барааг Firestore-руу хадгалахгүй зогсоно
  }

  // 2. Хэрэв нэвтэрсэн бол барааг нэмэх логик үргэлжилнэ
  const existingItem = cart.find((item) => item.id === product.id);
  let newCart;

  if (existingItem) {
    newCart = cart.map((item) =>
      item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
    );
  } else {
    newCart = [
      ...cart,
      {
        id: product.id,
        name: product.name,
        price: product.discountedPrice || product.price,
        imageUrl: product.imageUrls?.[0] || "/placeholder.jpg",
        quantity: quantity,
        packaging: product.packaging || "Баглаа",
      },
    ];
  }

  setCart(newCart);
  syncCartToFirebase(newCart); // Firestore-той синхрон хийх
};

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    syncCartToFirebase(newCart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(newCart);
    syncCartToFirebase(newCart);
  };

  const clearCart = () => {
    setCart([]);
    syncCartToFirebase([]);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};