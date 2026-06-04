"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, ShoppingCart, Tag, LogOut, LayoutDashboard, User, Truck, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";

export default function Header() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, userProfile, loading } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  const router = useRouter();

  const navContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  // Хэдэн категори багтах тооцоолно
  const recalculate = useCallback(() => {
    if (!navContainerRef.current) return;
    // "Sale Highlights" + gap зориулж 200px зайлуулна
    const containerWidth = navContainerRef.current.offsetWidth - 200;
    let usedWidth = 0;
    let count = 0;

    // "БҮГД" link-ийн өргөн (~60px estimated)
    const allLinkWidth = 80;
    usedWidth += allLinkWidth;

    // Категори бүрийг шалгана
    for (let i = 0; i < itemRefs.current.length; i++) {
      const el = itemRefs.current[i];
      if (!el) continue;
      const w = el.getBoundingClientRect().width + 40; // gap-10 = 40px
      if (usedWidth + w > containerWidth) break;
      usedWidth += w;
      count++;
    }

    setVisibleCount(count);
  }, []);

  useEffect(() => {
    if (categories.length === 0) return;
    // DOM render болсны дараа тооцоолно
    const timer = setTimeout(recalculate, 50);
    return () => clearTimeout(timer);
  }, [categories, recalculate]);

  useEffect(() => {
    const observer = new ResizeObserver(recalculate);
    if (navContainerRef.current) observer.observe(navContainerRef.current);
    return () => observer.disconnect();
  }, [recalculate]);

  // Гадна дарахад хаах
  useEffect(() => {
    if (!showMoreMenu) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-more-menu]")) setShowMoreMenu(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMoreMenu]);

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
    return () => { unCat(); unProd(); };
  }, []);

  const searchResults = searchQuery.trim()
    ? products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  // Харагдах vs нуугдсан категориуд
  const visibleCategories = visibleCount === null ? categories : categories.slice(0, visibleCount);
  const hiddenCategories = visibleCount === null ? [] : categories.slice(visibleCount);
  const hasHidden = hiddenCategories.length > 0;

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
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              onKeyDown={handleSearch}
              className="w-full border border-black/[0.05] bg-[#FCFBF9] rounded-[2px] py-3.5 pl-12 pr-4 focus:outline-none focus:border-[#87A96B] text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/40 transition-all font-montserrat shadow-sm"
            />
            {showDropdown && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2px] shadow-2xl border border-black/[0.03] overflow-hidden z-50 py-3">
                {searchResults.map(prod => (
                  <div
                    key={prod.id}
                    onClick={() => { setSearchQuery(""); setShowDropdown(false); router.push(`/products/${prod.id}`); }}
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
                  onClick={() => { setShowDropdown(false); router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`); }}
                  className="px-6 py-4 text-center text-[10px] font-bold text-[#1A1A1A] hover:bg-[#FCFBF9] cursor-pointer uppercase tracking-[0.3em] border-t border-black/[0.03] mt-2"
                >
                  View all results ({products.filter(p => p.name?.toLowerCase().includes(searchQuery.toLowerCase())).length})
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4">
              {loading ? (
                <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
              ) : user ? (
                <div className="flex items-center gap-3">
                  {(userProfile?.isAdmin || userProfile?.role === "admin") ? (
                    <Link href="/admin" className="flex items-center gap-2 bg-[#87A96B] text-white px-5 py-2.5 rounded-[2px] text-[10px] font-bold hover:bg-[#76945d] transition-all shadow-lg uppercase tracking-wider">
                      <LayoutDashboard size={14} />Админ
                    </Link>
                  ) : userProfile?.role === "delivery" ? (
                    <Link href="/delivery" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-[2px] text-[10px] font-bold hover:bg-blue-700 transition-all shadow-lg uppercase tracking-wider">
                      <User size={14} />Хүргэлт
                    </Link>
                  ) : (
                    <Link href="/profile" className="flex items-center gap-2 bg-white border border-black/[0.05] text-[#1A1A1A] px-5 py-2.5 rounded-[2px] text-[10px] font-bold hover:border-[#87A96B] transition-all shadow-sm uppercase tracking-wider">
                      <User size={14} />Профайл
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
        <div className={`hidden md:flex items-center justify-between transition-all duration-300 ${isScrolled ? "h-0 opacity-0 mt-0 pointer-events-none" : "h-auto opacity-100 mt-8"}`}>

          {/* Категори nav — overflow:visible тул dropdown харагдана */}
          <div ref={navContainerRef} className="flex-1 min-w-0 flex items-center gap-3 text-[#1A1A1A]/50 font-bold relative">

            {/* Хувиарлах хэсэг — overflow гарна цавчсан линкүүд хуваарна */}
            <div className="flex items-center gap-10 overflow-hidden min-w-0 flex-1">
              {/* БҮГД */}
              <Link href="/products" className="hover:text-[#1A1A1A] whitespace-nowrap text-[10px] tracking-[0.4em] uppercase transition-colors shrink-0">
                БҮГД
              </Link>

              {/* Харагдах категориуд */}
              {categories.map((cat, i) => (
                <Link
                  key={cat.id}
                  ref={el => { itemRefs.current[i] = el; }}
                  href={`/products?category=${cat.name}`}
                  className={`hover:text-[#1A1A1A] whitespace-nowrap text-[10px] tracking-[0.4em] uppercase transition-colors shrink-0 ${
                    visibleCount !== null && i >= visibleCount ? "hidden" : ""
                  }`}
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {/* "+N" товч — нуугдсан категориуд байвал */}
            {hasHidden && (
              <div className="relative shrink-0" data-more-menu>
                <button
                  onClick={() => setShowMoreMenu(prev => !prev)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] transition-all px-3.5 py-1.5 rounded-full ${
                    showMoreMenu
                      ? "bg-[#87A96B] text-white shadow-md"
                      : "text-[#87A96B] bg-[#87A96B]/10 hover:bg-[#87A96B]/20"
                  }`}
                >
                  +{hiddenCategories.length} дэлгэрэнгүй
                </button>

                {/* Dropdown — нуугдсан категориуд */}
                <AnimatePresence>
                  {showMoreMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.16, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-3 z-[100] bg-white border border-black/[0.06] shadow-2xl rounded-2xl overflow-hidden min-w-[240px]"
                      data-more-menu
                    >
                      {/* Header */}
                      <div className="px-5 py-3.5 border-b border-black/[0.05] flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]/40">
                          Бусад категори
                        </span>
                        <button
                          onClick={() => setShowMoreMenu(false)}
                          className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10 transition"
                        >
                          <X size={11} className="text-[#1A1A1A]/50" />
                        </button>
                      </div>

                      {/* Нуугдсан категориуд */}
                      <div className="py-1.5 max-h-[50vh] overflow-y-auto">
                        {hiddenCategories.map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/products?category=${cat.name}`}
                            onClick={() => setShowMoreMenu(false)}
                            className="flex items-center justify-between px-5 py-3 hover:bg-[#f9f9f7] transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {cat.imageUrl ? (
                                <img src={cat.imageUrl} alt={cat.name} className="w-7 h-7 rounded-lg object-cover border border-black/[0.06]" />
                              ) : (
                                <span className="w-7 h-7 rounded-lg bg-[#f0ede8] flex items-center justify-center text-xs">🌸</span>
                              )}
                              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#1A1A1A]">
                                {cat.name}
                              </span>
                            </div>
                            <ChevronRight size={13} className="text-[#1A1A1A]/20 group-hover:text-[#87A96B] transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Sale Highlights */}
          <Link href="/sale" className="group flex items-center gap-3 text-[#1A1A1A] ml-8 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] border-b border-black/[0.05] pb-1 group-hover:border-[#87A96B] transition-colors">
              Sale Highlights
            </span>
            <Tag size={14} className="text-[#1A1A1A]/40 group-hover:text-[#87A96B] transition-colors" />
          </Link>
        </div>

      </div>
    </motion.header>
  );
}