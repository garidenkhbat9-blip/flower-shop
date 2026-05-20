"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Tag, LogOut, LayoutDashboard, User, Truck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, userProfile, loading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();

  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

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



  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`w-full sticky top-0 z-50 transition-all duration-300 print:hidden ${isScrolled ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-gray-100" : "bg-white border-b border-gray-100"}`}
    >
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${isScrolled ? "py-2 md:py-2.5" : "py-3 md:py-4"}`}>

        <div className="flex items-center justify-between">
          {/* ЛОГО */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo1.png"
              alt="Logo"
              width={300}
              height={90}
              className={`w-auto object-contain transition-all duration-300 ${isScrolled ? "h-12 md:h-16" : "h-16 md:h-24"}`}
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
              placeholder="Search our collection..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={handleSearch}
              className="w-full border border-black/[0.05] bg-[#FCFBF9] rounded-[2px] py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#87A96B] text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 transition-all font-montserrat shadow-sm"
            />
            {/* АВТОМАТААР САГИСАХ DROPDOWN */}
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2px] shadow-2xl border border-black/[0.03] overflow-hidden z-50 py-3">
                {searchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      setSearchQuery("");
                      setShowDropdown(false);
                      router.push(`/products/${prod.id}`);
                    }}
                    className="flex items-center gap-5 px-6 py-4 hover:bg-[#FCFBF9] cursor-pointer transition-colors"
                  >
                    <img src={prod.imageUrls?.[0] || "/placeholder.jpg"} alt={prod.name} className="w-14 h-14 object-cover rounded-[2px] shadow-sm" />
                    <div>
                      <p className="text-xs font-bold text-[#1A1A1A] uppercase tracking-wider font-montserrat">{prod.name}</p>
                      <p className="text-[11px] text-[#1A1A1A]/40 font-playfair mt-1">{(prod.discountedPrice ?? prod.price)?.toLocaleString()}₮</p>
                    </div>
                  </div>
                ))}
                <div
                  onClick={() => {
                    setShowDropdown(false);
                    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                  }}
                  className="px-6 py-4 text-center text-[10px] font-bold text-[#1A1A1A] hover:bg-[#FCFBF9] cursor-pointer uppercase tracking-[0.3em] border-t border-black/[0.03] mt-2"
                >
                  View all results ({products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).length})
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
                  {(userProfile?.isAdmin || userProfile?.role === "admin") ? (
                    <Link href="/admin" className="flex items-center gap-2 bg-[#87A96B] text-white px-5 py-2.5 rounded-[2px] text-[10px] font-bold hover:bg-[#76945d] transition-all shadow-lg uppercase tracking-wider">
                      <LayoutDashboard size={14} />
                      Админ
                    </Link>
                  ) : userProfile?.role === "delivery" ? (
                    <Link href="/delivery" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-[2px] text-[10px] font-bold hover:bg-blue-700 transition-all shadow-lg uppercase tracking-wider">
                      <Truck size={14} />
                      Хүргэлт
                    </Link>
                  ) : (
                    <Link href="/profile" className="flex items-center gap-2 bg-white border border-black/[0.05] text-[#1A1A1A] px-5 py-2.5 rounded-[2px] text-[10px] font-bold hover:border-[#87A96B] transition-all shadow-sm uppercase tracking-wider">
                      <User size={14} />
                      Профайл
                    </Link>
                  )}
                  <button onClick={() => signOut(auth)} className="p-2 text-gray-400 hover:text-red-600 transition">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link href="/auth/login" className="flex items-center gap-3 text-[#1A1A1A] hover:opacity-60 transition-opacity">
                  <User size={20} strokeWidth={1.5} />
                  <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-[0.3em]">Login</span>
                </Link>
              )}
            </div>

            {/* САГСНЫ DRAWER-ИЙГ НЭЭХ ТОВЧ */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-[#1A1A1A] hover:opacity-50 relative p-2 transition-opacity"
            >
              <ShoppingCart size={22} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-[#87A96B] text-white text-[9px] font-medium w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* ДООД КАТЕГОРИ ХЭСЭГ */}
        <div className={`hidden md:flex items-center justify-between transition-all duration-300 overflow-hidden ${isScrolled ? "h-0 opacity-0 mt-0" : "h-auto opacity-100 mt-8"}`}>
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-10 text-[#1A1A1A]/50 font-bold">
              <Link href="/products" className="hover:text-[#1A1A1A] whitespace-nowrap text-[10px] tracking-[0.4em] uppercase transition-colors">БҮГД</Link>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.name}`}
                  className="hover:text-[#1A1A1A] whitespace-nowrap text-[10px] tracking-[0.4em] uppercase transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          <Link href="/sale" className="group flex items-center gap-3 text-[#1A1A1A]">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] border-b border-black/[0.05] pb-1 group-hover:border-[#87A96B] transition-colors">Sale Highlights</span>
            <Tag size={14} className="text-[#1A1A1A]/40 group-hover:text-[#87A96B] transition-colors" />
          </Link>
        </div>

      </div>
    </motion.header>
  );
}