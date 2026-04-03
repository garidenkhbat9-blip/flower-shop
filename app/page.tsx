"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { ShoppingBag, ArrowRight, Truck, Star, ShieldCheck, Heart, Sparkles } from "lucide-react";
import Link from "next/link";
import { Product, Category } from "@/types";

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[]);

        const q = query(collection(db, "products"), orderBy("createdAt", "desc"), limit(10));
        const prodSnap = await getDocs(q);
        setProducts(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      } catch (error) {
        console.error("Дата татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FFFDF9]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-[3px] border-[#f0ece8] border-t-[#E2A9BE] rounded-full animate-spin" />
        <span className="text-xs font-semibold tracking-[0.2em] text-[#E2A9BE] uppercase">Уншиж байна</span>
      </div>
    </div>
  );

  return (
    <div className="bg-[#FFFDF9] min-h-screen font-sans text-[#333333]">

      {/* 1. HERO — Cinematic Pastel Style */}
      <section className="relative h-[92svh] w-full overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2000"
          alt="hero"
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[slowZoom_12s_ease-out_forwards]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/20 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#333333]/30 to-transparent" />

        {/* Floating pill badge */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-8 md:top-8 z-20">
          <span className="inline-flex items-center gap-2 bg-[#FFFDF9]/10 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase shadow-lg">
            <Sparkles size={11} className="text-[#E2A9BE]" />
            Natural Beauty · 2025
          </span>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-end px-6 pb-16 md:pb-20 md:px-16 max-w-7xl mx-auto w-full">
          <p className="text-[#E2A9BE] text-xs font-bold tracking-[0.3em] uppercase mb-4 animate-[fadeUp_0.6s_ease_forwards]">
            Шинэхэн түүсэн цэцэгс
          </p>

          <h1 className="text-[clamp(2.6rem,8vw,5.5rem)] font-black text-white leading-[0.95] tracking-tighter mb-6 max-w-2xl animate-[fadeUp_0.7s_ease_forwards]">
            Хайртдаа өгөх<br />
            <em className="not-italic text-[#E2A9BE]">хамгийн нандин</em><br />
            бэлэг
          </h1>

          <p className="text-white/80 text-sm md:text-base max-w-sm mb-8 leading-relaxed animate-[fadeUp_0.8s_ease_forwards]">
            Сэтгэл шингэсэн баглааг <strong className="text-white">30 минутын дотор</strong> хүргэж, таны хайрыг дамжуулна.
          </p>

          <div className="flex gap-3 animate-[fadeUp_0.9s_ease_forwards]">
            <Link
              href="/products"
              className="group flex items-center gap-2.5 bg-[#E2A9BE] text-white px-7 py-4 rounded-2xl font-black text-sm hover:bg-[#d497ab] active:scale-95 transition-all shadow-xl shadow-[#E2A9BE]/30"
            >
              <ShoppingBag size={16} />
              Захиалах
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
          </div>
        </div>
      </section>

      {/* 2. TRUST STRIP — Using Sage Green highlights */}
     

      <div className="max-w-7xl mx-auto px-5 md:px-8">

        {/* 3. CATEGORIES — Gentle Sage & Cream cards */}
        <section className="pt-14 pb-12">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#87A96B] uppercase mb-1">Explore</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#333333] tracking-tight leading-none">Ангилалууд</h2>
            </div>
            <Link href="/categories" className="group text-xs font-bold text-[#999] hover:text-[#E2A9BE] flex items-center gap-1 transition-colors">
              Бүгд <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-3">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${encodeURIComponent(cat.name)}`}
                className="group relative shrink-0 w-[160px] h-[220px] md:w-[220px] md:h-[300px] rounded-[28px] overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
              >
                <img
                  src={cat.imageUrl || "https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=600"}
                  alt={cat.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#333333]/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 inset-x-0 p-5 z-10">
                  <span className="text-white font-black text-sm md:text-base uppercase tracking-wide block">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 4. DIVIDER BANNER — Soft Lifestyle */}
        <div className="mb-12 rounded-[28px] overflow-hidden relative h-[140px] md:h-[180px] bg-[#87A96B]">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1487530811015-780780f14196?q=80&w=1600')] bg-cover bg-center opacity-30 mix-blend-overlay" />
          <div className="relative z-10 h-full flex items-center justify-between px-8 md:px-12">
            <div>
              <p className="text-white/80 text-[10px] font-bold tracking-[0.25em] uppercase mb-2">Насан туршийн дурсамж</p>
              <h3 className="text-white font-black text-xl md:text-3xl tracking-tight">Хайрын баглаа</h3>
            </div>
            <Link
              href="/products"
              className="shrink-0 bg-[#FFFDF9] text-[#333333] px-6 py-3 rounded-xl font-black text-sm hover:bg-[#E2A9BE] hover:text-white transition-all active:scale-95"
            >
              Захиалах
            </Link>
          </div>
        </div>

        {/* 5. NEW ARRIVALS — Product grid with Dusty Rose accents */}
        <section className="pb-28 md:pb-16">
          <div className="flex items-end justify-between mb-7">
            <div>
              <p className="text-[10px] font-bold tracking-[0.25em] text-[#E2A9BE] uppercase mb-1">Шинэ</p>
              <h2 className="text-2xl md:text-3xl font-black text-[#333333] tracking-tight leading-none">New Arrivals</h2>
            </div>
            <Link href="/products" className="group text-xs font-bold text-[#999] hover:text-[#333333] flex items-center gap-1 transition-colors">
              Бүгд <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {products.map((product, i) => {
              const isWished = product.id ? isWishlisted(product.id) : false;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-[24px] overflow-hidden border border-[#f0ece8] hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative aspect-[3/4] bg-[#f7f3f0] overflow-hidden">
                    <Link href={`/products/${product.id}`} className="block w-full h-full">
                      <img
                        src={product.imageUrls?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </Link>
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => product.id && toggleWishlist(product.id)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all active:scale-90 ${
                          isWished
                            ? "bg-[#E2A9BE] border-[#E2A9BE] text-white shadow-lg shadow-[#E2A9BE]/20"
                            : "bg-white/80 border-white/60 text-[#777] hover:text-[#E2A9BE]"
                        }`}
                      >
                        <Heart size={15} fill={isWished ? "currentColor" : "none"} />
                      </button>
                    </div>
                    {/* Desktop Hover Add to Cart */}
                    <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                      <button onClick={() => product.id && addToCart(product)} className="w-full bg-[#E2A9BE] text-white text-xs font-black py-2.5 rounded-xl flex items-center justify-center gap-2 hover:bg-[#d497ab] transition-colors">
                        <ShoppingBag size={13} />
                        Сагсанд нэмэх
                      </button>
                    </div>
                  </div>

                  <div className="p-3.5">
                    <Link href={`/products/${product.id}`}>
                      <h3 className="text-[13px] font-bold text-[#333333] line-clamp-1 mb-2 hover:text-[#E2A9BE] transition-colors">{product.name}</h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="font-black text-[#333333] text-sm">
                        {(product.discountedPrice ?? product.price).toLocaleString()}₮
                      </span>
                      {/* Mobile Add to Cart */}
                      <button onClick={() => product.id && addToCart(product)} className="md:hidden w-9 h-9 bg-[#87A96B] text-white rounded-xl flex items-center justify-center active:scale-90 transition-all">
                        <ShoppingBag size={14} />
                      </button>
                    </div>
                    <Link href={`/products/${product.id}`} className="inline-block mt-2 text-[10px] text-[#999] hover:text-[#E2A9BE] font-bold uppercase tracking-wider">Дэлгэрэнгүй</Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 border-2 border-[#333333] text-[#333333] px-10 py-4 rounded-2xl font-black text-sm hover:bg-[#333333] hover:text-white transition-all active:scale-95"
            >
              Бүх бүтээгдэхүүн <ArrowRight size={15} />
            </Link>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @keyframes slowZoom {
          from { transform: scale(1.05); }
          to   { transform: scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}