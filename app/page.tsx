"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { ShoppingBag, ArrowRight, Heart, Sparkles, Truck } from "lucide-react";
import Link from "next/link";
import { Product, Category } from "@/types";
import { motion, useScroll, useTransform, Variants } from "framer-motion";

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const { addToCart } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        setCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[]);

        const prodSnap = await getDocs(collection(db, "products"));
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
    <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="w-12 h-12 border-[3px] border-gray-100 border-t-[#111] rounded-full animate-spin" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#111] uppercase">Уншиж байна</span>
      </motion.div>
    </div>
  );

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-montserrat text-[#111] overflow-hidden selection:bg-[#111] selection:text-white">

      <section className="relative min-h-[60svh] lg:min-h-[90svh] w-full bg-[#FCFBF9] overflow-hidden flex flex-col lg:flex-row items-center pt-20 lg:pt-0">
        {/* Subtle Geometric Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] z-0 flex items-center justify-center">
          <motion.svg
            animate={{ rotate: 360 }}
            transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg" className="scale-[2] lg:scale-150"
          >
            <circle cx="300" cy="300" r="150" stroke="#1A1A1A" strokeWidth="1" />
            <line x1="300" y1="0" x2="300" y2="600" stroke="#1A1A1A" strokeWidth="1" />
            <line x1="0" y1="300" x2="600" y2="300" stroke="#1A1A1A" strokeWidth="1" />
            <path d="M150 150 L450 450" stroke="#1A1A1A" strokeWidth="1" />
            <path d="M450 150 L150 450" stroke="#1A1A1A" strokeWidth="1" />
          </motion.svg>
        </div>

        {/* Left Side: Bold Editorial Typography */}
        <div className="w-full lg:w-[45%] h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 z-20 relative text-center lg:text-left">
          <motion.div
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.2, delayChildren: 0.5 }
              }
            }}
            className="flex flex-col items-center lg:items-start"
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
              className="inline-block text-[10px] md:text-[12px] font-light tracking-[0.6em] uppercase text-[#1A1A1A]/50 mb-8 lg:mb-10 font-montserrat"
            >
              Grow Room Collection — {new Date().getFullYear()}
            </motion.span>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="font-playfair text-[clamp(2.8rem,10vw,5.5rem)] leading-[1.1] lg:leading-[0.9] tracking-[-0.03em] font-medium text-[#1A1A1A] mb-10 lg:mb-12"
            >
              Flowers crafted <br className="hidden lg:block" />
              for <br className="hidden lg:block" />
              <span className="italic font-normal text-[#1A1A1A]/80">unforgettable</span> <br className="hidden lg:block" />
              moments
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              className="text-[#1A1A1A]/80 text-[11px] font-bold uppercase tracking-[0.3em] mb-4 font-montserrat"
            >
              “Цэцэг өгөх нь авахаасаа илүү жаргалтай”
            </motion.p>



            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
              <Link
                href="/products"
                className="group relative inline-flex items-center gap-6 text-[#1A1A1A] py-4 lg:py-5 font-montserrat"
              >
                <span className="text-[10px] lg:text-[11px] font-medium uppercase tracking-[0.5em] border-b border-[#1A1A1A]/20 pb-2 group-hover:border-[#87A96B] transition-colors duration-500">
                  Цуглуулга үзэх
                </span>
                <div className="w-10 h-10 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center group-hover:bg-[#87A96B] group-hover:border-[#87A96B] group-hover:text-white transition-all duration-500">
                  <ArrowRight size={14} strokeWidth={1.5} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Side: Design Collage Card & Floating Pills */}
        {/* Right Side: Hidden on Mobile, Visible on LG */}
        <div className="hidden lg:flex w-full lg:w-[55%] h-full relative px-12 lg:px-0 items-center py-0">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[900px] bg-white p-4 md:p-6 rounded-[2px] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-black/[0.03] z-10"
          >
            <div className="aspect-[1.3/1] md:aspect-[1.6/1] rounded-[2px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1687022466417-6fa5c452f63f?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                className="w-full h-full object-cover"
                alt="White Tulips"
              />
            </div>
          </motion.div>

          {/* Floating Premium Pills */}
          {/* Top Right: Craftsmanship */}


          {/* Bottom Center (Offset): Delivery Status */}
          {/* Floating Premium Pill - Only visible on LG to avoid clutter on mobile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2, duration: 1 }}
            className="absolute bottom-[-5%] left-[10%] z-20 hidden lg:block"
          >
            <div className="bg-white px-8 py-6 rounded-[2px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] border border-black/[0.03] flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FCFBF9] rounded-[2px] flex items-center justify-center text-[#1A1A1A] shrink-0 border border-black/[0.03]">
                <Truck size={20} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[9px] font-medium uppercase tracking-[0.3em] text-[#1A1A1A]/30 leading-none mb-2 font-montserrat">Хүргэлтийн төлөв</p>
                <p className="text-[11px] font-medium text-[#1A1A1A] font-montserrat uppercase tracking-widest">Улаанбаатар хот даяар</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-5 md:px-12">

        {/* 3. CATEGORIES — Clean Grid */}
        <section className="pt-24 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-[9px] font-light tracking-[0.5em] text-[#999] uppercase mb-3 font-montserrat">Нээж үзэх</p>
              <h2 className="text-4xl md:text-6xl font-playfair font-medium text-[#111] tracking-tight leading-none">Ангилал</h2>
            </div>
            <Link href="/products" className="group text-xs font-bold text-[#111] flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              Бүгд <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar -mx-5 px-5 pb-5 md:mx-0 md:px-0"
          >
            {categories.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 50, damping: 15, delay: index * 0.1 }}
                className="shrink-0"
              >
                <Link
                  href={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative block w-[200px] h-[280px] md:w-[280px] md:h-[380px] rounded-[2px] overflow-hidden bg-gray-100"
                >
                  <motion.img
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
                    src={cat.imageUrl || "https://images.unsplash.com/photo-1533616688419-b7a585564566?q=80&w=600"}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80" />
                  <div className="absolute bottom-0 inset-x-0 p-6 z-10">
                    <span className="text-white font-playfair italic font-normal text-xl md:text-2xl tracking-tight block group-hover:translate-y-[-4px] transition-transform duration-500">{cat.name}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </section>



        {/* 5. NEW ARRIVALS — Minimal Cards */}
        <section className="pb-32 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <p className="text-[9px] font-light tracking-[0.5em] text-[#999] uppercase mb-3 font-montserrat">Шинэ</p>
              <h2 className="text-4xl md:text-6xl font-playfair font-medium text-[#111] tracking-tight leading-none">Шинэ цуглуулга</h2>
            </div>
            <Link href="/products" className="group text-xs font-bold text-[#111] flex items-center gap-1.5 hover:opacity-70 transition-opacity">
              Бүгд <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4"
          >
            {products.map((product, i) => {
              const isWished = product.id ? isWishlisted(product.id) : false;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 50, damping: 15, delay: i * 0.1 }}
                  className="group flex flex-col"
                >
                  <div className="relative aspect-[3/4] bg-white rounded-[2px] overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] border border-black/[0.03] mb-4">
                    <Link href={`/products/${product.id}`} className="block w-full h-full bg-gray-50">
                      <motion.img
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        src={product.imageUrls?.[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Glassmorphism Wishlist Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <button
                        onClick={() => product.id && toggleWishlist(product.id)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-300 active:scale-90 ${isWished
                          ? "bg-white border-white text-[#E2A9BE] shadow-lg shadow-[#E2A9BE]/20"
                          : "bg-white/60 border-white/40 text-[#111] hover:bg-white"
                          }`}
                      >
                        <motion.div
                          animate={isWished ? { scale: [1, 1.3, 1] } : { scale: 1 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Heart size={16} fill={isWished ? "currentColor" : "none"} strokeWidth={isWished ? 0 : 2} className={isWished ? "scale-110" : ""} />
                        </motion.div>
                      </button>
                    </div>

                    {/* Desktop Hover Add to Cart - Minimal Style */}
                    <div className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hidden md:block z-20">
                      <button onClick={() => product.id && addToCart(product)} className="w-full bg-[#87A96B] text-white text-[10px] uppercase tracking-[0.2em] font-medium py-4 rounded-[2px] flex items-center justify-center gap-2 hover:bg-[#76945d] transition-colors duration-300 shadow-2xl">
                        <ShoppingBag size={14} strokeWidth={1.5} />
                        Сагсанд нэмэх
                      </button>
                    </div>
                  </div>

                  <div className="px-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <h3 className="text-[12px] md:text-[14px] font-medium text-[#1A1A1A] line-clamp-1 leading-snug group-hover:opacity-60 transition-opacity font-montserrat uppercase tracking-wider">{product.name}</h3>
                      </Link>

                      {/* Mobile Add to Cart */}
                      <button onClick={() => product.id && addToCart(product)} className="md:hidden w-8 h-8 shrink-0 bg-[#87A96B] text-white rounded-[2px] flex items-center justify-center active:scale-90 transition-transform shadow-lg">
                        <ShoppingBag size={12} strokeWidth={1.5} />
                      </button>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <span className="font-medium text-[#111] tracking-tight">
                        {(product.discountedPrice ?? product.price).toLocaleString()}₮
                      </span>
                    </div>

                    <Link href={`/products/${product.id}`} className="inline-block mt-3 text-[10px] text-[#999] hover:text-[#111] font-bold uppercase tracking-[0.1em] transition-colors">Дэлгэрэнгүй</Link>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 text-center"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-4 bg-[#87A96B] text-white px-12 py-6 rounded-[2px] font-medium text-[11px] uppercase tracking-[0.3em] hover:bg-[#76945d] transition-all active:scale-95 shadow-2xl"
            >
              Бүх бүтээгдэхүүн <ArrowRight size={16} />
            </Link>
          </motion.div>
        </section>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite 1s; }
      `}</style>
    </div>
  );
}