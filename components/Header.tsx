"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Tag, LogOut, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCart } from "@/context/CartContext";

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart(); // setIsCartOpen нэмлээ
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);

  // 1. Категори татах
  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const catList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(catList);
    });
    return () => unsubscribe();
  }, []);

  // 2. Админ эрх шалгах
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setIsAdmin(docSnap.data().isAdmin === true);
          }
        } catch (error) {
          console.error("Admin check error:", error);
        }
      } else {
        setIsAdmin(false);
      }
    };
    checkAdminStatus();
  }, [user]);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
        
        <div className="flex items-center justify-between">
          {/* ЛОГО */}
          <Link href="/" className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={200} 
              height={60} 
              className="h-12 md:h-16 w-auto object-contain"
              priority
            />
          </Link>

          {/* ХАЙЛТ */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Хайх"
              className="w-full border border-gray-100 bg-gray-50 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-black text-sm"
            />
          </div>

          <div className="flex items-center gap-4">
            {/* USER LOGIN/PROFILE */}
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  {isAdmin ? (
                    <Link href="/admin" className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                      <LayoutDashboard className="w-4 h-4" />
                      Админ
                    </Link>
                  ) : (
                    <Link href="/profile" className="flex items-center gap-2 bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                      <User className="w-4 h-4" />
                      Профайл
                    </Link>
                  )}
                  <button onClick={() => signOut(auth)} className="p-2 text-gray-400 hover:text-red-600 transition">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-2 text-gray-700 hover:text-black font-bold text-sm">
                  <User className="w-6 h-6" />
                  <span className="hidden sm:inline">Нэвтрэх</span>
                </Link>
              )}
            </div>

            {/* САГСНЫ DRAWER-ИЙГ НЭЭХ ТОВЧ */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="text-gray-700 hover:text-black relative p-2"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ДООД КАТЕГОРИ ХЭСЭГ */}
        <div className="hidden md:flex items-center justify-between mt-5">
          <div className="flex items-center gap-8 text-sm font-bold text-gray-800">
            <span>Ангилал</span>
            <div className="flex items-center gap-6 text-gray-500 font-medium overflow-x-auto no-scrollbar">
              <Link href="/products" className="hover:text-black whitespace-nowrap">БҮГД</Link>
              {categories.map((cat) => (
                <Link 
                  key={cat.id} 
                  href={`/products?category=${cat.name}`}
                  className="hover:text-black whitespace-nowrap transition-colors uppercase"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
          
          <Link href="/sale" className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition shadow-sm">
            <Tag className="w-4 h-4" />
            ОНЦЛОХ ХЯМДРАЛ
          </Link>
        </div>

      </div>
    </header>
  );
}