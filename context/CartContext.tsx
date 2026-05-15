"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useAuth } from "./AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

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
  addToCart: (product: any, quantity?: number, silent?: boolean) => void;
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

  // 1. Ачаалах үед localStorage-оос эсвэл Firestore-оос сагсыг татах
  useEffect(() => {
    if (user) {
      // Нэвтэрсэн үед Firestore-оос татах
      const cartRef = doc(db, "carts", user.uid);
      const unsubscribe = onSnapshot(cartRef, (docSnap) => {
        if (docSnap.exists()) {
          setCart(docSnap.data().items || []);
        } else {
          setCart([]);
        }
      });
      return () => unsubscribe();
    } else {
      // Нэвтрээгүй үед localStorage-оос татах
      const savedCart = localStorage.getItem("guest_cart");
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (e) {
          console.error("Local cart parse error:", e);
          setCart([]);
        }
      } else {
        setCart([]);
      }
    }
  }, [user]);

  // 2. Сагс өөрчлөгдөх бүрт хадгалах функц
  const syncCart = async (newCart: CartItem[]) => {
    if (user) {
      try {
        await setDoc(doc(db, "carts", user.uid), { items: newCart });
      } catch (error) {
        console.error("Firestore sync error:", error);
      }
    } else {
      localStorage.setItem("guest_cart", JSON.stringify(newCart));
    }
  };

  const [showToast, setShowToast] = useState(false);

  const addToCart = (product: any, quantity: number = 1, silent: boolean = false) => {
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
    syncCart(newCart);
    
    // Show luxury toast if not silent
    if (!silent) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  const removeFromCart = (productId: string) => {
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart);
    syncCart(newCart);
  };

  const updateQuantity = (productId: string, delta: number) => {
    const newCart = cart.map((item) =>
      item.id === productId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
    );
    setCart(newCart);
    syncCart(newCart);
  };

  const clearCart = () => {
    setCart([]);
    if (user) {
      syncCart([]);
    } else {
      localStorage.removeItem("guest_cart");
    }
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal, isCartOpen, setIsCartOpen }}>
      {children}
      
      {/* Luxury Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] pointer-events-none"
          >
            <div className="bg-[#1A1A1A] text-white px-8 py-4 rounded-[2px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 border border-white/10 backdrop-blur-xl">
              <div className="w-8 h-8 bg-[#87A96B] rounded-full flex items-center justify-center">
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 leading-none mb-1">Амжилттай</span>
                <span className="text-[11px] font-medium uppercase tracking-[0.1em]">Сагсанд нэмэгдлээ</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};