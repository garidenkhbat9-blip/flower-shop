"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Tag, LogOut, LayoutDashboard, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    const qCat = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unCat = onSnapshot(qCat, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qProd = query(collection(db, "products"));
    const unProd = onSnapshot(qProd, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => {
      unCat();
      unProd();
    };
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

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
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" onClick={() => {
              if (searchQuery.trim()) {
                setShowDropdown(false);
                router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
              }
            }} />
            <input
              type="text"
              placeholder="Шууд хайх..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={handleSearch}
              className="w-full border border-gray-100 bg-[#FFFDF9] rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#87A96B] text-sm text-[#333333] placeholder-gray-400 transition-all shadow-inner"
            />
            {/* АВТОМАТААР САГИСАХ DROPDOWN */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                 {searchResults.map(prod => (
                   <div
                     key={prod.id}
                     onClick={() => {
                       setSearchQuery("");
                       setShowDropdown(false);
                       router.push(`/products/${prod.id}`);
                     }}
                     className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-0 transition"
                   >
                     <img src={prod.imageUrls?.[0] || "/placeholder.jpg"} alt={prod.name} className="w-10 h-10 object-cover rounded-md" />
                     <div>
                       <p className="text-sm font-bold text-[#333333]">{prod.name}</p>
                       <p className="text-xs font-black text-[#87A96B]">{(prod.discountedPrice ?? prod.price)?.toLocaleString()}₮</p>
                     </div>
                   </div>
                 ))}
                 <div 
                   onClick={() => {
                     setShowDropdown(false);
                     router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                   }}
                   className="p-3 text-center text-xs font-bold text-[#E2A9BE] hover:bg-gray-50 cursor-pointer uppercase"
                 >
                   Бүх ({products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).length}) үр дүнг харах
                 </div>
              </div>
            )}
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